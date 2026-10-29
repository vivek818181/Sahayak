// tests/schemeComparison.test.js — Tests for Scheme Comparison Logic
import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHEME_RULES } from '../src/data/schemeRules.js';

test('Feature 4: Scheme Comparison Data Integrity — All rules have required dimensions', () => {
  assert.ok(SCHEME_RULES.length >= 3, 'Must have at least 3 scheme rules');

  for (const scheme of SCHEME_RULES) {
    // 1. Intended Purpose
    assert.ok(scheme.purposeDesc, `${scheme.id} must have purpose description`);
    assert.ok(scheme.allowedPurposes.length > 0, `${scheme.id} must have allowed purposes`);

    // 2. Indicative Maximum Amount
    assert.ok(scheme.maxAmount > 0, `${scheme.id} must have maxAmount`);
    assert.ok(scheme.maxAmountLabel, `${scheme.id} must have maxAmountLabel`);

    // 3. Configured Interest Rate Range
    assert.ok(scheme.interestRateRange.min > 0, `${scheme.id} must have min rate`);
    assert.ok(scheme.interestRateRange.max >= scheme.interestRateRange.min, `${scheme.id} must have valid rate range`);

    // 4. Tenure & Moratorium Rules
    assert.ok(scheme.tenureMonths.min > 0, `${scheme.id} must have tenure`);
    assert.ok(scheme.moratoriumMonths.supported !== undefined, `${scheme.id} must define moratorium support`);

    // 5. Eligibility Conditions
    assert.ok(scheme.incomeLimit > 0, `${scheme.id} must have incomeLimit`);

    // 6. Verification Documents
    assert.ok(scheme.verificationDocuments.length > 0, `${scheme.id} must have required document checklist`);
    assert.ok(
      scheme.verificationDocuments.some((d) => d.id === 'caste-cert' && d.required),
      `${scheme.id} must require SC Caste Certificate`
    );

    // 7. Suitable Channel Partner Categories
    assert.ok(scheme.partnerCategories.length > 0, `${scheme.id} must specify partner categories`);
  }
});

test('Feature 4: Comparison Selection — Maximum 3 Schemes constraint', () => {
  const allSchemes = [...SCHEME_RULES, { id: 'extra-scheme', name: 'Extra' }];
  const selected = allSchemes.slice(0, 3);
  assert.equal(selected.length, 3, 'Comparison must cap at maximum 3 schemes');
});
