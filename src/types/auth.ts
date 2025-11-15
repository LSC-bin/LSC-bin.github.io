/**
 * 인증 관련 타입 정의
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token?: string;
  expiresAt?: number;
}

export interface AuthStorage {
  save(state: AuthState): void;
  load(): AuthState | null;
  clear(): void;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthState>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
  isAuthenticated(): boolean;
  refreshToken?(): Promise<string>;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

