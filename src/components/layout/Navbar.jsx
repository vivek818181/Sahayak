import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Menu,
  X,
  Home,
  Search,
  ClipboardCheck,
  Calculator,
  Users,
  FileText,
  Globe,
  ChevronDown,
  Shield,
  Info,
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/schemes', label: t('nav.schemes'), icon: Search },
    { to: '/eligibility', label: t('nav.eligibility'), icon: ClipboardCheck },
    { to: '/calculator', label: t('nav.calculator'), icon: Calculator },
    { to: '/partners', label: t('nav.partners'), icon: Users },
    { to: '/tracker', label: t('nav.tracker'), icon: FileText },
    { to: '/about', label: t('nav.about') || 'About', icon: Info },
    { to: '/admin', label: t('nav.admin') || 'Admin', icon: Shield },
  ];

  const isActive = (path) => location.pathname === path;

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMobile}>
          <div className="navbar-logo">
            <span className="navbar-logo-icon">स</span>
          </div>
          <span className="navbar-brand-text">
            {language === 'hi' || language === 'mr' ? 'सहायक' : 'Sahayak'}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-links hide-mobile" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${isActive(link.to) ? 'navbar-link-active' : ''}`}
            >
              <link.icon size={16} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Language + Mobile Toggle */}
        <div className="navbar-actions">
          {/* Language Selector */}
          <div className="lang-selector" onMouseLeave={() => setLangOpen(false)}>
            <button
              className="btn btn-ghost btn-sm lang-trigger"
              onClick={() => setLangOpen(!langOpen)}
              aria-label={t('nav.language')}
              aria-expanded={langOpen}
            >
              <Globe size={16} />
              <span className="hide-mobile">
                {supportedLanguages.find((l) => l.code === language)?.nativeLabel}
              </span>
              <ChevronDown size={14} className={`lang-chevron ${langOpen ? 'lang-chevron-open' : ''}`} />
            </button>
            {langOpen && (
              <div className="lang-dropdown animate-slide-down" role="listbox">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`lang-option ${language === lang.code ? 'lang-option-active' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangOpen(false);
                    }}
                    role="option"
                    aria-selected={language === lang.code}
                  >
                    <span className="lang-option-native">{lang.nativeLabel}</span>
                    <span className="lang-option-english">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="btn btn-icon hide-desktop navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="navbar-mobile-overlay animate-fade-in" onClick={closeMobile}>
          <nav
            className="navbar-mobile-menu animate-slide-down"
            onClick={(e) => e.stopPropagation()}
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-mobile-link ${isActive(link.to) ? 'navbar-mobile-link-active' : ''}`}
                onClick={closeMobile}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
