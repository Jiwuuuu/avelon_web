import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { type AppKitNetwork } from '@reown/appkit/networks';
import { appChain } from './chain';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export const walletConnectMetadata = {
    name: 'Avelon',
    description: 'Decentralized Lending Platform',
    url: 'https://avelon.app',
    icons: ['/favicon.ico'],
};

// Only Base Sepolia configured — prevents mainnet connections.
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [appChain];

export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
    ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
