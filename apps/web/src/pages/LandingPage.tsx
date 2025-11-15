import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import { useClassroomsQuery } from '../hooks'

export const LandingPage = () => {
  const { data: classrooms, isLoading } = useClassroomsQuery()
  const hasClassrooms = (classrooms?.length ?? 0) > 0

  return (
    <section className="flex flex-col gap-16 py-8">
      <div className="space-y-6 text-left sm:text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-300">
          Roadmap & Docs
        </span>
        <h2 className="text-4xl font-bold text-white sm:text-5xl">
          커스터마이징 가능한 수업 플랫폼으로의 전환을 준비하세요
        </h2>
        <p className="mx-auto max-w-3xl text-base text-slate-300 sm:text-lg">
          React + Tailwind SPA 구조, Firebase 기반 데이터 계층, 교사/학생 권한 모델을 위한 설계와
          체크리스트를 한곳에서 정리했습니다. 우측 메뉴에서 역할별 워크플로우를 탐색하거나, 아래
          링크로 자세한 문서를 확인해 보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="../../docs/architecture-and-pipeline-plan.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            아키텍처 설계 문서
          </a>
          <a
            href="../../README.md#완성형-웹페이지를-위한-개선-방향"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/60 px-5 py-2 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/20"
          >
            체크리스트 보기
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="../../README.md#완성형-웹페이지를-위한-개선-방향"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            ✅ 체크리스트 확인
          </a>
          <a
            href="../../docs/architecture-and-pipeline-plan.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/60 px-5 py-2 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/20"
          >
            📚 설계 문서 바로가기
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-800 bg-surface-900/60 p-6 shadow-xl shadow-slate-950/40">
          <h3 className="text-lg font-semibold text-white">다음 단계</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• 컴포넌트 기반 화면 설계와 상태 관리 패턴 확정</li>
            <li>• Firestore 규칙과 서비스 계층 확장</li>
            <li>• 교사용 사이드바 커스터마이징 UX 모델링</li>
            <li>• 접근성, 모바일 대응, 분석 대시보드 로드맵 실행</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-surface-900/60 p-6 shadow-xl shadow-slate-950/40">
          <h3 className="text-lg font-semibold text-white">기술 스택</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {['React 19', 'Vite 7', 'TypeScript 5', 'Tailwind 3', 'Firebase', 'React Router'].map(
              (token) => (
                <span
                  key={token}
                  className="rounded-full bg-surface-800/60 px-3 py-2 text-center font-medium text-slate-200"
                >
                  {token}
                </span>
              ),
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-surface-900/60 p-6 shadow-xl shadow-slate-950/40 md:col-span-2">
          <h3 className="text-lg font-semibold text-white">샘플 클래스 미리보기</h3>
          {isLoading ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {hasClassrooms ? (
                classrooms.map((classroom) => (
                  <li
                    key={classroom.id}
                    className="rounded-2xl border border-slate-800/60 bg-surface-800/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-white">{classroom.name}</span>
                      <span className="text-xs uppercase tracking-[0.3em] text-brand-200">
                        코드 {classroom.code}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{classroom.description}</p>
                  </li>
                ))
              ) : (
                <EmptyState
                  title="Firestore에 클래스 데이터가 없습니다."
                  description="에뮬레이터를 실행 중이라면 `npm run seed:firestore`로 기본 클래스 데이터를 주입하세요."
                >
                  <div className="space-y-2 text-xs text-slate-300">
                    <p>
                      에뮬레이터가 실행 중인지 확인한 뒤{' '}
                      <code className="rounded bg-surface-800/60 px-2 py-1 text-brand-200">
                        npm run seed:firestore
                      </code>
                      를 실행하면 데모 클래스가 생성됩니다.
                    </p>
                    <p>
                      또는 <a
                        className="text-brand-200 hover:text-brand-100"
                        href="../../README.md#개발-환경-요약"
                        target="_blank"
                        rel="noreferrer"
                      >
                        개발 환경 요약
                      </a> 문서를 참고해 Firestore에 직접 클래스를 등록하세요.
                    </p>
                  </div>
                </EmptyState>
              )}
            </ul>
          )}
        </article>
      </div>
    </section>
  )
}

