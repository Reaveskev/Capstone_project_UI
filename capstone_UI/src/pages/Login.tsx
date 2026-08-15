import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeOffIcon, ShieldIcon, LockIcon, BoltIcon } from '../components/icons'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const ok = login(username, password)
    if (ok) {
      setError(false)
      navigate('/dashboard', { replace: true })
    } else {
      setError(true)
    }
  }

  return (
    <div className="login-shell">
      <aside className="login-aside">
        <h1>SalesBridge</h1>
        <p>
          A minimalistic, role-based business management platform for point-of-sale, inventory,
          customers, and reporting — built for Administrators, Managers, Employees, and Customers.
        </p>
        <div className="login-feature-list">
          <div className="login-feature">
            <span className="login-feature-icon">
              <ShieldIcon size={16} />
            </span>
            Role-based access for every workspace
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">
              <LockIcon size={16} />
            </span>
            Secure, session-restricted routes
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">
              <BoltIcon size={16} />
            </span>
            Fast, guided point-of-sale workflow
          </div>
        </div>
      </aside>

      <div className="login-main">
        <div className="login-form-wrap">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to access your SalesBridge workspace.</p>

          {error && (
            <div className="login-error-banner">Incorrect username or password!</div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                className={`input${error ? ' input-error' : ''}`}
                type="text"
                placeholder="e.g. manager"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (error) setError(false)
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-field-wrap">
                <input
                  id="password"
                  className={`input${error ? ' input-error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError(false)
                  }}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
              Sign In
            </button>
          </form>

          <div className="login-hint">
            Prototype credentials — try <strong>manager / password</strong>,{' '}
            <strong>admin / password</strong>, or <strong>employee / password</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}
