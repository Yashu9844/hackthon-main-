export {
  generateDIDKey,
  fromPrivateKey,
  exportKeyPair,
  importKeyPair,
  publicKeyFromDID,
} from './did';

export {
  createDegreeCredential,
  signCredential,
  verifyCredential,
} from './builder';

export type {
  VerifiableCredential,
  Issuer,
  CredentialSubject,
  Proof,
  DegreeCredentialSubject,
  DIDKeyPair,
  VCBuilderOptions,
  SignatureOptions,
} from './types';
