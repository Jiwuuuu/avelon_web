import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia, type AppKitNetwork } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export const walletConnectMetadata = {
    name: 'Avelon',
    description: 'Decentralized Lending Platform',
    url: 'https://avelon.app',
    icons: ['/favicon.ico'],
};

// Only Sepolia chain configured — prevents mainnet connections.
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia];

export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
    ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
