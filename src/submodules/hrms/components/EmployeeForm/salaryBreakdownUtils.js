import React from "react";

export const DEFAULT_SALARY_BREAKDOWN_POLICY = {
  basic_rate: 0.5,
  hra_rate: 0.5,
  ta_rate: 0.1,
  da_rate: 0.1,
  epf_employee_rate: 0.12,
  epf_employer_rate: 0.12,
  epf_statutory_limit: 15000,
  esi_employee_rate: 0.0075,
  esi_employer_rate: 0.0325,
  esi_gross_limit: 21000,
  enable_hra: true,
  enable_ta: true,
  enable_da: true,
  enable_epf: true,
  enable_esi: true,
  enable_pt: false,
  enable_lwf: false,
  rounding_tolerance: 1,
};

const BOOLEAN_FIELDS = new Set([
  "enable_hra",
  "enable_ta",
  "enable_da",
  "enable_epf",
  "enable_esi",
  "enable_pt",
  "enable_lwf",
]);

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return Boolean(value);
};

const toNumber = (value, fallback) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const normalizeSalaryBreakdownPolicy = (policy = {}) =>
  Object.entries(DEFAULT_SALARY_BREAKDOWN_POLICY).reduce(
    (acc, [key, fallback]) => {
      acc[key] = BOOLEAN_FIELDS.has(key)
        ? toBoolean(policy[key], fallback)
        : toNumber(policy[key], fallback);
      return acc;
    },
    {},
  );

export const deriveSalaryToggles = (policy = {}) => {
  const normalizedPolicy = normalizeSalaryBreakdownPolicy(policy);

  return {
    hra: normalizedPolicy.enable_hra,
    ta: normalizedPolicy.enable_ta,
    da: normalizedPolicy.enable_da,
    epf: normalizedPolicy.enable_epf,
    esi: normalizedPolicy.enable_esi,
    pt: normalizedPolicy.enable_pt,
    lwf: normalizedPolicy.enable_lwf,
  };
};

export const deriveSalaryTogglesFromData = (policy = {}) =>
  deriveSalaryToggles(policy);

