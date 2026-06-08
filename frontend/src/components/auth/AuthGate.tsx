import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { apiFetch } from '../../lib/api'

export type AuthGateProps = PropsWithChildren<{
  role?: 'student' | 'teacher' | 'admin'
  fallbackPath?: string
}>

export default function AuthGate({ role, children, fallbackPath = '/' }: AuthGateProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function run() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data.session
        if (!session) {
          navigate(fallbackPath, { replace: true })
          return
        }

        // Role is stored in `profiles.role` in DB.
        // For now we don't fetch role unless requested; default allow.
        if (!role) return

        // Fetch role from backend profile endpoint if possible.
        // Backend enforces auth, but we keep this gate lightweight.
        try {
          const json = await apiFetch<{ profile?: { role?: string } }>(`/api/profile/${session.user.id}`)
          const userRole = json?.profile?.role

          if (userRole !== role && role !== 'admin') {
            navigate(fallbackPath, { replace: true })
            return
          }
        } catch (err) {
          // If profile fetch fails, treat as not authorized for non-admin roles
          console.warn('AuthGate profile fetch failed:', err)
          if (role && role !== 'admin') {
            navigate(fallbackPath, { replace: true })
            return
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [navigate, role, fallbackPath])

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>
  return <>{children}</>
}

