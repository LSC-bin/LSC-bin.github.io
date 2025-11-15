import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useClassroomDetailQuery, useClassroomSessionsQuery } from '../hooks'
import { useUIStore } from '../stores'
import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
// Activity와 Ask 컴포넌트는 자체 레이아웃이 있어서 직접 내용만 렌더링

type TabType = 'activity' | 'ask' | 'quiz' | 'materials'

export const SessionDetailPage = () => {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const [activeTab, setActiveTab] = useState<TabType>('activity')

  const { data: classroom, isLoading: isClassroomLoading } = useClassroomDetailQuery(
    selectedClassId ?? '',
  )
  const { data: sessions, isLoading: isSessionsLoading } = useClassroomSessionsQuery(
    selectedClassId ?? '',
  )
  const session = sessions?.find((s) => s.id === sessionId)

  if (!selectedClassId || !sessionId) {
    return (
      <div className="flex min-h-screen bg-surface-950 text-slate-100">
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <Navbar />
          <main className="flex-1 p-6">
            <EmptyState
              title="클래스와 세션을 선택해주세요"
              description="대시보드에서 클래스와 세션을 선택한 후 다시 시도해주세요."
            />
          </main>
        </div>
      </div>
    )
  }

  if (isSessionsLoading || isClassroomLoading) {
    return (
      <div className="flex min-h-screen bg-surface-950 text-slate-100">
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <Navbar />
          <main className="flex-1 p-6">
            <Skeleton className="h-64" />
          </main>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen bg-surface-950 text-slate-100">
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <Navbar />
          <main className="flex-1 p-6">
            <EmptyState
              title="세션을 찾을 수 없습니다"
              description="선택한 세션이 존재하지 않거나 삭제되었습니다."
            />
          </main>
        </div>
      </div>
    )
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'activity', label: '활동', icon: 'bx bxs-grid-alt' },
    { id: 'ask', label: '채팅', icon: 'bx bxs-chat' },
    { id: 'quiz', label: '퀴즈', icon: 'bx bxs-brain' },
    { id: 'materials', label: '자료실', icon: 'bx bxs-folder' },
  ]

  return (
    <div className="flex min-h-screen bg-surface-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Navbar />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {/* Header */}
          <div className="border-b border-slate-800 bg-slate-900/50 p-6">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="mb-4 flex items-center gap-2 text-slate-400 transition hover:text-white"
            >
              <i className="bx bx-arrow-back" />
              돌아가기
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{session.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                <span>{classroom?.name || '-'}</span>
                <span>{new Date(session.date).toLocaleDateString('ko-KR')}</span>
                <span>{session.number}차시</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-800 bg-slate-900/30">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-6 py-4 transition ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <i className={tab.icon} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'activity' && (
              <div>
                <p className="mb-4 text-slate-400">Activity 기능은 /teacher/activity 페이지에서 이용할 수 있습니다.</p>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/activity')}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
                >
                  Activity 페이지로 이동
                </button>
              </div>
            )}
            {activeTab === 'ask' && (
              <div>
                <p className="mb-4 text-slate-400">Ask 기능은 /teacher/ask 페이지에서 이용할 수 있습니다.</p>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/ask')}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
                >
                  Ask 페이지로 이동
                </button>
              </div>
            )}
            {activeTab === 'quiz' && (
              <EmptyState
                title="퀴즈 기능은 준비 중입니다"
                description="곧 제공될 예정입니다."
                icon={<i className="bx bxs-brain text-6xl text-slate-400" />}
              />
            )}
            {activeTab === 'materials' && (
              <EmptyState
                title="자료실 기능은 준비 중입니다"
                description="곧 제공될 예정입니다."
                icon={<i className="bx bxs-folder text-6xl text-slate-400" />}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

