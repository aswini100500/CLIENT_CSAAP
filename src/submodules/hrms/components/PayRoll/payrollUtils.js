export const getUiPresentDays = (value = {}) => {
  // Under the new model, late days and half days are counted as present days in the UI summary.
  // present + late + half days = total attendance days shown in UI.
  const daysPresent = Number(value.daysPresent ?? value.days_present) || 0;
  const lateDays = Number(value.lateDays ?? value.late_days) || 0;
  const halfDays = Number(value.halfDays ?? value.half_days) || 0;

  return daysPresent + lateDays + halfDays;
};

export const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
