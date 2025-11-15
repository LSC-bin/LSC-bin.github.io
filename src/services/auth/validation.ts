/**
 * 인증 입력 검증
 */

import { z } from 'zod';
import type { LoginCredentials } from '@/types/auth';

export const LoginSchema = z.object({
  username: z.string().min(1, '사용자명을 입력해주세요').optional(),
  email: z.string().email('유효한 이메일을 입력해주세요').optional(),
  password: z.string().min(1, '비밀번호를 입력해주세요').optional(),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
}).refine(
  (data) => data.username || data.email,
  { message: '사용자명 또는 이메일을 입력해주세요' }
);

export function validateLoginCredentials(
  credentials: LoginCredentials
): { success: boolean; error?: string } {
  try {
    LoginSchema.parse(credentials);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || '입력값이 유효하지 않습니다.',
      };
    }
    return { success: false, error: '검증 중 오류가 발생했습니다.' };
  }
}

// sanitizeInput은 @/utils/sanitize에서 import하여 사용

