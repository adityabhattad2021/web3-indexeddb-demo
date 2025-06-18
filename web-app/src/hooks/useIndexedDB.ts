'use client';
/**
 * IndexedDB React Hook
 * 
 * This hook provides React integration for our IndexedDB manager.
 * It handles initialization, loading states, and provides easy access
 * to database operations within React components.
 */


import { useEffect, useState } from 'react';
import { web3DB } from '@/lib/indexeddb/manager';
import { ProfileData, PostData, UserPreferences } from '@/lib/indexeddb/config';

export function useIndexedDB() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const initializeDB = async () => {
			try {
				setIsLoading(true);
				await web3DB.initialize();
				setIsInitialized(true);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to initialize database');
				console.error('IndexedDB initialization error:', err);
			} finally {
				setIsLoading(false);
			}
		};

		initializeDB();
	}, []);

	return {
		isInitialized,
		isLoading,
		error,
		db: web3DB,
	};
}

/**
 * Hook for managing cached profiles (not used, but provided for completeness)
 */
export function useCachedProfiles() {
	const { db, isInitialized } = useIndexedDB();
	const [profiles, setProfiles] = useState<ProfileData[]>([]);
	const [loading, setLoading] = useState(false);

	const loadProfiles = async () => {
		if (!isInitialized) return;

		setLoading(true);
		try {
			const cachedProfiles = await db.getAllCachedProfiles();
			setProfiles(cachedProfiles);
		} catch (error) {
			console.error('Failed to load cached profiles:', error);
		} finally {
			setLoading(false);
		}
	};

	const addProfile = async (profile: Omit<ProfileData, 'lastUpdated'>) => {
		if (!isInitialized) return;

		try {
			await db.cacheProfile(profile);
			await loadProfiles(); // Refresh the list
		} catch (error) {
			console.error('Failed to cache profile:', error);
		}
	};

	useEffect(() => {
		loadProfiles();
	}, [isInitialized]);

	return {
		profiles,
		loading,
		loadProfiles,
		addProfile,
	};
}

/**
 * Hook for managing cached posts
 */
export function useCachedPosts() {
	const { db, isInitialized } = useIndexedDB();
	const [posts, setPosts] = useState<PostData[]>([]);
	const [loading, setLoading] = useState(false);

	const loadPosts = async () => {
		if (!isInitialized) return;

		setLoading(true);
		try {
			const cachedPosts = await db.getAllCachedPosts();
			setPosts(cachedPosts);
		} catch (error) {
			console.error('Failed to load cached posts:', error);
		} finally {
			setLoading(false);
		}
	};

	const addPost = async (post: Omit<PostData, 'lastUpdated'>) => {
		if (!isInitialized) return;

		try {
			await db.cachePost(post);
			await loadPosts(); // Refresh the list
		} catch (error) {
			console.error('Failed to cache post:', error);
		}
	};

	useEffect(() => {
		loadPosts();
	}, [isInitialized]);

	return {
		posts,
		loading,
		loadPosts,
		addPost,
	};
}

/**
 * Hook for managing user preferences
 */
export function useUserPreferences(address?: string) {
	const { db, isInitialized } = useIndexedDB();
	const [preferences, setPreferences] = useState<UserPreferences | null>(null);
	const [loading, setLoading] = useState(false);

	const loadPreferences = async () => {
		if (!isInitialized || !address) return;

		setLoading(true);
		try {
			const userPrefs = await db.getUserPreferencesWithDefaults(address);
			setPreferences(userPrefs);
		} catch (error) {
			console.error('Failed to load user preferences:', error);
		} finally {
			setLoading(false);
		}
	};

	const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
		if (!isInitialized || !address || !preferences) return;

		const updated = { ...preferences, ...newPreferences };
		try {
			await db.saveUserPreferences(updated);
			setPreferences(updated);
		} catch (error) {
			console.error('Failed to update user preferences:', error);
		}
	};

	useEffect(() => {
		loadPreferences();
	}, [isInitialized, address]);

	return {
		preferences,
		loading,
		updatePreferences,
		loadPreferences,
	};
}