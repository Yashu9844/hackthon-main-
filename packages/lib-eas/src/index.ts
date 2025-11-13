export { EASClient, createEASClient } from './client';
export {
  EAS_CONTRACTS,
  CHAIN_IDS,
  RPC_URLS,
  DEGREE_SCHEMA,
  getDefaultNetwork,
  getContractAddresses,
  getRPCUrl,
  getChainId,
  type NetworkName,
} from './config';
export type {
  DegreeCredentialData,
  AttestationResult,
  VerificationResult,
  RevocationResult,
  EASClientConfig,
  SchemaRegistrationResult,
} from './types';
