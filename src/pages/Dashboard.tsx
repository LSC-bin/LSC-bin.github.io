import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AnnouncementList from '../components/AnnouncementList';
import type { AppLayoutContext } from '../layouts/AppLayout';
import styles from './Dashboard.module.css';

type TodoStatus = 'all' | 'completed' | 'pending';

type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
};

const initialTodos: TodoItem[] = [
  { id: 'todo-1', title: '월요일 수업자료 업로드', completed: true },
  { id: 'todo-2', title: '3반 과제 피드백 작성', completed: false },
  { id: 'todo-3', title: '상담 일정 확정 및 공유', completed: false },
];

const recentActivities = [
  { id: 'activity-1', title: '질문 게시판 답변 완료', time: '2시간 전' },
  { id: 'activity-2', title: '과제 제출률 96% 달성', time: '어제' },
  { id: 'activity-3', title: '새로운 과제 "AI 프로젝트" 등록', time: '2일 전' },
];

export default function Dashboard() {
  const { searchTerm } = useOutletContext<AppLayoutContext>();
  const [todos, setTodos] = useState(initialTodos);
  const [filter, setFilter] = useState<TodoStatus>('all');

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
            }
          : todo
      )
    );
  };

  const filteredTodos = useMemo(() => {
    if (filter === 'all') {
      return todos;
    }
    return todos.filter((todo) => (filter === 'completed' ? todo.completed : !todo.completed));
  }, [todos, filter]);

  const completionRate = Math.round((todos.filter((todo) => todo.completed).length / todos.length) * 100);

  return (
    <div>
      <section className={styles.grid} aria-label="주요 지표">
        <article className={styles.statCard}>
          <h2>이번 주 출석률</h2>
          <p className={styles.statValue}>98%</p>
          <p>지난주 대비 +2%</p>
        </article>
        <article className={styles.statCard}>
          <h2>과제 제출률</h2>
          <p className={styles.statValue}>96%</p>
          <p>마감 2일 전</p>
        </article>
        <article className={styles.statCard}>
          <h2>할 일 완료율</h2>
          <p className={styles.statValue}>{completionRate}%</p>
          <p>{todos.filter((todo) => todo.completed).length} / {todos.length} 완료</p>
        </article>
      </section>

      <section className={styles.twoColumn}>
        <div className="content-card">
          <div className={styles.todoList}>
            <header>
              <h2>할 일 목록</h2>
            </header>
            <div className={styles.todoFilters}>
              <button
                type="button"
                className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
                onClick={() => setFilter('all')}
              >
                전체
              </button>
              <button
                type="button"
                className={`${styles.filterButton} ${filter === 'pending' ? styles.filterActive : ''}`}
                onClick={() => setFilter('pending')}
              >
                진행중
              </button>
              <button
                type="button"
                className={`${styles.filterButton} ${filter === 'completed' ? styles.filterActive : ''}`}
                onClick={() => setFilter('completed')}
              >
                완료됨
              </button>
            </div>
            <div className={styles.todoItems}>
              {filteredTodos.map((todo) => (
                <div key={todo.id} className={styles.todoItem}>
                  <input
                    id={todo.id}
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <label htmlFor={todo.id} className={todo.completed ? styles.completed : undefined}>
                    {todo.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnnouncementList query={searchTerm} />
      </section>

      <section className={`content-card ${styles.activityList}`} aria-label="최근 활동">
        <h2>최근 활동</h2>
        {recentActivities.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <span>{activity.title}</span>
            <span className={styles.activityMeta}>{activity.time}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
