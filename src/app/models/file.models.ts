export interface FileModel {
  id: number;
  displayName: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: number;
    name: string;
  } | null;
}