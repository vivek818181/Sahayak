// pages/Schemes/Schemes.jsx — Concessional Financial Assistance Scheme Discovery
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import { schemes } from '../../data/schemes';
import { SCHEME_RULES } from '../../data/schemeRules';
import SchemeComparisonModal from '../../components/SchemeComparisonModal';
import ProjectDemoNotice from '../../components/common/ProjectDemoNotice';
import { createDraftApplication } from '../../services/applicationService';
import {
  Wallet,
  Building2,
  GraduationCap,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Target,
  Info,
  Scale,
  Calculator,
  FileText,
  Sparkles,
} from 'lucide-react';
import './Schemes.css';

const iconMap = { Wallet, Building2, GraduationCap };

export default function Schemes() {
  const { t, language } = useLanguage();
  const { profile, hasProfile, recommendations, openProfileModal } = useProfile();
  const navigate = useNavigate();
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [schemesToCompare, setSchemesToCompare] = useState([]);

  const getProfileMatchStatus = (schemeId) => {
    if (!recommendations?.evaluations) return null;
    const match = recommendations.evaluations.find((e) => e.schemeId === schemeId);
    return match ? match.status : null;
  };

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const getSchemeName = (scheme) => {
    if (isHi && scheme.categoryHi) return scheme.categoryHi;
    if (isMr && scheme.categoryMr) return scheme.categoryMr;
    return scheme.category;
  };

  const getSchemePurpose = (scheme) => {
    if (isHi && scheme.purposeHi) return scheme.purposeHi;
    if (isMr && scheme.purposeMr) return scheme.purposeMr;
    return scheme.purpose;
  };

  const openComparisonModal = (selected = SCHEME_RULES) => {
    setSchemesToCompare(selected.slice(0, 3));
    setComparisonOpen(true);
  };

  const handleCalculateEMI = (scheme) => {
    const defaultRate = scheme.id === 'micro-finance' ? '5.0' : scheme.id === 'term-loan' ? '7.0' : '4.0';
    const defaultTenure = scheme.id === 'micro-finance' ? '36' : scheme.id === 'term-loan' ? '60' : '60';
    const defaultMoratorium = scheme.id === 'micro-finance' ? '3' : scheme.id === 'term-loan' ? '6' : '12';
    navigate(`/calculator?amount=${scheme.maxAmount}&rate=${defaultRate}&tenure=${defaultTenure}&moratorium=${defaultMoratorium}&scheme=${scheme.id}`);
  };

  const handleStartApplication = (scheme) => {
    createDraftApplication({
      scheme,
      applicantData: {
        purpose: scheme.id === 'education-loan' ? 'education' : 'small-business',
        cost: scheme.maxAmount,
        state: 'Delhi',
      },
      loanDetails: {
        amount: scheme.maxAmount,
        tenure: 36,
        moratorium: 3,
      },
    });
    navigate('/tracker');
  };

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container">
          {/* Header */}
          <div className="schemes-header animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <h1 className="section-title">{t('schemes.title')}</h1>
              <p className="section-subtitle">{t('schemes.subtitle')}</p>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => openComparisonModal(SCHEME_RULES)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <Scale size={18} color="var(--color-teal-600)" />
              {t('comparison.title')}
            </button>
          </div>

          {/* Project Demonstration Notice */}
          <ProjectDemoNotice variant="full" showBadge={true} />

          {/* Profile Match Notice */}
          {hasProfile && recommendations && (
            <div
              className="animate-fade-in"
              style={{
                marginBottom: 'var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                background: 'rgba(124, 58, 237, 0.08)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Sparkles size={18} color="#7c3aed" />
                <span>
                  {language === 'hi' ? (
                    <><strong>{profile.personal?.firstName} {profile.personal?.surname}</strong> ({profile.profileId}) के लिए व्यक्तिगत मिलान संकेतक दिखाए जा रहे हैं</>
                  ) : language === 'mr' ? (
                    <><strong>{profile.personal?.firstName} {profile.personal?.surname}</strong> ({profile.profileId}) साठी वैयक्तिकृत जुळणी निर्देशक दाखवत आहे</>
                  ) : (
                    <>Showing personalized match indicators for <strong>{profile.personal?.firstName} {profile.personal?.surname}</strong> ({profile.profileId})</>
                  )}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={openProfileModal}
                style={{ fontSize: '0.82rem' }}
              >
                {language === 'hi' ? 'सिफारिश विश्लेषण देखें' : language === 'mr' ? 'शिफारस विश्लेषण पहा' : 'View Recommendation Analysis'}
              </button>
            </div>
          )}

          {/* Scheme Cards Grid */}
          <div className="schemes-grid stagger-children">
            {schemes.map((scheme) => {
              const IconComponent = iconMap[scheme.icon] || Wallet;
              const matchStatus = getProfileMatchStatus(scheme.id);

              return (
                <article
                  key={scheme.id}
                  className="scheme-card card"
                  style={{
                    '--scheme-color': scheme.color,
                    '--scheme-bg': scheme.colorBg,
                    border: matchStatus === 'Potential Match' ? '2px solid rgba(16, 185, 129, 0.6)' : undefined,
                  }}
                >
                  {/* Header */}
                  <div className="scheme-card-header">
                    <div className="scheme-icon" style={{ background: scheme.colorBg, color: scheme.color }}>
                      <IconComponent size={28} />
                    </div>
                    <div>
                      {matchStatus === 'Potential Match' && (
                        <div
                          style={{
                            marginBottom: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#059669',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <Sparkles size={12} />
                          {t('profile.matchedScheme') || 'Matched to Your Profile'}
                        </div>
                      )}
                      {matchStatus === 'More Information Required' && (
                        <div
                          style={{
                            marginBottom: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#d97706',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                          }}
                        >
                          <Info size={12} />
                          {language === 'hi' ? 'अधिक जानकारी आवश्यक' : language === 'mr' ? 'अधिक माहिती आवश्यक' : 'More Info Required'}
                        </div>
                      )}
                      <h2 className="scheme-name">{getSchemeName(scheme)}</h2>
                      {scheme.illustrative && (
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                          <Info size={10} />
                          {language === 'hi' ? 'उदाहरणात्मक' : language === 'mr' ? 'उदाहरणादाखल' : 'Illustrative'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="scheme-field">
                    <div className="scheme-field-label">
                      <Target size={14} />
                      {t('comparison.intendedPurpose') || 'Loan Purpose'}
                    </div>
                    <p className="scheme-field-value">{getSchemePurpose(scheme)}</p>
                  </div>

                  {/* Stats grid */}
                  <div className="scheme-stats">
                    <div className="scheme-stat">
                      <div className="scheme-stat-label">
                        <IndianRupee size={13} />
                        {t('schemes.maxAmount')}
                      </div>
                      <div className="scheme-stat-value">{isMr && scheme.maxAmountLabelMr ? scheme.maxAmountLabelMr : isHi && scheme.maxAmountLabelHi ? scheme.maxAmountLabelHi : scheme.maxAmountLabel}</div>
                    </div>
                    <div className="scheme-stat">
                      <div className="scheme-stat-label">
                        <Target size={13} />
                        {t('comparison.interestRate') || 'Interest Rate'}
                      </div>
                      <div className="scheme-stat-value">{scheme.interestRange}</div>
                      <div className="scheme-stat-note">
                        {isMr && scheme.interestNoteMr ? scheme.interestNoteMr : isHi ? scheme.interestNoteHi : scheme.interestNote}
                      </div>
                    </div>
                    <div className="scheme-stat">
                      <div className="scheme-stat-label">
                        <Clock size={13} />
                        {t('schemes.moratorium')}
                      </div>
                      <div className="scheme-stat-value">{isMr && scheme.moratoriumMr ? scheme.moratoriumMr : isHi ? scheme.moratoriumHi : scheme.moratorium}</div>
                    </div>
                  </div>

                  {/* Eligibility list */}
                  <div className="scheme-field">
                    <div className="scheme-field-label">
                      <CheckCircle2 size={14} />
                      {t('schemes.eligibility')}
                    </div>
                    <ul className="scheme-eligibility-list">
                      {(isMr && scheme.eligibilityMr ? scheme.eligibilityMr : isHi ? scheme.eligibilityHi : scheme.eligibility).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '8px', fontSize: 'var(--text-xs)', justifyContent: 'center' }}
                        onClick={() => handleCalculateEMI(scheme)}
                      >
                        <Calculator size={14} />
                        {t('schemes.calculateEMI')}
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '8px', fontSize: 'var(--text-xs)', justifyContent: 'center' }}
                        onClick={() => openComparisonModal([SCHEME_RULES.find(s => s.id === scheme.id) || scheme, ...SCHEME_RULES.filter(s => s.id !== scheme.id)])}
                      >
                        <Scale size={14} />
                        {t('schemes.compareBtn') || 'Compare'}
                      </button>
                    </div>

                    <Link to="/eligibility" className="btn btn-primary scheme-cta" style={{ justifyContent: 'center' }}>
                      {t('schemes.checkEligibility')}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scheme Comparison Modal */}
      <SchemeComparisonModal
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        schemes={schemesToCompare}
        onApplyScheme={handleStartApplication}
        onCalculateScheme={handleCalculateEMI}
      />
    </div>
  );
}
