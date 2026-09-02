import { baseSepolia, hardhat } from '@reown/appkit/networks';

/**
 * Single source for the deployment target. Moving chains means editing this file
 * and the deployed contract addresses — nothing else should name a chain.
 *
 * NEXT_PUBLIC_CHAIN_ID=31337 selects the local Hardhat node, which is what the
 * capstone demo runs on. Anything else, including an unset value, stays on Base
 * Sepolia so a missing variable can never silently point a real wallet at a
 * network the contracts were not deployed to.
 */
const isLocal = process.env.NEXT_PUBLIC_CHAIN_ID === '31337';

export const appChain = isLocal ? hardhat : baseSepolia;
export const CHAIN_NAME = isLocal ? 'Hardhat (local)' : 'Base Sepolia';
export const EXPLORER_BASE = isLocal ? '' : 'https://sepolia.basescan.org';
export const EXPLORER_NAME = isLocal ? '' : 'BaseScan';

/** Local chains have no block explorer, so callers must not render a link. */
export const HAS_EXPLORER = !isLocal;
