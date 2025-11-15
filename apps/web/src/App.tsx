import { Navigate, Route, Routes } from 'react-router-dom'

import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AppShell } from './components/layout/AppShell'
import { LandingPage } from './pages/LandingPage'
import { StudentOverview } from './pages/StudentOverview'
import { TeacherOverview } from './pages/TeacherOverview'
import { AnalyticsOverview } from './pages/AnalyticsOverview'
import { ActivityPage } from './pages/ActivityPage'
import { AskPage } from './pages/AskPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { QuizPage } from './pages/QuizPage'
import { MaterialsPage } from './pages/MaterialsPage'
import { AppProviders } from './providers'

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppShell>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/teacher" element={<TeacherOverview />} />
            <Route path="/teacher/activity" element={<ActivityPage />} />
            <Route path="/teacher/ask" element={<AskPage />} />
            <Route path="/teacher/quiz" element={<QuizPage />} />
            <Route path="/teacher/materials" element={<MaterialsPage />} />
            <Route path="/teacher/session/:sessionId" element={<SessionDetailPage />} />
            <Route path="/student" element={<StudentOverview />} />
            <Route path="/analytics" element={<AnalyticsOverview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
