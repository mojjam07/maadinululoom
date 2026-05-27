import { Navigate, Route, Routes } from 'react-router-dom'
import MaadinAluloomLandingPage from '../pages/MaadinAluloomLandingPage'
import DashboardPage from '../pages/DashboardPage'


export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MaadinAluloomLandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/teacher" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


