import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateFolderRequest } from '../models/create-folder-request.model';
import { FolderResponse } from '../models/folder-response.model';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private apiUrl = `${environment.apiUrl}/folders`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new folder
   */
  createFolder(name: string, parentFolderId?: number): Observable<FolderResponse> {
    const request: CreateFolderRequest = {
      name,
      parentFolderId: parentFolderId || null
    };
    return this.http.post<FolderResponse>(this.apiUrl, request);
  }

  /**
   * Get all user folders
   */
  getMyFolders(): Observable<FolderResponse[]> {
    return this.http.get<FolderResponse[]>(`${this.apiUrl}/my-folders`);
  }

  /**
   * Get root folders (no parent)
   */
  getRootFolders(): Observable<FolderResponse[]> {
    return this.http.get<FolderResponse[]>(`${this.apiUrl}/root`);
  }

  /**
   * Get subfolders of a specific folder
   */
  getSubfolders(folderId: number): Observable<FolderResponse[]> {
    return this.http.get<FolderResponse[]>(`${this.apiUrl}/${folderId}/subfolders`);
  }

  /**
   * Get folder details
   */
  getFolderDetails(folderId: number): Observable<FolderResponse> {
    return this.http.get<FolderResponse>(`${this.apiUrl}/${folderId}`);
  }

  /**
   * Delete a folder
   */
  deleteFolder(folderId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${folderId}`, {
      responseType: 'text'
    });
  }
}