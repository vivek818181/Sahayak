// tests/calculatorService.test.js — Tests for Financial Reducing-Balance EMI Calculator
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLoanDetails, formatINR, validateCalculatorInputs } from '../src/services/calculatorService.js';

test('Feature 2: Calculator Input Validation', () => {
  const invalid = validateCalculatorInputs({ principal: -100, rate: 50, tenure: 0 });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.principal);
  assert.ok(invalid.errors.rate);
  assert.ok(invalid.errors.tenure);

  // Regression tests for Infinity, -Infinity, and NaN in validation
  const nonFiniteInputs = [
    { principal: Infinity, rate: 6, tenure: 12 },
    { principal: -Infinity, rate: 6, tenure: 12 },
    { principal: NaN, rate: 6, tenure: 12 },
    { principal: 100000, rate: Infinity, tenure: 12 },
    { principal: 100000, rate: -Infinity, tenure: 12 },
    { principal: 100000, rate: NaN, tenure: 12 },
    { principal: 100000, rate: 6, tenure: Infinity },
    { principal: 100000, rate: 6, tenure: -Infinity },
    { principal: 100000, rate: 6, tenure: NaN },
    { principal: 100000, rate: 6, tenure: 12, moratorium: Infinity },
  ];

  for (const input of nonFiniteInputs) {
    const res = validateCalculatorInputs(input);
    assert.equal(res.isValid, false);
  }

  const valid = validateCalculatorInputs({ principal: 100000, rate: 6, tenure: 36, moratorium: 3 });
  assert.equal(valid.isValid, true);
});

test('Feature 2: Normal Reducing-Balance EMI Calculation', () => {
  // P = 1,00,000, r = 6% p.a., n = 12 months, no moratorium
  // r_monthly = 0.06 / 12 = 0.005
  // EMI = 100000 * 0.005 * (1.005^12) / (1.005^12 - 1) = ~8607
  const res = calculateLoanDetails({
    principal: 100000,
    rate: 6,
    tenure: 12,
    moratorium: 0,
  });

  assert.ok(res);
  assert.equal(res.principal, 100000);
  assert.equal(res.tenureMonths, 12);
  assert.equal(res.emi, 8607);
  assert.ok(res.totalInterest > 0);
  assert.equal(res.totalRepayment, res.principal + res.totalInterest);
  assert.equal(res.schedule.length, 12);

  // Check amortization closure: final balance must reach 0
  const lastInstallment = res.schedule[res.schedule.length - 1];
  assert.equal(lastInstallment.closingBalance, 0);

  // Sum of principal components must equal original principal (100000)
  const totalPrincipalAmortized = res.schedule.reduce((sum, row) => sum + row.principalComponent, 0);
  assert.equal(totalPrincipalAmortized, 100000);
});

test('Feature 2: Zero-Interest Loan Calculation', () => {
  // Rate = 0%: EMI = P / n exactly, total interest = 0
  const res = calculateLoanDetails({
    principal: 120000,
    rate: 0,
    tenure: 12,
    moratorium: 0,
  });

  assert.ok(res);
  assert.equal(res.isZeroInterest, true);
  assert.equal(res.emi, 10000); // 120000 / 12
  assert.equal(res.totalInterest, 0);
  assert.equal(res.totalRepayment, 120000);
  assert.equal(res.schedule.length, 12);

  for (const row of res.schedule) {
    assert.equal(row.interestComponent, 0);
  }
  assert.equal(res.schedule[res.schedule.length - 1].closingBalance, 0);
});

test('Feature 2: Moratorium Interest Treatment — Capitalized Interest', () => {
  // P = 1,00,000, rate = 6%, moratorium = 6 months
  // Monthly rate = 0.5% (0.005)
  // Moratorium interest = 100000 * 0.005 * 6 = 3000
  // Capitalized principal = 1,03,000
  const res = calculateLoanDetails({
    principal: 100000,
    rate: 6,
    tenure: 36,
    moratorium: 6,
    capitalizeMoratoriumInterest: true,
  });

  assert.ok(res);
  assert.equal(res.moratoriumInterest, 3000);
  assert.equal(res.effectivePrincipal, 103000);
  assert.equal(res.tenureMonths, 36); // Moratorium months not counted in repayment installments
  assert.equal(res.schedule.length, 36);
  assert.ok(res.emi > 0);
  assert.equal(res.schedule[res.schedule.length - 1].closingBalance, 0);

  // Capitalized moratorium interest must be included in totalInterest and totalRepayment
  assert.ok(res.totalInterest > res.moratoriumInterest);
  assert.equal(res.totalRepayment, res.principal + res.totalInterest);

  // Scheduled installments must sum up exactly to totalRepayment
  const sumScheduledEmi = res.schedule.reduce((sum, row) => sum + row.emi, 0);
  assert.equal(sumScheduledEmi, res.totalRepayment);

  // Scheduled principal components must sum up exactly to effectivePrincipal
  const sumPrincipalComp = res.schedule.reduce((sum, row) => sum + row.principalComponent, 0);
  assert.equal(sumPrincipalComp, res.effectivePrincipal);
});

