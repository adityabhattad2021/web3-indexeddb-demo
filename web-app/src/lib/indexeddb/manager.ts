/**
 * Web3 IndexedDB Manager
 * 
 * This is the main interface for interacting with IndexedDB in any Web3 application.
 * It provides high-level methods for caching blockchain data, managing user preferences,
 * and optimizing data access patterns.
 * 
 * Usage Example:
 * ```typescript
 * const dbManager = Web3DBManager.getInstance();
 * await dbManager.initialize();
 * 
 * // Cache a profile
 * await dbManager.cacheProfile(profileData);
 * 
 * // Get cached profile
 * const profile = await dbManager.getCachedProfile(address);
 * ```
 */

import { IndexedDBManager } from './database';
import { WEB3_DB_CONFIG, ProfileData, PostData, UserPreferences, CacheEntry } from './config';

export class Web3DBManager {
	private static instance: Web3DBManager;
	private db: IndexedDBManager;
	private initialized = false;

	private constructor() {
		this.db = new IndexedDBManager(WEB3_DB_CONFIG);
	}

	/**
	 * Get the singleton instance of Web3DBManager
	 */
	static getInstance(): Web3DBManager {
		if (!Web3DBManager.instance) {
			Web3DBManager.instance = new Web3DBManager();
		}
		return Web3DBManager.instance;
	}

	/**
	 * Initialize the database connection
	 * Must be called before using any other methods
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;

		try {
			await this.db.initialize();
			this.initialized = true;
			console.log('🚀 Web3DBManager initialized successfully');

			// Clean up expired cache entries on startup
			await this.cleanupExpiredCache();
		} catch (error) {
			console.error('❌ Failed to initialize Web3DBManager:', error);
			throw error;
		}
	}

	// PROFILE MANAGEMENT

	/**
	 * Cache a user profile from blockchain data
	 */
	async cacheProfile(profile: Omit<ProfileData, 'lastUpdated'>): Promise<void> {
		const profileWithTimestamp: ProfileData = {
			...profile,
			lastUpdated: Date.now(),
		};

		await this.db.put('profiles', profileWithTimestamp);
		console.log(`📝 Cached profile for ${profile.address}`);
	}

	/**
	 * Get a cached profile
	 */
	async getCachedProfile(address: string): Promise<ProfileData | undefined> {
		return await this.db.get<ProfileData>('profiles', address);
	}

	/**
	 * Get all cached profiles
	 */
	async getAllCachedProfiles(): Promise<ProfileData[]> {
		return await this.db.getAll<ProfileData>('profiles');
	}

	// POST MANAGEMENT

	/**
	 * Cache a post from blockchain data
	 */
	async cachePost(post: Omit<PostData, 'lastUpdated'>): Promise<void> {
		const postWithTimestamp: PostData = {
			...post,
			lastUpdated: Date.now(),
		};

		await this.db.put('posts', postWithTimestamp);
		console.log(`📄 Cached post ${post.id} by ${post.author}`);
	}

	/**
	 * Cache multiple posts at once
	 */
	async cachePosts(posts: Omit<PostData, 'lastUpdated'>[]): Promise<void> {
		const promises = posts.map(post => this.cachePost(post));
		await Promise.all(promises);
		console.log(`📚 Cached ${posts.length} posts`);
	}

	/**
	 * Get a cached post by ID
	 */
	async getCachedPost(id: number): Promise<PostData | undefined> {
		return await this.db.get<PostData>('posts', id);
	}

	/**
	 * Get all cached posts
	 */
	async getAllCachedPosts(): Promise<PostData[]> {
		const posts = await this.db.getAll<PostData>('posts');
		return posts.sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
	}

	/**
	 * Get cached posts by author
	 */
	async getCachedPostsByAuthor(author: string): Promise<PostData[]> {
		const posts = await this.db.getByIndex<PostData>('posts', 'author', author);
		return posts.sort((a, b) => b.createdAt - a.createdAt);
	}

	// USER PREFERENCES

	/**
	 * Save user preferences (client-side only)
	 */
	async saveUserPreferences(preferences: UserPreferences): Promise<void> {
		await this.db.put('userPreferences', preferences);
		console.log(`⚙️ Saved preferences for ${preferences.address}`);
	}

	/**
	 * Get user preferences
	 */
	async getUserPreferences(address: string): Promise<UserPreferences | undefined> {
		return await this.db.get<UserPreferences>('userPreferences', address);
	}

	/**
	 * Get user preferences with defaults
	 */
	async getUserPreferencesWithDefaults(address: string): Promise<UserPreferences> {
		const preferences = await this.getUserPreferences(address);

		if (preferences) {
			return preferences;
		}

		// Return default preferences
		const defaults: UserPreferences = {
			address,
			theme: 'system',
			notifications: true,
			autoRefresh: true,
			cacheTimeout: 15, // 15 minutes
			customSettings: {},
		};

		// Save defaults for future use
		await this.saveUserPreferences(defaults);
		return defaults;
	}

	// GENERIC CACHE MANAGEMENT

	/**
	 * Set a generic cache entry with expiration
	 */
	async setCacheEntry(
		key: string,
		data: any,
		type: CacheEntry['type'],
		ttlMinutes: number = 15
	): Promise<void> {
		const entry: CacheEntry = {
			key,
			data,
			type,
			createdAt: Date.now(),
			expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
		};

		await this.db.put('cache', entry);
	}

	/**
	 * Get a cached entry if it hasn't expired
	 */
	async getCacheEntry<T = any>(key: string): Promise<T | undefined> {
		const entry = await this.db.get<CacheEntry>('cache', key);

		if (!entry) return undefined;

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			await this.db.delete('cache', key);
			return undefined;
		}

		return entry.data as T;
	}

	/**
	 * Clean up expired cache entries
	 */
	private async cleanupExpiredCache(): Promise<void> {
		try {
			const allEntries = await this.db.getAll<CacheEntry>('cache');
			const now = Date.now();
			const expiredKeys = allEntries
				.filter(entry => now > entry.expiresAt)
				.map(entry => entry.key);

			for (const key of expiredKeys) {
				await this.db.delete('cache', key);
			}

			if (expiredKeys.length > 0) {
				console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
			}
		} catch (error) {
			console.error('Failed to cleanup expired cache:', error);
		}
	}

	// UTILITY METHODS

	/**
	 * Check if we have recent cached data for a specific key
	 */
	async isDataFresh(key: string, maxAgeMinutes: number = 15): Promise<boolean> {
		const entry = await this.db.get<CacheEntry>('cache', key);
		if (!entry) return false;

		const maxAge = maxAgeMinutes * 60 * 1000;
		return (Date.now() - entry.createdAt) < maxAge;
	}

	/**
	 * Clear all cached data (useful for debugging)
	 */
	async clearAllCache(): Promise<void> {
		await Promise.all([
			this.db.clear('profiles'),
			this.db.clear('posts'),
			this.db.clear('cache'),
		]);
		console.log('🗑️ Cleared all cached data');
	}

	/**
	 * Get database statistics
	 */
	async getStats(): Promise<{
		profiles: number;
		posts: number;
		cacheEntries: number;
		userPreferences: number;
	}> {
		const [profiles, posts, cache, preferences] = await Promise.all([
			this.db.getAll('profiles'),
			this.db.getAll('posts'),
			this.db.getAll('cache'),
			this.db.getAll('userPreferences'),
		]);

		return {
			profiles: profiles.length,
			posts: posts.length,
			cacheEntries: cache.length,
			userPreferences: preferences.length,
		};
	}
}

// Export a singleton instance for easy use
export const web3DB = Web3DBManager.getInstance();