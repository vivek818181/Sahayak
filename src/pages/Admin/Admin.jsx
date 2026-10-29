// pages/Admin/Admin.jsx — Demo Administration & Partner Data Management
import { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  getStoredPartners,
  saveStoredPartners,
  initialPartners,
  states,
  districtsByState,
  PARTNER_TYPES,
  PARTNER_TYPE_LABELS,
} from '../../data/partners';
import { getApplications } from '../../services/applicationService';
import {
  ShieldAlert,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  X,
  Check,
  Building2,
  FileText,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import './Admin.css';

export default function Admin() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('partners'); // 'partners' | 'applications'
  const [partnersList, setPartnersList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [editingPartner, setEditingPartner] = useState(null);
  const [isNewPartner, setIsNewPartner] = useState(false);
  const [form, setForm] = useState({});

  const refreshData = () => {
    setPartnersList(getStoredPartners());
    setApplicationsList(getApplications());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const openAddModal = () => {
    setIsNewPartner(true);
    setEditingPartner(null);
    setForm({
      id: 'partner-' + Date.now(),
      name: '',
      type: 'SCA',
      state: 'Maharashtra',
      district: 'Pune',
      locality: '',
      address: '',
      lat: 18.5204,
      lng: 73.8567,
      phone: '+91-XXXX-XXXXXX',
      email: 'contact@demo-agency.internal',
      website: 'https://example.com',
      categories: ['micro-finance', 'term-loan'],
      serviceArea: 'District Level',
      verificationStatus: 'sample',
      verificationNote: 'Demo data — not verified',
      availabilityStatus: 'active',
      fundingStatus: 'Funding availability not verified',
      isSample: true,
    });
  };

  const openEditModal = (partner) => {
    setIsNewPartner(false);
    setEditingPartner(partner);
    setForm({ ...partner });
  };

  const savePartnerForm = () => {
    if (!form.name || !form.address) return;

    const updated = [...partnersList];
    const timestamp = new Date().toISOString().split('T')[0];
    const payload = {
      ...form,
      lat: Number(form.lat),
      lng: Number(form.lng),
      lastUpdated: timestamp,
    };

    if (isNewPartner) {
      updated.unshift(payload);
    } else {
      const idx = updated.findIndex((p) => p.id === form.id);
      if (idx !== -1) updated[idx] = payload;
    }

    saveStoredPartners(updated);
    setPartnersList(updated);
    setEditingPartner(null);
    setIsNewPartner(false);
  };

  const deletePartner = (id) => {
    const updated = partnersList.filter((p) => p.id !== id);
    saveStoredPartners(updated);
    setPartnersList(updated);
  };

  const resetToDefaults = () => {
    if (window.confirm(t('admin.confirmReset'))) {
      saveStoredPartners(initialPartners);
      setPartnersList(initialPartners);
    }
  };

  const toggleCategory = (cat) => {
    const current = form.categories || [];
    if (current.includes(cat)) {
      setForm({ ...form, categories: current.filter((c) => c !== cat) });
    } else {
      setForm({ ...form, categories: [...current, cat] });
    }
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(partnersList, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'sahayak_partners_registry.json');
    dlAnchor.click();
  };

  return (
    <div className="page-enter">
      <section className="section">
        <div className="container admin-container">
          {/* Header */}
          <div className="admin-header animate-fade-in-up">
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>
                {t('admin.testEnv')}
              </span>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-navy-950)', margin: 'var(--space-1) 0' }}>
                {t('admin.title')}
              </h1>
              <p style={{ color: 'var(--color-gray-600)', maxWidth: '650px', margin: 0 }}>
                {t('admin.subtitle')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-outline" onClick={exportJSON} title={t('admin.exportJson')}>
                <Download size={15} />
                {t('admin.exportJson')}
              </button>
              <button className="btn btn-ghost" onClick={resetToDefaults} title={t('admin.resetDefaults')}>
                <RefreshCw size={15} />
                {t('admin.resetDefaults')}
              </button>
            </div>
          </div>

          {/* Security & Access Disclaimer */}
          <div className="alert alert-warning animate-fade-in-up" style={{ marginBottom: 'var(--space-6)' }}>
            <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: 'var(--text-xs)', lineHeight: '1.5' }}>
              <strong>{t('admin.noticeTitle')}</strong> {t('admin.noticeText')}
            </div>
          </div>

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'partners' ? 'admin-tab-active' : ''}`}
              onClick={() => setActiveTab('partners')}
            >
              <Building2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
              {t('admin.tabsPartners')} ({partnersList.length})
            </button>
            <button
              className={`admin-tab ${activeTab === 'applications' ? 'admin-tab-active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <FileText size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
              {t('admin.tabsApplications')} ({applicationsList.length})
            </button>
          </div>

          {/* TAB 1: PARTNER REGISTRY TABLE */}
          {activeTab === 'partners' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-navy-800)' }}>
                  {t('admin.totalPartners')}: {partnersList.length}
                </span>
                <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                  <Plus size={15} />
                  {t('admin.addPartner')}
                </button>
              </div>

              <div className="admin-table-wrap animate-fade-in">
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('admin.colAgency')}</th>
                        <th>{t('admin.colType')}</th>
                        <th>{t('admin.colLocation')}</th>
                        <th>{t('admin.colSchemes')}</th>
                        <th>{t('admin.colAvailability')}</th>
                        <th>{t('admin.colStatus')}</th>
                        <th>{t('admin.colUpdated')}</th>
                        <th>{t('admin.colActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnersList.map((p) => {
                        const typeMeta = PARTNER_TYPE_LABELS[p.type] || { en: p.type };
                        const localizedType = typeMeta[language] || typeMeta.en || p.type;
                        const partnerName = (language === 'hi' && p.nameHi) ? p.nameHi : (language === 'mr' && p.nameMr) ? p.nameMr : p.name;
                        const availabilityLabel =
                          p.availabilityStatus === 'active'
                            ? t('admin.statusActive')
                            : p.availabilityStatus === 'limited-capacity'
                            ? t('admin.statusLimited')
                            : t('admin.statusUnavailable');

                        return (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 700, maxWidth: '240px' }}>
                              <div>{partnerName}</div>
                              <span style={{ fontSize: '10px', color: 'var(--color-gray-500)' }}>{p.address}</span>
                            </td>
                            <td>
                              <span className="badge badge-navy" style={{ fontSize: '10px' }}>
                                {localizedType}
                              </span>
                            </td>
                            <td>
                              {p.district}, {p.state}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {p.categories.map((c) => (
                                  <span key={c} className="badge badge-teal" style={{ fontSize: '9px' }}>
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  p.availabilityStatus === 'active'
                                    ? 'badge-success'
                                    : p.availabilityStatus === 'limited-capacity'
                                    ? 'badge-warning'
                                    : 'badge-error'
                                }`}
                                style={{ fontSize: '10px' }}
                              >
                                {availabilityLabel}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${p.verificationStatus === 'verified' ? 'badge-teal' : 'badge-navy'}`}
                                style={{ fontSize: '10px' }}
                              >
                                {p.verificationStatus === 'verified' ? t('admin.badgeVerified') : t('admin.badgeSample')}
                              </span>
                            </td>
                            <td style={{ color: 'var(--color-gray-500)', fontSize: '11px' }}>
                              {p.lastUpdated || '2026-10-15'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="btn btn-ghost"
                                  style={{ padding: '4px 8px' }}
                                  onClick={() => openEditModal(p)}
                                  title={t('admin.editTooltip')}
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  className="btn btn-ghost"
                                  style={{ padding: '4px 8px', color: '#dc2626' }}
                                  onClick={() => deletePartner(p.id)}
                                  title={t('admin.deleteTooltip')}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEMO APPLICATIONS TABLE */}
          {activeTab === 'applications' && (
            <div className="admin-table-wrap animate-fade-in">
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t('admin.colRefNumber')}</th>
                      <th>{t('admin.colApplicant')}</th>
                      <th>{t('admin.colCategory')}</th>
                      <th>{t('admin.colAmount')}</th>
                      <th>{t('admin.colLocation')}</th>
                      <th>{t('admin.colAssignedPartner')}</th>
                      <th>{t('admin.colStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationsList.map((app) => (
                      <tr key={app.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {app.refNumber}
                        </td>
                        <td>
                          <strong>{app.applicantName}</strong>
                          {app.phone && <div style={{ fontSize: '10px', color: 'var(--color-gray-500)' }}>{app.phone}</div>}
                        </td>
                        <td>{app.schemeCategory}</td>
                        <td style={{ fontWeight: 700 }}>₹{Number(app.amount).toLocaleString('en-IN')}</td>
                        <td>{app.district ? `${app.district}, ${app.state}` : app.state || 'N/A'}</td>
                        <td>
                          {app.assignedPartner ? (
                            <span className="badge badge-teal" style={{ fontSize: '10px' }}>
                              {(language === 'hi' && app.assignedPartner.nameHi) ? app.assignedPartner.nameHi : (language === 'mr' && app.assignedPartner.nameMr) ? app.assignedPartner.nameMr : app.assignedPartner.name}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-gray-400)', fontSize: '11px' }}>{t('admin.notAssigned')}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${app.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ADD / EDIT PARTNER MODAL */}
      {(editingPartner || isNewPartner) && (
        <div className="admin-modal-backdrop" onClick={() => { setEditingPartner(null); setIsNewPartner(false); }}>
          <div className="admin-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', borderBottom: '1.5px solid var(--color-gray-200)', paddingBottom: 'var(--space-3)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-navy-950)' }}>
                {isNewPartner ? t('admin.modalAddTitle') : `${t('admin.modalEditTitle')}: ${form.name}`}
              </h3>
              <button className="btn btn-ghost" onClick={() => { setEditingPartner(null); setIsNewPartner(false); }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">{t('admin.labelAgencyName')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('admin.placeholderAgencyName')}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label">{t('admin.labelPartnerType')}</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="SCA">{PARTNER_TYPE_LABELS['SCA']?.[language] || PARTNER_TYPE_LABELS['SCA']?.en}</option>
                    <option value="PSB">{PARTNER_TYPE_LABELS['PSB']?.[language] || PARTNER_TYPE_LABELS['PSB']?.en}</option>
                    <option value="RRB">{PARTNER_TYPE_LABELS['RRB']?.[language] || PARTNER_TYPE_LABELS['RRB']?.en}</option>
                    <option value="MFI">{PARTNER_TYPE_LABELS['MFI']?.[language] || PARTNER_TYPE_LABELS['MFI']?.en}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('admin.labelAvailability')}</label>
                  <select
                    className="form-select"
                    value={form.availabilityStatus}
                    onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}
                  >
                    <option value="active">{t('admin.optionActive')}</option>
                    <option value="limited-capacity">{t('admin.optionLimited')}</option>
                    <option value="temporarily-unavailable">{t('admin.optionUnavailable')}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label">{t('admin.labelState')}</label>
                  <select
                    className="form-select"
                    value={form.state}
                    onChange={(e) => {
                      const st = e.target.value;
                      setForm({
                        ...form,
                        state: st,
                        district: (districtsByState[st] || [])[0] || '',
                      });
                    }}
                  >
                    {states.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('admin.labelDistrict')}</label>
                  <select
                    className="form-select"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  >
                    {(districtsByState[form.state] || []).map((dst) => (
                      <option key={dst} value={dst}>{dst}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.labelAddress')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder={t('admin.placeholderAddress')}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label">{t('admin.labelLat')}</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.labelLng')}</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.labelCategories')}</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {['micro-finance', 'term-loan', 'education-loan'].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      className={`btn btn-sm ${form.categories?.includes(cat) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleCategory(cat)}
                    >
                      {form.categories?.includes(cat) && <Check size={12} />}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label">{t('admin.labelPhone')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.labelVerification')}</label>
                  <select
                    className="form-select"
                    value={form.verificationStatus}
                    onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}
                  >
                    <option value="verified">{t('admin.optionVerified')}</option>
                    <option value="sample">{t('admin.optionSample')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)', borderTop: '1.5px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
              <button className="btn btn-ghost" onClick={() => { setEditingPartner(null); setIsNewPartner(false); }}>
                {t('admin.btnCancel')}
              </button>
              <button className="btn btn-primary" onClick={savePartnerForm}>
                <Check size={16} />
                {t('admin.btnSave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
