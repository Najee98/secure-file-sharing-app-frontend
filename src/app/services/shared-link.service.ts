import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateShareRequest } from '../models/create-share-request.model';
import { ShareResponse } from '../models/share-response.model';

@Injectable({
  providedIn: 'root'
})
export class SharedLinkService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Share a file
   */
  shareFile(fileId: number, recipientPhone?: string, message?: string): Observable<ShareResponse> {
    const request: CreateShareRequest = {
      recipientPhone,
      message
    };
    return this.http.post<ShareResponse>(`${this.apiUrl}/files/${fileId}/share`, request);
  }

  /**
   * Share a folder
   */
  shareFolder(folderId: number, recipientPhone?: string, message?: string): Observable<ShareResponse> {
    const request: CreateShareRequest = {
      recipientPhone,
      message
    };
    return this.http.post<ShareResponse>(`${this.apiUrl}/folders/${folderId}/share`, request);
  }

  /**
   * Get all shares created by user
   */
  getMyShares(): Observable<ShareResponse[]> {
    return this.http.get<ShareResponse[]>(`${this.apiUrl}/shared/my-shares`);
  }

  /**
   * Get shares for a specific file
   */
  getFileShares(fileId: number): Observable<ShareResponse[]> {
    return this.http.get<ShareResponse[]>(`${this.apiUrl}/files/${fileId}/shares`);
  }

  /**
   * Revoke a shared link
   */
  revokeShare(shareId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/shared/${shareId}`, {
      responseType: 'text'
    });
  }

  /**
   * Get share info by token (public endpoint)
   */
  getShareInfo(linkToken: string): Observable<ShareResponse> {
    return this.http.get<ShareResponse>(`${environment.apiUrl.replace('/api', '')}/public/shared/${linkToken}/info`);
  }

  /**
   * Download shared file/folder (public endpoint)
   */
  downloadShared(linkToken: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl.replace('/api', '')}/public/shared/${linkToken}`, {
      responseType: 'blob'
    });
  }
}