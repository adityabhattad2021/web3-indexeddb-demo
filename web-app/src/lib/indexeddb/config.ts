/**
 * IndexedDB Configuration
 * 
 * This file defines the database schema for our Web3 application.
 * It includes stores for caching blockchain data, user preferences,
 * and application state.
 */

import { DatabaseConfig } from './database';

export const WEB3_DB_CONFIG: DatabaseConfig = {
  name: 'Web3Demo',
  version: 1,
  stores: [
    {
      name: 'profiles',
      keyPath: 'address',
      indexes: [
        { name: 'username', keyPath: 'username', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false },
      ],
    },
    {
      name: 'posts',
      keyPath: 'id',
      indexes: [
        { name: 'author', keyPath: 'author', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false },
        { name: 'title', keyPath: 'title', unique: false },
      ],
    },
    {
      name: 'userPreferences',
      keyPath: 'address',
    },
    {
      name: 'cache',
      keyPath: 'key',
      indexes: [
        { name: 'expiresAt', keyPath: 'expiresAt', unique: false },
        { name: 'type', keyPath: 'type', unique: false },
      ],
    },
  ],
};

// Type definitions for our data structures
export interface ProfileData {
  address: string;
  username: string;
  bio: string;
  createdAt: number;
  exists: boolean;
  lastUpdated: number; // Client-side tracking
}

export interface PostData {
  id: number;
  author: string;
  title: string;
  content: string;
  createdAt: number;
  exists: boolean;
  authorProfile?: ProfileData; // Cached profile data
  lastUpdated: number; // Client-side tracking
}

export interface UserPreferences {
  address: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoRefresh: boolean;
  cacheTimeout: number; // in minutes
  displayName?: string;
  customSettings: Record<string, any>;
}

export interface CacheEntry {
  key: string;
  data: any;
  type: 'profile' | 'post' | 'posts_list' | 'user_posts';
  createdAt: number;
  expiresAt: number;
}