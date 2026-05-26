import { Navigate, Route, Routes } from 'react-router-dom'
import MaadinAluloomLandingPage from '../pages/MaadinAluloomLandingPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MaadinAluloomLandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


