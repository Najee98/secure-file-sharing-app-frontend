export interface OtpResponse {
  success: boolean;
  otp?: string;
  message: string;
  phoneNumber?: string;
  expiresAt?: string; // Will come as ISO string from backend
}