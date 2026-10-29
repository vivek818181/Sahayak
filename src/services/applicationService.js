// services/applicationService.js — Demo Application Workflow & Local Persistence
// Manages draft creation from recommended schemes, unique reference IDs, state transitions,
// and clear demo disclaimers.

import { demoApplications } from '../data/applications.js';

const STORAGE_KEY = 'sahayak_user_applications';

/**
 * Generate a unique, professional demo reference number.
 * e.g. SHK-2026-MF-4912
 */
export function generateDemoReference(schemeId = 'generic') {
  const year = new Date().getFullYear();
  let code = 'SC';
  if (schemeId.includes('micro')) code = 'MF';
  else if (schemeId.includes('term')) code = 'TL';
  else if (schemeId.includes('education')) code = 'ED';

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `SHK-${year}-${code}-${randomDigits}`;
}

/**
 * Load all user applications from localStorage, merged with initial demo records.
 */
export function getApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial demo applications
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoApplications));
      return demoApplications;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : demoApplications;
  } catch {
    return demoApplications;
  }
}

/**
 * Save complete application list.
 */
function persistApplications(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save applications to localStorage', err);
  }
}

/**
 * Create a new draft application from recommended scheme and questionnaire profile.
 */
export function createDraftApplication({ scheme, applicantData = {}, loanDetails = {} }) {
  const currentList = getApplications();
  const refNumber = generateDemoReference(scheme?.id || 'scheme');
  const now = new Date().toISOString();

  const newApp = {
    id: 'app-' + Date.now(),
    refNumber,
    schemeId: scheme?.id || 'custom-scheme',
    schemeCategory: scheme?.category || scheme?.name || 'SC Assistance Scheme',
    schemeCategoryHi: scheme?.categoryHi || scheme?.nameHi || 'एससी सहायता योजना',
    schemeCategoryMr: scheme?.categoryMr || scheme?.nameMr || 'एससी सहाय्यता योजना',
    amount: Number(loanDetails.amount || applicantData.cost || scheme?.maxAmount || 100000),
    status: 'draft', // 'draft' | 'ready-for-partner' | 'submitted' | 'under-review' | 'approved'
    submittedOn: null,
    createdOn: now.split('T')[0],
    lastModified: now.split('T')[0],
    applicantName: applicantData.fullName || 'Beneficiary Applicant',
    phone: applicantData.phone || '',
    state: applicantData.state || '',
    district: applicantData.district || '',
    purpose: applicantData.purpose || '',
    income: applicantData.income || '',
    education: applicantData.education || '',
    employment: applicantData.employment || '',
    tenureMonths: loanDetails.tenure || 36,
    moratoriumMonths: loanDetails.moratorium || 0,
    estimatedEMI: loanDetails.emi || 0,
    nextSteps: 'Complete draft verification. Review all fields before submitting for demo channel partner assignment.',
    nextStepsHi: 'ड्राफ्ट सत्यापन पूरा करें। डेमो चैनल पार्टनर असाइनमेंट के लिए सबमिट करने से पहले सभी क्षेत्रों की समीक्षा करें।',
    nextStepsMr: 'मसुदा पडताळणी पूर्ण करा. डेमो चॅनेल पार्टनर नियुक्त करण्यासाठी सबमिट करण्यापूर्वी सर्व फील्डचे पुनरावलोकन करा.',
    isDemo: true,
    timeline: [
      {
        status: 'draft',
        timestamp: now,
        note: 'Application draft created from smart scheme recommendation.',
      },
    ],
  };

  const updatedList = [newApp, ...currentList];
  persistApplications(updatedList);
  return newApp;
}

/**
 * Update application fields (e.g. during review edit).
 */
export function updateApplication(id, updates = {}) {
  const list = getApplications();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  list[index] = {
    ...list[index],
    ...updates,
    lastModified: now.split('T')[0],
  };

  persistApplications(list);
  return list[index];
}

/**
 * Transition application state (e.g. Draft -> Ready for Partner -> Submitted in Demo -> Under Review).
 */
