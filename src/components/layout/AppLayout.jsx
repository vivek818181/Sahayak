import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import AnnouncementBar from './AnnouncementBar';
import BeneficiaryProfileModal from '../profile/BeneficiaryProfileModal';
import Footer from './Footer';
import './AppLayout.css';

const COLLAPSED_STORAGE_KEY = 'sahayak_sidebar_collapsed';

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(COLLAPSED_STORAGE_KEY);
      return saved === 'true';
    } catch {}
    return false;
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Save collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className={`app-dashboard-layout ${collapsed ? 'layout-collapsed' : 'layout-expanded'}`}>
      {/* 1. Fixed Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* 2. Main Dashboard Area with Dynamic Left Margin */}
      <div className="main-content-wrapper">
        {/* Sticky Locked Top Header (AppHeader + Notification System + Announcement Ticker) */}
        <div className="app-sticky-header-container">
          <AppHeader onOpenMobile={() => setMobileOpen(true)} />
          <AnnouncementBar />
        </div>

        {/* Dynamic Route Content */}
        <main className="main-viewport-content" id="main-content">
          {children}
        </main>

        {/* Footer positioned inside main scrollable content */}
        <Footer />

        {/* Global Beneficiary Profile Modal */}
        <BeneficiaryProfileModal />
      </div>
    </div>
  );
}