export const recalculateSalaryBreakdown = (
  data,
  toggles,
  otherComponents = [],
  policy = {},
) => {
  const normalizedPolicy = normalizeSalaryBreakdownPolicy(policy);
  const ctc = parseFloat(data.ctc) || 0;
  const variablePay = parseFloat(data.variable_pay_annual) || 0;

  if (ctc === 0) {
    return {
      basic: "",
      hra: "",
      ta: "",
      da: "",
      special_allowance: "",
      epf: "",
      epf_employer: "",
      esi: "",
      esi_employer: "",
      gross_anual: "",
      _special_overflow: 0,
    };
  }

  const annualFixedPay = ctc - variablePay;
  const monthlyFixed = annualFixedPay / 12;

  /**
   * BACK-CALCULATION LOGIC:
   * We need to find the Gross Salary (G) such that:
   * G + Employer_EPF + Employer_ESI = Monthly_Fixed_CTC
   *
   * Where:
   * Basic (B) = G * basic_rate
   * Employer_EPF = min(B * 0.12, 1800)
   * Employer_ESI = G <= 21000 ? G * 0.0325 : 0
   */

  const epfRateEffective =
    normalizedPolicy.basic_rate * normalizedPolicy.epf_employer_rate;
  const esiRate = normalizedPolicy.esi_employer_rate;
  const epfCap =
    normalizedPolicy.epf_statutory_limit * normalizedPolicy.epf_employer_rate;

  let grossMonthly = 0;

  // Step 1: Trial for Case 1 (ESI Applicable, EPF Percentage-based)
  // G = Fixed / (1 + (BasicRate * EPF_er_Rate) + ESI_er_Rate)
  const g1 =
    monthlyFixed /
    (1 + (toggles.epf ? epfRateEffective : 0) + (toggles.esi ? esiRate : 0));
  const b1 = g1 * normalizedPolicy.basic_rate;

  if (
    toggles.esi &&
    g1 <= normalizedPolicy.esi_gross_limit &&
    (!toggles.epf || b1 <= normalizedPolicy.epf_statutory_limit)
  ) {
    grossMonthly = g1;
  } else {
    // Step 2: Trial for Case 2 (ESI Applicable, EPF Capped)
    // G = (Fixed - EPF_Cap) / (1 + ESI_er_Rate)
    const g2 =
      (monthlyFixed - (toggles.epf ? epfCap : 0)) /
      (1 + (toggles.esi ? esiRate : 0));
    const b2 = g2 * normalizedPolicy.basic_rate;

    if (
      toggles.esi &&
      g2 <= normalizedPolicy.esi_gross_limit &&
      toggles.epf &&
      b2 > normalizedPolicy.epf_statutory_limit
    ) {
      grossMonthly = g2;
    } else {
      // Step 3: Trial for Case 3 (ESI Not Applicable, EPF Percentage-based)
      // G = Fixed / (1 + (BasicRate * EPF_er_Rate))
      const g3 = monthlyFixed / (1 + (toggles.epf ? epfRateEffective : 0));
      const b3 = g3 * normalizedPolicy.basic_rate;

      if (
        (!toggles.esi || g3 > normalizedPolicy.esi_gross_limit) &&
        (!toggles.epf || b3 <= normalizedPolicy.epf_statutory_limit)
      ) {
        grossMonthly = g3;
      } else {
        // Step 4: Case 4 (ESI Not Applicable, EPF Capped)
        // G = Fixed - EPF_Cap
        grossMonthly = monthlyFixed - (toggles.epf ? epfCap : 0);
      }
    }
  }

  // Now derived all components from the back-calculated Gross
  const basicMonthly = grossMonthly * normalizedPolicy.basic_rate;

  const epfEmployerMonthly = toggles.epf
    ? Math.min(basicMonthly * normalizedPolicy.epf_employer_rate, epfCap)
    : 0;

  const esiEmployerMonthly =
    toggles.esi && grossMonthly <= normalizedPolicy.esi_gross_limit
      ? grossMonthly * normalizedPolicy.esi_employer_rate
      : 0;

  const totalOtherEarningsAnnual = otherComponents
    .filter((component) => component.type === "earning")
    .reduce((sum, component) => sum + (parseFloat(component.amount) || 0), 0);
  const totalOtherEarningsMonthly = totalOtherEarningsAnnual / 12;

  const hraMonthly = toggles.hra ? basicMonthly * normalizedPolicy.hra_rate : 0;
  const taMonthly = toggles.ta ? basicMonthly * normalizedPolicy.ta_rate : 0;
  const daMonthly = toggles.da ? basicMonthly * normalizedPolicy.da_rate : 0;
  const specialMonthly =
    grossMonthly -
    basicMonthly -
    hraMonthly -
    taMonthly -
    daMonthly -
    totalOtherEarningsMonthly;

  const epfEmployeeMonthly = toggles.epf
    ? Math.min(
        basicMonthly * normalizedPolicy.epf_employee_rate,
        normalizedPolicy.epf_statutory_limit *
          normalizedPolicy.epf_employee_rate,
      )
    : 0;
  const esiEmployeeMonthly =
    toggles.esi && grossMonthly <= normalizedPolicy.esi_gross_limit
      ? grossMonthly * normalizedPolicy.esi_employee_rate
      : 0;

  return {
    basic: (basicMonthly * 12).toFixed(2),
    hra: (hraMonthly * 12).toFixed(2),
    ta: (taMonthly * 12).toFixed(2),
    da: (daMonthly * 12).toFixed(2),
    special_allowance: Math.max(0, specialMonthly * 12).toFixed(2),
    epf: (epfEmployeeMonthly * 12).toFixed(2),
    epf_employer: (epfEmployerMonthly * 12).toFixed(2),
    esi: (esiEmployeeMonthly * 12).toFixed(2),
    esi_employer: (esiEmployerMonthly * 12).toFixed(2),
    gross_anual: (grossMonthly * 12).toFixed(2),
    _special_overflow: specialMonthly < 0 ? Math.abs(specialMonthly * 12) : 0,
  };
};

export const getSalaryPolicySummary = (policy = {}) => {
  const normalizedPolicy = normalizeSalaryBreakdownPolicy(policy);

  return {
    basicRatePercent: normalizedPolicy.basic_rate * 100,
    hraRatePercent: normalizedPolicy.hra_rate * 100,
    taRatePercent: normalizedPolicy.ta_rate * 100,
    daRatePercent: normalizedPolicy.da_rate * 100,
    epfEmployeeRatePercent: normalizedPolicy.epf_employee_rate * 100,
    epfEmployerRatePercent: normalizedPolicy.epf_employer_rate * 100,
    esiEmployeeRatePercent: normalizedPolicy.esi_employee_rate * 100,
    esiEmployerRatePercent: normalizedPolicy.esi_employer_rate * 100,
    epfStatutoryLimit: normalizedPolicy.epf_statutory_limit,
    esiGrossLimit: normalizedPolicy.esi_gross_limit,
    roundingTolerance: normalizedPolicy.rounding_tolerance,
  };
};
