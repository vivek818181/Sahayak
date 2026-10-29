import { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { schemeAnnouncements } from '../../data/announcements';
import AnnouncementModal from './AnnouncementModal';
import { Bell, ChevronRight, Sparkles, Volume2 } from 'lucide-react';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
  const { language } = useLanguage();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out archived or show recent first
  const activeAnnouncements = useMemo(() => {
    return [...schemeAnnouncements].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  const current = activeAnnouncements[currentIndex] || activeAnnouncements[0];

  const getLocalized = (obj, field) => {
    if (!obj) return '';
    if (language === 'hi' && obj[`${field}Hi`]) return obj[`${field}Hi`];
    if (language === 'mr' && obj[`${field}Mr`]) return obj[`${field}Mr`];
    return obj[field] || '';
  };

  const handleOpenNotice = (item) => {
    setSelectedAnnouncement(item || current);
    setIsModalOpen(true);
  };

  if (!activeAnnouncements.length) {
    return (
      <div className="ann-bar-container" role="region" aria-label="Scheme notices">
        <div className="ann-bar-inner">
          <div className="ann-badge-pill">
            <Bell size={13} />
            <span>{language === 'hi' ? 'सूचना' : language === 'mr' ? 'सूचना' : 'NOTICES'}</span>
          </div>
          <span className="ann-ticker-empty">
            {language === 'hi'
              ? 'वर्तमान में कोई नई अधिसूचना सक्रिय नहीं है। सभी योजनाएं सामान्य रूप से उपलब्ध हैं।'
              : language === 'mr'
              ? 'सध्या कोणतीही नवीन सूचना सक्रिय नाही. सर्व योजना सामान्यपणे उपलब्ध आहेत.'
              : 'No new scheme announcements at this time. All regular schemes remain active.'}
          </span>
        </div>
      </div>
    );
  }

  const badgeText = getLocalized(current, 'badge') || current.badge || 'NEW SCHEME ALERT';
  const tickerText = getLocalized(current, 'shortText') || current.shortText;

  return (
    <>
      <aside className="ann-bar-container" role="region" aria-label="New scheme announcements">
        <div className="ann-bar-inner" onClick={() => handleOpenNotice(current)} tabIndex={0} role="button" aria-haspopup="dialog" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenNotice(current); } }}>
          {/* Badge Tag */}
          <div className="ann-badge-pill">
            <span className="ann-pulse-glow" />
            <Bell size={14} className="ann-bell-icon" />
            <span className="ann-badge-text">{badgeText}</span>
          </div>

          {/* Smooth Scrolling Ticker / Carousel Content */}
          <div className="ann-ticker-wrapper">
            <div className="ann-ticker-track">
              <span className="ann-ticker-content">
                <Sparkles size={13} className="ann-sparkle-inline" />
                <strong className="ann-ticker-title">{getLocalized(current, 'title')}: </strong>
                {tickerText}
              </span>
            </div>
          </div>

          {/* Action indicator */}
          <div className="ann-cta-indicator">
            <span className="ann-cta-text hide-mobile">
              {language === 'hi' ? 'विवरण देखें' : language === 'mr' ? 'तपशील पहा' : 'View Details'}
            </span>
            <ChevronRight size={15} className="ann-cta-arrow" />
          </div>
        </div>
      </aside>

      {/* Detailed Modal */}
      <AnnouncementModal
        announcement={selectedAnnouncement || current}
        allAnnouncements={activeAnnouncements}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAnnouncement={(item) => setSelectedAnnouncement(item)}
      />
    </>
  );
}
