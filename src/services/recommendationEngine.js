// services/recommendationEngine.js — Configurable Rule-Based Recommendation Engine
// Evaluates applicant inputs against scheme rules, provides ranking, match/mismatch explanations,
// and highlights missing verification items.

import { SCHEME_RULES } from '../data/schemeRules.js';

/**
 * Validates questionnaire inputs.
 * @param {Object} inputs
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateInputs(inputs = {}) {
  const errors = {};

  if (!inputs.purpose || typeof inputs.purpose !== 'string' || !inputs.purpose.trim()) {
    errors.purpose = 'Loan purpose is required';
  }

  const cost = Number(inputs.cost);
  if (inputs.cost === undefined || inputs.cost === null || inputs.cost === '' || isNaN(cost) || cost <= 0) {
    errors.cost = 'Estimated project or education cost must be greater than zero';
  }

  const income = Number(inputs.income);
  if (inputs.income === undefined || inputs.income === null || inputs.income === '' || isNaN(income) || income < 0) {
    errors.income = 'Annual family income must be a valid non-negative number';
  }

  if (!inputs.state || typeof inputs.state !== 'string' || !inputs.state.trim()) {
    errors.state = 'State selection is required for channel partner routing';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format currency to Indian Rupee string without floating-point artifacts.
 */
export function formatCurrency(num) {
  if (num === undefined || num === null || isNaN(Number(num))) return '₹0';
  const rounded = Math.round(Number(num));
  return '₹' + rounded.toLocaleString('en-IN');
}

/**
 * Primary Recommendation Engine
 * Evaluates inputs against SCHEME_RULES and returns classified, ranked results.
 *
 * @param {Object} inputs
 * @param {Array} customRules (Optional override for rules)
 * @returns {Object} Evaluation report
 */
export function evaluateEligibility(inputs = {}, customRules = SCHEME_RULES) {
  // Step 1: Validate
  const validation = validateInputs(inputs);
  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      recommended: [],
      alternatives: [],
      ineligible: [],
      disclaimer: getDisclaimer(),
    };
  }

  const cost = Math.round(Number(inputs.cost));
  const income = Math.round(Number(inputs.income));
  const purpose = (inputs.purpose || '').toLowerCase().trim();
  const education = (inputs.education || '').toLowerCase().trim();
  const employment = (inputs.employment || '').toLowerCase().trim();

  const evaluatedSchemes = [];

  for (const scheme of customRules) {
    let score = 0;
    const matchReasons = [];
    const mismatchReasons = [];
    const missingInformation = [];
    let isDisqualified = false;

    // --- RULE A: Income Criteria ---
    if (income > scheme.incomeLimit) {
      isDisqualified = true;
      mismatchReasons.push(
        `Annual family income of ${formatCurrency(income)} exceeds the illustrative concessional ceiling of ${scheme.incomeLimitLabel}. Standard non-concessional or commercial schemes may be required.`
      );
    } else {
      score += 25;
      matchReasons.push(
        `Annual family income (${formatCurrency(income)}) is within the ${scheme.incomeLimitLabel} eligibility threshold.`
      );
    }

    // --- RULE B: Loan Purpose Alignment ---
    const isEducationPurpose = ['education', 'higher-education', 'professional-course', 'technical-training'].includes(purpose);
    const isMicroPurpose = ['micro-enterprise', 'small-business', 'self-employment', 'artisan', 'petty-trade', 'street-vending'].includes(purpose);
    const isEnterprisePurpose = ['larger-enterprise', 'manufacturing', 'service-business', 'agriculture', 'transport-vehicle'].includes(purpose);

    if (scheme.id === 'education-loan') {
      if (isEducationPurpose) {
        score += 40;
        matchReasons.push('Loan purpose matches educational and professional course financing.');
      } else {
        isDisqualified = true;
        mismatchReasons.push('Educational Loan is strictly designated for academic degrees, professional courses, and skill development.');
      }
    } else {
      // Non-educational schemes (Micro Finance & Term Loan)
      if (isEducationPurpose) {
        isDisqualified = true;
        mismatchReasons.push('This scheme does not finance educational expenses. Please refer to Educational Loan Scheme.');
      } else if (scheme.id === 'micro-finance') {
        if (isMicroPurpose) {
          score += 35;
          matchReasons.push('Targeted for small business, petty trade, artisan work, and micro-enterprises.');
        } else if (isEnterprisePurpose) {
          mismatchReasons.push('Scale of enterprise exceeds micro-credit focus; capital requirements are better suited for Term Loan.');
        } else {
          score += 15;
          matchReasons.push('General self-employment purpose partially aligns.');
        }
      } else if (scheme.id === 'term-loan') {
        if (isEnterprisePurpose || isMicroPurpose) {
          score += 35;
          matchReasons.push('Supports establishing, modernizing, or expanding business, manufacturing, or service ventures.');
        } else {
          score += 15;
        }
      }
    }

    // --- RULE C: Project Cost / Loan Amount Feasibility ---
    if (cost > scheme.maxAmount) {
      isDisqualified = true;
      mismatchReasons.push(
        `Proposed cost of ${formatCurrency(cost)} exceeds the maximum scheme ceiling of ${scheme.maxAmountLabel}.`
      );
    } else if (cost < scheme.minAmount) {
      // Lower amount than typical threshold
      mismatchReasons.push(
        `Proposed amount of ${formatCurrency(cost)} is below the typical minimum project scale (${formatCurrency(scheme.minAmount)}) for this category.`
      );
      score += 10;
    } else {
      // Cost is well within limits
      score += 30;
      matchReasons.push(
        `Proposed cost (${formatCurrency(cost)}) is comfortably within the scheme's limit of ${scheme.maxAmountLabel}.`
      );
    }

    // --- RULE D: Educational & Profile Fit ---
    if (scheme.id === 'education-loan') {
      if (['12th-pass', 'graduate', 'post-graduate'].includes(education)) {
        score += 5;
        matchReasons.push('Academic qualifications meet the minimum pre-requisite for professional course loans.');
      } else {
        missingInformation.push('Confirmation of 12th standard completion or recognized equivalent required.');
      }
    }

    // --- RULE E: Verification & Document Readiness ---
    missingInformation.push('Caste Certificate issued by designated Revenue Authority requires physical verification.');
    missingInformation.push('Income Certificate verification by authorized Channel Partner.');

    if (scheme.id === 'term-loan') {
      if (cost > 500000) {
        missingInformation.push('A formal Detailed Project Report (DPR) with financial projections is required for loans over ₹5 Lakh.');
      }
    }

    if (scheme.id === 'education-loan') {
      missingInformation.push('Official admission offer letter and authorized fee structure from the recognized institution.');
    }

    // Add evaluated record
    evaluatedSchemes.push({
      ...scheme,
      matchScore: Math.min(100, Math.max(0, score)),
      isDisqualified,
      matchReasons,
      mismatchReasons,
      missingInformation,
      indicativeEMIPreview: estimateQuickEMI(cost, scheme.interestRateRange.defaultRate, scheme.tenureMonths.defaultTenure),
    });
  }

  // Step 3: Segment into Recommended, Alternatives, Ineligible
  const recommended = evaluatedSchemes
    .filter((s) => !s.isDisqualified && s.matchScore >= 60)
    .sort((a, b) => b.matchScore - a.matchScore);

  const alternatives = evaluatedSchemes
    .filter((s) => !s.isDisqualified && s.matchScore < 60)
    .sort((a, b) => b.matchScore - a.matchScore);

  const ineligible = evaluatedSchemes
    .filter((s) => s.isDisqualified)
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    isValid: true,
    applicantSummary: {
      purpose,
      cost,
      costFormatted: formatCurrency(cost),
      income,
      incomeFormatted: formatCurrency(income),
      education,
      employment,
      state: inputs.state,
      district: inputs.district,
    },
    recommended,
    alternatives,
    ineligible,
    totalEvaluated: evaluatedSchemes.length,
    disclaimer: getDisclaimer(),
  };
}

