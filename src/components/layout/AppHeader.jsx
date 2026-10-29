import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import LanguageSelector from './LanguageSelector';
import NotificationDropdown from './NotificationDropdown';
import { Menu, ChevronRight, User } from 'lucide-react';
import './AppHeader.css';

export default function AppHeader({ onOpenMobile }) {
  const { t, language } = useLanguage();
  const { profile, hasProfile, openProfileModal } = useProfile();
  const location = useLocation();

  const getPageInfo = (pathname) => {
    if (pathname === '/') return { title: t('nav.home') };
    if (pathname.startsWith('/schemes')) return { title: t('nav.schemes') };
    if (pathname.startsWith('/eligibility')) return { title: t('nav.eligibility') };
    if (pathname.startsWith('/calculator')) return { title: t('nav.calculator') };
    if (pathname.startsWith('/partners')) return { title: t('nav.partners') };
    if (pathname.startsWith('/tracker')) return { title: t('nav.tracker') };
    if (pathname.startsWith('/admin')) return { title: t('nav.admin') || 'Admin Portal (Demo)' };
    if (pathname.startsWith('/about')) return { title: t('nav.about') || 'About' };
    if (pathname.startsWith('/recommendations')) return { title: t('discoveryResults.pageTitle') || 'Scheme Discovery Results' };
    return { title: t('nav.home') };
  };

  const pageInfo = getPageInfo(location.pathname);

  return (
    <header className="app-header" role="banner">
      <div className="app-header-inner">
        {/* Left Side: Mobile Menu Button & Breadcrumb / Page Title */}
        <div className="app-header-left">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="header-mobile-toggle hide-desktop"
            onClick={onOpenMobile}
            aria-label="Open navigation menu"
            id="mobile-drawer-toggle"
          >
            <Menu size={22} />
          </button>

          {/* Breadcrumb / Page Title */}
          <div className="header-breadcrumb-wrap">
            <nav className="header-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/" className="breadcrumb-root">
                {language === 'hi' || language === 'mr' ? 'सहायक' : 'Sahayak'}
              </Link>
              {location.pathname !== '/' && (
                <>
                  <ChevronRight size={14} className="breadcrumb-separator" />
                  <span className="breadcrumb-current" aria-current="page">
                    {pageInfo.title}
                  </span>
                </>
              )}
            </nav>
            <h1 className="header-page-heading">{pageInfo.title}</h1>
          </div>
        </div>

        {/* Right Side: Demo Status + Controls: Language Selector then Profile Icon at Extreme Right */}
        <div className="app-header-right">
          <div className="header-demo-tag hide-mobile">
            <span className="header-demo-pulse" />
            <span className="header-demo-text">
              {language === 'hi' ? 'स्मार्ट ऋण मंच' : language === 'mr' ? 'स्मार्ट कर्ज मंच' : 'Concessional SC Credit'}
            </span>
          </div>

          <div className="header-controls-group">
            {/* 1. Notifications Dropdown */}
            <NotificationDropdown />

            {/* 2. Language Selector */}
            <LanguageSelector />

            {/* 3. Profile / Onboarding Icon Button — Extreme Right */}
            <button
              type="button"
              className={`header-profile-btn ${hasProfile ? 'header-profile-btn-has-profile' : ''}`}
              onClick={() => openProfileModal(1)}
              aria-label={
                hasProfile
                  ? `${profile?.personal?.firstName} ${profile?.personal?.surname} (${language === 'hi' ? 'लाभार्थी प्रोफ़ाइल' : language === 'mr' ? 'लाभार्थी प्रोफाइल' : 'Beneficiary Profile'})`
                  : (language === 'hi' ? 'लाभार्थी प्रोफ़ाइल पंजीकरण' : language === 'mr' ? 'लाभार्थी प्रोफाइल नोंदणी' : 'Beneficiary Profile Registration')
              }
              title={
                hasProfile
                  ? `${profile?.personal?.firstName} ${profile?.personal?.surname} — Smart Beneficiary Profile`
                  : (language === 'hi' ? 'लाभार्थी प्रोफ़ाइल बनाएं' : language === 'mr' ? 'लाभार्थी प्रोफाइल तयार करा' : 'Beneficiary Profile Registration')
              }
              id="header-profile-btn"
            >
              <User size={18} />
              {hasProfile && <span className="profile-active-dot" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
