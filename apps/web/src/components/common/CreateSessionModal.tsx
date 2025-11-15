import { FormEvent, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCreateSessionMutation, useClassroomSessionsQuery } from '../../hooks'
import { useUIStore } from '../../stores'
import { getUserFriendlyMessage, handleError } from '../../lib/error-handler'

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
  classId: string | null
  canManage: boolean
}

export const CreateSessionModal = ({ isOpen, onClose, classId, canManage }: CreateSessionModalProps) => {
  const [title, setTitle] = useState('')
  const [number, setNumber] = useState(1)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [agenda, setAgenda] = useState('')

  const { data: sessions } = useClassroomSessionsQuery(classId ?? '')
  const createSessionMutation = useCreateSessionMutation()

  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setAgenda('')
      setDate(new Date().toISOString().slice(0, 10))
      if (sessions) {
        setNumber((sessions.length ?? 0) + 1)
      }
    }
  }, [isOpen, sessions])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!classId) {
      toast.error('클래스를 먼저 선택해주세요.')
      return
    }
    if (!canManage) {
      toast.error('이 클래스를 관리할 권한이 없습니다.')
      return
    }
    if (!title.trim()) {
      toast.error('수업 제목을 입력해주세요.')
      return
    }

    try {
      await createSessionMutation.mutateAsync({
        classId,
        input: {
          title: title.trim(),
          number,
          date: new Date(date).toISOString(),
          agenda: agenda.trim() || undefined,
          status: 'draft',
        },
      })
      toast.success('세션이 생성되었습니다.')
      onClose()
    } catch (error) {
      handleError(error, { component: 'CreateSessionModal', action: 'createSession' })
      toast.error(getUserFriendlyMessage(error))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            <i className="bx bx-plus-circle mr-2" />
            오늘의 수업 만들기
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-white"
            aria-label="모달 닫기"
          >
            <i className="bx bx-x text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="session-title" className="mb-1 block text-sm font-medium text-slate-300">
              <i className="bx bxs-book mr-1" />
              수업 제목
            </label>
            <input
              type="text"
              id="session-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 디지털 윤리와 익명성"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="session-date" className="mb-1 block text-sm font-medium text-slate-300">
                <i className="bx bxs-calendar mr-1" />
                날짜
              </label>
              <input
                type="date"
                id="session-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="session-number" className="mb-1 block text-sm font-medium text-slate-300">
                <i className="bx bxs-hash mr-1" />
                차시
              </label>
              <input
                type="number"
                id="session-number"
                value={number}
                onChange={(e) => setNumber(Number(e.target.value))}
                min={1}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="session-agenda" className="mb-1 block text-sm font-medium text-slate-300">
              <i className="bx bxs-note mr-1" />
              수업 개요 (선택사항)
            </label>
            <textarea
              id="session-agenda"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={3}
              placeholder="수업 목표나 주요 활동을 입력하세요"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!classId || createSessionMutation.isPending || !canManage}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createSessionMutation.isPending ? (
                <>
                  <i className="bx bx-loader-alt animate-spin mr-1" />
                  생성 중...
                </>
              ) : (
                <>
                  <i className="bx bx-save mr-1" />
                  저장
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

