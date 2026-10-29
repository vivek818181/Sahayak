import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import ProjectDemoNotice from '../../components/common/ProjectDemoNotice';
import {
  Sparkles,
  User,
  MapPin,
  IndianRupee,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Calculator,
  Compass,
  Building2,
  Edit3,
  Home,
  Search,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldCheck,
  Info,
} from 'lucide-react';
import './Recommendations.css';

export default function Recommendations() {
  const { t, language } = useLanguage();
  const { profile, hasProfile, recommendations, openProfileModal, setSelectedSchemeForCalc } = useProfile();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Safe evaluations
  const evaluations = useMemo(() => {
    return recommendations?.evaluations || [];
  }, [recommendations]);

  // Matching schemes (Potential Match or More Information Required)
  const matchingSchemes = useMemo(() => {
    return evaluations.filter(
      (e) => e.outcomeLabel === 'Potential Match' || e.outcomeLabel === 'More Information Required'
    );
  }, [evaluations]);

  const disqualifiedSchemes = useMemo(() => {
    return evaluations.filter((e) => e.outcomeLabel === 'Does Not Match Configured Rules');
  }, [evaluations]);

  const handleRetry = () => {
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  const handleEditProfile = (step = 1) => {
    openProfileModal(step);
  };

  const handleCalculateEMI = (scheme) => {
    setSelectedSchemeForCalc({
      id: scheme.id,
      name: scheme.name || scheme.category,
      maxAmount: scheme.maxAmount,
      rate: scheme.interestRateRange?.defaultRate || 5.0,
      tenure: scheme.tenureMonths?.defaultTenure || 36,
      borrowerName: `${profile?.personal?.firstName || ''} ${profile?.personal?.surname || ''}`.trim(),
    });
    const defaultRate = scheme.id === 'micro-finance' ? '5.0' : scheme.id === 'term-loan' ? '7.0' : '4.0';
    const defaultTenure = scheme.id === 'micro-finance' ? '36' : scheme.id === 'term-loan' ? '60' : '60';
    const defaultMoratorium = scheme.id === 'micro-finance' ? '3' : scheme.id === 'term-loan' ? '6' : '12';
    navigate(`/calculator?amount=${scheme.maxAmount}&rate=${defaultRate}&tenure=${defaultTenure}&moratorium=${defaultMoratorium}&scheme=${scheme.id}`);
  };

  const handleFindPartners = () => {
    const stateParam = profile?.personal?.state ? encodeURIComponent(profile.personal.state) : '';
    const districtParam = profile?.personal?.district ? encodeURIComponent(profile.personal.district) : '';
    navigate(`/partners?state=${stateParam}&district=${districtParam}`);
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(Number(val))) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  // 1. Missing Profile State (No Blank Screen!)
  if (!hasProfile || !profile) {
    return (
      <div className="recommendations-page page-enter">
        <div className="container">
          <div className="rec-hero-header">
            <span className="rec-badge-pill">
              <Sparkles size={14} />
              {language === 'hi' ? 'स्मार्ट मिलान' : language === 'mr' ? 'स्मार्ट जुळणी' : 'Smart Discovery'}
            </span>
            <h1 className="rec-page-title">{t('discoveryResults.pageTitle')}</h1>
            <p className="rec-page-subtitle">{t('discoveryResults.subtitle')}</p>
          </div>

          <ProjectDemoNotice variant="full" showBadge={true} />

          <div className="rec-empty-state-card animate-fade-in-up">
            <div className="rec-empty-icon-wrap info-icon-wrap">
              <Info size={44} />
            </div>
            <h2 className="rec-empty-heading">{t('discoveryResults.noProfileTitle')}</h2>
            <p className="rec-empty-text">{t('discoveryResults.noProfileDesc')}</p>
            <div className="rec-empty-actions-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleEditProfile(1)}
                id="btn-create-profile-fallback"
              >
                <User size={16} />
                {t('discoveryResults.createProfile')}
              </button>
              <Link to="/schemes" className="btn btn-outline">
                <Search size={16} />
                {t('discoveryResults.exploreAll')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="recommendations-page page-enter">
        <div className="container">
          <div className="rec-loading-card animate-fade-in">
            <RefreshCw size={36} className="animate-spin text-teal" />
            <h3 className="rec-loading-title">{t('discoveryResults.evaluating')}</h3>
            <p className="rec-loading-sub">
              {language === 'hi'
                ? 'कृपया प्रतीक्षा करें, आपकी प्रोफ़ाइल का पात्रता नियमों से मूल्यांकन किया जा रहा है...'
                : language === 'mr'
                ? 'कृपया प्रतीक्षा करा, आपल्या प्रोफाइलचे नियमांनुसार मूल्यांकन केले जात आहे...'
                : 'Please wait, analyzing your inputs against configured SC loan scheme rules...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error or Invalid Evaluation State
  if (recommendations && recommendations.isValid === false) {
    return (
      <div className="recommendations-page page-enter">
        <div className="container">
          <div className="rec-hero-header">
            <h1 className="rec-page-title">{t('discoveryResults.pageTitle')}</h1>
            <p className="rec-page-subtitle">{t('discoveryResults.subtitle')}</p>
          </div>

          <ProjectDemoNotice variant="full" showBadge={true} />

          <div className="rec-empty-state-card rec-error-card animate-fade-in-up">
            <div className="rec-empty-icon-wrap error-icon-wrap">
              <AlertCircle size={44} />
            </div>
            <h2 className="rec-empty-heading">
              {language === 'hi' ? 'मूल्यांकन में त्रुटि' : language === 'mr' ? 'मूल्यांकनात त्रुटी' : 'Evaluation Issue Encountered'}
            </h2>
            <p className="rec-empty-text">
              {recommendations.error ||
                (language === 'hi'
                  ? 'आपकी प्रोफ़ाइल का मूल्यांकन करते समय समस्या उत्पन्न हुई।'
                  : language === 'mr'
                  ? 'आपल्या प्रोफाइलचे मूल्यांकन करताना अडचण आली.'
                  : 'An unexpected issue occurred while evaluating your profile against scheme rules.')}
            </p>
            <div className="rec-empty-actions-row">
              <button type="button" className="btn btn-primary" onClick={handleRetry}>
                <RefreshCw size={16} />
                {t('discoveryResults.retry')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => handleEditProfile(1)}>
                <Edit3 size={16} />
                {t('discoveryResults.editProfile')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { personal, eligibility, loanRequirements } = profile;

  return (
    <div className="recommendations-page page-enter">
      <div className="container">
        {/* Hero Title & Subtitle */}
        <div className="rec-hero-header animate-fade-in-up">
          <div className="rec-hero-pill-row">
            <span className="rec-badge-pill">
              <Sparkles size={14} />
              {language === 'hi' ? 'योजना खोज परिणाम' : language === 'mr' ? 'योजना शोध निकाल' : 'Scheme Discovery Results'}
            </span>
            <span className="rec-id-pill">
              {profile.profileId || 'BEN-2026-ACTIVE'}
            </span>
          </div>
          <h1 className="rec-page-title" id="rec-page-heading">{t('discoveryResults.pageTitle')}</h1>
          <p className="rec-page-subtitle">{t('discoveryResults.subtitle')}</p>
        </div>

        {/* Project Demonstration Notice Card with Short Note Badge */}
        <ProjectDemoNotice variant="full" showBadge={true} />

        {/* Global Next Actions Bar */}
        <div className="rec-global-actions-bar animate-fade-in-up">
          <div className="rec-actions-group">
            <Link to="/schemes" className="btn btn-outline btn-sm" id="btn-action-view-schemes">
              <Search size={15} />
              {t('discoveryResults.viewSchemeDetails')}
            </Link>
            <Link to="/calculator" className="btn btn-outline btn-sm" id="btn-action-calculate-emi">
              <Calculator size={15} />
              {t('discoveryResults.calculateEMI')}
            </Link>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleFindPartners}
              id="btn-action-find-partner"
            >
              <Compass size={15} />
              {t('discoveryResults.findPartner')}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleEditProfile(1)}
              id="btn-action-edit-profile"
            >
              <Edit3 size={15} />
              {t('discoveryResults.editProfile')}
            </button>
            <Link to="/" className="btn btn-ghost btn-sm" id="btn-action-return-home">
              <Home size={15} />
              {t('discoveryResults.returnHome')}
            </Link>
          </div>
        </div>

        {/* A. Applicant Summary Card */}
        <section className="rec-summary-card animate-fade-in-up" aria-labelledby="applicant-summary-heading">
          <div className="rec-summary-header">
            <div className="rec-summary-avatar" aria-hidden="true">
              <User size={22} />
            </div>
            <div>
              <h2 className="rec-summary-title" id="applicant-summary-heading">
                {t('discoveryResults.applicantSummary')}
              </h2>
              <span className="rec-summary-sub">
                {personal?.firstName} {personal?.surname} • {eligibility?.casteCategory || 'SC'} Beneficiary
              </span>
            </div>
            <button
              type="button"
              className="rec-summary-edit-btn"
              onClick={() => handleEditProfile(1)}
              aria-label="Edit Applicant Profile"
            >
              <Edit3 size={14} />
              <span>{t('discoveryResults.editProfile')}</span>
            </button>
          </div>

          <div className="rec-summary-grid">
            {/* 1. Name */}
            <div className="rec-summary-item">
              <span className="summary-item-label">
                <User size={13} />
                {t('discoveryResults.name')}
              </span>
              <strong className="summary-item-val">
                {personal?.firstName} {personal?.surname}
              </strong>
            </div>

            {/* 2. Location */}
            <div className="rec-summary-item">
              <span className="summary-item-label">
                <MapPin size={13} />
                {t('discoveryResults.location')}
              </span>
              <strong className="summary-item-val">
                {personal?.district}, {personal?.taluka ? `${personal.taluka}, ` : ''}{personal?.state}
              </strong>
            </div>

            {/* 3. Intended Loan Purpose */}
            <div className="rec-summary-item">
              <span className="summary-item-label">
                <Briefcase size={13} />
                {t('discoveryResults.purpose')}
              </span>
              <strong className="summary-item-val capitalize">
                {loanRequirements?.purpose ? loanRequirements.purpose.replace(/-/g, ' ') : 'Small Business'}
              </strong>
            </div>

            {/* 4. Estimated Project or Education Cost */}
            <div className="rec-summary-item">
              <span className="summary-item-label">
                <IndianRupee size={13} />
                {t('discoveryResults.cost')}
              </span>
              <strong className="summary-item-val highlight-val">
                {formatCurrency(loanRequirements?.cost)}
              </strong>
            </div>

            {/* 5. Annual Family Income */}
            <div className="rec-summary-item">
              <span className="summary-item-label">
                <IndianRupee size={13} />
                {t('discoveryResults.income')}
              </span>
              <strong className="summary-item-val">
                {formatCurrency(eligibility?.annualIncome)}
              </strong>
            </div>

            {/* 6. Document Readiness */}
            <div className="rec-summary-item">
              <span className="summary-item-label">
                <ShieldCheck size={13} />
                {t('discoveryResults.verificationStatus')}
              </span>
              <strong className="summary-item-val">
                {profile.documents?.casteCert === 'available' ? 'Caste Cert Ready' : 'Caste Cert Needed'}
              </strong>
            </div>
          </div>
        </section>

        {/* B. Potential Scheme Matches */}
        <section className="rec-matches-section" aria-labelledby="matching-schemes-heading">
          <div className="rec-section-heading-wrap">
            <h2 className="rec-section-heading" id="matching-schemes-heading">
              {matchingSchemes.length > 0
                ? (language === 'hi' ? 'सुमेलित वित्तीय सहायता योजनाएँ' : language === 'mr' ? 'जुळणाऱ्या आर्थिक सहाय्य योजना' : 'Matching Financial Assistance Schemes')
                : (language === 'hi' ? 'योजना मिलान परिणाम' : language === 'mr' ? 'योजना जुळणी निकाल' : 'Scheme Match Results')}
            </h2>
            <span className="rec-matches-count">
              {matchingSchemes.length} {matchingSchemes.length === 1 ? 'Scheme' : 'Schemes'} Identified
            </span>
          </div>

          {/* D. No-Match State */}
          {matchingSchemes.length === 0 ? (
            <div className="rec-no-match-card animate-fade-in-up">
              <div className="no-match-icon-wrap">
                <AlertCircle size={46} />
              </div>
              <h3 className="no-match-title">{t('discoveryResults.noMatchTitle')}</h3>
              <p className="no-match-desc">{t('discoveryResults.noMatchDesc')}</p>

              <div className="no-match-guidance-box">
                <h4>
                  {language === 'hi'
                    ? 'संभावित कारण और अगले कदम:'
                    : language === 'mr'
                    ? 'संभाव्य कारणे व पुढील पायऱ्या:'
                    : 'Potential Factors & Next Steps:'}
                </h4>
                <ul>
                  <li>
                    {language === 'hi'
                      ? 'वार्षिक पारिवारिक आय ₹5.00 लाख की रियायती सीमा से अधिक हो सकती है।'
                      : language === 'mr'
                      ? 'वार्षिक कौटुंबिक उत्पन्न ₹5.00 लाखांच्या सवलत मर्यादेपेक्षा जास्त असू शकते.'
                      : 'Annual family income may exceed the concessional threshold (₹5.00 Lakh).'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? 'प्रस्तावित परियोजना लागत चयनित योजना श्रेणी की अधिकतम सीमा से अधिक हो सकती है।'
                      : language === 'mr'
                      ? 'प्रकल्प खर्च निवडलेल्या योजना वर्गाच्या कमाल मर्यादेपेक्षा जास्त असू शकतो.'
                      : 'Proposed project cost may exceed the single-beneficiary scheme ceiling.'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? 'आप अपनी जानकारी की समीक्षा कर सकते हैं या सभी उपलब्ध योजनाएँ ब्राउज़ कर सकते हैं।'
                      : language === 'mr'
                      ? 'आपण माहिती पुन्हा तपासू शकता किंवा इतर सर्व योजना पाहू शकता.'
                      : 'You can edit your profile inputs or explore the full list of regular concessional schemes.'}
                  </li>
                </ul>
              </div>

              <div className="no-match-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleEditProfile(1)}
                  id="btn-nomatch-edit-profile"
                >
                  <Edit3 size={16} />
                  {t('discoveryResults.editProfile')}
                </button>
                <Link to="/schemes" className="btn btn-secondary" id="btn-nomatch-explore-all">
                  <Search size={16} />
                  {t('discoveryResults.exploreAll')}
                </Link>
                <Link to="/" className="btn btn-ghost">
                  <Home size={16} />
                  {t('discoveryResults.returnHome')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="rec-cards-stack">
              {matchingSchemes.map((scheme) => {
                const isPotential = scheme.outcomeLabel === 'Potential Match';
                const isMoreInfo = scheme.outcomeLabel === 'More Information Required';

                return (
                  <article
                    key={scheme.id}
                    className={`rec-scheme-card ${isPotential ? 'card-match-potential' : 'card-match-more-info'} animate-fade-in-up`}
                    id={`scheme-result-${scheme.id}`}
                  >
                    {/* Top Row: Title, Purpose & Status Pill */}
                    <div className="rec-scheme-header">
                      <div className="rec-scheme-title-col">
                        <div className="rec-scheme-tag-row">
                          <span className="rec-scheme-type-badge">
                            {scheme.category || scheme.name}
                          </span>
                          {isPotential && (
                            <span className="outcome-badge badge-potential">
                              <CheckCircle2 size={13} />
                              {t('discoveryResults.potentialMatch')}
                            </span>
                          )}
                          {isMoreInfo && (
                            <span className="outcome-badge badge-more-info">
                              <AlertCircle size={13} />
                              {t('discoveryResults.moreInfo')}
                            </span>
                          )}
                        </div>
                        <h3 className="rec-scheme-name">{scheme.name || scheme.category}</h3>
                        <p className="rec-scheme-purpose-text">{scheme.purpose || scheme.purposeDesc}</p>
                      </div>

                      <div className="rec-scheme-primary-metrics">
                        <div className="metric-box">
                          <span className="metric-label">{t('discoveryResults.maxAmount')}</span>
                          <strong className="metric-val">{scheme.maxAmountLabel}</strong>
                        </div>
                        <div className="metric-box">
                          <span className="metric-label">{t('discoveryResults.interestRate')}</span>
                          <strong className="metric-val rate-val">
                            {scheme.interestRateRange?.defaultRate ? `${scheme.interestRateRange.defaultRate}% p.a.` : '4.0% – 6.5% p.a.'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Verification Status Notice */}
                    <div className="rec-verification-status-banner">
                      <Info size={14} className="status-banner-icon" />
                      <span>
                        <strong>{t('discoveryResults.verificationStatus')}:</strong>{' '}
                        {scheme.verificationStatus || 'Illustrative Concessional Rate • Authorized Agency Verification Required'}
                      </span>
                    </div>

                    {/* Key Details Grid */}
                    <div className="rec-scheme-details-grid">
                      {/* Eligibility Conditions */}
                      <div className="rec-detail-column">
                        <h4 className="detail-col-title">
                          <ShieldCheck size={14} />
                          {t('discoveryResults.eligibilityConditions')}
                        </h4>
                        <ul className="detail-checklist">
                          <li>SC Beneficiary category registration</li>
                          <li>Family income ceiling: {scheme.incomeLimitLabel || 'Up to ₹5.00 Lakh p.a.'}</li>
                          <li>Max loan ceiling: {scheme.maxAmountLabel}</li>
                          <li>Tenure: {scheme.tenureMonths?.label || '1 to 3 Years'} (Moratorium: {scheme.moratoriumMonths?.label || '3 to 6 months'})</li>
                        </ul>
                      </div>

                      {/* Documents That May Be Required */}
                      <div className="rec-detail-column">
                        <h4 className="detail-col-title">
                          <FileText size={14} />
                          {t('discoveryResults.requiredDocs')}
                        </h4>
                        <ul className="detail-checklist">
                          <li>SC Caste Certificate issued by Revenue Authority</li>
                          <li>Income Certificate (within ceiling limits)</li>
                          <li>Aadhaar / Identity Proof for in-person KYC</li>
                          {scheme.id === 'education-loan' && <li>Admission confirmation & course fee structure</li>}
                          {scheme.id === 'term-loan' && <li>Project proposal / DPR (for loans &gt; ₹5 Lakh)</li>}
                          {scheme.id === 'micro-finance' && <li>Trade / self-employment activity quotation</li>}
                        </ul>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    {scheme.matchReasons && scheme.matchReasons.length > 0 && (
                      <div className="rec-feedback-box feedback-positive">
                        <h5 className="feedback-heading">
                          <CheckCircle2 size={14} />
                          {t('discoveryResults.matchReasons')}
                        </h5>
                        <ul className="feedback-list">
                          {scheme.matchReasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Information / Verification Gaps */}
                    {scheme.missingDocuments && scheme.missingDocuments.length > 0 && (
                      <div className="rec-feedback-box feedback-warning">
                        <h5 className="feedback-heading">
                          <AlertTriangle size={14} />
                          {t('discoveryResults.missingInfo')}
                        </h5>
                        <ul className="feedback-list">
                          {scheme.missingDocuments.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons for this scheme */}
                    <div className="rec-card-footer-actions">
                      <Link
                        to="/schemes"
                        className="btn btn-outline btn-sm"
                        id={`btn-view-scheme-${scheme.id}`}
                      >
                        <Search size={14} />
                        {t('discoveryResults.viewSchemeDetails')}
                      </Link>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCalculateEMI(scheme)}
                        id={`btn-calc-emi-${scheme.id}`}
                      >
                        <Calculator size={14} />
                        {t('discoveryResults.calculateEMI')}
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleFindPartners}
                        id={`btn-find-partners-${scheme.id}`}
                      >
                        <Compass size={14} />
                        {t('discoveryResults.findPartner')}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Disqualified or Ineligible Schemes (Collapsed/Transparency section) */}
          {disqualifiedSchemes.length > 0 && matchingSchemes.length > 0 && (
            <div className="rec-disqualified-section">
              <h3 className="disqualified-title">
                {language === 'hi'
                  ? 'वे योजनाएँ जो वर्तमान नियमों से मेल नहीं खातीं'
                  : language === 'mr'
                  ? 'सध्याच्या नियमांनुसार न जुळणाऱ्या योजना'
                  : 'Schemes That Do Not Match Configured Rules'}
              </h3>
              <div className="disqualified-cards-grid">
                {disqualifiedSchemes.map((scheme) => (
                  <div key={scheme.id} className="disqualified-card">
                    <div className="disqualified-card-top">
                      <strong>{scheme.name || scheme.category}</strong>
                      <span className="outcome-badge badge-mismatch">
                        <XCircle size={12} />
                        {t('discoveryResults.doesNotMatch')}
                      </span>
                    </div>
                    {scheme.mismatchReasons && scheme.mismatchReasons.length > 0 && (
                      <p className="disqualified-reason">{scheme.mismatchReasons[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Bottom Floating Navigation Helper */}
        <div className="rec-bottom-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleEditProfile(1)}
          >
            <Edit3 size={15} />
            {t('discoveryResults.editProfile')}
          </button>
          <Link to="/" className="btn btn-outline">
            <Home size={15} />
            {t('discoveryResults.returnHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

