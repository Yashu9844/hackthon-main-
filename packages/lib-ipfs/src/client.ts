import * as Client from '@web3-storage/w3up-client';
import { CID } from 'multiformats/cid';
import type {
  IPFSUploadResult,
  IPFSFetchResult,
  IPFSClientConfig,
  UploadOptions,
} from './types';

/**
 * IPFS Client for Web3.Storage
 */
export class IPFSClient {
  private client: Awaited<ReturnType<typeof Client.create>> | null = null;
  private config: IPFSClientConfig;

  constructor(config: IPFSClientConfig = {}) {
    this.config = config;
  }

  /**
   * Initialize the Web3.Storage client
   */
  async init(): Promise<void> {
    if (this.client) return;
    
    this.client = await Client.create();
    
    // If token/email provided, can login programmatically
    // For now, assumes client is already authenticated
  }

  /**
   * Upload a file or JSON data to IPFS
   */
  async upload(
    data: File | Blob | Buffer | object,
    options: UploadOptions = {}
  ): Promise<IPFSUploadResult> {
    await this.init();
    if (!this.client) throw new Error('IPFS client not initialized');

    let fileToUpload: File;

    // Convert different data types to File
    if (data instanceof File) {
      fileToUpload = data;
    } else if (data instanceof Blob) {
      fileToUpload = new File([data], options.name || 'file', {
        type: data.type,
      });
    } else if (Buffer.isBuffer(data)) {
      fileToUpload = new File([new Uint8Array(data)], options.name || 'file');
    } else {
      // JSON object
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      fileToUpload = new File([jsonBlob], options.name || 'data.json', {
        type: 'application/json',
      });
    }

    const cid = await this.client.uploadFile(fileToUpload);
    const cidString = cid.toString();

    return {
      cid: cidString,
      url: `https://w3s.link/ipfs/${cidString}`,
      size: fileToUpload.size,
    };
  }

  /**
   * Fetch data from IPFS by CID
   */
  async fetch<T = any>(cid: string): Promise<IPFSFetchResult<T>> {
    const url = `https://w3s.link/ipfs/${cid}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    let data: T;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as T;
    }

    return {
      data,
      cid,
    };
  }

  /**
   * Upload multiple files at once
   */
  async uploadMultiple(
    files: (File | Blob)[],
    options: UploadOptions = {}
  ): Promise<IPFSUploadResult[]> {
    const results: IPFSUploadResult[] = [];

    for (const file of files) {
      const result = await this.upload(file, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate CID format
   */
  static isValidCID(cid: string): boolean {
    try {
      CID.parse(cid);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a new IPFS client instance
 */
export function createIPFSClient(config?: IPFSClientConfig): IPFSClient {
  return new IPFSClient(config);
}
