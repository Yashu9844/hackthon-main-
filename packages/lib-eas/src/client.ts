import { EAS, SchemaEncoder, SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import {
  getContractAddresses,
  getRPCUrl,
  getDefaultNetwork,
  DEGREE_SCHEMA,
  type NetworkName,
} from './config';
import type {
  EASClientConfig,
  DegreeCredentialData,
  AttestationResult,
  VerificationResult,
  RevocationResult,
  SchemaRegistrationResult,
} from './types';

/**
 * EAS Client for creating and verifying attestations
 */
export class EASClient {
  private eas: EAS;
  private schemaRegistry: SchemaRegistry;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private network: NetworkName;
  private schemaUID: string | null = null;

  constructor(config: EASClientConfig = {}) {
    this.network = config.network || getDefaultNetwork();
    const rpcUrl = config.rpcUrl || getRPCUrl(this.network);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }

    const addresses = getContractAddresses(this.network);
    this.eas = new EAS(addresses.eas);
    this.schemaRegistry = new SchemaRegistry(addresses.schemaRegistry);

    if (this.signer) {
      this.eas.connect(this.signer);
      this.schemaRegistry.connect(this.signer);
    } else {
      this.eas.connect(this.provider);
      this.schemaRegistry.connect(this.provider);
    }

    this.schemaUID = config.schemaUID || null;
  }

  /**
   * Register the degree credential schema
   * Only needs to be done once per deployment
   */
  async registerSchema(): Promise<SchemaRegistrationResult> {
    if (!this.signer) {
      throw new Error('Signer required to register schema');
    }

    const transaction = await this.schemaRegistry.register({
      schema: DEGREE_SCHEMA.schema,
      resolverAddress: DEGREE_SCHEMA.resolverAddress,
      revocable: DEGREE_SCHEMA.revocable,
    });

    const receipt = await transaction.wait() as any;
    const uid = receipt.logs?.[0]?.topics?.[1] || (transaction as any).tx; // Schema UID from event

    return {
      uid,
      txHash: receipt.hash || receipt.transactionHash || (transaction as any).tx,
      schema: DEGREE_SCHEMA.schema,
    };
  }

  /**
   * Set the schema UID to use for attestations
   */
  setSchemaUID(uid: string): void {
    this.schemaUID = uid;
  }

  /**
   * Create an attestation for a degree credential
   */
  async createAttestation(
    data: DegreeCredentialData,
    recipient: string = '0x0000000000000000000000000000000000000000'
  ): Promise<AttestationResult> {
    if (!this.signer) {
      throw new Error('Signer required to create attestation');
    }

    if (!this.schemaUID) {
      throw new Error('Schema UID not set. Call setSchemaUID() or registerSchema() first');
    }

    // Encode the data according to schema
    const schemaEncoder = new SchemaEncoder(DEGREE_SCHEMA.schema);
    const encodedData = schemaEncoder.encodeData([
      { name: 'studentName', value: data.studentName, type: 'string' },
      { name: 'degree', value: data.degree, type: 'string' },
      { name: 'university', value: data.university, type: 'string' },
      { name: 'issueDate', value: data.issueDate, type: 'string' },
      { name: 'ipfsCID', value: data.ipfsCID, type: 'string' },
    ]);

    const transaction = await this.eas.attest({
      schema: this.schemaUID,
      data: {
        recipient,
        expirationTime: BigInt(0), // No expiration
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await transaction.wait();

    return {
      uid: newAttestationUID,
      txHash: (transaction as any).tx,
      timestamp: Date.now(),
      attester: await this.signer.getAddress(),
    };
  }

  /**
   * Verify an attestation by UID
   */
  async verifyAttestation(uid: string): Promise<VerificationResult> {
    try {
      const attestation = await this.eas.getAttestation(uid);

      if (!attestation) {
        return {
          isValid: false,
          error: 'Attestation not found',
        };
      }

      // Check if revoked
      if (attestation.revocationTime !== BigInt(0)) {
        return {
          isValid: false,
          error: 'Attestation has been revoked',
        };
      }

      // Check if expired
      if (
        attestation.expirationTime !== BigInt(0) &&
        attestation.expirationTime < BigInt(Math.floor(Date.now() / 1000))
      ) {
        return {
          isValid: false,
          error: 'Attestation has expired',
        };
      }

      // Decode the data
      const schemaEncoder = new SchemaEncoder(DEGREE_SCHEMA.schema);
      const decodedData = schemaEncoder.decodeData(attestation.data);

      const credentialData: DegreeCredentialData = {
        studentName: decodedData[0]?.value.value as string,
        degree: decodedData[1]?.value.value as string,
        university: decodedData[2]?.value.value as string,
        issueDate: decodedData[3]?.value.value as string,
        ipfsCID: decodedData[4]?.value.value as string,
      };

      return {
        isValid: true,
        attestation: {
          uid: attestation.uid,
          schema: attestation.schema,
          attester: attestation.attester,
          recipient: attestation.recipient,
          time: Number(attestation.time),
          expirationTime: Number(attestation.expirationTime),
          revocationTime: Number(attestation.revocationTime),
          refUID: attestation.refUID,
          data: credentialData,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Revoke an attestation
   */
  async revokeAttestation(uid: string): Promise<RevocationResult> {
    if (!this.signer) {
      throw new Error('Signer required to revoke attestation');
    }

    if (!this.schemaUID) {
      throw new Error('Schema UID not set');
    }

    const transaction = await this.eas.revoke({
      schema: this.schemaUID,
      data: {
        uid,
      },
    });

    await transaction.wait();

    return {
      uid,
      txHash: (transaction as any).tx,
      timestamp: Date.now(),
      revoked: true,
    };
  }

  /**
   * Get the current network
   */
  getNetwork(): NetworkName {
    return this.network;
  }

  /**
   * Get the schema UID being used
   */
  getSchemaUID(): string | null {
    return this.schemaUID;
  }
}

/**
 * Create a new EAS client instance
 */
export function createEASClient(config?: EASClientConfig): EASClient {
  return new EASClient(config);
}
