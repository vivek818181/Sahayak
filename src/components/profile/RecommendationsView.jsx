import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  IndianRupee,
  Percent,
  FileCheck2,
  AlertTriangle,
  Building2,
  ArrowRight,
  Calculator,
  Compass,
  FileText,
  RefreshCw,
  Edit3,
  Info,
} from 'lucide-react';
import './RecommendationsView.css';

export default function RecommendationsView({ onEditProfile, onClose }) {
  const { language } = useLanguage();
  const { profile, recommendations, setSelectedSchemeForCalc } = useProfile();
  const navigate = useNavigate();

  // FIXED: Instead of returning null (blank page), show a proper fallback UI
  if (!profile) {
    return (
      <div className="rec-view-wrapper">
        <div className="rec-empty-state">
          <AlertCircle size={48} className="rec-empty-icon" />
          <h3 className="rec-empty-title">
            {language === 'hi' ? 'कोई प्रोफ़ाइल नहीं मिला' : language === 'mr' ? 'कोणतीही प्रोफाईल सापडली नाही' : 'No Profile Found'}
          </h3>
          <p className="rec-empty-desc">
            {language === 'hi'
              ? 'योजना अनुशंसाएँ प्राप्त करने के लिए कृपया पहले अपनी प्रोफ़ाइल भरें।'
              : language === 'mr'
              ? 'योजना शिफारसी मिळवण्यासाठी कृपया प्रथम आपली प्रोफाइल भरा.'
              : 'Please complete your beneficiary profile first to receive scheme recommendations.'}
          </p>
          {onEditProfile && (
            <button type="button" className="btn btn-primary btn-sm" onClick={onEditProfile}>
              <Edit3 size={15} />
              {language === 'hi' ? 'प्रोफ़ाइल बनाएँ' : language === 'mr' ? 'प्रोफाइल तयार करा' : 'Create Profile'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="rec-view-wrapper">
        <div className="rec-empty-state">
          <AlertTriangle size={48} className="rec-empty-icon rec-empty-icon-warning" />
          <h3 className="rec-empty-title">
            {language === 'hi' ? 'अनुशंसाएँ उपलब्ध नहीं हैं' : language === 'mr' ? 'शिफारसी उपलब्ध नाहीत' : 'Recommendations Unavailable'}
          </h3>
          <p className="rec-empty-desc">
            {language === 'hi'
              ? 'आपकी प्रोफ़ाइल जानकारी के आधार पर अनुशंसाएँ तैयार नहीं हो पाईं। कृपया अपनी प्रोफ़ाइल की समीक्षा करें और पुनः प्रयास करें।'
              : language === 'mr'
              ? 'आपल्या प्रोफाइल माहितीवरून शिफारसी तयार करता आल्या नाहीत. कृपया प्रोफाइल तपासा आणि पुन्हा प्रयत्न करा.'
              : 'Could not generate recommendations from your profile information. Please review your profile details and try again.'}
          </p>
          {onEditProfile && (
            <button type="button" className="btn btn-primary btn-sm" onClick={onEditProfile}>
              <Edit3 size={15} />
              {language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : language === 'mr' ? 'प्रोफाइल संपादित करा' : 'Edit Profile'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle case where recommendations exist but have an error
  if (recommendations.isValid === false) {
    return (
      <div className="rec-view-wrapper">
        <div className="rec-empty-state">
          <Info size={48} className="rec-empty-icon rec-empty-icon-info" />
          <h3 className="rec-empty-title">
            {language === 'hi' ? 'अतिरिक्त जानकारी आवश्यक' : language === 'mr' ? 'अधिक माहिती आवश्यक' : 'More Information Required'}
          </h3>
          <p className="rec-empty-desc">
            {language === 'hi'
              ? 'योजना अनुशंसाओं के लिए कुछ और जानकारी की आवश्यकता है। कृपया अपनी प्रोफ़ाइल में सभी आवश्यक विवरण भरें।'
              : language === 'mr'
              ? 'योजना शिफारसींसाठी आणखी माहिती आवश्यक आहे. कृपया आपल्या प्रोफाइलमध्ये सर्व आवश्यक तपशील भरा.'
              : 'Additional information is needed to generate scheme recommendations. Please ensure all required fields in your profile are completed.'}
          </p>
          {recommendations.error && (
            <p className="rec-empty-error-detail">{recommendations.error}</p>
          )}
          {onEditProfile && (
            <button type="button" className="btn btn-primary btn-sm" onClick={onEditProfile}>
              <Edit3 size={15} />
              {language === 'hi' ? 'प्रोफ़ाइल अपडेट करें' : language === 'mr' ? 'प्रोफाइल अपडेट करा' : 'Update Profile'}
            </button>
          )}
        </div>
        {recommendations.disclaimer && (
          <div className="rec-mandatory-disclaimer">
            <AlertCircle size={16} className="disclaimer-alert-icon" />
            <p>{recommendations.disclaimer}</p>
          </div>
        )}
      </div>
    );
  }

  const evaluations = recommendations.evaluations || [];
  const disclaimer = recommendations.disclaimer || '';

  // Handle case where evaluations array is empty
  if (evaluations.length === 0) {
    return (
      <div className="rec-view-wrapper">
        <div className="rec-header-banner">
          <div>
            <h3 className="rec-main-title">
              {language === 'hi'
                ? 'स्मार्ट ऋण योजना अनुशंसा रिपोर्ट'
                : language === 'mr'
                ? 'स्मार्ट कर्ज योजना शिफारस अहवाल'
                : 'Smart Loan Scheme Recommendation Report'}
            </h3>
          </div>
        </div>
        <div className="rec-empty-state">
          <AlertCircle size={48} className="rec-empty-icon rec-empty-icon-info" />
          <h3 className="rec-empty-title">
            {language === 'hi' ? 'कोई सटीक योजना मेल नहीं मिला' : language === 'mr' ? 'कोणतीही अचूक योजना जुळली नाही' : 'No Exact Scheme Match Found'}
          </h3>
          <p className="rec-empty-desc">
            {language === 'hi'
              ? 'आपकी प्रोफ़ाइल के आधार पर वर्तमान में कॉन्फ़िगर की गई किसी योजना से स्पष्ट मिलान नहीं हो सका। कृपया अपनी प्रोफ़ाइल विवरण की समीक्षा करें, या उपलब्ध सभी योजनाओं को ब्राउज़ करें।'
              : language === 'mr'
              ? 'आपल्या प्रोफाइलवर आधारित सध्या कॉन्फिगर केलेल्या कोणत्याही योजनेशी स्पष्ट जुळणी नाही. कृपया आपले तपशील तपासा किंवा सर्व उपलब्ध योजना ब्राउझ करा.'
              : 'Based on your current profile, no configured scheme returned a clear match. Please review your profile details, or browse all available schemes.'}
          </p>
          <div className="rec-empty-actions">
            {onEditProfile && (
              <button type="button" className="btn btn-primary btn-sm" onClick={onEditProfile}>
                <Edit3 size={15} />
                {language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : language === 'mr' ? 'प्रोफाइल संपादित करा' : 'Edit Profile'}
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (onClose) onClose();
                navigate('/schemes');
              }}
            >
              {language === 'hi' ? 'सभी योजनाएँ देखें' : language === 'mr' ? 'सर्व योजना पहा' : 'Browse All Schemes'}
            </button>
          </div>
        </div>
        {disclaimer && (
          <div className="rec-mandatory-disclaimer">
            <AlertCircle size={16} className="disclaimer-alert-icon" />
            <p>{disclaimer}</p>
          </div>
        )}
      </div>
    );
  }

  const handleCalculateEMI = (scheme) => {
    setSelectedSchemeForCalc({
      id: scheme.id,
      name: scheme.name || scheme.category,
      maxAmount: scheme.maxAmount,
      rate: scheme.interestRateRange?.defaultRate || 5.0,
      tenure: scheme.tenureMonths?.defaultTenure || 36,
      borrowerName: `${profile?.personal?.firstName || ''} ${profile?.personal?.surname || ''}`.trim(),
    });
    if (onClose) onClose();
    navigate('/calculator');
  };

  const handleFindPartners = (scheme) => {
    if (onClose) onClose();
    navigate('/partners');
  };

  const getOutcomeBadge = (outcomeLabel) => {
    if (outcomeLabel === 'Potential Match') {
      return (
        <span className="outcome-pill outcome-potential-match">
          <CheckCircle2 size={13} />
          {language === 'hi' ? 'संभावित सुमेलन' : language === 'mr' ? 'संभाव्य जुळणी' : 'Potential Match'}
        </span>
      );
    }
    if (outcomeLabel === 'More Information Required') {
      return (
        <span className="outcome-pill outcome-more-info">
          <AlertCircle size={13} />
          {language === 'hi' ? 'अतिरिक्त जानकारी आवश्यक' : language === 'mr' ? 'अधिक माहिती आवश्यक' : 'More Information Required'}
        </span>
      );
    }
    return (
      <span className="outcome-pill outcome-mismatch">
        <XCircle size={13} />
        {language === 'hi' ? 'कॉन्फ़िगर किए गए नियमों से मेल नहीं खाता' : language === 'mr' ? 'नियमांनुसार जुळत नाही' : 'Does Not Match Configured Rules'}
      </span>
    );
  };

  return (
    <div className="rec-view-wrapper">
      <div className="rec-header-banner">
        <div>
          <h3 className="rec-main-title">
            {language === 'hi'
              ? 'स्मार्ट ऋण योजना अनुशंसा रिपोर्ट'
              : language === 'mr'
              ? 'स्मार्ट कर्ज योजना शिफारस अहवाल'
              : 'Smart Loan Scheme Recommendation Report'}
          </h3>
          <p className="rec-main-desc">
            {language === 'hi'
              ? `${profile?.personal?.firstName || 'आवेदक'} के प्रोफाइल और स्व-रिपोर्ट किए गए डेटा के आधार पर प्रारंभिक मिलान:`
              : language === 'mr'
              ? `${profile?.personal?.firstName || 'अर्जदार'} यांच्या प्रोफाइलवर आधारित प्राथमिक जुळणी अहवाल:`
              : `Preliminary scheme matching for ${profile?.personal?.firstName || 'Applicant'} based on configured rules and document readiness:`}
          </p>
        </div>
        {onEditProfile && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onEditProfile}>
            {language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : language === 'mr' ? 'प्रोफाइल संपादित करा' : 'Edit Profile'}
          </button>
        )}
      </div>

      {/* List of Evaluated Scheme Cards */}
      <div className="rec-cards-list">
        {evaluations.map((scheme) => {
          const isPotential = scheme.outcomeLabel === 'Potential Match';
          const isMoreInfo = scheme.outcomeLabel === 'More Information Required';
          const isMismatch = scheme.outcomeLabel === 'Does Not Match Configured Rules';

          return (
            <div
              key={scheme.id}
              className={`rec-eval-card ${
                isPotential ? 'rec-card-potential' : isMoreInfo ? 'rec-card-info' : 'rec-card-disqualified'
              }`}
            >
              {/* Card Header */}
              <div className="rec-eval-header">
                <div className="rec-eval-title-wrap">
                  <h4 className="rec-scheme-name">{scheme.name || scheme.category}</h4>
                  <p className="rec-scheme-purpose">{scheme.purpose}</p>
                </div>
                <div className="rec-eval-badge-wrap">
                  {getOutcomeBadge(scheme.outcomeLabel)}
                </div>
              </div>

              {/* Financial Key Parameters Grid */}
              <div className="rec-params-grid">
                <div className="rec-param-item">
                  <span className="rec-param-label">
                    {language === 'hi' ? 'अधिकतम सांकेतिक राशि' : language === 'mr' ? 'कमाल मर्यादा' : 'Max Loan Ceiling'}
                  </span>
                  <span className="rec-param-val">{scheme.maxAmountLabel}</span>
                </div>

                <div className="rec-param-item">
                  <span className="rec-param-label">
                    {language === 'hi' ? 'सांकेतिक रियायती दर' : language === 'mr' ? 'सवलतीचा व्याजदर' : 'Indicative Interest Rate'}
                  </span>
                  <span className="rec-param-val">{scheme.interestRateRange?.display || '4.0% – 6.5% p.a.'}</span>
                </div>

                <div className="rec-param-item">
                  <span className="rec-param-label">
                    {language === 'hi' ? 'सत्यापन स्थिति' : language === 'mr' ? 'पडताळणी स्थिती' : 'Verification Status'}
                  </span>
                  <span className="rec-param-note">{scheme.verificationStatus}</span>
                </div>
              </div>

              {/* Match / Reason Analysis */}
              {scheme.matchReasons && scheme.matchReasons.length > 0 && (
                <div className="rec-reasons-block rec-reasons-positive">
                  <span className="rec-reasons-title">
                    <CheckCircle2 size={14} />
                    {language === 'hi' ? 'पात्रता मिलान के कारण' : language === 'mr' ? 'जुळणीची कारणे' : 'Matching Rule Reasons'}
                  </span>
                  <ul className="rec-reasons-list">
                    {scheme.matchReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mismatch Reasons */}
              {scheme.mismatchReasons && scheme.mismatchReasons.length > 0 && (
                <div className="rec-reasons-block rec-reasons-negative">
                  <span className="rec-reasons-title">
                    <XCircle size={14} />
                    {language === 'hi' ? 'नियम बेमेल विवरण' : language === 'mr' ? 'जुळत नसलेली कारणे' : 'Rule Mismatch Observations'}
                  </span>
                  <ul className="rec-reasons-list">
                    {scheme.mismatchReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Documents / Checklist Gaps */}
              {scheme.missingDocuments && scheme.missingDocuments.length > 0 && (
                <div className="rec-reasons-block rec-reasons-warning">
                  <span className="rec-reasons-title">
                    <AlertTriangle size={14} />
                    {language === 'hi' ? 'आवश्यक दस्तावेज़ और छूटी जानकारी' : language === 'mr' ? 'आवश्यक कागदपत्रे व अपूर्ण माहिती' : 'Required Documents & Missing Information'}
                  </span>
                  <ul className="rec-reasons-list">
                    {scheme.missingDocuments.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compatible Channel Partners */}
              {scheme.compatiblePartners && (
                <div className="rec-partner-tags-wrap">
                  <span className="rec-partner-tags-label">
                    <Building2 size={13} />
                    {language === 'hi' ? 'संगत चैनल भागीदार श्रेणियां:' : language === 'mr' ? 'सुसंगत चॅनेल भागीदार:' : 'Compatible Channel Partners:'}
                  </span>
                  <div className="rec-partner-pills">
                    {scheme.compatiblePartners.map((p, i) => (
                      <span key={i} className="rec-partner-pill">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Toolbar */}
              <div className="rec-card-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleCalculateEMI(scheme)}
                >
                  <Calculator size={15} />
                  {language === 'hi' ? 'ईएमआई कैलकुलेटर' : language === 'mr' ? 'ईएमआय मोजा' : 'Calculate EMI'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleFindPartners(scheme)}
                >
                  <Compass size={15} />
                  {language === 'hi' ? 'भागीदार खोजें' : language === 'mr' ? 'भागीदार शोधा' : 'Find Partners'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Disclaimer */}
      {disclaimer && (
        <div className="rec-mandatory-disclaimer">
          <AlertCircle size={16} className="disclaimer-alert-icon" />
          <p>{disclaimer}</p>
        </div>
      )}
    </div>
  );
}
