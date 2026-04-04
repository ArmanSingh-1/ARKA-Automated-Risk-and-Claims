import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase, API_URL } from '../lib/supabase'
import {
  Shield, CheckCircle2, LogOut, CloudRain, Activity,
  IndianRupee, MapPin, ChevronRight, RefreshCw,
  AlertTriangle, FileText, LayoutDashboard, Wifi
} from 'lucide-react'

const BACKEND = API_URL

const getRiskColor = s => s < 35 ? '#22c55e' : s < 65 ? '#f59e0b' : '#ef4444'
const getRiskLabel = s => s < 35 ? 'Low Risk' : s < 65 ? 'Moderate Risk' : 'High Risk'

function RiskGauge({ score }) {
  const color = getRiskColor(score)
  return (
    <div className="risk-gauge-wrap">
      <svg viewBox="0 0 120 70" width="180" height="108" style={{ overflow: 'visible' }}>
        <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" pathLength="100" />
        <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          pathLength="100" strokeDasharray={`${score} 100`}
          style={{ transition: 'stroke-dasharray 1.2s ease' }} />
        <text x="60" y="54" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">{score}</text>
        <text x="60" y="65" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)">/ 100</text>
      </svg>
      <span className="risk-gauge-label" style={{ color }}>{getRiskLabel(score)}</span>
    </div>
  )
}