/**
 * Quick helper for preliminary EMI display in recommendation cards.
 */
function estimateQuickEMI(principal, annualRate, tenureMonths) {
  const P = Number(principal);
  const r = (Number(annualRate) / 100) / 12;
  const n = Number(tenureMonths);

  if (P <= 0 || r <= 0 || n <= 0) return 0;
  const pow = Math.pow(1 + r, n);
  const emi = (P * r * pow) / (pow - 1);
  return isFinite(emi) ? Math.round(emi) : 0;
}

/**
 * Public Service Disclaimer text.
 */
export function getDisclaimer() {
  return 'Preliminary screening only. This evaluation is based on illustrative criteria and self-reported inputs. Loan sanctions, actual interest concessions, and disbursement amounts are determined solely by authorized Channel Partners and the National Scheduled Castes Finance & Development Corporation (NSFDC) after in-person verification of original documents.';
}

/**
 * Beneficiary Profile Evaluation Engine
 * Evaluates the full multi-step beneficiary profile, integrating the Document Checklist
 * and returning the three standardized outcome labels.
 *
 * @param {Object} profile
 * @returns {Object} Comprehensive evaluation report
 */
export function evaluateBeneficiaryProfile(profile) {
  if (!profile || !profile.loanRequirements || !profile.eligibility) {
    return {
      isValid: false,
      error: 'Incomplete profile data',
      evaluations: [],
      disclaimer: 'These recommendations are preliminary guidance based on the information provided and configured scheme rules. Final eligibility, documentation, loan terms, and approval are determined by the authorized institution.',
    };
  }

  const { loanRequirements, eligibility, documents = {}, personal = {} } = profile;

  // Map purpose to internal category
  let rawPurpose = loanRequirements.purpose || 'small_business';
  let purpose = 'micro-enterprise';
  if (rawPurpose === 'small_business' || rawPurpose === 'small-business') purpose = 'micro-enterprise';
  else if (rawPurpose === 'enterprise' || rawPurpose === 'larger-enterprise') purpose = 'manufacturing';
  else if (rawPurpose === 'education') purpose = 'education';
  else purpose = 'micro-enterprise';

  const cost = Number(loanRequirements.cost) || Number(loanRequirements.estimatedCost) || Number(loanRequirements.preferredAmount) || 100000;
  const income = Number(eligibility.annualIncome) || 0;
  const state = personal.state || 'Maharashtra';
  const district = personal.district || '';
  const education = eligibility.education || eligibility.educationStatus || '';
  const occupation = eligibility.occupation || eligibility.employment || '';
  
  const cat = (eligibility.casteCategory || '').trim().toUpperCase();
  const isSC = cat === 'SC' || cat === 'SCHEDULED CASTE' || cat.includes('SC');

  // Base evaluation using core rules
  const baseEvaluation = evaluateEligibility({
    purpose,
    cost,
    income,
    state,
    district,
    education,
    employment: occupation,
  });

  const allSchemes = [
    ...(baseEvaluation.recommended || []),
    ...(baseEvaluation.alternatives || []),
    ...(baseEvaluation.ineligible || []),
  ];

  // Document status helper
  const hasCasteCert =
    eligibility.hasCasteCert === true ||
    eligibility.casteCertificate === 'yes' ||
    documents.casteCert === 'available' ||
    documents.casteCertificate === 'available';

  const hasIncomeCert =
    eligibility.hasIncomeCert === true ||
    eligibility.incomeCertificate === 'yes' ||
    documents.incomeCert === 'available' ||
    documents.incomeCertificate === 'available';

  // Enhance each scheme evaluation with document checklist verification & standardized outcome labels
  const evaluations = allSchemes.map((scheme) => {
    const missingDocs = [];
    const verifiedDocs = [];

    // Caste certificate check
    if (!hasCasteCert) {
      missingDocs.push("Valid Caste Certificate (SC) is required to access concessional rates.");
    } else {
      verifiedDocs.push("Caste Certificate indicated as available.");
    }

    // Income certificate check
    if (!hasIncomeCert) {
      missingDocs.push("Income Certificate is required to verify the annual family income threshold.");
    } else {
      verifiedDocs.push("Income Certificate indicated as available.");
    }

    // Identity check
    const hasAadhaar = documents.aadhaar === 'available' || documents.aadhaarCard === 'available';
    const hasPan = documents.pan === 'available' || documents.panCard === 'available';
    if (!hasAadhaar && !hasPan) {
      missingDocs.push("At least one government photo identity document (Aadhaar/PAN/Voter ID) is required.");
    }

    // Scheme-specific document checks
    if (scheme.id === 'education-loan') {
      const hasEduDocs = documents.educationDocs === 'available';
      if (!hasEduDocs) {
        missingDocs.push("College admission confirmation letter & authorized fee structure required.");
      }
    }

    if (scheme.id === 'term-loan' && cost > 500000) {
      const hasProjectDocs = documents.projectDocs === 'available' || documents.projectReport === 'available';
      if (!hasProjectDocs) {
        missingDocs.push("Detailed Project Report (DPR) with cash-flow projections required for projects over ₹5 Lakh.");
      }
    }

    // Check non-SC category note
    let casteMismatch = false;
    if (!isSC && eligibility.casteCategory && eligibility.casteCategory !== 'SC') {
      casteMismatch = true;
    }

    // Determine 3 standardized outcome labels
    let outcomeLabel = 'Potential Match';
    if (scheme.isDisqualified || casteMismatch) {
      outcomeLabel = 'Does Not Match Configured Rules';
    } else if (missingDocs.length > 0 || (scheme.matchScore && scheme.matchScore < 60)) {
      outcomeLabel = 'More Information Required';
    } else {
      outcomeLabel = 'Potential Match';
    }

    // Channel partner categories
    const compatiblePartners = ['State Channelizing Agencies (SCAs)', 'Public Sector Banks (PSBs)'];
    if (scheme.id === 'micro-finance') {
      compatiblePartners.push('Regional Rural Banks (RRBs)', 'NBFC-MFIs');
    }

    return {
      ...scheme,
      id: scheme.id,
      schemeId: scheme.id,
      status: outcomeLabel,
      outcomeLabel,
      missingDocs,
      missingDocuments: [...(scheme.missingInformation || []), ...missingDocs],
      verifiedDocuments: verifiedDocs,
      compatiblePartners,
      nextSteps: [
        'Review the required document preparation checklist',
        `Locate an authorized ${compatiblePartners[0]} in ${state}${district ? ' (' + district + ')' : ''}`,
        'Submit original credentials for in-person document screening',
      ],
      verificationStatus: 'Illustrative Concessional Rate • Agency Verification Required',
    };
  });

  return {
    isValid: true,
    evaluations,
    disclaimer:
      'These recommendations are preliminary guidance based on the information provided and configured scheme rules. Final eligibility, documentation, loan terms, and approval are determined by the authorized institution.',
  };
}

