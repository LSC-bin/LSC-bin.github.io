import { NavLink } from 'react-router-dom'
import { useUIStore } from '../../stores'

interface SidebarMenuItem {
  to: string
  icon: string
  label: string
  tooltip: string
}

const sidebarMenuItems: SidebarMenuItem[] = [
  { to: '/teacher', icon: 'bx bxs-home', label: '대시보드', tooltip: '대시보드' },
  { to: '/teacher/activity', icon: 'bx bxs-grid-alt', label: '활동', tooltip: '활동' },
  { to: '/teacher/ask', icon: 'bx bxs-chat', label: '채팅', tooltip: '채팅' },
  { to: '/teacher/cloud', icon: 'bx bxs-cloud', label: '클라우드', tooltip: '클라우드' },
  { to: '/teacher/quiz', icon: 'bx bxs-brain', label: '퀴즈', tooltip: '퀴즈' },
  { to: '/teacher/materials', icon: 'bx bxs-folder', label: '자료', tooltip: '자료' },
  { to: '/teacher/settings', icon: 'bx bxs-cog', label: '설정', tooltip: '설정' },
]

export const Sidebar = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  return (
      <aside
        id="sidebar"
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-slate-800 bg-surface-900 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        aria-label="주요 네비게이션"
        role="navigation"
      >
      <div className="flex h-full flex-col">
        {/* Sidebar Top */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
              <i className="bx bxs-graduation text-xl text-white" />
            </div>
            <span className="text-lg font-semibold text-white">ClassBoard</span>
          </div>
          <button
            type="button"
            id="navbar-sidebar-toggle"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="사이드바 닫기"
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
          >
            <i className="bx bx-chevron-left text-xl" aria-hidden="true" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav aria-label="주요 메뉴">
          <ul className="flex-1 space-y-1 overflow-y-auto p-2" role="list">
            {sidebarMenuItems.map((item) => (
              <li key={item.to} className="menu-item" role="listitem">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `menu-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                  aria-label={item.label}
                  title={item.tooltip}
                >
                  <i className={`${item.icon} text-lg`} aria-hidden="true" />
                  <span className="menu-text">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

