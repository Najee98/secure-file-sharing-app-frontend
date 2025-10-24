import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedLinkService } from '../../../services/shared-link.service';
import { ShareResponse } from '../../../models/share-response.model';
import { MaterialModule } from '../../../material.module';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-public-preview',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './public-preview.component.html',
  styleUrls: ['./public-preview.component.css']
})
export class PublicPreviewComponent implements OnInit {
  shareInfo: ShareResponse | null = null;
  previewUrl: SafeResourceUrl | null = null;
  isLoading = true;
  previewType: 'image' | 'pdf' | 'video' | 'audio' | 'folder' | 'unsupported' = 'unsupported';
  linkToken: string = '';

  constructor(
    private route: ActivatedRoute,
    private sharedLinkService: SharedLinkService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.linkToken = this.route.snapshot.paramMap.get('token') || '';
    this.loadShareInfo();
  }

  loadShareInfo(): void {
    this.sharedLinkService.getShareInfo(this.linkToken).subscribe({
      next: (info) => {
        this.shareInfo = info;
        
        if (info.itemType === 'folder') {
          this.previewType = 'folder';
          this.isLoading = false;
        } else {
          this.determinePreviewType();
          this.loadPreview();
        }
      },
      error: (error) => {
        console.error('Error loading share info:', error);
        this.snackBar.open('Invalid or expired link', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  determinePreviewType(): void {
    // We'd need to get MIME type from backend - for now, check file extension
    const fileName = this.shareInfo?.itemName || '';
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')) {
      this.previewType = 'image';
    } else if (ext === 'pdf') {
      this.previewType = 'pdf';
    } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
      this.previewType = 'video';
    } else if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
      this.previewType = 'audio';
    } else {
      this.previewType = 'unsupported';
    }
  }

  loadPreview(): void {
    const baseUrl = environment.apiUrl.replace('/api', '');
    const url = `${baseUrl}/public/shared/${this.linkToken}/preview`;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.isLoading = false;
  }

  download(): void {
    this.sharedLinkService.downloadShared(this.linkToken).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.shareInfo?.itemName || 'download';
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Download started', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Download error:', error);
        this.snackBar.open('Error downloading file', 'Close', { duration: 3000 });
      }
    });
  }
}