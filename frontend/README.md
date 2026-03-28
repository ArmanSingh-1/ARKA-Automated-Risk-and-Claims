# ARKA(Automated Risk and Claims) - by MainQuest
### AI-Powered Parametric Insurance for India's Gig Economy

---

## Table of Contents
1. [Persona & Scenario](#1-persona--scenario)
2. [Application Workflow](#2-application-workflow)
3. [Weekly Premium Models](#3-weekly-premium-models)
4. [Parametric Triggers](#4-parametric-triggers)
5. [Platform Choice — Web & Mobile](#5-platform-choice--web--mobile)
6. [AI/ML Integration](#6-aiml-integration)
7. [Adversarial Defense & Anti-Spoofing Strategy](#7-adversarial-defense--anti-spoofing-strategy)
8. [Tech Stack](#8-tech-stack)
9. [System Architecture Overview](#9-system-architecture-overview)

---

## 1. Persona & Scenario

### Our Persona: Q-Commerce Delivery Partners
We focus on delivery partners working for **Zepto, Blinkit, and Swiggy Instamart** — hyperlocal, high-frequency delivery agents who operate across urban micro-zones and are uniquely vulnerable to short, sharp environmental disruptions.

---

### Meet Ravi — A Real Story Behind the Numbers

**Ravi Sharma**, 27, is a delivery partner with Zepto in **Vadodara, Gujarat**. He has been doing this for 14 months and averages **₹9,500 per week** across roughly 10–12 hours of daily riding. He covers 3 delivery zones: Waghodia, Ajwa, and Harni . Ravi has no fixed salary, no employer-provided safety net, and no savings buffer beyond two weeks. His wife manages a small tiffin service from home; together they support a family of four.

**The disruption hits:**
It's the third week of July. A heavy rainfall warning is issued for Vadodara — 62mm of rain falls in 6 hours. Ravi attempts to complete his morning slot but the roads in Waghodia and Ajwa are waterlogged by 11 AM. The Zepto platform suppresses order volume in his zone automatically. By 3 PM, he has completed only 4 deliveries instead of his usual 22. He earns ₹480 for the day instead of his usual ₹1,900.

By the end of the week, Ravi has lost approximately ₹5,800 in income — more than 60% of his weekly earnings. There is no recourse. No platform compensates for weather-related downtime.

**With ARKA:**
Ravi enrolled in ARKA 14 weeks ago, completing his 12-week eligibility window. He pays a weekly premium of ₹95 (approximately 1% of his average income), deducted automatically via UPI autopay every Monday.

When the rainfall in his zone crosses the parametric threshold of **>15mm in 3 hours**, ARKA's real-time trigger engine detects the disruption automatically. A claim is initiated on his behalf — no form, no call, no proof required. The system cross-references Zepto's delivery activity data, validates his GPS location within the affected zone, checks for duplicate claims, and processes the payout.

Within 4 hours of the disruption being confirmed, ₹1,900 is credited to Ravi's UPI account — 20% of his 12-week average weekly income of ₹9,500. He didn't file anything. He didn't wait weeks. He just received a notification: *"Your ARKA claim has been approved. ₹1,900 has been transferred to your UPI."*

---

## 2. Application Workflow

![Workflow Diagram](assets/Workflow%20Diagram.jpg)

The application workflow is divided into three major sections:

---

### Section 1 — Onboarding

| Step | Description |
|---|---|
| Register / Login | Mobile number or email via OTP verification |
| OTP Verification | Phone or email-based identity confirmation |
| Create User Account | User record created in the database |
| Fill Profile Details | City, delivery zone, platform (Zepto/Zomato etc.), average income, working hours, UPI ID |
| Proceed to Policy | User moves to the select insurance policy and risk assessment section |

---

### Section 2 — Policy & Verification

| Step | Description |
|---|---|
| Enroll in Insurance Policy | Policy document issued with coverage terms |
| Platform Verification | API or mock call to confirm active delivery partner status |
| Verification Status | If Yes → Proceed to Risk Assessment. If No → Reject |
| Setup Autopay | Weekly UPI debit authorised by the user |
| Policy Active | Coverage begins; System monitors weekly active status |
| Weekly Deductions | Weekly premium deduction from the User's account |
| 12 Active Weeks Check | User becomes **eligible to file or receive claims** only after 12 active premium-paying weeks |
| Risk Assessment — AI Model | Income, delivery zone, and hours analysed to generate a risk profile |
| Calculate Weekly Premium | Dynamic, risk-based pricing using the risk score formula |

> **Note:** The 12-week threshold is a trust-building mechanism. It filters out bad actors enrolling solely to claim during a known upcoming disruption event. Also, weekly Deductions continue after the 12 weeks.

---

### Section 3 — Claims Processing

| Step | Description |
|---|---|
| Automated Data Fetch | Weather API, AQI API, and Traffic API data is pulled and stored |
| Detect Disruptions | System scans for parametric threshold breaches (rainfall, temperature, AQI, flood, curfew) |
| Claim Initiation | Auto-triggered by system OR manually initiated by the user |
| Fraud Detection — AI Pipeline | GPS check, activity verification, duplicate claim check, policy active check |
| Claim Valid? | If Yes → Calculate payout. If No → Reject with reason (location mismatch, inactive, duplicate) |
| Risk Assessment — AI Model | Calculate the approx. income earned without disruption |
| Calculate Payout | Based on last 12-week average income and coverage percentage |
| Process Payment | UPI / Payment Gateway (Razorpay sandbox / UPI simulator) |
| Payment Success | Worker notified; Claim record closed |

---

## 3. Weekly Premium Models

Weekly pricing is a core constraint of this platform. Gig workers operate on weekly income cycles; so does ARKA.

---

### Model 1 — Percentage-Based Payout 

The worker selects a weekly premium as a **percentage of their insured income**. The payout is a fixed multiple of that percentage.

**How it works:**
- The worker agrees to contribute X% of their 12-week average weekly income as their weekly premium.
- In the event of a valid claim, they receive a payout upto **20× their premium contribution** (capped at 60% of their baseline income).

**Example:**
- 12-week average weekly income (baseline) = ₹9,500
- Premium choice = 1% → Weekly premium = ₹95
- Coverage = 20% of baseline = ₹1,900 maximum payout per claim

**Payout Cap Rule:**
If the actual calculated loss exceeds the coverage ceiling, the payout is capped:
```
Payout = min(Actual Loss, Coverage % × Baseline Income)
```

| Premium % | Weekly Premium Paid | Max Payout |
|---|---|---|
| 1.0% | ₹95.00 | ₹1,900 (20%) |
| 2.0% | ₹190.00 | ₹3,800 (40%) |
| 3.0% | ₹285.00 | ₹5,700 (60%) |

---

### Model 2 — Value-Based Payout 

For workers with irregular weekly schedules (seasonal workers, part-timers), this model provides a fixed rupee-value coverage regardless of whether they were active that particular week.

**How it works:**
- The worker selects a flat weekly premium amount (e.g., ₹75/week) paid for a specific time period.
- Each premium week purchased corresponds to a defined coverage value from a tiered table.
- Non-active weeks (where no deliveries were made) still count toward coverage as long as the premium was paid for that week.

**Tiered Coverage Table (Indicative):**

| Weekly Premium Paid | Max Payout |
|---|---|
| ₹50 | ₹1,000 |
| ₹75 | ₹1,875 |
| ₹100 | ₹3,000 |

> **Reason for two models:** Model 1 suits high-frequency, consistent workers like Ravi. Model 2 suits seasonal or part-time gig workers whose income is less predictable. Offering both increases accessibility and user base.

---

## 4. Parametric Triggers

Parametric insurance pays out when a pre-defined, objectively measurable condition is met — no subjective claim assessment needed. Below are the **5 core triggers** for our Q-Commerce Delivery persona, with defined thresholds sourced from IMD (India Meteorological Department) advisory standards.

---

| # | Trigger | Data Source | Threshold | Disruption Classification |
|---|---|---|---|---|
| 1 | **Heavy Rainfall** | Weather API (OpenWeatherMap / IMD) | > 15mm in 3 hours OR > 35mm in 6 hours within delivery zone | Red — full disruption |
| 2 | **Extreme Heat** | Weather API | Temperature > 43°C AND Humidity > 40% for > 4 consecutive hours | Orange — partial disruption |
| 3 | **Severe Air Quality (AQI)** | AQI API (CPCB / OpenAQ) | AQI > 300 (Hazardous) sustained for > 3 hours | Orange — partial disruption |
| 4 | **Traffic Lockdown / Curfew** | Traffic API + Manual Flag | Road congestion index > 90% across ≥ 3 major arterials OR govt. curfew notice flag | Red — full disruption |
| 5 | **Flood / Waterlogging** | Weather API + AQI API composite | Rainfall > 50mm in 6 hours AND waterlogging alert issued for delivery zone | Red — full disruption |

**Disruption Payout Scale:**
- Red (Full Disruption): 100% of eligible payout
- Orange (Partial Disruption): 50% of eligible payout
- Yellow (Minor Disruption): 25% of eligible payout (optional tier — to be finalised)

> All thresholds are geo-fenced to the **worker's registered delivery zone** (latitude/longitude bounding box). A disruption in another city does not trigger a payout for a worker registered in Vadodara.

---

## 5. Platform Choice — Web & Mobile

**Decision: Dual-Platform — Progressive Web App (PWA) for Workers, Web Dashboard for Admin**

---

### Why Not a Native App?

Building separate native apps for Android and iOS would split the team's development bandwidth at exactly the wrong time — Phase 2 requires the full focus on backend pipelines, ML models, and claims logic. More critically, a Play Store / App Store distribution model creates a barrier for gig workers: app update friction, device storage concerns, and the fact that many delivery partners in Tier-2 cities are on entry-level Android devices with limited app management habits.

A **Progressive Web App (PWA)** solves all of this while delivering an experience that is functionally indistinguishable from a native app for 95% of the worker journey.

---

### What is a PWA and How Does ARKA Use It?

A PWA is a React web application enhanced with three core browser technologies that give it native-app capabilities:

**1. Service Worker — Offline-First Resilience**
A Service Worker is a background JavaScript process that sits between the app and the network. For ARKA, this means:
- A worker can open the app, check their policy status, and view their last payout — even with zero network connectivity (common during heavy rain or in low-signal delivery zones).
- Claim status and profile data are cached locally on the device. The app syncs automatically when connectivity is restored.
- During a disruption event (when network is most unreliable), the worker still sees a clear status screen rather than a broken loading spinner.

**2. Web App Manifest — Install to Home Screen**
The manifest file tells the browser how to present the app when installed. Once a worker visits the ARKA URL and taps "Add to Home Screen" (prompted automatically by Android Chrome):
- The app launches in full-screen mode with no browser chrome — identical to a native app launch experience.
- It appears on the home screen with the ARKA icon and name, just like Zepto or Swiggy.
- No Play Store. No download. No update friction — the app updates silently in the background.

**3. Push Notifications — The Critical UX Requirement**
This is the most important PWA capability for ARKA. Claim payouts and disruption alerts are time-sensitive. Using the Web Push API:
- Workers receive push notifications on their lock screen the moment a claim is approved or a payout is processed — even when the app is not open.
- The system sends an alert the instant a parametric trigger is detected in their zone: *"Heavy rain alert in your delivery zone. If you're unable to work, a claim may be auto-initiated."*
- Workers are notified of weekly premium deductions, policy renewal reminders, and claim review updates.

---

### Why Web for the Admin / Insurer Dashboard

The admin-side interface — fraud monitoring, loss ratio analytics, zone risk heatmaps, and claim review queues — is accessed on desktop by administrators, not field workers. This benefits from full screen real estate and does not need PWA installation or push capabilities. A standard React web app served at a separate `/admin` route is the right fit.

---

### Feature Split

| Feature | Worker (PWA — Mobile) | Admin (Web — Desktop) |
|---|---|---|
| Onboarding & Registration | Primary | — |
| Policy Enrollment & Autopay | Primary | — |
| Claim Notifications (Push) | Lock-screen push | Dashboard alert |
| Payout Status | In-app (cached offline) | Dashboard |
| Disruption Alert | Push + in-app banner | Zone map alert |
| Risk Analytics | — | Primary |
| Fraud Monitoring & Review | — | Primary |
| Zone Disruption Heatmap | Simplified view | Full analytics |
| Claim Appeal Submission | In-app form | — |

---

### Why PWA is the Right Call for India's Gig Workers Specifically

- **Low-end Android coverage:** PWAs run on any device with a modern browser. No minimum specs beyond what Zepto or Swiggy already require.
- **Data-light:** Service Worker caching means the app loads from local storage after the first visit — minimal data usage on subsequent opens, important for workers on limited mobile data plans.
- **No update management:** Workers never need to manually update the app. The Service Worker fetches the latest version in the background on each visit.
- **Single codebase:** One React codebase serves both the mobile PWA and the admin dashboard, reducing development overhead significantly in a 6-week sprint.

---

## 6. AI/ML Integration

Three distinct AI/ML pipelines are integrated into the ARKA platform.

---

### 6.1 AI for Risk Assessment — Dynamic Premium Calculation

![Risk Assessment Model](assets/Risk%20Assessment.png)

Risk Assessment in ARKA serves two purposes: estimating a worker's **predicted weekly income** under normal conditions (used as the baseline for payout calculation), and generating a **risk score** that drives their dynamic weekly premium.

**Input Features:**
- Average deliveries per week
- Average hours worked per week
- Average distance covered per week (km)
- Zone risk score (historical disruption frequency of the worker's delivery zone)
- Performance rating (minor weight)

**The Ensemble Model Approach**

Rather than relying on a single model, ARKA uses an **ensemble of two complementary models** — a Multi-Linear Regression (MLR) and a Random Forest Regressor (RFR) — combined through a stacking/voting strategy to produce a final prediction that is both accurate and auditable.

*Step 1 — Individual Model Training & Fine-Tuning*

Both models are trained independently on the worker's historical weekly data and then fine-tuned:
- The **MLR** is fine-tuned by iterating on feature weights and normalisation strategy to minimise mean absolute error on the training set. Its primary value is interpretability — each feature's coefficient is readable and explainable to a regulator or auditor.
- The **RFR** is fine-tuned via hyperparameter search (number of trees, max depth, minimum samples per leaf) to reduce variance without overfitting. It captures non-linear patterns the MLR cannot — such as the compounding effect of bad weather + low delivery zone activity on income.

*Step 2 — Stacking / Voting Ensemble*

After individual fine-tuning, the two models are combined:
- Both models independently predict the worker's weekly income.
- A **weighted average (soft voting)** is used: the MLR prediction carries higher weight for workers with stable, consistent histories (where linear relationships hold well); the RFR carries higher weight when the worker's data shows high variability or zone-level risk factors dominate.
- For Phase 2, a fixed 50/50 weight split is used as a baseline. In Phase 3, a meta-learner (a lightweight logistic layer) will learn the optimal weighting per worker profile.

*Step 3 — Output to Income Loss Calculation*

The ensemble's predicted income is used in the payout formula:

```
Baseline Income  = Average of last 12 weeks' actual income
Predicted Income = Ensemble model output under disruption conditions
Actual Loss      = (Baseline Income − Predicted Income)
Final Payout     = min(Actual Loss, Coverage % × Baseline Income)
```

**Example:**
- Baseline = ₹9,500 | Ensemble predicted income under disruption = ₹4,500
- Loss % = 52.6% → Actual Loss = ₹4,997
- Coverage cap at 2% premium tier (40%) = ₹3,800
- **Final Payout = ₹3,800**

**Why an Ensemble Over a Single Model?**
A single MLR is transparent but can underfit for workers with irregular income. A single RFR is accurate but opaque — hard to justify payouts to a regulator. The ensemble gets the best of both: the RFR improves accuracy, the MLR provides the explainability layer. In the event of a disputed payout, the MLR coefficients can be shown as evidence of how the figure was calculated.

---

### 6.2 AI Pipeline for Fraud Detection

Every claim — whether auto-triggered by the monitoring engine or manually initiated by the worker — is routed through a **multi-layer sequential verification system** before any payout is processed. A claim must pass every layer to be approved. The pipeline is designed to be fast (all layers complete within seconds for auto-triggered claims) and explainable (each rejection carries a specific reason code returned to the worker and logged for audit).

![Fraud Detection Pipeline](assets/Fraud%20Detection%20Pipeline.png)

The pipeline is triggered by a **Delivery ID** — the unique identifier for a delivery transaction. Using Delivery ID as the entry key (rather than User ID or date alone) ensures that each discrete delivery event can only ever be claimed once, which is the first and most fundamental fraud gate.

The six verification layers are executed in sequence:

1. **Duplicate Delivery ID Check (Layer 1):** A hash-set lookup against the claims database confirms whether this Delivery ID has ever been submitted before. Hash-set lookups operate at O(1) speed, making this the fastest and cheapest rejection possible. If the ID exists in the set, the claim is rejected immediately — no further processing occurs.

2. **Weather Verification (Layer 2):** The Weather API is called with the pickup and drop latitude/longitude coordinates of the delivery. The system calculates the approximate midpoint of the route to represent conditions along the full journey, then compares the returned values — rainfall, temperature, wind speed, visibility, humidity — against the 5 parametric trigger thresholds. If no threshold is breached, the claim is rejected with a specific reason: the weather data does not support a disruption event at this location and time.

3. **Location Verification (Layer 3):** GPS geofencing using the **Haversine distance algorithm** confirms that the worker's recorded coordinates at the time of disruption fall within their registered delivery zone boundary. This layer catches workers attempting to claim for disruptions in zones they do not operate in — a key signal of both opportunistic fraud and coordinated ring activity.

4. **Duplicate Disruption Check (Layer 4):** A sustained disruption event (e.g., a 3-day flood) is treated as a single claimable event, not three separate daily claims. This layer checks whether an active disruption record already exists for the same event, zone, and worker combination. If a record exists and the worker has already been paid for this disruption, the new claim is rejected. If the record exists but the worker has not yet been paid (e.g., they are filing manually while an auto-claim is still processing), the new submission is merged into the open event record — ensuring the worker is paid exactly once per disruption event, without delay.

5. **Weekly Claim Limit Check (Layer 5):** Each worker has a claim frequency ceiling derived from their average deliveries per week and historical claim behaviour. The initial payout rate for new claimants is 100%. After 5 or more approved claims, the rate adjusts to 60% plus a calculated component based on delivery volume. This is not a punitive measure — it is a statistical control that ensures high-frequency claimers are cross-checked more carefully, as genuine disruptions of that frequency are statistically unusual for any single worker.

6. **Anomaly Detection (Layer 6):** A rule-based check combined with a **Decision Tree classifier** evaluates the claim against the worker's historical behavioural baseline. It flags claims filed on days with historically low disruption frequency in the zone, claims submitted outside the worker's typical working hours, and patterns inconsistent with the severity of the reported event. The classifier outputs a **fraud score from 0 to 100**. Scores of 0–35 are auto-approved. Scores of 36–65 are soft-held for manual review with a partial payout released. Scores above 65 are rejected with reason.

---

### 6.3 AI for Real-Time Trigger Monitoring

An automated scheduled pipeline that fetches data from three APIs and evaluates all active users in affected zones:

![Real-Time Trigger Monitoring](assets/Real%20Time%20Trigger%20Monitoring.png)

- **Weather API** → Rainfall (mm), Temperature (°C), Humidity (%), Wind speed, Visibility, Storm flags
- **AQI API** → Particulate matter (PM2.5/PM10), AQI index value
- **Traffic API** → Road congestion index, route blockage flags

The monitoring engine:
1. Fetches data every hour for all registered delivery zones
2. Evaluates each zone against the 5 parametric trigger thresholds
3. Identifies all active policyholders in triggered zones
4. Auto-initiates claims for eligible workers (those past 12-week mark, policy active, premium paid for the week)
5. Passes each claim through the fraud detection pipeline
6. Processes payouts for approved claims

---

## 7. Adversarial Defense & Anti-Spoofing Strategy

> **Context:** A coordinated syndicate of 500 delivery workers organized via Telegram was found to be using GPS-spoofing applications to fake their locations inside red-alert weather zones — while physically sitting at home — in order to trigger mass false payouts on a competing parametric platform. ARKA's architecture is designed to be resilient against exactly this class of attack.

---

### 7.1 The Differentiation — Genuine Worker vs. GPS Spoofer

The core insight is this: **GPS coordinates are just one signal. A real delivery partner in a disruption zone leaves dozens of corroborating digital footprints. A spoofer fakes only one.**

ARKA's anti-spoofing layer cross-references GPS with a multi-signal behavioral fingerprint:

| Signal | Genuine Stranded Worker | GPS Spoofer (at home) |
|---|---|---|
| **Platform activity (Zepto/Zomato API)** | Marked as "unavailable" or "no orders in zone" by the platform itself | Platform may still show them as "online" and receiving order pings |
| **Accelerometer / motion data** | Motion pattern consistent with a stationary or slowly moving person in bad weather | Completely static — no micro-vibrations consistent with outdoor activity |
| **Last known delivery location** | Last completed delivery was within or near the disruption zone | Last completed delivery was in a different zone, hours before the event |

**Implementation:** The ARKA mobile app collects the last known location of the delivery partner from the platform API, along with real-time GPS data and the registered zone data. This data is bundled with each claim and scored by the fraud pipeline before any payout is processed.

---

### 7.2 The Data — Detecting a Coordinated Fraud Ring

Individual spoofers are detectable. A coordinated ring of 500 requires a second layer of analysis that looks at the **collective pattern**, not just individual claims. The following data points are analyzed at a population level:

**Temporal Clustering Analysis**
A genuine weather disruption causes organic, staggered claim initiations — workers notice the disruption at different times and file accordingly. A coordinated ring receives a Telegram notification at the same moment and triggers claims within seconds of each other. ARKA detects this through a real-time velocity check:

| Check | Logic | Action |
|---|---|---|
| Baseline velocity | Historical average claims per zone per hour | Stored per zone in DB |
| Spike detection | If claims in zone X within 10 minutes > 3× baseline | Flag entire zone batch |
| Outcome | Flagged batch held; each individual claim scored independently | Escalated to admin for syndicate review |

This means a genuine mass disruption (where many workers legitimately claim at once) is still handled correctly — each individual claim in the flagged batch goes through full fraud scoring independently. Only claims that also fail individual-level checks are rejected.

**Historical Behavioral Deviation Score**
Every worker has a behavioral baseline — their typical working hours, average active days per week, zones they operate in. A claim that falls entirely outside this baseline (e.g., a worker who never operates in Andheri East suddenly claims a disruption there) is scored as high-anomaly by the decision tree model.

**Summary — Data Points Used for Ring Detection:**

| Data Point | Purpose |
|---|---|
| Claim timestamp spread (seconds between filings) | Temporal clustering → coordinated trigger detection |
| Platform API active/inactive status | Worker online on Zepto = not stranded |
| Last delivery zone vs claimed zone | Behavioral baseline deviation |
| Historical claim frequency | Sudden first-time claimers in a coordinated group |

---

### 7.3 The UX Balance — Protecting Honest Workers from False Flags

The biggest risk of a robust fraud system is **false positives** — flagging an honest worker who is genuinely stranded but happens to have a weak GPS signal or a patchy mobile connection in bad weather. This is not just a UX problem; it is a trust problem. A worker who gets wrongly rejected once will never use the platform again.

ARKA handles flagged claims through a **tiered review system** — not a binary approve/reject:

```
Claim Submitted
      │
      ▼
Fraud Pipeline Score
      │
      ├── Score 0–35 (Low Risk) ─────────────────► Auto-Approve → Instant Payout
      │
      ├── Score 36–65 (Medium Risk / Ambiguous) ──► SOFT HOLD: Partial Payout + Review
      │                                              ├── 50% payout released immediately
      │                                              ├── Worker notified with clear reason
      │                                              ├── 24-hour review window
      │                                              └── Worker can submit supplementary evidence
      │
      └── Score 66–100 (High Risk) ─────────────► Hold + Human Review Flag
                                                   ├── No payout until reviewed
                                                   ├── Worker notified immediately (not silent rejection)
                                                   └── Escalated to admin dashboard
```

**Key principles for the honest worker experience:**

**Transparent Communication, Not Silent Rejection**
When a claim is soft-held, the worker receives an immediate push notification:
> *"Your claim is being verified. This usually takes under 24 hours. If confirmed, your payout will be processed without delay. No action needed from you right now."*

The message is reassuring, not accusatory. The worker is never told they are "suspected of fraud."

**Supplementary Evidence Window (Optional, Not Mandatory)**
Workers in the soft-hold tier can optionally submit a photo of their surroundings (flooded road, waterlogged lane) or a screenshot showing their delivery app marked as "no orders available in your zone." This is never required for genuine workers — it is offered as an accelerator to clear their claim faster.

**Appeal Mechanism**
Any rejected claim can be appealed once within 48 hours. The appeal triggers a fresh human review by the ARKA admin team with full claim metadata visible. Workers receive the appeal outcome with a written explanation — not just "rejected."

---

> **Architectural Note:** The anti-spoofing layer described above is a **non-invasive, passive data collection** model. The ARKA app does not track workers continuously. Sensor and network data is collected **only at the moment a claim event is detected** — not stored permanently. This is clearly communicated to workers at onboarding to build trust and address privacy concerns.

---

## 8. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React JS (PWA) | Worker-facing UI + Admin dashboard |
| **Backend** | Python — FastAPI | REST API, ML model serving, claim processing |
| **ML / Data** | scikit-learn, pandas, NumPy | Risk assessment models, fraud detection |
| **Database** | PostgreSQL | User records, policy data, claims, weekly delivery data |
| **Cache / Lookup** | Redis | Hash-set for Delivery ID duplicate checks (fast O(1) lookup) |
| **External APIs** | OpenWeatherMap, OpenAQ (CPCB), Google Maps / TomTom | Weather, AQI, traffic triggers |
| **Payment** | Razorpay (test mode) / UPI Simulator | Premium autopay, claim payout |
| **Scheduler** | APScheduler (Python) | Daily data fetch, automated trigger monitoring |
| **Auth** | Firebase Authentication / JWT | OTP-based login |
| **Hosting** | To be decided (AWS / Railway / Render for demo) | Deployment |

---

## 9. System Architecture Overview

ARKA is built as a three-tier architecture: a React PWA frontend, a FastAPI Python backend, and a set of decoupled background services for data ingestion, ML inference, and payment processing. Every component is stateless and independently scalable.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         FRONTEND — React PWA                                 ║
║                                                                              ║
║   ┌─────────────────────────────┐    ┌─────────────────────────────────┐     ║
║   │    WORKER APP (Mobile PWA)  │    │   ADMIN DASHBOARD (Web)         │     ║
║   │                             │    │                                 │     ║
║   │  • Onboarding & KYC         │    │  • Fraud Review Queue           │     ║
║   │  • Policy Enrollment        │    │  • Zone Risk Heatmap            │     ║
║   │  • Claim Status             │    │  • Loss Ratio Analytics         │     ║
║   │  • Push Notifications       │    │  • Predictive Disruption View   │     ║
║   │  • Payout History           │    │  • Worker Activity Monitor      │     ║
║   └──────────────┬──────────────┘    └────────────────┬────────────────┘     ║
║                  │  Service Worker (Offline Cache)    │                      ║
╚══════════════════╪════════════════════════════════════╪══════════════════════╝
                   │         HTTPS / REST API           │
╔══════════════════╪════════════════════════════════════╪════════════════════╗
║                  ▼    BACKEND — FastAPI (Python)      ▼                    ║
║                                                                            ║
║   ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────────┐  ║
║   │   Auth   │ │Onboarding│ │Policy & Risk │ │  Claims  │ │  Payout     │  ║
║   │  Module  │ │ Module   │ │   Engine     │ │   API    │ │  Processor  │  ║
║   │          │ │          │ │              │ │          │ │             │  ║
║   │OTP/JWT   │ │Profile   │ │Premium calc  │ │Fraud     │ │UPI Debit    │  ║
║   │Firebase  │ │KYC verify│ │Risk scoring  │ │pipeline  │ │Payout push  │  ║
║   └────┬─────┘ └────┬─────┘ └─────┬────────┘ └───┬──────┘ └────┬────────┘  ║
║        │            │             │              │             │           ║
╚════════╪════════════╪═════════════╪══════════════╪═════════════╪═══════════╝
         │            │             │              │             │
    ┌────▼────┐  ┌────▼────┐   ┌────▼────┐    ┌────▼────┐   ┌────▼────────┐
    │ Firebase│  │Postgres │   │scikit-  │    │  Redis  │   │  Razorpay   │
    │  Auth   │  │   DB    │   │ learn   │    │  Cache  │   │  (sandbox)  │
    │         │  │         │   │ Models  │    │         │   │  UPI Sim.   │
    │OTP store│  │Users    │   │MLR Risk │    │Delivery │   │             │
    │JWT keys │  │Policies │   │RF Fraud │    │ID Hash  │   │Autopay      │
    │         │  │Claims   │   │Decision │    │Set (O1) │   │Payout       │
    │         │  │Payouts  │   │Tree     │    │Session  │   │             │
    └─────────┘  └─────────┘   └────┬────┘    └─────────┘   └─────────────┘
                                    │
╔═══════════════════════════════════╪════════════════════════════════════════╗
║          BACKGROUND SERVICES      │    (APScheduler — runs every hour)     ║
║                                   ▼                                        ║
║   ┌───────────────────────────────────────────────────────────────────┐    ║
║   │                  TRIGGER MONITORING ENGINE                        │    ║
║   │                                                                   │    ║
║   │   Fetch ──► Evaluate ──► Detect ──► Initiate ──► Fraud ──► Pay    │    ║
║   └───────────────────────────────┬───────────────────────────────────┘    ║
║                                   │                                        ║
║               ┌───────────────────╪──────────────────┐                     ║
║               ▼                   ▼                  ▼                     ║
║          ┌───────────┐       ┌───────────┐      ┌───────────┐              ║
║          │ Weather   │       │  AQI API  │      │ Traffic   │              ║
║          │    API    │       │ (CPCB /   │      │    API    │              ║
║          │           │       │  OpenAQ)  │      │           │              ║
║          │Rain,Temp  │       │ PM2.5/PM10│      │Congestion,│              ║
║          │Humidity   │       │ AQI Index │      │Blockages  │              ║
║          │Wind,Storm │       │           │      │           │              ║
║          └───────────┘       └───────────┘      └───────────┘              ║
╚════════════════════════════════════════════════════════════════════════════╝
```

### Key Architectural Decisions

**Why FastAPI over Django/Flask?**
FastAPI is async-native, which is critical for ARKA's claims pipeline — multiple concurrent API calls (Weather API, AQI API, location verification) need to resolve in parallel for each claim, not sequentially. FastAPI's automatic OpenAPI documentation also makes it easier to mock and test API contracts during development.

**Why Redis for Delivery ID deduplication?**
Duplicate claim prevention is the highest-traffic, lowest-latency operation in the system. Checking a hash-set in Redis is an O(1) in-memory operation that completes in under 1ms. Using PostgreSQL for this check would introduce disk I/O on every single claim — Redis eliminates this bottleneck entirely.

**Why PostgreSQL over NoSQL?**
Insurance data has inherent relational structure: a Worker has Policies, Policies have Claims, Claims have Payouts. The integrity constraints and ACID compliance of PostgreSQL are non-negotiable for financial data. NoSQL's schema flexibility is a liability, not an asset, in this domain.

**Why APScheduler over a dedicated queue (Celery/RabbitMQ)?**
For a Phase 1–2 prototype, APScheduler embedded in the FastAPI process is sufficient. The trigger monitoring job runs hourly and is not latency-critical. A migration path to Celery + Redis as a proper task queue is planned for Phase 3 if claim volume requires it.

---

## Constraints & Scope Boundaries

As per hackathon requirements, ARKA **explicitly excludes**:
- Health insurance or accident medical coverage
- Vehicle repair or damage payouts
- Life insurance
- Coverage for events outside the registered delivery zone

ARKA **only covers**:
- Loss of income caused by objectively measurable external disruptions
- Weekly parametric payouts based on pre-defined thresholds
- Income protection for active, verified delivery partners

> **Note on the 12-Week Premium Logic:** Workers pay their selected weekly premium from the moment they enroll. The initial premium is calculated using the self-reported income and zone data provided during onboarding — this serves as an estimate. After 12 active weeks, the AI Risk Assessment model recalculates the premium using actual verified delivery data, and the worker's premium is adjusted accordingly going forward. This is clearly disclosed at onboarding.

---

*ARKA by MainQuest — Because every delivery partner deserves a safety net.*
