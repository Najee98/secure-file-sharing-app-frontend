import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.css']
})
export class FilePreviewComponent implements OnInit {
  previewUrl: SafeResourceUrl | null = null;
  isLoading = true;
  previewType: 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'unsupported' = 'unsupported';
  textContent: string = '';

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    public dialogRef: MatDialogRef<FilePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      fileId: number;
      fileName: string;
      mimeType: string;
      fileSize: number;
    }
  ) {}

  ngOnInit(): void {
    this.determinePreviewType();
    this.loadPreview();
  }

  determinePreviewType(): void {
    const mimeType = this.data.mimeType.toLowerCase();

    if (mimeType.startsWith('image/')) {
      this.previewType = 'image';
    } else if (mimeType === 'application/pdf') {
      this.previewType = 'pdf';
    } else if (mimeType.startsWith('video/')) {
      this.previewType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      this.previewType = 'audio';
    } else if (mimeType.startsWith('text/')) {
      this.previewType = 'text';
    } else {
      this.previewType = 'unsupported';
    }
  }

  loadPreview(): void {
    const token = this.authService.getToken();
    const url = `${environment.apiUrl}/files/${this.data.fileId}/preview`;

    if (this.previewType === 'text') {
      // Fetch text content
      fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => response.text())
        .then(text => {
          this.textContent = text;
          this.isLoading = false;
        })
        .catch(error => {
          console.error('Error loading text:', error);
          this.isLoading = false;
        });
    } else if (this.previewType !== 'unsupported') {
      // For images, PDFs, videos, audio - use URL with token in query param
      const urlWithToken = `${url}?token=${token}`;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithToken);
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}