import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^\+?[1-9]\d{1,14}$/)
      ]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Please enter a valid phone number', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    const phoneNumber = this.loginForm.value.phoneNumber;

    this.authService.requestOTP(phoneNumber).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          this.snackBar.open(response.message, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Navigate to OTP verification page
          this.router.navigate(['/verify-otp'], {
            state: { 
              phoneNumber: phoneNumber,
              otp: response.otp // For development/testing only
            }
          });
        } else {
          this.snackBar.open(response.message || 'Failed to send OTP', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('OTP request error:', error);
        this.snackBar.open('Failed to send OTP. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Helper method for form validation
  get phoneNumber() {
    return this.loginForm.get('phoneNumber');
  }
}