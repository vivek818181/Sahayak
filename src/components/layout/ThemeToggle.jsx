import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import './ThemeToggle.css';

export default function ThemeToggle({ collapsed = false }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const labels = {
    en: {
      light: 'Light Mode',
      dark: 'Dark Mode',
      switchToLight: 'Switch to Light Mode',
      switchToDark: 'Switch to Dark Mode',
    },
    hi: {
      light: 'लाइट मोड',
      dark: 'डार्क मोड',
      switchToLight: 'लाइट मोड पर स्विच करें',
      switchToDark: 'डार्क मोड पर स्विच करें',
    },
    mr: {
      light: 'लाइट मोड',
      dark: 'डार्क मोड',
      switchToLight: 'लाइट मोडवर स्विच करा',
      switchToDark: 'डार्क मोडवर स्विच करा',
    },
  };

  const currentLabels = labels[language] || labels.en;
  const tooltipText = isDark ? currentLabels.switchToLight : currentLabels.switchToDark;
  const currentModeText = isDark ? currentLabels.dark : currentLabels.light;

  return (
    <div className={`theme-toggle-wrapper ${collapsed ? 'theme-toggle-collapsed' : ''}`}>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={tooltipText}
        title={collapsed ? tooltipText : undefined}
      >
        <div className="theme-toggle-icon-wrap">
          {isDark ? (
            <Moon size={18} className="theme-icon moon-icon" />
          ) : (
            <Sun size={18} className="theme-icon sun-icon" />
          )}
        </div>

        {!collapsed && (
          <div className="theme-toggle-label-group">
            <span className="theme-toggle-title">{currentModeText}</span>
            <div className={`theme-switch-pill ${isDark ? 'theme-switch-dark' : 'theme-switch-light'}`}>
              <div className="theme-switch-thumb" />
            </div>
          </div>
        )}
      </button>

      {collapsed && (
        <span className="sidebar-floating-tooltip" role="tooltip">
          {tooltipText}
        </span>
      )}
    </div>
  );
}
