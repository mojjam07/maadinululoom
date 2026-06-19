import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { apiFetch } from '../lib/api'
import { useLanguage } from '../components/i18n/useLanguage'

type Role = 'student' | 'teacher' | 'admin'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { dir } = useLanguage()
  const redirected = useRef(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('student')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionExistsButProfileFail, setSessionExistsButProfileFail] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) return
      // If already logged in, attempt to redirect to the correct dashboard.
      // Only redirect when we can successfully fetch the user's profile/role.
      try {
        const json = await apiFetch<{ profile?: { role?: 'student' | 'teacher' | 'admin' } | null }>(`/api/profile/${session.user.id}`)
        const profile = json?.profile ?? null

        if (profile === null) {
          console.warn('RegisterPage: profile missing on mount; staying on register')
          setSessionExistsButProfileFail(true)
          return
        }

        const dbRole = profile.role
        if (!redirected.current) {
          if (dbRole === 'teacher') navigate('/dashboard/teacher', { replace: true })
          else navigate('/dashboard', { replace: true })
          redirected.current = true
        }
      } catch (err) {
        // If profile fetch fails, avoid auto-redirect — leaving the registration
        // page avoids a redirect loop between /dashboard (AuthGate) and /login.
        console.warn('RegisterPage: failed to fetch profile; staying on /register', err)
        setSessionExistsButProfileFail(true)
      }
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
        // Supabase will handle sending the confirmation email. If you don't receive it,
        // it’s usually due to Supabase Auth email delivery / SMTP configuration.
        setError(
          'Check your email to confirm your account. If you don\'t see it, check spam/promotions and verify your Supabase Auth email (SMTP) settings. If needed, use the “Resend verification email” button below.'
        )
        return
      }

      // Ensure profiles row exists / role is set.
      // Our backend `profileRouter` PATCH is protected and expects the profile to match auth user id.
      const { data: sessData } = await supabase.auth.getSession()
      const sess = sessData.session
      if (!sess) throw new Error('missing_session')

      const userId = sess?.user?.id
      if (typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('missing_user_id')
      }

      // Update role in profiles table via backend (protected).
      try {
        await apiFetch(`/api/profile/${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ role, name: name || null }),
        })
      } catch (err) {
        // If profile patch fails (e.g., no session or RLS), still continue to dashboard.
        console.warn('Profile patch failed during registration:', err)
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
    <div className="maadin-auth-bg" style={{ direction: dir, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
      <div className="maadin-auth-wrap">
        <div className="maadin-auth-grid" style={{ direction: dir }}>
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
                  name="name"
                  autoComplete="name"
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
                  autoComplete="new-password"
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

              {error && (
                <div className="maadin-auth-error">
                  {error}
                  {' '}
                  {' '}
                  <div style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className="maadin-btn maadin-btn-outline"
                      disabled={loading}
                      onClick={async () => {
                        try {
                          // If email confirmation is required, Supabase provides a resend mechanism.
                          // Depending on your Supabase version/project settings, this may exist or throw.
                          const res = await supabase.auth.resend({ type: 'signup', email })
                          if (res?.error) throw res.error
                        } catch (e) {
                          console.warn('Failed to resend verification email:', e)
                          setError('Could not resend verification email automatically. Please check your Supabase Auth email settings.')
                        }
                      }}
                    >
                      Resend verification email
                    </button>
                  </div>
                </div>
              )}


              {sessionExistsButProfileFail && (
                <div className="maadin-auth-warning" style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    We detected an existing session but couldn't load your profile. If you expected to be logged out,
                    please sign out before registering a new account.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="maadin-btn"
                      onClick={async () => {
                        try {
                          await supabase.auth.signOut()
                          // reload to clear any client-side session state
                          window.location.reload()
                        } catch (e) {
                          console.warn('Sign out failed:', e)
                        }
                      }}
                    >
                      Sign out
                    </button>
                    <button
                      type="button"
                      className="maadin-btn maadin-btn-outline"
                      onClick={() => setSessionExistsButProfileFail(false)}
                    >
                      Continue anyway
                    </button>
                  </div>
                </div>
              )}

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


