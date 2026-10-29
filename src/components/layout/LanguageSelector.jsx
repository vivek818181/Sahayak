import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import './LanguageSelector.css';

export default function LanguageSelector() {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
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
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentLang = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <div className="top-lang-selector" ref={containerRef}>
      <button
        type="button"
        className={`top-lang-trigger ${isOpen ? 'top-lang-trigger-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('nav.language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id="top-language-selector-btn"
      >
        <div className="top-lang-icon-badge">
          <Globe size={16} />
        </div>
        <div className="top-lang-text-group">
          <span className="top-lang-current-native">{currentLang.nativeLabel}</span>
          <span className="top-lang-current-code">{currentLang.code.toUpperCase()}</span>
        </div>
        <ChevronDown size={14} className={`top-lang-chevron ${isOpen ? 'top-lang-chevron-open' : ''}`} />
      </button>

      {isOpen && (
        <div className="top-lang-dropdown animate-slide-down" role="listbox" aria-label="Select Language">
          <div className="top-lang-dropdown-header">
            <span>{t('nav.language') || 'Language / भाषा'}</span>
          </div>
          {supportedLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                className={`top-lang-option ${isSelected ? 'top-lang-option-active' : ''}`}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div className="top-lang-option-text">
                  <span className="top-lang-option-native">{lang.nativeLabel}</span>
                  <span className="top-lang-option-en">{lang.label}</span>
                </div>
                {isSelected && <Check size={16} className="top-lang-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
