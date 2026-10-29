import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBeneficiaryProfile } from '../src/services/recommendationEngine.js';

test('Beneficiary Profile Engine: Evaluates Small Business <= 1.4L as Potential Match for Micro Finance', () => {
  const profile = {
    profileId: 'SHK-TEST-001',
    personal: {
      firstName: 'Rahul',
      surname: 'Kamble',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Haveli',
    },
    eligibility: {
      casteCategory: 'SC',
      casteCertificate: 'yes',
      annualIncome: 250000,
      incomeCertificate: 'yes',
      employment: 'self_employed',
      educationStatus: 'graduate',
    },
    documents: {
      casteCertificate: 'available',
      incomeCertificate: 'available',
      aadhaarCard: 'available',
      panCard: 'available',
      projectReport: 'available',
    },
    loanRequirements: {
      purpose: 'small_business',
      estimatedCost: 120000,
      preferredAmount: 100000,
      existingBusiness: 'yes',
      purposeDetails: 'Grocery retail store',
    },
  };

  const result = evaluateBeneficiaryProfile(profile);

  assert.equal(result.isValid, true);
  assert.equal(result.evaluations.length, 3);

  const microFinance = result.evaluations.find((e) => e.schemeId === 'micro-finance');
  assert.ok(microFinance);
  assert.equal(microFinance.status, 'Potential Match');
  assert.equal(microFinance.missingDocs.length, 0);

  // Disclaimer check
  assert.ok(result.disclaimer.includes('preliminary guidance'));
  assert.ok(result.disclaimer.includes('authorized institution'));
});

test('Beneficiary Profile Engine: Evaluates Education Purpose as Potential Match for Education Loan', () => {
  const profile = {
    profileId: 'SHK-TEST-002',
    personal: {
      firstName: 'Priya',
      surname: 'Sonawane',
      state: 'Delhi',
      district: 'Central Delhi',
    },
    eligibility: {
      casteCategory: 'SC',
      casteCertificate: 'yes',
      annualIncome: 300000,
      incomeCertificate: 'yes',
      employment: 'student',
      educationStatus: 'undergraduate',
    },
    documents: {
      casteCertificate: 'available',
      incomeCertificate: 'available',
      aadhaarCard: 'available',
      educationDocs: 'available',
    },
    loanRequirements: {
      purpose: 'education',
      estimatedCost: 1500000,
      preferredAmount: 1200000,
      courseDetails: 'B.Tech Computer Science at Delhi Technological University',
    },
  };

  const result = evaluateBeneficiaryProfile(profile);
  assert.equal(result.isValid, true);

  const eduScheme = result.evaluations.find((e) => e.schemeId === 'education-loan');
  assert.ok(eduScheme);
  assert.equal(eduScheme.status, 'Potential Match');

  const microScheme = result.evaluations.find((e) => e.schemeId === 'micro-finance');
  assert.equal(microScheme.status, 'Does Not Match Configured Rules');
});

test('Beneficiary Profile Engine: Flags missing documents as More Information Required', () => {
  const profile = {
    profileId: 'SHK-TEST-003',
    personal: {
      firstName: 'Amit',
      surname: 'Gaikwad',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
    },
    eligibility: {
      casteCategory: 'SC',
      casteCertificate: 'in_process',
      annualIncome: 400000,
      incomeCertificate: 'not_available',
    },
    documents: {
      casteCertificate: 'not_available',
      incomeCertificate: 'not_available',
      aadhaarCard: 'available',
      projectReport: 'not_available',
    },
    loanRequirements: {
      purpose: 'small_business',
      estimatedCost: 100000,
      preferredAmount: 80000,
    },
  };

  const result = evaluateBeneficiaryProfile(profile);
  assert.equal(result.isValid, true);

  const microFinance = result.evaluations.find((e) => e.schemeId === 'micro-finance');
  assert.ok(microFinance);
  assert.equal(microFinance.status, 'More Information Required');
  assert.ok(microFinance.missingDocs.length > 0);
});

test('Beneficiary Profile Engine: Evaluates non-SC applicant without SC credit qualification as Does Not Match', () => {
  const profile = {
    profileId: 'SHK-TEST-004',
    personal: {
      firstName: 'Suresh',
      surname: 'Patil',
      state: 'Maharashtra',
      district: 'Pune',
    },
    eligibility: {
      casteCategory: 'General',
      casteCertificate: 'not_applicable',
      annualIncome: 250000,
      incomeCertificate: 'yes',
    },
    documents: {
      aadhaarCard: 'available',
    },
    loanRequirements: {
      purpose: 'small_business',
      estimatedCost: 100000,
      preferredAmount: 80000,
    },
  };

  const result = evaluateBeneficiaryProfile(profile);
  assert.equal(result.isValid, true);

  result.evaluations.forEach((e) => {
    assert.equal(e.status, 'Does Not Match Configured Rules');
  });
});
