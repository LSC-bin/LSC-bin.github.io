/**
 * 인증 서비스 모듈
 */

export { authService, LocalAuthService } from './auth-service';
export { LocalAuthStorage } from './storage';
export { validateLoginCredentials, sanitizeInput } from './validation';
export type { AuthService, AuthState, User, UserRole, LoginCredentials } from '@/types/auth';

