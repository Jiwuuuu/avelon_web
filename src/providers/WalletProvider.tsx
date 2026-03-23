'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiAdapter, projectId, walletConnectMetadata, networks } from '@/config/wagmi';
import { createAppKit } from '@reown/appkit/react';
import { sepolia } from '@reown/appkit/networks';
import { WagmiProvider, useDisconnect, type State } from 'wagmi';
import { type ReactNode, useEffect } from 'react';

// Initialize AppKit (Web3Modal)
createAppKit({
    projectId,
    adapters: [wagmiAdapter],
    networks,
    defaultNetwork: sepolia,
    metadata: walletConnectMetadata,
});

const queryClient = new QueryClient();

/** Listens for the custom avelon:logout event and disconnects the wallet */
function WalletLogoutListener() {
    const { disconnect } = useDisconnect();

    useEffect(() => {
        const handler = () => disconnect();
        window.addEventListener('avelon:logout', handler);
        return () => window.removeEventListener('avelon:logout', handler);
    }, [disconnect]);

    return null;
}

export function WalletProvider({
    children,
    initialState,
}: {
    children: ReactNode;
    initialState?: State;
}) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <WalletLogoutListener />
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
