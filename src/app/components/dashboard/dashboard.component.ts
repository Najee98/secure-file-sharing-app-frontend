import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FileService } from '../../services/file.service';
import { FolderService } from '../../services/folder.service';
import { SharedLinkService } from '../../services/shared-link.service';
import { FileModel } from '../../models/file.model';
import { FolderResponse } from '../../models/folder-response.model';
import { MaterialModule } from '../../material.module';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FileUploadComponent } from '../file-browser/file-upload/file-upload.component';
import { FolderCreateComponent } from '../file-browser/folder-create/folder-create.component';
import { ShareDialogComponent } from '../sharing/share-dialog/share-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { FilePreviewComponent } from '../file-browser/file-preview/file-preview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    NavbarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  files: FileModel[] = [];
  folders: FolderResponse[] = [];
  isLoading = false;
  currentFolderId: number | null = null;
  breadcrumbs: { id: number | null; name: string }[] = [{ id: null, name: 'Home' }];

  constructor(
    private fileService: FileService,
    private folderService: FolderService,
    private sharedLinkService: SharedLinkService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadRootContent();
  }

  loadRootContent(): void {
    this.isLoading = true;
    this.currentFolderId = null;
    this.breadcrumbs = [{ id: null, name: 'Home' }];

    // Load root folders and files in parallel
    Promise.all([
      this.folderService.getRootFolders().toPromise(),
      this.fileService.getRootFiles().toPromise()
    ]).then(([folders, files]) => {
      this.folders = folders || [];
      this.files = files || [];
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading root content:', error);
      this.snackBar.open('Error loading files', 'Close', { duration: 3000 });
      this.isLoading = false;
    });
  }

  loadFolderContent(folderId: number, folderName: string): void {
    this.isLoading = true;
    this.currentFolderId = folderId;

    // Update breadcrumbs
    const existingIndex = this.breadcrumbs.findIndex(b => b.id === folderId);
    if (existingIndex !== -1) {
      this.breadcrumbs = this.breadcrumbs.slice(0, existingIndex + 1);
    } else {
      this.breadcrumbs.push({ id: folderId, name: folderName });
    }

    // Load folder contents
    Promise.all([
      this.folderService.getSubfolders(folderId).toPromise(),
      this.fileService.getFolderFiles(folderId).toPromise()
    ]).then(([folders, files]) => {
      this.folders = folders || [];
      this.files = files || [];
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading folder content:', error);
      this.snackBar.open('Error loading folder', 'Close', { duration: 3000 });
      this.isLoading = false;
    });
  }

  navigateToBreadcrumb(breadcrumb: { id: number | null; name: string }): void {
    if (breadcrumb.id === null) {
      this.loadRootContent();
    } else {
      this.loadFolderContent(breadcrumb.id, breadcrumb.name);
    }
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      width: '500px',
      data: { folderId: this.currentFolderId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshCurrentView();
      }
    });
  }

  openCreateFolderDialog(): void {
    const dialogRef = this.dialog.open(FolderCreateComponent, {
      width: '400px',
      data: { parentFolderId: this.currentFolderId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshCurrentView();
      }
    });
  }

  downloadFile(file: FileModel): void {
    this.fileService.downloadFile(file.id).subscribe({
      next: (blob) => {
        this.fileService.triggerDownload(blob, file.displayName);
        this.snackBar.open('File downloaded', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Download error:', error);
        this.snackBar.open('Error downloading file', 'Close', { duration: 3000 });
      }
    });
  }

  deleteFile(file: FileModel): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete File',
        message: `Are you sure you want to delete "${file.displayName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.fileService.deleteFile(file.id).subscribe({
          next: () => {
            this.snackBar.open('File deleted', 'Close', { duration: 2000 });
            this.refreshCurrentView();
          },
          error: (error) => {
            console.error('Delete error:', error);
            this.snackBar.open('Error deleting file', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteFolder(folder: FolderResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Folder',
        message: `Are you sure you want to delete folder "${folder.name}"? It must be empty.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.folderService.deleteFolder(folder.id).subscribe({
          next: () => {
            this.snackBar.open('Folder deleted', 'Close', { duration: 2000 });
            this.refreshCurrentView();
          },
          error: (error) => {
            console.error('Delete error:', error);
            const message = error.error || 'Error deleting folder. Make sure it is empty.';
            this.snackBar.open(message, 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  shareFile(file: FileModel): void {
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: '500px',
      data: { itemType: 'file', itemId: file.id, itemName: file.displayName }
    });
  }

  shareFolder(folder: FolderResponse): void {
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: '500px',
      data: { itemType: 'folder', itemId: folder.id, itemName: folder.name }
    });
  }

  refreshCurrentView(): void {
    if (this.currentFolderId === null) {
      this.loadRootContent();
    } else {
      const currentBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 1];
      this.loadFolderContent(this.currentFolderId, currentBreadcrumb.name);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'videocam';
    if (mimeType.startsWith('audio/')) return 'audiotrack';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table_chart';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slideshow';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'folder_zip';
    return 'insert_drive_file';
  }

  previewFile(file: FileModel): void {
    this.dialog.open(FilePreviewComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      data: {
        fileId: file.id,
        fileName: file.displayName,
        mimeType: file.mimeType,
        fileSize: file.size
      }
    });
  }
}