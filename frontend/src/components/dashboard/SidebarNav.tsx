import { Link, useLocation } from 'react-router-dom'

type Role = 'student' | 'teacher'

type NavKey =
  | 'dashboard'
  | 'courses'
  | 'lessons'
  | 'assignments'
  | 'attendance'
  | 'teacher'

const NAV: Array<{ key: NavKey; label: string; path: string; roles: Role[] }> = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: ['student'] },
  { key: 'courses', label: 'Courses', path: '/dashboard', roles: ['student'] },
  { key: 'lessons', label: 'Lessons', path: '/dashboard', roles: ['student'] },
  { key: 'assignments', label: 'Assignments', path: '/dashboard', roles: ['student'] },
  { key: 'attendance', label: 'Attendance', path: '/dashboard', roles: ['student'] },
  { key: 'teacher', label: 'Teacher Portal', path: '/dashboard/teacher', roles: ['teacher'] },
]

export default function SidebarNav({ role, active }: { role: Role; active: NavKey }) {
  const loc = useLocation()

  return (
    <aside className="maadin-sidebar">
      <div className="maadin-sidebar-brand">
        <div className="maadin-sidebar-logo">💛</div>
        <div>
          <div className="maadin-sidebar-brand-title">معدن</div>
          <div className="maadin-sidebar-brand-sub">{role === 'teacher' ? 'Teacher' : 'Student'}</div>
        </div>
      </div>

      <nav className="maadin-sidebar-links">
        {NAV.filter((x) => x.roles.includes(role)).map((item) => {
          const isActive = active === item.key || loc.pathname === item.path
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`maadin-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="maadin-sidebar-link-dot" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

