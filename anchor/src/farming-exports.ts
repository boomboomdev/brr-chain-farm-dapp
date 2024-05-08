// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Farming } from '../target/types/farming';
import { IDL as FarmingIDL } from '../target/types/farming';

// Re-export the generated IDL and type
export { Farming, FarmingIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const FARMING_PROGRAM_ID = new PublicKey(
  'f9UbdcKhVdNLnD9K2g7ozUYUbjxHkupFJ3HBXkEcwMU'
);

// This is a helper function to get the program ID for the Farming program depending on the cluster.
export function getFarmingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return FARMING_PROGRAM_ID;
  }
}
