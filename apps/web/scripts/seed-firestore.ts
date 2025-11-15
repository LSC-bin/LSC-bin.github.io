process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099'

import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

type SeederClassroom = {
  id: string
  name: string
  grade: string
  subject: string
  featureConfig: Record<string, unknown>
  sessions: Array<{
    id: string
    title: string
    scheduleAt: string
    activityPosts: Array<{ id: string; title: string; content: string }>
    questions: Array<{ id: string; author: string; body: string }>
    chatMessages: Array<{ id: string; author: string; body: string }>
  }>
}

const classrooms: SeederClassroom[] = [
  {
    id: 'demo-class-1',
    name: 'AI 융합 수업',
    grade: '중3',
    subject: '과학',
    featureConfig: {
      sidebarOrder: [
        'attendance',
        'quiz',
        'poll',
        'randomCall',
        'timer',
        'materials',
        'chat',
        'qaBoard',
      ],
      favorites: ['quiz', 'poll', 'materials'],
      permissions: {
        attendance: 'teacher',
        quiz: 'teacher',
        poll: 'teacher',
        materials: 'teacher',
        chat: 'students',
        qaBoard: 'students',
      },
    },
    sessions: [
      {
        id: 'session-2025-03-01',
        title: '1차시: AI 개념 이해',
        scheduleAt: '2025-03-01T09:00:00+09:00',
        activityPosts: [
          {
            id: 'post-1',
            title: '수업 자료',
            content: 'AI의 기본 개념을 설명하는 슬라이드입니다.',
          },
          {
            id: 'post-2',
            title: '사전 평가 링크',
            content: '수업 시작 전에 간단한 퀴즈를 풀어보세요.',
          },
        ],
        questions: [
          {
            id: 'question-1',
            author: 'studentA',
            body: 'AI와 머신러닝의 차이가 무엇인가요?',
          },
        ],
        chatMessages: [
          {
            id: 'chat-1',
            author: 'teacher',
            body: '안녕하세요! 오늘 수업 시작합니다.',
          },
          {
            id: 'chat-2',
            author: 'studentB',
            body: '교수님 잘 들립니다!',
          },
        ],
      },
      {
        id: 'session-2025-03-08',
        title: '2차시: 데이터와 모델',
        scheduleAt: '2025-03-08T09:00:00+09:00',
        activityPosts: [
          {
            id: 'post-3',
            title: '활동지',
            content: '데이터 수집 및 전처리 활동지를 확인하세요.',
          },
        ],
        questions: [],
        chatMessages: [],
      },
    ],
  },
]

const main = async () => {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? 'education-dashboard-local'
  initializeApp({ projectId })

  const db = getFirestore()

  const batch = db.batch()

  classrooms.forEach((classroom) => {
    const classroomRef = db.collection('classrooms').doc(classroom.id)
    batch.set(classroomRef, {
      name: classroom.name,
      grade: classroom.grade,
      subject: classroom.subject,
      featureConfig: classroom.featureConfig,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    classroom.sessions.forEach((session) => {
      const sessionRef = classroomRef.collection('sessions').doc(session.id)
      batch.set(sessionRef, {
        title: session.title,
        scheduleAt: session.scheduleAt,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      session.activityPosts.forEach((post) => {
        const postRef = sessionRef.collection('activityPosts').doc(post.id)
        batch.set(postRef, {
          title: post.title,
          content: post.content,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      })

      session.questions.forEach((question) => {
        const questionRef = sessionRef.collection('askQuestions').doc(question.id)
        batch.set(questionRef, {
          author: question.author,
          body: question.body,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      })

      session.chatMessages.forEach((message) => {
        const messageRef = sessionRef.collection('chatMessages').doc(message.id)
        batch.set(messageRef, {
          author: message.author,
          body: message.body,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      })
    })
  })

  await batch.commit()

  console.log('✅ Firestore Emulator seeding completed.')
}

main().catch((error) => {
  console.error('❌ Failed to seed Firestore Emulator.')
  console.error(error)
  process.exit(1)
})


