export interface DashboardStats {
  totalDocuments: number;
  verifiedCredentials: number;
  activeShares: number;
  totalViews: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'academic' | 'government' | 'professional' | 'other';
  status: 'verified' | 'pending' | 'unverified';
  uploadedAt: Date;
  ipfsCid?: string;
  issuer?: string;
}

export interface Activity {
  id: string;
  type: 'upload' | 'share' | 'view' | 'verify' | 'revoke' | 'expire';
  description: string;
  timestamp: Date;
  documentName?: string;
}

export interface SharedCredential {
  id: string;
  documentId: string;
  documentName: string;
  sharedWith: string;
  expiresAt: Date;
  link: string;
}

export interface DashboardData {
  user: {
    did: string;
    name?: string;
    walletAddress: string;
  };
  stats: DashboardStats;
  recentDocuments: Document[];
  recentActivity: Activity[];
  activeShares: SharedCredential[];
}