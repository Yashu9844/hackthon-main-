/**
 * Shared constants across the application
 */

export const APP_NAME = 'DegreeVerify';
export const APP_DESCRIPTION = 'Decentralized University Degree Verification Portal';

/**
 * Network Configuration
 */
export const DEFAULT_NETWORK = 'baseSepolia' as const;

/**
 * IPFS Gateways
 */
export const IPFS_GATEWAYS = [
  'https://w3s.link/ipfs',
  'https://ipfs.io/ipfs',
  'https://gateway.pinata.cloud/ipfs',
] as const;

/**
 * Supported Degree Types
 */
export const DEGREE_TYPES = [
  'Bachelor of Science',
  'Bachelor of Arts',
  'Master of Science',
  'Master of Arts',
  'Doctor of Philosophy',
  'Associate Degree',
  'Certificate',
] as const;

/**
 * API Endpoints (relative)
 */
export const API_ENDPOINTS = {
  ISSUE_CREDENTIAL: '/api/credentials/issue',
  VERIFY_CREDENTIAL: '/api/credentials/verify',
  REVOKE_CREDENTIAL: '/api/credentials/revoke',
  LIST_CREDENTIALS: '/api/credentials/list',
} as const;
