import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../lib/supabase'
import {
  Shield, ArrowRight, ChevronDown, Activity, CloudRain,
  Thermometer, Wind, AlertTriangle, Waves, Lock, MapPin,
  CheckCircle2, Clock
} from 'lucide-react'

const BACKEND = API_URL

const TRIGGERS = [
  { Icon: CloudRain,     title: 'Heavy Rainfall',    threshold: '> 15mm in 3 hours',       level: 'Red',    color: '#60a5fa', pct: 100,
    desc: 'Waterlogged roads and platform order suppression across the affected zone.' },
  { Icon: Thermometer,   title: 'Extreme Heat',       threshold: '> 43°C + Humidity > 40%', level: 'Orange', color: '#f59e0b', pct: 50,
    desc: 'Heat index makes sustained outdoor riding unsafe. Platforms see significant activity drops.' },
  { Icon: Wind,          title: 'Severe Air Quality', threshold: 'AQI > 300 for 3+ hours',  level: 'Orange', color: '#a78bfa', pct: 50,
    desc: 'Hazardous air quality. Outdoor work advisories issued across the delivery zone.' },
  { Icon: AlertTriangle, title: 'Traffic Lockdown',   threshold: 'Congestion > 90% or Curfew',level: 'Red',  color: '#ef4444', pct: 100,
    desc: 'Government curfew, protest blockades, or arterial road closures in the zone.' },
  { Icon: Waves,         title: 'Flood / Waterlogging',threshold: '> 50mm in 6hrs + IMD Alert',level: 'Red', color: '#22c55e', pct: 100,
    desc: 'Composite trigger — sustained rainfall AND an official waterlogging alert. Highest payout tier.' },
]

