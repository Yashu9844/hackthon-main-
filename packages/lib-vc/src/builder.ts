import * as ed25519 from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import type {
  VerifiableCredential,
  DegreeCredentialSubject,
  VCBuilderOptions,
  SignatureOptions,
} from './types';

// Set hash function
ed25519.etc.sha512Sync = (...m) => sha256(ed25519.etc.concatBytes(...m));

/**
 * Create a degree credential (unsigned)
 */
export function createDegreeCredential(
  subject: DegreeCredentialSubject,
  options: VCBuilderOptions
): VerifiableCredential {
  const credentialId =
    options.credentialId || `urn:uuid:${generateUUID()}`;

  const credential: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1',
    ],
    type: ['VerifiableCredential', 'DegreeCredential'],
    id: credentialId,
    issuer: options.issuerName
      ? {
          id: options.issuerDID,
          name: options.issuerName,
        }
      : options.issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: subject,
  };

  if (options.expirationDate) {
    (credential as any).expirationDate = options.expirationDate;
  }

  return credential;
}

/**
 * Sign a credential with Ed25519 signature
 */
export async function signCredential(
  credential: VerifiableCredential,
  options: SignatureOptions
): Promise<VerifiableCredential> {
  // Create canonical JSON (sorted keys)
  const canonicalJSON = canonicalize(credential);
  
  // Hash and sign
  const message = new TextEncoder().encode(canonicalJSON);
  const hash = sha256(message);
  const signature = await ed25519.signAsync(hash, options.privateKey);

  // Add proof
  const signedCredential: VerifiableCredential = {
    ...credential,
    proof: {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod:
        options.verificationMethod || `${options.issuerDID}#key-1`,
      proofValue: Buffer.from(signature).toString('base64'),
    },
  };

  return signedCredential;
}

/**
 * Verify a signed credential
 */
export async function verifyCredential(
  credential: VerifiableCredential,
  publicKey: Uint8Array
): Promise<boolean> {
  if (!credential.proof) {
    throw new Error('Credential has no proof');
  }

  // Extract and remove proof
  const { proof, ...unsignedCredential } = credential;
  
  // Create canonical JSON
  const canonicalJSON = canonicalize(unsignedCredential);
  
  // Hash the message
  const message = new TextEncoder().encode(canonicalJSON);
  const hash = sha256(message);
  
  // Decode signature
  const signature = Buffer.from(proof.proofValue, 'base64');
  
  // Verify
  try {
    return await ed25519.verifyAsync(signature, hash, publicKey);
  } catch {
    return false;
  }
}

/**
 * Canonicalize JSON (sort keys recursively)
 */
function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalize).join(',') + ']';
  }

  const keys = Object.keys(obj).sort();
  const pairs = keys.map((key) => {
    return JSON.stringify(key) + ':' + canonicalize(obj[key]);
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
