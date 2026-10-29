// pages/Calculator/Calculator.jsx — Complete Reducing-Balance Financial EMI Calculator
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import { calculateLoanDetails, formatINR, validateCalculatorInputs } from '../../services/calculatorService';
import {
  Calculator as CalcIcon,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Percent,
  Clock,
  PauseCircle,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import './Calculator.css';

// SVG Donut Chart Component
function LoanDonutChart({ principal, interest, fees = 0, language = 'en' }) {
  const total = principal + interest + fees;
  if (total <= 0) return null;

  const principalRatio = principal / total;
  const interestRatio = interest / total;
  const feesRatio = fees / total;

  const radius = 55;
  const circumference = 2 * Math.PI * radius;

  const pOffset = 0;
  const pLength = principalRatio * circumference;

  const iOffset = -pLength;
  const iLength = interestRatio * circumference;

  const fOffset = -(pLength + iLength);
  const fLength = feesRatio * circumference;

  const principalLabel = language === 'hi' ? 'मूलधन' : language === 'mr' ? 'मुद्दल' : 'Principal';
  const interestLabel = language === 'hi' ? 'ब्याज' : language === 'mr' ? 'व्याज' : 'Interest';
  const feesLabel = language === 'hi' ? 'शुल्क' : language === 'mr' ? 'शुल्क' : 'Fees';

  return (
    <div className="calc-chart-container animate-fade-in">
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="18" />
        {/* Principal Arc */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--color-teal-500)"
          strokeWidth="18"
          strokeDasharray={`${pLength} ${circumference}`}
          strokeDashoffset={pOffset}
        />
        {/* Interest Arc */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--color-navy-600)"
          strokeWidth="18"
          strokeDasharray={`${iLength} ${circumference}`}
          strokeDashoffset={iOffset}
        />
        {/* Fees Arc */}
        {fees > 0 && (
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="18"
            strokeDasharray={`${fLength} ${circumference}`}
            strokeDashoffset={fOffset}
          />
        )}
      </svg>
      <div className="calc-chart-legend">
        <div className="calc-legend-item">
          <span className="calc-legend-dot" style={{ background: 'var(--color-teal-500)' }} />
          <span>{principalLabel}: {Math.round(principalRatio * 100)}%</span>
        </div>
        <div className="calc-legend-item">
          <span className="calc-legend-dot" style={{ background: 'var(--color-navy-600)' }} />
          <span>{interestLabel}: {Math.round(interestRatio * 100)}%</span>
        </div>
        {fees > 0 && (
          <div className="calc-legend-item">
            <span className="calc-legend-dot" style={{ background: '#f59e0b' }} />
            <span>{feesLabel}: {Math.round(feesRatio * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Calculator() {
  const { t, language } = useLanguage();
  const { profile, hasProfile, selectedSchemeForCalc } = useProfile();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    principal: searchParams.get('amount') || '500000',
    rate: searchParams.get('rate') || '6.5',
    tenure: searchParams.get('tenure') || '60',
    moratorium: searchParams.get('moratorium') || '6',
    capitalizeMoratoriumInterest: true,
    processingFeePercent: '0',
  });

  const [prefilledSource, setPrefilledSource] = useState(
    searchParams.get('scheme') ? `Scheme: ${searchParams.get('scheme')}` : null
  );

  const [result, setResult] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [errors, setErrors] = useState({});

  // Recalculate function
  const runCalculation = (formData = form) => {
    const val = validateCalculatorInputs(formData);
    if (!val.isValid) {
      setErrors(val.errors);
      setResult(null);
      return;
    }
    setErrors({});
    const res = calculateLoanDetails({
      principal: formData.principal,
      rate: formData.rate,
      tenure: formData.tenure,
      moratorium: formData.moratorium,
      capitalizeMoratoriumInterest: formData.capitalizeMoratoriumInterest,
      processingFeePercent: formData.processingFeePercent,
    });
    setResult(res);
  };

  // Check if routed with selectedSchemeForCalc from ProfileContext
  useEffect(() => {
    if (selectedSchemeForCalc) {
      const updated = {
        principal: String(selectedSchemeForCalc.amount || form.principal),
        rate: String(selectedSchemeForCalc.rate || form.rate),
        tenure: String(selectedSchemeForCalc.tenure || form.tenure),
        moratorium: String(selectedSchemeForCalc.moratorium || form.moratorium),
        capitalizeMoratoriumInterest: true,
        processingFeePercent: '0',
      };
      setForm(updated);
      setPrefilledSource(selectedSchemeForCalc.schemeName || 'Selected Scheme');
      runCalculation(updated);
    } else {
      runCalculation(form);
    }
  }, [selectedSchemeForCalc]);

  const applyPreset = (name, principal, rate, tenure, moratorium) => {
    const presetForm = {
      ...form,
      principal: String(principal),
      rate: String(rate),
      tenure: String(tenure),
      moratorium: String(moratorium),
    };
    setForm(presetForm);
    setPrefilledSource(name);
    setErrors({});
    runCalculation(presetForm);
  };

  const setField = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    // Reactively update calculation
    runCalculation(updated);
  };

  const handleReset = () => {
    const resetValues = {
      principal: '500000',
      rate: '6.5',
      tenure: '60',
      moratorium: '6',
      capitalizeMoratoriumInterest: true,
      processingFeePercent: '0',
    };
    setForm(resetValues);
    setErrors({});
    runCalculation(resetValues);
    setShowSchedule(false);
  };

  const moratoriumVal = Number(form.moratorium || 0);

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container calculator-container">
          {/* Header */}
          <div className="calculator-header text-center animate-fade-in-up">
            <span className="badge badge-teal" style={{ marginBottom: 'var(--space-2)' }}>
              {t('calculator.title')}
            </span>
            <h1>{t('calculator.title')}</h1>
            <p className="section-subtitle">{t('calculator.subtitle')}</p>
          </div>

          <div className="calculator-grid">
            {/* Input Form Card */}
            <div className="card calculator-form animate-fade-in">
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: 'var(--space-2)' }}>
                {t('calculator.loanDetails')}
              </h2>

              {/* Presets and prefill info */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-gray-600)', marginBottom: 'var(--space-2)' }}>
                  {language === 'hi' ? 'योजना प्रीसेट से भरें:' : language === 'mr' ? 'योजना प्रीसेटमधून भरा:' : 'Populate from Scheme Preset:'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--color-gray-100)', color: 'var(--color-navy-800)', border: '1px solid var(--color-gray-200)' }}
                    onClick={() => applyPreset(language === 'hi' ? 'सूक्ष्म वित्त' : language === 'mr' ? 'मायक्रो फायनान्स' : 'Micro Finance', 140000, 5.0, 36, 3)}
                  >
                    {language === 'hi' ? 'सूक्ष्म वित्त (₹1.40 लाख @ 5%)' : language === 'mr' ? 'मायक्रो फायनान्स (₹1.40 लाख @ 5%)' : 'Micro Finance (₹1.40L @ 5%)'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--color-gray-100)', color: 'var(--color-navy-800)', border: '1px solid var(--color-gray-200)' }}
                    onClick={() => applyPreset(language === 'hi' ? 'टर्म लोन' : language === 'mr' ? 'मुदत कर्ज' : 'Term Loan', 5000000, 7.0, 60, 6)}
                  >
                    {language === 'hi' ? 'टर्म लोन (₹50 लाख @ 7%)' : language === 'mr' ? 'मुदत कर्ज (₹50 लाख @ 7%)' : 'Term Loan (₹50L @ 7%)'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--color-gray-100)', color: 'var(--color-navy-800)', border: '1px solid var(--color-gray-200)' }}
                    onClick={() => applyPreset(language === 'hi' ? 'शिक्षा ऋण' : language === 'mr' ? 'शैक्षणिक कर्ज' : 'Education Loan', 2000000, 4.0, 60, 12)}
                  >
                    {language === 'hi' ? 'शिक्षा ऋण (₹20 लाख @ 4%)' : language === 'mr' ? 'शैक्षणिक कर्ज (₹20 लाख @ 4%)' : 'Education (₹20L @ 4%)'}
                  </button>
                  {hasProfile && profile.loanRequirements?.preferredAmount && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', border: '1px solid rgba(124, 58, 237, 0.3)', fontWeight: 600 }}
                      onClick={() => applyPreset(
                        language === 'hi' ? `प्रोफ़ाइल (${profile.personal?.firstName})` : language === 'mr' ? `प्रोफाइल (${profile.personal?.firstName})` : `Profile (${profile.personal?.firstName})`,
                        profile.loanRequirements.preferredAmount,
                        6.5,
                        60,
                        6
                      )}
                    >
                      <Sparkles size={11} style={{ marginRight: '3px' }} />
                      {language === 'hi' ? 'मेरी प्रोफ़ाइल' : language === 'mr' ? 'माझे प्रोफाइल' : 'My Profile'} (₹{Number(profile.loanRequirements.preferredAmount).toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN')})
                    </button>
                  )}
                </div>
                {prefilledSource && (
                  <div style={{ marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-teal-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Info size={12} />
                    <span>
                      {language === 'hi' ? (
                        <><strong>{prefilledSource}</strong> से मान भरे गए हैं। आप नीचे किसी भी फ़ील्ड को स्वतंत्र रूप से संपादित कर सकते हैं।</>
                      ) : language === 'mr' ? (
                        <><strong>{prefilledSource}</strong> वरून मूल्ये भरली आहेत. आपण खालील कोणतेही फील्ड संपादित करू शकता.</>
                      ) : (
                        <>Values populated from <strong>{prefilledSource}</strong>. You can freely edit any field below.</>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Principal Amount */}
              <div className="calculator-field">
                <label className="form-label" htmlFor="calc-principal">
                  <IndianRupee size={15} color="var(--color-teal-600)" />
                  {t('calculator.principal')}
                </label>
                <input
                  id="calc-principal"
                  type="number"
                  className="form-input"
                  value={form.principal}
                  onChange={(e) => setField('principal', e.target.value)}
                  min="10000"
                  max="5000000"
                  step="10000"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="form-hint">{t('calculator.principalHint')}</span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-teal-700)' }}>
                    {formatINR(form.principal)}
                  </span>
                </div>
                {errors.principal && <div className="form-error">{errors.principal}</div>}
              </div>

              {/* Annual Interest Rate */}
              <div className="calculator-field">
                <label className="form-label" htmlFor="calc-rate">
                  <Percent size={15} color="var(--color-teal-600)" />
                  {t('calculator.rate')}
                </label>
                <input
                  id="calc-rate"
                  type="number"
                  className="form-input"
                  value={form.rate}
                  onChange={(e) => setField('rate', e.target.value)}
                  min="0"
                  max="36"
                  step="0.25"
                />
                <span className="form-hint">{t('calculator.rateHint')}</span>
                {errors.rate && <div className="form-error">{errors.rate}</div>}
              </div>

              {/* Tenure Months */}
              <div className="calculator-field">
                <label className="form-label" htmlFor="calc-tenure">
                  <Clock size={15} color="var(--color-teal-600)" />
                  {t('calculator.tenure')} ({t('calculator.tenureMonths')})
                </label>
                <input
                  id="calc-tenure"
                  type="number"
                  className="form-input"
                  value={form.tenure}
                  onChange={(e) => setField('tenure', e.target.value)}
                  min="1"
                  max="120"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="form-hint">
                    {language === 'hi' ? 'अधिकतम 10 वर्ष (120 महीने)' : language === 'mr' ? 'कमाल 10 वर्षे (120 महिने)' : 'Max 10 Years (120 Months)'}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
                    {(Number(form.tenure) / 12).toFixed(1)} {t('calculator.tenureYears')}
                  </span>
                </div>
                {errors.tenure && <div className="form-error">{errors.tenure}</div>}
              </div>

              {/* Moratorium Duration */}
              <div className="calculator-field">
                <label className="form-label" htmlFor="calc-moratorium">
                  <PauseCircle size={15} color="var(--color-teal-600)" />
                  {t('calculator.moratorium')}
                </label>
                <select
                  id="calc-moratorium"
                  className="form-select"
                  value={form.moratorium}
                  onChange={(e) => setField('moratorium', e.target.value)}
                >
                  <option value="0">
                    {language === 'hi' ? '0 महीने (कोई अधिस्थगन नहीं / तत्काल पुनर्भुगतान)' : language === 'mr' ? '0 महिने (कोणतीही स्थगिती नाही / तात्काळ परतफेड)' : '0 Months (No Moratorium / Immediate Repayment)'}
                  </option>
                  <option value="3">
                    {language === 'hi' ? '3 महीने (मानक सूक्ष्म वित्त अवकाश)' : language === 'mr' ? '3 महिने (मानक सूक्ष्म वित्त सवलत)' : '3 Months (Standard Micro Finance holiday)'}
                  </option>
                  <option value="6">
                    {language === 'hi' ? '6 महीने (व्यवसाय स्थापना के लिए अनुशंसित)' : language === 'mr' ? '6 महिने (व्यवसाय उभारणीसाठी शिफारस केलेले)' : '6 Months (Recommended for business setup)'}
                  </option>
                  <option value="12">
                    {language === 'hi' ? '12 महीने (मध्यम उद्यम / अध्ययन अवधि)' : language === 'mr' ? '12 महिने (मध्यम उद्योग / अभ्यास कालावधी)' : '12 Months (Medium enterprise / study period)'}
                  </option>
                  <option value="18">
                    {language === 'hi' ? '18 महीने (तकनीकी डिप्लोमा पाठ्यक्रम)' : language === 'mr' ? '18 महिने (तांत्रिक डिप्लोमा अभ्यासक्रम)' : '18 Months (Technical diploma courses)'}
                  </option>
                  <option value="24">
                    {language === 'hi' ? '24 महीने (व्यावसायिक डिग्री बफर)' : language === 'mr' ? '24 महिने (व्यावसायिक पदवी बफर)' : '24 Months (Professional degree buffer)'}
                  </option>
                </select>
                <span className="form-hint">{t('calculator.moratoriumHint')}</span>

                {/* Moratorium policy selection */}
                {moratoriumVal > 0 && (
                  <div className="moratorium-toggle-box animate-fade-in">
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-navy-800)' }}>
                      {t('calculator.moratoriumMode')}:
                    </span>
                    <label className="moratorium-radio-label">
                      <input
                        type="radio"
                        name="moratoriumPolicy"
                        checked={form.capitalizeMoratoriumInterest === true}
                        onChange={() => setField('capitalizeMoratoriumInterest', true)}
                      />
                      <span>{t('calculator.moratoriumCapitalized')}</span>
                    </label>
                    <label className="moratorium-radio-label">
                      <input
                        type="radio"
                        name="moratoriumPolicy"
                        checked={form.capitalizeMoratoriumInterest === false}
                        onChange={() => setField('capitalizeMoratoriumInterest', false)}
                      />
                      <span>{t('calculator.moratoriumServiced')}</span>
                    </label>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-600)', marginTop: '2px' }}>
                      {t('calculator.moratoriumExplain')}
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Upfront Processing Fee */}
              <div className="calculator-field">
                <label className="form-label" htmlFor="calc-fee">
                  <ShieldCheck size={15} color="var(--color-teal-600)" />
                  {t('calculator.feesTitle')}
                </label>
                <select
                  id="calc-fee"
                  className="form-select"
                  value={form.processingFeePercent}
                  onChange={(e) => setField('processingFeePercent', e.target.value)}
                >
                  <option value="0">0% — {t('calculator.processingFeeZero')}</option>
                  <option value="0.5">
                    0.5% {language === 'hi' ? '(रियायती भागीदार प्रसंस्करण शुल्क)' : language === 'mr' ? '(सवलतीचे भागीदार प्रक्रिया शुल्क)' : '(Concessional partner processing fee)'}
                  </option>
                  <option value="1.0">
                    1.0% {language === 'hi' ? '(मानक प्रशासनिक शुल्क)' : language === 'mr' ? '(मानक प्रशासकीय शुल्क)' : '(Standard administrative fee)'}
                  </option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="calculator-form-actions">
                <button className="btn btn-primary" onClick={() => runCalculation(form)} style={{ flex: 1 }}>
                  <CalcIcon size={16} />
                  {t('calculator.calculate')}
                </button>
                <button className="btn btn-ghost" onClick={handleReset} title="Reset">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Results Display Card */}
            <div>
              {result ? (
                <div className="card calculator-result-card animate-fade-in">
                  {/* Monthly EMI Hero Banner */}
                  <div className="calculator-result-main">
                    <span className="calculator-result-label" style={{ color: '#ffffff' }}>
                      {t('calculator.monthlyEMI')}
                    </span>
                    <div className="calculator-result-value" style={{ color: '#ffffff' }}>
                      {formatINR(result.emi)}
                    </div>
                    <span className="calculator-result-sub" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {language === 'hi' 
                        ? `${result.tenureMonths} मासिक किश्तों के लिए` 
                        : language === 'mr' 
                        ? `${result.tenureMonths} मासिक हप्त्यांसाठी` 
                        : `for ${result.tenureMonths} monthly installments`}
                    </span>
                    {result.isZeroInterest && (
                      <div style={{ fontSize: 'var(--text-xs)', background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '4px', marginTop: '6px' }}>
                        {t('calculator.zeroInterestNote')}
                      </div>
                    )}
                  </div>

                  {/* Visual Chart of Principal vs Interest */}
                  <LoanDonutChart
                    principal={result.principal}
                    interest={result.totalInterest}
                    fees={result.fees}
                    language={language}
                  />

                  {/* Summary Stats Grid */}
                  <div className="calculator-result-stats">
                    <div className="stat-card">
                      <span className="stat-card-label">{t('calculator.totalPrincipal')}</span>
                      <span className="stat-card-value">{formatINR(result.principal)}</span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-card-label">{t('calculator.totalInterest')}</span>
                      <span className="stat-card-value">{formatINR(result.totalInterest)}</span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-card-label">{t('calculator.totalRepayment')}</span>
                      <span className="stat-card-value">{formatINR(result.totalRepayment)}</span>
                    </div>

                    {result.fees > 0 && (
                      <div className="stat-card">
                        <span className="stat-card-label">{t('calculator.feesAmount')}</span>
                        <span className="stat-card-value">{formatINR(result.fees)}</span>
                      </div>
                    )}
                  </div>

                  {/* Moratorium Detail Note */}
                  {result.moratoriumMonths > 0 && (
                    <div className="alert alert-info" style={{ margin: 'var(--space-4) 0', fontSize: 'var(--text-xs)' }}>
                      <PauseCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>{language === 'hi' ? 'अधिस्थगन प्रभाव:' : language === 'mr' ? 'स्थगिती प्रभाव:' : 'Moratorium Impact:'}</strong>{' '}
                        {language === 'hi' ? `${result.moratoriumMonths} महीने का पुनर्भुगतान अवकाश।` : language === 'mr' ? `${result.moratoriumMonths} महिन्यांची परतफेड सवलत.` : `${result.moratoriumMonths} months repayment holiday.`}
                        {result.capitalizeMoratoriumInterest ? (
                          <span>
                            {language === 'hi'
                              ? ` अवकाश के दौरान अर्जित ${formatINR(result.moratoriumInterest)} का साधारण ब्याज पुनर्भुगतान मूलधन (${formatINR(result.effectivePrincipal)}) में जोड़ा गया है।`
                              : language === 'mr'
                              ? ` सवलतीच्या कालावधीत जमा झालेले ${formatINR(result.moratoriumInterest)} चे साधे व्याज परतफेड मुद्दलामध्ये (${formatINR(result.effectivePrincipal)}) समाविष्ट केले आहे.`
                              : ` Simple interest of ${formatINR(result.moratoriumInterest)} accrued during holiday is capitalized into the repayment principal (${formatINR(result.effectivePrincipal)}).`}
                          </span>
                        ) : (
                          <span>
                            {language === 'hi'
                              ? ` अवकाश अवधि के दौरान ${formatINR(result.moratoriumInterest)} के ब्याज का सीधे भुगतान किया जाता है।`
                              : language === 'mr'
                              ? ` सवलतीच्या कालावधीत ${formatINR(result.moratoriumInterest)} चे व्याज थेट भरले जाते.`
                              : ` Interest of ${formatINR(result.moratoriumInterest)} is serviced directly during the holiday period.`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amortization Schedule Accordion */}
                  <div className="calculator-schedule-section" style={{ marginTop: 'var(--space-4)' }}>
                    <button
                      className="calculator-schedule-toggle"
                      onClick={() => setShowSchedule(!showSchedule)}
                    >
                      <span>{t('calculator.scheduleTitle')} ({result.schedule.length} installments)</span>
                      {showSchedule ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showSchedule && (
                      <div className="calculator-schedule-wrap animate-fade-in">
                        <div className="calculator-schedule-scroll">
                          <table className="calculator-schedule-table">
                            <thead>
                              <tr>
                                <th>{t('calculator.month')}</th>
                                <th>{t('calculator.openingBalance')}</th>
                                <th>{t('calculator.emi')}</th>
                                <th>{t('calculator.principalPaid')}</th>
                                <th>{t('calculator.interestPaid')}</th>
                                <th>{t('calculator.closingBalance')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.schedule.map((row) => (
                                <tr key={row.month}>
                                  <td>{row.month}</td>
                                  <td>{formatINR(row.openingBalance)}</td>
                                  <td>{formatINR(row.emi)}</td>
                                  <td>{formatINR(row.principalComponent)}</td>
                                  <td>{formatINR(row.interestComponent)}</td>
                                  <td>{formatINR(row.closingBalance)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="calculator-empty card">
                  <div className="empty-state">
                    <TrendingUp size={48} />
                    <h3>{t('calculator.title')}</h3>
                    <p>
                      {language === 'hi' 
                        ? 'घटते शेष पर पुनर्भुगतान विवरण और अनुसूची देखने के लिए ऋण विवरण दर्ज करें।' 
                        : language === 'mr' 
                        ? 'कमी होणाऱ्या शिल्लकीवर परतफेड तपशील आणि वेळापत्रक पाहण्यासाठी कर्जाचे तपशील प्रविष्ट करा.' 
                        : 'Enter loan details to view reducing-balance repayment breakdown and schedule.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="alert alert-info" style={{ marginTop: 'var(--space-4)' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: 'var(--text-xs)' }}>{t('calculator.disclaimer')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
