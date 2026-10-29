# Sahayak — Smart SC Loan Assistance Platform
### Concessional Financial Assistance Discovery, Geo-Spatial Routing & Advisory Portal

Sahayak is a web platform designed to empower Scheduled Caste (SC) beneficiaries across India in discovering concessional credit schemes, assessing eligibility, calculating repayment obligations, and locating authorized Channel Partners through an interactive geo-spatial discovery and routing system.

Built with **React 18**, **Vite**, **Leaflet OpenStreetMap**, and a modern **3D Canva-style visual design system**, Sahayak provides a transparent, multilingual, and citizen-friendly digital experience.

---

## 🏛️ Project Architecture & Overview

```
                                  [ Citizen User ]
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
          [ Smart Recommender ]   [ EMI Calculator ]   [ Geo-Spatial Locator ]
          (Multi-Step Profiling) (Moratorium & Amort) (Leaflet + Haversine)
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         ▼
                             [ Partner-Specific Checklist ]
                                         │
                                         ▼
                            [ Local Application Draft ]
                                         │
                                         ▼
                             [ Application Tracker ]
                                         │
                                         ▼
                            [ Admin Portal (Demo) ]
```

### Key Modules:
- **Smart Scheme Recommender (`/eligibility`)**: 7-step guided questionnaire assessing purpose, project cost, annual family income, education, and employment against official concessional scheme limits (Micro Finance up to ₹1.40L, Term Loan up to ₹50L, Educational Loan up to ₹20L/₹30L, Sanitation/Green credit).
- **Financial EMI Calculator (`/calculator`)**: Reducing-balance monthly repayment calculations, zero-interest loan support, capitalized vs serviced moratorium interest policies, and monthly amortization schedules.
- **Geo-Spatial Partner Locator & Routing (`/partners`)**: Interactive OpenStreetMap map with custom pins for State Channelizing Agencies (SCAs), Public Sector Banks (PSBs), Regional Rural Banks (RRBs), and NBFC-MFIs. Supports client-side GPS location with explicit user permission, Haversine proximity calculations, 4-tier ranking, and legitimate navigation links.
- **Application Preparation Checklist & Draft Persistence (`/tracker`)**: Generates tailored physical document preparation checklists and saves chosen partner agencies to browser drafts with explicit confirmation.
- **Demo Administration Panel (`/admin`)**: Test portal to create, update, and manage partner records, toggle operational availability, review demo applications, and export records as JSON.
- **Multilingual Support (i18n)**: English, Hindi (हिंदी), and Marathi (मराठी) across all interfaces.

---

## 🗺️ Geo-Spatial Partner Locator Features

1. **Leaflet OpenStreetMap (Free, No Paid API Keys)**:
   - High-performance, open-source mapping engine utilizing free OpenStreetMap tile layers.
   - Interactive zoom, pan, marker popups, and synchronized map/list interaction.
   - Color-coded 3D custom pins for agency types:
     - 🟢 **SCA** (Teal): Apex State Channelizing Agencies (e.g., MPBCDC, DSFDC, UPSCFDC, TAHDCO)
     - 🔵 **PSB** (Blue): Public Sector Banks (e.g., State Bank of India, Punjab National Bank)
     - 🟠 **RRB** (Amber): Regional Rural Banks (e.g., Maharashtra Gramin Bank, Baroda UP Gramin Bank)
     - 🟣 **MFI** (Green): NBFC-MFIs & Micro-Credit Federations

2. **Client-Side GPS Location with Explicit Permission**:
   - Features a "Use My Current Location" trigger.
   - **Zero Location Fabrication**: Never assumes or fabricates user coordinates.
   - Displays an explicit privacy modal informing the citizen that coordinates are used only locally for distance computation and never transmitted externally.
   - Graceful fallback: If permission is denied or location is unavailable, clear guidance prompts manual state and district selection.
   - Provides a "Clear Location" button to reset GPS anytime.

