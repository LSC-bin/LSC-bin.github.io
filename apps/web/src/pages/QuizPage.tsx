import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useUIStore } from '../stores'
import { EmptyState } from '../components/common/EmptyState'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'

export const QuizPage = () => {
  const navigate = useNavigate()
  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const selectedSessionId = useUIStore((state) => state.selectedSessionId)

  if (!selectedClassId || !selectedSessionId) {
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

  return (
    <div className="flex min-h-screen bg-surface-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Navbar />
        <main id="main-content" className="flex-1 p-6" tabIndex={-1}>
          <div className="quiz-page-container">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-white">퀴즈</h1>
              <p className="mt-1 text-slate-400">학생들의 이해도를 확인하고 평가하세요</p>
            </header>

            <EmptyState
              title="퀴즈 기능은 준비 중입니다"
              description="곧 제공될 예정입니다. 퀴즈 생성, 실시간 응답, 자동 채점 기능이 포함됩니다."
              icon={<i className="bx bxs-brain text-6xl text-slate-400" />}
            >
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <p>예정된 기능:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>퀴즈 생성 및 관리</li>
                  <li>실시간 퀴즈 진행</li>
                  <li>자동 채점 시스템</li>
                  <li>결과 분석 및 통계</li>
                </ul>
              </div>
            </EmptyState>
          </div>
        </main>
      </div>
    </div>
  )
}

