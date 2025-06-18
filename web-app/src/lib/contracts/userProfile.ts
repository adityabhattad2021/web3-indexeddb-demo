/**
 * Smart Contract Configuration and ABI
 * 
 * This file contains the ABI and configuration for the SimpleUserProfile contract.
 * It provides type-safe contract interactions using wagmi.
 */

export const USER_PROFILE_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_username", "type": "string"},
      {"internalType": "string", "name": "_bio", "type": "string"}
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_content", "type": "string"}
    ],
    "name": "createPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "getProfile",
    "outputs": [
      {"internalType": "string", "name": "username", "type": "string"},
      {"internalType": "string", "name": "bio", "type": "string"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "bool", "name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPostIds",
    "outputs": [
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_postId", "type": "uint256"}
    ],
    "name": "getPost",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "author", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "content", "type": "string"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "bool", "name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "getUserPosts",
    "outputs": [
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "hasProfile",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "username", "type": "string"}
    ],
    "name": "ProfileCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "author", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "title", "type": "string"}
    ],
    "name": "PostCreated",
    "type": "event"
  }
] as const;

export const USER_PROFILE_ADDRESS = '0xfcd944ad43a75c622f2c344271f3cf7f20ca6314' as const;

// Type definitions for contract data
export interface ContractProfile {
  username: string;
  bio: string;
  createdAt: bigint;
  exists: boolean;
}

export interface ContractPost {
  id: bigint;
  author: string;
  title: string;
  content: string;
  createdAt: bigint;
  exists: boolean;
}