/**
 * Shared types across frontend and backend
 */

/**
 * Credential Issuance Request
 */
export interface IssueCredentialRequest {
  studentName: string;
  degree: string;
  degreeType?: string;
  university: string;
  graduationDate: string;
  studentId?: string;
  pdfFile?: File | Buffer;
}

/**
 * Credential Issuance Response
 */
export interface IssueCredentialResponse {
  success: boolean;
  credentialId: string;
  vcCID: string;
  pdfCID?: string;
  attestationUID: string;
  attestationTxHash: string;
  vc: any; // VerifiableCredential
}

/**
 * Verification Request
 */
export interface VerifyCredentialRequest {
  cid?: string;
  attestationUID?: string;
}

/**
 * Verification Response
 */
export interface VerifyCredentialResponse {
  isValid: boolean;
  vc?: any;
  attestation?: {
    uid: string;
    attester: string;
    timestamp: number;
    revoked: boolean;
  };
  error?: string;
}

/**
 * Revocation Request
 */
export interface RevokeCredentialRequest {
  attestationUID: string;
  reason?: string;
}

/**
 * Revocation Response
 */
export interface RevokeCredentialResponse {
  success: boolean;
  txHash: string;
  timestamp: number;
}

/**
 * Credential Record (for DB)
 */
export interface CredentialRecord {
  id: string;
  studentName: string;
  degree: string;
  university: string;
  graduationDate: string;
  vcCID: string;
  pdfCID?: string;
  attestationUID: string;
  attestationTxHash: string;
  issuedAt: Date;
  revokedAt?: Date;
  revocationReason?: string;
}
