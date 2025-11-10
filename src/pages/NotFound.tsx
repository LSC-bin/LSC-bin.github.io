import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="content-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>요청하신 페이지가 존재하지 않거나 이동되었어요.</p>
      <Link to="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--blue)' }}>
        대시보드로 돌아가기
      </Link>
    </section>
  );
}
