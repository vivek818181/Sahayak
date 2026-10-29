import { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { STATES_AND_DISTRICTS } from '../../data/locations';
import ProjectDemoNotice from '../common/ProjectDemoNotice';
import {
  User,
  MapPin,
  Users,
  FileCheck,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Info,
  HelpCircle,
} from 'lucide-react';
import './BeneficiaryProfileForm.css';

// Helper to normalize documents to only 2 options: 'available' | 'not-available'
const normalizeDoc = (val, defaultVal = 'available') => {
  if (val === 'available') return 'available';
  if (val === 'not-available') return 'not-available';
  // Handles legacy 'not-applicable' or undefined safely
  return defaultVal;
};

export default function BeneficiaryProfileForm({
  initialData = null,
  initialStep = 1,
  onSaveComplete,
  onCancel,
}) {
  const { language } = useLanguage();

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [errors, setErrors] = useState({});

  // Initialize form state
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        // Step 1: Personal
        firstName: initialData.personal?.firstName || '',
        surname: initialData.personal?.surname || '',
        state: initialData.personal?.state || 'Maharashtra',
        district: initialData.personal?.district || 'Pune',
        taluka: initialData.personal?.taluka || 'Haveli',
        locality: initialData.personal?.locality || '',
        preferredLanguage: initialData.personal?.preferredLanguage || language || 'en',

        // Step 2: Eligibility & Family
        casteCategory: initialData.eligibility?.casteCategory || 'SC',
        hasCasteCert: initialData.eligibility?.hasCasteCert !== undefined ? initialData.eligibility.hasCasteCert : true,
        annualIncome: initialData.eligibility?.annualIncome || 250000,
        hasIncomeCert: initialData.eligibility?.hasIncomeCert !== undefined ? initialData.eligibility.hasIncomeCert : true,
        occupation: initialData.eligibility?.occupation || 'micro-business',
        education: initialData.eligibility?.education || '12th-pass',
        defenceService: initialData.eligibility?.defenceService || 'No',

        // Step 3: Document Checklist (ONLY 2 options: 'available' | 'not-available')
        casteCert: normalizeDoc(initialData.documents?.casteCert, 'available'),
        incomeCert: normalizeDoc(initialData.documents?.incomeCert, 'available'),
        aadhaar: normalizeDoc(initialData.documents?.aadhaar, 'available'),
        pan: normalizeDoc(initialData.documents?.pan, 'available'),
        educationDocs: normalizeDoc(initialData.documents?.educationDocs, 'available'),
        projectDocs: normalizeDoc(initialData.documents?.projectDocs, 'not-available'),
        additionalDocs: normalizeDoc(initialData.documents?.additionalDocs, 'not-available'),

        // Step 4: Loan Requirements
        purpose: initialData.loanRequirements?.purpose || 'small-business',
        cost: initialData.loanRequirements?.cost || 120000,
        preferredAmount: initialData.loanRequirements?.preferredAmount || 100000,
        alreadyInBusiness: initialData.loanRequirements?.alreadyInBusiness !== undefined ? initialData.loanRequirements.alreadyInBusiness : false,
        projectDetails: initialData.loanRequirements?.projectDetails || '',

        // Step 5: Review & Consent
        consentSaved: initialData.consentSaved !== undefined ? initialData.consentSaved : true,
      };
    }

    return {
      firstName: '',
      surname: '',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Haveli',
      locality: '',
      preferredLanguage: language || 'en',

      casteCategory: 'SC',
      hasCasteCert: true,
      annualIncome: 250000,
      hasIncomeCert: true,
      occupation: 'micro-business',
      education: '12th-pass',
      defenceService: 'No',

      // Only 2 options: 'available' | 'not-available'
      casteCert: 'available',
      incomeCert: 'available',
      aadhaar: 'available',
      pan: 'available',
      educationDocs: 'available',
      projectDocs: 'not-available',
      additionalDocs: 'not-available',

      purpose: 'small-business',
      cost: 120000,
      preferredAmount: 100000,
      alreadyInBusiness: false,
      projectDetails: '',

      consentSaved: true,
    };
  });

  // Cascading location data
  const selectedStateObj = useMemo(() => {
    return STATES_AND_DISTRICTS.find((s) => s.state === formData.state) || STATES_AND_DISTRICTS[0];
  }, [formData.state]);

  const availableDistricts = useMemo(() => {
    return selectedStateObj.districts || [];
  }, [selectedStateObj]);

  const selectedDistrictObj = useMemo(() => {
    return availableDistricts.find((d) => d.name === formData.district) || availableDistricts[0] || { talukas: [] };
  }, [availableDistricts, formData.district]);

  const handleStateChange = (newState) => {
    const stateObj = STATES_AND_DISTRICTS.find((s) => s.state === newState) || STATES_AND_DISTRICTS[0];
    const isDistrictValid = stateObj.districts?.some((d) => d.name === formData.district);
    const nextDistrict = isDistrictValid ? formData.district : (stateObj.districts[0]?.name || '');
    const distObj = stateObj.districts?.find((d) => d.name === nextDistrict);
    const isTalukaValid = distObj?.talukas?.includes(formData.taluka);
    const nextTaluka = isTalukaValid ? formData.taluka : (distObj?.talukas?.[0] || '');

    setFormData((prev) => ({
      ...prev,
      state: newState,
      district: nextDistrict,
      taluka: nextTaluka,
    }));
  };

  const handleDistrictChange = (newDistrict) => {
    const distObj = availableDistricts.find((d) => d.name === newDistrict);
    const isTalukaValid = distObj?.talukas?.includes(formData.taluka);
    const nextTaluka = isTalukaValid ? formData.taluka : (distObj?.talukas?.[0] || '');

    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      taluka: nextTaluka,
    }));
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Validation per step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = language === 'hi' ? 'प्रथम नाम आवश्यक है' : language === 'mr' ? 'पहिले नाव आवश्यक आहे' : 'First name is required';
      }
      if (!formData.surname.trim()) {
        newErrors.surname = language === 'hi' ? 'उपनाम आवश्यक है' : language === 'mr' ? 'आडनाव आवश्यक आहे' : 'Surname is required';
      }
      if (!formData.state) {
        newErrors.state = 'State selection is required';
      }
      if (!formData.district) {
        newErrors.district = 'District selection is required';
      }
    }

    if (step === 2) {
      const incomeNum = Number(formData.annualIncome);
      if (isNaN(incomeNum) || incomeNum < 0) {
        newErrors.annualIncome = language === 'hi' ? 'वैध वार्षिक पारिवारिक आय दर्ज करें' : language === 'mr' ? 'वैध वार्षिक कौटुंबिक उत्पन्न प्रविष्ट करा' : 'Enter valid annual family income';
      }
    }

    if (step === 4) {
      const costNum = Number(formData.cost);
      if (isNaN(costNum) || costNum <= 0) {
        newErrors.cost = language === 'hi' ? 'अनुमानित लागत शून्य से अधिक होनी चाहिए' : language === 'mr' ? 'अंदाजित खर्च शून्यापेक्षा जास्त असावा' : 'Estimated cost must be greater than zero';
      }
      const prefNum = Number(formData.preferredAmount);
      if (isNaN(prefNum) || prefNum <= 0) {
        newErrors.preferredAmount = language === 'hi' ? 'ऋण राशि दर्ज करें' : language === 'mr' ? 'कर्ज रक्कम प्रविष्ट करा' : 'Preferred loan amount is required';
      }
    }

    if (step === 5) {
      if (!formData.consentSaved) {
        newErrors.consentSaved = language === 'hi' ? 'कृपया स्थानीय स्टोरेज सहमति स्वीकार करें' : language === 'mr' ? 'कृपया स्थानिक साठवण संमती स्वीकारा' : 'Please accept local storage consent to save profile';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    if (!validateStep(5)) return;

    const payload = {
      profileId: initialData?.profileId,
      personal: {
        firstName: formData.firstName.trim(),
        surname: formData.surname.trim(),
        state: formData.state,
        district: formData.district,
        taluka: formData.taluka,
        locality: formData.locality.trim(),
        preferredLanguage: formData.preferredLanguage,
      },
      eligibility: {
        casteCategory: formData.casteCategory,
        hasCasteCert: Boolean(formData.hasCasteCert),
        annualIncome: Number(formData.annualIncome),
        hasIncomeCert: Boolean(formData.hasIncomeCert),
        occupation: formData.occupation,
        education: formData.education,
        defenceService: formData.defenceService,
      },
      documents: {
        casteCert: formData.casteCert,
        incomeCert: formData.incomeCert,
        aadhaar: formData.aadhaar,
        pan: formData.pan,
        educationDocs: formData.educationDocs,
        projectDocs: formData.projectDocs,
        additionalDocs: formData.additionalDocs,
      },
      loanRequirements: {
        purpose: formData.purpose,
        cost: Number(formData.cost),
        preferredAmount: Number(formData.preferredAmount),
        alreadyInBusiness: Boolean(formData.alreadyInBusiness),
        projectDetails: formData.projectDetails.trim(),
      },
      consentSaved: formData.consentSaved,
    };

    if (onSaveComplete) {
      onSaveComplete(payload);
    }
  };

  const stepsMeta = [
    { num: 1, title: language === 'hi' ? 'व्यक्तिगत विवरण' : language === 'mr' ? 'वैयक्तिक माहिती' : 'Personal Details' },
    { num: 2, title: language === 'hi' ? 'पात्रता व परिवार' : language === 'mr' ? 'पात्रता व कुटुंब' : 'Eligibility & Family' },
    { num: 3, title: language === 'hi' ? 'दस्तावेज़ चेकलिस्ट' : language === 'mr' ? 'कागदपत्र चेकलिस्ट' : 'Document Checklist' },
    { num: 4, title: language === 'hi' ? 'ऋण आवश्यकताएँ' : language === 'mr' ? 'कर्ज आवश्यकता' : 'Loan Requirements' },
    { num: 5, title: language === 'hi' ? 'समीक्षा व सुरक्षित करें' : language === 'mr' ? 'पडताळणी व जतन' : 'Review & Save' },
  ];

  return (
    <div className="prof-form-container">
      {/* Top Multi-step Progress Bar */}
      <div className="prof-stepper" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={5}>
        <div className="prof-stepper-track">
          <div className="prof-stepper-fill" style={{ width: `${((currentStep - 1) / 4) * 100}%` }} />
        </div>
        <div className="prof-stepper-nodes">
          {stepsMeta.map((s) => {
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <button
                key={s.num}
                type="button"
                className={`prof-node-btn ${isDone ? 'prof-node-done' : ''} ${isCurrent ? 'prof-node-current' : ''}`}
                onClick={() => {
                  if (s.num < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.num);
                  }
                }}
              >
                <div className="prof-node-circle">
                  {isDone ? <CheckCircle2 size={14} /> : s.num}
                </div>
                <span className="prof-node-label">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step View Card */}
      <div className="prof-step-content-card">
        {/* ================= STEP 1: PERSONAL DETAILS ================= */}
        {currentStep === 1 && (
          <div className="prof-step-pane animate-fade-in">
            <div className="prof-step-header">
              <span className="prof-step-pill">
                <User size={14} />
                Step 1 of 5
              </span>
              <h3 className="prof-step-title">
                {language === 'hi' ? 'व्यक्तिगत एवं संपर्क विवरण' : language === 'mr' ? 'वैयक्तिक व संपर्क माहिती' : 'Personal & Contact Details'}
              </h3>
              <p className="prof-step-sub">
                {language === 'hi'
                  ? 'सही चैनल पार्टनर की पहचान और आवेदन रूटिंग के लिए अपनी प्राथमिक जानकारी दर्ज करें।'
                  : language === 'mr'
                  ? 'योग्य चॅनेल भागीदार शोधण्यासाठी व अर्ज प्रक्रियेसाठी आपली मूलभूत माहिती प्रविष्ट करा.'
                  : 'Enter primary applicant information to route you to authorized Channel Partners.'}
              </p>
            </div>

            <div className="prof-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="prof-first-name">
                  {language === 'hi' ? 'प्रथम नाम *' : language === 'mr' ? 'पहिले नाव *' : 'First Name *'}
                </label>
                <input
                  id="prof-first-name"
                  type="text"
                  className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
                  placeholder="e.g. Ramesh"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                />
                {errors.firstName && <span className="form-error">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-surname">
                  {language === 'hi' ? 'उपनाम / सरनेम *' : language === 'mr' ? 'आडनाव *' : 'Surname *'}
                </label>
                <input
                  id="prof-surname"
                  type="text"
                  className={`form-input ${errors.surname ? 'form-input-error' : ''}`}
                  placeholder="e.g. Kamble"
                  value={formData.surname}
                  onChange={(e) => updateField('surname', e.target.value)}
                />
                {errors.surname && <span className="form-error">{errors.surname}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-state">
                  {language === 'hi' ? 'राज्य *' : language === 'mr' ? 'राज्य *' : 'State *'}
                </label>
                <select
                  id="prof-state"
                  className="form-select"
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  {STATES_AND_DISTRICTS.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-district">
                  {language === 'hi' ? 'ज़िला *' : language === 'mr' ? 'जिल्हा *' : 'District *'}
                </label>
                <select
                  id="prof-district"
                  className="form-select"
                  value={formData.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                >
                  {availableDistricts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-taluka">
                  {language === 'hi' ? 'तालुका / तहसील' : language === 'mr' ? 'तालुका' : 'Taluka / Tehsil'}
                </label>
                {selectedDistrictObj?.talukas?.length > 0 ? (
                  <select
                    id="prof-taluka"
                    className="form-select"
                    value={formData.taluka}
                    onChange={(e) => updateField('taluka', e.target.value)}
                  >
                    {selectedDistrictObj.talukas.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="prof-taluka"
                    type="text"
                    className="form-input"
                    placeholder="Enter taluka"
                    value={formData.taluka}
                    onChange={(e) => updateField('taluka', e.target.value)}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-locality">
                  {language === 'hi' ? 'गाँव / शहर / मोहल्ला (वैकल्पिक)' : language === 'mr' ? 'गाव / शहर / परिसर (पर्यायी)' : 'Village / Town / Locality (Optional)'}
                </label>
                <input
                  id="prof-locality"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Shivaji Nagar, Ward 4"
                  value={formData.locality}
                  onChange={(e) => updateField('locality', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-language">
                  {language === 'hi' ? 'पसंदीदा संपर्क भाषा' : language === 'mr' ? 'संभाषणाची पसंतीची भाषा' : 'Preferred Language'}
                </label>
                <select
                  id="prof-language"
                  className="form-select"
                  value={formData.preferredLanguage}
                  onChange={(e) => updateField('preferredLanguage', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ELIGIBILITY & FAMILY ================= */}
        {currentStep === 2 && (
          <div className="prof-step-pane animate-fade-in">
            <div className="prof-step-header">
              <span className="prof-step-pill">
                <Users size={14} />
                Step 2 of 5
              </span>
              <h3 className="prof-step-title">
                {language === 'hi' ? 'पात्रता एवं पारिवारिक पृष्ठभूमि' : language === 'mr' ? 'पात्रता व कौटुंबिक पार्श्वभूमी' : 'Eligibility & Family Background'}
              </h3>
              <p className="prof-step-sub">
                {language === 'hi'
                  ? 'अनुसूचित जाति रियायती सहायता योजनाओं के लिए निर्धारित मानदंडों की जाँच करें।'
                  : language === 'mr'
                  ? 'अनुसूचित जाती सवलतीच्या सहाय्य योजनांसाठी आवश्यक निकषांची पडताळणी.'
                  : 'Evaluate core criteria for concessional credit programmes.'}
              </p>
            </div>

            <div className="prof-form-grid">
              <div className="form-group">
                <label className="form-label">
                  {language === 'hi' ? 'जाति श्रेणी *' : language === 'mr' ? 'जात प्रवर्ग *' : 'Caste Category *'}
                </label>
                <div className="prof-radio-grid">
                  {[
                    { val: 'SC', label: 'Scheduled Caste (SC)', desc: 'Primary beneficiary category' },
                    { val: 'ST', label: 'Scheduled Tribe (ST)', desc: 'General screening' },
                    { val: 'OBC', label: 'OBC', desc: 'General screening' },
                    { val: 'General', label: 'General / Other', desc: 'Standard non-concessional' },
                  ].map((cat) => (
                    <label
                      key={cat.val}
                      className={`prof-choice-box ${formData.casteCategory === cat.val ? 'prof-choice-active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="casteCategory"
                        value={cat.val}
                        checked={formData.casteCategory === cat.val}
                        onChange={() => updateField('casteCategory', cat.val)}
                      />
                      <div>
                        <strong>{cat.label}</strong>
                        <span className="prof-choice-sub">{cat.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {language === 'hi' ? 'क्या आपके पास वैध जाति प्रमाण पत्र है? *' : language === 'mr' ? 'आपल्याकडे वैध जात प्रमाणपत्र आहे का? *' : 'Do you hold a valid Caste Certificate? *'}
                </label>
                <div className="prof-toggle-btns">
                  <button
                    type="button"
                    className={`prof-toggle-btn ${formData.hasCasteCert ? 'prof-toggle-active' : ''}`}
                    onClick={() => updateField('hasCasteCert', true)}
                  >
                    {language === 'hi' ? 'हाँ, उपलब्ध है' : language === 'mr' ? 'होय, उपलब्ध आहे' : 'Yes, Available'}
                  </button>
                  <button
                    type="button"
                    className={`prof-toggle-btn ${!formData.hasCasteCert ? 'prof-toggle-active' : ''}`}
                    onClick={() => updateField('hasCasteCert', false)}
                  >
                    {language === 'hi' ? 'नहीं / प्रतीक्षारत' : language === 'mr' ? 'नाही / प्रतीक्षेत' : 'No / In-process'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-income">
                  {language === 'hi' ? 'वार्षिक पारिवारिक आय (₹ में) *' : language === 'mr' ? 'वार्षिक कौटुंबिक उत्पन्न (₹ मध्ये) *' : 'Annual Family Income (in ₹) *'}
                </label>
                <div className="prof-input-with-presets">
                  <input
                    id="prof-income"
                    type="number"
                    className={`form-input ${errors.annualIncome ? 'form-input-error' : ''}`}
                    value={formData.annualIncome}
                    onChange={(e) => updateField('annualIncome', e.target.value)}
                    step="10000"
                    min="0"
                  />
                  <div className="prof-quick-presets">
                    {[120000, 250000, 350000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className="preset-chip"
                        onClick={() => updateField('annualIncome', amt)}
                      >
                        ₹{(amt / 100000).toFixed(1)}L
                      </button>
                    ))}
                  </div>
                </div>
                <span className="form-hint">
                  {language === 'hi'
                    ? 'अनुसूचित जाति कल्याण योजनाओं के तहत अधिकांश रियायती ऋण ₹5.00 लाख प्रति वर्ष तक की आय सीमा पर विचार करते हैं।'
                    : language === 'mr'
                    ? 'अनुसूचित जाती सवलतीच्या योजनांसाठी साधारणतः ₹५.०० लाखांपर्यंत वार्षिक उत्पन्नाचा विचार केला जातो.'
                    : 'Most concessional schemes consider income ceilings up to ₹5.00 Lakh per annum.'}
                </span>
                {errors.annualIncome && <span className="form-error">{errors.annualIncome}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  {language === 'hi' ? 'क्या सक्षम अधिकारी द्वारा आय प्रमाण पत्र जारी है?' : language === 'mr' ? 'सक्षम अधिकाऱ्याचे उत्पन्न प्रमाणपत्र उपलब्ध आहे का?' : 'Is a valid Income Certificate available?'}
                </label>
                <div className="prof-toggle-btns">
                  <button
                    type="button"
                    className={`prof-toggle-btn ${formData.hasIncomeCert ? 'prof-toggle-active' : ''}`}
                    onClick={() => updateField('hasIncomeCert', true)}
                  >
                    {language === 'hi' ? 'हाँ' : language === 'mr' ? 'होय' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    className={`prof-toggle-btn ${!formData.hasIncomeCert ? 'prof-toggle-active' : ''}`}
                    onClick={() => updateField('hasIncomeCert', false)}
                  >
                    {language === 'hi' ? 'नहीं' : language === 'mr' ? 'नाही' : 'No'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-occupation">
                  {language === 'hi' ? 'वर्तमान रोजगार / व्यवसाय' : language === 'mr' ? 'सध्याचा व्यवसाय / नोकरी' : 'Current Employment / Occupation'}
                </label>
                <select
                  id="prof-occupation"
                  className="form-select"
                  value={formData.occupation}
                  onChange={(e) => updateField('occupation', e.target.value)}
                >
                  <option value="micro-business">Small Business / Self-Employed</option>
                  <option value="salaried">Salaried / Private Employment</option>
                  <option value="artisan">Artisan / Handloom / Daily Wage</option>
                  <option value="agriculture">Agriculture / Allied Farming</option>
                  <option value="student">Student / Aspirant</option>
                  <option value="unemployed">Seeking Employment / Starting Venture</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-education">
                  {language === 'hi' ? 'शैक्षणिक योग्यता' : language === 'mr' ? 'शैक्षणिक पात्रता' : 'Education Status'}
                </label>
                <select
                  id="prof-education"
                  className="form-select"
                  value={formData.education}
                  onChange={(e) => updateField('education', e.target.value)}
                >
                  <option value="below-10th">Below 10th Standard</option>
                  <option value="10th-pass">10th / Secondary School</option>
                  <option value="12th-pass">12th / Higher Secondary</option>
                  <option value="diploma">Technical / Vocational Diploma</option>
                  <option value="graduate">Graduate Degree (BA, B.Sc, B.Com, B.Tech)</option>
                  <option value="post-graduate">Post Graduate / Professional Degree</option>
                </select>
              </div>

              {/* Defence Question with Non-bias note */}
              <div className="form-group prof-full-col">
                <label className="form-label">
                  {language === 'hi'
                    ? 'क्या परिवार में कोई सदस्य रक्षा बलों (Defence Forces) में सेवारत है?'
                    : language === 'mr'
                    ? 'कुटुंबातील कोणी संरक्षण दलात (Defence Forces) कार्यरत आहे का?'
                    : 'Is anyone in your family serving in the Defence Forces?'}
                </label>
                <div className="prof-toggle-btns prof-tri-toggle">
                  {['Yes', 'No', 'Prefer not to say'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`prof-toggle-btn ${formData.defenceService === opt ? 'prof-toggle-active' : ''}`}
                      onClick={() => updateField('defenceService', opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="prof-callout-note">
                  <Info size={14} />
                  <span>
                    {language === 'hi'
                      ? 'नोट: रक्षा सेवा की जानकारी केवल विशेष योजनाओं के सत्यापन हेतु एकत्र की जाती है। यह किसी ऋण के लिए स्वतः लाभ या अयोग्यता नहीं बनाती।'
                      : language === 'mr'
                      ? 'टीप: संरक्षण सेवेची माहिती विशिष्ट योजनांच्या तपासणीसाठी आहे. याने कर्जासाठी आपोआप पात्रता किंवा अपात्रता ठरत नाही.'
                      : 'Note: Defence service information is recorded for specific scheme evaluation. It does not automatically grant benefits or disqualify applicants unless an official scheme specifically dictates.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: DOCUMENT CHECKLIST ================= */}
        {currentStep === 3 && (
          <div className="prof-step-pane animate-fade-in">
            <div className="prof-step-header">
              <span className="prof-step-pill">
                <FileCheck size={14} />
                Step 3 of 5
              </span>
              <h3 className="prof-step-title">
                {language === 'hi' ? 'दस्तावेज़ उपलब्धता चेकलिस्ट' : language === 'mr' ? 'कागदपत्र उपलब्धता चेकलिस्ट' : 'Document Availability Checklist'}
              </h3>
              <p className="prof-step-sub">
                {language === 'hi'
                  ? 'अपनी तैयारी का आकलन करें। किसी भी दस्तावेज़ की फ़ाइल या संवेदनशील नंबर अपलोड करने की आवश्यकता नहीं है।'
                  : language === 'mr'
                  ? 'आपली पूर्वतयारी तपासा. कोणतेही ओळखपत्र क्रमांक किंवा कागदपत्र फाईल अपलोड करण्याची गरज नाही.'
                  : 'Assess your document readiness for channel partner screening. No file uploads or sensitive identity numbers are required.'}
              </p>
            </div>

            {/* Privacy Safeguard Callout */}
            <div className="prof-privacy-banner">
              <ShieldCheck size={18} className="privacy-shield-icon" />
              <div>
                <strong>
                  {language === 'hi' ? 'गोपनीयता एवं सुरक्षा प्रतिज्ञा:' : language === 'mr' ? 'गोपनीयता व सुरक्षा हमी:' : 'Privacy Safeguard Guarantee:'}
                </strong>
                <p>
                  {language === 'hi'
                    ? 'हम कभी भी आपका 12-अंकीय आधार नंबर, पैन नंबर, बैंक पासवर्ड या ओटीपी नहीं मांगते। मूल दस्तावेज़ों की भौतिक जाँच केवल अधिकृत चैनल पार्टनर द्वारा की जाती है।'
                    : language === 'mr'
                    ? 'आम्ही कधीही आधार नंबर, पॅन नंबर, पासवर्ड किंवा ओटीपी विचारत नाही. मूळ कागदपत्रांची पडताळणी प्रत्यक्ष अधिकृत चॅनेल भागीदाराद्वारे केली जाते.'
                    : 'We never ask for your full Aadhaar number, PAN number, bank passwords, or OTPs. Physical verification is conducted in-person by authorized Channel Partners.'}
                </p>
              </div>
            </div>

            <div className="prof-docs-checklist">
              {[
                {
                  key: 'casteCert',
                  title: 'Caste Certificate (SC)',
                  titleHi: 'जाति प्रमाण पत्र (अनुसूचित जाति)',
                  titleMr: 'जात प्रमाणपत्र (SC)',
                  why: 'Mandatory to avail concessional credit rates under SC welfare schemes.',
                },
                {
                  key: 'incomeCert',
                  title: 'Income Certificate',
                  titleHi: 'आय प्रमाण पत्र',
                  titleMr: 'उत्पन्न प्रमाणपत्र',
                  why: 'Issued by Revenue Authority to verify family income within prescribed ceilings.',
                },
                {
                  key: 'aadhaar',
                  title: 'Aadhaar Card (For In-Person KYC)',
                  titleHi: 'आधार कार्ड (प्रत्यक्ष केवाईसी हेतु)',
                  titleMr: 'आधार कार्ड (केवायसीसाठी)',
                  why: 'Standard photo identity proof for physical verification at institutional branches.',
                },
                {
                  key: 'pan',
                  title: 'PAN Card / Form 60',
                  titleHi: 'पैन कार्ड / फॉर्म 60',
                  titleMr: 'पॅन कार्ड / फॉर्म ६०',
                  why: 'Required for commercial credit processing and bank account linkage.',
                },
                {
                  key: 'educationDocs',
                  title: 'Educational Records (Admission / Mark Sheets)',
                  titleHi: 'शैक्षणिक रिकॉर्ड (प्रवेश पत्र / अंकतालिकाएं)',
                  titleMr: 'शैक्षणिक कागदपत्रे (प्रवेश पत्र / गुणपत्रिका)',
                  why: 'Applicable when applying for the Educational Loan Scheme.',
                },
                {
                  key: 'projectDocs',
                  title: 'Project Proposal / DPR (For Business Loans)',
                  titleHi: 'परियोजना प्रस्ताव / डीपीआर (व्यावसायिक ऋण हेतु)',
                  titleMr: 'प्रकल्प अहवाल / डीपीआर (व्यवसाय कर्जासाठी)',
                  why: 'Detailed Project Report (DPR) required for term loans exceeding ₹5.00 Lakh.',
                },
                {
                  key: 'additionalDocs',
                  title: 'Business Registration / Udyam Certificate',
                  titleHi: 'उद्यम पंजीकरण / दुकान प्रतिष्ठान लाइसेंस',
                  titleMr: 'उद्यम नोंदणी / व्यवसाय परवाना',
                  why: 'Supports enterprise verification for existing micro and small ventures.',
                },
              ].map((doc) => {
                const currentVal = formData[doc.key] || 'available';
                return (
                  <div key={doc.key} className="prof-doc-row">
                    <div className="prof-doc-info">
                      <strong className="prof-doc-name">
                        {language === 'hi' ? doc.titleHi : language === 'mr' ? doc.titleMr : doc.title}
                      </strong>
                      <span className="prof-doc-why">{doc.why}</span>
                    </div>

                    <div className="prof-doc-options">
                      {[
                        { val: 'available', label: 'Available', labelHi: 'उपलब्ध', labelMr: 'उपलब्ध' },
                        { val: 'not-available', label: 'Not Available', labelHi: 'अनुपलब्ध', labelMr: 'नाही' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          className={`doc-pill-btn ${currentVal === opt.val ? `doc-pill-${opt.val}` : ''}`}
                          onClick={() => updateField(doc.key, opt.val)}
                        >
                          {language === 'hi' ? opt.labelHi : language === 'mr' ? opt.labelMr : opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 4: LOAN REQUIREMENTS ================= */}
        {currentStep === 4 && (
          <div className="prof-step-pane animate-fade-in">
            <div className="prof-step-header">
              <span className="prof-step-pill">
                <Briefcase size={14} />
                Step 4 of 5
              </span>
              <h3 className="prof-step-title">
                {language === 'hi' ? 'ऋण आवश्यकताएँ एवं परियोजना विवरण' : language === 'mr' ? 'कर्ज आवश्यकता व प्रकल्प तपशील' : 'Loan Requirements & Project Details'}
              </h3>
              <p className="prof-step-sub">
                {language === 'hi'
                  ? 'अपनी आवश्यकता के अनुसार सही ऋण श्रेणी (माइक्रो फाइनेंस, टर्म लोन, या शिक्षा) चुनें।'
                  : language === 'mr'
                  ? 'आपल्या गरजेनुसार योग्य कर्ज वर्ग (मायक्रो फायनान्स, टर्म लोन किंवा शिक्षण) निवडा.'
                  : 'Specify your financial requirements to match appropriate schemes.'}
              </p>
            </div>

            <div className="prof-form-grid">
              <div className="form-group prof-full-col">
                <label className="form-label">
                  {language === 'hi' ? 'आपको वित्तीय सहायता किस उद्देश्य के लिए चाहिए? *' : language === 'mr' ? 'आपणास आर्थिक सहाय्य कशासाठी हवे आहे? *' : 'What do you need financial assistance for? *'}
                </label>
                <div className="prof-purpose-grid">
                  {[
                    {
                      val: 'small-business',
                      title: 'Small Business or Self-Employment',
                      desc: 'Micro-enterprises, petty trade, artisan work, vending (Up to ₹1.40 Lakh)',
                    },
                    {
                      val: 'larger-enterprise',
                      title: 'Larger Enterprise & Manufacturing',
                      desc: 'Plant, machinery, transport, agro-business, workshop (Up to ₹50.00 Lakh)',
                    },
                    {
                      val: 'education',
                      title: 'Higher & Professional Education',
                      desc: 'Undergraduate, Engineering, Medical, MBA, or Studies Abroad',
                    },
                    {
                      val: 'other',
                      title: 'Other Supported Purpose',
                      desc: 'General income-generating activities',
                    },
                  ].map((p) => (
                    <div
                      key={p.val}
                      className={`prof-purpose-card ${formData.purpose === p.val ? 'prof-purpose-active' : ''}`}
                      onClick={() => updateField('purpose', p.val)}
                    >
                      <input
                        type="radio"
                        name="purpose"
                        checked={formData.purpose === p.val}
                        onChange={() => updateField('purpose', p.val)}
                      />
                      <div>
                        <strong>{p.title}</strong>
                        <p>{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-cost">
                  {language === 'hi' ? 'अनुमानित कुल लागत (₹) *' : language === 'mr' ? 'अंदाजित एकूण खर्च (₹) *' : 'Estimated Total Project / Education Cost (₹) *'}
                </label>
                <input
                  id="prof-cost"
                  type="number"
                  className={`form-input ${errors.cost ? 'form-input-error' : ''}`}
                  value={formData.cost}
                  onChange={(e) => updateField('cost', e.target.value)}
                  step="10000"
                  min="1000"
                />
                {errors.cost && <span className="form-error">{errors.cost}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-pref-amount">
                  {language === 'hi' ? 'वांछित ऋण राशि (₹) *' : language === 'mr' ? 'अपेक्षित कर्ज रक्कम (₹) *' : 'Preferred Loan Amount (₹) *'}
                </label>
                <input
                  id="prof-pref-amount"
                  type="number"
                  className={`form-input ${errors.preferredAmount ? 'form-input-error' : ''}`}
                  value={formData.preferredAmount}
                  onChange={(e) => updateField('preferredAmount', e.target.value)}
                  step="10000"
                  min="1000"
                />
                {errors.preferredAmount && <span className="form-error">{errors.preferredAmount}</span>}
              </div>

              {/* Conditional business question */}
              {['small-business', 'larger-enterprise'].includes(formData.purpose) && (
                <div className="form-group">
                  <label className="form-label">
                    {language === 'hi' ? 'क्या आप पहले से कोई व्यवसाय संचालित कर रहे हैं?' : language === 'mr' ? 'आपण आधीपासून व्यवसाय चालवत आहात का?' : 'Do you already operate this business?'}
                  </label>
                  <div className="prof-toggle-btns">
                    <button
                      type="button"
                      className={`prof-toggle-btn ${formData.alreadyInBusiness ? 'prof-toggle-active' : ''}`}
                      onClick={() => updateField('alreadyInBusiness', true)}
                    >
                      {language === 'hi' ? 'हाँ (मौजूदा व्यवसाय)' : language === 'mr' ? 'होय (विद्यमान व्यवसाय)' : 'Yes (Existing)'}
                    </button>
                    <button
                      type="button"
                      className={`prof-toggle-btn ${!formData.alreadyInBusiness ? 'prof-toggle-active' : ''}`}
                      onClick={() => updateField('alreadyInBusiness', false)}
                    >
                      {language === 'hi' ? 'नहीं (नया उद्यम)' : language === 'mr' ? 'नाही (नवीन उपक्रम)' : 'No (New Start)'}
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group prof-full-col">
                <label className="form-label" htmlFor="prof-project-details">
                  {formData.purpose === 'education'
                    ? (language === 'hi' ? 'पाठ्यक्रम, डिग्री एवं कॉलेज विवरण' : language === 'mr' ? 'अभ्यासक्रम व महाविद्यालयाचा तपशील' : 'Course, Degree & Institution Details')
                    : (language === 'hi' ? 'प्रस्तावित व्यावसायिक गतिविधि / उत्पाद विवरण' : language === 'mr' ? 'नियोजित व्यवसाय किंवा उत्पादनाचा तपशील' : 'Proposed Business Activity or Venture Summary')}
                </label>
                <textarea
                  id="prof-project-details"
                  rows={3}
                  className="form-input"
                  placeholder={
                    formData.purpose === 'education'
                      ? 'e.g. B.Tech Computer Engineering at COEP Pune, 4-year degree'
                      : 'e.g. Mobile repair shop and electronic accessories retail store'
                  }
                  value={formData.projectDetails}
                  onChange={(e) => updateField('projectDetails', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW AND SAVE ================= */}
        {currentStep === 5 && (
          <div className="prof-step-pane animate-fade-in">
            <div className="prof-step-header">
              <span className="prof-step-pill">
                <CheckCircle2 size={14} />
                Step 5 of 5
              </span>
              <h3 className="prof-step-title">
                {language === 'hi' ? 'समीक्षा एवं प्रोफ़ाइल सुरक्षित करें' : language === 'mr' ? 'माहिती पडताळणी व जतन' : 'Review & Save Beneficiary Profile'}
              </h3>
              <p className="prof-step-sub">
                {language === 'hi'
                  ? 'अपनी जानकारी की समीक्षा करें। आप किसी भी अनुभाग को तुरंत संपादित कर सकते हैं।'
                  : language === 'mr'
                  ? 'आपल्या माहितीची खात्री करा. आवश्यक असल्यास कोणताही विभाग पुन्हा संपादित करू शकता.'
                  : 'Verify your entered information. You can edit any section before final evaluation.'}
              </p>
            </div>

            <div className="prof-review-cards">
              {/* Review Section 1 */}
              <div className="prof-review-box">
                <div className="prof-review-header">
                  <strong>1. {language === 'hi' ? 'व्यक्तिगत विवरण' : language === 'mr' ? 'वैयक्तिक माहिती' : 'Personal Details'}</strong>
                  <button type="button" className="prof-review-edit-btn" onClick={() => setCurrentStep(1)}>
                    {language === 'hi' ? 'संपादित करें' : language === 'mr' ? 'बदला' : 'Edit'}
                  </button>
                </div>
                <div className="prof-review-grid">
                  <div><span>{language === 'hi' ? 'नाम:' : language === 'mr' ? 'नाव:' : 'Name:'}</span> <strong>{formData.firstName} {formData.surname}</strong></div>
                  <div><span>{language === 'hi' ? 'स्थान:' : language === 'mr' ? 'स्थान:' : 'Location:'}</span> <strong>{formData.district}, {formData.state}</strong></div>
                  <div><span>{language === 'hi' ? 'तालुका:' : language === 'mr' ? 'तालुका:' : 'Taluka:'}</span> <strong>{formData.taluka || '—'}</strong></div>
                  <div><span>{language === 'hi' ? 'भाषा:' : language === 'mr' ? 'भाषा:' : 'Language:'}</span> <strong>{formData.preferredLanguage?.toUpperCase()}</strong></div>
                </div>
              </div>

              {/* Review Section 2 */}
              <div className="prof-review-box">
                <div className="prof-review-header">
                  <strong>2. {language === 'hi' ? 'पात्रता एवं पारिवारिक पृष्ठभूमि' : language === 'mr' ? 'पात्रता व कौटुंबिक पार्श्वभूमी' : 'Eligibility & Background'}</strong>
                  <button type="button" className="prof-review-edit-btn" onClick={() => setCurrentStep(2)}>
                    {language === 'hi' ? 'संपादित करें' : language === 'mr' ? 'बदला' : 'Edit'}
                  </button>
                </div>
                <div className="prof-review-grid">
                  <div><span>{language === 'hi' ? 'जाति श्रेणी:' : language === 'mr' ? 'जात प्रवर्ग:' : 'Caste Category:'}</span> <strong>{formData.casteCategory}</strong></div>
                  <div><span>{language === 'hi' ? 'जाति प्रमाण पत्र:' : language === 'mr' ? 'जात प्रमाणपत्र:' : 'Caste Certificate:'}</span> <strong>{formData.hasCasteCert ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'लंबित' : language === 'mr' ? 'प्रलंबित' : 'Pending')}</strong></div>
                  <div><span>{language === 'hi' ? 'वार्षिक आय:' : language === 'mr' ? 'वार्षिक उत्पन्न:' : 'Annual Income:'}</span> <strong>₹{Number(formData.annualIncome).toLocaleString('en-IN')}</strong></div>
                  <div><span>{language === 'hi' ? 'आय प्रमाण पत्र:' : language === 'mr' ? 'उत्पन्न प्रमाणपत्र:' : 'Income Certificate:'}</span> <strong>{formData.hasIncomeCert ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'लंबित' : language === 'mr' ? 'प्रलंबित' : 'Pending')}</strong></div>
                  <div><span>{language === 'hi' ? 'व्यवसाय:' : language === 'mr' ? 'व्यवसाय:' : 'Occupation:'}</span> <strong>{formData.occupation}</strong></div>
                  <div><span>{language === 'hi' ? 'शिक्षा:' : language === 'mr' ? 'शिक्षण:' : 'Education:'}</span> <strong>{formData.education}</strong></div>
                  <div><span>{language === 'hi' ? 'रक्षा सेवा:' : language === 'mr' ? 'संरक्षण सेवा:' : 'Defence Service:'}</span> <strong>{formData.defenceService}</strong></div>
                </div>
              </div>

              {/* Review Section 3 */}
              <div className="prof-review-box">
                <div className="prof-review-header">
                  <strong>3. {language === 'hi' ? 'दस्तावेज़ चेकलिस्ट' : language === 'mr' ? 'कागदपत्र चेकलिस्ट' : 'Document Checklist'}</strong>
                  <button type="button" className="prof-review-edit-btn" onClick={() => setCurrentStep(3)}>
                    {language === 'hi' ? 'संपादित करें' : language === 'mr' ? 'बदला' : 'Edit'}
                  </button>
                </div>
                <div className="prof-review-grid">
                  <div><span>{language === 'hi' ? 'जाति प्रमाण पत्र:' : language === 'mr' ? 'जात प्रमाणपत्र:' : 'Caste Cert:'}</span> <strong>{formData.casteCert === 'available' ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'अनुपलब्ध' : language === 'mr' ? 'नाही' : 'Not Available')}</strong></div>
                  <div><span>{language === 'hi' ? 'आय प्रमाण पत्र:' : language === 'mr' ? 'उत्पन्न प्रमाणपत्र:' : 'Income Cert:'}</span> <strong>{formData.incomeCert === 'available' ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'अनुपलब्ध' : language === 'mr' ? 'नाही' : 'Not Available')}</strong></div>
                  <div><span>{language === 'hi' ? 'आधार कार्ड:' : language === 'mr' ? 'आधार कार्ड:' : 'Aadhaar:'}</span> <strong>{formData.aadhaar === 'available' ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'अनुपलब्ध' : language === 'mr' ? 'नाही' : 'Not Available')}</strong></div>
                  <div><span>{language === 'hi' ? 'पैन कार्ड:' : language === 'mr' ? 'पॅन कार्ड:' : 'PAN Card:'}</span> <strong>{formData.pan === 'available' ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'अनुपलब्ध' : language === 'mr' ? 'नाही' : 'Not Available')}</strong></div>
                  <div><span>{language === 'hi' ? 'शैक्षणिक दस्तावेज:' : language === 'mr' ? 'शैक्षणिक कागदपत्रे:' : 'Education Docs:'}</span> <strong>{formData.educationDocs === 'available' ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'अनुपलब्ध' : language === 'mr' ? 'नाही' : 'Not Available')}</strong></div>
                  <div><span>{language === 'hi' ? 'परियोजना दस्तावेज / डीपीआर:' : language === 'mr' ? 'प्रकल्प अहवाल / डीपीआर:' : 'Project Docs / DPR:'}</span> <strong>{formData.projectDocs === 'available' ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'अनुपलब्ध' : language === 'mr' ? 'नाही' : 'Not Available')}</strong></div>
                  <div><span>{language === 'hi' ? 'उद्यम / व्यवसाय पंजीकरण:' : language === 'mr' ? 'उद्यम / व्यवसाय नोंदणी:' : 'Business / Udyam:'}</span> <strong>{formData.additionalDocs === 'available' ? (language === 'hi' ? 'उपलब्ध' : language === 'mr' ? 'उपलब्ध' : 'Available') : (language === 'hi' ? 'अनुपलब्ध' : language === 'mr' ? 'नाही' : 'Not Available')}</strong></div>
                </div>
              </div>

              {/* Review Section 4 */}
              <div className="prof-review-box">
                <div className="prof-review-header">
                  <strong>4. {language === 'hi' ? 'ऋण आवश्यकताएँ' : language === 'mr' ? 'कर्ज आवश्यकता' : 'Loan Requirements'}</strong>
                  <button type="button" className="prof-review-edit-btn" onClick={() => setCurrentStep(4)}>
                    {language === 'hi' ? 'संपादित करें' : language === 'mr' ? 'बदला' : 'Edit'}
                  </button>
                </div>
                <div className="prof-review-grid">
                  <div><span>{language === 'hi' ? 'उद्देश्य:' : language === 'mr' ? 'उद्देश:' : 'Purpose:'}</span> <strong>{formData.purpose}</strong></div>
                  <div><span>{language === 'hi' ? 'अनुमानित लागत:' : language === 'mr' ? 'अंदाजित खर्च:' : 'Est. Cost:'}</span> <strong>₹{Number(formData.cost).toLocaleString('en-IN')}</strong></div>
                  <div><span>{language === 'hi' ? 'वांछित ऋण:' : language === 'mr' ? 'अपेक्षित कर्ज:' : 'Preferred Loan:'}</span> <strong>₹{Number(formData.preferredAmount).toLocaleString('en-IN')}</strong></div>
                  <div><span>{language === 'hi' ? 'विवरण:' : language === 'mr' ? 'तपशील:' : 'Details:'}</span> <strong>{formData.projectDetails || '—'}</strong></div>
                </div>
              </div>
            </div>

            {/* Consent & Local Storage Disclosure */}
            <div className="prof-consent-card">
              <label className="prof-consent-label">
                <input
                  type="checkbox"
                  checked={formData.consentSaved}
                  onChange={(e) => updateField('consentSaved', e.target.checked)}
                />
                <span className="prof-consent-text">
                  <strong>
                    {language === 'hi'
                      ? 'मैं इस उपकरण/ब्राउज़र पर प्रोफ़ाइल को स्थानीय रूप से सुरक्षित करने की सहमति देता हूँ।'
                      : language === 'mr'
                      ? 'मी या उपकरणावर प्रोफाइल स्थानिकरित्या जतन करण्याची संमती देतो.'
                      : 'I consent to saving this beneficiary profile locally on this device/browser.'}
                  </strong>
                  <span className="prof-consent-sub">
                    {language === 'hi'
                      ? 'यह प्रोफ़ाइल आपके ब्राउज़र के localStorage में सुरक्षित रहती है ताकि पात्रता जाँच और ईएमआई कैलकुलेटर में आपकी जानकारी स्वतः भरी जा सके। आप इसे कभी भी मिटा सकते हैं।'
                      : language === 'mr'
                      ? 'पात्रता तपासणी व कॅल्क्युलेटरमध्ये माहिती भरण्यासाठी ही प्रोफाइल ब्राउझरच्या स्थानिक साठवणीत राहते. आपण कधीही ती हटवू शकता.'
                      : 'Your profile stays in your browser localStorage to prefill eligibility and EMI tools. No document files or sensitive government ID numbers are stored.'}
                  </span>
                </span>
              </label>
              {errors.consentSaved && <span className="form-error">{errors.consentSaved}</span>}
            </div>

            {/* Project Demonstration Notice */}
            <ProjectDemoNotice variant="full" showBadge={true} className="prof-demo-notice-spacing" />
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="prof-form-nav-bar">
          <div>
            {currentStep > 1 && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleBack}>
                <ArrowLeft size={16} />
                {language === 'hi' ? 'पीछे' : language === 'mr' ? 'मागे' : 'Back'}
              </button>
            )}
            {currentStep === 1 && onCancel && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
                {language === 'hi' ? 'रद्द करें' : language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
            )}
          </div>

          <div>
            {currentStep < 5 ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={handleNext}>
                {language === 'hi' ? 'आगे बढ़ें' : language === 'mr' ? 'पुढे चला' : 'Continue'}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm prof-submit-btn"
                onClick={handleFinalSubmit}
                id="btn-find-best-fit-scheme"
              >
                <CheckCircle2 size={16} />
                {language === 'hi'
                  ? 'मेरी सर्वश्रेष्ठ योजना खोजें'
                  : language === 'mr'
                  ? 'माझ्यासाठी योग्य योजना शोधा'
                  : 'Find My Best-Fit Scheme'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
