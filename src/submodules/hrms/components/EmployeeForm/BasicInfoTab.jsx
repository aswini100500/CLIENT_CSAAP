import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Plus,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { BANK_DETAILS_FIELDS, BASIC_INFO_FIELDS, SALARY_FIELDS, COUNTRY_CODES } from "./constants";
import React from "react";

const AUTO_CALC_FIELDS = [
  "basic",
  "hra",
  "ta",
  "da",
  "epf",
  "epf_employer",
  "esi",
  "esi_employer",
  "special_allowance",
  "gross_anual",
];

const BasicInfoTab = ({
  formData,
  isEditMode = false,
  handleInputChange,
  showPassword,
  setShowPassword,
  otherComponents,
  addOtherComponent,
  updateOtherComponent,
  removeOtherComponent,
  getSalaryWarnings,
  getSalaryErrors,
  salaryToggles,
  isSalaryPolicyLoading,
  onOpenSalaryPolicyConfig,
  autoCalculate,
  setAutoCalculate,
  readOnlyFields,
  setReadOnlyFields,
  salaryEffectiveDateExists,
  departmentsList = [],
  designationsList = [],
}) => {
  // Filter designations based on selected department
  const getFilteredDesignations = () => {
    if (!formData.department) return [];
    
    // Assuming designationsList is an array of objects with department and designation properties
    // Adjust this based on your actual data structure
    if (designationsList.length > 0 && typeof designationsList[0] === 'object') {
      return designationsList
        .filter(item => item.department === formData.department)
        .map(item => item.designation);
    }
    
    // If designationsList is just an array of strings, return as is
    return designationsList;
  };

  const filteredDesignations = getFilteredDesignations();

  return (
    <div className="app-panel p-6">
      <h2 className="app-heading text-lg font-bold text-(--text-strong) mb-6 border-b border-(--border-soft) pb-3">
        Basic Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BASIC_INFO_FIELDS.map((field, i) => {
          if (field.name === "department") {
            field.options = departmentsList;
          }
          
          // Handle designation field - update options based on department
          if (field.name === "postApplied") {
            field.options = filteredDesignations;
          }

          // Skip rendering designation field if no department is selected
          if (field.name === "postApplied" && !formData.department) {
            return null;
          }

          if (field.name === "phone") {
            return (
              <div key={i}>
                <label className="app-label block mb-1.5">
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex gap-2">
                  <div className="relative w-1/3 min-w-25">
                    <select
                      name="phoneCode"
                      value={formData.phoneCode || "+91"}
                      onChange={handleInputChange}
                      required={field.required}
                      className="app-input w-full appearance-none pr-8 text-sm cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.dial_code}>
                          {c.flag} {c.dial_code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={14}
                    />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required={field.required}
                    pattern="[0-9]{7,15}"
                    title="Please enter a valid phone number"
                    placeholder={field.placeholder}
                    className="app-input w-2/3 flex-1"
                  />
                </div>
              </div>
            );
          }

          return (
            <div key={i}>
              <label className="app-label block mb-1.5">
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "select" ? (
                <div className="relative">
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    required={field.required}
                    disabled={field.name === "postApplied" && !formData.department}
                    className={`app-input w-full appearance-none ${
                      !formData[field.name] ? "text-gray-400" : "text-gray-900"
                    } ${
                      field.name === "postApplied" && !formData.department
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="" className="text-gray-400">
                      {field.name === "postApplied" && !formData.department
                        ? "Please select department first"
                        : `Select ${field.label}`}
                    </option>
                    {field.options.map((option, idx) => (
                      <option key={idx} value={option} className="text-gray-900">
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={16}
                  />
                </div>
              ) : field.type === "checkbox" ? (
                <div className="h-10.5 px-4 border border-(--border-soft) rounded-xl flex items-center bg-white">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={Boolean(formData[field.name])}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-(--border-soft) text-(--brand) focus:ring-(--brand-ring) accent-(--brand)"
                    />
                    <span className="text-sm text-(--text-body)">Allow overtime</span>
                  </label>
                </div>
              ) : field.type === "time" ? (
                <div
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    const inp =
                      e.currentTarget.querySelector('input[type="time"]');
                    if (inp?.showPicker) inp.showPicker();
                    else inp?.focus();
                  }}
                >
                  <input
                    type="time"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    required={field.required}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    tabIndex={-1}
                    style={{ zIndex: -1 }}
                  />
                  <div
                    className={`app-input w-full pr-10 transition-colors flex items-center ${
                      formData[field.name] ? "text-gray-900" : "text-gray-400/80"
                    }`}
                  >
                    {formData[field.name]
                      ? new Date(
                          `1970-01-01T${formData[field.name]}`,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : field.placeholder || "Set time"}
                  </div>
                  {formData[field.name] ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInputChange({
                          target: { name: field.name, value: "" },
                        });
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <Clock
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={16}
                    />
                  )}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type={
                      field.name === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : field.type || "text"
                    }
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="app-input w-full pr-10"
                  />

                {field.name === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>

      <div className="mt-10 mb-4 border-b border-(--border-soft) pb-3">
        <h2 className="app-heading text-lg font-bold text-(--text-strong)">Bank Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BANK_DETAILS_FIELDS.map((field, i) => (
          <div key={`bank-${i}`}>
            <label className="app-label block mb-1.5">
              {field.label}
            </label>

            {field.type === "select" ? (
              <div className="relative">
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  className={`app-input w-full appearance-none ${
                    !formData[field.name] ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  <option value="" className="text-gray-400">
                    Select {field.label}
                  </option>
                  {field.options.map((option) => (
                    <option key={option} value={option} className="text-gray-900">
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>
            ) : (
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className="app-input w-full"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 mb-4 border-b border-(--border-soft) pb-3">
        <h2 className="app-heading text-lg font-bold text-(--text-strong)">Salary Breakdown</h2>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-5 mb-8 p-4 bg-(--bg-subtle)/35 rounded-xl border border-(--border-soft)">
        <div className="flex flex-wrap items-center gap-5">
          {autoCalculate && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={readOnlyFields}
                onChange={(e) => setReadOnlyFields(e.target.checked)}
                className="h-4 w-4 text-(--brand) border-(--border-soft) rounded focus:ring-(--brand-ring) accent-(--brand)"
              />
              <span className="text-sm font-semibold text-(--text-soft)">Read Only</span>
            </label>
          )}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoCalculate}
              onChange={(e) => {
                setAutoCalculate(e.target.checked);
                if (!e.target.checked) setReadOnlyFields(false);
              }}
              className="h-4 w-4 text-(--brand) border-(--border-soft) rounded focus:ring-(--brand-ring) accent-(--brand)"
            />
            <span className="text-sm font-semibold text-(--text-soft)">
              Auto Calculate
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={onOpenSalaryPolicyConfig}
          className="app-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
        >
          <Settings2 size={16} />
          {isSalaryPolicyLoading ? "Loading Policy..." : "Salary Policy"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SALARY_FIELDS.map((field, i) => {
          if (field.toggle && !salaryToggles[field.toggle]) return null;

          const isCalcField = AUTO_CALC_FIELDS.includes(field.name);
          const isManual = field.name === "pt" || field.name === "lwf";
          const isReadOnly =
            (autoCalculate && readOnlyFields && isCalcField && !isManual) ||
            (isEditMode &&
              field.name === "effective_from" &&
              salaryEffectiveDateExists);

          return (
            <div key={`salary-${i}`}>
              <label className="app-label block mb-1.5">
                {field.label}{" "}
                {[
                  "ctc",
                  "basic",
                  ...(isEditMode && formData.effective_from
                    ? []
                    : ["effective_from"]),
                ].includes(field.name) && <span className="text-red-500">*</span>}
                {autoCalculate && isCalcField && !isManual && (
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    (auto)
                  </span>
                )}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                onWheel={(e) => e.target.blur()}
                readOnly={isReadOnly}
                tabIndex={isReadOnly ? -1 : undefined}
                required={[
                  "ctc",
                  "basic",
                  ...(isEditMode && formData.effective_from
                    ? []
                    : ["effective_from"]),
                ].includes(field.name)}
                placeholder={field.placeholder}
                className={`app-input w-full transition-colors ${
                  isReadOnly
                    ? "bg-gray-100 text-gray-600 cursor-not-allowed opacity-70"
                    : ""
                }`}
              />
            </div>
          );
        })}

        <div>
          <label className="app-label block mb-1.5">
            Regime
          </label>
          <div className="relative">
            <select
              name="tax_regime"
              value={formData.tax_regime}
              onChange={handleInputChange}
              className="app-input w-full appearance-none"
            >
              <option value="NEW">New Regime</option>
              <option value="OLD">Old Regime</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>
      </div>

      <h3 className="app-heading text-lg font-bold text-(--text-strong) mt-10 mb-6 border-b border-(--border-soft) pb-3">
        Other Components
      </h3>
      {otherComponents.map((comp, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-5 p-4 bg-white rounded-xl border border-(--border-soft) hover:shadow-sm transition-all duration-200"
        >
          <div>
            <label className="app-label block mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={comp.name}
              onChange={(e) =>
                updateOtherComponent(index, "name", e.target.value)
              }
              placeholder="e.g. Fuel Allowance"
              className="app-input w-full"
            />
          </div>
          <div>
            <label className="app-label block mb-1.5">
              Amount
            </label>
            <input
              type="number"
              value={comp.amount}
              onChange={(e) =>
                updateOtherComponent(index, "amount", e.target.value)
              }
              onWheel={(e) => e.target.blur()}
              placeholder="e.g. 5000"
              className="app-input w-full"
            />
          </div>
          <div>
            <label className="app-label block mb-1.5">
              Type
            </label>
            <div className="relative">
              <select
                value={comp.type}
                onChange={(e) =>
                  updateOtherComponent(index, "type", e.target.value)
                }
                className="app-input w-full appearance-none"
              >
                <option value="earning">Earning</option>
                <option value="deduction">Deduction</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={comp.is_taxable}
              onChange={(e) =>
                updateOtherComponent(index, "is_taxable", e.target.checked)
              }
              className="h-4 w-4 text-(--brand) border-(--border-soft) rounded focus:ring-(--brand-ring) accent-(--brand)"
            />
            <label className="app-label mb-0">
              Taxable
            </label>
          </div>
          <div className="flex justify-end mb-1">
            <button
              type="button"
              onClick={() => removeOtherComponent(index)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addOtherComponent}
        className="app-btn-secondary inline-flex items-center gap-2 px-4 py-2"
      >
        <Plus size={16} /> Add Component
      </button>

      {getSalaryErrors().length > 0 && (
        <div className="mt-4 p-4 bg-rose-50/50 border border-rose-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-600" />
            <span className="text-sm font-semibold text-red-800">
              Salary Calculation Error
            </span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {getSalaryErrors().map((err, i) => (
              <li key={i} className="text-sm text-red-700">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {getSalaryWarnings().length > 0 && (
        <div className="mt-4 p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">
              Salary values differ from standard calculation
            </span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {getSalaryWarnings().map((w, i) => (
              <li key={i} className="text-sm text-amber-700">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BasicInfoTab;