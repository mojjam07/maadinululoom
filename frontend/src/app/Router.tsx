import { Navigate, Route, Routes } from 'react-router-dom'
import MaadinAluloomLandingPage from '../pages/MaadinAluloomLandingPage'
import DashboardPage from '../pages/DashboardPage'
import AuthGate from '../components/auth/AuthGate'

import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MaadinAluloomLandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <AuthGate role="student" fallbackPath="/login">
            <DashboardPage />
          </AuthGate>
        }
      />

      <Route
        path="/dashboard/teacher"
        element={
          <AuthGate role="teacher" fallbackPath="/login">
            <DashboardPage />
          </AuthGate>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}



