import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useActivityPostsQuery, useCreateActivityPostMutation, useAuth } from '../hooks'
import { useUIStore } from '../stores'
import { getUserFriendlyMessage, handleError } from '../lib/error-handler'
import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'

export const ActivityPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const selectedClassId = useUIStore((state) => state.selectedClassId)
  const selectedSessionId = useUIStore((state) => state.selectedSessionId)

  const [postContent, setPostContent] = useState('')
  const [postAttachments, setPostAttachments] = useState<File[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const { data: posts, isLoading: isPostsLoading } = useActivityPostsQuery(
    selectedClassId ?? '',
    selectedSessionId ?? '',
  )
  const createPostMutation = useCreateActivityPostMutation()

  useEffect(() => {
    if (!selectedClassId || !selectedSessionId) {
      toast.error('클래스와 세션을 선택해주세요.')
      navigate('/teacher')
    }
  }, [selectedClassId, selectedSessionId, navigate])

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPostAttachments((prev) => [...prev, ...files])
  }

  const handleRemoveAttachment = (index: number) => {
    setPostAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedClassId || !selectedSessionId) {
      toast.error('클래스와 세션을 선택해주세요.')
      return
    }
    if (!postContent.trim() && postAttachments.length === 0) {
      toast.error('내용 또는 이미지를 입력해주세요.')
      return
    }

    try {
      await createPostMutation.mutateAsync({
        classId: selectedClassId,
        sessionId: selectedSessionId,
        data: {
          text: postContent.trim(),
          authorId: user?.id || '',
          authorName: user?.displayName || '익명',
        },
        attachments: postAttachments.length > 0 ? postAttachments : undefined,
      })
      toast.success('게시글이 등록되었습니다.')
      setPostContent('')
      setPostAttachments([])
      setIsModalOpen(false)
    } catch (error) {
      handleError(error, { component: 'ActivityPage', action: 'createPost' })
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
          <div className="activity-page-container">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">공유 메모보드</h1>
                <p className="mt-1 text-slate-400">수업 아이디어를 함께 정리해보세요</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-white transition hover:bg-brand-600"
              >
                <i className="bx bx-plus" />
                새 메모
              </button>
            </header>

            {isPostsLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : !posts || posts.length === 0 ? (
              <EmptyState
                title="아직 게시글이 없습니다"
                description="첫 번째 게시글을 작성해보세요!"
                icon={<i className="bx bx-note text-6xl text-slate-400" />}
              />
            ) : (
              <div className="activity-board grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="activity-post rounded-lg border border-slate-700 bg-slate-800 p-4 transition hover:border-brand-500"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500">
                          <i className="bx bx-user text-sm text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{post.authorName}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(post.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {post.text && (
                      <p className="mb-3 text-sm text-slate-300">{post.text}</p>
                    )}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        {post.images.map((imageUrl, idx) => (
                          <img
                            key={idx}
                            src={imageUrl}
                            alt={`첨부 이미지 ${idx + 1}`}
                            className="h-24 w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Post Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">새 메모 작성</h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 transition hover:text-white"
                  >
                    <i className="bx bx-x text-2xl" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="무엇을 공유하고 싶으신가요?"
                      rows={5}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-600"
                    >
                      <i className="bx bx-image" />
                      이미지 추가
                    </button>
                    {postAttachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {postAttachments.map((file, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`미리보기 ${idx + 1}`}
                              className="h-20 w-20 rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                            >
                              <i className="bx bx-x text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-slate-700 bg-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-600"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={createPostMutation.isPending}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
                    >
                      {createPostMutation.isPending ? '게시 중...' : '게시하기'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

