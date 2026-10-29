// tests/recommendationEngine.test.js — Unit and integration tests for Recommendation Engine
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEligibility, validateInputs, formatCurrency } from '../src/services/recommendationEngine.js';

test('Feature 1: Input Validation — detects missing and invalid inputs', () => {
  // Empty inputs
  const emptyRes = validateInputs({});
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.purpose);
  assert.ok(emptyRes.errors.cost);
  assert.ok(emptyRes.errors.income);
  assert.ok(emptyRes.errors.state);

  // Negative / zero values
  const invalidRes = validateInputs({
    purpose: 'small-business',
    cost: -5000,
    income: -100,
    state: 'Delhi',
  });
  assert.equal(invalidRes.isValid, false);
  assert.ok(invalidRes.errors.cost);
  assert.ok(invalidRes.errors.income);

  // Valid inputs
  const validRes = validateInputs({
    purpose: 'small-business',
    cost: 100000,
    income: 250000,
    state: 'Delhi',
  });
  assert.equal(validRes.isValid, true);
  assert.equal(Object.keys(validRes.errors).length, 0);
});

test('Feature 1: Income Evaluation — below configured threshold is eligible', () => {
  const res = evaluateEligibility({
    purpose: 'micro-enterprise',
    cost: 100000,
    income: 300000, // Below ₹5 Lakh limit
    state: 'Maharashtra',
  });

  assert.equal(res.isValid, true);
  assert.ok(res.recommended.length > 0);
  const micro = res.recommended.find((s) => s.id === 'micro-finance');
  assert.ok(micro, 'Micro Finance should be recommended');
  assert.ok(micro.matchScore >= 70, `Expected score >= 70, got ${micro.matchScore}`);
  assert.ok(
    micro.matchReasons.some((r) => r.includes('within the ₹5.00 Lakh per annum')),
    'Should have income eligibility match reason'
  );
});

test('Feature 1: Income Evaluation — above configured threshold is disqualified with clear reason', () => {
  const res = evaluateEligibility({
    purpose: 'micro-enterprise',
    cost: 100000,
    income: 650000, // Above ₹5 Lakh threshold
    state: 'Maharashtra',
  });

  assert.equal(res.isValid, true);
  // Micro Finance and Term Loan should fail the concessional threshold
  const microIneligible = res.ineligible.find((s) => s.id === 'micro-finance');
  assert.ok(microIneligible, 'Micro Finance should be in ineligible list');
  assert.ok(
    microIneligible.mismatchReasons.some((r) => r.includes('exceeds the illustrative concessional ceiling')),
    'Must explain why income fails'
  );
});

test('Feature 1: Loan Purposes — Small Business with <= ₹1.40L recommends Micro Finance', () => {
  const res = evaluateEligibility({
    purpose: 'small-business',
    cost: 120000, // Fits under ₹1.40L limit
    income: 200000,
    state: 'Delhi',
  });

  assert.equal(res.isValid, true);
  assert.ok(res.recommended.length > 0);
  assert.equal(res.recommended[0].id, 'micro-finance');
});

test('Feature 1: Project amounts at and above scheme limits', () => {
  // AT limit: ₹1,40,000
  const atLimit = evaluateEligibility({
    purpose: 'small-business',
    cost: 140000,
    income: 200000,
    state: 'Delhi',
  });
  const microAtLimit = atLimit.recommended.find((s) => s.id === 'micro-finance');
  assert.ok(microAtLimit, 'Micro Finance should be valid at ₹1.40L ceiling');

  // ABOVE limit: ₹8,00,000 exceeds ₹1.40L limit
  const aboveLimit = evaluateEligibility({
    purpose: 'small-business',
    cost: 800000,
    income: 300000,
    state: 'Delhi',
  });
  // Micro Finance should be disqualified due to cost ceiling
  const microAbove = aboveLimit.ineligible.find((s) => s.id === 'micro-finance');
  assert.ok(microAbove, 'Micro finance must be ineligible for ₹8L project');
  assert.ok(
    microAbove.mismatchReasons.some((r) => r.includes('exceeds the maximum scheme ceiling')),
    'Must state cost exceeds ceiling'
  );
  // Term Loan should be recommended instead
  const termLoan = aboveLimit.recommended.find((s) => s.id === 'term-loan');
  assert.ok(termLoan, 'Term Loan should be recommended for ₹8L project');
});

test('Feature 1: Education Recommendations — Education purpose strictly directs to Educational Loan', () => {
  const res = evaluateEligibility({
    purpose: 'education',
    cost: 500000,
    income: 250000,
    education: '12th-pass',
    state: 'Karnataka',
  });

  assert.equal(res.isValid, true);
  assert.ok(res.recommended.length > 0);
  assert.equal(res.recommended[0].id, 'education-loan');
  assert.ok(
    res.recommended[0].matchReasons.some((r) => r.includes('educational and professional course')),
    'Should have education match reason'
  );

  // Micro Finance and Term Loan should not finance education
  const micro = res.ineligible.find((s) => s.id === 'micro-finance');
  assert.ok(micro, 'Micro Finance cannot finance tuition');
  assert.ok(micro.mismatchReasons.some((r) => r.includes('does not finance educational expenses')));
});

test('Feature 1: Missing information & Document Checklist is provided', () => {
  const res = evaluateEligibility({
    purpose: 'education',
    cost: 500000,
    income: 250000,
    education: '10th-pass', // Below 12th
    state: 'Tamil Nadu',
  });

  const eduScheme = res.recommended.find((s) => s.id === 'education-loan') || res.alternatives.find((s) => s.id === 'education-loan');
  assert.ok(eduScheme);
  assert.ok(
    eduScheme.missingInformation.some((m) => m.includes('12th standard completion')),
    'Must highlight missing 12th standard completion'
  );
  assert.ok(
    eduScheme.missingInformation.some((m) => m.includes('Caste Certificate')),
    'Must list Caste Certificate verification'
  );
});

test('Feature 1: Currency formatting avoids floating-point precision issues', () => {
  assert.equal(formatCurrency(140000), '₹1,40,000');
  assert.equal(formatCurrency(5000000), '₹50,00,000');
  assert.equal(formatCurrency(12345.6789), '₹12,346');
  assert.equal(formatCurrency(0), '₹0');
  assert.equal(formatCurrency(null), '₹0');
});
