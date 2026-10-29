// components/SchemeComparisonModal.jsx — Side-by-side comparison of up to 3 schemes
import { X, Check, ArrowRight, Scale, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './SchemeComparisonModal.css';

export default function SchemeComparisonModal({
  isOpen,
  onClose,
  schemes = [],
  onApplyScheme,
  onCalculateScheme,
}) {
  const { t, language } = useLanguage();

  if (!isOpen || !schemes || schemes.length === 0) return null;

  // Max 3 schemes
  const displaySchemes = schemes.slice(0, 3);

  const getSchemeName = (s) => {
    if (language === 'hi' && s.nameHi) return s.nameHi;
    if (language === 'mr' && s.nameMr) return s.nameMr;
    return s.name || s.category;
  };

  const getSchemePurpose = (s) => {
    if (language === 'hi' && s.purposeHi) return s.purposeHi;
    if (language === 'mr' && s.purposeMr) return s.purposeMr;
    return s.purposeDesc || s.purpose;
  };

  return (
    <div className="comparison-modal-backdrop" onClick={onClose}>
      <div className="comparison-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="comparison-modal-header">
          <h2 className="comparison-modal-title">
            <Scale size={22} color="var(--color-teal-600)" />
            {t('comparison.title') || 'Side-by-Side Scheme Comparison'}
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--color-gray-500)' }}>
              ({displaySchemes.length}/3 {language === 'hi' ? 'योजनाएं' : language === 'mr' ? 'योजना' : 'schemes'})
            </span>
          </h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="comparison-modal-body">
          <div className="comparison-grid">
            {/* Feature labels column (desktop) */}
            <div className="comparison-feature-col">
              <div className="comparison-feature-label">{t('comparison.intendedPurpose') || 'Intended Purpose'}</div>
              <div className="comparison-feature-label">{t('comparison.maxAmount') || 'Indicative Max Limit'}</div>
              <div className="comparison-feature-label">{t('comparison.interestRate') || 'Concessional Interest'}</div>
              <div className="comparison-feature-label">{t('comparison.tenureMoratorium') || 'Tenure & Moratorium'}</div>
              <div className="comparison-feature-label">{t('comparison.eligibility') || 'Eligibility Criteria'}</div>
              <div className="comparison-feature-label">{t('comparison.verification') || 'Required Verification'}</div>
              <div className="comparison-feature-label">{t('comparison.partners') || 'Suitable Channel Partners'}</div>
            </div>

            {/* Scheme Cards */}
            {displaySchemes.map((s) => (
              <div key={s.id} className="comparison-scheme-card">
                <div className="comparison-card-header">
                  <div>
                    <span className="badge badge-teal" style={{ marginBottom: 'var(--space-1)' }}>
                      {s.category}
                    </span>
                    <h3 className="comparison-card-name">{getSchemeName(s)}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    {onCalculateScheme && (
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: 'var(--text-xs)' }}
                        onClick={() => onCalculateScheme(s)}
                      >
                        {t('comparison.calcEMI') || 'Calculate EMI'}
                      </button>
                    )}
                    {onApplyScheme && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '4px 8px', fontSize: 'var(--text-xs)' }}
                        onClick={() => onApplyScheme(s)}
                      >
                        {t('comparison.apply') || 'Start Draft'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                <div className="comparison-cell">
                  <span className="comparison-feature-mobile-label">{t('comparison.intendedPurpose') || 'Intended Purpose'}</span>
                  <p style={{ fontSize: 'var(--text-xs)', lineHeight: '1.4', margin: 0 }}>
                    {getSchemePurpose(s)}
                  </p>
                </div>

                {/* Max Amount */}
                <div className="comparison-cell">
                  <span className="comparison-feature-mobile-label">{t('comparison.maxAmount') || 'Indicative Max Limit'}</span>
                  <span className="comparison-cell-strong" style={{ color: 'var(--color-teal-600)' }}>
                    {language === 'mr' && s.maxAmountLabelMr ? s.maxAmountLabelMr : language === 'hi' && s.maxAmountLabelHi ? s.maxAmountLabelHi : s.maxAmountLabel || `₹${(s.maxAmount / 100000).toFixed(2)} Lakh`}
                  </span>
                </div>

                {/* Interest Rate */}
                <div className="comparison-cell">
                  <span className="comparison-feature-mobile-label">{t('comparison.interestRate') || 'Concessional Interest'}</span>
                  <span className="comparison-cell-strong">
                    {s.interestRange || (s.interestRateRange ? `${s.interestRateRange.min}% – ${s.interestRateRange.max}%` : '4% – 8%')}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-gray-500)' }}>
                    {language === 'mr' && s.interestNoteMr ? s.interestNoteMr : language === 'hi' && s.interestNoteHi ? s.interestNoteHi : s.interestNote || 'Illustrative concessional'}
                  </span>
                </div>

                {/* Tenure & Moratorium */}
                <div className="comparison-cell">
                  <span className="comparison-feature-mobile-label">{t('comparison.tenureMoratorium') || 'Tenure & Moratorium'}</span>
                  <div style={{ fontSize: 'var(--text-xs)' }}>
                    <div>
                      <strong>{language === 'hi' ? 'कार्यकाल:' : language === 'mr' ? 'कालावधी:' : 'Tenure:'}</strong>{' '}
                      {s.tenureMonths?.label || (language === 'hi' && s.repaymentTenureHi ? s.repaymentTenureHi : language === 'mr' && s.repaymentTenureMr ? s.repaymentTenureMr : s.repaymentTenure) || (language === 'hi' ? '5 वर्ष तक' : language === 'mr' ? '5 वर्षांपर्यंत' : 'Up to 5 years')}
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      <strong>{language === 'hi' ? 'अधिस्थगन:' : language === 'mr' ? 'स्थगिती:' : 'Moratorium:'}</strong>{' '}
                      {s.moratoriumMonths?.label || (language === 'hi' && s.moratoriumHi ? s.moratoriumHi : language === 'mr' && s.moratoriumMr ? s.moratoriumMr : s.moratorium) || (language === 'hi' ? '3 से 6 महीने' : language === 'mr' ? '3 ते 6 महिने' : '3 to 6 months')}
                    </div>
                  </div>
                </div>

                {/* Eligibility */}
                <div className="comparison-cell">
                  <span className="comparison-feature-mobile-label">{t('comparison.eligibility') || 'Eligibility Criteria'}</span>
                  {language === 'hi' ? (
                    <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', lineHeight: '1.3' }}>
                      <li>अनुसूचित जाति (SC) श्रेणी</li>
                      <li>पारिवारिक आय ₹5.00 लाख प्रति वर्ष तक</li>
                      <li>आयु 18-55 वर्ष के बीच</li>
                    </ul>
                  ) : language === 'mr' ? (
                    <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', lineHeight: '1.3' }}>
                      <li>अनुसूचित जाती (SC) प्रवर्ग</li>
                      <li>कौटुंबिक उत्पन्न ₹5.00 लाख प्रति वर्ष पर्यंत</li>
                      <li>वय 18-55 वर्षांच्या दरम्यान</li>
                    </ul>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', lineHeight: '1.3' }}>
                      <li>Scheduled Caste (SC) category</li>
                      <li>Family income up to ₹5.00 Lakh p.a.</li>
                      <li>Age between 18–55 years</li>
                    </ul>
                  )}
                </div>

                {/* Verification Documents */}
                <div className="comparison-cell">
                  <span className="comparison-feature-mobile-label">{t('comparison.verification') || 'Required Verification'}</span>
                  <div className="comparison-tag-list">
                    <span className="comparison-tag">{language === 'hi' ? 'एससी जाति प्रमाण पत्र' : language === 'mr' ? 'एससी जाती प्रमाणपत्र' : 'SC Caste Certificate'}</span>
                    <span className="comparison-tag">{language === 'hi' ? 'आय प्रमाण पत्र' : language === 'mr' ? 'उत्पन्न प्रमाणपत्र' : 'Income Certificate'}</span>
                    <span className="comparison-tag">
                      {s.id === 'education-loan' 
                        ? (language === 'hi' ? 'प्रवेश / शुल्क पत्र' : language === 'mr' ? 'प्रवेश / शुल्क पत्र' : 'Admission / Fee Letter') 
                        : s.id === 'term-loan' 
                        ? (language === 'hi' ? 'परियोजना रिपोर्ट (DPR)' : language === 'mr' ? 'प्रकल्प अहवाल (DPR)' : 'Project Report (DPR)') 
                        : (language === 'hi' ? 'गतिविधि उद्धरण' : language === 'mr' ? 'उपक्रम कोटेशन' : 'Activity Quotation')}
                    </span>
                  </div>
                </div>

                {/* Suitable Channel Partners */}
                <div className="comparison-cell">
                  <span className="comparison-feature-mobile-label">{t('comparison.partners') || 'Suitable Channel Partners'}</span>
                  <div style={{ fontSize: '11px', color: 'var(--color-navy-700)' }}>
                    {s.partnerCategories ? s.partnerCategories.join(', ') : (language === 'hi' ? 'राज्य चैनलाइजिंग एजेंसियां (SCAs), सार्वजनिक क्षेत्र के बैंक' : language === 'mr' ? 'राज्य चॅनेलायझिंग एजन्सी (SCAs), सार्वजनिक क्षेत्रातील बँका' : 'State Channelizing Agencies (SCAs), Public Sector Banks')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="comparison-modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
            <Info size={14} color="var(--color-teal-600)" />
            <span>{t('discoveryResults.demoNoticeShort') || 'Illustrative results — official verification required.'}</span>
          </div>
          <button className="btn btn-outline" onClick={onClose}>
            {t('common.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
