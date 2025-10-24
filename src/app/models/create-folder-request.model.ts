export interface CreateFolderRequest {
  name: string;
  parentFolderId?: number | null;
}