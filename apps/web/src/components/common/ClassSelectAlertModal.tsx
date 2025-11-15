import { useNavigate } from 'react-router-dom'
import { useAuth, useClassroomsQuery } from '../../hooks'
import { useUIStore } from '../../stores'
import { useMemo } from 'react'

type ClassSelectAlertModalProps = {
  isOpen: boolean
  onConfirm: () => void
}

export const ClassSelectAlertModal = ({ isOpen, onConfirm }: ClassSelectAlertModalProps) => {
  const { user } = useAuth()
  const { data: classrooms } = useClassroomsQuery()
  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const setSelectedClassId = useUIStore((state) => state.setSelectedClassId)
  const navigate = useNavigate()

  // 관리자나 어시스턴트는 모든 클래스, 교사는 자신의 클래스만
  const manageableClassrooms = useMemo(() => {
    if (!classrooms || !user) return []
    if (user.role === 'admin' || user.role === 'assistant') return classrooms
    return classrooms.filter((classroom) => classroom.ownerId === user.id)
  }, [classrooms, user])

  const handleConfirm = () => {
    onConfirm()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="class-select-alert-title"
      onClick={(e) => {
        // 배경 클릭 방지
        if (e.target === e.currentTarget) {
          e.stopPropagation()
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-lg border border-slate-700 bg-white p-6 shadow-2xl">
        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500">
            <i className="bx bx-error text-3xl text-white" />
          </div>
        </div>

        {/* 메시지 */}
        <div className="mb-6 text-center">
          <h2 id="class-select-alert-title" className="text-xl font-semibold text-gray-900">
            클래스를 선택해주세요
          </h2>
        </div>

        {/* 확인 버튼 */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

