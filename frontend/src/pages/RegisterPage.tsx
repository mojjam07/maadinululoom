import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

type Role = 'student' | 'teacher' | 'admin'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('student')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', [])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) navigate('/dashboard', { replace: true })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // NOTE: We rely on Supabase auth for session. Role is stored in profiles via backend.
      // This app registers users via `supabase.auth.signUp`, then immediately updates profiles.role.
      // If your Supabase project uses triggers, this may be unnecessary.
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: name || null,
          },
        },
      })

      if (signUpErr) throw signUpErr

      // If signUp requires email confirmation, there may be no session yet.
      const session = data.session
      if (!session) {
        setError('Check your email to confirm your account (no session yet).')
        return
      }

      // Ensure profiles row exists / role is set.
      // Our backend `profileRouter` PATCH is protected and expects the profile to match auth user id.
      const { data: sessData } = await supabase.auth.getSession()
      const sess = sessData.session
      if (!sess) throw new Error('missing_session')

      // Update role in profiles table via backend (protected).
      const patchRes = await fetch(`${apiBase}/api/profile/${sess.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sess.access_token}`,
        },
        body: JSON.stringify({
          role,
          name: name || null,
        }),
      })

      if (!patchRes.ok) {
        // still allow navigation; dashboard fetch will show failure if profile missing
        throw new Error('profile_update_failed')
      }

      if (role === 'teacher') navigate('/dashboard/teacher', { replace: true })
      else navigate('/dashboard', { replace: true })
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : 'register_failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="maadin-auth-bg">
      <div className="maadin-auth-wrap">
        <div className="maadin-auth-grid">
          <div className="maadin-auth-side">
            <div className="maadin-auth-badge">📚 Create your account</div>
            <h2 className="maadin-auth-title" style={{ marginBottom: 10 }}>
              Start learning with <span>mAadin</span>
            </h2>
            <p className="maadin-auth-sub">
              Join as a student or teacher. You’ll get access to classes, progress, and teacher tools.
            </p>
          </div>

          <div className="maadin-auth-card">
            <h1>Register</h1>

            <form onSubmit={onSubmit} className="maadin-auth-form">
              <label className="maadin-auth-label">
                <span>Name</span>
                <input
                  className="maadin-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Your name"
                />
              </label>

              <label className="maadin-auth-label">
                <span>Email</span>
                <input
                  className="maadin-input"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </label>

              <label className="maadin-auth-label">
                <span>Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="maadin-auth-select">
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
              </label>

              {error && <div className="maadin-auth-error">{error}</div>}

              <button className="maadin-btn maadin-btn-primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create account'}
              </button>

              <div className="maadin-auth-linkrow">
                <a className="maadin-auth-link" href="/login">
                  Already have an account?
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


