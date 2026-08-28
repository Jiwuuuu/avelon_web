import { baseSepolia } from '@reown/appkit/networks';

/**
 * Single source for the deployment target. Moving chains means editing this file
 * and the deployed contract addresses — nothing else should name a chain.
 */
export const appChain = baseSepolia;
export const CHAIN_NAME = 'Base Sepolia';
export const EXPLORER_BASE = 'https://sepolia.basescan.org';
export const EXPLORER_NAME = 'BaseScan';