test('Feature 2: Moratorium Interest Treatment — Serviced Interest', () => {
  // Serviced interest: interest is paid monthly during moratorium, not added to principal
  const res = calculateLoanDetails({
    principal: 100000,
    rate: 6,
    tenure: 36,
    moratorium: 6,
    capitalizeMoratoriumInterest: false,
  });

  assert.ok(res);
  assert.equal(res.moratoriumInterest, 3000);
  assert.equal(res.effectivePrincipal, 100000); // Principal remains P
  assert.equal(res.tenureMonths, 36);

  // Serviced moratorium interest is included in total interest and total repayment across the loan
  assert.equal(res.totalRepayment, res.principal + res.totalInterest);

  // The n repayment installments plus the serviced moratorium interest must equal totalRepayment
  const sumScheduledEmi = res.schedule.reduce((sum, row) => sum + row.emi, 0);
  assert.equal(sumScheduledEmi + res.moratoriumInterest, res.totalRepayment);

  // Scheduled principal components must sum up to original principal
  const sumPrincipalComp = res.schedule.reduce((sum, row) => sum + row.principalComponent, 0);
  assert.equal(sumPrincipalComp, 100000);
});

test('Feature 2: Schedule Row Integrity and Final Installment Balancing', () => {
  // 5 Lakh loan, 6.5% interest, 60 months tenure (e.g. Term loan preset)
  const res = calculateLoanDetails({
    principal: 500000,
    rate: 6.5,
    tenure: 60,
    moratorium: 6,
    capitalizeMoratoriumInterest: true,
  });

  assert.ok(res);
  assert.equal(res.schedule.length, 60);

  // Every row must be mathematically consistent
  for (let i = 0; i < res.schedule.length; i++) {
    const row = res.schedule[i];
    // opening - principalComponent === closing
    assert.equal(row.openingBalance - row.principalComponent, row.closingBalance);
    // principalComponent + interestComponent === emi
    assert.equal(row.principalComponent + row.interestComponent, row.emi);

    // Consecutive row balance linkage
    if (i > 0) {
      assert.equal(row.openingBalance, res.schedule[i - 1].closingBalance);
    }
  }

  // Final installment closing balance must be 0
  assert.equal(res.schedule[59].closingBalance, 0);

  // Sum of scheduled EMIs matches reported totalRepayment exactly
  const sumEmi = res.schedule.reduce((s, r) => s + r.emi, 0);
  assert.equal(sumEmi, res.totalRepayment);
});

test('Feature 2: Invalid Non-Numeric and Boundary Inputs Return Null', () => {
  assert.equal(calculateLoanDetails({ principal: 'invalid', rate: 6, tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: 'invalid', tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: 6, tenure: 'invalid' }), null);
  assert.equal(calculateLoanDetails({ principal: -5000, rate: 6, tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: 0, rate: 6, tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: -1, tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: 6, tenure: 0 }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: 6, tenure: -12 }), null);

  // Regression tests for non-finite Infinity, -Infinity, and NaN in calculateLoanDetails
  // Principal non-finite
  assert.equal(calculateLoanDetails({ principal: Infinity, rate: 6, tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: -Infinity, rate: 6, tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: NaN, rate: 6, tenure: 12 }), null);

  // Rate non-finite
  assert.equal(calculateLoanDetails({ principal: 100000, rate: Infinity, tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: -Infinity, tenure: 12 }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: NaN, tenure: 12 }), null);

  // Tenure non-finite (must never enter infinite loop)
  assert.equal(calculateLoanDetails({ principal: 100000, rate: 6, tenure: Infinity }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: 6, tenure: -Infinity }), null);
  assert.equal(calculateLoanDetails({ principal: 100000, rate: 6, tenure: NaN }), null);
});

test('Feature 2: Precision and Currency Display without floating-point artifacts', () => {
  assert.equal(formatINR(500000), '₹5,00,000');
  assert.equal(formatINR(12345.6789), '₹12,346');
  assert.equal(formatINR(12345.5, true), '₹12,345.50');
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(null), '₹0');
});

test('Feature 2: Optional Processing Fees Disclosure', () => {
  const res = calculateLoanDetails({
    principal: 200000,
    rate: 7,
    tenure: 24,
    processingFeePercent: 1.0, // 1% = 2000
  });

  assert.ok(res);
  assert.equal(res.fees, 2000);
  assert.equal(res.totalOutlay, res.totalRepayment + 2000);
});
