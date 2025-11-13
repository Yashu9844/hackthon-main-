/**
 * Shared utility functions
 */

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0] || '';
}

/**
 * Shorten address or hash
 */
export function shortenHash(hash: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Validate IPFS CID format
 */
export function isValidCID(cid: string): boolean {
  if (!cid) return false;
  // Basic CIDv0 or CIDv1 check
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}|^bafy[a-z0-9]{50,}/.test(cid);
}

/**
 * Get IPFS URL from CID
 */
export function getIPFSUrl(cid: string, gateway = 'https://w3s.link/ipfs'): string {
  return `${gateway}/${cid}`;
}

/**
 * Parse error message
 */
export function parseError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
