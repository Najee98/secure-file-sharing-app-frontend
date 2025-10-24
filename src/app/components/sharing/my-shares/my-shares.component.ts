import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SharedLinkService } from '../../../services/shared-link.service';
import { ShareResponse } from '../../../models/share-response.model';
import { MaterialModule } from '../../../material.module';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-my-shares',
  standalone: true,
  imports: [CommonModule, MaterialModule, NavbarComponent],
  templateUrl: './my-shares.component.html',
  styleUrls: ['./my-shares.component.css']
})
export class MySharesComponent implements OnInit {
  shares: ShareResponse[] = [];
  isLoading = false;
  displayedColumns: string[] = ['itemName', 'itemType', 'shareUrl', 'expiresAt', 'createdAt', 'actions'];

  constructor(
    private sharedLinkService: SharedLinkService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.loadShares();
  }

  loadShares(): void {
    this.isLoading = true;
    this.sharedLinkService.getMyShares().subscribe({
      next: (shares) => {
        this.shares = shares;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading shares:', error);
        this.snackBar.open('Error loading shared links', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  copyLink(shareUrl: string): void {
    this.clipboard.copy(shareUrl);
    this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
  }

  revokeShare(share: ShareResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Revoke Share',
        message: `Are you sure you want to revoke the share link for "${share.itemName}"? The link will no longer work.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.sharedLinkService.revokeShare(share.shareId).subscribe({
          next: () => {
            this.snackBar.open('Share revoked successfully', 'Close', { duration: 2000 });
            this.loadShares();
          },
          error: (error) => {
            console.error('Revoke error:', error);
            this.snackBar.open('Error revoking share', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  getTypeIcon(type: string): string {
    return type === 'file' ? 'insert_drive_file' : 'folder';
  }
}