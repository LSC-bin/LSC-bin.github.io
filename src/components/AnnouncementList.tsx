import { FormEvent, useMemo, useState } from 'react';
import { Announcement, initialAnnouncements } from '../data/announcements';
import styles from './AnnouncementList.module.css';

type AnnouncementListProps = {
  query?: string;
};

type ModalState =
  | { type: 'create' }
  | { type: 'detail'; announcement: Announcement }
  | null;

const formatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function AnnouncementList({ query = '' }: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [draft, setDraft] = useState({ title: '', content: '' });

  const normalizedQuery = query.trim().toLowerCase();

  const filteredAnnouncements = useMemo(() => {
    if (!normalizedQuery) {
      return announcements;
    }

    return announcements.filter((announcement) => {
      const haystack = `${announcement.title} ${announcement.content}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [announcements, normalizedQuery]);

  const openCreate = () => {
    setDraft({ title: '', content: '' });
    setModalState({ type: 'create' });
  };

  const openDetail = (announcement: Announcement) => {
    setModalState({ type: 'detail', announcement });
  };

  const closeModal = () => setModalState(null);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      return;
    }

    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      content: draft.content.trim(),
      createdAt: new Date().toISOString(),
    };

    setAnnouncements((current) => [newAnnouncement, ...current]);
    closeModal();
  };

  const handleClear = () => {
    if (announcements.length === 0) {
      return;
    }

    const confirmed = window.confirm('모든 공지사항을 삭제하시겠습니까?');
    if (confirmed) {
      setAnnouncements([]);
    }
  };

  return (
    <section className={`content-card ${styles.container}`} aria-labelledby="announcement-heading">
      <div className={styles.header}>
        <h2 id="announcement-heading">공지사항</h2>
        <span className={styles.badge}>{announcements.length}</span>
      </div>

      {filteredAnnouncements.length > 0 ? (
        <div className={styles.list}>
          {filteredAnnouncements.map((announcement) => (
            <article key={announcement.id} className={styles.item}>
              <div>
                <div className={styles.itemTitle}>{announcement.title}</div>
                <div className={styles.itemDate}>{formatter.format(new Date(announcement.createdAt))}</div>
              </div>
              <div className={styles.actions}>
                <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => openDetail(announcement)}>
                  자세히
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>검색 조건에 맞는 공지사항이 없습니다.</div>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={openCreate}>
          새 공지 등록
        </button>
        <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={handleClear}>
          모두 삭제
        </button>
      </div>

      {modalState?.type === 'create' && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="create-announcement-heading">
          <div className={styles.modal}>
            <h3 id="create-announcement-heading">새 공지 작성</h3>
            <form onSubmit={handleCreate}>
              <label>
                제목
                <input
                  type="text"
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <label>
                내용
                <textarea
                  rows={4}
                  value={draft.content}
                  onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
                  required
                />
              </label>
              <div className={styles.modalActions}>
                <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={closeModal}>
                  취소
                </button>
                <button type="submit" className={styles.button}>
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalState?.type === 'detail' && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="announcement-detail-heading">
          <div className={styles.modal}>
            <h3 id="announcement-detail-heading">{modalState.announcement.title}</h3>
            <p className={styles.itemDate}>{formatter.format(new Date(modalState.announcement.createdAt))}</p>
            <p>{modalState.announcement.content}</p>
            <div className={styles.modalActions}>
              <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={closeModal}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
