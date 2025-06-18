'use client';

import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from '@wagmi/core';
import { USER_PROFILE_ABI, USER_PROFILE_ADDRESS } from '@/lib/contracts/userProfile';
import { web3DB } from '@/lib/indexeddb/manager';
import { ProfileData, PostData } from '@/lib/indexeddb/config';
import { config } from '@/lib/wagmi/config';

export function useUserProfile() {
	const { address } = useAccount();
	const { writeContract, data: hash, error: writeError } = useWriteContract();
	const [isCreatingProfile, setIsCreatingProfile] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Check if user has a profile
	const { data: hasProfile, refetch: refetchHasProfile } = useReadContract({
		address: USER_PROFILE_ADDRESS,
		abi: USER_PROFILE_ABI,
		functionName: 'hasProfile',
		args: address ? [address] : undefined,
		query: { enabled: !!address }
	});

	// Wait for transaction confirmation
	const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
		hash,
	});

	// Get user profile with caching
	const getUserProfile = useCallback(async (userAddress: string): Promise<ProfileData | null> => {
		try {
			// First, check cache
			const cached = await web3DB.getCachedProfile(userAddress);
			if (cached && (Date.now() - cached.lastUpdated) < 5 * 60 * 1000) { // 5 minute cache
				console.log('📄 Using cached profile for', userAddress);
				return cached;
			}

			// If not cached or expired, fetch from blockchain
			console.log('🔗 Fetching profile from blockchain for', userAddress);

			try {
				const result = await readContract(config, {
					address: USER_PROFILE_ADDRESS,
					abi: USER_PROFILE_ABI,
					functionName: 'getProfile',
					args: [userAddress as `0x${string}`]
				});

				// Check if profile exists
				if (!result[3]) { // exists field
					return {
						address: userAddress,
						username: '',
						bio: '',
						createdAt: 0,
						exists: false,
						lastUpdated: Date.now(),
					};
				}

				const profileData: ProfileData = {
					address: userAddress,
					username: result[0], // username
					bio: result[1], // bio
					createdAt: Number(result[2]) * 1000, // createdAt (convert from seconds to milliseconds)
					exists: result[3], // exists
					lastUpdated: Date.now(),
				};

				// Cache the result
				await web3DB.cacheProfile(profileData);
				return profileData;

			} catch (contractError) {
				console.error('Contract call failed:', contractError);
				// Return non-existent profile data
				return {
					address: userAddress,
					username: '',
					bio: '',
					createdAt: 0,
					exists: false,
					lastUpdated: Date.now(),
				};
			}

		} catch (err) {
			console.error('Failed to get user profile:', err);
			return null;
		}
	}, []);

	const createProfile = useCallback(async (username: string, bio: string) => {
		if (!address) {
			setError('Wallet not connected');
			return false;
		}

		setIsCreatingProfile(true);
		setError(null);

		try {
			// Write to contract
			writeContract({
				address: USER_PROFILE_ADDRESS,
				abi: USER_PROFILE_ABI,
				functionName: 'createProfile',
				args: [username, bio],
			});

			// Wait for transaction to be mined (this will be handled by the useWaitForTransactionReceipt hook)

			const newProfile: ProfileData = {
				address,
				username,
				bio,
				createdAt: Date.now(),
				exists: true,
				lastUpdated: Date.now(),
			};

			await web3DB.cacheProfile(newProfile);

			// Refetch the hasProfile status
			setTimeout(() => {
				refetchHasProfile();
			}, 2000); // Wait 2 seconds for transaction to be mined

			return true;
		} catch (err) {
			console.error('Create profile error:', err);
			setError(err instanceof Error ? err.message : 'Failed to create profile');
			return false;
		} finally {
			setIsCreatingProfile(false);
		}
	}, [address, writeContract, refetchHasProfile]);

	return {
		hasProfile: !!hasProfile,
		getUserProfile,
		createProfile,
		isCreatingProfile: isCreatingProfile || isConfirming,
		error: error || (writeError?.message),
		isConfirmed,
	};
}

