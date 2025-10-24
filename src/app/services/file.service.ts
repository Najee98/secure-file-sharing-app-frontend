import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FileUploadResponse } from '../models/file-upload-response.model';
import { FileModel } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  /**
   * Upload a file
   */
  uploadFile(file: File, folderId?: number): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Get all user files
   */
  getMyFiles(): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${this.apiUrl}/my-files`);
  }

  /**
   * Get files in root directory
   */
  getRootFiles(): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${this.apiUrl}/root`);
  }

  /**
   * Get files in a specific folder
   */
  getFolderFiles(folderId: number): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${this.apiUrl}/folder/${folderId}`);
  }

  /**
   * Download a file
   */
  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${fileId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Delete a file
   */
  deleteFile(fileId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${fileId}`, {
      responseType: 'text'
    });
  }

  /**
   * Helper method to trigger file download in browser
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}