export interface ShareResponse {
  shareId: number;
  linkToken: string;
  shareUrl: string;
  itemType: string; // 'file' | 'folder'
  itemName: string;
  itemId: number;
  expiresAt: string;
  createdAt: string;
}