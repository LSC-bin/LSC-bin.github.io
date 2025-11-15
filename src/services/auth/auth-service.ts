/**
 * 인증 서비스
 * localStorage 기반 임시 구현 (향후 백엔드 통합 예정)
 */

import type { AuthService, AuthState, LoginCredentials, User } from '@/types/auth';
import { LocalAuthStorage } from './storage';
import { validateLoginCredentials } from './validation';
import { sanitizeInput } from '@/utils/sanitize';

export class LocalAuthService implements AuthService {
  private storage: LocalAuthStorage;

  constructor() {
    this.storage = new LocalAuthStorage();
  }

  /**
   * 로그인 처리
   * 현재는 localStorage 기반, 향후 API 호출로 교체 예정
   */
  async login(credentials: LoginCredentials): Promise<AuthState> {
    // 입력 검증
    const validation = validateLoginCredentials(credentials);
    if (!validation.success) {
      throw new Error(validation.error || '로그인 정보가 유효하지 않습니다.');
    }

    // 입력값 sanitization
    const sanitizedCredentials: LoginCredentials = {
      username: credentials.username ? sanitizeInput(credentials.username) : undefined,
      email: credentials.email ? sanitizeInput(credentials.email) : undefined,
      role: credentials.role,
    };

    // 임시 로그인 로직 (향후 API 호출로 교체)
    const user = this.createUserFromCredentials(sanitizedCredentials);
    
    const authState: AuthState = {
      isAuthenticated: true,
      user,
      // 향후 JWT 토큰으로 교체
      token: this.generateTempToken(user),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간
    };

    this.storage.save(authState);
    return authState;
  }

  /**
   * 로그아웃 처리
   */
  async logout(): Promise<void> {
    this.storage.clear();
    // 향후 서버 세션 무효화 API 호출 추가
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  getCurrentUser(): User | null {
    const state = this.storage.load();
    return state?.user ?? null;
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated(): boolean {
    const state = this.storage.load();
    if (!state?.isAuthenticated || !state.user) {
      return false;
    }

    // 토큰 만료 확인
    if (state.expiresAt && state.expiresAt < Date.now()) {
      this.storage.clear();
      return false;
    }

    return true;
  }

  /**
   * 임시 사용자 생성 (향후 API 응답으로 교체)
   */
  private createUserFromCredentials(credentials: LoginCredentials): User {
    const role = credentials.role || 'admin';
    const name = credentials.username || credentials.email || '사용자';

    return {
      id: `user_${Date.now()}`,
      name: sanitizeInput(name),
      role,
      email: credentials.email ? sanitizeInput(credentials.email) : undefined,
    };
  }

  /**
   * 임시 토큰 생성 (향후 JWT로 교체)
   */
  private generateTempToken(user: User): string {
    // 임시 토큰 (실제로는 서버에서 발급)
    return btoa(JSON.stringify({ userId: user.id, role: user.role, timestamp: Date.now() }));
  }
}

// 싱글톤 인스턴스
export const authService = new LocalAuthService();

