/**
 * 로그인 페이지 컴포넌트
 */

import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { Button } from '@/components/common/Button';
import { sanitizeInput } from '@/utils/sanitize';
import type { LoginCredentials } from '@/types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const credentials: LoginCredentials = {
        username: formData.get('username') ? sanitizeInput(formData.get('username') as string) : undefined,
        role: (formData.get('role') as 'admin' | 'teacher' | 'student') || 'admin',
      };

      await authService.login(credentials);
      navigate('/class-select');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" role="main">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <i className="bx bxs-graduation bx-spin-hover" aria-hidden="true"></i>
          </div>
          <h1>AI ClassBoard</h1>
          <p>실시간 학습 플랫폼에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {error && (
            <div className="error-message" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              사용자명 <span className="required" aria-label="필수">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'username-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">역할</label>
            <select id="role" name="role" defaultValue="admin" aria-label="사용자 역할 선택">
              <option value="admin">관리자</option>
              <option value="teacher">교사</option>
              <option value="student">학생</option>
            </select>
          </div>

          <Button type="submit" isLoading={isLoading} className="login-submit-btn">
            로그인
          </Button>
        </form>

        <div className="login-footer">
          <p>로그인 시 이용약관 및 개인정보처리방침에 동의한 것으로 간주됩니다.</p>
        </div>
      </div>
    </div>
  );
};

