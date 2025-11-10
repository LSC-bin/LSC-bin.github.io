export type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export const initialAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '중간고사 대비 안내',
    content: '다음 주 수요일에 중간고사 대비 특별 수업이 진행됩니다. 준비물을 꼭 챙겨오세요.',
    createdAt: '2024-04-10T09:30:00+09:00',
  },
  {
    id: '2',
    title: '동아리 모집 공지',
    content: 'AI 연구 동아리에서 신입 부원을 모집합니다. 관심 있는 학생은 이번 주 금요일까지 신청서를 제출하세요.',
    createdAt: '2024-04-08T14:10:00+09:00',
  },
];
