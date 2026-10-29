// services/partnerMatchingService.js — Geo-spatial & Eligibility-Aware Partner Matching
// Implements Haversine distance, multi-tier ranking, match reason generation,
// and partner-specific document checklists.

/**
 * Calculate distance between two coordinates using the Haversine formula (in kilometers).
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    isNaN(Number(lat1)) ||
    isNaN(Number(lon1)) ||
    isNaN(Number(lat2)) ||
    isNaN(Number(lon2))
  ) {
    return null;
  }
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Filter and Rank Partners based on scheme, location, coordinates, and availability.
 *
 * @param {Array} partners - List of partner records
 * @param {Object} criteria - Search/Matching criteria
 * @param {string} [criteria.category] - Scheme category (micro-finance, term-loan, education-loan)
 * @param {string} [criteria.state] - User selected state
 * @param {string} [criteria.district] - User selected district
 * @param {string} [criteria.partnerType] - Specific partner type filter (SCA, PSB, RRB, MFI)
 * @param {string} [criteria.searchTerm] - Free text query
 * @param {number} [criteria.userLat] - User latitude (from GPS)
 * @param {number} [criteria.userLng] - User longitude (from GPS)
 * @returns {Array} Ranked partners with computed distances and ranking reasons
 */
export function matchAndRankPartners(partners = [], criteria = {}) {
  const {
    category,
    state,
    district,
    partnerType,
    searchTerm,
    userLat,
    userLng,
  } = criteria;

  const normalizedCategory = category ? category.toLowerCase().trim() : '';
  const normalizedState = state ? state.toLowerCase().trim() : '';
  const normalizedDistrict = district ? district.toLowerCase().trim() : '';
  const normalizedSearch = searchTerm ? searchTerm.toLowerCase().trim() : '';

  // Step 1: Filter
  const filtered = partners.filter((partner) => {
    // 1. Category Filter
    if (normalizedCategory) {
      const supportsCategory = partner.categories.some((c) =>
        c.toLowerCase().includes(normalizedCategory) ||
        normalizedCategory.includes(c.toLowerCase())
      );
      if (!supportsCategory) return false;
    }

    // 2. Partner Type Filter
    if (partnerType && partnerType !== 'all') {
      if (partner.type !== partnerType) return false;
    }

    // 3. Search Term (Name, address, locality, district)
    if (normalizedSearch) {
      const matchName = partner.name.toLowerCase().includes(normalizedSearch);
      const matchAddress = partner.address.toLowerCase().includes(normalizedSearch);
      const matchDistrict = partner.district.toLowerCase().includes(normalizedSearch);
      const matchState = partner.state.toLowerCase().includes(normalizedSearch);
      if (!matchName && !matchAddress && !matchDistrict && !matchState) {
        return false;
      }
    }

    // 4. State Filter
    if (normalizedState) {
      const matchState = partner.state.toLowerCase() === normalizedState;
      const isAllIndia = (partner.serviceArea || '').toLowerCase().includes('all india');
      if (!matchState && !isAllIndia) return false;
    }

    // 5. District Filter (if specified and not all districts)
    if (normalizedDistrict && normalizedState) {
      const matchDistrict = partner.district.toLowerCase() === normalizedDistrict;
      const isStatewide = (partner.serviceArea || '').toLowerCase().includes('statewide');
      const isAllIndia = (partner.serviceArea || '').toLowerCase().includes('all india');
      if (!matchDistrict && !isStatewide && !isAllIndia) return false;
    }

    return true;
  });

  // Step 2: Compute Distances & Ranking Score
  const enriched = filtered.map((partner) => {
    let distanceKm = null;
    if (userLat !== undefined && userLng !== undefined && partner.lat && partner.lng) {
      distanceKm = calculateHaversineDistance(userLat, userLng, partner.lat, partner.lng);
    }

    // Four-Tier Ranking Algorithm
    let rankScore = 0;
    const rankingReasons = [];

    // 1. Category & Institutional Priority (SCAs receive primary mandate for SC welfare)
    if (partner.type === 'SCA') {
      rankScore += 50;
      rankingReasons.push('Apex State Channelizing Agency designated for Scheduled Caste welfare credit');
    } else if (partner.type === 'PSB') {
      rankScore += 40;
      rankingReasons.push('Public Sector Bank partner with priority-sector lending window');
    } else if (partner.type === 'RRB') {
      rankScore += 35;
      rankingReasons.push('Regional Rural Bank specializing in local grassroots credit');
    } else {
      rankScore += 25;
      rankingReasons.push('Micro-credit partner supporting local group financing');
    }

    // 2. Proximity Score
    if (distanceKm !== null) {
      if (distanceKm <= 15) {
        rankScore += 30;
        rankingReasons.push(`Located nearby (${distanceKm} km) within your local service area`);
      } else if (distanceKm <= 50) {
        rankScore += 20;
        rankingReasons.push(`Accessible regional office (${distanceKm} km)`);
      } else {
        rankScore += 5;
        rankingReasons.push(`State-level headquarters (${distanceKm} km)`);
      }
    } else if (normalizedDistrict && partner.district.toLowerCase() === normalizedDistrict) {
      rankScore += 25;
      rankingReasons.push(`Direct office presence in your district (${partner.district})`);
    } else if (normalizedState && partner.state.toLowerCase() === normalizedState) {
      rankScore += 15;
      rankingReasons.push(`Covers your state (${partner.state}) under statewide jurisdiction`);
    }

    // 3. Operational Availability Score
    if (partner.availabilityStatus === 'active') {
      rankScore += 20;
    } else if (partner.availabilityStatus === 'limited-capacity') {
      rankScore += 5;
      rankingReasons.push('Note: Operating with limited application intake capacity');
    } else if (partner.availabilityStatus === 'temporarily-unavailable') {
      rankScore -= 50;
      rankingReasons.push('Notice: Branch temporarily unavailable for physical counter submissions');
    }

    // 4. Verification & Funding Status
    if (partner.verificationStatus === 'verified') {
      rankScore += 10;
    }

    // Legitimate navigation URL via OpenStreetMap
    const navigationUrl = partner.lat && partner.lng
      ? `https://www.openstreetmap.org/directions?to=${partner.lat}%2C${partner.lng}`
      : `https://www.openstreetmap.org/search?query=${encodeURIComponent(partner.address || partner.name)}`;

    return {
      ...partner,
      distanceKm,
      rankScore,
      rankingReasons,
      navigationUrl,
    };
  });

  // Step 3: Sort by rankScore descending, then by distance ascending
  enriched.sort((a, b) => {
    if (b.rankScore !== a.rankScore) {
      return b.rankScore - a.rankScore;
    }
    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  return enriched;
}

/**
 * Generate Partner-Specific Application Preparation Checklist.
 * Based on partner type and chosen loan category.
 */
export function generatePartnerChecklist(partner, schemeId = 'micro-finance') {
  const isEducation = schemeId === 'education-loan';
  const isTermLoan = schemeId === 'term-loan';
  const isMicro = schemeId === 'micro-finance';

  const baseChecklist = [
    {
      id: 'caste',
      title: 'SC Caste Certificate',
      titleHi: 'अनुसूचित जाति (SC) प्रमाण पत्र',
      titleMr: 'अनुसूचित जाती (SC) प्रमाणपत्र',
      authority: 'Revenue Officer / Tehsildar / SDO',
      mandatory: true,
      tip: 'Must bear digital barcoded verification or authorized seal from competent state revenue authority.',
    },
    {
      id: 'income',
      title: 'Family Income Certificate',
      titleHi: 'पारिवारिक आय प्रमाण पत्र',
      titleMr: 'कौटुंबिक उत्पन्न प्रमाणपत्र',
      authority: 'Tehsildar / Block Development Officer',
      mandatory: true,
      tip: 'Verifies annual family income is within the ₹5.00 Lakh concessional eligibility threshold.',
    },
    {
      id: 'residence',
      title: 'Resident Domicile & Aadhaar ID',
      titleHi: 'निवास प्रमाण पत्र और आधार पहचान',
      titleMr: 'अधिवास प्रमाणपत्र आणि आधार ओळख',
      authority: 'State Domicile / UIDAI',
      mandatory: true,
      tip: 'Establishes applicant residence in the partner’s jurisdictional service area.',
    },
  ];

  // Specific additions based on partner type & scheme
  if (isEducation) {
    baseChecklist.push(
      {
        id: 'admission',
        title: 'Confirmed College Admission Letter & Bonafide Certificate',
        titleHi: 'कॉलेज प्रवेश पत्र और बोनाफाइड प्रमाण पत्र',
        titleMr: 'महाविद्यालयीन प्रवेश पत्र आणि बोनाफाइड प्रमाणपत्र',
        authority: 'Recognized College / University Dean',
        mandatory: true,
        tip: 'From UGC / AICTE / Medical Council / State recognized university.',
      },
      {
        id: 'fees',
        title: 'Official Itemized Fee Structure',
        titleHi: 'आधिकारिक शुल्क विवरण',
        titleMr: 'अधिकृत शुल्क रचना',
        authority: 'University Accounts Department',
        mandatory: true,
        tip: 'Detailed semester-wise breakdown of tuition, lab, library, and hostel expenses.',
      },
      {
        id: 'marksheets',
        title: '10th, 12th & Degree Marksheets',
        titleHi: '10वीं, 12वीं और डिग्री अंकतालिकाएं',
        titleMr: '10वी, 12वी आणि पदवी गुणपत्रिका',
        authority: 'Examination Boards / University',
        mandatory: true,
        tip: 'Self-attested copies of all qualifying educational credentials.',
      }
    );
  } else if (isTermLoan) {
    baseChecklist.push(
      {
        id: 'dpr',
        title: 'Detailed Project Report (DPR) / Business Plan',
        titleHi: 'विस्तृत परियोजना रिपोर्ट (DPR)',
        titleMr: 'तपशीलवार प्रकल्प अहवाल (DPR)',
        authority: 'Certified Project Consultant / CA / Applicant',
        mandatory: true,
        tip: 'Specifies machinery costs, raw material requirements, working capital cycle, and revenue projections.',
      },
      {
        id: 'quotations',
        title: 'Official Machinery / Vehicle Quotations',
        titleHi: 'मशीनरी या वाहन का कोटेशन',
        titleMr: 'यंत्रसामग्री किंवा वाहनाचे कोटेशन',
        authority: 'Authorized GST Registered Dealer',
        mandatory: true,
        tip: 'Proforma invoices for proposed capital assets to be acquired with loan funds.',
      }
    );
    if (partner.type === 'PSB') {
      baseChecklist.push({
        id: 'cibil',
        title: 'Applicant & Co-applicant KYC / Bank Statements',
        titleHi: 'आवेदक बैंक विवरण (6 माह)',
        titleMr: 'बँक स्टेटमेंट (६ महिने)',
        authority: 'Operating Bank Branch',
        mandatory: true,
        tip: 'Last 6 months operating bank account statements.',
      });
    }
  } else {
    // Micro Finance
    baseChecklist.push(
      {
        id: 'proposal',
        title: 'Simplified Project / Activity Estimate',
        titleHi: 'सरल परियोजना या गतिविधि अनुमान',
        titleMr: 'साधा प्रकल्प किंवा क्रियाकलाप अंदाज',
        authority: 'Self-declaration with vendor quotation',
        mandatory: true,
        tip: 'Brief 1-page description of petty trade, small shop, or artisan equipment needs.',
      },
      {
        id: 'bank-passbook',
        title: 'Active Savings Bank Account Passbook Copy',
        titleHi: 'बचत बैंक खाता पासबुक की प्रति',
        titleMr: 'बचत बँक पासबुकची प्रत',
        authority: 'Bank Branch (Any Commercial or Grameen Bank)',
        mandatory: true,
        tip: 'Required for direct electronic benefit transfer (DBT) of subsidized credit.',
      }
    );
  }

  return baseChecklist;
}
