// pages/Eligibility/Eligibility.jsx — Multi-step Questionnaire with Smart Scheme Recommender
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import { states, districtsByState } from '../../data/partners';
import { evaluateEligibility, formatCurrency } from '../../services/recommendationEngine';
import { createDraftApplication } from '../../services/applicationService';
import SchemeComparisonModal from '../../components/SchemeComparisonModal';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Edit3,
  RotateCcw,
  Sparkles,
  Scale,
  Calculator,
  FileText,
  AlertTriangle,
  Info,
  Check,
  MapPin,
} from 'lucide-react';
import './Eligibility.css';

const TOTAL_STEPS = 7;
const DRAFT_KEY = 'sahayak_eligibility_draft';

function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveDraft(data) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

const initialData = {
  purpose: '',
  cost: '',
  income: '',
  education: '',
  employment: '',
  state: '',
  district: '',
  language: 'en',
};

export default function Eligibility() {
  const { t, language: appLang, setLanguage, supportedLanguages } = useLanguage();
  const { profile, hasProfile } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(() => loadDraft() || { ...initialData, language: appLang });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [schemesToCompare, setSchemesToCompare] = useState([]);
  const [prefilledFromProfile, setPrefilledFromProfile] = useState(false);

  const handlePrefillFromProfile = () => {
    if (!profile) return;
    const purposeMap = {
      small_business: 'micro-enterprise',
      enterprise: 'term-loan',
      education: 'education',
      other: 'micro-enterprise',
    };
    const mappedPurpose = purposeMap[profile.loanRequirements?.purpose] || 'micro-enterprise';
    const newCost = profile.loanRequirements?.preferredAmount || profile.loanRequirements?.estimatedCost || '';
    const newIncome = profile.eligibility?.annualIncome || '';
    const newEdu = profile.eligibility?.educationStatus || 'graduate';
    const newEmp = profile.eligibility?.employment || 'self-employed';
    const newState = profile.personal?.state || '';
    const newDistrict = profile.personal?.district || '';
    const newLang = profile.personal?.preferredLanguage || appLang;

    setData({
      purpose: mappedPurpose,
      cost: String(newCost),
      income: String(newIncome),
      education: newEdu,
      employment: newEmp,
      state: newState,
      district: newDistrict,
      language: newLang,
    });
    setPrefilledFromProfile(true);
  };

  // Persist draft on change
  useEffect(() => {
    saveDraft(data);
  }, [data]);

  const setField = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    switch (step) {
      case 1:
        if (!data.purpose) errs.purpose = t('eligibility.validation.selectOne');
        break;
      case 2:
        if (!data.cost) errs.cost = t('eligibility.validation.required');
        else if (isNaN(Number(data.cost)) || Number(data.cost) <= 0) errs.cost = t('eligibility.validation.minCost');
        break;
      case 3:
        if (!data.income) errs.income = t('eligibility.validation.required');
        else if (isNaN(Number(data.income)) || Number(data.income) < 0) errs.income = t('eligibility.validation.validNumber');
        break;
      case 4:
        if (!data.education) errs.education = t('eligibility.validation.selectOne');
        break;
      case 5:
        if (!data.employment) errs.employment = t('eligibility.validation.selectOne');
        break;
      case 6:
        if (!data.state) errs.state = t('eligibility.validation.selectOne');
        break;
      case 7:
        if (!data.language) errs.language = t('eligibility.validation.selectOne');
        break;
      default:
        break;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validate()) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
    else setStep(TOTAL_STEPS + 1); // review step
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const goToStep = (s) => setStep(s);

  const handleSubmit = () => {
    // Run Recommendation Engine
    const evalResult = evaluateEligibility(data);
    setEvaluationResult(evalResult);
    setSubmitted(true);
    clearDraft();
  };

  const handleRestart = () => {
    setData({ ...initialData, language: appLang });
    setErrors({});
    setStep(1);
    setSubmitted(false);
    setEvaluationResult(null);
    clearDraft();
  };

  // Launch EMI calculator with prefilled parameters
  const handleCalculateEMI = (scheme) => {
    const amount = data.cost || scheme.maxAmount;
    const rate = scheme.interestRateRange?.defaultRate || 6;
    const tenure = scheme.tenureMonths?.defaultTenure || 36;
    const moratorium = scheme.moratoriumMonths?.defaultMoratorium || 0;
    navigate(`/calculator?amount=${amount}&rate=${rate}&tenure=${tenure}&moratorium=${moratorium}&scheme=${scheme.id}`);
  };

  // Create demo application draft
  const handleStartApplication = (scheme) => {
    const draft = createDraftApplication({
      scheme,
      applicantData: {
        ...data,
        fullName: 'Demo Applicant',
        phone: '9876543210',
      },
      loanDetails: {
        amount: data.cost || scheme.maxAmount,
        tenure: scheme.tenureMonths?.defaultTenure || 36,
        moratorium: scheme.moratoriumMonths?.defaultMoratorium || 0,
        emi: scheme.indicativeEMIPreview || 0,
      },
    });
    navigate('/tracker');
  };

  // Navigate to Channel Partner discovery with pre-filtered parameters
  const handleFindPartners = (scheme) => {
    const params = new URLSearchParams();
    if (scheme?.id) params.set('scheme', scheme.id);
    if (data.state) params.set('state', data.state);
    if (data.district) params.set('district', data.district);
    navigate(`/partners?${params.toString()}`);
  };

  // Compare schemes
  const handleOpenComparison = (schemesList) => {
    setSchemesToCompare(schemesList.slice(0, 3));
    setComparisonOpen(true);
  };

  const progress = step <= TOTAL_STEPS ? ((step - 1) / TOTAL_STEPS) * 100 : 100;

  // Radio option helper
  const RadioOption = ({ field, value, label }) => (
    <label className={`eligibility-option ${data[field] === value ? 'eligibility-option-selected' : ''}`}>
      <input
        type="radio"
        name={field}
        value={value}
        checked={data[field] === value}
        onChange={() => setField(field, value)}
        className="sr-only"
      />
      <span className="eligibility-option-radio">
        {data[field] === value && <CheckCircle2 size={16} />}
      </span>
      <span>{label}</span>
    </label>
  );

  // --- RESULTS SCREEN: SMART SCHEME RECOMMENDATIONS ---
  if (submitted && evaluationResult) {
    const { recommended, alternatives, ineligible, applicantSummary, disclaimer } = evaluationResult;
    const allViable = [...recommended, ...alternatives];

    return (
      <div className="page-enter">
        <section className="section">
          <div className="container recommendations-wrapper">
            {/* Header */}
            <div className="recommendations-header animate-fade-in-up">
              <span className="badge badge-teal" style={{ marginBottom: 'var(--space-2)' }}>
                <Sparkles size={14} style={{ marginRight: '4px' }} />
                Smart Scheme Recommender
              </span>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                {t('recommendations.title')}
              </h1>
              <p style={{ color: 'var(--color-gray-600)', maxWidth: '650px', margin: '0 auto' }}>
                {t('recommendations.subtitle')}
              </p>
            </div>

            {/* Applicant Profile Summary Bar */}
            <div className="applicant-profile-bar">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <span className="applicant-profile-pill">
                  <strong>Estimated Cost:</strong> {applicantSummary.costFormatted}
                </span>
                <span className="applicant-profile-pill">
                  <strong>Family Income:</strong> {applicantSummary.incomeFormatted}
                </span>
                <span className="applicant-profile-pill">
                  <strong>Location:</strong> {applicantSummary.state} {applicantSummary.district ? `(${applicantSummary.district})` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {allViable.length > 1 && (
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                    onClick={() => handleOpenComparison(allViable)}
                  >
                    <Scale size={14} style={{ marginRight: '4px' }} />
                    {t('recommendations.compareSchemes')}
                  </button>
                )}
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                  onClick={handleRestart}
                >
                  <RotateCcw size={14} style={{ marginRight: '4px' }} />
                  {t('recommendations.retakeAssessment')}
                </button>
              </div>
            </div>

            {/* List of Recommended Schemes */}
            <div className="recommendations-list">
              {recommended.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-navy-800)', marginBottom: 'var(--space-4)' }}>
                    🎯 {t('recommendations.highlyRecommended')} ({recommended.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {recommended.map((scheme) => (
                      <div key={scheme.id} className="rec-card rec-card-recommended animate-fade-in-up">
                        <div className="rec-card-header">
                          <div>
                            <span className="badge badge-teal" style={{ marginBottom: 'var(--space-1)' }}>
                              {scheme.category}
                            </span>
                            <h3 className="rec-scheme-title">{scheme.name}</h3>
                            <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', margin: 0 }}>
                              {scheme.purposeDesc}
                            </p>
                          </div>
                          <span className="score-badge score-badge-high">
                            <Sparkles size={14} />
                            {scheme.matchScore}% Match
                          </span>
                        </div>

                        {/* Meta Highlights */}
                        <div className="rec-meta-grid">
                          <div className="rec-meta-item">
                            <span className="rec-meta-label">Indicative Max Limit</span>
                            <span className="rec-meta-value">{scheme.maxAmountLabel}</span>
                          </div>
                          <div className="rec-meta-item">
                            <span className="rec-meta-label">Concessional Rate</span>
                            <span className="rec-meta-value">
                              {scheme.interestRateRange.min}% – {scheme.interestRateRange.max}% p.a.
                            </span>
                          </div>
                          <div className="rec-meta-item">
                            <span className="rec-meta-label">Repayment Tenure</span>
                            <span className="rec-meta-value">{scheme.tenureMonths.label}</span>
                          </div>
                          <div className="rec-meta-item">
                            <span className="rec-meta-label">Moratorium Holiday</span>
                            <span className="rec-meta-value">{scheme.moratoriumMonths.label}</span>
                          </div>
                        </div>

                        {/* Why this matches */}
                        <div className="rec-reasons-box">
                          <div className="rec-reasons-title">
                            <CheckCircle2 size={16} color="var(--color-teal-600)" />
                            {t('recommendations.whyRecommended')}
                          </div>
                          <ul className="rec-reasons-list">
                            {scheme.matchReasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Verification checklist */}
                        <div className="rec-reasons-box">
                          <div className="rec-reasons-title">
                            <FileText size={16} color="var(--color-navy-600)" />
                            {t('recommendations.verificationRequired')}
                          </div>
                          <div className="rec-doc-tags">
                            {scheme.verificationDocuments.map((doc) => (
                              <span key={doc.id} className="rec-doc-tag">
                                {doc.title} {doc.required ? '*(Mandatory)' : ''}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="rec-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleStartApplication(scheme)}
                          >
                            <FileText size={16} />
                            {t('recommendations.applyNow')}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleFindPartners(scheme)}
                          >
                            <MapPin size={16} />
                            Find Channel Partners
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleCalculateEMI(scheme)}
                          >
                            <Calculator size={16} />
                            {t('recommendations.calculateEMI')}
                          </button>
                          <button
                            className="btn btn-ghost"
                            onClick={() => handleOpenComparison([scheme, ...alternatives, ...recommended].filter((s, i, a) => a.findIndex(x => x.id === s.id) === i))}
                          >
                            <Scale size={16} />
                            {t('comparison.title')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              {alternatives.length > 0 && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-navy-800)', marginBottom: 'var(--space-4)' }}>
                    💡 {t('recommendations.potentialFit')} ({alternatives.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {alternatives.map((scheme) => (
                      <div key={scheme.id} className="rec-card rec-card-alternative animate-fade-in-up">
                        <div className="rec-card-header">
                          <div>
                            <span className="badge badge-navy" style={{ marginBottom: 'var(--space-1)' }}>
                              {scheme.category}
                            </span>
                            <h3 className="rec-scheme-title">{scheme.name}</h3>
                          </div>
                          <span className="score-badge score-badge-alt">
                            {scheme.matchScore}% Match
                          </span>
                        </div>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>
                          {scheme.purposeDesc}
                        </p>
                        <div className="rec-reasons-box">
                          <div className="rec-reasons-title">
                            <Info size={16} color="var(--color-navy-600)" />
                            Match Factors & Potential Adjustments
                          </div>
                          <ul className="rec-reasons-list">
                            {scheme.matchReasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rec-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleStartApplication(scheme)}
                          >
                            {t('recommendations.applyNow')}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleFindPartners(scheme)}
                          >
                            <MapPin size={16} />
                            Find Channel Partners
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleCalculateEMI(scheme)}
                          >
                            {t('recommendations.calculateEMI')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ineligible / Failed Rules Section */}
              {ineligible.length > 0 && (
                <div style={{ marginTop: 'var(--space-8)' }}>
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: 'var(--space-3)' }}>
                    ⚠️ {t('recommendations.ineligible')} ({ineligible.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {ineligible.map((scheme) => (
                      <div key={scheme.id} className="rec-card rec-card-ineligible">
                        <div className="rec-card-header">
                          <div>
                            <span className="badge badge-navy">{scheme.category}</span>
                            <h3 className="rec-scheme-title" style={{ fontSize: 'var(--text-base)', marginTop: '4px' }}>
                              {scheme.name}
                            </h3>
                          </div>
                          <span className="score-badge score-badge-ineligible">
                            Does Not Fit
                          </span>
                        </div>
                        <div className="rec-reasons-box" style={{ marginBottom: 0 }}>
                          <div className="rec-reasons-title" style={{ color: '#b91c1c' }}>
                            <AlertTriangle size={15} color="#b91c1c" />
                            {t('recommendations.whyNotFit')}
                          </div>
                          <ul className="rec-reasons-list" style={{ color: '#991b1b' }}>
                            {scheme.mismatchReasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="alert alert-info" style={{ marginTop: 'var(--space-6)' }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: 'var(--text-xs)', lineHeight: '1.5' }}>
                <strong>{t('home.disclaimerTitle')}:</strong> {disclaimer}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Modal */}
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

  // --- MULTI-STEP QUESTIONNAIRE FLOW ---
  return (
    <div className="page-enter">
      <section className="section">
        <div className="container eligibility-container">
          <div className="eligibility-header animate-fade-in-up">
            <span className="badge badge-teal" style={{ marginBottom: 'var(--space-2)' }}>
              {t('eligibility.title')}
            </span>
            <h1>{t('eligibility.title')}</h1>
            <p className="section-subtitle">{t('eligibility.subtitle')}</p>
          </div>

          {/* Progress Bar */}
          <div className="eligibility-progress">
            <div className="eligibility-progress-label">
              {step <= TOTAL_STEPS
                ? t('eligibility.stepOf').replace('{current}', step).replace('{total}', TOTAL_STEPS)
                : t('eligibility.reviewTitle')}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Smart Beneficiary Profile Sync Banner */}
          {hasProfile && !submitted && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Sparkles size={20} color="#7c3aed" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy-900)' }}>
                    Smart Beneficiary Profile: {profile.personal?.firstName} {profile.personal?.surname}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
                    ID: {profile.profileId} • State: {profile.personal?.state || 'N/A'} • Preferred Amount: ₹{Number(profile.loanRequirements?.preferredAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handlePrefillFromProfile}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                }}
              >
                {prefilledFromProfile ? '✓ Profile Details Applied' : 'Prefill Questionnaire from Profile'}
              </button>
            </div>
          )}

          <div className="eligibility-card animate-fade-in">
            {/* Step 1: Purpose */}
            {step === 1 && (
              <div className="eligibility-step">
                <h2 className="eligibility-step-title">{t('eligibility.purposeTitle')}</h2>
                <p className="form-hint">{t('eligibility.purposeHint')}</p>
                <div className="eligibility-options">
                  <RadioOption
                    field="purpose"
                    value="micro-enterprise"
                    label={t('eligibility.purposeMicro')}
                  />
                  <RadioOption
                    field="purpose"
                    value="larger-enterprise"
                    label={t('eligibility.purposeTerm')}
                  />
                  <RadioOption
                    field="purpose"
                    value="education"
                    label={t('eligibility.purposeEducation')}
                  />
                  <RadioOption
                    field="purpose"
                    value="self-employment"
                    label={t('eligibility.purposeOther')}
                  />
                </div>
                {errors.purpose && (
                  <div className="form-error"><AlertCircle size={14} />{errors.purpose}</div>
                )}
              </div>
            )}

            {/* Step 2: Cost */}
            {step === 2 && (
              <div className="eligibility-step">
                <h2 className="eligibility-step-title">{t('eligibility.costTitle')}</h2>
                <p className="form-hint">{t('eligibility.costHint')}</p>
                <div className="form-group">
                  <label className="form-label" htmlFor="eligibility-cost">Amount in ₹</label>
                  <input
                    id="eligibility-cost"
                    type="number"
                    className="form-input"
                    placeholder={t('eligibility.costPlaceholder')}
                    value={data.cost}
                    onChange={(e) => setField('cost', e.target.value)}
                    min="1"
                  />
                  {errors.cost && (
                    <div className="form-error"><AlertCircle size={14} />{errors.cost}</div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Income */}
            {step === 3 && (
              <div className="eligibility-step">
                <h2 className="eligibility-step-title">{t('eligibility.incomeTitle')}</h2>
                <p className="form-hint">{t('eligibility.incomeHint')}</p>
                <div className="form-group">
                  <label className="form-label" htmlFor="eligibility-income">Annual Income in ₹</label>
                  <input
                    id="eligibility-income"
                    type="number"
                    className="form-input"
                    placeholder={t('eligibility.incomePlaceholder')}
                    value={data.income}
                    onChange={(e) => setField('income', e.target.value)}
                    min="0"
                  />
                  {errors.income && (
                    <div className="form-error"><AlertCircle size={14} />{errors.income}</div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Education */}
            {step === 4 && (
              <div className="eligibility-step">
                <h2 className="eligibility-step-title">{t('eligibility.educationTitle')}</h2>
                <p className="form-hint">{t('eligibility.educationHint')}</p>
                <div className="eligibility-options">
                  <RadioOption field="education" value="below-10th" label={t('eligibility.eduBelow10th')} />
                  <RadioOption field="education" value="10th-pass" label={t('eligibility.edu10th')} />
                  <RadioOption field="education" value="12th-pass" label={t('eligibility.edu12th')} />
                  <RadioOption field="education" value="graduate" label={t('eligibility.eduGraduate')} />
                  <RadioOption field="education" value="post-graduate" label={t('eligibility.eduPostGraduate')} />
                  <RadioOption field="education" value="vocational" label={t('eligibility.eduVocational')} />
                </div>
                {errors.education && (
                  <div className="form-error"><AlertCircle size={14} />{errors.education}</div>
                )}
              </div>
            )}

            {/* Step 5: Employment */}
            {step === 5 && (
              <div className="eligibility-step">
                <h2 className="eligibility-step-title">{t('eligibility.employmentTitle')}</h2>
                <p className="form-hint">{t('eligibility.employmentHint')}</p>
                <div className="eligibility-options">
                  <RadioOption field="employment" value="unemployed" label={t('eligibility.empUnemployed')} />
                  <RadioOption field="employment" value="self-employed" label={t('eligibility.empSelfEmployed')} />
                  <RadioOption field="employment" value="salaried" label={t('eligibility.empSalaried')} />
                  <RadioOption field="employment" value="student" label={t('eligibility.empStudent')} />
                  <RadioOption field="employment" value="artisan" label={t('eligibility.empArtisan')} />
                </div>
                {errors.employment && (
                  <div className="form-error"><AlertCircle size={14} />{errors.employment}</div>
                )}
              </div>
            )}

            {/* Step 6: Location */}
            {step === 6 && (
              <div className="eligibility-step">
                <h2 className="eligibility-step-title">{t('eligibility.locationTitle')}</h2>
                <p className="form-hint">{t('eligibility.locationHint')}</p>
                <div className="eligibility-location-fields">
                  <div className="form-group">
                    <label className="form-label" htmlFor="eligibility-state">{t('eligibility.selectState')}</label>
                    <select
                      id="eligibility-state"
                      className="form-select"
                      value={data.state}
                      onChange={(e) => {
                        setField('state', e.target.value);
                        setField('district', '');
                      }}
                    >
                      <option value="">-- {t('eligibility.selectState')} --</option>
                      {states.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <div className="form-error"><AlertCircle size={14} />{errors.state}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="eligibility-district">{t('eligibility.selectDistrict')}</label>
                    <select
                      id="eligibility-district"
                      className="form-select"
                      value={data.district}
                      onChange={(e) => setField('district', e.target.value)}
                      disabled={!data.state}
                    >
                      <option value="">-- {t('eligibility.selectDistrict')} --</option>
                      {(districtsByState[data.state] || []).map((dst) => (
                        <option key={dst} value={dst}>{dst}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Language preference */}
            {step === 7 && (
              <div className="eligibility-step">
                <h2 className="eligibility-step-title">{t('eligibility.languageTitle')}</h2>
                <p className="form-hint">{t('eligibility.languageHint')}</p>
                <div className="eligibility-options">
                  {supportedLanguages.map((lang) => (
                    <RadioOption
                      key={lang.code}
                      field="language"
                      value={lang.code}
                      label={`${lang.nativeLabel} (${lang.label})`}
                    />
                  ))}
                </div>
                {errors.language && (
                  <div className="form-error"><AlertCircle size={14} />{errors.language}</div>
                )}
              </div>
            )}

            {/* Review Step (Step 8) */}
            {step === TOTAL_STEPS + 1 && (
              <div className="eligibility-step">
                <h2 className="eligibility-step-title">{t('eligibility.reviewTitle')}</h2>
                <p className="form-hint">{t('eligibility.reviewSubtitle')}</p>

                <div className="eligibility-review-list">
                  <div className="eligibility-review-row">
                    <div>
                      <div className="eligibility-review-label">{t('eligibility.purposeTitle')}</div>
                      <div className="eligibility-review-value">{data.purpose}</div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => goToStep(1)}>
                      <Edit3 size={14} /> {t('eligibility.reviewEdit')}
                    </button>
                  </div>

                  <div className="eligibility-review-row">
                    <div>
                      <div className="eligibility-review-label">{t('eligibility.costTitle')}</div>
                      <div className="eligibility-review-value">{formatCurrency(data.cost)}</div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => goToStep(2)}>
                      <Edit3 size={14} /> {t('eligibility.reviewEdit')}
                    </button>
                  </div>

                  <div className="eligibility-review-row">
                    <div>
                      <div className="eligibility-review-label">{t('eligibility.incomeTitle')}</div>
                      <div className="eligibility-review-value">{formatCurrency(data.income)}</div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => goToStep(3)}>
                      <Edit3 size={14} /> {t('eligibility.reviewEdit')}
                    </button>
                  </div>

                  <div className="eligibility-review-row">
                    <div>
                      <div className="eligibility-review-label">{t('eligibility.educationTitle')}</div>
                      <div className="eligibility-review-value">{data.education}</div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => goToStep(4)}>
                      <Edit3 size={14} /> {t('eligibility.reviewEdit')}
                    </button>
                  </div>

                  <div className="eligibility-review-row">
                    <div>
                      <div className="eligibility-review-label">{t('eligibility.employmentTitle')}</div>
                      <div className="eligibility-review-value">{data.employment}</div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => goToStep(5)}>
                      <Edit3 size={14} /> {t('eligibility.reviewEdit')}
                    </button>
                  </div>

                  <div className="eligibility-review-row">
                    <div>
                      <div className="eligibility-review-label">{t('eligibility.locationTitle')}</div>
                      <div className="eligibility-review-value">
                        {data.state}{data.district ? `, ${data.district}` : ''}
                      </div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => goToStep(6)}>
                      <Edit3 size={14} /> {t('eligibility.reviewEdit')}
                    </button>
                  </div>
                </div>

                <div className="eligibility-actions" style={{ marginTop: 'var(--space-6)' }}>
                  <button className="btn btn-ghost" onClick={() => goToStep(TOTAL_STEPS)}>
                    <ArrowLeft size={16} /> {t('eligibility.back')}
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmit} style={{ marginLeft: 'auto' }}>
                    <Sparkles size={16} /> {t('eligibility.submit')}
                  </button>
                </div>
              </div>
            )}

            {/* Navigation buttons for steps 1 to 7 */}
            {step <= TOTAL_STEPS && (
              <div className="eligibility-actions">
                {step > 1 && (
                  <button className="btn btn-ghost" onClick={goBack}>
                    <ArrowLeft size={16} />
                    {t('eligibility.back')}
                  </button>
                )}
                <button className="btn btn-primary" onClick={goNext} style={{ marginLeft: 'auto' }}>
                  {step === TOTAL_STEPS ? t('eligibility.review') : t('eligibility.next')}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
