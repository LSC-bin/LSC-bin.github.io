import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useUIStore } from '../stores'
import { EmptyState } from '../components/common/EmptyState'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'

export const MaterialsPage = () => {
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
          <div className="materials-page-container">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">자료실</h1>
                <p className="mt-1 text-slate-400">수업 자료를 업로드하고 관리하세요</p>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-white transition hover:bg-brand-600"
              >
                <i className="bx bx-upload" />
                자료 업로드
              </button>
            </header>

            <EmptyState
              title="자료실 기능은 준비 중입니다"
              description="곧 제공될 예정입니다. 파일 업로드, 다운로드, 폴더 관리 기능이 포함됩니다."
              icon={<i className="bx bxs-folder text-6xl text-slate-400" />}
            >
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <p>예정된 기능:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>파일 업로드 및 다운로드</li>
                  <li>폴더 구조 관리</li>
                  <li>파일 검색 및 필터링</li>
                  <li>권한 관리</li>
                </ul>
              </div>
            </EmptyState>
          </div>
        </main>
      </div>
    </div>
  )
}

