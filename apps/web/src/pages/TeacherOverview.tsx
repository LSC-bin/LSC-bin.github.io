import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, JSX } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getUserFriendlyMessage, handleError } from '../lib/error-handler'

import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import { Announcements } from '../components/common/Announcements'
import { ClassSelectAlertModal } from '../components/common/ClassSelectAlertModal'
import { ClassSelectorModal } from '../components/common/ClassSelectorModal'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import {
  useAuth,
  useDashboardWidgetsPreferences,
  type ResolvedWidgetPreference,
  type WidgetDefinition,
  useClassroomDetailQuery,
  useClassroomMembersQuery,
  useClassroomSessionsQuery,
  useClassroomsQuery,
} from '../hooks'
import { useUIStore } from '../stores'
import type { AuthUser } from '../stores/auth-store'
import type { ClassroomMember, Session } from '../types'
import '../styles/teacher-dashboard.css'
import type { WidgetSize } from '../services'

type TeacherWidgetRenderContext = {
  members: ClassroomMember[] | undefined
  isMembersLoading: boolean
  sessions: Session[] | undefined
  isSessionsLoading: boolean
  teacherName: string
  navigate: (path: string) => void
  selectedClassId: string | null
  selectedSessionId: string | null
}

type TeacherWidgetDefinition = WidgetDefinition<Record<string, unknown>> & {
  title: string
  description?: string
  icon: string
  accentColor: string
  render: (context: TeacherWidgetRenderContext) => JSX.Element
}

