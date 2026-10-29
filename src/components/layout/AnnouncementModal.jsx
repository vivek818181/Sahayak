import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  X,
  Bell,
  Calendar,
  IndianRupee,
  Percent,
  CheckCircle2,
  FileText,
  Building2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import './AnnouncementModal.css';

export default function AnnouncementModal({
  announcement,
  allAnnouncements = [],
  isOpen,
  onClose,
  onSelectAnnouncement,
}) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'all'

  if (!isOpen || !announcement) return null;

  const current = announcement;

  const getLocalized = (obj, field) => {
    if (!obj) return '';
    if (language === 'hi' && obj[`${field}Hi`]) return obj[`${field}Hi`];
    if (language === 'mr' && obj[`${field}Mr`]) return obj[`${field}Mr`];
    return obj[field] || '';
  };

  const handleCheckEligibility = () => {
    onClose();
    navigate('/eligibility');
  };

  const title = getLocalized(current, 'title');
  const badge = getLocalized(current, 'badge') || current.badge;
  const purpose = getLocalized(current, 'purpose');
  const maxLoanAmount = getLocalized(current, 'maxLoanAmount');
  const interestRate = getLocalized(current, 'interestRate');
  const importantDates = getLocalized(current, 'importantDates');
  const applicationInstructions = getLocalized(current, 'applicationInstructions');
  const eligibilityList = (language === 'hi' && current.eligibilityHi) ||
    (language === 'mr' && current.eligibilityMr) ||
    current.eligibility || [];
  const requiredDocsList = (language === 'hi' && current.requiredDocumentsHi) ||
    (language === 'mr' && current.requiredDocumentsMr) ||
    current.requiredDocuments || [];

  return (
    <div className="ann-modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ann-modal-card animate-slide-down" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ann-modal-header">
          <div className="ann-modal-header-left">
            <span className={`ann-status-pill ann-status-${current.status?.toLowerCase() || 'new'}`}>
              <Bell size={13} />
              {badge}
            </span>
            <span className="ann-modal-date">
              <Calendar size={13} />
              {current.date}
            </span>
            {current.isDemo && (
              <span className="ann-demo-tag">
                {language === 'hi' ? 'नमूना अधिसूचना' : language === 'mr' ? 'नमुना सूचना' : 'Demo Notice'}
              </span>
            )}
          </div>
          <button
            type="button"
            className="ann-modal-close"
            onClick={onClose}
            aria-label="Close announcement modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="ann-modal-tabs">
          <button
            type="button"
            className={`ann-tab-btn ${activeTab === 'details' ? 'ann-tab-active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            {language === 'hi' ? 'योजना विवरण' : language === 'mr' ? 'योजना तपशील' : 'Scheme Details'}
          </button>
          <button
            type="button"
            className={`ann-tab-btn ${activeTab === 'all' ? 'ann-tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {language === 'hi' ? 'सभी अपडेट देखें' : language === 'mr' ? 'सर्व अपडेट पहा' : 'View All Updates'} ({allAnnouncements.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="ann-modal-body">
          {activeTab === 'details' ? (
            <div className="ann-details-content">
              {/* Notice Title */}
              <h2 className="ann-scheme-heading">{title}</h2>
              <div className="ann-scheme-name-tag">
                <span>{current.schemeName}</span>
              </div>

              {/* Purpose Box */}
              <div className="ann-purpose-box">
                <p>{purpose}</p>
              </div>

              {/* Quick Metrics Grid */}
              <div className="ann-metrics-grid">
                <div className="ann-metric-card">
                  <div className="ann-metric-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <IndianRupee size={18} />
                  </div>
                  <div>
                    <span className="ann-metric-label">
                      {language === 'hi' ? 'अधिकतम ऋण राशि' : language === 'mr' ? 'कमाल कर्ज मर्यादा' : 'Applicable Loan Amount'}
                    </span>
                    <strong className="ann-metric-val">{maxLoanAmount}</strong>
                  </div>
                </div>

                <div className="ann-metric-card">
                  <div className="ann-metric-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                    <Percent size={18} />
                  </div>
                  <div>
                    <span className="ann-metric-label">
                      {language === 'hi' ? 'रियायती ब्याज दर' : language === 'mr' ? 'सवलतीचा व्याजदर' : 'Concessional Interest Rate'}
                    </span>
                    <strong className="ann-metric-val">{interestRate}</strong>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="ann-section-block">
                <h4 className="ann-block-title">
                  <Calendar size={16} />
                  {language === 'hi' ? 'महत्वपूर्ण तिथियाँ व आवंटन चक्र' : language === 'mr' ? 'महत्त्वाच्या तारखा व फेरी' : 'Important Dates & Cycle'}
                </h4>
                <div className="ann-schedule-pill">
                  <span>{importantDates}</span>
                </div>
              </div>

              {/* Eligibility Requirements */}
              <div className="ann-section-block">
                <h4 className="ann-block-title">
                  <CheckCircle2 size={16} />
                  {language === 'hi' ? 'पात्रता आवश्यकताएँ' : language === 'mr' ? 'पात्रता निकष' : 'Eligibility Requirements'}
                </h4>
                <ul className="ann-bullet-list">
                  {eligibilityList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div className="ann-section-block">
                <h4 className="ann-block-title">
                  <FileText size={16} />
                  {language === 'hi' ? 'आवश्यक दस्तावेज़' : language === 'mr' ? 'आवश्यक कागदपत्रे' : 'Required Documents'}
                </h4>
                <ul className="ann-bullet-list docs-list">
                  {requiredDocsList.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              {/* Application Instructions */}
              <div className="ann-section-block">
                <h4 className="ann-block-title">
                  <Building2 size={16} />
                  {language === 'hi' ? 'आवेदन कैसे करें' : language === 'mr' ? 'अर्ज कसा करावा' : 'How to Apply'}
                </h4>
                <div className="ann-instructions-card">
                  <p>{applicationInstructions}</p>
                </div>
              </div>

              {/* Illustrative Disclaimer */}
              <div className="ann-disclaimer-note">
                <AlertCircle size={15} />
                <span>{current.verificationNotice}</span>
              </div>
            </div>
          ) : (
            /* All Updates List */
            <div className="ann-list-all">
              <p className="ann-all-sub">
                {language === 'hi'
                  ? 'सरकारी योजनाओं और आवंटनों की नवीनतम सूचनाएँ ब्राउज़ करें:'
                  : language === 'mr'
                  ? 'शासकीय योजना आणि वाटपाच्या ताज्या सूचना पहा:'
                  : 'Browse all notifications and announcement updates:'}
              </p>
              <div className="ann-all-items">
                {allAnnouncements.map((item) => {
                  const isCurrent = item.id === current.id;
                  const itemTitle = getLocalized(item, 'title');
                  const itemBadge = getLocalized(item, 'badge') || item.badge;
                  return (
                    <div
                      key={item.id}
                      className={`ann-archive-card ${isCurrent ? 'ann-archive-card-active' : ''}`}
                      onClick={() => {
                        onSelectAnnouncement(item);
                        setActiveTab('details');
                      }}
                    >
                      <div className="ann-archive-header">
                        <span className={`ann-status-pill ann-status-${item.status?.toLowerCase() || 'new'}`}>
                          {itemBadge}
                        </span>
                        <span className="ann-modal-date">{item.date}</span>
                      </div>
                      <h4 className="ann-archive-title">{itemTitle}</h4>
                      <p className="ann-archive-desc">{getLocalized(item, 'shortText')}</p>
                      <button type="button" className="ann-archive-link">
                        {language === 'hi' ? 'विवरण देखें' : language === 'mr' ? 'तपशील पहा' : 'View Details'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="ann-modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            {language === 'hi' ? 'बंद करें' : language === 'mr' ? 'बंद करा' : 'Close'}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleCheckEligibility}
            id="ann-modal-check-eligibility-btn"
          >
            <CheckCircle2 size={16} />
            {language === 'hi' ? 'मेरी पात्रता जाँचें' : language === 'mr' ? 'माझी पात्रता तपासा' : 'Check Eligibility'}
          </button>
        </div>
      </div>
    </div>
  );
}
