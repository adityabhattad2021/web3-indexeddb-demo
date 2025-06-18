import { http, createConfig } from 'wagmi'
import { foundry, polygonAmoy } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors';

export const config = createConfig({
	chains: [foundry, polygonAmoy],
	connectors: [
		injected(),
		metaMask(),
	],
	transports: {
		[polygonAmoy.id]: http('https://rpc-amoy.polygon.technology/'),
		[foundry.id]: http('http://localhost:8545'),
	},
})

declare module 'wagmi' {
	interface Register {
		config: typeof config;
	}
}