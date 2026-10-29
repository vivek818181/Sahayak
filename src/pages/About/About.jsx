// pages/About/About.jsx — About Sahayak Page
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Search,
  ClipboardCheck,
  Calculator,
  Compass,
  FileText,
  Sparkles,
  Shield,
  Heart,
  Users,
  Target,
  ArrowRight,
  Info,
  Award,
} from 'lucide-react';
import './About.css';

export default function About() {
  const { t, language } = useLanguage();

  const getTitle = () => t('about.title');
  const getSubtitle = () => t('about.subtitle');
  const getAim = () => t('about.aim');
  const getProblem = () => t('about.problem');
  const getMission = () => t('about.mission');
  const getDisclaimer = () => t('about.disclaimer');

  const features = [
    {
      icon: Search,
      title: t('about.feature1Title'),
      desc: t('about.feature1Desc'),
    },
    {
      icon: ClipboardCheck,
      title: t('about.feature2Title'),
      desc: t('about.feature2Desc'),
    },
    {
      icon: Calculator,
      title: t('about.feature3Title'),
      desc: t('about.feature3Desc'),
    },
    {
      icon: Compass,
      title: t('about.feature4Title'),
      desc: t('about.feature4Desc'),
    },
    {
      icon: FileText,
      title: t('about.feature5Title'),
      desc: t('about.feature5Desc'),
    },
  ];

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content animate-fade-in-up">
            <div className="about-hero-badge">
              <Info size={15} />
              <span>SEVATHON 2026</span>
            </div>
            <h1 className="about-hero-title">{getTitle()}</h1>
            <p className="about-hero-subtitle">{getSubtitle()}</p>
          </div>
        </div>
      </section>

      {/* Aim Section */}
      <section className="section" id="about-aim">
        <div className="container">
          <div className="about-section-card">
            <div className="about-section-icon-wrap" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)' }}>
              <Target size={28} color="#fff" />
            </div>
            <div>
              <h2 className="about-section-title">
                {language === 'hi' ? 'हमारा उद्देश्य' : language === 'mr' ? 'आमचे उद्दिष्ट' : 'Our Aim'}
              </h2>
              <p className="about-section-text">{getAim()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section section-alt" id="about-problem">
        <div className="container">
          <div className="about-section-card">
            <div className="about-section-icon-wrap" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <Users size={28} color="#fff" />
            </div>
            <div>
              <h2 className="about-section-title">
                {language === 'hi' ? 'समस्या' : language === 'mr' ? 'समस्या' : 'The Problem'}
              </h2>
              <p className="about-section-text">{getProblem()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Sahayak Helps */}
      <section className="section" id="about-features">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
            <h2 className="section-title">
              {language === 'hi' ? 'सहायक कैसे मदद करता है' : language === 'mr' ? 'सहायक कशी मदत करते' : 'How Sahayak Helps'}
            </h2>
          </div>
          <div className="about-features-grid">
            {features.map((f, i) => (
              <div key={i} className="about-feature-card">
                <div className="about-feature-icon">
                  <f.icon size={24} />
                </div>
                <h3 className="about-feature-title">{f.title}</h3>
                <p className="about-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section section-alt" id="about-mission">
        <div className="container">
          <div className="about-mission-card">
            <Sparkles size={28} className="about-mission-icon" />
            <blockquote className="about-mission-quote">
              "{getMission()}"
            </blockquote>
          </div>
        </div>
      </section>

      {/* Project Credit */}
      <section className="section" id="about-team">
        <div className="container">
          <div className="about-team-card">
            <div className="about-team-header">
              <Award size={32} className="about-team-award-icon" />
              <div>
                <h2 className="about-team-title">
                  {language === 'hi' ? 'NOVATRIX द्वारा निर्मित' : language === 'mr' ? 'NOVATRIX द्वारे निर्मित' : 'Built by NOVATRIX'}
                </h2>
                <p className="about-team-subtitle">
                  {language === 'hi' ? 'परियोजना: सहायक — स्मार्ट SC ऋण सहायता मंच' : language === 'mr' ? 'प्रकल्प: सहायक — स्मार्ट SC कर्ज सहाय्य व्यासपीठ' : 'Project: Sahayak — Smart SC Loan Assistance Platform'}
                </p>
                <p className="about-team-event">
                  {language === 'hi' ? 'आयोजन: SEVATHON 2026' : language === 'mr' ? 'कार्यक्रम: SEVATHON 2026' : 'Event: SEVATHON 2026'}
                </p>
              </div>
            </div>
            <p className="about-team-desc">
              {language === 'hi'
                ? 'सहायक एक छात्र नवाचार प्रोटोटाइप है जिसका उद्देश्य जागरूकता बढ़ाना, योजनाओं की खोज में सुधार करना और प्रासंगिक वित्तीय सहायता जानकारी तक पहुँच को सरल बनाना है।'
                : language === 'mr'
                ? 'सहायक हा एक विद्यार्थी नवोन्मेष प्रोटोटाइप आहे ज्याचे उद्दिष्ट जागरूकता वाढवणे, योजनांचा शोध सुधारणे आणि संबंधित आर्थिक सहाय्य माहितीपर्यंत सुलभ प्रवेश देणे हे आहे.'
                : 'Sahayak is a student innovation prototype intended to improve awareness, scheme discovery, and access to relevant financial assistance information.'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" id="about-cta" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-cta-card">
            <h3 className="about-cta-title">
              {language === 'hi' ? 'अपनी योजना खोजें' : language === 'mr' ? 'तुमची योजना शोधा' : 'Find My Scheme'}
            </h3>
            <p className="about-cta-desc">
              {language === 'hi'
                ? 'अपनी पात्रता जांचें और उपयुक्त वित्तीय सहायता योजनाओं की खोज शुरू करें।'
                : language === 'mr'
                ? 'आपली पात्रता तपासा आणि योग्य आर्थिक सहाय्य योजनांचा शोध सुरू करा.'
                : 'Check your eligibility and start exploring suitable financial assistance schemes.'}
            </p>
            <Link to="/eligibility" className="btn btn-primary btn-lg" id="about-cta-eligibility">
              <ClipboardCheck size={18} />
              {language === 'hi' ? 'पात्रता जाँचें' : language === 'mr' ? 'पात्रता तपासा' : 'Check Eligibility'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section" id="about-disclaimer" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="alert alert-info about-disclaimer-card">
            <Shield size={24} className="about-disclaimer-icon" />
            <div>
              <h3 className="about-disclaimer-title">
                {language === 'hi' ? 'महत्वपूर्ण अस्वीकरण' : language === 'mr' ? 'महत्त्वाचे अस्वीकरण' : 'Important Disclaimer'}
              </h3>
              <p className="about-disclaimer-desc">
                {getDisclaimer()}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