3. **Eligibility-Aware 4-Tier Ranking Algorithm**:
   1. **Category & Institutional Mandate (Tier 1)**: SCAs receive apex priority (+50 pts) as the primary state vehicles for SC welfare credit, followed by PSBs (+40 pts) and RRBs (+35 pts).
   2. **Geographic Proximity (Tier 2)**: Computed via the Haversine formula when GPS is enabled, or based on district/state jurisdiction match.
   3. **Operational Availability (Tier 3)**: Active branches (+20 pts) ranked above limited capacity (+5 pts) or temporarily closed branches (-50 pts).
   4. **Verification Status (Tier 4)**: Verified institutional agency records (+10 pts).
   - Generates transparent, human-readable ranking highlights on every partner card explaining why the partner was matched.

4. **Strict Funding Status Disclaimer**:
   - If trusted, verified real-time funding allocation data is not available, partner cards prominently state:
     `"Funding availability not verified"`
   - The platform strictly refrains from fabricating non-performing asset (NPA) data, overdues, or fund exhaustion percentages.

5. **Routing & Application Preparation Checklist**:
   - OpenStreetMap direct navigation route link: `https://www.openstreetmap.org/directions?to={lat}%2C{lng}`
   - Dynamic document preparation checklist tailored to partner type and scheme:
     - **Micro Finance**: SC Caste Certificate, Income Certificate, Domicile/Aadhaar, Bank Passbook, Simplified Activity Proposal.
     - **Term Loan**: Detailed Project Report (DPR), Machinery Quotations, 6-Month Bank Statements.
     - **Educational Loan**: Confirmed College Admission Letter, Itemized Fee Structure, Academic Marksheets.
   - Interactive checklist with completion checkmarks and issuing authority guidance.

6. **Application Draft Assignment with Explicit Confirmation**:
   - Citizen can attach an authorized partner directly to their application draft.
   - Explicit confirmation dialog clarifies that saving stores the choice locally and **DOES NOT** transmit personal details over the internet without physical submission.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js v20+ / ESM
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Maps**: Leaflet v1.9 + OpenStreetMap Tiles
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design System with 3D Canva aesthetics, glassmorphism, responsive breakpoints, and CSS variables
- **Testing**: Native Node.js test runner (`node:test`, `node:assert/strict`)

---

## 🚀 Quickstart & Setup Commands

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd Novatrix_project

# Install dependencies (React, Vite, Leaflet, Lucide React)
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173/`**

### Running Automated Unit Tests
```bash
npm test
```
Executes 38 unit tests covering:
- Recommendation engine rule evaluation & income thresholds
- Reducing-balance, zero-interest, and moratorium EMI calculations
- Application workflow state transitions & demo reference generation
- Scheme comparison data integrity
- Haversine distance formula accuracy
- Partner category filtering & 4-tier ranking algorithm
- Partner document checklist generation

### Building for Production
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 📂 Project Structure

```
Novatrix_project/
├── index.html                           # App HTML Entry
├── package.json                         # Scripts & Dependencies
├── vite.config.js                       # Vite Configuration
├── src/
│   ├── App.jsx                          # Main App & Router Setup
│   ├── main.jsx                         # React Root Mounting
│   ├── index.css                        # 3D Canva Design System Tokens
│   ├── components/
│   │   ├── layout/                      # Navbar, Footer
│   │   ├── Map/                         # PartnerMap (Leaflet OpenStreetMap)
│   │   └── SchemeComparisonModal.jsx    # 3-Way Scheme Comparison
│   ├── data/
│   │   ├── schemes.js                   # Scheme catalog
│   │   ├── schemeRules.js               # Recommender eligibility rules
│   │   ├── partners.js                  # Channel Partner registry & coordinates
│   │   └── applications.js              # Initial demo applications
│   ├── services/
│   │   ├── recommendationEngine.js      # Smart matching & eligibility engine
│   │   ├── calculatorService.js         # Reducing balance & moratorium EMI
│   │   ├── partnerMatchingService.js    # Haversine distance & 4-tier ranking
│   │   └── applicationService.js        # Draft persistence & status workflows
│   ├── pages/
│   │   ├── Home/                        # Landing page
│   │   ├── Schemes/                     # Scheme catalog & filters
│   │   ├── Eligibility/                 # 7-Step Recommender questionnaire
│   │   ├── Calculator/                  # Financial EMI & Amortization
│   │   ├── Partners/                    # Geo-Spatial Partner Locator & Checklist
│   │   ├── Tracker/                     # Application tracker & drafts
│   │   └── Admin/                       # Partner management demo panel
│   └── i18n/
│       ├── LanguageContext.jsx          # Multi-language context provider
│       └── translations.js              # English, Hindi & Marathi dictionaries
└── tests/
    ├── recommendationEngine.test.js     # Stage 2 engine tests
    ├── calculatorService.test.js        # Stage 2 financial tests
    ├── applicationWorkflow.test.js      # Stage 2 workflow tests
    ├── schemeComparison.test.js         # Stage 2 comparison tests
    └── partnerMatching.test.js          # Stage 3 geo & ranking tests
