import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { OtpRequest } from '../models/otp-request.model';
import { OtpResponse } from '../models/otp-response.model';
import { OtpVerificationRequest } from '../models/otp-verification-request.model';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'jwt_token';
  private phoneNumberKey = 'phone_number';
  
  // Observable to track authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Request OTP for phone number
   */
  requestOTP(phoneNumber: string): Observable<OtpResponse> {
    const request: OtpRequest = { phoneNumber };
    return this.http.post<OtpResponse>(`${this.apiUrl}/request-otp`, request);
  }

  /**
   * Verify OTP and get JWT token
   */
  verifyOTP(phoneNumber: string, otp: string): Observable<AuthResponse> {
    const request: OtpVerificationRequest = { phoneNumber, otp };
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-otp`, request)
      .pipe(
        tap(response => {
          // Store token and phone number
          this.saveToken(response.token);
          this.savePhoneNumber(response.phoneNumber);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  /**
   * Save JWT token to localStorage
   */
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Save phone number to localStorage
   */
  private savePhoneNumber(phoneNumber: string): void {
    localStorage.setItem(this.phoneNumberKey, phoneNumber);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored phone number
   */
  getPhoneNumber(): string | null {
    return localStorage.getItem(this.phoneNumberKey);
  }

  /**
   * Check if user has token
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.phoneNumberKey);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }
}