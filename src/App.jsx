import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import { ProfileProvider } from './context/ProfileContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import Home from './pages/Home/Home';
import Schemes from './pages/Schemes/Schemes';
import Eligibility from './pages/Eligibility/Eligibility';
import Calculator from './pages/Calculator/Calculator';
import Partners from './pages/Partners/Partners';
import Tracker from './pages/Tracker/Tracker';
import Admin from './pages/Admin/Admin';
import About from './pages/About/About';
import Recommendations from './pages/Recommendations/Recommendations';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const scrollContainer = document.querySelector('.main-content-wrapper');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ProfileProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schemes" element={<Schemes />} />
                <Route path="/eligibility" element={<Eligibility />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/tracker" element={<Tracker />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/about" element={<About />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </ProfileProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
