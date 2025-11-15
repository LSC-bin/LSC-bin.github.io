import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { handleError } from '../../lib/error-handler'

interface Announcement {
  id: string
  title: string
  body: string
  date: string
  createdAt: number
  read: boolean
}

const ANNOUNCEMENT_STORAGE_KEY = 'classboard-announcements-v1'

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    date: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = () => {
    try {
      const stored = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : []
      if (Array.isArray(parsed)) {
        const sorted = [...parsed].sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateB - dateA
        })
        setAnnouncements(sorted)
      }
    } catch (error) {
      handleError(error, { component: 'Announcements', action: 'loadAnnouncements' })
    }
  }

  const saveAnnouncements = (newAnnouncements: Announcement[]) => {
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(newAnnouncements))
      setAnnouncements(newAnnouncements)
    } catch (error) {
      handleError(error, { component: 'Announcements', action: 'saveAnnouncements' })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.body || !formData.date) {
      toast.error('모든 필드를 입력해주세요.')
      return
    }

    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      title: formData.title,
      body: formData.body,
      date: formData.date,
      createdAt: Date.now(),
      read: false,
    }

    const updated = [newAnnouncement, ...announcements]
    saveAnnouncements(updated)
    setIsModalOpen(false)
    setFormData({ title: '', body: '', date: new Date().toISOString().slice(0, 10) })
    toast.success('공지사항이 등록되었습니다.')
  }

  const handleDelete = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id)
    saveAnnouncements(updated)
    toast.success('공지사항이 삭제되었습니다.')
  }

  const handleViewDetail = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setIsDetailModalOpen(true)
    // 읽음 처리
    const updated = announcements.map((a) =>
      a.id === announcement.id ? { ...a, read: true } : a,
    )
    saveAnnouncements(updated)
  }

  const unreadCount = announcements.filter((a) => !a.read).length

  return (
    <div className="announcement-card rounded-lg border border-slate-700 bg-slate-800 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
            <i className="bx bxs-bullhorn text-xl text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">공지사항</h3>
            {unreadCount > 0 && (
              <span className="card-badge inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-600"
          aria-label="공지 작성"
        >
          <i className="bx bx-edit" />
          공지 작성
        </button>
      </div>

      <div className="announcement-list space-y-2">
        {announcements.length === 0 ? (
          <div className="announcement-empty py-8 text-center text-sm text-slate-400">
            <i className="bx bx-info-circle mb-2 block text-2xl" />
            <p>등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          announcements.slice(0, 5).map((announcement) => (
            <div
              key={announcement.id}
              className={`announcement-item flex cursor-pointer items-start gap-3 rounded-lg border border-slate-700 p-3 transition hover:bg-slate-700 ${
                !announcement.read ? 'bg-slate-700/50' : ''
              }`}
              onClick={() => handleViewDetail(announcement)}
            >
              <span
                className={`mt-1 h-2 w-2 rounded-full ${
                  !announcement.read ? 'bg-blue-500' : 'bg-slate-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{announcement.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(announcement.date).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(announcement.id)
                }}
                className="text-slate-400 transition hover:text-red-400"
                aria-label="삭제"
              >
                <i className="bx bx-trash" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="modal-content w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">공지사항 작성</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 transition hover:text-white"
                aria-label="모달 닫기"
              >
                <i className="bx bx-x text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="announcement-title" className="mb-1 block text-sm text-slate-300">
                  제목
                </label>
                <input
                  type="text"
                  id="announcement-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={60}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="announcement-date" className="mb-1 block text-sm text-slate-300">
                  공지일
                </label>
                <input
                  type="date"
                  id="announcement-date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="announcement-body" className="mb-1 block text-sm text-slate-300">
                  내용
                </label>
                <textarea
                  id="announcement-body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  maxLength={300}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                />
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
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="modal-content w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">공지사항 상세</h3>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 transition hover:text-white"
                aria-label="상세 닫기"
              >
                <i className="bx bx-x text-2xl" />
              </button>
            </div>
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-white">
                {selectedAnnouncement.title}
              </h4>
              <div className="text-sm text-slate-400">
                {new Date(selectedAnnouncement.date).toLocaleDateString('ko-KR')}
              </div>
              <div className="text-sm text-slate-300">{selectedAnnouncement.body}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