const TEACHER_WIDGET_DEFINITIONS: TeacherWidgetDefinition[] = [
  {
    widgetId: 'announcements',
    title: '공지사항',
    description: '최근 공지 및 알림을 확인하세요',
    icon: 'bx bxs-bullhorn',
    accentColor: 'var(--color-blue)',
    defaultOrder: 1,
    defaultVisible: true,
    defaultSize: 'medium', // 모든 위젯은 동일한 크기 사용
    render: () => <Announcements />,
  },
  {
    widgetId: 'quickLinks',
    title: 'Quick Links',
    description: 'Jump into frequently used areas',
    icon: 'bx bxs-zap',
    accentColor: 'var(--color-orange)',
    defaultOrder: 2,
    defaultVisible: true,
    defaultSize: 'medium', // 모든 위젯은 동일한 크기 사용
    render: ({ navigate, selectedClassId, selectedSessionId }) => {
      const quickLinks = [
        {
          label: 'Activity',
          icon: 'bx bxs-grid-alt',
          path: '/teacher/activity',
          disabled: !selectedClassId || !selectedSessionId,
        },
        {
          label: 'Ask',
          icon: 'bx bxs-chat',
          path: '/teacher/ask',
          disabled: !selectedClassId || !selectedSessionId,
        },
        {
          label: 'Materials',
          icon: 'bx bxs-folder',
          path: '/teacher/materials',
          disabled: !selectedClassId || !selectedSessionId,
        },
        {
          label: 'Quiz',
          icon: 'bx bxs-brain',
          path: '/teacher/quiz',
          disabled: !selectedClassId || !selectedSessionId,
        },
      ]

      return (
        <div className="quick-links">
          {quickLinks.map((link) => (
            <button
              key={link.path}
              type="button"
              className="quick-link"
              onClick={() => navigate(link.path)}
              disabled={link.disabled}
              title={link.disabled ? '클래스와 세션을 먼저 선택해주세요' : link.label}
            >
              <i className={link.icon} />
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      )
    },
  },
  {
    widgetId: 'assignments',
    title: 'Assignment Progress',
    description: 'Monitor submissions and upcoming deadlines',
    icon: 'bx bxs-clipboard',
    accentColor: 'var(--color-red)',
    defaultOrder: 3,
    defaultVisible: true,
    defaultSize: 'medium', // 모든 위젯은 동일한 크기 사용
    render: ({ sessions, isSessionsLoading }) => {
      if (isSessionsLoading) {
        return (
          <div className="widget-loading">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )
      }

      // 오늘 날짜 기준으로 다가오는 세션 필터링
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcomingSessions = sessions
        ?.filter((session) => {
          const sessionDate = new Date(session.date)
          sessionDate.setHours(0, 0, 0, 0)
          return sessionDate >= today && session.status !== 'archived'
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5) || []

      // 전체 세션 중 live/draft 상태인 것들
      const activeSessions = sessions?.filter((s) => s.status !== 'archived') || []
      const totalSessions = activeSessions.length
      const completedSessions = sessions?.filter((s) => s.status === 'archived').length || 0
      const progressPercentage = totalSessions > 0 ? Math.round((completedSessions / (totalSessions + completedSessions)) * 100) : 0

      if (upcomingSessions.length === 0 && totalSessions === 0) {
        return (
          <div className="empty-widget">
            <i className="bx bx-clipboard" />
            <p>No upcoming sessions or assignments.</p>
          </div>
        )
      }

      return (
        <div className="assignment-status">
          <div className="assignment-progress">
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="progress-info">
              <span>Completed Sessions</span>
              <strong>
                {completedSessions}/{totalSessions + completedSessions}
              </strong>
            </div>
          </div>
          {upcomingSessions.length > 0 && (
            <ul className="assignment-list">
              {upcomingSessions.slice(0, 3).map((session) => {
                const sessionDate = new Date(session.date)
                const daysUntil = Math.ceil((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysUntil <= 2
                const isSoon = daysUntil <= 7

                return (
                  <li key={session.id}>
                    <span className={`badge ${isUrgent ? 'warning' : isSoon ? 'info' : ''}`} />
                    <div>
                      <p className="title">{session.title}</p>
                      <p className="meta">
                        {daysUntil === 0
                          ? 'Today'
                          : daysUntil === 1
                            ? 'Tomorrow'
                            : `Due in ${daysUntil} days`}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {upcomingSessions.length === 0 && totalSessions > 0 && (
            <div className="empty-widget">
              <i className="bx bx-check-circle" />
              <p>All upcoming sessions are completed!</p>
            </div>
          )}
        </div>
      )
    },
    defaultSettings: {},
  },
  {
    widgetId: 'todayClasses',
    title: "Today's Sessions",
    description: 'Live and upcoming classes scheduled for today',
    icon: 'bx bxs-calendar',
    accentColor: 'var(--color-blue)',
    defaultOrder: 4,
    defaultVisible: true,
    defaultSize: 'medium', // 모든 위젯은 동일한 크기 사용
    render: ({ sessions, isSessionsLoading, teacherName, navigate }) => {
      if (isSessionsLoading) {
        return (
          <div className="widget-loading">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )
      }

      // 오늘 날짜로 필터링
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)

      const todaySessions = sessions
        ?.filter((session) => {
          const sessionDate = new Date(session.date)
          return sessionDate >= today && sessionDate <= todayEnd
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || []

      if (!sessions?.length) {
        return (
          <div className="empty-widget">
            <i className="bx bx-calendar-x" />
            <p>No sessions yet. Create a new session to get started.</p>
          </div>
        )
      }

      if (todaySessions.length === 0) {
        return (
          <div className="today-class">
            <header>
              <span className="today-date">
                {new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(new Date())}
              </span>
              <span className="teacher-name">
                <i className="bx bxs-user" />
                {teacherName}
              </span>
            </header>
            <div className="empty-widget">
              <i className="bx bx-calendar-check" />
              <p>No sessions scheduled for today.</p>
            </div>
            <button
              className="widget-link"
              type="button"
              onClick={() => {
                // 다음 세션으로 이동하거나 대시보드 유지
                const nextSession = sessions
                  .filter((s) => new Date(s.date) > today)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
                if (nextSession) {
                  navigate(`/teacher/session/${nextSession.id}`)
                }
              }}
            >
              View upcoming sessions <i className="bx bx-right-arrow-alt" />
            </button>
          </div>
        )
      }

      return (
        <div className="today-class">
          <header>
            <span className="today-date">
              {new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(new Date())}
            </span>
            <span className="teacher-name">
              <i className="bx bxs-user" />
              {teacherName}
            </span>
          </header>
          <ul>
            {todaySessions.slice(0, 5).map((session) => (
              <li key={session.id}>
                <span className="time-badge">
                  {new Date(session.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="class-details">
                  <h4>{session.title}</h4>
                  <p>{session.agenda || 'Add a short overview for this session.'}</p>
                  <span className={`status ${session.status ?? 'draft'}`}>
                    {session.status === 'live'
                      ? 'Live'
                      : session.status === 'archived'
                        ? 'Finished'
                        : 'Scheduled'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {todaySessions.length > 5 && (
            <button
              className="widget-link"
              type="button"
              onClick={() => {
                // 첫 번째 세션으로 이동
                if (todaySessions[0]) {
                  navigate(`/teacher/session/${todaySessions[0].id}`)
                }
              }}
            >
              View all today's sessions ({todaySessions.length}) <i className="bx bx-right-arrow-alt" />
            </button>
          )}
        </div>
      )
    },
  },
]

const widgetDefinitionMap = new Map(TEACHER_WIDGET_DEFINITIONS.map((definition) => [definition.widgetId, definition]))

const DEFAULT_WIDGET_PREFERENCES = TEACHER_WIDGET_DEFINITIONS.map((definition) => ({
  widgetId: definition.widgetId,
  order: definition.defaultOrder,
  isVisible: definition.defaultVisible,
  size: definition.defaultSize,
  settings: definition.defaultSettings ?? {},
})).sort((a, b) => a.order - b.order)

const widgetSizeLabelMap: Record<WidgetSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
}

const resequencePreferences = (preferences: ResolvedWidgetPreference<Record<string, unknown>>[]) => {
  const visible = preferences.filter((pref) => pref.isVisible).sort((a, b) => a.order - b.order)
  const hidden = preferences.filter((pref) => !pref.isVisible).sort((a, b) => a.order - b.order)

  let order = 1
  const updatedVisible = visible.map((pref) => ({
    ...pref,
    order: order++,
  }))
  const updatedHidden = hidden.map((pref) => ({
    ...pref,
    order: order++,
  }))

  return [...updatedVisible, ...updatedHidden]
}

const getWidgetCardClass = (size: WidgetSize, isEditMode: boolean) => {
  const base = 'widget-card'
  // 모든 위젯은 동일한 크기 사용
  return `${base} widget-card--medium ${isEditMode ? 'widget-card--edit' : ''}`
}

type EditableWidgetCardProps = {
  preference: ResolvedWidgetPreference<Record<string, unknown>>
  definition: TeacherWidgetDefinition
  context: TeacherWidgetRenderContext
  onToggleVisibility: (widgetId: string) => void
}

type EditableWidgetCardPropsWithDrag = Omit<EditableWidgetCardProps, 'onSizeChange'> & {
  activeDragId: string | null
  dragOverId: string | null
  visibleDraft: Array<{ widgetId: string }>
}

const EditableWidgetCard = ({
  preference,
  definition,
  context,
  onToggleVisibility,
  activeDragId,
  dragOverId,
  visibleDraft,
}: EditableWidgetCardPropsWithDrag) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: preference.widgetId,
  })
  
  // 드래그 중일 때는 CSS 애니메이션으로 떨림 효과를 주고, transform은 CSS에서 처리
  const style: CSSProperties = {
    transform: isDragging 
      ? CSS.Transform.toString(transform) // scale과 shake는 CSS 애니메이션에서 처리
      : CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 1000 : 1,
    filter: isDragging ? 'drop-shadow(0 40px 80px rgba(0, 0, 0, 0.9)) brightness(1.1)' : 'none',
    // 드래그 위치는 transform으로, 떨림은 CSS 애니메이션으로
    transformOrigin: isDragging ? 'center center' : undefined,
  }

  // 드롭 위치 미리보기 (다른 위젯 위에 호버 중일 때)
  const isDragOver = dragOverId === preference.widgetId && activeDragId !== preference.widgetId
  
  // 드롭 위치 계산: 현재 위젯이 드롭 위치보다 앞에 있는지 확인
  const currentIndex = visibleDraft.findIndex((p) => p.widgetId === preference.widgetId)
  const dragOverIndex = dragOverId ? visibleDraft.findIndex((p) => p.widgetId === dragOverId) : -1
  const activeIndex = activeDragId ? visibleDraft.findIndex((p) => p.widgetId === activeDragId) : -1
  
  // 드롭 위치가 현재 위젯 앞에 있고, 드래그 중인 위젯이 현재 위젯 뒤에 있으면 공간 표시
  const showDropSpaceBefore = activeDragId && 
    dragOverIndex !== -1 && 
    currentIndex !== -1 && 
    activeIndex !== -1 &&
    dragOverIndex < currentIndex && 
    activeIndex >= currentIndex &&
    !isDragging &&
    !isDragOver
  
  // 드롭 위치가 현재 위젯 뒤에 있고, 드래그 중인 위젯이 현재 위젯 앞에 있으면 공간 표시
  const showDropSpaceAfter = activeDragId && 
    dragOverIndex !== -1 && 
    currentIndex !== -1 && 
    activeIndex !== -1 &&
    dragOverIndex > currentIndex && 
    activeIndex <= currentIndex &&
    !isDragging &&
    !isDragOver

  return (
    <>
      {/* 드롭 위치 표시 - 위젯 앞에 공간 표시 */}
      {showDropSpaceBefore && (
        <div className="widget-drop-indicator" />
      )}
      <div
        ref={setNodeRef}
        style={style}
        className={`${getWidgetCardClass(preference.size, true)} ${isDragging ? 'widget-card--dragging' : ''} ${isDragOver ? 'widget-card--drag-over' : ''}`}
        data-widget-id={preference.widgetId}
        data-accent={definition.accentColor}
      >
      {/* 드래그 핸들 - 편집 모드에서만 표시 */}
      {!isDragging && (
        <div 
          className="widget-drag-handle"
          {...attributes} 
          {...listeners}
        >
          <i className="bx bx-move" />
          <span>드래그하여 이동</span>
        </div>
      )}
      {isDragging && (
        <div className="widget-drag-handle widget-drag-handle--active">
          <i className="bx bx-move" />
          <span>이동 중...</span>
        </div>
      )}

      <div className="widget-card__header">
        <div className="widget-card__icon" style={{ background: definition.accentColor }}>
          <i className={definition.icon} />
        </div>
        <div className="widget-card__title">
          <h3>{definition.title}</h3>
          {definition.description && <p>{definition.description}</p>}
        </div>
        <div className="widget-card__actions">
          <button
            type="button"
            className="widget-action-btn"
            onClick={() => onToggleVisibility(preference.widgetId)}
            title="위젯 숨기기"
          >
            <i className="bx bx-hide" />
          </button>
        </div>
      </div>

      <div className="widget-card__body">{definition.render(context)}</div>
    </div>
      {/* 드롭 위치 표시 - 위젯 뒤에 공간 표시 */}
      {(isDragOver || showDropSpaceAfter) && (
        <div className="widget-drop-indicator" />
      )}
    </>
  )
}

type ViewWidgetCardProps = {
  preference: ResolvedWidgetPreference<Record<string, unknown>>
  definition: TeacherWidgetDefinition
  context: TeacherWidgetRenderContext
}

const ViewWidgetCard = ({ preference, definition, context }: ViewWidgetCardProps) => (
  <article
    className={getWidgetCardClass(preference.size, false)}
    data-widget-id={preference.widgetId}
    data-accent={definition.accentColor}
  >
    <div className="widget-card__header">
      <div className="widget-card__icon" style={{ background: definition.accentColor }}>
        <i className={definition.icon} />
      </div>
      <div className="widget-card__title">
        <h3>{definition.title}</h3>
        {definition.description && <p>{definition.description}</p>}
      </div>
    </div>
    <div className="widget-card__body">{definition.render(context)}</div>
  </article>
)

type AddWidgetCardProps = {
  onAdd: () => void
  hasHiddenWidgets: boolean
}

const AddWidgetCard = ({ onAdd, hasHiddenWidgets }: AddWidgetCardProps) => {
  return (
    <article className={`widget-card widget-card--add ${hasHiddenWidgets ? '' : 'widget-card--add--disabled'}`}>
      <button
        type="button"
        className="add-widget-button"
        onClick={onAdd}
        disabled={!hasHiddenWidgets}
        aria-disabled={!hasHiddenWidgets}
      >
        <i className="bx bx-plus-circle text-4xl" />
        <span className="text-lg font-semibold">위젯 추가하기</span>
        <span className="text-sm text-slate-400">
          {hasHiddenWidgets ? '숨겨진 위젯을 추가할 수 있습니다' : '모든 위젯이 이미 표시되어 있습니다'}
        </span>
      </button>
      {!hasHiddenWidgets && (
        <p className="add-widget-helper text-xs text-slate-500">
          위젯을 숨기면 여기서 다시 추가할 수 있습니다.
        </p>
      )}
    </article>
  )
}

type WidgetPickerOption = {
  widgetId: string
  title: string
  description?: string
  icon?: string
  accentColor?: string
}

type WidgetPickerProps = {
  isOpen: boolean
  options: WidgetPickerOption[]
  onClose: () => void
  onAdd: (widgetId: string) => void
}

const WidgetPicker = ({ isOpen, options, onClose, onAdd }: WidgetPickerProps) => {
  if (!isOpen) return null
  return (
    <div className="widget-picker-overlay" role="dialog" aria-modal="true">
      <div className="widget-picker">
        <header className="widget-picker__header">
          <div>
            <h4>Select a widget to add</h4>
            <p>Restore hidden widgets or build the layout with saved templates.</p>
          </div>
          <button type="button" className="ghost-button" onClick={onClose} aria-label="Close widget picker">
            Close
          </button>
        </header>
        {options.length > 0 ? (
          <div className="widget-picker__grid">
            {options.map((option) => (
              <button
                type="button"
                key={option.widgetId}
                className="widget-picker__option"
                onClick={() => onAdd(option.widgetId)}
              >
                <div
                  className="widget-picker__icon"
                  style={option.accentColor ? { background: option.accentColor } : undefined}
                >
                  <i className={option.icon ?? 'bx bx-extension'} />
                </div>
                <div className="widget-picker__content">
                  <strong>{option.title}</strong>
                  {option.description && <span>{option.description}</span>}
                </div>
                <i className="bx bx-plus" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <div className="widget-picker__empty">
            <i className="bx bx-layout" />
            <p>No hidden widgets yet. Hide a widget to bring it back from here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'bx bxs-home' },
  { id: 'activity', label: 'Activity', icon: 'bx bxs-grid-alt' },
  { id: 'chat', label: 'Chat', icon: 'bx bxs-chat' },
  { id: 'cloud', label: 'Cloud', icon: 'bx bxs-cloud' },
  { id: 'quiz', label: 'Quiz', icon: 'bx bxs-brain' },
  { id: 'materials', label: 'Materials', icon: 'bx bxs-folder' },
  { id: 'settings', label: 'Settings', icon: 'bx bxs-cog' },
]

export const TeacherOverview = () => {
  const { user } = useAuth()
  const canManageClassroom = Boolean(user && ['teacher', 'assistant', 'admin'].includes(user.role))

  if (!user || !canManageClassroom) {
    return (
      <section className="teacher-overview__empty">
        <header>
          <h2>Educator Control Hub</h2>
          <p>Sign in with a teacher, assistant, or admin role to manage classes and sessions.</p>
        </header>
        <EmptyState
          title="Additional permission required"
          description="Please sign in with a teacher/assistant/admin account and try again."
        />
      </section>
    )
  }

  return <TeacherOverviewContent user={user} />
}

type TeacherOverviewContentProps = {
  user: AuthUser
}

const TeacherOverviewContent = ({ user }: TeacherOverviewContentProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState<string>('dashboard')

  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const selectedSessionId = useUIStore((state) => state.selectedSessionId)
  const setSelectedClassId = useUIStore((state) => state.setSelectedClassId)
  const setSelectedSessionId = useUIStore((state) => state.setSelectedSessionId)
  const initializeSelection = useUIStore((state) => state.initializeSelection)

  const { data: classrooms, isLoading: isClassroomsLoading } = useClassroomsQuery()
  const hasClassrooms = (classrooms?.length ?? 0) > 0
  const manageableClassrooms = useMemo(() => {
    if (!classrooms) return []
    if (user.role === 'admin' || user.role === 'assistant') return classrooms
    return classrooms.filter((classroom) => classroom.ownerId === user.id)
  }, [classrooms, user])
  const hasManageableClassrooms = manageableClassrooms.length > 0
  const showEmptyGuide = !isClassroomsLoading && !hasClassrooms


  useEffect(() => {
    const classIdFromURL = searchParams.get('classId')
    const sessionIdFromURL = searchParams.get('sessionId')
    if (classIdFromURL || sessionIdFromURL) {
      initializeSelection({ classId: classIdFromURL, sessionId: sessionIdFromURL })
    }
  }, [initializeSelection, searchParams])

  // 클래스가 선택되지 않았을 때는 자동으로 알림 모달이 표시됨
  useEffect(() => {
    if (!isClassroomsLoading && hasManageableClassrooms && !selectedClassId && !isClassSelectorOpen) {
      // 알림 모달이 표시되도록 함 (조건부 렌더링으로 처리)
    }
  }, [isClassroomsLoading, hasManageableClassrooms, selectedClassId, isClassSelectorOpen])

  useEffect(() => {
    if (!hasManageableClassrooms && selectedClassId) {
      setSelectedClassId(null)
    }
  }, [hasManageableClassrooms, selectedClassId, setSelectedClassId])

  const { data: classroom, isLoading: isClassroomLoading } = useClassroomDetailQuery(selectedClassId ?? '')
  const { data: members, isLoading: isMembersLoading } = useClassroomMembersQuery(selectedClassId ?? '')
  const { data: sessions, isLoading: isSessionsLoading } = useClassroomSessionsQuery(selectedClassId ?? '')
  const teacherMembership = useMemo(() => {
    if (!members) return null
    return members.find((member) => member.userId === user.id) ?? null
  }, [members, user.id])
  const canManageSelectedClassroom = useMemo(() => {
    if (user.role === 'admin') return true
    if (!teacherMembership) return false
    return ['teacher', 'assistant'].includes(teacherMembership.role)
  }, [teacherMembership, user.role])

  useEffect(() => {
    if (!isSessionsLoading && sessions?.length && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id)
    }
  }, [isSessionsLoading, sessions, selectedSessionId, setSelectedSessionId])


  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedClassId) {
      params.set('classId', selectedClassId)
    }
    if (selectedSessionId) {
      params.set('sessionId', selectedSessionId)
    }
    navigate({ pathname: '/teacher', search: params.toString() }, { replace: true })
  }, [selectedClassId, selectedSessionId, navigate])

  const teacherName = useMemo(() => {
    if (members?.length) {
      const primaryTeacher = members.find((member) => member.role === 'teacher')
      if (primaryTeacher) {
        return primaryTeacher.userId
      }
    }
    return user.displayName || user.email || 'teacher-1'
  }, [members, user.displayName, user.email])

  const {
    preferences: widgetPreferences,
    orderedVisibleWidgets,
    isLoading: isWidgetLoading,
    savePreferences: persistWidgetPreferences,
  } = useDashboardWidgetsPreferences<Record<string, unknown>>({
    classId: selectedClassId ?? null,
    definitions: TEACHER_WIDGET_DEFINITIONS,
  })

  const [isEditMode, setIsEditMode] = useState(false)
  const [draftPreferences, setDraftPreferences] = useState(widgetPreferences)
  const [isSavingWidgets, setIsSavingWidgets] = useState(false)
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState(false)
  const [isClassSelectorOpen, setIsClassSelectorOpen] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditMode) {
      setDraftPreferences(widgetPreferences)
    }
  }, [widgetPreferences, isEditMode])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const visibleDraft = useMemo(
    () => draftPreferences.filter((pref) => pref.isVisible).sort((a, b) => a.order - b.order),
    [draftPreferences],
  )

  const hiddenDraft = useMemo(
    () => draftPreferences.filter((pref) => !pref.isVisible).sort((a, b) => a.order - b.order),
    [draftPreferences],
  )

  const hiddenWidgetOptions = useMemo<WidgetPickerOption[]>(() => {
    const options: WidgetPickerOption[] = []
    hiddenDraft.forEach((widget) => {
      const definition = widgetDefinitionMap.get(widget.widgetId)
      if (!definition) {
        return
      }
      options.push({
        widgetId: widget.widgetId,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        accentColor: definition.accentColor,
      })
    })
    return options
  }, [hiddenDraft])

  useEffect(() => {
    if (isWidgetPickerOpen && hiddenWidgetOptions.length === 0) {
      setIsWidgetPickerOpen(false)
    }
  }, [hiddenWidgetOptions, isWidgetPickerOpen])

  const widgetContext = useMemo<TeacherWidgetRenderContext>(
    () => ({
      members,
      isMembersLoading,
      sessions,
      isSessionsLoading,
      teacherName,
      navigate,
      selectedClassId,
      selectedSessionId,
    }),
    [members, isMembersLoading, sessions, isSessionsLoading, teacherName, navigate, selectedClassId, selectedSessionId],
  )

  const normalizedDraft = useMemo(
    () =>
      resequencePreferences(
        draftPreferences.map((pref) => ({
          ...pref,
        })),
      ),
    [draftPreferences],
  )

  const normalizedStored = useMemo(
    () =>
      resequencePreferences(
        widgetPreferences.map((pref) => ({
          ...pref,
        })),
      ),
    [widgetPreferences],
  )

  const hasWidgetChanges = useMemo(
    () => JSON.stringify(normalizedDraft) !== JSON.stringify(normalizedStored),
    [normalizedDraft, normalizedStored],
  )

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Copied the current view link to your clipboard.')
    } catch (error) {
      handleError(error, { component: 'TeacherOverview', action: 'copyLink' })
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    if (!isEditMode) return
    setActiveDragId(event.active.id as string)
    // 드래그 시작 시 body에 클래스 추가
    document.body.classList.add('widget-dragging-active')
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (!isEditMode) return
    const { active, over } = event
    if (!over) {
      setDragOverId(null)
      return
    }
    
    // 드롭 위치 계산
    const activeId = active.id as string
    const overId = over.id as string
    
    if (activeId === overId) {
      setDragOverId(null)
      return
    }
    
    setDragOverId(overId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    // 드래그 종료 시 body 클래스 제거 및 상태 초기화
    document.body.classList.remove('widget-dragging-active')
    setActiveDragId(null)
    setDragOverId(null)
    
    if (!isEditMode) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = visibleDraft.findIndex((item) => item.widgetId === active.id)
    const newIndex = visibleDraft.findIndex((item) => item.widgetId === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reorderedVisible = arrayMove(visibleDraft, oldIndex, newIndex).map((pref, index) => ({
      ...pref,
      order: index + 1,
    }))
    const hidden = draftPreferences.filter((pref) => !pref.isVisible)
    const merged = resequencePreferences([...reorderedVisible, ...hidden])
    setDraftPreferences(merged)
  }

  const handleHideWidget = (widgetId: string) => {
    const updated = draftPreferences.map((pref) => (pref.widgetId === widgetId ? { ...pref, isVisible: false } : pref))
    setDraftPreferences(resequencePreferences(updated))
  }

  const handleShowWidget = (widgetId: string) => {
    const updated = draftPreferences.map((pref) => (pref.widgetId === widgetId ? { ...pref, isVisible: true } : pref))
    setDraftPreferences(resequencePreferences(updated))
  }

  // 크기 변경 기능 제거 - 모든 위젯은 동일한 크기 사용

  const handleRestoreDefaults = () => {
    setDraftPreferences(
      DEFAULT_WIDGET_PREFERENCES.map((pref) => ({
        ...pref,
      })),
    )
  }

  const handleSaveLayout = async () => {
    const prepared = resequencePreferences(draftPreferences)
    try {
      setIsSavingWidgets(true)
      await persistWidgetPreferences(prepared)
      toast.success('위젯 설정이 저장되었습니다.')
      setIsEditMode(false)
    } catch (error) {
      handleError(error, { component: 'TeacherOverview', action: 'saveWidgetLayout' })
      toast.error('위젯 설정 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSavingWidgets(false)
    }
  }


  return (
    <div className="flex min-h-screen bg-surface-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Navbar />
        <main id="main-content" className="flex-1 p-6" tabIndex={-1}>
    <section className="teacher-dashboard">
      <aside className="teacher-dashboard__sidebar hidden">
        <div className="sidebar__header">
          <div className="brand">
            <i className="bx bxs-graduation" />
            <span>ClassBoard</span>
          </div>
        </div>
        <nav className="sidebar__menu">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? 'menu-button is-active' : 'menu-button'}
              onClick={() => setActiveSection(item.id)}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="teacher-dashboard__main">
        <header className="teacher-dashboard__navbar hidden">
          <div className="navbar__left">
            <div className="navbar-select">
              <label htmlFor="class-select">
                <i className="bx bxs-school" />
                Class
              </label>
              <select
                id="class-select"
                value={selectedClassId ?? ''}
                onChange={(event) => setSelectedClassId(event.target.value || null)}
              >
                <option value="">Select a class</option>
                {classrooms?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="navbar-select">
              <label htmlFor="session-select">
                <i className="bx bxs-calendar" />
                Session
              </label>
              <select
                id="session-select"
                value={selectedSessionId ?? ''}
                onChange={(event) => setSelectedSessionId(event.target.value || null)}
                disabled={!sessions?.length}
              >
                <option value="">Select a session</option>
                {sessions?.map((session) => (
                  <option key={session.id} value={session.id}>
                    Lesson {session.number} - {session.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="navbar__right">
            <div className="search-box">
              <i className="bx bx-search" />
              <input placeholder="Search..." />
            </div>
            <button type="button" className="ghost-button" onClick={handleShareLink} disabled={!hasClassrooms}>
              <i className="bx bx-link-alt" />
              Copy link
            </button>
          </div>
        </header>

        <main className="teacher-dashboard__content">
          {/* 클래스 선택 모달들 - 클래스가 선택되지 않았을 때만 표시 */}
          {!isClassroomsLoading && !selectedClassId && hasManageableClassrooms && (
            <>
              {/* 알림 모달 - 상세 모달이 열려있지 않을 때만 표시 */}
              {!isClassSelectorOpen && (
                <ClassSelectAlertModal
                  isOpen={true}
                  onConfirm={() => {
                    // 확인 버튼을 누르면 클래스 선택 상세 모달 열기
                    setIsClassSelectorOpen(true)
                  }}
                />
              )}

              {/* 클래스 선택 상세 모달 */}
              {isClassSelectorOpen && (
                <ClassSelectorModal
                  isOpen={true}
                  onClose={() => {
                    // 클래스를 선택하지 않고 닫으면 알림 모달 다시 열기
                    setIsClassSelectorOpen(false)
                  }}
                />
              )}
            </>
          )}


          {hasManageableClassrooms && !showEmptyGuide && (
            <section className="dashboard-screen" hidden={activeSection !== 'dashboard'}>
              <header className="dashboard-screen__header">
                <div>
                  <h1>{isClassroomLoading ? 'Loading class...' : classroom?.name ?? 'Educator Control Hub'}</h1>
                </div>
                <div className="dashboard-screen__actions">
                  {/* 위젯 편집 토글 버튼 */}
                  <button
                    type="button"
                    className={`widget-edit-toggle ${isEditMode ? 'active' : ''}`}
                    onClick={() => {
                      if (isEditMode) {
                        // 편집 모드 종료 시 변경사항 저장
                        if (hasWidgetChanges) {
                          handleSaveLayout()
                        } else {
                          setIsEditMode(false)
                        }
                      } else {
                        // 편집 모드 시작
                        setDraftPreferences(widgetPreferences)
                        setIsEditMode(true)
                      }
                    }}
                    disabled={isWidgetLoading}
                    title={isEditMode ? '편집 모드 종료' : '위젯 편집 모드'}
                  >
                    <i className={isEditMode ? 'bx bx-check' : 'bx bx-customize'} />
                    <span>{isEditMode ? '편집 완료' : '위젯 편집'}</span>
                  </button>

                  {/* 편집 모드일 때만 표시되는 액션 버튼들 */}
                  {isEditMode && (
                    <>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={handleRestoreDefaults}
                        title="기본 레이아웃으로 복원"
                      >
                        <i className="bx bx-reset" />
                        <span className="hidden md:inline">기본값 복원</span>
                      </button>
                      {hasWidgetChanges && (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={handleSaveLayout}
                          disabled={isSavingWidgets}
                        >
                          {isSavingWidgets ? (
                            <>
                              <i className="bx bx-loader-alt bx-spin" />
                              <span>저장 중...</span>
                            </>
                          ) : (
                            <>
                              <i className="bx bx-save" />
                              <span>변경사항 저장</span>
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </header>

              {isWidgetLoading ? (
                <div className="widget-grid">
                  <Skeleton className="h-44" />
                  <Skeleton className="h-44" />
                  <Skeleton className="h-44" />
                  <Skeleton className="h-44" />
                </div>
              ) : isEditMode ? (
                <>
                  <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={visibleDraft.map((widget) => widget.widgetId)}>
                      <div className="widget-grid">
                        {visibleDraft.length === 0 ? (
                          <div className="empty-widget">
                            <i className="bx bx-layout text-6xl" />
                            <p className="text-lg">표시된 위젯이 없습니다.</p>
                            <p className="text-sm text-slate-400">위젯 추가하기 버튼을 눌러 위젯을 추가하세요.</p>
                          </div>
                        ) : (
                          visibleDraft.map((preference) => {
                            const definition = widgetDefinitionMap.get(preference.widgetId)
                            if (!definition) return null
                            return (
                                <EditableWidgetCard
                                  key={preference.widgetId}
                                  preference={preference}
                                  definition={definition}
                                  context={widgetContext}
                                  onToggleVisibility={handleHideWidget}
                                  activeDragId={activeDragId}
                                  dragOverId={dragOverId}
                                  visibleDraft={visibleDraft}
                                />
                            )
                          })
                        )}
                        <AddWidgetCard
                          onAdd={() => setIsWidgetPickerOpen(true)}
                          hasHiddenWidgets={hiddenDraft.length > 0}
                        />
                      </div>
                    </SortableContext>
                  </DndContext>

                  <WidgetPicker
                    isOpen={isWidgetPickerOpen}
                    options={hiddenWidgetOptions}
                    onClose={() => setIsWidgetPickerOpen(false)}
                    onAdd={(widgetId) => {
                      handleShowWidget(widgetId)
                      setIsWidgetPickerOpen(false)
                    }}
                  />
                </>
              ) : orderedVisibleWidgets.length > 0 ? (
                <div className="widget-grid">
                  {orderedVisibleWidgets.map((preference) => {
                    const definition = widgetDefinitionMap.get(preference.widgetId)
                    if (!definition) return null
                    return (
                      <ViewWidgetCard
                        key={preference.widgetId}
                        preference={preference}
                        definition={definition}
                        context={widgetContext}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="empty-widget">
                  <i className="bx bx-layout" />
                  <p>No widgets are visible. Open the editor to add the cards you need.</p>
                </div>
              )}
            </section>
          )}

          <section className="placeholder-section" hidden={activeSection !== 'activity'}>
            <EmptyState
              title="Activity tools are on the way."
              description="We are migrating the Padlet-style board into React components."
            />
          </section>
          <section className="placeholder-section" hidden={activeSection !== 'chat'}>
            <EmptyState
              title="Chat workspace is coming soon."
              description="The real-time chat interface is being rebuilt for the SPA experience."
            />
          </section>
          <section className="placeholder-section" hidden={activeSection !== 'cloud'}>
            <EmptyState
              title="Cloud view is under construction."
              description="Word cloud visualisations are being ported to React."
            />
          </section>
          <section className="placeholder-section" hidden={activeSection !== 'quiz'}>
            <EmptyState
              title="Quiz area is in progress."
              description="The AI-assisted grading workflow is being transitioned to React."
            />
          </section>
          <section className="placeholder-section" hidden={activeSection !== 'materials'}>
            <EmptyState
              title="Materials library is not ready yet."
              description="We are rebuilding the learning material management screen for the SPA."
            />
          </section>
          <section className="placeholder-section" hidden={activeSection !== 'settings'}>
            <EmptyState
              title="Settings panel is being prepared."
              description="ClassBoard configuration screens are currently in development."
            />
          </section>
        </main>
      </div>
    </section>
        </main>
      </div>
    </div>
  )
}
