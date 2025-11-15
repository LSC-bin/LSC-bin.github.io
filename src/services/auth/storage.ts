/**
 * 인증 상태 저장소 추상화
 * localStorage를 사용하되, 향후 백엔드 통합 시 쉽게 교체 가능
 */

import type { AuthState, AuthStorage } from '@/types/auth';

const STORAGE_KEY = 'classboard_auth';
const TOKEN_KEY = 'classboard_token';

/**
 * localStorage 기반 인증 저장소
 * 보안 강화: 민감한 정보는 암호화하거나 서버 세션으로 이동 예정
 */
export class LocalAuthStorage implements AuthStorage {
  save(state: AuthState): void {
    try {
      // 사용자 정보만 저장 (비밀번호 등은 저장하지 않음)
      const safeState: Partial<AuthState> = {
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        expiresAt: state.expiresAt,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
      
      // 토큰은 별도로 저장 (향후 JWT 등으로 교체 가능)
      if (state.token) {
        localStorage.setItem(TOKEN_KEY, state.token);
      }
    } catch (error) {
      console.error('인증 상태 저장 실패:', error);
      throw new Error('인증 상태를 저장할 수 없습니다.');
    }
  }

  load(): AuthState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const state = JSON.parse(stored) as Partial<AuthState>;
      const token = localStorage.getItem(TOKEN_KEY) || undefined;

      return {
        isAuthenticated: state.isAuthenticated ?? false,
        user: state.user ?? null,
        token,
        expiresAt: state.expiresAt,
      };
    } catch (error) {
      console.error('인증 상태 로드 실패:', error);
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('인증 상태 삭제 실패:', error);
    }
  }
}

