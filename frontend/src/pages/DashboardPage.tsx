import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

import SidebarNav from '../components/dashboard/SidebarNav'
import StatsCards from '../components/dashboard/StatsCards'
import CoursesProgress from '../components/dashboard/CoursesProgress'
import LessonsPanel from '../components/dashboard/LessonsPanel'
import AssignmentsPanel from '../components/dashboard/AssignmentsPanel'
import RecentLessons from '../components/dashboard/RecentLessons'
import UpcomingClasses from '../components/dashboard/UpcomingClasses'
import TeacherPortalPage from '../components/dashboard/TeacherPortalPage'

export default function DashboardPage() {

  const [role, setRole] = useState<'student' | 'teacher' | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadRole() {
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user?.id
      const accessToken = data.session?.access_token
      if (!userId || !accessToken) return

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const json = (await res.json().catch(() => ({}))) as
        | { profile?: { role?: 'student' | 'teacher' | 'admin' } }
        | Record<string, unknown>
      const dbRole =
        'profile' in json && typeof (json as { profile?: { role?: string } }).profile?.role === 'string'
          ? (json as { profile?: { role?: string } }).profile?.role
          : undefined

      const nextRole = dbRole === 'teacher' ? 'teacher' : 'student'
      if (mounted) setRole(nextRole)
    }
    loadRole()
    return () => {
      mounted = false
    }
  }, [])

  if (!role) {
    return <div style={{ padding: 24 }}>Loading...</div>
  }

  if (role === 'teacher') {
    return (
      <div className="maadin-dashboard-shell">

        <SidebarNav role="teacher" active="teacher" />
        <main className="maadin-dashboard-main">
          <TeacherPortalPage />
        </main>
      </div>
    )
  }


  return (
    <div className="maadin-dashboard-shell">
      <SidebarNav role="student" active="dashboard" />
      <main className="maadin-dashboard-main">
        <h1 className="maadin-dashboard-title">Dashboard</h1>
        <StatsCards />
        <div className="maadin-dashboard-grid">
          <div>
            <CoursesProgress />
            <LessonsPanel />
          </div>
          <div>
            <AssignmentsPanel />
            <UpcomingClasses />
            <RecentLessons />
          </div>
        </div>
      </main>
    </div>
  )
}

