export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  id: number;
  name: string;
  email: string;
  role: string;
}