import { FormEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import './loginPage.css';

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, registerWithEmail, isLoading, user } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        showToast('로그인에 성공했습니다.', 'success');
      } else {
        await registerWithEmail(email, password, displayName);
        showToast('회원가입이 완료되었습니다.', 'success');
      }
    } catch (error) {
      console.error(error);
      showToast('인증에 실패했습니다. 입력 정보를 확인하세요.', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      showToast('Google 계정으로 로그인했습니다.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Google 로그인 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">AI ClassBoard</h1>
        <p className="login-subtitle">교실 협업을 위한 통합 플랫폼</p>

        {user ? (
          <p className="login-welcome">{user.displayName ?? user.email}님 환영합니다!</p>
        ) : null}

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label className="login-field">
              <span>이름</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="이름을 입력하세요"
                required
              />
            </label>
          ) : null}

          <label className="login-field">
            <span>이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="login-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </label>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? <LoadingSpinner label="처리 중" /> : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <button type="button" className="google-button" onClick={handleGoogleLogin} disabled={isLoading}>
          Google 계정으로 계속하기
        </button>

        <button
          type="button"
          className="mode-toggle"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? '새 계정을 만들고 싶어요' : '이미 계정이 있어요'}
        </button>
      </div>
    </div>
  );
}
