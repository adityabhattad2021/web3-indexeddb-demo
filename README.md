# Web3 + IndexedDB Demo

A demonstration of integrating IndexedDB with Web3 applications for efficient blockchain data caching and personalization. This project showcases how to build performant decentralized applications that don't constantly hit the blockchain.

## 🚀 Overview

This demo application demonstrates the power of combining blockchain with client-side caching using IndexedDB. It shows how to build efficient Web3 applications that provide instant user experiences without using a database and while maintaining decentralization.


## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Web3**: Wagmi for blockchain interactions
- **Database**: IndexedDB for client-side caching
- **UI**: Tailwind CSS + shadcn/ui components
- **Smart Contracts**: Solidity (with Foundry)

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Web3 wallet (MetaMask recommended)
- Foundry (for smart contract deployment)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/adityabhattad2021/web3-indexeddb-demo.git
   cd web3-indexeddb-demo
   ```
2.  **Run local blockchain** (optional)
    
    Make sure you have Foundry installed. If not, follow the [Foundry installation guide](https://getfoundry.sh/introduction/getting-started).

    Start a local blockchain node:
    ```bash
    anvil
    ```
3. **Deploy the smart contract**
    Update the Makefile with your RPC URL and private key, then run:
   ```bash
    make deploy-user-profile
   ```

4. **Update contract address**
   ```typescript
   // lib/contracts/userProfile.ts
   export const USER_PROFILE_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
   ```

5. **Start the development server** (in /web-app directory)
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Wagmi Configuration

Update `lib/wagmi/config.ts` with your preferred networks and RPC endpoints:

```typescript
export const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  connectors: [
    injected(),
    metaMask(),
    // Add your WalletConnect project ID
    // walletConnect({ projectId: 'your-project-id' }),
  ],
  transports: {
    [mainnet.id]: http('your-mainnet-rpc'),
    [sepolia.id]: http('your-sepolia-rpc'),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});
```

### IndexedDB Configuration

The database schema is defined in `lib/indexeddb/config.ts`. You can customize:

- Cache timeout durations
- Database stores and indexes
- Data structures

## 🔍 File Structure

```
.                                   
├── README.md                     
├── smart-contracts/               
│   ├── Makefile                   # Build & test automation
│   ├── script/                    # Deployment script
│   └── src/                       # Core smart contract source code
│       └── UserProfile.sol  # Demo smart contract
├── web-app/                       
│   └── src/                   
│       ├── app/                
│       │   ├── globals.css  
│       │   ├── layout.tsx        # Root layout
│       │   ├── page.tsx          # Main demo/home page
│       │   └── providers.tsx     # Context providers (e.g., WagmiProvider)
│       ├── components/          
│       │   ├── debug/
│       │   │   └── DatabaseStats.tsx     # Cache statistics
│       │   ├── posts/
│       │   │   ├── PostCreation.tsx      # Create post form
│       │   │   └── PostsList.tsx         # List of posts
│       │   ├── preferences/
│       │   │   └── UserPreferences.tsx   # Client-side settings
│       │   ├── profile/
│       │   │   ├── ProfileCreation.tsx   # Profile setup UI
│       │   │   └── ProfileDisplay.tsx    # Display user profile
│       │   └── wallet/
│       │       └── WalletConnect.tsx     # Connect wallet button
│       ├── hooks/             
│       │   ├── useContract.ts    # Read/write to smart contracts
│       │   └── useIndexedDB.ts   # IndexedDB wrapper for local storage
│       ├── lib/                  # Utility libraries
│       │   ├── contracts/
│       │   │   └── userProfile.ts        # ABI & contract config
│       │   ├── indexeddb/
│       │   │   ├── config.ts             # Database schema
│       │   │   ├── database.ts           # Core IndexedDB wrapper
│       │   │   └── manager.ts            #  Web3-specific operations
│       │   └── wagmi/
│       │       └── config.ts             # Wagmi connectors & chains

```




## 🔧 Customization

### Adding New Data Types

1. **Update the schema** (`lib/indexeddb/config.ts`):
   ```typescript
   export interface NewDataType {
     id: string;
     data: any;
     lastUpdated: number;
   }
   ```

2. **Add store configuration**:
   ```typescript
   {
     name: 'newDataStore',
     keyPath: 'id',
     indexes: [
       { name: 'lastUpdated', keyPath: 'lastUpdated' }
     ]
   }
   ```

3. **Implement manager methods** (`lib/indexeddb/manager.ts`):
   ```typescript
   async cacheNewData(data: NewDataType): Promise<void> {
     await this.db.put('newDataStore', data);
   }
   ```



## 💭 Considerations

### Browser Compatibility
- IndexedDB is supported in all modern browsers
- Consider fallbacks for older browsers
- Test across different browser implementations