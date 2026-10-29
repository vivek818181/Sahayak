import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import BeneficiaryProfileForm from './BeneficiaryProfileForm';
import RecommendationsView from './RecommendationsView';
import {
  X,
  UserCheck,
  Edit3,
  Trash2,
  Sparkles,
  MapPin,
  FileCheck2,
  IndianRupee,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import './BeneficiaryProfileModal.css';

export default function BeneficiaryProfileModal() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const {
    profile,
    hasProfile,
    saveProfile,
    clearProfile,
    isProfileModalOpen,
    closeProfileModal,
    profileEditStep,
  } = useProfile();

  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'form' | 'recommendations'
  const [formStep, setFormStep] = useState(1);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isProfileModalOpen) {
      if (!hasProfile) {
        setViewMode('form');
        setFormStep(1);
      } else {
        if (profileEditStep && profileEditStep > 1) {
          setViewMode('form');
          setFormStep(profileEditStep);
        } else {
          setViewMode('summary');
        }
      }
    }
  }, [isProfileModalOpen, hasProfile, profileEditStep]);

  if (!isProfileModalOpen) return null;

  const handleSaveComplete = (data) => {
    saveProfile(data);
    closeProfileModal();
    navigate('/recommendations');
  };

  const handleClear = () => {
    const confirmMsg =
      language === 'hi'
        ? 'क्या आप वाकई सहेजी गई प्रोफ़ाइल को मिटाना चाहते हैं?'
        : language === 'mr'
        ? 'आपण खरोखर जतन केलेली प्रोफाइल हटवू इच्छिता का?'
        : 'Are you sure you want to clear your saved profile from local storage?';

    if (window.confirm(confirmMsg)) {
      clearProfile();
      setViewMode('form');
      setFormStep(1);
    }
  };

  return (
    <div
      className="prof-modal-backdrop animate-fade-in"
      onClick={closeProfileModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="prof-modal-card animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="prof-modal-header">
          <div className="prof-modal-title-group">
            <div className="prof-modal-avatar">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="prof-modal-heading">
                {language === 'hi'
                  ? 'स्मार्ट लाभार्थी प्रोफ़ाइल'
                  : language === 'mr'
                  ? 'स्मार्ट लाभार्थी प्रोफाइल'
                  : 'Smart Beneficiary Profile'}
              </h2>
              <span className="prof-modal-sub">
                {hasProfile
                  ? `ID: ${profile?.profileId || 'BEN-2026-ACTIVE'} • ${profile?.personal?.firstName} ${profile?.personal?.surname}`
                  : (language === 'hi' ? 'पात्रता मिलान हेतु पंजीकरण' : language === 'mr' ? 'पात्रता तपासणीसाठी नोंदणी' : 'Registration for Pre-Screening')}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="prof-modal-close"
            onClick={closeProfileModal}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs (if profile exists) */}
        {hasProfile && (
          <div className="prof-modal-nav-tabs">
            <button
              type="button"
              className={`prof-tab-btn ${viewMode === 'summary' ? 'prof-tab-btn-active' : ''}`}
              onClick={() => setViewMode('summary')}
            >
              <UserCheck size={14} />
              {language === 'hi' ? 'प्रोफ़ाइल सारांश' : language === 'mr' ? 'प्रोफाइल सारांश' : 'Profile Summary'}
            </button>

            <button
              type="button"
              className={`prof-tab-btn ${viewMode === 'recommendations' ? 'prof-tab-btn-active' : ''}`}
              onClick={() => {
                closeProfileModal();
                navigate('/recommendations');
              }}
            >
              <Sparkles size={14} />
              {language === 'hi' ? 'योजना अनुशंसाएँ' : language === 'mr' ? 'योजना शिफारसी' : 'Recommendations'}
            </button>

            <button
              type="button"
              className={`prof-tab-btn ${viewMode === 'form' ? 'prof-tab-btn-active' : ''}`}
              onClick={() => {
                setViewMode('form');
                setFormStep(1);
              }}
            >
              <Edit3 size={14} />
              {language === 'hi' ? 'संपादित करें' : language === 'mr' ? 'संपादित करा' : 'Edit Wizard'}
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="prof-modal-body">
          {viewMode === 'summary' && hasProfile && (
            <div className="prof-summary-view animate-fade-in">
              {/* Applicant Hero Badge */}
              <div className="prof-hero-badge">
                <div className="prof-hero-info">
                  <div className="prof-hero-name">
                    {profile.personal?.firstName} {profile.personal?.surname}
                  </div>
                  <div className="prof-hero-meta">
                    <span className="meta-pill">
                      <MapPin size={12} />
                      {profile.personal?.district}, {profile.personal?.state}
                    </span>
                    <span className="meta-pill meta-caste">
                      <Shield size={12} />
                      {profile.eligibility?.casteCategory || 'SC'} ({language === 'hi' ? 'जाति प्रमाण पत्र' : language === 'mr' ? 'जात प्रमाणपत्र' : 'Caste Cert'}: {profile.eligibility?.hasCasteCert ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'लंबित' : language === 'mr' ? 'प्रलंबित' : 'Pending')})
                    </span>
                  </div>
                </div>

                <div className="prof-hero-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setViewMode('form');
                      setFormStep(1);
                    }}
                  >
                    <Edit3 size={14} />
                    {language === 'hi' ? 'संपादित करें' : language === 'mr' ? 'संपादित करा' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="prof-summary-grid">
                <div className="prof-stat-box">
                  <span className="stat-box-label">
                    <IndianRupee size={12} />
                    {language === 'hi' ? 'वार्षिक पारिवारिक आय' : language === 'mr' ? 'वार्षिक उत्पन्न' : 'Annual Income'}
                  </span>
                  <strong className="stat-box-val">
                    ₹{Number(profile.eligibility?.annualIncome || 0).toLocaleString('en-IN')}
                  </strong>
                  <span className="stat-box-sub">
                    {language === 'hi' ? 'आय प्रमाण पत्र' : language === 'mr' ? 'उत्पन्न प्रमाणपत्र' : 'Income Cert'}: {profile.eligibility?.hasIncomeCert ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Verified/Held') : (language === 'hi' ? 'लंबित' : language === 'mr' ? 'प्रलंबित' : 'Pending')}
                  </span>
                </div>

                <div className="prof-stat-box">
                  <span className="stat-box-label">
                    <Briefcase size={12} />
                    {language === 'hi' ? 'ऋण आवश्यकता' : language === 'mr' ? 'कर्ज आवश्यकता' : 'Loan Purpose'}
                  </span>
                  <strong className="stat-box-val">
                    ₹{Number(profile.loanRequirements?.cost || 0).toLocaleString('en-IN')}
                  </strong>
                  <span className="stat-box-sub">
                    {language === 'hi' ? 'श्रेणी' : language === 'mr' ? 'वर्ग' : 'Category'}: {profile.loanRequirements?.purpose}
                  </span>
                </div>

                <div className="prof-stat-box">
                  <span className="stat-box-label">
                    <FileCheck2 size={12} />
                    {language === 'hi' ? 'दस्तावेज़ तत्परता' : language === 'mr' ? 'कागदपत्र तयारी' : 'Document Readiness'}
                  </span>
                  <strong className="stat-box-val">
                    {profile.documents?.casteCert === 'available' ? (language === 'hi' ? 'जाति प्रमाण पत्र तैयार' : language === 'mr' ? 'जात प्रमाणपत्र तयार' : 'Caste Cert Ready') : (language === 'hi' ? 'जाति प्रमाण पत्र आवश्यक' : language === 'mr' ? 'जात प्रमाणपत्र आवश्यक' : 'Caste Cert Needed')}
                  </strong>
                  <span className="stat-box-sub">
                    {language === 'hi' ? 'आधार केवाईसी' : language === 'mr' ? 'आधार केवायसी' : 'Aadhaar KYC'}: {profile.documents?.aadhaar === 'available' ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'अनुपलब्ध' : language === 'mr' ? 'नाही' : 'Pending')}
                  </span>
                </div>
              </div>

              {/* Primary Callout to view recommendations */}
              <div className="prof-recommendation-cta-card">
                <div>
                  <h4 className="rec-cta-title">
                    <Sparkles size={16} />
                    {language === 'hi'
                      ? 'पात्र योजनाओं की अनुशंसा देखें'
                      : language === 'mr'
                      ? 'पात्र योजनांच्या शिफारसी पहा'
                      : 'View Matched Loan Scheme Recommendations'}
                  </h4>
                  <p className="rec-cta-desc">
                    {language === 'hi'
                      ? 'आपके द्वारा दर्ज किए गए प्रोफाइल के आधार पर माइक्रो फाइनेंस, टर्म लोन या शिक्षा ऋण की उपयुक्तता जांची गई है।'
                      : language === 'mr'
                      ? 'आपल्या प्रोफाइलच्या आधारे योग्य कर्ज योजनांची तपासणी करण्यात आली आहे.'
                      : 'Configured scheme rules have screened your profile for suitable SC financial assistance.'}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    closeProfileModal();
                    navigate('/recommendations');
                  }}
                >
                  {language === 'hi' ? 'अनुशंसा रिपोर्ट खोलें' : language === 'mr' ? 'शिफारस अहवाल उघडा' : 'View Scheme Report'}
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Danger Zone: Clear profile */}
              <div className="prof-clear-row">
                <button
                  type="button"
                  className="prof-clear-btn"
                  onClick={handleClear}
                >
                  <Trash2 size={13} />
                  {language === 'hi' ? 'ब्राउज़र से यह प्रोफ़ाइल मिटाएँ' : language === 'mr' ? 'ब्राउझरमधून ही प्रोफाइल हटवा' : 'Clear Profile from Local Storage'}
                </button>
              </div>
            </div>
          )}

          {viewMode === 'form' && (
            <BeneficiaryProfileForm
              initialData={profile}
              initialStep={formStep}
              onSaveComplete={handleSaveComplete}
              onCancel={() => {
                if (hasProfile) {
                  setViewMode('summary');
                } else {
                  closeProfileModal();
                }
              }}
            />
          )}

          {viewMode === 'recommendations' && (
            <RecommendationsView
              onEditProfile={() => {
                setViewMode('form');
                setFormStep(1);
              }}
              onClose={closeProfileModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}
