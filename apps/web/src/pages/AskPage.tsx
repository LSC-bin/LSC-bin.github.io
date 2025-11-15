import { FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useChatMessagesQuery,
  useSendChatMessageMutation,
  useQuestionsQuery,
  useCreateQuestionMutation,
  useAuth,
} from '../hooks'
import { useUIStore } from '../stores'
import { getUserFriendlyMessage, handleError } from '../lib/error-handler'
import { renderWordCloud, extractWordsFromMessages } from '../lib/wordcloud'
import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'

export const AskPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const selectedSessionId = useUIStore((state) => state.selectedSessionId)

  const [chatMessage, setChatMessage] = useState('')
  const [questionText, setQuestionText] = useState('')
  const chatMessagesEndRef = useRef<HTMLDivElement>(null)
  const wordCloudCanvasRef = useRef<HTMLCanvasElement>(null)

  const { data: chatMessages, isLoading: isChatLoading } = useChatMessagesQuery(
    selectedClassId ?? '',
    selectedSessionId ?? '',
  )
  const { data: questions, isLoading: isQuestionsLoading } = useQuestionsQuery(
    selectedClassId ?? '',
    selectedSessionId ?? '',
  )
  const sendChatMutation = useSendChatMessageMutation()
  const createQuestionMutation = useCreateQuestionMutation()

  useEffect(() => {
    if (!selectedClassId || !selectedSessionId) {
      toast.error('클래스와 세션을 선택해주세요.')
      navigate('/teacher')
    }
  }, [selectedClassId, selectedSessionId, navigate])

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  useEffect(() => {
    // WordCloud 렌더링
    const renderWordCloudFromMessages = () => {
      if (!wordCloudCanvasRef.current || !chatMessages) return

      // WordCloud2.js가 로드되지 않았다면 대기
      if (!window.WordCloud) {
        // index.html에서 로드되므로 짧은 지연 후 재시도
        setTimeout(renderWordCloudFromMessages, 100)
        return
      }

      // 캔버스 크기 설정
      const canvas = wordCloudCanvasRef.current
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth || 400
        canvas.height = container.offsetHeight || 400
      } else {
        canvas.width = 400
        canvas.height = 400
      }

      // 채팅 메시지에서 단어 추출
      const words = extractWordsFromMessages(chatMessages, 30)

      // WordCloud 렌더링
      renderWordCloud(canvas, words, {
        gridSize: 8,
        weightFactor: (size: number) => Math.pow(size, 2.3) / 1024,
        fontFamily: 'Noto Sans KR, sans-serif',
        color: (word: string, weight: number) => {
          const colors = ['#64748B', '#475569', '#3B82F6', '#2563EB', '#10B981', '#059669', '#F59E0B', '#EF4444']
          const index = Math.min(Math.floor(weight / 2), colors.length - 1)
          return colors[index]
        },
        rotateRatio: 0.3,
        rotationSteps: 2,
        backgroundColor: 'transparent',
        minSize: 8,
        shape: 'circle',
        ellipticity: 0.65,
      })
    }

    // 초기 렌더링 및 리사이즈 이벤트 처리
    renderWordCloudFromMessages()
    const handleResize = () => {
      renderWordCloudFromMessages()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [chatMessages])

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedClassId || !selectedSessionId) {
      toast.error('클래스와 세션을 선택해주세요.')
      return
    }
    if (!chatMessage.trim()) {
      toast.error('메시지를 입력해주세요.')
      return
    }

    try {
      await sendChatMutation.mutateAsync({
        classId: selectedClassId,
        sessionId: selectedSessionId,
        data: {
          text: chatMessage.trim(),
          authorId: user?.id || '',
          authorName: user?.displayName || '익명',
        },
      })
      setChatMessage('')
    } catch (error) {
      handleError(error, { component: 'AskPage', action: 'sendChat' })
      toast.error(getUserFriendlyMessage(error))
    }
  }

  const handleCreateQuestion = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedClassId || !selectedSessionId) {
      toast.error('클래스와 세션을 선택해주세요.')
      return
    }
    if (!questionText.trim()) {
      toast.error('질문을 입력해주세요.')
      return
    }

    try {
      await createQuestionMutation.mutateAsync({
        classId: selectedClassId,
        sessionId: selectedSessionId,
        data: {
          text: questionText.trim(),
          authorId: user?.id || '',
          authorName: user?.displayName || '익명',
        },
      })
      setQuestionText('')
      toast.success('질문이 등록되었습니다.')
    } catch (error) {
      handleError(error, { component: 'AskPage', action: 'createQuestion' })
      toast.error(getUserFriendlyMessage(error))
    }
  }

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
          <div className="ask-page-container">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-white">💬 실시간 WordCloud · Chat</h1>
              <p className="mt-1 text-slate-400">채팅 내용이 실시간 워드클라우드로 시각화되고 토론할 수 있는 공간입니다.</p>
            </header>

            <div className="ask-layout grid gap-4 lg:grid-cols-3">
              {/* Q&A Section */}
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <i className="bx bx-question-mark" />
                  질문 & 답변
                </h3>
                {isQuestionsLoading ? (
                  <Skeleton className="h-32" />
                ) : questions && questions.length > 0 ? (
                  <div className="space-y-2">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3"
                      >
                        <p className="text-sm text-white">{question.text}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                          <span>{question.authorName}</span>
                          <span>{new Date(question.createdAt).toLocaleString('ko-KR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="아직 질문이 없습니다"
                    description="첫 번째 질문을 작성해보세요!"
                    icon={<i className="bx bx-question-mark text-4xl text-slate-400" />}
                  />
                )}
                <form onSubmit={handleCreateQuestion} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="질문을 입력하세요..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={createQuestionMutation.isPending}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    <i className="bx bx-send" />
                  </button>
                </form>
              </div>

              {/* WordCloud Section */}
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <i className="bx bx-cloud" />
                  실시간 WordCloud
                </h3>
                <div className="flex h-96 items-center justify-center overflow-hidden rounded-lg bg-slate-900">
                  <canvas
                    ref={wordCloudCanvasRef}
                    className="h-full w-full"
                    style={{ maxHeight: '400px', minHeight: '300px' }}
                  />
                </div>
              </div>

              {/* Chat Section */}
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <i className="bx bxs-chat" />
                  실시간 채팅
                </h3>
                <div className="chat-window mb-4 max-h-96 space-y-2 overflow-y-auto">
                  {isChatLoading ? (
                    <Skeleton className="h-32" />
                  ) : chatMessages && chatMessages.length > 0 ? (
                    <>
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className="rounded-lg border border-slate-700 bg-slate-900 p-2"
                        >
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-medium">{message.authorName}</span>
                            <span>{new Date(message.createdAt).toLocaleTimeString('ko-KR')}</span>
                          </div>
                          <p className="mt-1 text-sm text-white">{message.text}</p>
                        </div>
                      ))}
                      <div ref={chatMessagesEndRef} />
                    </>
                  ) : (
                    <EmptyState
                      title="아직 메시지가 없습니다"
                      description="첫 번째 메시지를 보내보세요!"
                      icon={<i className="bx bxs-chat text-4xl text-slate-400" />}
                    />
                  )}
                </div>
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendChatMutation.isPending}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    <i className="bx bx-send" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

