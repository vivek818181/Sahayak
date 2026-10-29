import test from 'node:test';
import assert from 'node:assert/strict';
import { STATES_AND_DISTRICTS } from '../src/data/locations.js';
import { evaluateBeneficiaryProfile } from '../src/services/recommendationEngine.js';

test('Location Verification: Thane is in Maharashtra district list with administrative talukas', () => {
  const maharashtra = STATES_AND_DISTRICTS.find((s) => s.state === 'Maharashtra');
  assert.ok(maharashtra, 'Maharashtra must exist in location configuration');

  const thane = maharashtra.districts.find((d) => d.name === 'Thane');
  assert.ok(thane, 'Thane district must be present in Maharashtra');

  // Verify talukas include Thane, Kalyan, Murbad
  assert.ok(thane.talukas.includes('Thane'), 'Thane taluka must be present');
  assert.ok(thane.talukas.includes('Kalyan'), 'Kalyan taluka must be present');
  assert.ok(thane.talukas.includes('Murbad'), 'Murbad taluka must be present');

  // Verify other core Maharashtra districts remain intact
  const districtNames = maharashtra.districts.map((d) => d.name);
  assert.ok(districtNames.includes('Pune'), 'Pune must be retained');
  assert.ok(districtNames.includes('Mumbai'), 'Mumbai must be retained');
  assert.ok(districtNames.includes('Nagpur'), 'Nagpur must be retained');
  assert.ok(districtNames.includes('Nashik'), 'Nashik must be retained');
  assert.ok(districtNames.includes('Chhatrapati Sambhajinagar'), 'Chhatrapati Sambhajinagar must be retained');
  assert.ok(districtNames.includes('Solapur'), 'Solapur must be retained');
  assert.ok(districtNames.includes('Kolhapur'), 'Kolhapur must be retained');
  assert.ok(districtNames.includes('Amravati'), 'Amravati must be retained');
});

test('Recommendation Engine: Matching profile returns Potential Match with reasons and criteria', () => {
  const matchingProfile = {
    personal: {
      firstName: 'Ramesh',
      surname: 'Kamble',
      state: 'Maharashtra',
      district: 'Thane',
      taluka: 'Kalyan',
      preferredLanguage: 'en',
    },
    eligibility: {
      casteCategory: 'SC',
      hasCasteCert: true,
      annualIncome: 240000,
      hasIncomeCert: true,
      occupation: 'micro-business',
      education: '12th-pass',
    },
    documents: {
      casteCert: 'available',
      incomeCert: 'available',
      aadhaar: 'available',
      pan: 'available',
      educationDocs: 'not-available',
      projectDocs: 'not-available',
      additionalDocs: 'not-available',
    },
    loanRequirements: {
      purpose: 'small-business',
      cost: 100000,
      preferredAmount: 80000,
      alreadyInBusiness: false,
    },
    consentSaved: true,
  };

  const result = evaluateBeneficiaryProfile(matchingProfile);
  assert.equal(result.isValid, true);
  assert.ok(Array.isArray(result.evaluations));

  const microScheme = result.evaluations.find((e) => e.id === 'micro-finance');
  assert.ok(microScheme, 'Micro finance evaluation should exist');
  assert.equal(microScheme.status, 'Potential Match');
  assert.ok(microScheme.matchReasons.length > 0);
  assert.ok(microScheme.maxAmountLabel);
  assert.ok(microScheme.verificationStatus);
});

test('Recommendation Engine: Ineligible profile (high income) returns Does Not Match', () => {
  const ineligibleProfile = {
    personal: {
      firstName: 'Pooja',
      surname: 'More',
      state: 'Maharashtra',
      district: 'Thane',
      taluka: 'Murbad',
    },
    eligibility: {
      casteCategory: 'SC',
      hasCasteCert: true,
      annualIncome: 900000, // Exceeds 5.00 Lakh ceiling
      hasIncomeCert: true,
    },
    documents: {
      casteCert: 'available',
      incomeCert: 'available',
      aadhaar: 'available',
      pan: 'available',
    },
    loanRequirements: {
      purpose: 'small-business',
      cost: 100000,
    },
    consentSaved: true,
  };

  const result = evaluateBeneficiaryProfile(ineligibleProfile);
  assert.equal(result.isValid, true);

  const microScheme = result.evaluations.find((e) => e.id === 'micro-finance');
  assert.equal(microScheme.status, 'Does Not Match Configured Rules');
  assert.ok(microScheme.mismatchReasons.length > 0);
});

test('Recommendation Engine: Missing optional information handles gracefully with More Information Required', () => {
  const missingInfoProfile = {
    personal: {
      firstName: 'Sunil',
      surname: 'Shinde',
      state: 'Maharashtra',
      district: 'Thane',
      taluka: 'Thane',
    },
    eligibility: {
      casteCategory: 'SC',
      hasCasteCert: false, // Pending caste cert
      annualIncome: 200000,
      hasIncomeCert: false, // Pending income cert
    },
    documents: {
      casteCert: 'not-available',
      incomeCert: 'not-available',
      aadhaar: 'available',
      pan: 'not-available',
    },
    loanRequirements: {
      purpose: 'small-business',
      cost: 100000,
    },
    consentSaved: true,
  };

  const result = evaluateBeneficiaryProfile(missingInfoProfile);
  assert.equal(result.isValid, true);

  const microScheme = result.evaluations.find((e) => e.id === 'micro-finance');
  assert.equal(microScheme.status, 'More Information Required');
  assert.ok(microScheme.missingDocuments.length > 0);
});

