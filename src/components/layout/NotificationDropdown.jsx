import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { schemeAnnouncements } from '../../data/announcements';
import AnnouncementModal from './AnnouncementModal';
import {
  Bell,
  Sparkles,
  ChevronRight,
  CheckCheck,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';
import './NotificationDropdown.css';

const READ_STORAGE_KEY = 'sahayak_read_announcements';

export default function NotificationDropdown() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);

  // Stored read IDs
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(READ_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sort announcements by date
  const announcementsList = useMemo(() => {
    return [...schemeAnnouncements].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  // Compute unread count
  const unreadCount = useMemo(() => {
    return announcementsList.filter((a) => !readIds.includes(a.id)).length;
  }, [announcementsList, readIds]);

  // Handle click outside & Esc key
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const markAllAsRead = (e) => {
    e.stopPropagation();
    const allIds = announcementsList.map((a) => a.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(allIds));
    } catch {}
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleOpenAnnouncement = (item) => {
    markAsRead(item.id);
    setSelectedAnnouncement(item);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleOpenAllUpdates = () => {
    if (announcementsList.length > 0) {
      setSelectedAnnouncement(announcementsList[0]);
    }
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const getLocalized = (obj, field) => {
    if (!obj) return '';
    if (language === 'hi' && obj[`${field}Hi`]) return obj[`${field}Hi`];
    if (language === 'mr' && obj[`${field}Mr`]) return obj[`${field}Mr`];
    return obj[field] || '';
  };

  return (
    <div className="top-notification-container" ref={containerRef}>
      {/* Fixed Header Notification Bell Trigger */}
      <button
        type="button"
        className={`header-notification-btn ${isOpen ? 'header-notification-btn-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('announcements.notificationsTitle') || 'Scheme Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        id="header-notification-btn"
        title={
          unreadCount > 0
            ? `${t('announcements.notificationsTitle') || 'Notifications'} (${unreadCount} ${t('announcements.newNotifications') || 'new'})`
            : t('announcements.notificationsTitle') || 'Notifications'
        }
      >
        <Bell size={18} className="notification-bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Dropdown Panel */}
      {isOpen && (
        <div
          className="top-notification-dropdown animate-slide-down"
          role="dialog"
          aria-label={t('announcements.notificationsTitle') || 'Notifications Panel'}
        >
          {/* Dropdown Header */}
          <div className="notif-dropdown-header">
            <div className="notif-header-left">
              <span className="notif-header-title">
                {t('announcements.notificationsTitle') || 'Scheme Notifications'}
              </span>
              {unreadCount > 0 ? (
                <span className="notif-count-pill">
                  {unreadCount} {t('announcements.newNotifications') || 'New'}
                </span>
              ) : (
                <span className="notif-count-pill notif-count-pill-all-read">
                  {language === 'hi' ? 'सभी पढ़े गए' : language === 'mr' ? 'सर्व वाचले' : 'All caught up'}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-read-btn"
                onClick={markAllAsRead}
                title={t('announcements.markAllRead') || 'Mark all as read'}
              >
                <CheckCheck size={14} />
                <span className="hide-mobile">{t('announcements.markAllRead') || 'Mark all read'}</span>
              </button>
            )}
          </div>

          {/* Scrollable Notification Items List */}
          <div className="notif-items-list" role="feed">
            {announcementsList.length === 0 ? (
              <div className="notif-empty-state">
                <Bell size={24} className="notif-empty-icon" />
                <p>{t('announcements.empty') || 'No new notifications at this time.'}</p>
              </div>
            ) : (
              announcementsList.map((item) => {
                const isUnread = !readIds.includes(item.id);
                const badge = getLocalized(item, 'badge') || item.badge;
                const title = getLocalized(item, 'title');
                const shortText = getLocalized(item, 'shortText');

                return (
                  <article
                    key={item.id}
                    className={`notif-item-card ${isUnread ? 'notif-item-unread' : ''}`}
                    onClick={() => handleOpenAnnouncement(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenAnnouncement(item);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${title} - ${item.date}`}
                  >
                    <div className="notif-item-top">
                      <span className={`notif-badge notif-badge-${item.status?.toLowerCase() || 'new'}`}>
                        {badge}
                      </span>
                      <span className="notif-date">
                        <Calendar size={11} />
                        {item.date}
                      </span>
                      {isUnread && <span className="notif-unread-dot" aria-label="Unread" />}
                    </div>

                    <h4 className="notif-item-title">{title}</h4>
                    <p className="notif-item-desc">{shortText}</p>

                    <div className="notif-item-action">
                      <span>{t('announcements.viewDetails') || 'View Details'}</span>
                      <ChevronRight size={13} />
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="notif-dropdown-footer">
            <button
              type="button"
              className="notif-view-all-btn"
              onClick={handleOpenAllUpdates}
            >
              <Sparkles size={14} />
              <span>{t('announcements.allUpdates') || 'View All Scheme Updates'}</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Detailed Modal Triggered from Dropdown */}
      <AnnouncementModal
        announcement={selectedAnnouncement || announcementsList[0]}
        allAnnouncements={announcementsList}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAnnouncement={(item) => setSelectedAnnouncement(item)}
      />
    </div>
  );
}

