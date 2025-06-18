import { http, createConfig } from 'wagmi'
import { foundry } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [foundry],
  connectors:[
    injected(),
    metaMask(),
  ],
  transports: {
    [foundry.id]: http('http://localhost:8545'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}