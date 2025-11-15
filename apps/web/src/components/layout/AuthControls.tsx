import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { getUserFriendlyMessage, handleError } from '../../lib/error-handler'
import { useAuth } from '../../hooks'

import type { UserRole } from '../../types'

const DEFAULT_ROLE: UserRole = 'teacher'

export const AuthControls = () => {
  const { user, isLoading, signIn, signUp, signOut } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE)

  const toggleMode = () => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setRole(DEFAULT_ROLE)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === 'signin') {
      try {
        await signIn(email, password)
        toast.success('로그인에 성공했습니다.')
        setIsFormOpen(false)
        resetForm()
      } catch (error) {
        handleError(error, { component: 'AuthControls', action: 'signIn' })
        toast.error(getUserFriendlyMessage(error))
      }
      return
    }

    if (!displayName.trim()) {
      toast.error('표시 이름을 입력해주세요.')
      return
    }

    try {
      await signUp({
        email,
        password,
        displayName: displayName.trim(),
        role,
      })
      toast.success('계정이 생성되고 로그인되었습니다.')
      setIsFormOpen(false)
      resetForm()
    } catch (error) {
      handleError(error, { component: 'AuthControls', action: 'signUp' })
      toast.error(getUserFriendlyMessage(error))
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('로그아웃되었습니다.')
    } catch (error) {
      handleError(error, { component: 'AuthControls', action: 'signOut' })
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-right">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
            {user.role}
          </span>
          <span className="text-sm text-white">{user.displayName || user.email}</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-brand-400 hover:text-white"
          disabled={isLoading}
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsFormOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-brand-500/60 px-4 py-2 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/20"
      >
        {isFormOpen ? '닫기' : '로그인 / 가입'}
      </button>

      {isFormOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800 bg-surface-900/95 p-4 shadow-xl shadow-slate-950/40">
          <form className="space-y-3 text-sm text-slate-200" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {mode === 'signin' ? 'ClassBoard 로그인' : 'ClassBoard 회원가입'}
              </h3>
              <button
                type="button"
                className="text-xs text-brand-300 transition hover:text-brand-100"
                onClick={toggleMode}
              >
                {mode === 'signin' ? '회원가입으로 전환' : '로그인으로 전환'}
              </button>
            </div>

            <label className="flex flex-col gap-1">
              이메일
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-slate-700 bg-surface-800 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              비밀번호
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-slate-700 bg-surface-800 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
              />
            </label>

            {mode === 'signup' && (
              <>
                <label className="flex flex-col gap-1">
                  표시 이름
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-surface-800 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  역할
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as UserRole)}
                    className="rounded-lg border border-slate-700 bg-surface-800 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
                  >
                    <option value="teacher">교사</option>
                    <option value="student">학생</option>
                    <option value="assistant">보조 교사</option>
                  </select>
                </label>
              </>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-brand-500 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : mode === 'signin' ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}



