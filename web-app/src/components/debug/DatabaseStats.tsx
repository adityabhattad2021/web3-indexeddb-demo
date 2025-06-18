'use client';
/**
 * Database Statistics Component
 * 
 * This component provides insights into the IndexedDB cache performance
 * and storage usage. Useful for demonstrating the caching system's effectiveness.
 */


import { useEffect, useState } from 'react';
import { web3DB } from '@/lib/indexeddb/manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, Trash2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseStats {
	profiles: number;
	posts: number;
	cacheEntries: number;
	userPreferences: number;
}

export function DatabaseStats() {
	const [stats, setStats] = useState<DatabaseStats | null>(null);
	const [loading, setLoading] = useState(true);

	const loadStats = async () => {
		setLoading(true);
		try {
			const dbStats = await web3DB.getStats();
			setStats(dbStats);
		} catch (error) {
			console.error('Failed to load database stats:', error);
		} finally {
			setLoading(false);
		}
	};

	const clearCache = async () => {
		try {
			await web3DB.clearAllCache();
			await loadStats();
			toast.success('Cache cleared successfully! 🗑️');
		} catch (error) {
			toast.error('Failed to clear cache');
			console.error('Failed to clear cache:', error);
		}
	};

	useEffect(() => {
		loadStats();
	}, []);

	if (loading) {
		return (
			<Card>
				<CardContent className="p-8">
					<div className="animate-pulse space-y-4">
						<div className="h-4 bg-muted rounded w-1/2"></div>
						<div className="h-8 bg-muted rounded"></div>
						<div className="h-4 bg-muted rounded w-1/3"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5" />
					IndexedDB Statistics
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					Monitor your local cache performance and storage usage
				</p>
			</CardHeader>

			<CardContent className="space-y-6">
				{stats && (
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Profiles</span>
								<Badge variant="secondary">{stats.profiles}</Badge>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Posts</span>
								<Badge variant="secondary">{stats.posts}</Badge>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Cache Entries</span>
								<Badge variant="secondary">{stats.cacheEntries}</Badge>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">User Prefs</span>
								<Badge variant="secondary">{stats.userPreferences}</Badge>
							</div>
						</div>
					</div>
				)}

				<div className="flex gap-2">
					<Button
						onClick={loadStats}
						variant="outline"
						size="sm"
						disabled={loading}
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>

					<Button
						onClick={clearCache}
						variant="outline"
						size="sm"
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Clear Cache
					</Button>
				</div>

				<div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
					<div className="flex items-center gap-2">
						<Database className="h-3 w-3" />
						<span>Data is automatically cached when fetched from blockchain</span>
					</div>
					<div className="flex items-center gap-2">
						<RefreshCw className="h-3 w-3" />
						<span>Cache entries expire based on user preferences</span>
					</div>
					<div className="flex items-center gap-2">
						<Trash2 className="h-3 w-3" />
						<span>Clearing cache will force fresh blockchain fetches</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}