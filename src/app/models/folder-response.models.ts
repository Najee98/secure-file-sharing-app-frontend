export interface FolderResponse {
  id: number;
  name: string;
  parentFolderId?: number | null;
  createdAt: string;
  updatedAt: string;
}