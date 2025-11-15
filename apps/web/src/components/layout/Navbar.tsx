import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useClassroomsQuery, useClassroomSessionsQuery } from '../../hooks'
import { useUIStore } from '../../stores'
import { handleError } from '../../lib/error-handler'
import { CreateSessionModal } from '../common/CreateSessionModal'

export const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const selectedSessionId = useUIStore((state) => state.selectedSessionId)
  const setSelectedClassId = useUIStore((state) => state.setSelectedClassId)
  const setSelectedSessionId = useUIStore((state) => state.setSelectedSessionId)
  const location = useLocation()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false)

  const { data: classrooms } = useClassroomsQuery()
  const { data: sessions } = useClassroomSessionsQuery(selectedClassId ?? '')
  
  const isTeacherPage = location.pathname.startsWith('/teacher')
  const canManage = Boolean(user && ['teacher', 'assistant', 'admin'].includes(user?.role))

  const handleLogout = async () => {
    try {
      await signOut.mutateAsync()
      navigate('/')
      } catch (error) {
        handleError(error, { component: 'Navbar', action: 'signOut' })
      }
  }

  const categories = [
    { href: '/teacher', icon: 'bx bxs-home', label: '대시보드' },
    { href: '/teacher/activity', icon: 'bx bxs-grid-alt', label: '활동' },
    { href: '/teacher/ask', icon: 'bx bxs-chat', label: '채팅' },
    { href: '/teacher/cloud', icon: 'bx bxs-cloud', label: '클라우드' },
    { href: '/teacher/quiz', icon: 'bx bxs-brain', label: '퀴즈' },
    { href: '/teacher/materials', icon: 'bx bxs-folder', label: '자료' },
    { href: '/teacher/settings', icon: 'bx bxs-cog', label: '설정' },
  ]

  return (
      <header
        id="navbar"
        className="sticky top-0 z-30 border-b border-slate-800 bg-surface-900/80 backdrop-blur"
        role="banner"
      >
      <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left: Menu Button */}
          <button
            id="menu-btn"
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="메뉴 열기"
            aria-expanded={useUIStore((state) => state.isSidebarOpen)}
            aria-controls="sidebar"
          >
            <i className="bx bx-menu text-2xl" aria-hidden="true" />
          </button>

        {/* Center: Search Box, Class/Session Selectors */}
        <div className="hidden flex-1 items-center gap-3 md:flex">
          <div className="search-box flex flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 md:max-w-md">
            <i className="bx bx-search text-slate-400" />
            <input
              type="text"
              placeholder="검색..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              aria-label="검색"
            />
          </div>
          {classrooms && classrooms.length > 0 && (
            <>
              <select
                value={selectedClassId ?? ''}
                onChange={(e) => setSelectedClassId(e.target.value || null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">클래스 선택</option>
                {classrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {selectedClassId && sessions && (
                <select
                  value={selectedSessionId ?? ''}
                  onChange={(e) => setSelectedSessionId(e.target.value || null)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="">세션 선택</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.number}차시 - {session.title}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="navbar-right flex items-center gap-2">
          {/* Create Session Button (Teacher page only) */}
          {isTeacherPage && canManage && selectedClassId && (
            <button
              type="button"
              onClick={() => setIsCreateSessionOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <i className="bx bx-plus" />
              <span className="hidden md:inline">수업 만들기</span>
            </button>
          )}

          {/* Categories Dropdown */}
          <div className="categories-wrapper relative">
            <button
              type="button"
              className="categories-btn flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:border-brand-400 hover:text-white"
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              aria-label="카테고리 메뉴"
            >
              <i className="bx bxs-category" />
              <span className="hidden md:inline">카테고리</span>
              <i className="bx bx-chevron-down" />
            </button>
            {isCategoriesOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsCategoriesOpen(false)}
                />
                <div className="categories-dropdown absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-800 shadow-lg">
                  {categories.map((category) => (
                    <a
                      key={category.href}
                      href={category.href}
                      className="category-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(category.href)
                        setIsCategoriesOpen(false)
                      }}
                    >
                      <i className={category.icon} />
                      <span>{category.label}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <label className="dark-mode-toggle cursor-pointer">
            <input
              type="checkbox"
              id="switch-mode"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              className="hidden"
              aria-label="다크 모드 전환"
            />
            <span className="switch-lm flex h-9 w-16 items-center rounded-full bg-slate-700 p-1 transition">
              <span
                className={`h-7 w-7 rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </span>
          </label>

          {/* Profile Dropdown */}
          <div className="profile relative">
            <button
              type="button"
              className="profile-btn flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="프로필"
            >
              <i className="bx bxs-user-circle text-2xl" />
            </button>
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="profile-dropdown absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-slate-700 bg-slate-800 shadow-lg">
                  <div className="profile-info border-b border-slate-700 p-4">
                    <div className="profile-info-header mb-3 flex items-center gap-3">
                      <i className="bx bxs-user-circle text-3xl text-slate-400" />
                      <div>
                        <p className="profile-name text-sm font-semibold text-white">
                          {user?.displayName || '사용자'}
                        </p>
                        <p className="profile-role text-xs text-slate-400">
                          {user?.role === 'teacher' ? '교사' : user?.role || '사용자'}
                        </p>
                      </div>
                    </div>
                    <div className="profile-class flex items-center gap-2 text-xs text-slate-400">
                      <i className="bx bxs-school" />
                      <span id="profile-class-name">
                        {classrooms?.find((c) => c.id === selectedClassId)?.name || '클래스를 선택하세요'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <a
                      href="#profile"
                      className="profile-menu-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
                      onClick={(e) => {
                        e.preventDefault()
                        navigate('/teacher/profile')
                        setIsProfileOpen(false)
                      }}
                    >
                      <i className="bx bxs-user" />
                      <span>프로필</span>
                    </a>
                    <button
                      type="button"
                      className="profile-menu-item logout-item flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-red-400"
                      onClick={handleLogout}
                    >
                      <i className="bx bx-log-out" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {isTeacherPage && (
        <CreateSessionModal
          isOpen={isCreateSessionOpen}
          onClose={() => setIsCreateSessionOpen(false)}
          classId={selectedClassId}
          canManage={canManage}
        />
      )}
    </header>
  )
}

