export type NavItem = {
  label: string
  to: string
}

export const primaryNavigation: NavItem[] = [
  { label: '홈', to: '/' },
  { label: '교사 공간', to: '/teacher' },
  { label: '학생 공간', to: '/student' },
  { label: '통계', to: '/analytics' },
]

export const docLinks: NavItem[] = [
  { label: '설계 문서', to: '../../docs/architecture-and-pipeline-plan.md' },
  { label: '데이터/권한', to: '../../docs/data-and-auth-plan.md' },
  { label: '커스터마이징', to: '../../docs/teacher-customization-and-flows.md' },
]