export function usePosts() {
	const { address } = useAccount();
	const { writeContract, data: hash, error: writeError } = useWriteContract();
	const [isCreatingPost, setIsCreatingPost] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fetchTime, setFetchTime] = useState<number>(0);
	const [lastFetchMethod, setLastFetchMethod] = useState<'cache' | 'blockchain' | null>(null);

	// Wait for transaction confirmation
	const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
		hash,
	});

	// Fetch posts directly from blockchain (bypassing cache)
	const getPostsFromBlockchain = useCallback(async (): Promise<PostData[]> => {
		const startTime = Date.now();
		setLastFetchMethod('blockchain');

		try {
			console.log('🔗 Fetching posts directly from blockchain (bypassing cache)');

			// First, get all post IDs
			const postIds = await readContract(config, {
				address: USER_PROFILE_ADDRESS,
				abi: USER_PROFILE_ABI,
				functionName: 'getAllPostIds',
			}) as bigint[];

			if (!postIds || postIds.length === 0) {
				console.log('No posts found on blockchain');
				setFetchTime(Date.now() - startTime);
				return [];
			}

			// Fetch each post's details
			const posts: PostData[] = [];
			for (const postId of postIds) {
				try {
					const postResult = await readContract(config, {
						address: USER_PROFILE_ADDRESS,
						abi: USER_PROFILE_ABI,
						functionName: 'getPost',
						args: [postId]
					});

					if (postResult[5]) { // exists field
						const postData: PostData = {
							id: Number(postResult[0]), // id
							author: postResult[1] as string, // author
							title: postResult[2], // title
							content: postResult[3], // content
							createdAt: Number(postResult[4]) * 1000, // createdAt (convert to milliseconds)
							exists: postResult[5], // exists
							lastUpdated: Date.now(),
						};
						posts.push(postData);
					}
				} catch (postError) {
					console.error(`Failed to fetch post ${postId}:`, postError);
				}
			}

			// Sort posts by creation date (newest first)
			posts.sort((a, b) => b.createdAt - a.createdAt);

			const endTime = Date.now();
			setFetchTime(endTime - startTime);
			console.log(`⏱️ Blockchain fetch took ${endTime - startTime}ms`);

			return posts;

		} catch (contractError) {
			console.error('Failed to fetch posts from contract:', contractError);
			setFetchTime(Date.now() - startTime);
			return [];
		}
	}, []);

	// Get posts from cache only
	const getPostsFromCache = useCallback(async (): Promise<PostData[]> => {
		const startTime = Date.now();
		setLastFetchMethod('cache');

		try {
			console.log('📄 Fetching posts from cache only');
			const cachedPosts = await web3DB.getAllCachedPosts();

			const endTime = Date.now();
			setFetchTime(endTime - startTime);
			console.log(`⏱️ Cache fetch took ${endTime - startTime}ms`);

			return cachedPosts;
		} catch (err) {
			console.error('Failed to get cached posts:', err);
			setFetchTime(Date.now() - startTime);
			return [];
		}
	}, []);

	// Get all posts with smart caching 
	const getAllPosts = useCallback(async (forceFromBlockchain: boolean = false): Promise<PostData[]> => {
		const startTime = Date.now();

		try {
			if (!forceFromBlockchain) {
				// Check if we have recent cached posts
				const cacheKey = 'all_posts';
				const isDataFresh = await web3DB.isDataFresh(cacheKey, 10); // 10 minute cache

				if (isDataFresh) {
					setLastFetchMethod('cache');
					console.log('📄 Using cached posts list');
					const cachedPosts = await web3DB.getAllCachedPosts();
					setFetchTime(Date.now() - startTime);
					return cachedPosts;
				}
			}

			setLastFetchMethod('blockchain');
			console.log('🔗 Fetching posts from blockchain');

			try {
				// First, get all post IDs
				const postIds = await readContract(config, {
					address: USER_PROFILE_ADDRESS,
					abi: USER_PROFILE_ABI,
					functionName: 'getAllPostIds',
				}) as bigint[];

				if (!postIds || postIds.length === 0) {
					console.log('No posts found on blockchain');
					await web3DB.setCacheEntry('all_posts', true, 'posts_list', 10);
					setFetchTime(Date.now() - startTime);
					return [];
				}

				// Fetch each post's details
				const posts: PostData[] = [];
				for (const postId of postIds) {
					try {
						const postResult = await readContract(config, {
							address: USER_PROFILE_ADDRESS,
							abi: USER_PROFILE_ABI,
							functionName: 'getPost',
							args: [postId]
						});

						if (postResult[5]) { // exists field
							const postData: PostData = {
								id: Number(postResult[0]), // id
								author: postResult[1] as string, // author
								title: postResult[2], // title
								content: postResult[3], // content
								createdAt: Number(postResult[4]) * 1000, // createdAt (convert to milliseconds)
								exists: postResult[5], // exists
								lastUpdated: Date.now(),
							};
							posts.push(postData);
						}
					} catch (postError) {
						console.error(`Failed to fetch post ${postId}:`, postError);
					}
				}

				// Sort posts by creation date (newest first)
				posts.sort((a, b) => b.createdAt - a.createdAt);

				// Cache the posts
				await web3DB.cachePosts(posts);
				await web3DB.setCacheEntry('all_posts', true, 'posts_list', 10);

				setFetchTime(Date.now() - startTime);
				return posts;

			} catch (contractError) {
				console.error('Failed to fetch posts from contract:', contractError);
				// Return cached posts if available
				setLastFetchMethod('cache');
				const cachedPosts = await web3DB.getAllCachedPosts();
				setFetchTime(Date.now() - startTime);
				return cachedPosts;
			}

		} catch (err) {
			console.error('Failed to get posts:', err);
			setFetchTime(Date.now() - startTime);
			return [];
		}
	}, []);

	const createPost = useCallback(async (title: string, content: string) => {
		if (!address) {
			setError('Wallet not connected');
			return false;
		}

		setIsCreatingPost(true);
		setError(null);

		try {
			// Write to contract
			writeContract({
				address: USER_PROFILE_ADDRESS,
				abi: USER_PROFILE_ABI,
				functionName: 'createPost',
				args: [title, content],
			});

			// Optimistically add to cache (we'll refresh from blockchain later)
			const newPost: PostData = {
				id: Date.now(), // Temporary ID until we get the real one from blockchain
				author: address,
				title,
				content,
				createdAt: Date.now(),
				exists: true,
				lastUpdated: Date.now(),
			};

			await web3DB.cachePost(newPost);

			// Invalidate the posts cache so it will be refreshed from blockchain
			await web3DB.setCacheEntry('all_posts', false, 'posts_list', 0);

			return true;
		} catch (err) {
			console.error('Create post error:', err);
			setError(err instanceof Error ? err.message : 'Failed to create post');
			return false;
		} finally {
			setIsCreatingPost(false);
		}
	}, [address, writeContract]);

	return {
		getAllPosts,
		getPostsFromBlockchain,
		getPostsFromCache,
		createPost,
		isCreatingPost: isCreatingPost || isConfirming,
		error: error || (writeError?.message),
		isConfirmed,
		fetchTime,
		lastFetchMethod,
	};
}