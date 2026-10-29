// pages/Partners/Partners.jsx — Stage 3: Geo-Spatial Partner Locator & Routing System
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import {
  getStoredPartners,
  PARTNER_TYPES,
  PARTNER_TYPE_LABELS,
  states,
  districtsByState,
  REGION_COORDINATES,
} from '../../data/partners';
import {
  matchAndRankPartners,
  generatePartnerChecklist,
} from '../../services/partnerMatchingService';
import { assignPartnerToApplication } from '../../services/applicationService';
import PartnerMap from '../../components/Map/PartnerMap';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Shield,
  ShieldCheck,
  AlertTriangle,
  X,
  Building2,
  Filter,
  Navigation,
  Compass,
  CheckCircle2,
  FileCheck,
  ExternalLink,
  Layers,
  Clock,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import './Partners.css';

export default function Partners() {
  const { t, language } = useLanguage();
  const { profile, hasProfile } = useProfile();
  const [searchParams] = useSearchParams();

  // Search & Filter State
  const initialScheme = searchParams.get('scheme') || '';
  const initialState = searchParams.get('state') || '';
  const initialDistrict = searchParams.get('district') || '';

  const [partnersList] = useState(() => getStoredPartners());
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState(initialState);
  const [districtFilter, setDistrictFilter] = useState(initialDistrict);
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialScheme);
  const [showFilters, setShowFilters] = useState(false);
  const [profileLocationApplied, setProfileLocationApplied] = useState(false);

  const applyProfileLocationFilter = () => {
    if (!profile?.personal) return;
    if (profile.personal.state) setStateFilter(profile.personal.state);
    if (profile.personal.district) setDistrictFilter(profile.personal.district);
    const purposeSchemeMap = {
      small_business: 'micro-finance',
      enterprise: 'term-loan',
      education: 'education-loan',
    };
    if (profile.loanRequirements?.purpose && purposeSchemeMap[profile.loanRequirements.purpose]) {
      setCategoryFilter(purposeSchemeMap[profile.loanRequirements.purpose]);
    }
    setProfileLocationApplied(true);
  };

  // Geo-location state (Strictly with explicit user permission)
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'prompting' | 'granted' | 'denied' | 'error'
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Selected Partner & Checklist Modal State
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [checklistModalPartner, setChecklistModalPartner] = useState(null);
  const [checklistState, setChecklistState] = useState({});
  const [confirmSelectPartner, setConfirmSelectPartner] = useState(null);
  const [savedSuccessApp, setSavedSuccessApp] = useState(null);

  // Available districts for current state
  const availableDistricts = stateFilter ? (districtsByState[stateFilter] || []) : [];

  // Match and Rank Partners
  const rankedPartners = useMemo(() => {
    return matchAndRankPartners(partnersList, {
      category: categoryFilter,
      state: stateFilter,
      district: districtFilter,
      partnerType: typeFilter,
      searchTerm: searchQuery,
      userLat: userLocation?.lat,
      userLng: userLocation?.lng,
    });
  }, [
    partnersList,
    categoryFilter,
    stateFilter,
    districtFilter,
    typeFilter,
    searchQuery,
    userLocation,
  ]);

  // Compute Map Center Coordinates
  const mapCenter = useMemo(() => {
    if (selectedPartner?.lat && selectedPartner?.lng) {
      return { lat: selectedPartner.lat, lng: selectedPartner.lng, zoom: 12 };
    }
    if (userLocation) {
      return { lat: userLocation.lat, lng: userLocation.lng, zoom: 11 };
    }
    if (districtFilter && REGION_COORDINATES.districts[districtFilter]) {
      return REGION_COORDINATES.districts[districtFilter];
    }
    if (stateFilter && REGION_COORDINATES.states[stateFilter]) {
      return REGION_COORDINATES.states[stateFilter];
    }
    return { lat: 21.0, lng: 78.5, zoom: 5 }; // Default India view
  }, [selectedPartner, userLocation, districtFilter, stateFilter]);

  // Explicit User-Permission Geo-Location Flow
  const handleRequestLocationClick = () => {
    if (userLocation) {
      // Clear location if already active
      setUserLocation(null);
      setLocationStatus('idle');
      return;
    }
    setShowLocationPrompt(true);
  };

  const confirmLocationPermission = () => {
    setShowLocationPrompt(false);
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('granted');
        setLocating(false);
      },
      (error) => {
        console.warn('Geolocation denied or unavailable:', error.message);
        setLocationStatus(error.code === 1 ? 'denied' : 'error');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStateFilter('');
    setDistrictFilter('');
    setTypeFilter('');
    setCategoryFilter('');
    setUserLocation(null);
    setLocationStatus('idle');
    setSelectedPartner(null);
  };

  const hasActiveFilters =
    searchQuery ||
    stateFilter ||
    districtFilter ||
    typeFilter ||
    categoryFilter ||
    userLocation;

  // Open Document Checklist Modal
  const handleOpenChecklist = (partner) => {
    setChecklistModalPartner(partner);
    setChecklistState({});
  };

  const toggleChecklistItem = (id) => {
    setChecklistState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Confirm and Save Partner to Draft Application
  const handleConfirmSavePartner = (partner) => {
    try {
      const updatedApp = assignPartnerToApplication(null, partner);
      setSavedSuccessApp(updatedApp);
      setConfirmSelectPartner(null);
    } catch (err) {
      console.error('Failed to assign partner', err);
    }
  };

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container">
          {/* Header */}
          <div className="partners-header animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-teal">
                <Compass size={14} style={{ marginRight: '4px' }} />
                {language === 'hi' ? 'भू-स्थानिक खोज और रूटिंग' : language === 'mr' ? 'भौगोलिक शोध आणि मार्गन' : 'Geo-Spatial Discovery & Routing'}
              </span>
              {categoryFilter && (
                <span className="badge badge-navy">
                  {language === 'hi' ? `योजना फ़िल्टर: ${categoryFilter}` : language === 'mr' ? `योजना फिल्टर: ${categoryFilter}` : `Scheme Filter: ${categoryFilter}`}
                </span>
              )}
            </div>
            <h1 className="section-title">{t('partners.title')}</h1>
            <p className="section-subtitle">{t('partners.subtitle')}</p>
          </div>

          {/* Pre-filtered banner if navigated from Scheme Recommender */}
          {initialScheme && (
            <div className="alert alert-info animate-fade-in" style={{ marginBottom: 'var(--space-4)' }}>
              <Sparkles size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>{language === 'hi' ? 'आपकी चयनित योजना के लिए सुमेलित:' : language === 'mr' ? 'आपल्या निवडलेल्या योजनेसाठी जुळणी:' : 'Matched for Your Selected Scheme:'}</strong>{' '}
                {language === 'hi' ? (
                  <>अधिकृत चैनल पार्टनर्स प्रदर्शित किए जा रहे हैं जो <strong>{categoryFilter}</strong> सहायता की प्रक्रिया करते हैं{stateFilter ? ` (${stateFilter} में)` : ''}।</>
                ) : language === 'mr' ? (
                  <>अधिकृत चॅनेल भागीदार दाखवत आहे जे <strong>{categoryFilter}</strong> सहाय्याची प्रक्रिया करतात{stateFilter ? ` (${stateFilter} मध्ये)` : ''}.</>
                ) : (
                  <>Showing authorized Channel Partners that process <strong>{categoryFilter}</strong> assistance{stateFilter ? ` in ${stateFilter}` : ''}.</>
                )}
              </div>
            </div>
          )}

          {/* Smart Beneficiary Profile Geo-Filter Banner */}
          {hasProfile && profile.personal?.state && (
            <div
              className="alert alert-info animate-fade-in"
              style={{
                marginBottom: 'var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                background: 'rgba(124, 58, 237, 0.08)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Sparkles size={18} color="#7c3aed" />
                <div>
                  <strong>{language === 'hi' ? 'लाभार्थी स्थान उपलब्ध:' : language === 'mr' ? 'लाभार्थी स्थान उपलब्ध:' : 'Beneficiary Location Available:'}</strong> {profile.personal.district ? `${profile.personal.district}, ` : ''}{profile.personal.state}
                  <span style={{ fontSize: 'var(--text-xs)', marginLeft: '6px', color: 'var(--color-gray-600)' }}>
                    ({language === 'hi' ? 'प्रोफ़ाइल' : language === 'mr' ? 'प्रोफाइल' : 'Profile'}: {profile.personal.firstName} {profile.personal.surname})
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={applyProfileLocationFilter}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  padding: '5px 12px',
                }}
              >
                {profileLocationApplied
                  ? (language === 'hi' ? '✓ प्रोफ़ाइल फ़िल्टर सक्रिय' : language === 'mr' ? '✓ प्रोफाइल फिल्टर सक्रिय' : '✓ Profile Filter Active')
                  : (language === 'hi' ? 'प्रोफ़ाइल स्थान द्वारा फ़िल्टर करें' : language === 'mr' ? 'प्रोफाइल स्थानानुसार फिल्टर करा' : 'Filter by Profile Location')}
              </button>
            </div>
          )}

          {/* Institutional / Demo Disclaimer Alert */}
          <div className="alert alert-warning partners-notice animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{language === 'hi' ? 'संस्थागत सत्यापन सूचना:' : language === 'mr' ? 'संस्थात्मक पडताळणी सूचना:' : 'Institutional Verification Notice:'}</strong> {t('partners.sampleNotice')}
            </div>
          </div>

          {/* Success Banner when Partner Saved to Draft */}
          {savedSuccessApp && (
            <div className="alert alert-success animate-fade-in" style={{ marginBottom: 'var(--space-6)' }}>
              <CheckCircle2 size={20} color="#0d9488" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong>{t('partners.savedSuccess')}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-sm)' }}>
                  {language === 'hi' ? (
                    <>डेमो आवेदन <strong>#{savedSuccessApp.refNumber}</strong> में <strong>{savedSuccessApp.assignedPartner?.name}</strong> को सौंपा गया। आप अपने आवेदन पोर्टल में तैयारी आवश्यकताओं को देख सकते हैं।</>
                  ) : language === 'mr' ? (
                    <>डेमो अर्ज <strong>#{savedSuccessApp.refNumber}</strong> साठी <strong>{savedSuccessApp.assignedPartner?.name}</strong> नियुक्त केले. आपण आपल्या अर्ज पोर्टलमध्ये तयारीच्या आवश्यकता पाहू शकता.</>
                  ) : (
                    <>Assigned <strong>{savedSuccessApp.assignedPartner?.name}</strong> to demo application <strong>#{savedSuccessApp.refNumber}</strong>. You can view preparation requirements and track updates in your application portal.</>
                  )}
                </p>
              </div>
              <Link to="/tracker" className="btn btn-primary btn-sm" style={{ alignSelf: 'center' }}>
                {t('partners.goToTracker')}
              </Link>
            </div>
          )}

          {/* Search, GPS & Filter Controls */}
          <div className="partners-controls animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="partners-controls-row">
              {/* Search Bar */}
              <div className="partners-search">
                <Search size={18} className="partners-search-icon" />
                <input
                  type="text"
                  className="form-input partners-search-input"
                  placeholder={t('partners.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="partner-search"
                />
                {searchQuery && (
                  <button
                    className="partners-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* GPS Near Me Button (Explicit User Permission Flow) */}
              <button
                className={`btn ${userLocation ? 'btn-primary' : 'btn-outline'} gps-trigger-btn`}
                onClick={handleRequestLocationClick}
                disabled={locating}
                title="Find partners near your current location"
              >
                <Navigation size={16} className={locating ? 'spin-icon' : ''} />
                <span>
                  {locating
                    ? (language === 'hi' ? 'स्थान खोजा जा रहा है...' : language === 'mr' ? 'स्थान शोधत आहे...' : 'Locating...')
                    : userLocation
                    ? t('partners.clearGps')
                    : t('partners.useCurrentLocation')}
                </span>
              </button>

              {/* Mobile Filter Toggle */}
              <button
                className={`btn btn-secondary hide-desktop ${showFilters ? 'btn-active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                {language === 'hi' ? 'फ़िल्टर' : language === 'mr' ? 'फिल्टर्स' : 'Filters'}
              </button>
            </div>

            {/* GPS Feedback Status Messages */}
            {locationStatus === 'denied' && (
              <div className="gps-status-banner gps-status-denied animate-fade-in">
                <AlertTriangle size={15} />
                <span>{t('partners.gpsDenied')}</span>
              </div>
            )}
            {locationStatus === 'error' && (
              <div className="gps-status-banner gps-status-error animate-fade-in">
                <AlertTriangle size={15} />
                <span>{t('partners.gpsError')}</span>
              </div>
            )}
            {locationStatus === 'granted' && userLocation && (
              <div className="gps-status-banner gps-status-success animate-fade-in">
                <CheckCircle2 size={15} />
                <span>{t('partners.gpsGranted')}</span>
              </div>
            )}

            {/* Dropdown Filters */}
            <div className={`partners-filters ${showFilters ? 'partners-filters-visible' : ''}`}>
              {/* State Filter */}
              <select
                className="form-input form-select partners-filter-select"
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setDistrictFilter('');
                }}
                aria-label={t('partners.state')}
              >
                <option value="">{t('partners.allStates')}</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* District Filter */}
              <select
                className="form-input form-select partners-filter-select"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                disabled={!stateFilter}
                aria-label={t('partners.district')}
              >
                <option value="">{t('partners.allDistricts')}</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Partner Type Filter */}
              <select
                className="form-input form-select partners-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label={t('partners.partnerType')}
              >
                <option value="">{t('partners.allTypes')}</option>
                <option value="SCA">{language === 'hi' ? 'राज्य चैनलाइजिंग एजेंसियां (SCAs)' : language === 'mr' ? 'राज्य चॅनेलायझिंग एजन्सी (SCAs)' : 'State Channelizing Agencies (SCAs)'}</option>
                <option value="PSB">{language === 'hi' ? 'सार्वजनिक क्षेत्र के बैंक (PSBs)' : language === 'mr' ? 'सार्वजनिक क्षेत्रातील बँका (PSBs)' : 'Public Sector Banks (PSBs)'}</option>
                <option value="RRB">{language === 'hi' ? 'क्षेत्रीय ग्रामीण बैंक (RRBs)' : language === 'mr' ? 'प्रादेशिक ग्रामीण बँका (RRBs)' : 'Regional Rural Banks (RRBs)'}</option>
                <option value="MFI">{language === 'hi' ? 'एनबीएफसी-एमएफआई / एसएचजी फेडरेशन' : language === 'mr' ? 'NBFC-MFIs / बचत गट महासंघ' : 'NBFC-MFIs / SHG Federations'}</option>
              </select>

              {/* Loan Category Filter */}
              <select
                className="form-input form-select partners-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label={t('partners.category')}
              >
                <option value="">{t('partners.allCategories')}</option>
                <option value="micro-finance">{language === 'hi' ? 'सूक्ष्म वित्त योजना' : language === 'mr' ? 'मायक्रो फायनान्स योजना' : 'Micro Finance Scheme'}</option>
                <option value="term-loan">{language === 'hi' ? 'टर्म लोन योजना' : language === 'mr' ? 'मुदत कर्ज योजना' : 'Term Loan Scheme'}</option>
                <option value="education-loan">{language === 'hi' ? 'शैक्षिक ऋण योजना' : language === 'mr' ? 'शैक्षणिक कर्ज योजना' : 'Educational Loan Scheme'}</option>
                <option value="sanitation">{language === 'hi' ? 'स्वच्छता / हरित ऋण' : language === 'mr' ? 'स्वच्छता / हरित कर्ज' : 'Sanitation / Green Credit'}</option>
              </select>

              {hasActiveFilters && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                  <X size={14} />
                  {t('partners.clearFilters')}
                </button>
              )}
            </div>
          </div>

          {/* Results Counter & Sorting Label */}
          <div className="partners-meta-bar">
            <span>
              {language === 'hi' ? (
                <>आपके मानदंडों से मेल खाने वाली <strong>{rankedPartners.length}</strong> अधिकृत एजेंसियां दिखाई जा रही हैं</>
              ) : language === 'mr' ? (
                <>आपल्या निकषांशी जुळणाऱ्या <strong>{rankedPartners.length}</strong> अधिकृत एजन्सी दाखवत आहे</>
              ) : (
                <>Showing <strong>{rankedPartners.length}</strong> authorized agencies matching your criteria</>
              )}
            </span>
            {userLocation && (
              <span className="badge badge-teal">
                <Navigation size={12} /> {language === 'hi' ? 'जीपीएस निकटता + संस्थागत शासनादेश द्वारा रैंक किया गया' : language === 'mr' ? 'जीपीएस समीपता + संस्थात्मक आदेशानुसार क्रमवारी' : 'Ranked by GPS Proximity + Institutional Mandate'}
              </span>
            )}
          </div>

          {/* Main Geo-Spatial Split View: Map + Ranked List */}
          <div className="partners-split-layout">
            {/* Interactive Leaflet OpenStreetMap */}
            <div className="partners-map-container">
              <div className="map-view-card">
                <div className="map-view-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="var(--color-teal-600)" />
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-navy-900)' }}>
                      {t('partners.mapViewTitle')}
                    </span>
                  </div>
                  <div className="map-legend">
                    <span className="legend-item"><span className="legend-dot dot-sca"></span> SCA</span>
                    <span className="legend-item"><span className="legend-dot dot-psb"></span> PSB</span>
                    <span className="legend-item"><span className="legend-dot dot-rrb"></span> RRB</span>
                    <span className="legend-item"><span className="legend-dot dot-mfi"></span> MFI</span>
                  </div>
                </div>

                <PartnerMap
                  partners={rankedPartners}
                  selectedPartner={selectedPartner}
                  onSelectPartner={(partner) => setSelectedPartner(partner)}
                  userLocation={userLocation}
                  onLocateUser={handleRequestLocationClick}
                  locating={locating}
                  centerCoordinates={mapCenter}
                />
              </div>
            </div>

            {/* Synchronized Ranked Partner Cards List */}
            <div className="partners-list-container">
              {rankedPartners.length > 0 ? (
                <div className="partners-cards-list">
                  {rankedPartners.map((partner) => {
                    const isSelected = selectedPartner?.id === partner.id;
                    const typeLabel = PARTNER_TYPE_LABELS[partner.type] || {};

                    return (
                      <article
                        key={partner.id}
                        className={`partner-card card ${isSelected ? 'partner-card-selected' : ''}`}
                        onClick={() => setSelectedPartner(partner)}
                      >
                        {/* Card Header */}
                        <div className="partner-card-header">
                          <div
                            className="partner-card-icon"
                            style={{ background: typeLabel.colorBg || '#f1f5f9', color: typeLabel.color || '#0d9488' }}
                          >
                            <Building2 size={22} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 className="partner-name">
                              {language === 'hi' && partner.nameHi
                                ? partner.nameHi
                                : language === 'mr' && partner.nameMr
                                ? partner.nameMr
                                : partner.name}
                            </h3>
                            <div className="partner-badges-row">
                              <span
                                className="badge"
                                style={{
                                  background: typeLabel.colorBg,
                                  color: typeLabel.color,
                                  borderColor: typeLabel.color,
                                  fontWeight: 700,
                                }}
                              >
                                {partner.type} • {PARTNER_TYPES[partner.type] || partner.type}
                              </span>

                              {partner.distanceKm !== null && (
                                <span className="badge badge-teal distance-badge">
                                  <Navigation size={11} />
                                  ~{partner.distanceKm} {language === 'hi' ? 'किमी दूर' : language === 'mr' ? 'किमी अंतरावर' : 'km away'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Verification & Sample Status Badge */}
                          <div className="partner-status-tag">
                            {partner.isSample ? (
                              <span className="badge badge-warning" title="Sample Demo Record">
                                {t('partners.demoDataNotice')}
                              </span>
                            ) : (
                              <span className="badge badge-success" title="Verified Institutional Agency">
                                <ShieldCheck size={12} />
                                {t('partners.verifiedAgency')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Operational Availability & Funding Verification Badges */}
                        <div className="partner-metrics-row">
                          <span
                            className={`availability-pill ${
                              partner.availabilityStatus === 'active'
                                ? 'avail-active'
                                : partner.availabilityStatus === 'limited-capacity'
                                ? 'avail-limited'
                                : 'avail-inactive'
                            }`}
                          >
                            <span className="avail-indicator"></span>
                            {partner.availabilityStatus === 'active'
                              ? t('partners.activeIntake')
                              : partner.availabilityStatus === 'limited-capacity'
                              ? t('partners.limitedCapacity')
                              : t('partners.temporarilyUnavailable')}
                          </span>

                          {/* Clear statement: No unverified funding fabricated */}
                          <span className="funding-status-pill">
                            <Info size={12} />
                            {partner.fundingCapacity || t('partners.fundingNotVerified')}
                          </span>
                        </div>

                        {/* Supported Scheme Categories */}
                        <div className="partner-categories">
                          <span className="partner-field-label">{t('partners.supportedSchemes')}:</span>
                          <div className="partner-category-tags">
                            {partner.categories.map((cat) => (
                              <span key={cat} className="badge badge-navy">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Ranking Match Reasons */}
                        {partner.rankingReasons && partner.rankingReasons.length > 0 && (
                          <div className="partner-reasons-box">
                            <span className="reasons-box-title">
                              <Sparkles size={13} color="var(--color-teal-600)" />
                              {t('partners.matchingReasonsTitle')}
                            </span>
                            <ul className="reasons-box-list">
                              {partner.rankingReasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Contact & Location Details */}
                        <div className="partner-details">
                          <div className="partner-detail">
                            <MapPin size={14} className="partner-detail-icon" />
                            <span>{partner.address}</span>
                          </div>
                          {partner.phone && (
                            <div className="partner-detail">
                              <Phone size={14} className="partner-detail-icon" />
                              <a href={`tel:${partner.phone}`}>{partner.phone}</a>
                              {partner.nodalOfficer && (
                                <span className="officer-note">({partner.nodalOfficer})</span>
                              )}
                            </div>
                          )}
                          {partner.email && (
                            <div className="partner-detail">
                              <Mail size={14} className="partner-detail-icon" />
                              <a href={`mailto:${partner.email}`}>{partner.email}</a>
                            </div>
                          )}
                          {partner.officeHours && (
                            <div className="partner-detail">
                              <Clock size={14} className="partner-detail-icon" />
                              <span>{partner.officeHours}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="partner-card-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmSelectPartner(partner);
                            }}
                          >
                            <FileCheck size={14} />
                            {t('partners.selectPartner')}
                          </button>

                          <button
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChecklist(partner);
                            }}
                          >
                            {t('partners.viewChecklist')}
                          </button>

                          <a
                            href={partner.navigationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => e.stopPropagation()}
                            title="Open directions in OpenStreetMap"
                          >
                            <ExternalLink size={14} />
                            {language === 'hi' ? 'दिशा-निर्देश' : language === 'mr' ? 'दिशानिर्देश' : 'Directions'}
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state animate-fade-in card">
                  <Search size={48} color="var(--color-gray-400)" />
                  <h3>{t('partners.noResults')}</h3>
                  <p style={{ color: 'var(--color-gray-600)', maxWidth: '400px' }}>
                    Try expanding your search to all districts, or clear the category filter to see
                    all available agencies in your state.
                  </p>
                  <button className="btn btn-outline" onClick={clearFilters}>
                    {t('partners.clearFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- EXPLICIT USER PERMISSION MODAL FOR LOCATION --- */}
      {showLocationPrompt && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowLocationPrompt(false)}>
          <div className="modal-dialog location-permission-modal" onClick={(e) => e.stopPropagation()}>
            <div className="permission-modal-header">
              <div className="permission-modal-icon">
                <Navigation size={28} />
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                {language === 'hi' ? 'निकटतम भागीदार खोज सक्षम करें' : language === 'mr' ? 'जवळचे भागीदार शोध सक्षम करा' : 'Enable Nearest Partner Discovery'}
              </h3>
            </div>
            <div className="permission-modal-body">
              <p style={{ color: 'var(--color-gray-700)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                {t('partners.gpsPrompt')}
              </p>
              <div className="permission-guarantee">
                <Shield size={16} color="#0d9488" />
                <span>
                  <strong>{language === 'hi' ? 'गोपनीयता वादा:' : language === 'mr' ? 'गोपनीयता वचन:' : 'Privacy Promise:'}</strong> {language === 'hi' ? 'किसी भी सर्वर पर कोई स्थान इतिहास दर्ज नहीं किया जाता है। आप किसी भी समय एक क्लिक से अपना स्थान साफ़ कर सकते हैं।' : language === 'mr' ? 'कोणत्याही सर्व्हरवर स्थान इतिहास रेकॉर्ड केला जात नाही. आपण एका क्लिकवर कधीही आपले स्थान साफ करू शकता.' : 'No location history is recorded on any server. You can clear your location anytime with one click.'}
                </span>
              </div>
            </div>
            <div className="permission-modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowLocationPrompt(false);
                  setLocationStatus('denied');
                }}
              >
                {language === 'hi' ? 'नहीं, मैं मैन्युअल रूप से खोजूँगा' : language === 'mr' ? 'नाही, मी व्यक्तिचलितपणे शोधेन' : 'No, I’ll Search Manually'}
              </button>
              <button className="btn btn-primary" onClick={confirmLocationPermission}>
                {language === 'hi' ? 'स्थान पहुंच की अनुमति दें' : language === 'mr' ? 'स्थान प्रवेशास अनुमती द्या' : 'Allow Location Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DOCUMENT PREPARATION CHECKLIST MODAL --- */}
      {checklistModalPartner && (
        <div className="modal-overlay animate-fade-in" onClick={() => setChecklistModalPartner(null)}>
          <div className="modal-dialog checklist-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checklist-modal-header">
              <div>
                <span className="badge badge-teal" style={{ marginBottom: '4px' }}>
                  {checklistModalPartner.type} {language === 'hi' ? 'कार्यालय चेकलिस्ट' : language === 'mr' ? 'कार्यालय चेकलिस्ट' : 'Office Checklist'}
                </span>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-navy-900)', margin: 0 }}>
                  {language === 'hi' && checklistModalPartner.nameHi ? checklistModalPartner.nameHi : language === 'mr' && checklistModalPartner.nameMr ? checklistModalPartner.nameMr : checklistModalPartner.name}
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', margin: '4px 0 0 0' }}>
                  {checklistModalPartner.address}
                </p>
              </div>
              <button
                className="btn btn-icon btn-ghost"
                onClick={() => setChecklistModalPartner(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="checklist-modal-body">
              <div className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>
                <FileCheck size={18} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-xs)' }}>
                  {t('partners.checklistSubtitle')}
                </span>
              </div>

              {/* Checklist Items */}
              <div className="partner-doc-items">
                {generatePartnerChecklist(checklistModalPartner, categoryFilter || 'micro-finance').map(
                  (item) => {
                    const isChecked = Boolean(checklistState[item.id]);

                    return (
                      <div
                        key={item.id}
                        className={`doc-check-item ${isChecked ? 'doc-check-completed' : ''}`}
                        onClick={() => toggleChecklistItem(item.id)}
                      >
                        <div className={`doc-check-box ${isChecked ? 'doc-check-box-checked' : ''}`}>
                          {isChecked && <Check size={14} color="#ffffff" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-900)' }}>
                              {language === 'hi' && item.titleHi
                                ? item.titleHi
                                : language === 'mr' && item.titleMr
                                ? item.titleMr
                                : item.title}
                            </strong>
                            {item.mandatory && (
                              <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                                {language === 'hi' ? 'अनिवार्य' : language === 'mr' ? 'आवश्यक' : 'Required'}
                              </span>
                            )}
                          </div>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-teal-700)', marginTop: '2px' }}>
                            {language === 'hi' ? 'जारीकर्ता प्राधिकरण:' : language === 'mr' ? 'जारी करणारे प्राधिकरण:' : 'Issuing Authority:'} {item.authority}
                          </span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-gray-600)' }}>
                            {language === 'hi' && item.tipHi ? item.tipHi : language === 'mr' && item.tipMr ? item.tipMr : item.tip}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="checklist-modal-footer">
              <a
                href={checklistModalPartner.navigationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <Navigation size={15} />
                {language === 'hi' ? 'दिशा-निर्देश प्राप्त करें' : language === 'mr' ? 'दिशानिर्देश मिळवा' : 'Get Directions'}
              </a>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const p = checklistModalPartner;
                  setChecklistModalPartner(null);
                  setConfirmSelectPartner(p);
                }}
              >
                <FileCheck size={15} />
                {t('partners.selectPartner')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL TO SAVE PARTNER TO DRAFT --- */}
      {confirmSelectPartner && (
        <div className="modal-overlay animate-fade-in" onClick={() => setConfirmSelectPartner(null)}>
          <div className="modal-dialog confirm-partner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">
                <Building2 size={26} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                  {t('partners.confirmSelectionTitle')}
                </h3>
                <span className="badge badge-navy" style={{ marginTop: '4px' }}>
                  {language === 'hi' && confirmSelectPartner.nameHi ? confirmSelectPartner.nameHi : language === 'mr' && confirmSelectPartner.nameMr ? confirmSelectPartner.nameMr : confirmSelectPartner.name}
                </span>
              </div>
            </div>

            <div className="confirm-modal-body">
              <p style={{ color: 'var(--color-gray-700)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                {t('partners.confirmSelectionMsg')}
              </p>

              <div className="selected-partner-summary-box">
                <div className="summary-field">
                  <span className="summary-label">{language === 'hi' ? 'एजेंसी का प्रकार:' : language === 'mr' ? 'एजन्सी प्रकार:' : 'Agency Type:'}</span>
                  <span className="summary-val">{confirmSelectPartner.type}</span>
                </div>
                <div className="summary-field">
                  <span className="summary-label">{language === 'hi' ? 'स्थान:' : language === 'mr' ? 'स्थान:' : 'Location:'}</span>
                  <span className="summary-val">
                    {confirmSelectPartner.district}, {confirmSelectPartner.state}
                  </span>
                </div>
                <div className="summary-field">
                  <span className="summary-label">{language === 'hi' ? 'हेल्पलाइन:' : language === 'mr' ? 'हेल्पलाइन:' : 'Helpline:'}</span>
                  <span className="summary-val">{confirmSelectPartner.phone || (language === 'hi' ? 'निर्देशिका में उपलब्ध' : language === 'mr' ? 'निर्देशिकेत उपलब्ध' : 'Available in directory')}</span>
                </div>
              </div>

              <div className="alert alert-warning" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>
                  <strong>{language === 'hi' ? 'प्रोटोटाइप नोट:' : language === 'mr' ? 'प्रोटोटाइप टीप:' : 'Prototype Note:'}</strong> {language === 'hi' ? 'इंटरनेट पर कोई डेटा सबमिट नहीं किया जाता है। यह आपके ब्राउज़र स्टोरेज में आपके ड्राफ्ट आवेदन को अपडेट करता है।' : language === 'mr' ? 'इंटरनेटवर कोणताही डेटा सबमिट केला जात नाही. हे आपल्या ब्राउझर स्टोरेजमध्ये आपल्या मसुदा अर्जास अद्यतनित करते.' : 'No data is submitted over the internet. This updates your draft application in your browser storage so you have complete reference notes for your physical visit.'}
                </span>
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmSelectPartner(null)}>
                {language === 'hi' ? 'रद्द करें' : language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleConfirmSavePartner(confirmSelectPartner)}
              >
                {t('partners.saveDraftConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
