// data/applications.js — Demo application data for the tracker

export const demoApplications = [
  {
    id: 'app-001',
    refNumber: 'SHK-2026-001547',
    schemeCategory: 'Term Loan',
    schemeCategoryHi: 'टर्म लोन',
    amount: 800000,
    status: 'under-review',
    submittedOn: '2026-10-15',
    applicantName: 'Demo Applicant',
    nextSteps: 'Document verification in progress. Expect update within 7 working days.',
    nextStepsHi: 'दस्तावेज़ सत्यापन प्रगति पर है। 7 कार्य दिवसों में अपडेट की अपेक्षा करें।',
    isDemo: true,
  },
  {
    id: 'app-002',
    refNumber: 'SHK-2026-001203',
    schemeCategory: 'Educational Loan',
    schemeCategoryHi: 'शैक्षिक ऋण',
    amount: 500000,
    status: 'submitted',
    submittedOn: '2026-10-22',
    applicantName: 'Demo Student',
    nextSteps: 'Application received. Pending assignment to review officer.',
    nextStepsHi: 'आवेदन प्राप्त। समीक्षा अधिकारी को सौंपना शेष है।',
    isDemo: true,
  },
  {
    id: 'app-003',
    refNumber: 'SHK-2026-000890',
    schemeCategory: 'Micro Finance',
    schemeCategoryHi: 'माइक्रो फाइनेंस',
    amount: 100000,
    status: 'approved',
    submittedOn: '2026-09-28',
    applicantName: 'Demo Entrepreneur',
    nextSteps: 'Loan sanctioned. Visit your Channel Partner for disbursement.',
    nextStepsHi: 'ऋण स्वीकृत। वितरण के लिए अपने चैनल पार्टनर से मिलें।',
    isDemo: true,
  },
];

export const demoDrafts = [
  {
    id: 'draft-001',
    schemeCategory: 'Term Loan',
    schemeCategoryHi: 'टर्म लोन',
    lastModified: '2026-10-25',
    progress: 60,
    data: {
      purpose: 'business',
      cost: '1200000',
      income: '450000',
    },
  },
];

export function getStatusColor(status) {
  switch (status) {
    case 'draft': return 'badge-navy';
    case 'submitted': return 'badge-info';
    case 'under-review': return 'badge-warning';
    case 'approved': return 'badge-success';
    case 'rejected': return 'badge-error';
    default: return 'badge-navy';
  }
}

export function getStatusLabel(status, t) {
  switch (status) {
    case 'draft': return t('tracker.draft');
    case 'submitted': return t('tracker.submitted');
    case 'under-review': return t('tracker.underReview');
    case 'approved': return t('tracker.approved');
    case 'rejected': return t('tracker.rejected');
    default: return status;
  }
}
