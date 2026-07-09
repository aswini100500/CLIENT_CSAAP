import React from "react";

import { Plus, Trash2 } from "lucide-react";
import { EDUCATION_FIELDS } from "./constants";

const EducationTab = ({
  educationList,
  addEducation,
  removeEducation,
  updateEducation,
}) => (
  <div className="app-panel p-6">
    <h2 className="app-heading text-lg font-bold text-(--text-strong) mb-6 border-b border-(--border-soft) pb-3">
      Education Details
    </h2>
    {educationList.map((edu, index) => (
      <div
        key={edu.id}
        className="border border-(--border-soft) rounded-xl p-4 mb-4 hover:shadow-sm transition-all duration-200 bg-(--bg-app)/30"
      >
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-sm text-(--text-strong)">Education {index + 1}</h3>
          {educationList.length > 1 && (
            <button
              type="button"
              onClick={() => removeEducation(edu.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EDUCATION_FIELDS.map((field) => (
            <div key={field.name}>
              <label className="app-label block mb-1.5">
                {field.label}
              </label>
              <input
                type="text"
                value={edu[field.name]}
                onChange={(e) =>
                  updateEducation(edu.id, field.name, e.target.value)
                }
                placeholder={field.placeholder}
                className="app-input w-full"
              />
            </div>
          ))}
          <div>
            <label className="app-label block mb-1.5">
              Graduation Type
            </label>
            <select
              value={edu.graduationType}
              onChange={(e) =>
                updateEducation(edu.id, "graduationType", e.target.value)
              }
              className="app-input w-full"
            >
              <option value="">Select Type</option>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="distance">Distance</option>
            </select>
          </div>
        </div>
      </div>
    ))}
    <button
      type="button"
      onClick={addEducation}
      className="app-btn-secondary inline-flex items-center gap-2 px-4 py-2"
    >
      <Plus size={16} /> Add Education
    </button>
  </div>
);

export default EducationTab;
