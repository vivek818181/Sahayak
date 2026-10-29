// services/calculatorService.js — Complete Reducing-Balance Financial EMI Calculator
// Implements standard reducing-balance formula, zero-interest handling, moratorium policies,
// fee disclosures, and precision-safe monthly amortization schedules.

/**
 * Format number to Indian Rupee currency string without floating-point rounding errors.
 */
export function formatINR(val, includeDecimals = false) {
  if (val === undefined || val === null || isNaN(Number(val))) return '₹0';
  const num = Number(val);
  if (includeDecimals) {
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

/**
 * Validates calculator inputs.
 */
export function validateCalculatorInputs(inputs = {}) {
  const errors = {};
  const P = Number(inputs.principal);
  const r = Number(inputs.rate);
  const n = Number(inputs.tenure);
  const m = Number(inputs.moratorium || 0);

  if (inputs.principal === undefined || inputs.principal === '' || !Number.isFinite(P) || P <= 0) {
    errors.principal = 'Principal amount must be greater than zero';
  } else if (P > 10000000) {
    errors.principal = 'Maximum principal limit for calculation is ₹1 Crore';
  }

  if (inputs.rate === undefined || inputs.rate === '' || !Number.isFinite(r) || r < 0 || r > 36) {
    errors.rate = 'Annual interest rate must be between 0% and 36%';
  }

  if (inputs.tenure === undefined || inputs.tenure === '' || !Number.isFinite(n) || n <= 0 || n > 360) {
    errors.tenure = 'Tenure must be between 1 and 360 months';
  }

  if (!Number.isFinite(m) || m < 0 || m > 36) {
    errors.moratorium = 'Moratorium must be between 0 and 36 months';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Core reducing-balance EMI calculation function.
 *
 * @param {Object} params
 * @param {number} params.principal - Original loan amount
 * @param {number} params.rate - Annual interest rate (percentage, e.g. 7 for 7%)
 * @param {number} params.tenure - Repayment tenure in months (excluding moratorium)
 * @param {number} [params.moratorium=0] - Moratorium period in months
 * @param {boolean} [params.capitalizeMoratoriumInterest=true] - Capitalize interest accrued during moratorium
 * @param {number} [params.processingFeePercent=0] - Optional upfront processing fee percentage
 * @param {number} [params.flatFee=0] - Optional upfront flat fee in ₹
 * @returns {Object|null}
 */
export function calculateLoanDetails({
  principal,
  rate,
  tenure,
  moratorium = 0,
  capitalizeMoratoriumInterest = true,
  processingFeePercent = 0,
  flatFee = 0,
}) {
  const P_orig = Math.round(Number(principal));
  const annualRate = Number(rate);
  const n = Math.round(Number(tenure));
  const m = Math.max(0, Math.round(Number.isFinite(Number(moratorium)) ? Number(moratorium) : 0));
  const feePct = Math.max(0, Number.isFinite(Number(processingFeePercent)) ? Number(processingFeePercent) : 0);
  const flat = Math.max(0, Number.isFinite(Number(flatFee)) ? Number(flatFee) : 0);

  if (
    !Number.isFinite(P_orig) || P_orig <= 0 ||
    !Number.isFinite(annualRate) || annualRate < 0 ||
    !Number.isFinite(n) || n <= 0
  ) {
    return null;
  }

  // Monthly interest rate
  const r = (annualRate / 100) / 12;

  // Moratorium interest calculation (simple interest during repayment holiday)
  let moratoriumInterest = 0;
  if (m > 0 && r > 0) {
    moratoriumInterest = Math.round(P_orig * r * m);
  }

  // Effective Principal at the start of repayment
  const effectivePrincipal = (capitalizeMoratoriumInterest && m > 0)
    ? (P_orig + moratoriumInterest)
    : P_orig;

  let emi = 0;
  let totalRepayment = 0;
  let totalInterest = 0;
  const schedule = [];

  // Handle ZERO interest loan separately
  if (r === 0) {
    emi = Math.round(effectivePrincipal / n);
    totalInterest = 0;
    totalRepayment = effectivePrincipal;

    let balance = effectivePrincipal;
    for (let month = 1; month <= n; month++) {
      const openingBalance = balance;
      const isLastMonth = month === n;
      const principalPart = isLastMonth ? balance : Math.min(balance, emi);
      const closingBalance = Math.max(0, balance - principalPart);
      balance = closingBalance;

      schedule.push({
        month,
        openingBalance,
        emi: principalPart,
        principalComponent: principalPart,
        interestComponent: 0,
        closingBalance,
      });
    }
  } else {
    // Standard reducing-balance formula:
    // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const pow = Math.pow(1 + r, n);
    const rawEMI = (effectivePrincipal * r * pow) / (pow - 1);
    emi = Math.round(rawEMI);

    let balance = effectivePrincipal;
    let accumulatedInterest = 0;

    for (let month = 1; month <= n; month++) {
      const openingBalance = balance;
      const interestComponent = Math.round(openingBalance * r);
      let principalComponent;
      let monthEmi;

      if (month === n) {
        principalComponent = openingBalance;
        monthEmi = principalComponent + interestComponent;
      } else {
        principalComponent = emi - interestComponent;
        if (principalComponent > openingBalance) {
          principalComponent = openingBalance;
        }
        monthEmi = principalComponent + interestComponent;
      }

      const closingBalance = Math.max(0, openingBalance - principalComponent);
      balance = closingBalance;
      accumulatedInterest += interestComponent;

      schedule.push({
        month,
        openingBalance,
        emi: monthEmi,
        principalComponent,
        interestComponent,
        closingBalance,
      });
    }

    // Both capitalized and serviced moratorium policies represent interest charged across the full credit lifecycle
    totalInterest = accumulatedInterest + moratoriumInterest;
    totalRepayment = P_orig + totalInterest;
  }

  // Optional Fees
  const calculatedFee = Math.round((P_orig * (feePct / 100)) + flat);
  const totalOutlay = totalRepayment + calculatedFee;

  // Proportions for visual chart (Principal vs Interest)
  const principalSharePercent = totalRepayment > 0
    ? Math.round((P_orig / totalRepayment) * 100)
    : 100;
  const interestSharePercent = Math.max(0, 100 - principalSharePercent);

  return {
    principal: P_orig,
    effectivePrincipal,
    annualRate,
    tenureMonths: n,
    moratoriumMonths: m,
    moratoriumInterest,
    capitalizeMoratoriumInterest,
    emi,
    totalInterest,
    totalRepayment,
    fees: calculatedFee,
    totalOutlay,
    principalSharePercent,
    interestSharePercent,
    schedule,
    isZeroInterest: r === 0,
  };
}
