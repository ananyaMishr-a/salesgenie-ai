import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import LeadsPage from './pages/LeadsPage.jsx'
import OutreachPage from './pages/OutreachPage.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/leads" replace />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/:leadId" element={<LeadsPage />} />

        {/* Built in later milestones — placeholders keep the tab bar functional now */}
        <Route
          path="outreach"
          element={<OutreachPage />}
        />
        <Route
          path="conversations"
          element={<ComingSoonPage title="Conversations" milestone="Milestone 3 · Weeks 5–6" />}
        />
        <Route
          path="dashboard"
          element={<ComingSoonPage title="Dashboard" milestone="Milestone 4 · Weeks 7–8" />}
        />

        <Route path="*" element={<Navigate to="/leads" replace />} />
      </Route>
    </Routes>
  )
}
