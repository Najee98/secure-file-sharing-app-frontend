import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FolderService } from '../../../services/folder.service';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-folder-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './folder-create.component.html',
  styleUrls: ['./folder-create.component.css']
})
export class FolderCreateComponent {
  folderForm: FormGroup;
  isCreating = false;

  constructor(
    private fb: FormBuilder,
    private folderService: FolderService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FolderCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { parentFolderId: number | null }
  ) {
    this.folderForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(/^[a-zA-Z0-9\s._-]+$/)
      ]]
    });
  }

  create(): void {
    if (this.folderForm.invalid) {
      this.snackBar.open('Please enter a valid folder name', 'Close', { duration: 3000 });
      return;
    }

    this.isCreating = true;
    const folderName = this.folderForm.value.name;

    this.folderService.createFolder(folderName, this.data.parentFolderId || undefined).subscribe({
      next: (response) => {
        this.isCreating = false;
        this.snackBar.open('Folder created successfully!', 'Close', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isCreating = false;
        console.error('Create folder error:', error);
        const message = error.error?.message || 'Error creating folder';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  get name() {
    return this.folderForm.get('name');
  }
}