'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiAdapter, projectId, walletConnectMetadata, networks } from '@/config/wagmi';
import { createAppKit } from '@reown/appkit/react';
import { sepolia } from '@reown/appkit/networks';
import { WagmiProvider, type State } from 'wagmi';
import type { ReactNode } from 'react';

// Initialize AppKit (Web3Modal)
createAppKit({
    projectId,
    adapters: [wagmiAdapter],
    networks,
    defaultNetwork: sepolia,
    metadata: walletConnectMetadata,
});

const queryClient = new QueryClient();

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
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
