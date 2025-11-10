import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppLayoutContext } from '../layouts/AppLayout';
import styles from './Activity.module.css';

type ActivityStatus = '진행중' | '완료' | '대기';

type ActivityRow = {
  id: string;
  title: string;
  instructor: string;
  status: ActivityStatus;
  updatedAt: string;
};

const activityRows: ActivityRow[] = [
  { id: 'row-1', title: 'AI 프로젝트 기획안 검토', instructor: '김민수', status: '진행중', updatedAt: '2024-04-09' },
  { id: 'row-2', title: '데이터셋 정제 워크숍', instructor: '이지은', status: '완료', updatedAt: '2024-04-07' },
  { id: 'row-3', title: '주간 학급 회의', instructor: '박서연', status: '대기', updatedAt: '2024-04-11' },
];

const statusClassName: Record<ActivityStatus, string> = {
  진행중: styles.statusProgress,
  완료: styles.statusComplete,
  대기: styles.statusPending,
};

export default function Activity() {
  const { searchTerm } = useOutletContext<AppLayoutContext>();

  const filteredRows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return activityRows;
    }

    return activityRows.filter((row) => {
      const haystack = `${row.title} ${row.instructor}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [searchTerm]);

  return (
    <div className={styles.page}>
      <section className={styles.board} aria-labelledby="activity-board-heading">
        <header>
          <h1 id="activity-board-heading">활동 현황</h1>
          <p className={styles.meta}>최근 업데이트: 2024년 4월 11일</p>
        </header>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th scope="col">활동명</th>
                <th scope="col">담당 교사</th>
                <th scope="col">상태</th>
                <th scope="col">업데이트</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.instructor}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClassName[row.status]}`}>{row.status}</span>
                  </td>
                  <td>{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
