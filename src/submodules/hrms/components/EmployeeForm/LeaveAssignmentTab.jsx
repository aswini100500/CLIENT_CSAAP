import React from "react";
import { LEAVE_ASSIGNMENT_FIELDS } from "./constants";

const LeaveAssignmentTab = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-8">
      {LEAVE_ASSIGNMENT_FIELDS.map((section, idx) => (
        <div key={idx} className="app-panel p-6">
          <h3 className="app-heading text-lg font-bold text-(--text-strong) mb-2">
            {section.section}
          </h3>
          <p className="text-xs text-(--text-soft) mb-4">
            {section.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.fields.map((field) => (
              <div key={field.name}>
                <label className="app-label block mb-1.5">{field.label}</label>

                {field.type === "checkbox" ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={formData[field.name] || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-(--border-soft) text-(--brand) focus:ring-(--brand-ring) accent-(--brand)"
                    />
                    <span className="ml-2 text-sm text-(--text-soft)">
                      {field.helpText}
                    </span>
                  </div>
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    className="app-input w-full"
                  >
                    <option value="">Select</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    readOnly={field.readOnly}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    placeholder={field.placeholder}
                    className={`app-input w-full ${
                      field.readOnly
                        ? "bg-gray-50 cursor-not-allowed opacity-70"
                        : ""
                    }`}
                  />
                )}

                {field.helpText && !field.readOnly && (
                  <p className="mt-1 text-xs text-(--text-faint)">
                    {field.helpText}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveAssignmentTab;
