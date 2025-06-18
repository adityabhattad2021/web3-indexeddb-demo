'use client';
/**
 * Posts List Component
 * 
 * This component displays a list of posts with cached data support.
 * It demonstrates efficient data loading and real-time updates from IndexedDB.
 * Now includes options to fetch from cache vs blockchain for performance comparison.
 */


import { useEffect, useState } from 'react';
import { usePosts } from '@/hooks/useContract';
import { useCachedPosts } from '@/hooks/useIndexedDB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RefreshCw, Database, MessageSquare, Calendar, Zap, Clock, Globe } from 'lucide-react';
import { PostData } from '@/lib/indexeddb/config';
import { formatDistanceToNow } from 'date-fns';

export function PostsList() {
	const {
		getAllPosts,
		getPostsFromBlockchain,
		getPostsFromCache,
		fetchTime,
		lastFetchMethod
	} = usePosts();
	const { posts: cachedPosts, loading: cacheLoading } = useCachedPosts();
	const [posts, setPosts] = useState<PostData[]>([]);
	const [loading, setLoading] = useState(false);
	const [lastFetch, setLastFetch] = useState<Date | null>(null);

	const loadPosts = async (method: 'smart' | 'blockchain' | 'cache' = 'smart') => {
		setLoading(true);
		try {
			let allPosts: PostData[] = [];

			switch (method) {
				case 'blockchain':
					allPosts = await getPostsFromBlockchain();
					console.log(allPosts);
					break;
				case 'cache':
					allPosts = await getPostsFromCache();
					break;
				case 'smart':
				default:
					allPosts = await getAllPosts();
					break;
			}

			setPosts(allPosts);
			setLastFetch(new Date());
		} catch (error) {
			console.error('Failed to load posts:', error);
		} finally {
			setLoading(false);
		}
	};

	// Load posts on component mount
	useEffect(() => {
		loadPosts('smart');
	}, []);

	// Update posts when cached data changes
	useEffect(() => {
		if (cachedPosts.length > 0 && posts.length === 0) {
			setPosts(cachedPosts);
		}
	}, [cachedPosts, posts.length]);

	if (cacheLoading && posts.length === 0) {
		return (
			<Card>
				<CardContent className="p-8">
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="flex space-x-4">
									<div className="rounded-full bg-muted h-10 w-10"></div>
									<div className="space-y-2 flex-1">
										<div className="h-4 bg-muted rounded w-1/4"></div>
										<div className="h-3 bg-muted rounded w-3/4"></div>
										<div className="h-3 bg-muted rounded w-1/2"></div>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<MessageSquare className="h-5 w-5" />
							Latest Posts
						</CardTitle>

						<div className="flex items-center gap-2">
							{lastFetch && (
								<Badge variant="outline" className="flex items-center gap-1">
									<Database className="h-3 w-3" />
									Last sync: {formatDistanceToNow(lastFetch, { addSuffix: true })}
								</Badge>
							)}

							<Button
								onClick={() => loadPosts('smart')}
								disabled={loading}
								variant="outline"
								size="sm"
							>
								<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Performance Comparison Controls */}
					<div className="p-4 bg-muted/50 rounded-lg space-y-4">
						<h4 className="font-semibold text-sm flex items-center gap-2">
							<Zap className="h-4 w-4" />
							Performance Comparison Demo
						</h4>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<Button
								onClick={() => loadPosts('cache')}
								disabled={loading}
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
							>
								<Database className="h-4 w-4" />
								From Cache Only
							</Button>

							<Button
								onClick={() => loadPosts('blockchain')}
								disabled={loading}
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
							>
								<Globe className="h-4 w-4" />
								From Blockchain Only
							</Button>

							<Button
								onClick={() => loadPosts('smart')}
								disabled={loading}
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
							>
								<Zap className="h-4 w-4" />
								Smart Caching
							</Button>
						</div>

						{/* Performance Metrics */}
						{fetchTime > 0 && lastFetchMethod && (
							<div className="flex items-center justify-between p-3 bg-background rounded border">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4" />
									<span className="text-sm">
										Last fetch: <strong>{fetchTime}ms</strong>
									</span>
								</div>
								<Badge
									variant={lastFetchMethod === 'cache' ? 'default' : 'secondary'}
									className="flex items-center gap-1"
								>
									{lastFetchMethod === 'cache' ? (
										<>
											<Database className="h-3 w-3" />
											Cache
										</>
									) : (
										<>
											<Globe className="h-3 w-3" />
											Blockchain
										</>
									)}
								</Badge>
							</div>
						)}

						<div className="text-xs text-muted-foreground space-y-1">
							<p>• <strong>Cache Only:</strong> Instant response from local IndexedDB</p>
							<p>• <strong>Blockchain Only:</strong> Direct fetch from smart contract (slower)</p>
							<p>• <strong>Smart Caching:</strong> Uses cache when fresh, blockchain when expired</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{posts.length === 0 ? (
				<Card>
					<CardContent className="text-center p-8">
						<MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">
							No posts yet. Be the first to share something!
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			)}
		</div>
	);
}

interface PostCardProps {
	post: PostData;
}

function PostCard({ post }: PostCardProps) {
	const isFromCache = (Date.now() - post.lastUpdated) < 10 * 60 * 1000; // 10 minutes

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<Avatar>
							<AvatarFallback>
								{post.author.slice(2, 4).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="font-semibold">{post.title}</h3>
							<p className="text-sm text-muted-foreground font-mono">
								{post.author.slice(0, 6)}...{post.author.slice(-4)}
							</p>
						</div>
					</div>

					{isFromCache && (
						<Badge variant="secondary" className="flex items-center gap-1">
							<Database className="h-3 w-3" />
							Cached
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<p className="text-sm leading-relaxed">{post.content}</p>

				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>
							{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
						</span>
					</div>

					<Badge variant="outline">
						Post #{post.id}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}