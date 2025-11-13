import * as ed25519 from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import type { DIDKeyPair } from './types';

// Set hash function for ed25519
ed25519.etc.sha512Sync = (...m) => sha256(ed25519.etc.concatBytes(...m));

/**
 * Generate a new DID:key keypair using Ed25519
 */
export async function generateDIDKey(): Promise<DIDKeyPair> {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);

  // Create did:key identifier
  // Format: did:key:z{multibase-encoded-multicodec-public-key}
  const did = `did:key:z${base58Encode(publicKey)}`;

  return {
    did,
    publicKey,
    privateKey,
  };
}

/**
 * Derive public key and DID from private key
 */
export async function fromPrivateKey(privateKey: Uint8Array): Promise<DIDKeyPair> {
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);
  const did = `did:key:z${base58Encode(publicKey)}`;

  return {
    did,
    publicKey,
    privateKey,
  };
}

/**
 * Export key pair to hex strings for storage
 */
export function exportKeyPair(keyPair: DIDKeyPair): {
  did: string;
  publicKeyHex: string;
  privateKeyHex: string;
} {
  return {
    did: keyPair.did,
    publicKeyHex: Buffer.from(keyPair.publicKey).toString('hex'),
    privateKeyHex: Buffer.from(keyPair.privateKey).toString('hex'),
  };
}

/**
 * Import key pair from hex strings
 */
export async function importKeyPair(
  privateKeyHex: string
): Promise<DIDKeyPair> {
  const privateKey = new Uint8Array(Buffer.from(privateKeyHex, 'hex'));
  return fromPrivateKey(privateKey);
}

/**
 * Simple base58 encoding (Bitcoin alphabet)
 */
function base58Encode(data: Uint8Array): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  let num = BigInt('0x' + Buffer.from(data).toString('hex'));
  let encoded = '';
  
  while (num > 0) {
    const remainder = num % 58n;
    num = num / 58n;
    encoded = ALPHABET[Number(remainder)] + encoded;
  }
  
  // Handle leading zeros
  for (let i = 0; i < data.length && data[i] === 0; i++) {
    encoded = ALPHABET[0] + encoded;
  }
  
  return encoded;
}

/**
 * Extract public key from DID
 */
export function publicKeyFromDID(did: string): Uint8Array {
  if (!did.startsWith('did:key:z')) {
    throw new Error('Invalid DID format');
  }
  
  const encoded = did.slice(9); // Remove 'did:key:z'
  return base58Decode(encoded);
}

/**
 * Simple base58 decoding
 */
function base58Decode(str: string): Uint8Array {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  let num = 0n;
  for (const char of str) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) throw new Error('Invalid base58 character');
    num = num * 58n + BigInt(idx);
  }
  
  const hex = num.toString(16).padStart(64, '0');
  return new Uint8Array(Buffer.from(hex, 'hex'));
}