function calcPlan(income, pct) {
  return {
    premium: Math.round((income * pct) / 100),
    payout:  Math.round(income * pct * 20 / 100),
  }
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [income, setIncome]         = useState(9500)
  const [rawIncome, setRawIncome]   = useState('9500')
  const [zones, setZones]           = useState([])
  const [activeTrigger, setActive]  = useState(0)

  useEffect(() => {
    fetch(`${BACKEND}/api/trigger/latest`)
      .then(r => r.json())
      .then(d => { if (d?.status === 'success') setZones(d.data?.slice(0, 5) || []) })
      .catch(() => {})
  }, [])

  const plan1 = calcPlan(income, 1)
  const plan2 = calcPlan(income, 2)
  const plan3 = calcPlan(income, 3)

  const handleIncomeChange = (val) => {
    setRawIncome(val)
    const n = parseInt(val.replace(/,/g, ''), 10)
    if (!isNaN(n) && n > 0) setIncome(Math.min(n, 50000))
  }

  const t = TRIGGERS[activeTrigger]

  return (
    <div className="land">

      {/* LIVE TICKER */}
      <div className="land-ticker">
        <span className="land-ticker-label">LIVE</span>
        <div className="land-ticker-track">
          <div className="land-ticker-inner">
            {(zones.length > 0
              ? zones
              : ['Sayajigunj','Waghodia','Alkapuri','Makarpura','Gotri'].map(z => ({ zone_id: `vadodara_${z.toLowerCase()}`, _placeholder: true }))
            ).map((z, i) => {
              const raw   = (z.zone_id || '').replace('vadodara_', '').replace(/_/g, ' ')
              const name  = raw.replace(/\b\w/g, c => c.toUpperCase())
              const alert = !z._placeholder && (z.rainfall_mm >= 15 || z.temperature_c >= 43 || z.aqi_index >= 300)
              const info  = z._placeholder
                ? 'Monitoring active — awaiting next data cycle'
                : `${z.temperature_c ?? '—'}°C · ${z.rainfall_mm ?? '—'}mm rain · AQI ${z.aqi_index ?? '—'}`
              return (
                <span key={i} className={`land-ticker-zone ${alert ? 'ticker-alert' : ''}`}>
                  <span className={`ticker-dot ${alert ? 'dot-red' : 'dot-green'}`} />
                  {name} · {info}
                </span>
              )
            })}
            {/* Duplicate for seamless loop */}
            {(zones.length > 0 ? zones : []).map((z, i) => {
              const name  = (z.zone_id || '').replace('vadodara_', '').replace(/_/g, ' ')
              return (
                <span key={`d${i}`} className="land-ticker-zone">
                  <span className="ticker-dot dot-green" />
                  {name} · {z.temperature_c ?? '--'}°C · {z.rainfall_mm ?? '--'}mm · AQI {z.aqi_index ?? '--'}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="land-nav">
        <img src="/logo.png" alt="ARKA" className="land-nav-logo" />
        <div className="land-nav-links">
          <a href="#calculator">Calculator</a>
          <a href="#how">How It Works</a>
          <a href="#coverage">Coverage</a>
          <a href="#scenario">Scenario</a>
        </div>
        <div className="land-nav-actions">
          <button className="land-nav-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="land-nav-cta"   onClick={() => navigate('/register')}>
            Get Protected <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="land-hero">
        <div className="land-hero-radial" />

        {/* Left */}
        <div className="land-hero-left">
          <div className="land-badge">
            <Shield size={12} /> Parametric Income Protection · Vadodara Pilot
          </div>
          <h1 className="land-h1">
            Your income,<br />protected by<br />
            <span>data, not paperwork.</span>
          </h1>
          <p className="land-hero-sub">
            ARKA monitors weather, AQI, and traffic in your delivery zone every 10 minutes.
            When a threshold is crossed, your payout fires automatically to your UPI — no claim form, no waiting.
          </p>
          <div className="land-hero-proof">
            <div className="land-proof-item">
              <span className="land-proof-n">&lt; 4 hrs</span>
              <span className="land-proof-l">payout after trigger</span>
            </div>
            <div className="land-proof-div" />
            <div className="land-proof-item">
              <span className="land-proof-n">6-layer</span>
              <span className="land-proof-l">AI fraud pipeline</span>
            </div>
            <div className="land-proof-div" />
            <div className="land-proof-item">
              <span className="land-proof-n">5 triggers</span>
              <span className="land-proof-l">auto-monitored 24/7</span>
            </div>
          </div>
        </div>

        {/* Right — Calculator */}
        <div id="calculator" className="land-hero-right">
          <div className="land-calc">
            <div className="land-calc-hd">
              <Activity size={15} color="#f59e0b" />
              <span>Premium Calculator</span>
              <span className="land-calc-live">
                <span className="live-dot-sm" /> Live
              </span>
            </div>

            <label className="land-calc-label">Your average weekly income (₹)</label>
            <div className="land-calc-input-wrap">
              <span className="land-calc-rupee">₹</span>
              <input
                type="text" className="land-calc-input"
                value={rawIncome} placeholder="9500"
                onChange={e => handleIncomeChange(e.target.value)}
              />
            </div>
            <input
              type="range" min={1000} max={30000} step={500}
              value={income} className="land-calc-range"
              onChange={e => { setIncome(Number(e.target.value)); setRawIncome(String(e.target.value)) }}
            />
            <div className="land-calc-range-labels"><span>₹1,000</span><span>₹30,000</span></div>

            <div className="land-calc-plans">
              {[
                { pct: '1%', name: 'Basic',         ...plan1 },
                { pct: '2%', name: 'Standard',      ...plan2, popular: true },
                { pct: '3%', name: 'Comprehensive', ...plan3 },
              ].map((p, i) => (
                <div key={i} className={`land-calc-plan ${p.popular ? 'calc-plan-pop' : ''}`}>
                  {p.popular && <div className="land-calc-pop-badge">Popular</div>}
                  <div className="land-calc-plan-pct">{p.pct}</div>
                  <div className="land-calc-plan-name">{p.name}</div>
                  <div className="land-calc-plan-premium">₹{p.premium.toLocaleString('en-IN')}<span>/wk</span></div>
                  <div className="land-calc-plan-arrow">→</div>
                  <div className="land-calc-plan-payout">
                    ₹{p.payout.toLocaleString('en-IN')}
                    <span>max payout</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="land-calc-cta" onClick={() => navigate('/register')}>
              Register and Select a Plan <ArrowRight size={14} />
            </button>
            <p className="land-calc-note">Actual premium recalculated after ML risk assessment of your zone and delivery history.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="land-section">
        <div className="land-inner land-center">
          <div className="land-label">Parametric Insurance</div>
          <h2 className="land-h2">Three steps.<br />All automated.</h2>

          <div className="land-timeline">
            {[
              { Icon: Activity,     step: 'Monitor',  time: 'Every 10 minutes', desc: 'Weather, AQI, and traffic APIs checked continuously across registered delivery zones.' },
              { Icon: AlertTriangle,step: 'Detect',   time: 'Under 30 seconds', desc: 'Threshold crossed — all eligible partners in the affected zone are identified.' },
              { Icon: CheckCircle2, step: 'Pay',      time: 'Under 4 hours',    desc: 'Claim validated through 6-layer fraud pipeline. Payout credited to UPI. No input needed.' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                <div className="land-tl-step">
                  <s.Icon size={24} color="rgba(255,255,255,0.35)" style={{ marginBottom: 12 }} />
                  <div className="land-tl-time">{s.time}</div>
                  <div className="land-tl-title">{s.step}</div>
                  <div className="land-tl-desc">{s.desc}</div>
                </div>
                {i < 2 && <div className="land-tl-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* SCENARIO */}
      <section id="scenario" className="land-ravi-section">
        <div className="land-inner">
          <div className="land-ravi-example-badge">
            Illustrative scenario — all figures react to your income in the calculator above
          </div>
          <div className="land-ravi-grid">
            <div>
              <div className="land-label" style={{ display: 'block' }}>Case Study</div>
              <h2 className="land-h2">
                ₹{Math.round(income * 0.61).toLocaleString('en-IN')} lost.<br />One week. No recourse.
              </h2>
              <p className="land-ravi-p">
                A Zepto delivery partner in Vadodara averaging <strong>₹{income.toLocaleString('en-IN')}/week</strong>,
                supporting a family of four with no fixed salary and no savings buffer beyond two weeks.
              </p>
              <p className="land-ravi-p">
                During a major rainfall event, 62mm fell in 6 hours. Zepto suppressed orders.
                He completed 4 deliveries instead of 22 — earning ₹{Math.round(income * 0.25).toLocaleString('en-IN')} instead of
                ₹{Math.round(income * 0.2).toLocaleString('en-IN')} per day.
                Weekly income loss: ₹{Math.round(income * 0.61).toLocaleString('en-IN')}.
              </p>
              <div className="land-ravi-callout">
                <div style={{ color: '#ef4444', fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
                  ₹{Math.round(income * 0.61).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  lost in one week · over 60% of income · no insurance, no platform support
                </div>
              </div>
            </div>

            <div className="land-ravi-card">
              <div className="land-ravi-card-hd">
                <Shield size={14} color="#22c55e" />
                <span>With ARKA — 1% tier, same scenario</span>
              </div>
              {[
                ['Weekly premium',       `₹${plan1.premium.toLocaleString('en-IN')} (1% of ₹${income.toLocaleString('en-IN')})`],
                ['Trigger detected',     'Rainfall > 15mm in 3 hrs — 11:06 AM'],
                ['Claim auto-initiated', 'No action required — system triggered it'],
                ['Fraud validated',      '6-layer AI pipeline — completed in 8 seconds'],
                ['Payout credited',      `₹${plan1.payout.toLocaleString('en-IN')} to UPI — 3h 42m later`],
              ].map(([l, v]) => (
                <div key={l} className="land-ravi-row">
                  <span className="land-ravi-row-l">{l}</span>
                  <span className="land-ravi-row-v">{v}</span>
                </div>
              ))}
              <div className="land-ravi-notif">
                "Your ARKA claim has been approved. ₹{plan1.payout.toLocaleString('en-IN')} has been transferred to your UPI."
              </div>
              <div className="land-ravi-footnote">
                Figures update automatically when you change your income in the calculator above.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRIGGERS */}
      <section id="coverage" className="land-section land-dark-section">
        <div className="land-inner">
          <div className="land-center">
            <div className="land-label">Coverage</div>
            <h2 className="land-h2">5 parametric triggers.<br />Threshold crossed — payout fired.</h2>
            <p className="land-section-sub">
              Every trigger is a measurable, verifiable data event. No assessor. No ambiguity. No negotiation.
            </p>
          </div>

          <div className="land-triggers-grid">
            {TRIGGERS.map(({ Icon, title, threshold, level, color, pct }, i) => (
              <div
                key={i}
                className={`land-trig-card ${activeTrigger === i ? 'trig-active' : ''}`}
                style={{ '--tc': color }}
                onClick={() => setActive(i)}
              >
                <Icon size={20} color={activeTrigger === i ? color : 'rgba(255,255,255,0.4)'} style={{ marginBottom: 10 }} />
                <div className="land-trig-name">{title}</div>
                <div className="land-trig-thresh">{threshold}</div>
                <div className={`land-trig-level ${level === 'Red' ? 'lv-red' : 'lv-orange'}`}>
                  {level} · {pct}% payout
                </div>
              </div>
            ))}
          </div>

          {/* Selected trigger detail */}
          <div className="land-trigger-card" style={{ borderColor: t.color + '30', background: t.color + '06', marginTop: 16 }}>
            <div className="land-trigger-card-hd">
              <t.Icon size={28} color={t.color} />
              <div style={{ textAlign: 'left' }}>
                <div className="land-trigger-title" style={{ color: t.color }}>{t.title}</div>
                <div className="land-trigger-threshold">Threshold: <strong>{t.threshold}</strong></div>
              </div>
              <div className={`land-trigger-level ${t.level === 'Red' ? 'level-red' : 'level-orange'}`}>
                {t.level} Disruption — {t.pct}% of eligible payout
              </div>
            </div>
            <p className="land-trigger-desc">{t.desc}</p>
            <div className="land-trigger-payouts">
              {[
                ['Red Disruption',    '100% of eligible payout'],
                ['Orange Disruption', '50% of eligible payout'],
                ['Data sources',      'OpenWeatherMap · CPCB AQI · TomTom Traffic'],
              ].map(([l, v]) => (
                <div key={l} className="land-trigger-payout-row">
                  <span className="land-trigger-payout-l">{l}</span>
                  <span className="land-trigger-payout-v">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="land-trust-strip">
        {[
          [Lock,       '6-Layer Fraud Detection',  'GPS verification, duplicate checks, behavioral anomaly scoring — every claim validated in seconds.'],
          [MapPin,     'Zone-Fenced Precision',     'Only disruptions in your registered delivery zone trigger your policy. City-wide events outside your zone do not count.'],
          [Shield,     'Zero-Action Claims',        'No photos, no call center, no paperwork. If the data threshold is crossed, the payout fires automatically.'],
          [CheckCircle2,'IRDAI Parametric Sandbox', 'Operating under India\'s regulator-approved framework for parametric insurance products.'],
        ].map(([Icon, title, desc]) => (
          <div key={title} className="land-trust-item">
            <Icon size={18} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div className="land-trust-body">
              <div className="land-trust-title">{title}</div>
              <div className="land-trust-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FINAL CTA */}
      <section className="land-final">
        <div className="land-final-glow" />
        <div className="land-final-inner">
          <h2 className="land-h2 land-center">
            ₹{plan1.premium}/week to protect<br />₹{plan1.payout.toLocaleString('en-IN')} of income.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
            Based on your ₹{income.toLocaleString('en-IN')}/week income. Enroll in 3 minutes.
          </p>
          <div className="land-final-btns">
            <button className="land-cta-primary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => navigate('/register')}>
              Enroll Now <ArrowRight size={16} />
            </button>
            <button className="land-cta-ghost" onClick={() => navigate('/login')}>
              Already enrolled? Sign In
            </button>
          </div>
        </div>
      </section>

      <footer className="land-footer">
        <img src="/logo.png" alt="ARKA" style={{ height: 20, filter: 'contrast(3) invert(1) brightness(2)', mixBlendMode: 'screen', opacity: 0.4 }} />
        <p>ARKA — Automated Risk and Claims Assistant · by MainQuest</p>
        <p style={{ color: 'rgba(255,255,255,0.2)' }}>Parametric Income Protection · Vadodara Pilot · IRDAI Parametric Sandbox · 2025</p>
      </footer>
    </div>
  )
}
