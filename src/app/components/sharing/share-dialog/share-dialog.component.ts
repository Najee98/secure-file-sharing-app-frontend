import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedLinkService } from '../../../services/shared-link.service';
import { ShareResponse } from '../../../models/share-response.model';
import { MaterialModule } from '../../../material.module';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent {
  shareForm: FormGroup;
  isSharing = false;
  shareResult: ShareResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private sharedLinkService: SharedLinkService,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard,
    public dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      itemType: 'file' | 'folder', 
      itemId: number, 
      itemName: string 
    }
  ) {
    this.shareForm = this.fb.group({
      recipientPhone: [''],
      message: ['']
    });
  }

  share(): void {
    this.isSharing = true;
    const { recipientPhone, message } = this.shareForm.value;

    const shareObservable = this.data.itemType === 'file'
      ? this.sharedLinkService.shareFile(this.data.itemId, recipientPhone, message)
      : this.sharedLinkService.shareFolder(this.data.itemId, recipientPhone, message);

    shareObservable.subscribe({
      next: (response) => {
        this.isSharing = false;
        this.shareResult = response;
        this.snackBar.open('Share link created!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        this.isSharing = false;
        console.error('Share error:', error);
        const message = error.error?.message || 'Error creating share link';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  copyLink(): void {
    if (this.shareResult) {
      this.clipboard.copy(this.shareResult.shareUrl);
      this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}