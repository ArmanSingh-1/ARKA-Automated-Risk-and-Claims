import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Shield, CheckCircle2, Clock, LogOut, ChevronRight, Bike } from 'lucide-react'

export default function DashboardPage() {
  const [profile, setProfile]   = useState(null)
  const [authUser, setAuthUser] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setAuthUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, city, platform, policy_status, onboarding_complete')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const displayName = profile?.full_name || authUser?.user_metadata?.full_name || 'Partner'
  const firstName   = displayName.split(' ')[0]

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="dashboard-confirm">

      {/* Top bar */}
      <div className="dashboard-topbar">
        <div className="arka-logo">
          <div className="arka-logo-icon">
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <div className="arka-logo-wordmark">
            <span className="arka-logo-name">ARKA</span>
            <span className="arka-logo-tagline">Income Protection</span>
          </div>
        </div>
        <button className="btn-ghost dashboard-signout" onClick={handleSignOut}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {/* Main confirmation card */}
      <div className="dashboard-body">

        <div className="confirm-icon-wrap">
          <CheckCircle2 size={36} color="var(--success)" strokeWidth={2} />
        </div>

        <div className="confirm-heading">
          <h1>You're in, {firstName}</h1>
          <p>Your ARKA account has been created. Your coverage will activate once your policy is confirmed.</p>
        </div>

        {/* Status row */}
        <div className="confirm-status-card">
          <div className="confirm-status-row">
            <div className="confirm-status-item">
              <span className="confirm-status-label">Account</span>
              <span className="chip chip-success">Active</span>
            </div>
            <div className="confirm-status-divider" />
            <div className="confirm-status-item">
              <span className="confirm-status-label">Policy</span>
              <span className="chip chip-orange">Pending</span>
            </div>
            <div className="confirm-status-divider" />
            <div className="confirm-status-item">
              <span className="confirm-status-label">Coverage</span>
              <span className="chip chip-muted">Not yet active</span>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="confirm-next">
          <p className="section-title" style={{ marginBottom: '12px' }}>Next Steps</p>

          <div className="confirm-step">
            <div className="confirm-step-num done"><CheckCircle2 size={14} /></div>
            <div className="confirm-step-text">
              <span className="confirm-step-title">Account created</span>
              <span className="confirm-step-sub">Your profile and delivery details are saved.</span>
            </div>
          </div>

          <div className="confirm-step">
            <div className="confirm-step-num pending"><Clock size={13} /></div>
            <div className="confirm-step-text">
              <span className="confirm-step-title">Policy enrollment</span>
              <span className="confirm-step-sub">Choose your weekly premium and set up UPI autopay.</span>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" />
          </div>

          <div className="confirm-step">
            <div className="confirm-step-num pending"><Clock size={13} /></div>
            <div className="confirm-step-text">
              <span className="confirm-step-title">Platform verification</span>
              <span className="confirm-step-sub">We verify your active delivery partner status.</span>
            </div>
          </div>

          <div className="confirm-step">
            <div className="confirm-step-num pending"><Shield size={13} /></div>
            <div className="confirm-step-text">
              <span className="confirm-step-title">Coverage begins</span>
              <span className="confirm-step-sub">After 12 active premium-paying weeks, claims are enabled.</span>
            </div>
          </div>
        </div>

        {/* CTA — placeholder for next sprint */}
        <button className="btn-primary" style={{ marginTop: '8px' }} disabled>
          Set Up Policy — Coming Soon
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
          <Bike size={13} color="var(--text-muted)" />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Built for Zepto, Blinkit &amp; Swiggy Instamart partners
          </span>
        </div>

      </div>
    </div>
  )
}
