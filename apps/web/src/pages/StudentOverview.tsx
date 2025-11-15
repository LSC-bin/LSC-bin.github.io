import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getUserFriendlyMessage, handleError } from '../lib/error-handler'

import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import {
  useActivityPostsQuery,
  useAuth,
  useCreateActivityPostMutation,
  useCreateQuestionMutation,
  useSendChatMessageMutation,
  useChatMessagesQuery,
  useClassroomDetailQuery,
  useClassroomMembersQuery,
  useClassroomSessionsQuery,
  useClassroomsQuery,
  useQuestionsQuery,
} from '../hooks'
import { useUIStore } from '../stores'

export const StudentOverview = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const selectedSessionId = useUIStore((state) => state.selectedSessionId)
  const setSelectedClassId = useUIStore((state) => state.setSelectedClassId)
  const setSelectedSessionId = useUIStore((state) => state.setSelectedSessionId)
  const initializeSelection = useUIStore((state) => state.initializeSelection)

  const { data: classrooms, isLoading: isClassroomsLoading } = useClassroomsQuery()
  const hasClassrooms = (classrooms?.length ?? 0) > 0
  const showEmptyGuide = !isClassroomsLoading && !hasClassrooms

  const [postContent, setPostContent] = useState('')
  const [postAttachments, setPostAttachments] = useState<File[]>([])
  const [questionContent, setQuestionContent] = useState('')
  const [chatContent, setChatContent] = useState('')
  const postAttachmentInputRef = useRef<HTMLInputElement | null>(null)

  const createPostMutation = useCreateActivityPostMutation()
  const createQuestionMutation = useCreateQuestionMutation()
  const sendChatMessageMutation = useSendChatMessageMutation()
  const { user } = useAuth()

  useEffect(() => {
    const classIdFromURL = searchParams.get('classId')
    const sessionIdFromURL = searchParams.get('sessionId')

    if (classIdFromURL || sessionIdFromURL) {
      initializeSelection({ classId: classIdFromURL, sessionId: sessionIdFromURL })
    }
  }, [initializeSelection, searchParams])

  useEffect(() => {
    if (!isClassroomsLoading && hasClassrooms && !selectedClassId) {
      setSelectedClassId(classrooms[0].id)
    }
  }, [isClassroomsLoading, hasClassrooms, classrooms, selectedClassId, setSelectedClassId])

  const { data: classroom } = useClassroomDetailQuery(selectedClassId ?? '')
  const { data: sessions, isLoading: isSessionsLoading } =
    useClassroomSessionsQuery(selectedClassId ?? '')
  const { data: members, isLoading: isMembersLoading } =
    useClassroomMembersQuery(selectedClassId ?? '')
  const userMembership = useMemo(() => {
    if (!members || !user) return null
    return members.find((member) => member.userId === user.id) ?? null
  }, [members, user?.id])
  const canBypassMembership = Boolean(
    user && ['teacher', 'assistant', 'admin'].includes(user.role),
  )
  const canParticipate = useMemo(() => {
    if (!user) return false
    if (canBypassMembership) return true
    if (!selectedClassId) return false
    if (isMembersLoading) return false
    if (!userMembership) return false
    return ['student', 'assistant', 'teacher'].includes(userMembership.role)
  }, [
    canBypassMembership,
    isMembersLoading,
    selectedClassId,
    user?.id,
    user?.role,
    userMembership?.role,
  ])

  useEffect(() => {
    if (!isSessionsLoading && sessions?.length && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id)
    }
  }, [isSessionsLoading, sessions, selectedSessionId, setSelectedSessionId])

  const { data: posts, isLoading: isPostsLoading } = useActivityPostsQuery(
    selectedClassId ?? '',
    selectedSessionId ?? '',
  )
  const { data: questions, isLoading: isQuestionsLoading } = useQuestionsQuery(
    selectedClassId ?? '',
    selectedSessionId ?? '',
  )
  const { data: chat, isLoading: isChatLoading } = useChatMessagesQuery(
    selectedClassId ?? '',
    selectedSessionId ?? '',
  )

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedClassId) {
      params.set('classId', selectedClassId)
    }
    if (selectedSessionId) {
      params.set('sessionId', selectedSessionId)
    }
    navigate({ pathname: '/student', search: params.toString() }, { replace: true })
  }, [selectedClassId, selectedSessionId, navigate])

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('현재 화면 링크를 복사했습니다.')
    } catch (error) {
      handleError(error, { component: 'StudentOverview', action: 'copyLink' })
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  const handlePostAttachmentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setPostAttachments(files)
  }

  const resetPostAttachments = () => {
    setPostAttachments([])
    if (postAttachmentInputRef.current) {
      postAttachmentInputRef.current.value = ''
    }
  }

  const ensureSignedIn = () => {
    if (!user) {
      toast.error('로그인 후 이용할 수 있는 기능입니다.')
      return false
    }
    if (canBypassMembership) {
      return true
    }
    if (!selectedClassId) {
      toast.error('클래스를 선택해주세요.')
      return false
    }
    if (isMembersLoading) {
      toast.error('구성원 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return false
    }
    if (!userMembership) {
      toast.error('이 클래스의 구성원이 아닙니다. 담당 교사에게 문의해주세요.')
      return false
    }
    return true
  }

  const getAuthorInfo = () => ({
    id: user?.id ?? 'anonymous',
    name: user?.displayName || user?.email || '익명 사용자',
  })

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h2 className="text-3xl font-bold text-white">학생 참여 환경</h2>
        <p className="text-sm text-slate-300">
          클래스 코드로 참여하고, 역할 기반으로 제한된 기능을 사용하는 학생 경험을 설계할 때 고려할
          요소들을 정리했습니다.
        </p>
        <div className="rounded-2xl bg-surface-900/80 px-4 py-3 text-xs text-slate-400">
          🔄 현재 화면은 Firestore 에뮬레이터 데모 데이터입니다. 실제 수업 데이터를 연결하려면{' '}
          <a
            href="../../docs/data-and-auth-plan.md"
            target="_blank"
            rel="noreferrer"
            className="text-brand-200 hover:text-brand-100"
            disabled={!hasClassrooms}
          >
            데이터/권한 설계 문서
          </a>
          와{' '}
          <a
            href="../../docs/feature-expansion-roadmap.md"
            target="_blank"
            rel="noreferrer"
            className="text-brand-200 hover:text-brand-100"
          >
            확장 기능 로드맵
          </a>
          을 참고하세요.
        </div>
        {showEmptyGuide && (
          <EmptyState
            title="Firestore에 클래스 데이터가 없습니다."
            description="에뮬레이터에 기본 클래스를 시드하면 학생 화면이 활성화됩니다."
          >
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                터미널에서{' '}
                <code className="rounded bg-surface-800/60 px-2 py-1 text-brand-200">npm run seed:firestore</code>
                를 실행하거나, 에뮬레이터 UI(127.0.0.1:4000)에서 직접 클래스를 생성하세요.
              </p>
              <p>데이터가 추가된 뒤 페이지를 새로 고치면 활동/질문/채팅 패널이 업데이트됩니다.</p>
            </div>
          </EmptyState>
        )}
      </header>

      {selectedClassId &&
        !isMembersLoading &&
        user &&
        !canParticipate &&
        !canBypassMembership && (
          <EmptyState
            title="이 클래스의 구성원이 아닙니다."
            description="수업 참여를 위해 담당 교사에게 클래스 코드 또는 초대 링크를 요청해주세요."
          />
        )}

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          클래스
          <select
            value={selectedClassId ?? ''}
            onChange={(event) => setSelectedClassId(event.target.value || null)}
            className="rounded-lg border border-slate-700 bg-surface-900 px-3 py-2 text-sm text-slate-100"
          >
            {isClassroomsLoading && <option value="">불러오는 중...</option>}
            {classrooms?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          세션
          <select
            value={selectedSessionId ?? ''}
            onChange={(event) => setSelectedSessionId(event.target.value || null)}
            className="rounded-lg border border-slate-700 bg-surface-900 px-3 py-2 text-sm text-slate-100"
            disabled={!sessions?.length}
          >
            {isSessionsLoading && <option value="">불러오는 중...</option>}
            {sessions?.map((session) => (
              <option key={session.id} value={session.id}>
                {session.number}차시 · {session.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={handleShareLink}
        className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-brand-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasClassrooms}
      >
        링크 복사
      </button>

      {!showEmptyGuide && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-surface-900/60 p-6">
              <h3 className="text-lg font-semibold text-white">핵심 지표</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>• 참여도: 활동/질문/채팅 기여도 추적</li>
                <li>• 과제 진행: 제출, 피드백, 재제출 흐름</li>
                <li>• 알림 수신: 수업 시작, 마감, 답변 알림</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-surface-900/60 p-6">
              <h3 className="text-lg font-semibold text-white">참고 리소스</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="../../docs/feature-expansion-roadmap.md"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-300 hover:text-brand-200"
                  >
                    확장 기능 로드맵
                  </a>
                </li>
                <li>
                  <a
                    href="../../docs/mobility-access-ops-plan.md"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-300 hover:text-brand-200"
                  >
                    모바일·접근성·운영 계획
                  </a>
                </li>
              </ul>
            </article>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-800 bg-surface-900/60 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-white">Padlet형 활동 최근 게시물</h3>
              <form
                className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-800/60 bg-surface-800/60 p-4"
                onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault()
                  if (!ensureSignedIn()) {
                    return
                  }
                  if (!selectedClassId || !selectedSessionId) {
                    toast.error('게시물을 작성할 클래스와 세션을 선택해주세요.')
                    return
                  }
                  if (!postContent.trim()) {
                    toast.error('게시물 내용을 입력해주세요.')
                    return
                  }
                  try {
                    const author = getAuthorInfo()
                    await createPostMutation.mutateAsync({
                      classId: selectedClassId,
                      sessionId: selectedSessionId,
                      data: {
                        authorId: author.id,
                        authorName: author.name,
                        text: postContent.trim(),
                      },
                      attachments: postAttachments,
                    })
                    setPostContent('')
                    resetPostAttachments()
                    toast.success('게시물을 등록했습니다.')
                  } catch (error) {
                    handleError(error, { component: 'StudentOverview', action: 'createPost' })
                    toast.error(getUserFriendlyMessage(error))
                  }
                }}
              >
                <label className="text-xs text-slate-400">
                  오늘의 생각이나 자료를 공유해보세요.
                  <textarea
                    value={postContent}
                    onChange={(event) => setPostContent(event.target.value)}
                    className="mt-2 min-h-[72px] w-full rounded-lg border border-slate-700 bg-surface-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
                    placeholder="예: 오늘 수업에서 기억에 남는 점을 적어보세요."
                    disabled={!canParticipate || isMembersLoading}
                  />
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
                    disabled={
                      !selectedClassId ||
                      !selectedSessionId ||
                      createPostMutation.isPending ||
                      !canParticipate ||
                      isMembersLoading
                    }
                  >
                    {createPostMutation.isPending ? '등록 중...' : '게시물 등록'}
                  </button>
                  <span className="text-[11px] text-slate-500">
                    로그인한 계정으로 게시 기록이 남습니다.
                  </span>
                </div>
                <label className="flex flex-col gap-2 text-xs text-slate-400">
                  이미지 첨부 (선택)
                  <input
                    ref={postAttachmentInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePostAttachmentsChange}
                    disabled={!canParticipate || isMembersLoading}
                    className="text-xs text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-brand-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-400 disabled:file:bg-slate-600 disabled:file:text-slate-300"
                  />
                  {postAttachments.length > 0 && (
                    <ul className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                      {postAttachments.map((file) => (
                        <li
                          key={`${file.name}-${file.lastModified}`}
                          className="rounded-full bg-surface-900/80 px-2 py-1"
                        >
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </form>
              {isPostsLoading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : posts?.length ? (
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {posts.map((post) => (
                    <li key={post.id} className="rounded-xl bg-surface-800/60 px-3 py-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{post.authorName}</span>
                        <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="mt-1 text-sm text-white">{post.text}</p>
                      {post.images?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {post.images.map((imageUrl) => (
                            <img
                              key={imageUrl}
                              src={imageUrl}
                              alt="활동 이미지"
                              className="h-20 w-20 rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title="등록된 게시물이 없습니다."
                    description="Padlet형 게시물이 생성되면 이곳에서 실시간으로 확인할 수 있습니다."
                  />
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-slate-800 bg-surface-900/60 p-6">
              <h3 className="text-lg font-semibold text-white">실시간 Q&A / 채팅</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
                    질문
                  </h4>
                  <form
                    className="mt-2 flex flex-col gap-3 rounded-lg border border-slate-800/60 bg-surface-800/60 p-3"
                    onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                      event.preventDefault()
                    if (!ensureSignedIn()) {
                      return
                    }
                      if (!selectedClassId || !selectedSessionId) {
                        toast.error('질문을 남길 클래스와 세션을 선택해주세요.')
                        return
                      }
                      if (!questionContent.trim()) {
                        toast.error('질문 내용을 입력해주세요.')
                        return
                      }
                      try {
                      const author = getAuthorInfo()
                        await createQuestionMutation.mutateAsync({
                          classId: selectedClassId,
                          sessionId: selectedSessionId,
                          data: {
                          authorId: author.id,
                          authorName: author.name,
                            text: questionContent.trim(),
                          },
                        })
                        setQuestionContent('')
                        toast.success('질문을 등록했습니다.')
                      } catch (error) {
                        handleError(error, { component: 'StudentOverview', action: 'createQuestion' })
                        toast.error(getUserFriendlyMessage(error))
                      }
                    }}
                  >
                    <textarea
                      value={questionContent}
                      onChange={(event) => setQuestionContent(event.target.value)}
                      className="min-h-[56px] rounded-lg border border-slate-700 bg-surface-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
                      placeholder="궁금한 점을 적어주세요."
                      disabled={!canParticipate || isMembersLoading}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
                        disabled={
                          !selectedClassId ||
                          !selectedSessionId ||
                          createQuestionMutation.isPending ||
                          !canParticipate ||
                          isMembersLoading
                        }
                      >
                        {createQuestionMutation.isPending ? '등록 중...' : '질문 등록'}
                      </button>
                      <span className="text-[11px] text-slate-500">
                        질문은 로그인한 사용자 정보로 저장됩니다.
                      </span>
                    </div>
                  </form>
                  {isQuestionsLoading ? (
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                    </div>
                  ) : questions?.length ? (
                    <ul className="mt-2 space-y-2">
                      {questions.map((question) => (
                        <li key={question.id} className="rounded-lg bg-surface-800/60 px-3 py-2">
                          <p className="text-sm text-white">{question.text}</p>
                          <span className="text-xs text-slate-400">👍 {question.upvotes}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      title="등록된 질문이 없습니다."
                      description="학생들이 질문을 남기면 이곳에서 실시간으로 확인할 수 있습니다."
                    />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
                    채팅
                  </h4>
                  <form
                    className="mt-2 flex flex-col gap-2 rounded-lg border border-slate-800/60 bg-surface-800/60 p-3"
                    onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                      event.preventDefault()
                    if (!ensureSignedIn()) {
                      return
                    }
                      if (!selectedClassId || !selectedSessionId) {
                        toast.error('채팅을 보낼 클래스와 세션을 선택해주세요.')
                        return
                      }
                      if (!chatContent.trim()) {
                        toast.error('채팅 내용을 입력해주세요.')
                        return
                      }
                      try {
                      const author = getAuthorInfo()
                        await sendChatMessageMutation.mutateAsync({
                          classId: selectedClassId,
                          sessionId: selectedSessionId,
                          data: {
                          authorId: author.id,
                          authorName: author.name,
                            text: chatContent.trim(),
                          },
                        })
                        setChatContent('')
                        toast.success('메시지를 전송했습니다.')
                      } catch (error) {
                        handleError(error, { component: 'StudentOverview', action: 'sendChatMessage' })
                        toast.error(getUserFriendlyMessage(error))
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={chatContent}
                        onChange={(event) => setChatContent(event.target.value)}
                        className="flex-1 rounded-lg border border-slate-700 bg-surface-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
                        placeholder="메시지를 입력하세요."
                        disabled={!canParticipate || isMembersLoading}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
                        disabled={
                          !selectedClassId ||
                          !selectedSessionId ||
                          sendChatMessageMutation.isPending ||
                          !canParticipate ||
                          isMembersLoading
                        }
                      >
                        {sendChatMessageMutation.isPending ? '전송 중...' : '전송'}
                      </button>
                    </div>
                  </form>
                  {isChatLoading ? (
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                    </div>
                  ) : chat?.length ? (
                    <ul className="mt-2 space-y-2">
                      {chat.map((message) => (
                        <li key={message.id} className="rounded-lg bg-surface-800/60 px-3 py-2">
                          <p className="text-xs text-slate-400">{message.authorName}</p>
                          <p className="text-sm text-white">{message.text}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      title="아직 채팅이 없습니다."
                      description="채팅이 시작되면 실시간으로 메시지가 표시됩니다."
                    />
                  )}
                </div>
              </div>
            </article>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-surface-900/60 p-6">
            <h3 className="text-lg font-semibold text-white">진행 예정 세션</h3>
            {isSessionsLoading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : sessions?.length ? (
              <ul className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-brand-200">
                {sessions.map((session) => (
                  <li key={session.id} className="rounded-full bg-surface-800/60 px-3 py-1 text-slate-200">
                    {session.number}차시 · {session.title}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="예정된 세션이 없습니다."
                  description="세션을 생성하면 학생들이 예정된 수업을 확인할 수 있습니다."
                />
              </div>
            )}
            {classroom && (
              <p className="mt-3 text-xs text-slate-400">
                현재 클래스: <span className="text-brand-200">{classroom.name}</span>
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}

