import { useEffect, useState } from 'react'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { apiFetch } from '../lib/api'
import { useLanguage } from '../components/i18n/useLanguage'

export default function LoginPage() {
  const navigate = useNavigate()
  const { dir } = useLanguage()
  const redirected = useRef(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If already logged in, go to correct dashboard.
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) return
      try {
        const json = await apiFetch<{ profile?: { role?: 'student' | 'teacher' | 'admin' } | null }>(`/api/profile/${session.user.id}`)
        const profile = json?.profile ?? null

        // If profile row is missing, do not auto-redirect; allow user to login or create profile.
        if (profile === null) {
          console.warn('LoginPage: profile missing on mount; staying on login')
          return
        }

        const role = profile.role

        if (!redirected.current) {
          if (role === 'teacher') navigate('/dashboard/teacher', { replace: true })
          else navigate('/dashboard', { replace: true })
          redirected.current = true
        }
        return
      } catch (err) {
        // If profile lookup fails (profile not created yet or backend error),
        // do not auto-redirect. Stay on the login page so the user can sign in
        // with valid credentials or the frontend can create the profile.
        console.warn('LoginPage: profile fetch failed on mount, staying on login', err)
        return
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInErr) throw signInErr

      // After sign-in, fetch role to redirect.
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) throw new Error('missing_session')

      try {
        const json = await apiFetch<{ profile?: { role?: 'student' | 'teacher' | 'admin' } }>(`/api/profile/${session.user.id}`)
        const role = json?.profile?.role
        if (role === 'teacher') navigate('/dashboard/teacher', { replace: true })
        else navigate('/dashboard', { replace: true })
      } catch (err) {
        // If profile fetch fails, still navigate to default dashboard.
        console.warn('Profile fetch failed after login:', err)
        navigate('/dashboard', { replace: true })
      }
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : 'login_failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="maadin-auth-bg" style={{ direction: dir, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
      <div className="maadin-auth-wrap">
        <div className="maadin-auth-grid" style={{ direction: dir }}>
          <div className="maadin-auth-side">
            <div className="maadin-auth-badge">✨ Welcome to معدن العلوم</div>
            <h2 className="maadin-auth-title" style={{ marginBottom: 10 }}>
              Learn with <span>Islamic</span> & Arabic focus
            </h2>
            <p className="maadin-auth-sub">
              Sign in to continue your journey—classes, progress, and teacher support in one place.
            </p>
          </div>

          <div className="maadin-auth-card">
            <h1>Login</h1>

            <form onSubmit={onSubmit} className="maadin-auth-form">
              <label className="maadin-auth-label">
                <span>Email</span>
                <input
                  className="maadin-input"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="your@email.com"
                />
              </label>

              <label className="maadin-auth-label">
                <span>Password</span>
                <input
                  className="maadin-input"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </label>

              {error && <div className="maadin-auth-error">{error}</div>}

              <button className="maadin-btn maadin-btn-primary" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="maadin-auth-linkrow">
                <a className="maadin-auth-link" href="/register">
                  Create account
                </a>
                <a className="maadin-auth-link-muted" href="/">
                  Back to home
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


