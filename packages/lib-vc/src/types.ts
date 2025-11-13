/**
 * W3C Verifiable Credential Types
 */

export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  id: string;
  issuer: string | Issuer;
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  proof?: Proof;
}

export interface Issuer {
  id: string;
  name?: string;
}

export interface CredentialSubject {
  id?: string;
  [key: string]: any;
}

export interface Proof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  proofValue: string;
}

/**
 * Degree Credential Specific Types
 */
export interface DegreeCredentialSubject extends CredentialSubject {
  studentName: string;
  degree: string;
  degreeType?: string;
  university: string;
  graduationDate: string;
  studentId?: string;
}

/**
 * DID Key Pair
 */
export interface DIDKeyPair {
  did: string;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

/**
 * VC Builder Options
 */
export interface VCBuilderOptions {
  issuerDID: string;
  issuerName?: string;
  credentialId?: string;
  expirationDate?: string;
}

/**
 * Signature Options
 */
export interface SignatureOptions {
  privateKey: Uint8Array;
  issuerDID: string;
  verificationMethod?: string;
}
