export interface AuthResponse {
  token: string;
  tokenType: string;
  phoneNumber: string;
  issuedAt: string; // ISO date string
}