function AppNav({ profile }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const path      = location.pathname
  const signOut   = () => supabase.auth.signOut()

  return (
    <nav className="app-nav">
      <img src="/logo.png" alt="ARKA" className="app-nav-logo" />
      <div className="app-nav-links">
        {[
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/claims',    icon: FileText,         label: 'Claims'    },
          { to: '/policy',    icon: Shield,           label: 'Policy'    },
        ].map(({ to, icon: Icon, label }) => (
          <button
            key={to}
            className={`app-nav-link ${path === to ? 'app-nav-active' : ''}`}
            onClick={() => navigate(to)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
      <div className="app-nav-right">
        {profile?.city && (
          <span className="app-nav-chip">
            <MapPin size={10} /> {profile.city}
          </span>
        )}
        {profile?.platform && (
          <span className="app-nav-chip" style={{ textTransform: 'capitalize' }}>
            {profile.platform}
          </span>
        )}
        <button className="app-nav-signout" onClick={signOut}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </nav>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [profile, setProfile]   = useState(null)
  const [authUser, setAuthUser] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [riskData, setRiskData] = useState(null)
  const [triggers, setTriggers] = useState([])
  const [backendOk, setBackendOk] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAuthUser(user)
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!profile) return   // wait until profile is loaded

    const fetchBackend = async () => {
      try {
        const [r1, r2] = await Promise.allSettled([
          fetch(`${BACKEND}/api/risk/predict-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deliveries:    profile.avg_weekly_deliveries ?? 80,
              hours:         profile.avg_weekly_hours      ?? 40,
              weekly_income: profile.avg_weekly_income     ?? null,
              platform:      profile.platform              ?? 'other',
              zone:          profile.delivery_zone         ?? '',
            }),
          }).then(r => r.json()),
          fetch(`${BACKEND}/api/trigger/latest`).then(r => r.json()),
        ])
        if (r1.status === 'fulfilled' && r1.value?.status === 'success') setRiskData(r1.value)
        if (r2.status === 'fulfilled' && r2.value?.status === 'success')
          setTriggers(Array.isArray(r2.value.data) ? r2.value.data.slice(0, 8) : [])
        setBackendOk(true)
      } catch { setBackendOk(false) }
    }
    fetchBackend()
  }, [profile])   // re-run when profile loads

  if (loading) return <div className="app-loading"><div className="loading-spinner" /></div>

  const active      = profile?.policy_status === 'active'
  const name        = profile?.full_name?.split(' ')[0] || authUser?.email?.split('@')[0] || 'Partner'
  // Use backend-calculated risk score directly; fall back to profile income heuristic
  const riskScore   = riskData?.risk_score
    ?? (profile?.avg_weekly_income
        ? Math.min(100, Math.max(0, Math.round(100 - (Number(profile.avg_weekly_income) / 25000) * 100 + 30)))
        : null)
  const weeklyIncome = riskData?.predicted_weekly_income_inr ?? profile?.avg_weekly_income ?? null
  const premiumTier  = riskData?.premium_tier ?? null
  const expiry    = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : null
  const daysLeft  = expiry ? Math.max(0, Math.ceil((expiry - new Date()) / 86400000)) : null
  const weeksPaid = profile?.weeks_paid ?? 0

  return (
    <div className="dash-shell">
      <AppNav profile={profile} />

      <div className="dash-body">

        {/* ── PAGE HEADER ── */}
        <div className="dash-page-hd">
          <div>
            <h1 className="dash-h1">Welcome back, {name}</h1>
            <p className="dash-h1-sub">
              {active
                ? `Coverage active · expires ${expiry?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'No active policy. Set up a plan to enable automatic income protection.'}
            </p>
          </div>
          <span className={`dash-status-pill ${active ? 'pill-active' : 'pill-pending'}`}>
            {active ? <CheckCircle2 size={12} /> : <Shield size={12} />}
            {active ? 'Policy Active' : 'No Coverage'}
          </span>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="dash-main-grid">

          {/* LEFT COLUMN */}
          <div className="dash-col-left">

            {/* Policy card */}
            <div className="dash-card">
              <div className="dash-card-hd">
                <Shield size={14} className="dash-card-icon" />
                <span className="dash-card-title">Policy Status</span>
                <span className={`dash-chip ${active ? 'chip-green' : 'chip-amber'}`}>
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="dash-card-bd">
                {active ? (
                  <>
                    {[
                      ['Plan type',     `${profile.plan_type?.charAt(0).toUpperCase()}${profile.plan_type?.slice(1)} plan`],
                      ['Weekly premium', `₹${profile.plan_premium_inr}`],
                      ['Expires',        `${expiry?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${daysLeft}d remaining`],
                      ['UPI ID',         profile.upi_id || '—'],
                    ].map(([l, v]) => (
                      <div key={l} className="dash-row">
                        <span className="dash-row-l">{l}</span>
                        <span className="dash-row-v" style={l === 'Expires' && daysLeft < 3 ? { color: '#ef4444' } : {}}>{v}</span>
                      </div>
                    ))}
                    <button className="dash-link-btn" onClick={() => navigate('/policy')}>
                      Manage Plan <ChevronRight size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="dash-card-empty-text">
                      No active coverage. Activate a plan to protect your income from weather disruptions, AQI events, and traffic lockdowns.
                    </p>
                    <button className="dash-primary-btn" onClick={() => navigate('/policy')}>
                      Set Up My Policy <ChevronRight size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Eligibility tracker */}
            <div className="dash-card">
              <div className="dash-card-hd">
                <Activity size={14} className="dash-card-icon" />
                <span className="dash-card-title">Claim Eligibility</span>
                <span className="dash-chip chip-muted">{weeksPaid}/12 weeks</span>
              </div>
              <div className="dash-card-bd">
                <div className="dash-elig-bar-wrap">
                  <div className="dash-elig-bar">
                    <div className="dash-elig-fill" style={{ width: `${Math.min(100, (weeksPaid / 12) * 100)}%` }} />
                  </div>
                  <div className="dash-elig-labels">
                    <span>Week {weeksPaid}</span>
                    <span>Week 12 — eligible</span>
                  </div>
                </div>
                <p className="dash-card-empty-text" style={{ marginTop: 10 }}>
                  {weeksPaid >= 12
                    ? 'You are claim-eligible. ARKA will auto-initiate payouts when a trigger fires in your zone.'
                    : `${12 - weeksPaid} more premium weeks until claim eligibility. Premiums continue after the 12-week mark.`}
                </p>
                <button className="dash-link-btn" onClick={() => navigate('/claims')}>
                  View Claims History <ChevronRight size={13} />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="dash-col-right">

            {/* Risk Score */}
            <div className="dash-card">
              <div className="dash-card-hd">
                <Activity size={14} className="dash-card-icon" />
                <span className="dash-card-title">ML Risk Score</span>
                <span className="dash-live-badge">
                  <span className="live-dot-sm" />
                  {backendOk === null ? 'Loading' : backendOk ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="dash-card-bd dash-center">
                {backendOk === null && (
                  <div className="dash-loading-state">
                    <div className="loading-spinner" />
                    <span>Calculating risk score...</span>
                  </div>
                )}
                {backendOk === false && (
                  <div className="dash-offline-state">
                    <AlertTriangle size={24} color="rgba(255,255,255,0.2)" />
                    <p>Backend offline. Start the FastAPI server to see live risk scores.</p>
                  </div>
                )}
                {backendOk === true && riskScore !== null && (
                  <>
                    <RiskGauge score={riskScore} />
                    <div style={{ width: '100%', marginTop: 12 }}>
                      {weeklyIncome && (
                        <div className="dash-row">
                          <span className="dash-row-l">Predicted weekly income</span>
                          <span className="dash-row-v">₹{Math.round(Number(weeklyIncome)).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {premiumTier && (
                        <div className="dash-row">
                          <span className="dash-row-l">Recommended premium tier</span>
                          <span className="dash-row-v" style={{ color: premiumTier === 1 ? '#22c55e' : premiumTier === 2 ? '#f59e0b' : '#ef4444' }}>
                            {premiumTier}% of weekly income
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="dash-risk-note">
                      Calculated from your {profile?.platform || 'platform'} delivery volume, working hours, and zone risk.
                      Higher score = higher risk = higher recommended premium tier.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Profile summary */}
            <div className="dash-card">
              <div className="dash-card-hd">
                <IndianRupee size={14} className="dash-card-icon" />
                <span className="dash-card-title">Profile Summary</span>
              </div>
              <div className="dash-card-bd">
                {[
                  ['Full name',    profile?.full_name   || '—'],
                  ['Platform',     profile?.platform    || '—'],
                  ['City',         profile?.city        || '—'],
                  ['Zone',         profile?.delivery_zone || '—'],
                  ['Weekly hrs',   profile?.avg_weekly_hours ? `${profile.avg_weekly_hours} hrs` : '—'],
                  ['Weekly income',profile?.avg_weekly_income ? `₹${Number(profile.avg_weekly_income).toLocaleString('en-IN')}` : '—'],
                ].map(([l, v]) => (
                  <div key={l} className="dash-row">
                    <span className="dash-row-l">{l}</span>
                    <span className="dash-row-v" style={{ textTransform: 'capitalize' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── LIVE ZONE CONDITIONS ── */}
        <div className="dash-card" style={{ marginTop: 16 }}>
          <div className="dash-card-hd">
            <CloudRain size={14} className="dash-card-icon" />
            <span className="dash-card-title">Live Zone Conditions — Vadodara</span>
            <span className="dash-live-badge">
              <span className="live-dot-sm" />
              Updated every 10 min
            </span>
            <button className="dash-icon-btn" onClick={() => window.location.reload()} title="Refresh">
              <RefreshCw size={12} />
            </button>
          </div>

          {backendOk === null && (
            <div className="dash-table-placeholder">Loading zone data...</div>
          )}
          {backendOk === false && (
            <div className="dash-table-placeholder">Backend offline — live zone data unavailable.</div>
          )}
          {backendOk === true && triggers.length === 0 && (
            <div className="dash-table-placeholder">No data yet. Monitoring runs every 10 minutes.</div>
          )}
          {backendOk === true && triggers.length > 0 && (
            <div className="dash-zone-table">
              <div className="dzt-head">
                <div>Zone</div>
                <div>Temperature</div>
                <div>Rainfall</div>
                <div>AQI</div>
                <div>Traffic Speed</div>
                <div>Status</div>
              </div>
              {triggers.map((row, i) => {
                const tempAlert = row.temperature_c >= 43
                const rainAlert = row.rainfall_mm  >= 15
                const aqiAlert  = row.aqi_index    >= 300
                const roadAlert = row.roadclosure  === true
                const alert     = tempAlert || rainAlert || aqiAlert || roadAlert
                return (
                  <div key={i} className={`dzt-row ${alert ? 'dzt-alert' : ''}`}>
                    <div className="dzt-zone">
                      <span className={`dzt-dot ${alert ? 'dzt-dot-red' : 'dzt-dot-green'}`} />
                      {(row.zone_id || '').replace('vadodara_', '').replace(/_/g, ' ') || '—'}
                    </div>
                    <div className={tempAlert ? 'dzt-val alert-val' : 'dzt-val'}>
                      {row.temperature_c != null ? `${row.temperature_c}°C` : '—'}
                    </div>
                    <div className={rainAlert ? 'dzt-val alert-val' : 'dzt-val'}>
                      {row.rainfall_mm != null ? `${row.rainfall_mm} mm` : '—'}
                    </div>
                    <div className={aqiAlert ? 'dzt-val alert-val' : 'dzt-val'}>
                      {row.aqi_index ?? '—'}
                    </div>
                    <div className="dzt-val">
                      {roadAlert ? 'Road closed' : row.currentspeed != null ? `${row.currentspeed} km/h` : '—'}
                    </div>
                    <div>
                      {alert
                        ? <span className="dzt-badge dzt-badge-alert">Threshold Exceeded</span>
                        : <span className="dzt-badge dzt-badge-ok">Normal</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <p className="dash-footer-note">
          ARKA · Automated Risk and Claims Assistant · v1.0 · IRDAI Parametric Sandbox
        </p>
      </div>
    </div>
  )
}
