/**
 * IPFS Upload Response
 */
export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
}

/**
 * IPFS Fetch Response
 */
export interface IPFSFetchResult<T = any> {
  data: T;
  cid: string;
}

/**
 * IPFS Client Configuration
 */
export interface IPFSClientConfig {
  token?: string;
  endpoint?: string;
}

/**
 * Upload Options
 */
export interface UploadOptions {
  name?: string;
  wrapWithDirectory?: boolean;
}
