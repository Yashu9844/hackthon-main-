import type { NetworkName } from './config';

/**
 * Degree Credential Data
 */
export interface DegreeCredentialData {
  studentName: string;
  degree: string;
  university: string;
  issueDate: string;
  ipfsCID: string;
}

/**
 * Attestation Result
 */
export interface AttestationResult {
  uid: string;
  txHash: string;
  timestamp: number;
  attester: string;
}

/**
 * Attestation Verification Result
 */
export interface VerificationResult {
  isValid: boolean;
  attestation?: {
    uid: string;
    schema: string;
    attester: string;
    recipient: string;
    time: number;
    expirationTime: number;
    revocationTime: number;
    refUID: string;
    data: DegreeCredentialData;
  };
  error?: string;
}

/**
 * Revocation Result
 */
export interface RevocationResult {
  uid: string;
  txHash: string;
  timestamp: number;
  revoked: boolean;
}

/**
 * EAS Client Configuration
 */
export interface EASClientConfig {
  network?: NetworkName;
  privateKey?: string;
  rpcUrl?: string;
  schemaUID?: string; // Pre-registered schema UID
}

/**
 * Schema Registration Result
 */
export interface SchemaRegistrationResult {
  uid: string;
  txHash: string;
  schema: string;
}
