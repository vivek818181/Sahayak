import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import ThemeToggle from './ThemeToggle';
import {
  Home,
  Search,
  ClipboardCheck,
  Calculator,
  Users,
  FileText,
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const { t, language } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: Home, id: 'nav-sidebar-home' },
    { to: '/schemes', label: t('nav.schemes'), icon: Search, id: 'nav-sidebar-schemes' },
    { to: '/eligibility', label: t('nav.eligibility'), icon: ClipboardCheck, id: 'nav-sidebar-eligibility' },
    { to: '/calculator', label: t('nav.calculator'), icon: Calculator, id: 'nav-sidebar-calculator' },
    { to: '/partners', label: t('nav.partners'), icon: Users, id: 'nav-sidebar-partners' },
    { to: '/tracker', label: t('nav.tracker'), icon: FileText, id: 'nav-sidebar-tracker' },
    { to: '/about', label: t('nav.about') || 'About', icon: Info, id: 'nav-sidebar-about' },
    { to: '/admin', label: t('nav.admin') || 'Admin Portal (Demo)', icon: Shield, id: 'nav-sidebar-admin' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${
          mobileOpen ? 'sidebar-mobile-open' : ''
        }`}
        aria-label="Main navigation sidebar"
      >
        {/* Top Header / Branding & Toggle */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={handleLinkClick} title="Sahayak — Home">
            <div className="sidebar-logo">
              <span className="sidebar-logo-icon">स</span>
            </div>
            {!collapsed && (
              <div className="sidebar-brand-info">
                <span className="sidebar-brand-name">
                  {language === 'hi' || language === 'mr' ? 'सहायक' : 'Sahayak'}
                </span>
                <span className="sidebar-brand-badge">
                  <Sparkles size={10} />
                  <span>{language === 'hi' || language === 'mr' ? 'एससी पोर्टल' : 'SC Portal'}</span>
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            className="sidebar-toggle-btn hide-mobile"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            id="sidebar-collapse-toggle"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sidebar-close-btn hide-desktop"
            onClick={onCloseMobile}
            aria-label="Close navigation drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav" role="navigation" aria-label="Sidebar navigation">
          <div className="sidebar-nav-list">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              const Icon = link.icon;

              return (
                <div key={link.to} className="sidebar-item-container">
                  <Link
                    to={link.to}
                    id={link.id}
                    className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                    onClick={handleLinkClick}
                    aria-current={active ? 'page' : undefined}
                  >
                    <div className="sidebar-icon-wrap">
                      <Icon size={20} className="sidebar-icon" />
                    </div>
                    {!collapsed && <span className="sidebar-label">{link.label}</span>}
                    {active && <span className="sidebar-active-indicator" />}
                  </Link>

                  {/* Tooltip visible only when collapsed on desktop hover */}
                  {collapsed && (
                    <span className="sidebar-floating-tooltip" role="tooltip">
                      {link.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section: Theme Toggle at bottom-left */}
        <div className="sidebar-bottom">
          <div className="sidebar-theme-container">
            <ThemeToggle collapsed={collapsed} />
          </div>

          {!collapsed && (
            <div className="sidebar-portal-note">
              <span className="portal-note-dot" />
              <span className="portal-note-text">
                {language === 'hi' ? 'कन्सेशनल क्रेडिट पोर्टल' : language === 'mr' ? 'सवलतीचे कर्ज पोर्टल' : 'Concessional Credit Assist'}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
