import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Shield, Mail, Lock, Eye, EyeOff,
  AlertCircle, ArrowRight, CheckCircle2, Bike
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')

  const validate = () => {
    if (!email.trim()) return 'Enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
    if (!password)    return 'Enter your password.'
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (authError) throw authError
      // Navigation handled by App.jsx session listener
    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.'
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please check and try again.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Please verify your email address before logging in.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Enter your email address above, then tap "Forgot password".')
      return
    }
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      setSuccess('Password reset link sent. Check your inbox.')
    } catch (err) {
      setError(err.message || 'Could not send reset link. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-shell-bg" />
      <div className="auth-shell-overlay" />
      
      <div className="auth-content">

        {/* Header */}
        <header className="auth-header">
          <div className="arka-logo">
            <img src="/logo.png" alt="ARKA Logo" className="arka-logo-img" />
          </div>

          <div className="auth-headline">
            <h1>Welcome back</h1>
            <p>Sign in to your account to view your policy and claim status.</p>
          </div>
        </header>

        {/* Form Card */}
        <form className="auth-card" onSubmit={handleLogin} noValidate>

          {/* Alert */}
          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              <CheckCircle2 size={15} />
              <span>{success}</span>
            </div>
          )}

          {/* Email */}
          <div className="field-group">
            <label className="field-label" htmlFor="login-email">Email Address</label>
            <div className="field-wrapper">
              <span className="field-icon"><Mail size={16} /></span>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className={`field-input${error && !email ? ' error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label" htmlFor="login-password">Password</label>
            <div className="field-wrapper">
              <span className="field-icon"><Lock size={16} /></span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                className="field-input has-suffix"
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                disabled={loading}
              />
              <button
                type="button"
                className="field-suffix-btn"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div style={{ textAlign: 'right', marginTop: '-4px' }}>
            <button
              type="button"
              className="btn-link"
              style={{ fontSize: '13px' }}
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '4px' }}
          >
            {loading ? (
              <><span className="btn-spinner" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>

        </form>

        {/* Footer */}
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="auth-footer" style={{ marginTop: 0 }}>
            New to ARKA? <Link to="/register" className="btn-link">Create account</Link>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', opacity: 0.9 }}>
            {/* Fake text logos to match concept */}
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>zepto</span>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>blinkit</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 800, color: '#fff' }}>
              <Bike size={16} strokeWidth={3} /> Swiggy instamart
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
            <Shield size={12} />
            <span style={{ fontSize: '11px', color: '#fff' }}>
              Built for Zepto, Blinkit & Swiggy Instamart delivery partners
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