```

---

## 📋 Data Schema: Replacing Mock Records with Official Data

Partner records in `src/data/partners.js` adhere to a clean, extensible JSON schema:

```json
{
  "id": "sca-mah-01",
  "name": "Mahatma Phule Backward Class Development Corporation (MPBCDC)",
  "nameHi": "महात्मा फुले मागासवर्ग विकास महामंडळ",
  "nameMr": "महात्मा फुले मागासवर्ग विकास महामंडळ (MPBCDC)",
  "type": "SCA",
  "state": "Maharashtra",
  "district": "Pune",
  "locality": "Shivaji Nagar",
  "address": "Administrative Building, Near Agriculture College, Shivaji Nagar, Pune, Maharashtra 411005",
  "lat": 18.5314,
  "lng": 73.8446,
  "phone": "020-25537241",
  "email": "pune.mpbcdc@maharashtra.gov.in",
  "website": "https://sjsa.maharashtra.gov.in",
  "categories": ["micro-finance", "term-loan"],
  "serviceArea": "District & Statewide",
  "verificationStatus": "verified",
  "isSample": false,
  "availabilityStatus": "active",
  "nodalOfficer": "Shri V. S. Kamble, District Manager",
  "officeHours": "Mon–Fri: 10:00 AM – 5:30 PM",
  "fundingCapacity": null,
  "lastUpdated": "2026-03-01"
}
```

### Instructions for Importing Official Records:
1. Obtain authorized partner directory CSV/JSON from State Social Justice / NSFDC / NBCFDC publications.
2. Ensure accurate WGS84 decimal latitude and longitude (`lat`, `lng`).
3. Set `isSample: false` and `verificationStatus: "verified"`.
4. Leave `fundingCapacity: null` unless verified live allocation data is connected.
5. In the demo, administrators can add or modify partner entries directly via the **/admin** panel and click **"Export Records (JSON)"** to download updated datasets.

---

## 🔒 Disclaimers & Limitations

1. **Demonstration & Educational Prototype**:
   Sahayak is an informational, hackathon demonstration platform. It does not possess direct API integrations with core banking systems or government sanctioning servers. Submitting an application creates a local demonstration record only.
2. **Client-Side Storage**:
   Preferences, application drafts, and admin changes are persisted in the browser's `localStorage`. This is for demonstration purposes and does not constitute production-grade encrypted authentication or server-side access control.
3. **Financial Estimates**:
   Calculations produced by the EMI Calculator and Recommender are indicative estimates based on configured rules. Final loan sanctioning, interest rates, and subsidies are determined by the implementing agency.
4. **Funding Availability**:
   In accordance with the hackathon brief, the platform does not fabricate confidential bank NPA statistics or unverified fund exhaustion metrics. Unverified partners are clearly labelled as *"Funding availability not verified"*.
