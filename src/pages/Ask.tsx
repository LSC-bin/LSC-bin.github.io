import { FormEvent, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppLayoutContext } from '../layouts/AppLayout';
import styles from './Ask.module.css';

type Question = {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
};

const initialQuestions: Question[] = [
  {
    id: 'question-1',
    title: 'AI 프로젝트 발표자료 제출 기한 문의',
    author: '김하늘',
    content: '발표자료 제출 마감 시간이 어떻게 되나요?',
    createdAt: '2024-04-09',
  },
  {
    id: 'question-2',
    title: '추가 학습자료 업로드 요청',
    author: '이서준',
    content: '딥러닝 파트 추가 자료를 공유해주실 수 있을까요?',
    createdAt: '2024-04-08',
  },
];

export default function Ask() {
  const { searchTerm } = useOutletContext<AppLayoutContext>();
  const [questions, setQuestions] = useState(initialQuestions);
  const [formState, setFormState] = useState({ title: '', author: '', content: '' });

  const filteredQuestions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return questions;
    }

    return questions.filter((question) => {
      const haystack = `${question.title} ${question.author} ${question.content}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [questions, searchTerm]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim() || !formState.author.trim() || !formState.content.trim()) {
      return;
    }

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      title: formState.title.trim(),
      author: formState.author.trim(),
      content: formState.content.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setQuestions((current) => [newQuestion, ...current]);
    setFormState({ title: '', author: '', content: '' });
  };

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="ask-list-heading">
        <header>
          <h1 id="ask-list-heading">질문 게시판</h1>
          <p>수업과 과제에 대한 질문을 자유롭게 남겨주세요.</p>
        </header>
        <div className={styles.questionList}>
          {filteredQuestions.map((question) => (
            <article key={question.id} className={styles.questionItem}>
              <div className={styles.questionMeta}>
                {question.author} • {question.createdAt}
              </div>
              <h2>{question.title}</h2>
              <p>{question.content}</p>
            </article>
          ))}
          {filteredQuestions.length === 0 && <p>검색 조건에 맞는 질문이 없습니다.</p>}
        </div>
      </section>

      <section className={styles.card} aria-labelledby="ask-form-heading">
        <h2 id="ask-form-heading">질문 남기기</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            제목
            <input
              type="text"
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label>
            작성자
            <input
              type="text"
              value={formState.author}
              onChange={(event) => setFormState((current) => ({ ...current, author: event.target.value }))}
              required
            />
          </label>
          <label>
            내용
            <textarea
              rows={4}
              value={formState.content}
              onChange={(event) => setFormState((current) => ({ ...current, content: event.target.value }))}
              required
            />
          </label>
          <button type="submit" className={styles.submitButton}>
            질문 등록
          </button>
        </form>
      </section>
    </div>
  );
}
