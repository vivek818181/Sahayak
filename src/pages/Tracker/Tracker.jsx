// pages/Tracker/Tracker.jsx — Demo Application Tracker & State Workflow
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProfile } from '../../context/ProfileContext';
import {
  getApplications,
  updateApplication,
  transitionApplicationStatus,
  deleteApplication,
  getWorkflowDisclaimer,
} from '../../services/applicationService';
import { getStatusColor, getStatusLabel } from '../../data/applications';
import { formatINR } from '../../services/calculatorService';
import {
  FileText,
  Clock,
  ChevronRight,
  Trash2,
  Edit3,
  AlertTriangle,
  ClipboardCheck,
  Inbox,
  CheckCircle2,
  X,
  Send,
  ArrowRight,
  Info,
  Check,
  Building2,
  MapPin,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import './Tracker.css';

export default function Tracker() {
  const { t, language } = useLanguage();
  const { profile, hasProfile, openProfileModal } = useProfile();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [expandedApp, setExpandedApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Reload applications from service
  const refreshApps = () => {
    setApplications(getApplications());
  };

  useEffect(() => {
    refreshApps();
  }, []);

  const toggleExpand = (id) => {
    setExpandedApp(expandedApp === id ? null : id);
  };

  const handleDelete = (id) => {
    deleteApplication(id);
    refreshApps();
    if (expandedApp === id) setExpandedApp(null);
  };

  const handleAdvanceStatus = (id, nextStatus) => {
    transitionApplicationStatus(id, nextStatus);
    refreshApps();
  };

  // Open Edit Modal
  const openEdit = (app) => {
    setEditingApp(app);
    setEditForm({
      applicantName: app.applicantName || '',
      phone: app.phone || '',
      amount: app.amount || '',
      purpose: app.purpose || '',
      state: app.state || '',
      district: app.district || '',
    });
  };

  const saveEdit = () => {
    if (!editingApp) return;
    updateApplication(editingApp.id, {
      applicantName: editForm.applicantName,
      phone: editForm.phone,
      amount: Number(editForm.amount),
      purpose: editForm.purpose,
      state: editForm.state,
      district: editForm.district,
    });
    setEditingApp(null);
    refreshApps();
  };

  const drafts = applications.filter((a) => a.status === 'draft');
  const activeApps = applications.filter((a) => a.status !== 'draft');

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container tracker-container">
          {/* Header */}
          <div className="tracker-header animate-fade-in-up">
            <h1 className="section-title">{t('tracker.title')}</h1>
            <p className="section-subtitle">{t('tracker.subtitle')}</p>
          </div>

          {/* Official Demo Disclaimer Notice */}
          <div className="alert alert-warning tracker-notice animate-fade-in-up">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: 'var(--text-xs)', lineHeight: '1.5' }}>
              <strong>{language === 'hi' ? 'SEVATHON 2026 छात्र प्रदर्शन:' : language === 'mr' ? 'SEVATHON 2026 विद्यार्थी प्रात्यक्षिक:' : 'SEVATHON 2026 Student Demonstration:'}</strong> {getWorkflowDisclaimer()}
            </div>
          </div>

          {/* Smart Beneficiary Profile Reference Card */}
          {hasProfile && (
            <div
              className="card animate-fade-in-up"
              style={{
                marginBottom: 'var(--space-6)',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(79, 70, 229, 0.05))',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    {profile.personal?.firstName?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                        {profile.personal?.firstName} {profile.personal?.surname}
                      </h3>
                      <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                        {language === 'hi' ? 'लाभार्थी प्रोफ़ाइल संलग्न' : language === 'mr' ? 'लाभार्थी प्रोफाइल जोडली' : 'Beneficiary Profile Linked'}
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', marginTop: '2px' }}>
                      {language === 'hi' ? 'प्रोफ़ाइल संदर्भ:' : language === 'mr' ? 'प्रोफाइल संदर्भ:' : 'Profile Ref:'} <strong>{profile.profileId}</strong> • {language === 'hi' ? 'जाति: SC (प्रमाणपत्र:' : language === 'mr' ? 'जात: SC (प्रमाणपत्र:' : 'Caste: SC (Certificate:'} {profile.eligibility?.casteCertificate}) • {language === 'hi' ? 'स्थान:' : language === 'mr' ? 'स्थान:' : 'Location:'} {profile.personal?.district ? `${profile.personal.district}, ` : ''}{profile.personal?.state}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={openProfileModal}
                    style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} />
                    {language === 'hi' ? 'प्रोफ़ाइल देखें / संपादित करें' : language === 'mr' ? 'प्रोफाइल पहा / संपादित करा' : 'View / Edit Profile'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: Saved Draft Applications */}
          {drafts.length > 0 && (
            <div className="tracker-section animate-fade-in-up">
              <h2 className="tracker-section-title">
                <Edit3 size={18} />
                {t('tracker.drafts')} ({drafts.length})
              </h2>

              <div className="tracker-drafts">
                {drafts.map((draft) => (
                  <div key={draft.id} className="card tracker-draft-card animate-fade-in">
                    <div className="tracker-draft-header">
                      <div className="tracker-draft-info">
                        <FileText size={20} color="var(--color-navy-600)" />
                        <div>
                          <span className="tracker-draft-scheme">
                            {language === 'hi'
                              ? draft.schemeCategoryHi || draft.schemeCategory
                              : language === 'mr'
                              ? draft.schemeCategoryMr || draft.schemeCategoryHi || draft.schemeCategory
                              : draft.schemeCategory}
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginLeft: 'var(--space-2)' }}>
                            • Ref: {draft.refNumber}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span className="badge badge-navy">
                          {formatINR(draft.amount)}
                        </span>
                        <span className="badge badge-warning">
                          {t('tracker.draft')}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Partner if any */}
                    {draft.assignedPartner ? (
                      <div className="tracker-assigned-partner-box" style={{ marginTop: 'var(--space-2)', padding: '8px 12px', background: '#f0fdfa', borderRadius: 'var(--radius-lg)', border: '1px solid #ccfbf1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={16} color="#0d9488" />
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#134e4a' }}>
                            {language === 'hi' ? 'आवंटित पार्टनर:' : language === 'mr' ? 'नियुक्त भागीदार:' : 'Assigned Partner:'}{' '}
                            {(language === 'hi' && draft.assignedPartner.nameHi)
                              ? draft.assignedPartner.nameHi
                              : (language === 'mr' && draft.assignedPartner.nameMr)
                              ? draft.assignedPartner.nameMr
                              : draft.assignedPartner.name} ({draft.assignedPartner.type})
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {draft.assignedPartner.directionsUrl && (
                            <a
                              href={draft.assignedPartner.directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost"
                              style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <ExternalLink size={12} /> {language === 'hi' ? 'दिशानिर्देश' : language === 'mr' ? 'दिशा-निर्देश' : 'Directions'}
                            </a>
                          )}
                          <button
                            className="btn btn-outline"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={() => navigate(`/partners?scheme=${draft.schemeId}&state=${draft.state}&district=${draft.district}`)}
                          >
                            {language === 'hi' ? 'पार्टनर बदलें' : language === 'mr' ? 'भागीदार बदला' : 'Change Partner'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                          {language === 'hi' ? 'अभी तक कोई चैनल पार्टनर आवंटित नहीं हुआ है।' : language === 'mr' ? 'अद्याप कोणताही चॅनेल भागीदार नियुक्त केलेला नाही.' : 'No Channel Partner assigned yet.'}
                        </span>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--color-teal-700)', fontWeight: 600 }}
                          onClick={() => navigate(`/partners?scheme=${draft.schemeId}&state=${draft.state}&district=${draft.district}`)}
                        >
                          {language === 'hi' ? 'पार्टनर व दिशानिर्देश खोजें →' : language === 'mr' ? 'भागीदार व दिशा-निर्देश शोधा →' : 'Find Partner & Directions →'}
                        </button>
                      </div>
                    )}

                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
                        {language === 'hi' ? draft.nextStepsHi || draft.nextSteps : draft.nextSteps}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                          onClick={() => openEdit(draft)}
                        >
                          <Edit3 size={14} />
                          {t('common.edit')}
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                          onClick={() => handleAdvanceStatus(draft.id, 'submitted')}
                        >
                          <Send size={14} />
                          {t('tracker.submitToPartner')}
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', color: '#dc2626' }}
                          onClick={() => handleDelete(draft.id)}
                          title="Delete draft"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Active / Submitted Demo Applications */}
          <div className="tracker-section animate-fade-in-up">
            <h2 className="tracker-section-title">
              <ClipboardCheck size={18} />
              {t('tracker.myApplications')} ({activeApps.length})
            </h2>

            {activeApps.length > 0 ? (
              <div className="tracker-apps">
                {activeApps.map((app) => {
                  const isExpanded = expandedApp === app.id;
                  return (
                    <article key={app.id} className="card tracker-app-card">
                      <div
                        className="tracker-app-header"
                        onClick={() => toggleExpand(app.id)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                      >
                        <div className="tracker-app-main">
                          <div className="tracker-app-ref">
                            <span className="tracker-app-id">{app.refNumber}</span>
                            <span className={`badge ${getStatusColor(app.status)}`}>
                              {getStatusLabel(app.status, t)}
                            </span>
                          </div>
                          <span className="tracker-app-scheme">
                            {language === 'hi'
                              ? app.schemeCategoryHi || app.schemeCategory
                              : language === 'mr'
                              ? app.schemeCategoryMr || app.schemeCategoryHi || app.schemeCategory
                              : app.schemeCategory}
                          </span>
                        </div>

                        <div className="tracker-app-meta">
                          <span className="tracker-app-amount">{formatINR(app.amount)}</span>
                          <span className="tracker-app-date">{app.submittedOn || app.createdOn}</span>
                          <ChevronRight
                            size={18}
                            className={`tracker-app-chevron ${isExpanded ? 'tracker-app-chevron-open' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Expandable Details Pane */}
                      {isExpanded && (
                        <div className="tracker-app-details animate-fade-in">
                          <div className="tracker-detail-row">
                            <span className="tracker-detail-label">
                              {language === 'hi' ? 'आवेदक का नाम:' : language === 'mr' ? 'अर्जदाराचे नाव:' : 'Applicant Name:'}
                            </span>
                            <span className="tracker-detail-value">{app.applicantName || (language === 'hi' ? 'पंजीकृत आवेदक' : language === 'mr' ? 'नोंदणीकृत अर्जदार' : 'Registered Applicant')}</span>
                          </div>

                          {app.phone && (
                            <div className="tracker-detail-row">
                              <span className="tracker-detail-label">
                                {language === 'hi' ? 'संपर्क फ़ोन:' : language === 'mr' ? 'संपर्क फोन:' : 'Contact Phone:'}
                              </span>
                              <span className="tracker-detail-value">{app.phone}</span>
                            </div>
                          )}

                          <div className="tracker-detail-row">
                            <span className="tracker-detail-label">
                              {language === 'hi' ? 'अगली कार्रवाई:' : language === 'mr' ? 'पुढील कृती:' : 'Next Action:'}
                            </span>
                            <span className="tracker-detail-value" style={{ fontWeight: 600, color: 'var(--color-navy-800)' }}>
                              {language === 'hi' ? app.nextStepsHi || app.nextSteps : language === 'mr' ? app.nextStepsMr || app.nextStepsHi || app.nextSteps : app.nextSteps}
                            </span>
                          </div>

                          {/* Assigned Channel Partner */}
                          {app.assignedPartner && (
                            <div style={{ marginTop: 'var(--space-3)', padding: '12px', background: '#f0fdfa', borderRadius: 'var(--radius-xl)', border: '1.5px solid #ccfbf1' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: '#134e4a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {language === 'hi' ? 'आवंटित चैनल पार्टनर' : language === 'mr' ? 'नियुक्त चॅनेल भागीदार' : 'Assigned Channel Partner'} ({app.assignedPartner.type})
                                </span>
                                {app.assignedPartner.isSample ? (
                                  <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                                    {language === 'hi' ? 'डेमो रिकॉर्ड' : language === 'mr' ? 'डेमो नोंद' : 'Demo Record'}
                                  </span>
                                ) : (
                                  <span className="badge badge-success" style={{ fontSize: '10px' }}>
                                    {language === 'hi' ? 'सत्यापित संस्था' : language === 'mr' ? 'प्रमाणित संस्था' : 'Verified Agency'}
                                  </span>
                                )}
                              </div>
                              <h4 style={{ margin: '0 0 4px 0', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                                {(language === 'hi' && app.assignedPartner.nameHi)
                                  ? app.assignedPartner.nameHi
                                  : (language === 'mr' && app.assignedPartner.nameMr)
                                  ? app.assignedPartner.nameMr
                                  : app.assignedPartner.name}
                              </h4>
                              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
                                {app.assignedPartner.address}
                              </p>
                              {app.assignedPartner.contactPhone && (
                                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-teal-700)', fontWeight: 600 }}>
                                  {language === 'hi' ? 'हेल्पलाइन:' : language === 'mr' ? 'हेल्पलाइन:' : 'Helpline:'} {app.assignedPartner.contactPhone}
                                </p>
                              )}
                              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                {app.assignedPartner.directionsUrl && (
                                  <a
                                    href={app.assignedPartner.directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline"
                                    style={{ padding: '4px 10px', fontSize: '11px' }}
                                  >
                                    <ExternalLink size={12} /> {language === 'hi' ? 'OpenStreetMap में देखें' : language === 'mr' ? 'OpenStreetMap वर उघडा' : 'Open in OpenStreetMap'}
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Timeline */}
                          {app.timeline && app.timeline.length > 0 && (
                            <div style={{ marginTop: 'var(--space-3)' }}>
                              <span className="tracker-detail-label">
                                {language === 'hi' ? 'डेमो इतिहास:' : language === 'mr' ? 'डेमो इतिहास:' : 'Demo History:'}
                              </span>
                              <div className="timeline-list">
                                {app.timeline.map((entry, idx) => (
                                  <div key={idx} className="timeline-item">
                                    <strong>{entry.status.toUpperCase()}:</strong> {entry.note}
                                    <span style={{ display: 'block', color: 'var(--color-gray-500)', fontSize: '10px' }}>
                                      {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons for active application */}
                          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-outline"
                              style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                              onClick={() => openEdit(app)}
                            >
                              <Edit3 size={14} />
                              {t('tracker.editApplication')}
                            </button>

                            {app.status === 'submitted' && (
                              <button
                                className="btn btn-primary"
                                style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                                onClick={() => handleAdvanceStatus(app.id, 'under-review')}
                              >
                                <Clock size={14} />
                                {t('tracker.progressStatus')} (Under Review)
                              </button>
                            )}

                            <button
                              className="btn btn-ghost"
                              style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', color: '#dc2626' }}
                              onClick={() => handleDelete(app.id)}
                            >
                              <Trash2 size={14} />
                              {t('common.delete')}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state animate-fade-in card">
                <Inbox size={48} />
                <h3>{t('tracker.noApplications')}</h3>
                <p>{t('tracker.noApplicationsDesc')}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/eligibility')}
                  style={{ marginTop: 'var(--space-4)' }}
                >
                  <ArrowRight size={16} />
                  {t('tracker.startApplication')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* EDIT MODAL */}
      {editingApp && (
        <div className="tracker-modal-backdrop" onClick={() => setEditingApp(null)}>
          <div className="tracker-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: 'var(--space-3)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                {t('tracker.editApplication')} — {editingApp.refNumber}
              </h3>
              <button className="btn btn-ghost" onClick={() => setEditingApp(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">{language === 'hi' ? 'आवेदक का पूरा नाम' : language === 'mr' ? 'अर्जदाराचे पूर्ण नाव' : 'Applicant Full Name'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.applicantName}
                  onChange={(e) => setEditForm({ ...editForm, applicantName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'hi' ? 'फ़ोन नंबर' : language === 'mr' ? 'फोन नंबर' : 'Phone Number'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'hi' ? 'अनुरोधित ऋण राशि (₹)' : language === 'mr' ? 'मागितलेली कर्ज रक्कम (₹)' : 'Requested Loan Amount (₹)'}</label>
                <input
                  type="number"
                  className="form-input"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'hi' ? 'ऋण उद्देश्य' : language === 'mr' ? 'कर्ज हेतू' : 'Loan Purpose'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.purpose}
                  onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
              <button className="btn btn-ghost" onClick={() => setEditingApp(null)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={saveEdit}>
                <Check size={16} />
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
