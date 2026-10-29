import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { Heart } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="footer-logo-icon">स</span>
              </div>
              <span className="footer-brand-text">
                {language === 'hi' || language === 'mr' ? 'सहायक' : 'Sahayak'}
              </span>
            </div>
            <p className="footer-desc">{t('footer.description')}</p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">{t('footer.quickLinks')}</h4>
            <nav className="footer-links">
              <Link to="/schemes">{t('nav.schemes')}</Link>
              <Link to="/eligibility">{t('nav.eligibility')}</Link>
              <Link to="/calculator">{t('nav.calculator')}</Link>
              <Link to="/partners">{t('nav.partners')}</Link>
              <Link to="/tracker">{t('nav.tracker')}</Link>
              <Link to="/about">{t('nav.about') || 'About'}</Link>
              <Link to="/admin">{t('nav.admin') || 'Admin Demo Portal'}</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h4 className="footer-heading">{t('footer.legal')}</h4>
            <nav className="footer-links">
              <Link to="/">{t('footer.privacy')}</Link>
              <Link to="/">{t('footer.terms')}</Link>
              <Link to="/">{t('footer.accessibility')}</Link>
              <Link to="/">{t('footer.disclaimer')}</Link>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">{t('footer.copyright')}</p>
          <p className="footer-built">
            <Heart size={14} className="footer-heart" />
            <span className="footer-credit">
              {language === 'hi' ? (
                <>
                  <span className="footer-credit-text">द्वारा डिज़ाइन एवं विकसित</span>{' '}
                  <span className="footer-team-highlight">NOVATRIX</span>
                </>
              ) : language === 'mr' ? (
                <>
                  <span className="footer-credit-text">द्वारे डिझाइन आणि विकसित</span>{' '}
                  <span className="footer-team-highlight">NOVATRIX</span>
                </>
              ) : (
                <>
                  <span className="footer-credit-text">Designed and Developed by</span>{' '}
                  <span className="footer-team-highlight">NOVATRIX</span>
                </>
              )}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
