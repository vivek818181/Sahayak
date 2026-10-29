import { Info, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import './ProjectDemoNotice.css';

/**
 * Reusable Project Demonstration Notice Component
 * Mandatory for SEVATHON 2026 prototype by NOVATRIX
 * Displays official non-government disclaimer in English, Hindi, and Marathi
 */
export default function ProjectDemoNotice({
  variant = 'full', // 'full' | 'short' | 'inline'
  showBadge = true,
  className = '',
}) {
  const { t, language } = useLanguage();

  const title = t('discoveryResults.demoNoticeTitle') || 'Project Demonstration Notice';
  const body = t('discoveryResults.demoNoticeBody') || 
    "Sahayak is a student innovation prototype developed by NOVATRIX for SEVATHON 2026. The scheme recommendations, illustrative interest rates, estimated repayments, sample partner records and other demonstration outputs are intended to demonstrate the platform's functionality. They may not reflect current official scheme rules, actual funding availability or the terms offered by any institution.\n\nThis platform is not an official government application portal and does not guarantee eligibility, loan approval or disbursement. Applicants must verify current eligibility criteria, interest rates, document requirements and application procedures with the relevant authorized institution before making financial decisions.";
  const shortNote = t('discoveryResults.demoNoticeShort') || 'Illustrative results — official verification required.';

  if (variant === 'short') {
    return (
      <div className={`project-demo-notice-short ${className}`} role="note">
        <Info size={14} className="notice-icon" aria-hidden="true" />
        <span className="notice-short-text">{shortNote}</span>
      </div>
    );
  }

  // Split multi-paragraph body
  const paragraphs = body.split('\n\n').filter(Boolean);

  return (
    <aside className={`project-demo-notice-card ${className}`} role="complementary" aria-label={title}>
      <div className="notice-header">
        <div className="notice-icon-box" aria-hidden="true">
          <Info size={20} />
        </div>
        <div className="notice-header-content">
          <h4 className="notice-title">{title}</h4>
          {showBadge && (
            <span className="notice-badge">
              {shortNote}
            </span>
          )}
        </div>
      </div>
      <div className="notice-body">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="notice-paragraph">
            {p}
          </p>
        ))}
      </div>
    </aside>
  );
}

