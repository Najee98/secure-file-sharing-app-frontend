import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit {
  otpForm: FormGroup;
  isLoading = false;
  phoneNumber: string = '';
  otpForTesting: string = ''; // For development only

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]]
    });

    // Get phone number from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.phoneNumber = navigation.extras.state['phoneNumber'] || '';
      this.otpForTesting = navigation.extras.state['otp'] || '';
      
      // Show OTP in console for testing (remove in production)
      if (this.otpForTesting) {
        console.log('🔐 OTP for testing:', this.otpForTesting);
      }
    }
  }

  ngOnInit(): void {
    // Redirect to login if no phone number
    if (!this.phoneNumber) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.otpForm.invalid) {
      this.snackBar.open('Please enter a valid 6-digit OTP', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    const otp = this.otpForm.value.otp;

    this.authService.verifyOTP(this.phoneNumber, otp).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        this.snackBar.open('Login successful!', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('OTP verification error:', error);
        
        const errorMessage = error.error?.message || 'Invalid or expired OTP. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  resendOTP(): void {
    this.authService.requestOTP(this.phoneNumber).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('OTP resent successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Update OTP for testing
          this.otpForTesting = response.otp || '';
          if (this.otpForTesting) {
            console.log('🔐 New OTP for testing:', this.otpForTesting);
          }
        }
      },
      error: (error) => {
        console.error('Resend OTP error:', error);
        this.snackBar.open('Failed to resend OTP', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }

  get otp() {
    return this.otpForm.get('otp');
  }
}