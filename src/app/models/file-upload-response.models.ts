export interface FileUploadResponse {
  fileId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  message: string;
}