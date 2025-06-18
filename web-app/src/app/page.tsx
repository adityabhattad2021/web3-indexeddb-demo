'use client';
/**
 * Main Application Page
 * 
 * This is the main demo page that showcases all the IndexedDB and Web3 integration features.
 * It provides a comprehensive interface for testing and demonstrating the functionality.
 */


import { useAccount } from 'wagmi';
import { useUserProfile } from '@/hooks/useContract';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { ProfileCreation } from '@/components/profile/ProfileCreation';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { PostCreation } from '@/components/posts/PostCreation';
import { PostsList } from '@/components/posts/PostsList';
import { UserPreferences } from '@/components/preferences/UserPreferences';
import { DatabaseStats } from '@/components/debug/DatabaseStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Wallet, User, MessageSquare, Settings, BarChart3, Loader2 } from 'lucide-react';

export default function Home() {
	const { isConnected } = useAccount();
	const { hasProfile } = useUserProfile();
	const { isInitialized, isLoading: dbLoading, error: dbError } = useIndexedDB();

	// Show database initialization status
	if (dbLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardContent className="flex items-center justify-center p-8">
						<div className="text-center space-y-4">
							<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
							<h3 className="font-semibold">Initializing IndexedDB</h3>
							<p className="text-sm text-muted-foreground">
								Setting up local database for caching...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (dbError) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardContent className="text-center p-8">
						<Database className="h-12 w-12 mx-auto text-red-500 mb-4" />
						<h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">
							Database Error
						</h3>
						<p className="text-sm text-muted-foreground">
							{dbError}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
						Web3 + IndexedDB Demo
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						This demo shows how to build efficient Web3 applications that don&apos;t constantly hit the blockchain.
					</p>

					<div className="flex items-center justify-center gap-2 mt-4">
						<Badge variant={isInitialized ? "default" : "secondary"} className="flex items-center gap-1">
							<Database className="h-3 w-3" />
							IndexedDB {isInitialized ? 'Ready' : 'Loading'}
						</Badge>
						<Badge variant={isConnected ? "default" : "outline"} className="flex items-center gap-1">
							<Wallet className="h-3 w-3" />
							Wallet {isConnected ? 'Connected' : 'Disconnected'}
						</Badge>
					</div>
				</div>
				<div className='max-w-2xl mx-auto mb-8'>
					<WalletConnect />
				</div>
				{/* Main Content */}
				{!isConnected ? (
					<div className="max-w-2xl mx-auto space-y-8">

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Database className="h-5 w-5" />
									About This Demo
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<h4 className="font-semibold flex items-center gap-2">
											<MessageSquare className="h-4 w-4" />
											Smart Contract Features
										</h4>
										<ul className="text-sm text-muted-foreground space-y-1">
											<li>• User profile creation</li>
											<li>• Post creation and storage</li>
											<li>• Decentralized data ownership</li>
										</ul>
									</div>
									<div className="space-y-2">
										<h4 className="font-semibold flex items-center gap-2">
											<Database className="h-4 w-4" />
											IndexedDB Benefits
										</h4>
										<ul className="text-sm text-muted-foreground space-y-1">
											<li>• Intelligent data caching</li>
											<li>• Offline-first approach</li>
											<li>• Reduced blockchain calls</li>
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				) : (
					<div className="max-w-6xl mx-auto">
						<Tabs defaultValue="profile" className="space-y-6">
							<TabsList className="grid w-full grid-cols-5">
								<TabsTrigger value="profile" className="flex items-center gap-2">
									<User className="h-4 w-4" />
									Profile
								</TabsTrigger>
								<TabsTrigger value="posts" className="flex items-center gap-2">
									<MessageSquare className="h-4 w-4" />
									Posts
								</TabsTrigger>
								<TabsTrigger value="preferences" className="flex items-center gap-2">
									<Settings className="h-4 w-4" />
									Preferences
								</TabsTrigger>
								<TabsTrigger value="stats" className="flex items-center gap-2">
									<BarChart3 className="h-4 w-4" />
									Statistics
								</TabsTrigger>
								<TabsTrigger value="docs" className="flex items-center gap-2">
									<Database className="h-4 w-4" />
									Documentation
								</TabsTrigger>
							</TabsList>

							<TabsContent value="profile" className="space-y-6">
								<div className="grid lg:grid-cols-2 gap-6">
									<div className="space-y-6">
										{!hasProfile ? <ProfileCreation /> : <ProfileDisplay />}
									</div>
									<div className="space-y-6">
										<Card>
											<CardHeader>
												<CardTitle>Profile Features</CardTitle>
											</CardHeader>
											<CardContent className="space-y-3 text-sm">
												<div className="flex items-start gap-2">
													<Database className="h-4 w-4 mt-0.5 text-blue-500" />
													<div>
														<strong>Smart Caching:</strong> Profile data is automatically cached locally after blockchain retrieval
													</div>
												</div>
												<div className="flex items-start gap-2">
													<Wallet className="h-4 w-4 mt-0.5 text-green-500" />
													<div>
														<strong>Blockchain Storage:</strong> Profile information is permanently stored on the blockchain
													</div>
												</div>
												<div className="flex items-start gap-2">
													<User className="h-4 w-4 mt-0.5 text-purple-500" />
													<div>
														<strong>Instant Access:</strong> Cached profiles load instantly without blockchain calls
													</div>
												</div>
											</CardContent>
										</Card>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="posts" className="space-y-6">
								<div className="grid lg:grid-cols-3 gap-6">
									<div className="lg:col-span-1">
										<PostCreation onPostCreated={() => {
											// This callback can trigger a refresh of the posts list
											console.log('Post created, refreshing list...');
										}} />
									</div>
									<div className="lg:col-span-2">
										<PostsList />
									</div>
								</div>
							</TabsContent>

							<TabsContent value="preferences" className="space-y-6">
								<div className="max-w-2xl mx-auto">
									<UserPreferences />
								</div>
							</TabsContent>

							<TabsContent value="stats" className="space-y-6">
								<div className="max-w-2xl mx-auto">
									<DatabaseStats />
								</div>
							</TabsContent>

							<TabsContent value="docs" className="space-y-6">
								<div className="max-w-4xl mx-auto space-y-6">
									<Card>
										<CardHeader>
											<CardTitle>Implementation Guide</CardTitle>
											<p className="text-sm text-muted-foreground">
												Learn how to implement IndexedDB caching in your Web3 projects
											</p>
										</CardHeader>
										<CardContent className="space-y-6 text-sm">
											<div>
												<h4 className="font-semibold mb-2">🚀 Quick Start</h4>
												<div className="bg-muted p-4 rounded-lg">
													<pre className="text-xs">{`import { web3DB } from '@/lib/indexeddb/manager';

// Initialize the database
await web3DB.initialize();

// Cache blockchain data
await web3DB.cacheProfile(profileData);

// Retrieve cached data
const cachedProfile = await web3DB.getCachedProfile(address);`}</pre>
												</div>
											</div>

											<div>
												<h4 className="font-semibold mb-2">💡 Key Benefits</h4>
												<ul className="space-y-1 text-muted-foreground">
													<li>• <strong>Performance:</strong> Instant data access without blockchain delays</li>
													<li>• <strong>Cost Reduction:</strong> Fewer RPC calls mean lower infrastructure costs</li>
													<li>• <strong>User Experience:</strong> Smooth interactions even with slow networks</li>
													<li>• <strong>Offline Support:</strong> App works with cached data when offline</li>
												</ul>
											</div>

											<div>
												<h4 className="font-semibold mb-2">🏗️ Architecture</h4>
												<div className="space-y-2 text-muted-foreground">
													<p><strong>Database Layer:</strong> IndexedDBManager provides low-level database operations</p>
													<p><strong>Web3 Manager:</strong> Web3DBManager offers high-level caching methods</p>
													<p><strong>React Hooks:</strong> Custom hooks integrate caching with React state</p>
													<p><strong>Smart Contracts:</strong> Wagmi handles blockchain interactions</p>
												</div>
											</div>

											<div>
												<h4 className="font-semibold mb-2">📁 File Structure</h4>
												<div className="bg-muted p-4 rounded-lg text-xs font-mono">
													<div>lib/indexeddb/</div>
													<div>├── database.ts      # Core IndexedDB abstraction</div>
													<div>├── config.ts       # Database schema & types</div>
													<div>└── manager.ts      # Web3-specific operations</div>
													<div className="mt-2">hooks/</div>
													<div>├── useIndexedDB.ts # React integration</div>
													<div>└── useContract.ts  # Contract + caching</div>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				)}
			</div>
		</div>
	);
}