export function transitionApplicationStatus(id, targetStatus) {
  const list = getApplications();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const app = list[index];
  const now = new Date().toISOString();
  let nextSteps = app.nextSteps;
  let nextStepsHi = app.nextStepsHi;
  let nextStepsMr = app.nextStepsMr;

  switch (targetStatus) {
    case 'ready-for-partner':
      nextSteps = 'Draft validated. Ready to download application summary or visit nearest Channel Partner.';
      nextStepsHi = 'ड्राफ्ट मान्य किया गया। सारांश डाउनलोड करने या निकटतम चैनल पार्टनर से मिलने के लिए तैयार।';
      nextStepsMr = 'मसुदा प्रमाणित झाला. सारांश डाउनलोड करण्यास किंवा जवळच्या चॅनेल पार्टनरला भेट देण्यास तयार.';
      break;
    case 'submitted':
      nextSteps = 'Submitted in demo environment. Awaiting simulated review officer allocation.';
      nextStepsHi = 'डेमो वातावरण में सबमिट किया गया। अधिकारी आवंटन की प्रतीक्षा है।';
      nextStepsMr = 'डेमो वातावरणात सबमिट केले. अधिकारी वाटपाची प्रतीक्षा आहे.';
      break;
    case 'under-review':
      nextSteps = 'Under documentary review by simulated SCA verification cell. Expect status update in 5–7 days.';
      nextStepsHi = 'सत्यापन सेल द्वारा दस्तावेज़ समीक्षा चल रही है। 5-7 दिनों में अपडेट की अपेक्षा करें।';
      nextStepsMr = 'पडताळणी विभागाकडून दस्तऐवज पुनरावलोकन सुरू आहे. 5-7 दिवसात अपडेट अपेक्षित.';
      break;
    default:
      break;
  }

  app.status = targetStatus;
  if (targetStatus === 'submitted' && !app.submittedOn) {
    app.submittedOn = now.split('T')[0];
  }
  app.nextSteps = nextSteps;
  app.nextStepsHi = nextStepsHi;
  app.nextStepsMr = nextStepsMr;
  app.lastModified = now.split('T')[0];

  app.timeline = app.timeline || [];
  app.timeline.push({
    status: targetStatus,
    timestamp: now,
    note: `Status updated to ${targetStatus} in demo platform.`,
  });

  persistApplications(list);
  return app;
}

/**
 * Remove application from list.
 */
export function deleteApplication(id) {
  const list = getApplications();
  const updated = list.filter((a) => a.id !== id);
  persistApplications(updated);
  return updated;
}

/**
 * Official Public-Service Disclaimer regarding Demo Applications.
 */
export function getWorkflowDisclaimer() {
  return 'Notice: This is a student demonstration platform. Submitting an application here creates a local demo record only and DOES NOT transmit an official loan application to any government ministry, bank, or state channelizing agency. For actual financial assistance, please visit an authorized Channel Partner with original certificates.';
}

/**
 * Assign a chosen Channel Partner to an application draft.
 * Stores partner contact, address, directions link, and updates status to 'ready-for-partner'.
 */
export function assignPartnerToApplication(appId, partner) {
  if (!partner) return null;
  const list = getApplications();
  let targetIndex = -1;

  if (appId) {
    targetIndex = list.findIndex((a) => a.id === appId || a.refNumber === appId);
  }
  if (targetIndex === -1) {
    targetIndex = list.findIndex((a) => a.status === 'draft');
  }

  // If no draft exists, create a default draft first
  if (targetIndex === -1) {
    const newApp = createDraftApplication({
      scheme: {
        id: partner.supportedSchemes?.[0] || 'term-loan',
        name: 'SC Financial Assistance',
        category: 'Term Loan / Concessional Assistance',
      },
      applicantData: {
        state: partner.state,
        district: partner.district,
      },
    });
    return assignPartnerToApplication(newApp.id, partner);
  }

  const app = list[targetIndex];
  const now = new Date().toISOString();

  app.assignedPartner = {
    id: partner.id,
    name: partner.name,
    nameHi: partner.nameHi,
    nameMr: partner.nameMr,
    type: partner.type,
    address: partner.address,
    state: partner.state,
    district: partner.district,
    contactPhone: partner.contactPhone,
    contactEmail: partner.contactEmail,
    nodalOfficer: partner.nodalOfficer,
    isSample: Boolean(partner.isSample),
    verificationStatus: partner.verificationStatus,
    directionsUrl: `https://www.openstreetmap.org/directions?to=${partner.lat}%2C${partner.lng}`,
    assignedAt: now,
  };

  app.status = 'ready-for-partner';
  app.lastModified = now.split('T')[0];
  app.nextSteps = `Assigned Channel Partner: ${partner.name}. Review application preparation checklist, carry required physical documents, and visit agency.`;
  app.nextStepsHi = `आवंटित चैनल पार्टनर: ${partner.name}। दस्तावेज़ चेकलिस्ट देखें और संबंधित कार्यालय जाएँ।`;
  app.nextStepsMr = `नियुक्त चॅनेल पार्टनर: ${partner.name}. दस्तऐवज चेकलिस्ट तपासा आणि संबंधित कार्यालयाला भेट द्या.`;

  app.timeline = app.timeline || [];
  app.timeline.push({
    status: 'ready-for-partner',
    timestamp: now,
    note: `Assigned authorized Channel Partner: ${partner.name} (${String(partner.type).toUpperCase()}).`,
  });

  persistApplications(list);
  return app;
}
