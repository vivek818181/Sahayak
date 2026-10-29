// data/schemeRules.js — Configurable business rules for SC concessional loan schemes
// Based on National Scheduled Castes Finance & Development Corporation (NSFDC) challenge brief

export const SCHEME_RULES = [
  {
    id: 'micro-finance',
    name: 'Micro Finance Scheme',
    nameHi: 'माइक्रो फाइनेंस योजना',
    nameMr: 'मायक्रो फायनान्स योजना',
    category: 'Micro Finance',
    categoryHi: 'माइक्रो फाइनेंस',
    categoryMr: 'मायक्रो फायनान्स',
    icon: 'Wallet',
    color: '#0f9090',
    colorBg: '#e6fafa',
    
    // Financial Limits (Stated ₹1.40 Lakh upper limit from challenge brief)
    minAmount: 10000,
    maxAmount: 140000,
    maxAmountLabel: '₹1.40 Lakh',
    
    // Income criteria (Reference annual income up to ₹5.00 Lakh)
    incomeLimit: 500000,
    incomeLimitLabel: '₹5.00 Lakh per annum',
    
    // Illustrative Concessional Interest Rates (challenge: 6.5%–8% concessional reference, 4%–6% micro)
    interestRateRange: {
      min: 4.0,
      max: 6.5,
      defaultRate: 5.0,
      illustrative: true,
      note: 'Illustrative concessional rate range for micro-finance',
      noteHi: 'माइक्रो-फाइनेंस के लिए सांकेतिक रियायती ब्याज दर सीमा',
      noteMr: 'मायक्रो-फायनान्ससाठी सूचक सवलतीची व्याजदर मर्यादा',
    },
    
    // Repayment Tenure
    tenureMonths: {
      min: 12,
      max: 36,
      defaultTenure: 36,
      label: '1 to 3 Years',
      labelHi: '1 से 3 वर्ष',
      labelMr: '1 ते 3 वर्षे',
    },
    
    // Moratorium Period
    moratoriumMonths: {
      min: 0,
      max: 6,
      defaultMoratorium: 3,
      supported: true,
      label: '3 to 6 months',
      labelHi: '3 से 6 महीने',
      labelMr: '3 ते 6 महिने',
    },
    
    // Target loan purposes
    allowedPurposes: [
      'micro-enterprise',
      'small-business',
      'self-employment',
      'artisan',
      'petty-trade',
      'street-vending',
      'dairy-farming',
    ],
    
    // Target educational qualification
    educationCriteria: {
      minLevel: 'none', // Accessible to all education levels
      levels: ['none', 'below-10th', '10th-pass', '12th-pass', 'graduate', 'post-graduate', 'vocational'],
    },
    
    // Purpose description
    purposeDesc: 'Provides quick, low-barrier financial assistance to micro-entrepreneurs, small shopkeepers, artisans, and self-employed individuals.',
    purposeDescHi: 'सूक्ष्म उद्यमियों, छोटे दुकानदारों, कारीगरों और स्वरोजगारियों को त्वरित, कम औपचारिकता वाली वित्तीय सहायता।',
    purposeDescMr: 'सूक्ष्म उद्योजक, लहान दुकानदार, कारागीर आणि स्वयंरोजगार व्यक्तींना जलद, कमी औपचारिकतेची आर्थिक मदत.',
    
    // Required Official Verification Documents
    verificationDocuments: [
      {
        id: 'caste-cert',
        title: 'SC Caste Certificate',
        titleHi: 'अनुसूचित जाति (SC) प्रमाण पत्र',
        titleMr: 'अनुसूचित जाती (SC) प्रमाणपत्र',
        issuer: 'Competent Revenue Authority (Tehsildar / SDO)',
        required: true,
      },
      {
        id: 'income-cert',
        title: 'Annual Family Income Certificate',
        titleHi: 'वार्षिक पारिवारिक आय प्रमाण पत्र',
        titleMr: 'वार्षिक कौटुंबिक उत्पन्न प्रमाणपत्र',
        issuer: 'Revenue Officer (Verifying annual family income <= ₹5.00 Lakh)',
        required: true,
      },
      {
        id: 'address-proof',
        title: 'Resident / Domicile Certificate & Aadhaar / Voter ID',
        titleHi: 'निवास प्रमाण पत्र और आधार / मतदाता पहचान पत्र',
        titleMr: 'अधिवास प्रमाणपत्र आणि आधार / मतदार ओळखपत्र',
        issuer: 'State Revenue Department / UIDAI',
        required: true,
      },
      {
        id: 'business-proposal',
        title: 'Basic Project Quotation or Activity Plan',
        titleHi: 'परियोजना कोटेशन या गतिविधि योजना',
        titleMr: 'प्रकल्प कोटेशन किंवा क्रियाकलाप योजना',
        issuer: 'Applicant self-declaration / vendor quotation',
        required: false,
      },
    ],
    
    // Channel Partner Categories
    partnerCategories: [
      'State Channelizing Agencies (SCAs)',
      'Regional Rural Banks (RRBs)',
      'Public Sector Banks (PSBs)',
      'Micro Finance Institutions / SHG Federations',
    ],
    
    illustrative: true,
  },

  {
    id: 'term-loan',
    name: 'Term Loan Scheme',
    nameHi: 'टर्म लोन योजना',
    nameMr: 'मुदत कर्ज योजना',
    category: 'Term Loan',
    categoryHi: 'टर्म लोन',
    categoryMr: 'मुदत कर्ज',
    icon: 'Building2',
    color: '#234b7a',
    colorBg: '#eaf2fa',
    
    // Financial Limits (Stated ₹50.00 Lakh upper limit from challenge brief)
    minAmount: 100000,
    maxAmount: 5000000,
    maxAmountLabel: '₹50.00 Lakh',
    
    // Income criteria (Reference annual income up to ₹5.00 Lakh)
    incomeLimit: 500000,
    incomeLimitLabel: '₹5.00 Lakh per annum',
    
    // Illustrative Concessional Interest Rates (challenge: 6.5%–8%)
    interestRateRange: {
      min: 6.5,
      max: 8.0,
      defaultRate: 7.0,
      illustrative: true,
      note: 'Illustrative concessional interest rate (6.5%–8.0%) as per challenge brief',
      noteHi: 'चैलेंज ब्रीफ के अनुसार सांकेतिक रियायती ब्याज दर (6.5%–8.0%)',
      noteMr: 'चॅलेंज ब्रीफनुसार सूचक सवलतीचा व्याजदर (6.5%–8.0%)',
    },
    
    // Repayment Tenure
    tenureMonths: {
      min: 36,
      max: 120,
      defaultTenure: 60,
      label: '3 to 10 Years',
      labelHi: '3 से 10 वर्ष',
      labelMr: '3 ते 10 वर्षे',
    },
    
    // Moratorium Period
    moratoriumMonths: {
      min: 0,
      max: 12,
      defaultMoratorium: 6,
      supported: true,
      label: '6 to 12 months',
      labelHi: '6 से 12 महीने',
      labelMr: '6 ते 12 महिने',
    },
    
    // Target loan purposes
    allowedPurposes: [
      'small-business',
      'larger-enterprise',
      'manufacturing',
      'service-business',
      'agriculture',
      'transport-vehicle',
      'self-employment',
    ],
    
    // Target educational qualification
    educationCriteria: {
      minLevel: 'none',
      recommendedLevel: '10th-pass',
      levels: ['none', 'below-10th', '10th-pass', '12th-pass', 'graduate', 'post-graduate', 'vocational'],
    },
    
    // Purpose description
    purposeDesc: 'Substantial medium to long-term capital for establishing manufacturing units, commercial transport, agro-enterprises, or expanding viable small and medium businesses.',
    purposeDescHi: 'विनिर्माण इकाइयों, व्यावसायिक परिवहन, कृषि उद्यमों की स्थापना या व्यवहार्य छोटे और मध्यम व्यवसायों के विस्तार के लिए मध्यम से दीर्घकालिक पूंजी।',
    purposeDescMr: 'उत्पादन युनिट, व्यावसायिक वाहतूक, कृषी उद्योग सुरू करण्यासाठी किंवा व्यवहार्य लघु आणि मध्यम व्यवसायांचा विस्तार करण्यासाठी मध्यम ते दीर्घकालीन भांडवल.',
    
    // Required Official Verification Documents
    verificationDocuments: [
      {
        id: 'caste-cert',
        title: 'SC Caste Certificate',
        titleHi: 'अनुसूचित जाति (SC) प्रमाण पत्र',
        titleMr: 'अनुसूचित जाती (SC) प्रमाणपत्र',
        issuer: 'Competent Revenue Authority (SDO / Tehsildar)',
        required: true,
      },
      {
        id: 'dpr',
        title: 'Detailed Project Report (DPR) & Financial Estimates',
        titleHi: 'विस्तृत परियोजना रिपोर्ट (DPR) और वित्तीय अनुमान',
        titleMr: 'तपशीलवार प्रकल्प अहवाल (DPR) आणि आर्थिक अंदाज',
        issuer: 'Chartered Accountant / Certified Project Consultant',
        required: true,
      },
      {
        id: 'income-cert',
        title: 'Annual Family Income Certificate',
        titleHi: 'वार्षिक पारिवारिक आय प्रमाण पत्र',
        titleMr: 'वार्षिक कौटुंबिक उत्पन्न प्रमाणपत्र',
        issuer: 'Revenue Officer',
        required: true,
      },
      {
        id: 'quotations',
        title: 'Machinery / Vehicle / Equipment Quotations & Invoices',
        titleHi: 'मशीनरी / वाहन / उपकरण कोटेशन और बिल',
        titleMr: 'यंत्रसामग्री / वाहन / उपकरण कोटेशन आणि बिले',
        issuer: 'Authorized Dealers / Manufacturers',
        required: true,
      },
      {
        id: 'collateral',
        title: 'Collateral / Guarantee Documents (as per Partner Bank norms)',
        titleHi: 'संपार्श्विक / गारंटी दस्तावेज़ (पार्टनर बैंक नियमों के अनुसार)',
        titleMr: 'तारण / हमी दस्तऐवज (भागीदार बँक नियमांनुसार)',
        issuer: 'Revenue Authority / Guarantor',
        required: false,
      },
    ],
    
    partnerCategories: [
      'State Channelizing Agencies (SCAs)',
      'Public Sector Banks (PSBs)',
      'State Financial Corporations (SFCs)',
    ],
    
    illustrative: true,
  },

  {
    id: 'education-loan',
    name: 'Educational Loan Scheme',
    nameHi: 'शैक्षिक ऋण योजना',
    nameMr: 'शैक्षणिक कर्ज योजना',
    category: 'Educational Loan',
    categoryHi: 'शैक्षिक ऋण',
    categoryMr: 'शैक्षणिक कर्ज',
    icon: 'GraduationCap',
    color: '#d97706',
    colorBg: '#fffbeb',
    
    // Financial Limits
    minAmount: 50000,
    maxAmount: 2000000,
    maxAmountLabel: 'Up to ₹20.00 Lakh',
    
    // Income criteria (Reference annual income up to ₹5.00 Lakh)
    incomeLimit: 500000,
    incomeLimitLabel: '₹5.00 Lakh per annum',
    
    // Illustrative Concessional Interest Rates (indicative 3.5%–5.0% for students)
    interestRateRange: {
      min: 3.5,
      max: 5.0,
      defaultRate: 4.0,
      illustrative: true,
      note: 'Special concessional rate for SC students pursuing professional courses',
      noteHi: 'व्यावसायिक पाठ्यक्रमों के SC छात्रों के लिए विशेष रियायती दर',
      noteMr: 'व्यावसायिक अभ्यासक्रम शिकणाऱ्या SC विद्यार्थ्यांसाठी विशेष सवलतीचा दर',
    },
    
    // Repayment Tenure
    tenureMonths: {
      min: 36,
      max: 84,
      defaultTenure: 60,
      label: 'Up to 7 Years (post-moratorium)',
      labelHi: 'स्थगन के बाद 7 वर्ष तक',
      labelMr: 'स्थगनानंतर 7 वर्षांपर्यंत',
    },
    
    // Moratorium Period
    moratoriumMonths: {
      min: 6,
      max: 24,
      defaultMoratorium: 12,
      supported: true,
      courseDurationPlus: true,
      label: 'Course duration + 6 to 12 months',
      labelHi: 'पाठ्यक्रम अवधि + 6 से 12 महीने',
      labelMr: 'अभ्यासक्रम कालावधी + 6 ते 12 महिने',
    },
    
    // Target loan purposes
    allowedPurposes: [
      'education',
      'higher-education',
      'professional-course',
      'technical-training',
      'vocational-degree',
    ],
    
    // Target educational qualification
    educationCriteria: {
      minLevel: '12th-pass',
      levels: ['12th-pass', 'graduate', 'post-graduate'],
    },
    
    // Purpose description
    purposeDesc: 'Concessional education financing covering tuition fees, hostel expenses, books, and essential study equipment for higher technical and professional qualifications.',
    purposeDescHi: 'उच्च तकनीकी और व्यावसायिक योग्यताओं के लिए ट्यूशन फीस, छात्रावास खर्च, किताबें और आवश्यक अध्ययन उपकरण को कवर करने वाला रियायती शिक्षा वित्तपोषण।',
    purposeDescMr: 'उच्च तांत्रिक आणि व्यावसायिक पात्रतेसाठी शिक्षण शुल्क, वसतिगृह खर्च, पुस्तके आणि आवश्यक अभ्यास साहित्य समाविष्ट करणारे सवलतीचे शैक्षणिक वित्तपुरवठा.',
    
    // Required Official Verification Documents
    verificationDocuments: [
      {
        id: 'caste-cert',
        title: 'SC Caste Certificate',
        titleHi: 'अनुसूचित जाति (SC) प्रमाण पत्र',
        titleMr: 'अनुसूचित जाती (SC) प्रमाणपत्र',
        issuer: 'Competent Revenue Authority',
        required: true,
      },
      {
        id: 'admission-letter',
        title: 'Confirmed Admission Letter & Bonafide Certificate',
        titleHi: 'प्रवेश पत्र और बोनाफाइड प्रमाण पत्र',
        titleMr: 'प्रवेश पत्र आणि बोनाफाइड प्रमाणपत्र',
        issuer: 'Recognized College / University (AICTE / UGC / State Govt)',
        required: true,
      },
      {
        id: 'fee-structure',
        title: 'Official Itemized Fee Structure',
        titleHi: 'संस्थान द्वारा जारी आधिकारिक शुल्क विवरण',
        titleMr: 'संस्थेकडून अधिकृत तपशीलवार शुल्क रचना',
        issuer: 'Educational Institution Accounts Department',
        required: true,
      },
      {
        id: 'academic-records',
        title: 'Academic Marksheets (10th, 12th / Degree) & Entrance Scorecard',
        titleHi: 'शैक्षणिक अंकतालिकाएं और प्रवेश परीक्षा स्कोरकार्ड',
        titleMr: 'शैक्षणिक गुणपत्रिका आणि प्रवेश परीक्षा स्कोअरकार्ड',
        issuer: 'Examination Boards / Testing Agency',
        required: true,
      },
      {
        id: 'income-cert',
        title: 'Annual Family Income Certificate',
        titleHi: 'वार्षिक पारिवारिक आय प्रमाण पत्र',
        titleMr: 'वार्षिक कौटुंबिक उत्पन्न प्रमाणपत्र',
        issuer: 'Revenue Officer',
        required: true,
      },
    ],
    
    partnerCategories: [
      'Public Sector Banks (PSBs)',
      'State Channelizing Agencies (SCAs)',
    ],
    
    illustrative: true,
  },
];

// Helper to look up scheme by ID
export function getSchemeRuleById(id) {
  return SCHEME_RULES.find((s) => s.id === id) || null;
}
