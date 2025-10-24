import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileService } from '../../../services/file.service';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;

  constructor(
    private fileService: FileService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FileUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { folderId: number | null }
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  upload(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Please select a file', 'Close', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    
    this.fileService.uploadFile(this.selectedFile, this.data.folderId || undefined).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.snackBar.open('File uploaded successfully!', 'Close', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error:', error);
        const message = error.error?.message || 'Error uploading file';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}