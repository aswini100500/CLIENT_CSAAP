import React from "react";

import { PERSONAL_DETAILS_FIELDS } from "./constants";

const PersonalDetailsTab = ({ formData, handleInputChange }) => (
  <div className="app-panel p-6">
    <h2 className="app-heading text-lg font-bold text-(--text-strong) mb-6 border-b border-(--border-soft) pb-3">
      Personal Details
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {PERSONAL_DETAILS_FIELDS.map((field, index) => (
        <div key={index}>
          <label className="app-label block mb-1.5">
            {field.label}
          </label>
          {field.options ? (
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              className="app-input w-full"
            >
              {field.options.map((option, i) => (
                <option
                  key={i}
                  value={option.toLowerCase() === "select status" ? "" : option}
                >
                  {option}
                </option>
              ))}
            </select>
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
  </div>
);

export default PersonalDetailsTab;
