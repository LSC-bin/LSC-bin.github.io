import { useNavigate } from 'react-router-dom'
import { useAuth, useClassroomsQuery } from '../../hooks'
import { useUIStore } from '../../stores'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'
import { useMemo } from 'react'

export const ClassSelector = () => {
  const { user } = useAuth()
  const { data: classrooms, isLoading, error } = useClassroomsQuery()
  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const setSelectedClassId = useUIStore((state) => state.setSelectedClassId)
  const navigate = useNavigate()

  // 관리자나 어시스턴트는 모든 클래스, 교사는 자신의 클래스만
  const manageableClassrooms = useMemo(() => {
    if (!classrooms || !user) return []
    if (user.role === 'admin' || user.role === 'assistant') return classrooms
    return classrooms.filter((classroom) => classroom.ownerId === user.id)
  }, [classrooms, user])

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId)
    navigate(`/teacher?classId=${classId}`)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="클래스를 불러오는 중 오류가 발생했습니다"
        description={error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
        icon={<i className="bx bx-error text-6xl text-red-400" />}
      />
    )
  }

  if (!manageableClassrooms || manageableClassrooms.length === 0) {
    return (
      <EmptyState
        title="클래스가 없습니다"
        description="새로운 클래스를 생성하여 시작하세요"
        icon={<i className="bx bxs-school text-6xl text-slate-400" />}
      />
    )
  }

  return (
    <div className="class-select-container">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/20">
          <i className="bx bxs-school text-4xl text-brand-400" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">클래스를 선택하세요</h1>
        <p className="text-slate-400">관리하시는 클래스를 선택하여 시작하세요</p>
      </div>

      <div className="class-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {manageableClassrooms.map((classroom) => (
          <div
            key={classroom.id}
            className={`class-card group relative cursor-pointer rounded-lg border-2 bg-slate-800 p-6 transition-all hover:border-brand-500 hover:shadow-lg ${
              selectedClassId === classroom.id
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-slate-700'
            }`}
            onClick={() => handleClassSelect(classroom.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClassSelect(classroom.id)
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500">
                <i className="bx bx-group text-2xl text-white" />
              </div>
              {selectedClassId === classroom.id && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500">
                  <i className="bx bx-check text-sm text-white" />
                </div>
              )}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">{classroom.name}</h3>
            {classroom.description && (
              <p className="text-sm text-slate-400">{classroom.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span>
                <i className="bx bx-calendar mr-1" />
                {new Date(classroom.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

