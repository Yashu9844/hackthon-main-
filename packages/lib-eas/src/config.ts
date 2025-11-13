/**
 * EAS Configuration for different networks
 */

export const EAS_CONTRACTS = {
  baseSepolia: {
    eas: '0x4200000000000000000000000000000000000021',
    schemaRegistry: '0x4200000000000000000000000000000000000020',
  },
  sepolia: {
    eas: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
    schemaRegistry: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0',
  },
  baseMainnet: {
    eas: '0x4200000000000000000000000000000000000021',
    schemaRegistry: '0x4200000000000000000000000000000000000020',
  },
} as const;

export const CHAIN_IDS = {
  baseSepolia: 84532,
  sepolia: 11155111,
  baseMainnet: 8453,
} as const;

export const RPC_URLS = {
  baseSepolia: 'https://sepolia.base.org',
  sepolia: 'https://rpc.sepolia.org',
  baseMainnet: 'https://mainnet.base.org',
} as const;

export type NetworkName = keyof typeof EAS_CONTRACTS;

/**
 * Degree Credential Schema Definition
 * Schema: string studentName, string degree, string university, string issueDate, string ipfsCID
 */
export const DEGREE_SCHEMA = {
  schema: 'string studentName,string degree,string university,string issueDate,string ipfsCID',
  resolverAddress: '0x0000000000000000000000000000000000000000', // No resolver
  revocable: true,
} as const;

/**
 * Get default network configuration
 */
export function getDefaultNetwork(): NetworkName {
  return 'baseSepolia';
}

/**
 * Get contract addresses for a network
 */
export function getContractAddresses(network: NetworkName = 'baseSepolia') {
  return EAS_CONTRACTS[network];
}

/**
 * Get RPC URL for a network
 */
export function getRPCUrl(network: NetworkName = 'baseSepolia'): string {
  return RPC_URLS[network];
}

/**
 * Get Chain ID for a network
 */
export function getChainId(network: NetworkName = 'baseSepolia'): number {
  return CHAIN_IDS[network];
}
