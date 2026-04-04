import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, FRONTEND_URL, REQUIRE_EMAIL_VERIFICATION } from '../lib/supabase'
import {
  Shield, Mail, Lock, Eye, EyeOff, User, Phone,
  AlertCircle, ArrowRight, CheckCircle2, ChevronLeft,
  MapPin, Wallet, Clock, Navigation
} from 'lucide-react'

/* ── Password strength utility ─────────────────────────────────── */
function getStrength(pw) {
  let score = 0
  if (pw.length >= 8)  score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0–4
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_CLASSES = ['', 'weak', 'fair', 'good', 'strong']

/* ── Platform options ──────────────────────────────────────────── */
const PLATFORMS = [
  { key: 'zepto',    label: 'Zepto',    color: '#8b5cf6', abbr: 'ZE' },
  { key: 'blinkit',  label: 'Blinkit',  color: '#facc15', abbr: 'BL' },
  { key: 'swiggy',   label: 'Swiggy',   color: '#f97316', abbr: 'SW' },
  { key: 'zomato',   label: 'Zomato',   color: '#ef4444', abbr: 'ZO' },
  { key: 'dunzo',    label: 'Dunzo',    color: '#22c55e', abbr: 'DZ' },
  { key: 'other',    label: 'Other',    color: '#64748b', abbr: '??' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep]               = useState(1)

  // ── Step 1: Account Info ────────────────────────────────────────
  const [fullName, setFullName]       = useState('')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [agreed, setAgreed]           = useState(false)

  // ── Step 2: Delivery / Work Details ────────────────────────────
  const [city, setCity]               = useState('')
  const [deliveryZone, setDeliveryZone] = useState('')
  const [platform, setPlatform]       = useState('')
  const [avgIncome, setAvgIncome]     = useState('')
  const [avgHours, setAvgHours]       = useState('')
  const [upiId, setUpiId]             = useState('')

  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [signupCooldown, setSignupCooldown] = useState(0)

  const strength = getStrength(password)

  // Signup cooldown timer to prevent rate limiting
  React.useEffect(() => {
    if (signupCooldown <= 0) return
    const timer = setTimeout(() => setSignupCooldown(signupCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [signupCooldown])

  /* ── Validation ————————————————————————————————————————————— */
  const validateStep1 = () => {
    if (!fullName.trim())  return 'Enter your full name.'
    if (!email.trim())     return 'Enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
    if (!phone.trim())     return 'Enter your phone number.'
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) return 'Enter a valid 10-digit Indian mobile number.'
    if (!password)         return 'Create a password.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (!agreed)           return 'Accept the terms to continue.'
    return null
  }

  const validateStep2 = () => {
    if (!city.trim())           return 'Enter your city.'
    if (!deliveryZone.trim())   return 'Enter your delivery zone (area/locality name).'
    if (!platform)              return 'Select your delivery platform.'
    if (!avgIncome.trim())      return 'Enter your approximate weekly income.'
    if (isNaN(Number(avgIncome)) || Number(avgIncome) <= 0) return 'Enter a valid income amount.'
    if (!avgHours.trim())       return 'Enter your average working hours per week.'
    if (isNaN(Number(avgHours)) || Number(avgHours) <= 0 || Number(avgHours) > 84)
      return 'Enter valid working hours (1–84 per week).'
    if (!upiId.trim())          return 'Enter your UPI ID.'
    if (!upiId.includes('@'))   return 'Enter a valid UPI ID (e.g. name@upi).'
    return null
  }

  /* ── Handlers ——————————————————————————————————————————————— */
  const handleNextStep = (e) => {
    e.preventDefault()
    setError('')
    const err = validateStep1()
    if (err) { setError(err); return }
    setStep(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (signupCooldown > 0) { setError(`Please wait ${signupCooldown}s before trying again.`); return }
    const err = validateStep2()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      // 1. Create Supabase auth user (DB trigger auto-creates skeleton profile)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim() },
          emailRedirectTo: FRONTEND_URL + '/dashboard',
        }
      })
      if (signUpError) throw signUpError

      if (!data.user?.id) throw new Error('User creation failed. Please try again.')

      // 2. Save full form data to localStorage.
      //    After the user clicks the verification email link and is signed in,
      //    App.jsx SIGNED_IN handler reads this and UPDATE the profile row.
      localStorage.setItem('arka_pending_profile', JSON.stringify({
        full_name:          fullName.trim(),
        phone:              phone.trim(),
        city:               city.trim(),
        delivery_zone:      deliveryZone.trim(),
        platform,
        avg_weekly_income:  Number(avgIncome),
        avg_weekly_hours:   Number(avgHours),
        upi_id:             upiId.trim(),
        onboarding_complete: true,
      }))

      // 3. Go to the email-verification waiting page or skip if not required
      setSignupCooldown(30) // 30 second cooldown before can signup again
      
      if (REQUIRE_EMAIL_VERIFICATION) {
        navigate('/verify-email', { state: { email: email.trim().toLowerCase() } })
      } else {
        // Dev mode: auto-proceed to dashboard (email not required)
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.'
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('An account with this email already exists. Sign in instead.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── Step Indicator ————————————————————————————————————————— */
  const StepIndicator = () => (
    <div className="step-indicator" style={{ marginBottom: 'var(--sp-lg)' }}>
      <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'done' : 'pending'}`}>
        {step > 1 ? <CheckCircle2 size={14} /> : '1'}
      </div>
      <div className={`step-line ${step > 1 ? 'done' : ''}`} />
      <div className={`step-dot ${step === 2 ? 'active' : 'pending'}`}>2</div>
    </div>
  )

  return (
    <div className="auth-shell">
      <div className="auth-shell-bg" />
      <div className="auth-shell-overlay" />
      
      <div className="auth-content">

        {/* ── Header ── */}
        <header className="auth-header" style={{ paddingBottom: 'var(--sp-lg)' }}>
          <div className="arka-logo">
            <img src="/logo.png" alt="ARKA Logo" className="arka-logo-img" />
          </div>

          <div className="auth-headline">
            <h1>{step === 1 ? 'Create your account' : 'Your delivery details'}</h1>
            <p>
              {step === 1
                ? 'Join ARKA to protect your weekly income from disruptions.'
                : 'These details determine your coverage and premium. Be accurate.'}
            </p>
          </div>
        </header>

        {/* ── Success State ── */}
        {success ? (
          <div className="auth-card" style={{ gap: 'var(--sp-lg)', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-xl) var(--sp-lg)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={28} color="var(--success)" />
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Registration complete</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{success}</p>
            </div>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
              Go to Sign In <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <StepIndicator />

            {/* ════════════════════════════════════════════════════
                STEP 1 — Account Info
            ════════════════════════════════════════════════════ */}
            {step === 1 && (
              <form className="auth-card" onSubmit={handleNextStep} noValidate>

                {error && (
                  <div className="alert alert-error" role="alert">
                    <AlertCircle size={15} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="section-title">Personal Info</div>

                {/* Full Name */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-name">Full Name</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><User size={16} /></span>
                    <input
                      id="reg-name"
                      type="text"
                      autoComplete="name"
                      className="field-input"
                      placeholder="As per your Aadhaar / platform ID"
                      value={fullName}
                      onChange={e => { setFullName(e.target.value); setError('') }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-email">Email Address</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><Mail size={16} /></span>
                    <input
                      id="reg-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      className="field-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-phone">Mobile Number</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><Phone size={16} /></span>
                    <input
                      id="reg-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className="field-input"
                      placeholder="10-digit mobile number"
                      value={phone}
                      maxLength={10}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                    />
                  </div>
                </div>

                <div className="section-title">Set Password</div>

                {/* Password */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-password">Password</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><Lock size={16} /></span>
                    <input
                      id="reg-password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="field-input has-suffix"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
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

                  {password && (
                    <>
                      <div className="strength-bar">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`strength-segment ${i <= strength ? STRENGTH_CLASSES[strength] : ''}`} />
                        ))}
                      </div>
                      <span className="strength-label">{STRENGTH_LABELS[strength]}</span>
                    </>
                  )}
                </div>

                {/* Terms */}
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => { setAgreed(e.target.checked); setError('') }}
                  />
                  <span className="checkbox-label">
                    I have read and agree to ARKA's{' '}
                    <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>.
                  </span>
                </label>

                <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>
                  Continue <ArrowRight size={16} />
                </button>

              </form>
            )}

            {/* ════════════════════════════════════════════════════
                STEP 2 — Delivery & Work Details
            ════════════════════════════════════════════════════ */}
            {step === 2 && (
              <form className="auth-card" onSubmit={handleRegister} noValidate>

                {error && (
                  <div className="alert alert-error" role="alert">
                    <AlertCircle size={15} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="section-title">Location</div>

                {/* City */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-city">City</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><MapPin size={16} /></span>
                    <input
                      id="reg-city"
                      type="text"
                      autoComplete="address-level2"
                      className="field-input"
                      placeholder="e.g. Vadodara, Mumbai, Pune"
                      value={city}
                      onChange={e => { setCity(e.target.value); setError('') }}
                    />
                  </div>
                </div>

                {/* Delivery Zone */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-zone">Delivery Zone</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><Navigation size={16} /></span>
                    <input
                      id="reg-zone"
                      type="text"
                      className="field-input"
                      placeholder="e.g. Waghodia, Ajwa, Harni"
                      value={deliveryZone}
                      onChange={e => { setDeliveryZone(e.target.value); setError('') }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Enter the area(s) you typically deliver in. Used for geo-fenced disruption detection.
                  </span>
                </div>

                <div className="section-title">Platform</div>

                {/* Platform selector */}
                <div className="field-group">
                  <label className="field-label">Delivery Platform</label>
                  <div className="platform-grid">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.key}
                        type="button"
                        className={`platform-btn ${platform === p.key ? 'selected' : ''}`}
                        onClick={() => { setPlatform(p.key); setError('') }}
                      >
                        <div className="platform-icon" style={{ background: `${p.color}20`, color: p.color }}>
                          {p.abbr}
                        </div>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="section-title">Weekly Work Stats</div>

                {/* Avg income */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-income">Avg. Weekly Income (₹)</label>
                  <div className="field-wrapper">
                    <span className="field-icon" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', left: 16 }}>₹</span>
                    <input
                      id="reg-income"
                      type="number"
                      inputMode="numeric"
                      className="field-input"
                      placeholder="e.g. 9500"
                      value={avgIncome}
                      min={0}
                      onChange={e => { setAvgIncome(e.target.value); setError('') }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Your average earnings per week over the last 4–8 weeks.
                  </span>
                </div>

                {/* Avg working hours/week */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-hours">Avg. Working Hours / Week</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><Clock size={16} /></span>
                    <input
                      id="reg-hours"
                      type="number"
                      inputMode="numeric"
                      className="field-input"
                      placeholder="e.g. 60"
                      value={avgHours}
                      min={1}
                      max={84}
                      onChange={e => { setAvgHours(e.target.value); setError('') }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Total hours you are active on the platform per week on average.
                  </span>
                </div>



                {/* UPI ID */}
                <div className="field-group">
                  <label className="field-label" htmlFor="reg-upi">UPI ID</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><Wallet size={16} /></span>
                    <input
                      id="reg-upi"
                      type="text"
                      inputMode="email"
                      autoComplete="off"
                      className="field-input"
                      placeholder="yourname@upi or phone@paytm"
                      value={upiId}
                      onChange={e => { setUpiId(e.target.value); setError('') }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Claim payouts are credited directly to this UPI ID — no manual withdrawal needed.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ flex: '0 0 auto', width: 'auto', padding: '14px 20px', gap: '6px' }}
                    onClick={() => { setStep(1); setError('') }}
                    disabled={loading}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="btn-spinner" /> Creating account...</>
                    ) : (
                      <>Create Account <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>

              </form>
            )}
          </>
        )}

        {!success && (
          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="btn-link">Sign in</Link>
          </div>
        )}

      </div>
    </div>
  )
}
