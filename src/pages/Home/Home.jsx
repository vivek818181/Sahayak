// pages/Home/Home.jsx — Canva-Inspired 3D Interactive Home Page & Showcase
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Search,
  ClipboardCheck,
  Calculator,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  TrendingUp,
  Award,
  Wallet,
  Zap,
} from 'lucide-react';
import './Home.css';

export default function Home() {
  const { t, language } = useLanguage();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Smooth Canva-inspired 3D pointer tracking
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Controlled subtle tilt (max 9 degrees)
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const features = [
    {
      icon: Search,
      title: t('home.feature1Title'),
      desc: t('home.feature1Desc'),
      to: '/schemes',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
      color: '#0d9488',
    },
    {
      icon: ClipboardCheck,
      title: t('home.feature2Title'),
      desc: t('home.feature2Desc'),
      to: '/eligibility',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#6366f1',
    },
    {
      icon: Calculator,
      title: t('home.feature3Title'),
      desc: t('home.feature3Desc'),
      to: '/calculator',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
      color: '#0284c7',
    },
    {
      icon: MapPin,
      title: t('home.feature4Title'),
      desc: t('home.feature4Desc'),
      to: '/partners',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      color: '#f59e0b',
    },
  ];

  const steps = [
    { num: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { num: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { num: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
    { num: '04', title: t('home.step4Title'), desc: t('home.step4Desc') },
  ];

  return (
    <div className="page-enter">
      {/* 3D CANVA HERO SECTION */}
      <section className="hero">
        <div className="container hero-inner">
          {/* Left: Value Proposition */}
          <div className="hero-content animate-fade-in-up">
            <div className="hero-badge">
              <Sparkles size={15} color="var(--color-teal-600)" />
              <span>{t('home.heroBadge')}</span>
            </div>

            <h1 className="hero-title">
              <span className="hero-brand">{t('home.brand')}</span>
            </h1>

            <p className="hero-tagline">{t('home.tagline')}</p>
            <p className="hero-description">{t('home.description')}</p>

            <div className="hero-ctas">
              <Link to="/schemes" className="btn btn-primary btn-lg" id="cta-find-scheme">
                <Search size={18} />
                {t('home.ctaPrimary')}
              </Link>
              <Link to="/calculator" className="btn btn-secondary btn-lg" id="cta-calculate-emi">
                <Calculator size={18} />
                {t('home.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Right: Interactive 3D Showcase Card with Perspective Tilt */}
          <div className="hero-visual-3d animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div
              ref={cardRef}
              className="canva-3d-stage"
              id="hero-assistant-card"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: isHovering
                  ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-5px)`
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
                transition: isHovering ? 'transform 0.08s ease-out' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
              }}
            >
              {/* Dynamic glare highlight on pointer movement */}
              {isHovering && (
                <div
                  className="canva-card-glare"
                  style={{
                    background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.32) 0%, transparent 65%)`,
                  }}
                  aria-hidden="true"
                />
              )}

              {/* 1. Header: Sahayak Logo & Renamed Sahayak Assistant */}
              <div className="canva-stage-header">
                <div className="canva-stage-logo">
                  <div className="canva-stage-icon">स</div>
                  <h3 className="canva-stage-title-violet">
                    <Sparkles size={16} className="violet-sparkle-icon" />
                    {t('home.assistantTitle')}
                  </h3>
                </div>
                <span className="badge badge-teal">{t('home.livePreview')}</span>
              </div>

              {/* 2. Loan Assistance Section: Term Loan */}
              <div className="canva-stage-hero-item">
                <div className="canva-stage-hero-label">{t('home.termLoanAssistance')}</div>
                <div className="canva-stage-hero-val">{t('home.upTo50Lakh')}</div>
                <div className="canva-stage-hero-sub">
                  {t('home.manufacturingAgro')}
                </div>
              </div>

              {/* 3. Information Row: Micro Finance Limit & Moratorium */}
              <div className="canva-stage-grid">
                <div className="canva-stage-tile">
                  <div className="canva-stage-tile-sub">{t('home.microFinanceLimit')}</div>
                  <div className="canva-stage-tile-num" style={{ color: 'var(--color-teal-700)' }}>
                    ₹1.40 L
                  </div>
                </div>
                <div className="canva-stage-tile">
                  <div className="canva-stage-tile-sub">{t('home.applicableMoratorium')}</div>
                  <div className="canva-stage-tile-num" style={{ color: '#6366f1' }}>
                    {t('home.moratoriumMonths')}
                  </div>
                </div>
              </div>

              {/* 4. Interest-Rate Section */}
              <div className="canva-stage-section-card rate-section-card">
                <div className="section-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="section-card-content">
                  <div className="section-card-label">{t('home.indicativeRate')}</div>
                  <div className="section-card-val">{t('home.rateRange')}</div>
                  <span className="section-card-note">{t('home.illustrativeAgencyTerms')}</span>
                </div>
              </div>

              {/* 5. Channel Partner Section */}
              <div className="canva-stage-section-card partner-section-card">
                <div className="section-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <Shield size={16} />
                </div>
                <div className="section-card-content">
                  <div className="section-card-label">{t('home.partnerCategories')}</div>
                  <div className="section-card-val">{t('home.partnerAgencies')}</div>
                  <span className="section-card-note">{t('home.preliminaryAgencyReq')}</span>
                </div>
              </div>

              {/* 6. Primary Action: Find My Scheme */}
              <Link
                to="/schemes"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}
                id="hero-card-find-scheme"
              >
                <Search size={16} />
                {t('home.ctaPrimary') || 'Find My Scheme'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3D CANVA FEATURES SECTION */}
      <section className="section" id="features">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--space-12)' }}>
            <span className="badge badge-teal" style={{ marginBottom: 'var(--space-2)' }}>
              {t('home.comprehensiveToolset')}
            </span>
            <h2 className="section-title">{t('home.featuresTitle')}</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              {t('home.featuresSubtitle')}
            </p>
          </div>

          <div className="features-grid stagger-children">
            {features.map((f, i) => (
              <Link to={f.to} key={i} className="feature-card">
                <div className="feature-icon-3d" style={{ background: f.gradient, color: '#ffffff' }}>
                  <f.icon size={26} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <span className="feature-link-3d">
                  {t('home.exploreNow')}
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3D HOW IT WORKS STEPS */}
      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--space-12)' }}>
            <span className="badge badge-navy" style={{ marginBottom: 'var(--space-2)' }}>
              {t('home.simple4Step')}
            </span>
            <h2 className="section-title">{t('home.howItWorksTitle')}</h2>
          </div>

          <div className="steps-grid stagger-children">
            {steps.map((s, i) => (
              <div key={i} className="step-card-3d">
                <div className="step-num-3d">{s.num}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D ELIGIBILITY HIGHLIGHT */}
      <section className="section" id="eligibility-info">
        <div className="container">
          <div className="eligibility-info-card-3d animate-fade-in-up">
            <div className="eligibility-info-content-3d">
              <span className="badge badge-teal" style={{ marginBottom: 'var(--space-3)' }}>
                {t('home.guidelinesBadge')}
              </span>
              <h2 className="section-title">{t('home.eligibilityTitle')}</h2>
              <p className="eligibility-info-desc">{t('home.eligibilityDesc')}</p>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <Link to="/eligibility" className="btn btn-primary btn-lg">
                  <ClipboardCheck size={18} />
                  {t('nav.eligibility')}
                </Link>
                <Link to="/schemes" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                  {t('nav.schemes')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESPONSIBLE USE DISCLAIMER */}
      <section className="section" id="disclaimer" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="alert alert-info" style={{ padding: 'var(--space-6)' }}>
            <Shield size={24} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-teal-700)' }} />
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: 'var(--space-2)' }}>
                {t('home.disclaimerTitle')}
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', lineHeight: '1.6', color: 'var(--color-gray-700)', margin: 0 }}>
                {t('home.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
