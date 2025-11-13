/**
 * IPFS Upload using Pinata
 */

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadFileToPinata(file: File): Promise<IPFSUploadResult> {
  const pinataJWT = process.env.PINATA_JWT;
  
  if (!pinataJWT) {
    throw new Error('PINATA_JWT environment variable is required');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${pinataJWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} - ${error}`);
  }

  const result = await response.json();
  
  return {
    cid: result.IpfsHash,
    url: `${PINATA_GATEWAY}/${result.IpfsHash}`,
    size: file.size,
  };
}

/**
 * Upload JSON object to IPFS via Pinata
 */
export async function uploadJSONToPinata(json: object): Promise<IPFSUploadResult> {
  const pinataJWT = process.env.PINATA_JWT;
  
  if (!pinataJWT) {
    throw new Error('PINATA_JWT environment variable is required');
  }

  const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${pinataJWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent: json,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata JSON upload failed: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const jsonString = JSON.stringify(json);

  return {
    cid: result.IpfsHash,
    url: `${PINATA_GATEWAY}/${result.IpfsHash}`,
    size: new TextEncoder().encode(jsonString).length,
  };
}
