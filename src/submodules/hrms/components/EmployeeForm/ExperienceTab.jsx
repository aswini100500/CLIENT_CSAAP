import React from "react";

import { Plus, Trash2 } from "lucide-react";
import { EXPERIENCE_FIELDS } from "./constants";

const ExperienceTab = ({
  experienceList,
  addExperience,
  removeExperience,
  updateExperience,
}) => (
  <div className="app-panel p-6">
    <h2 className="app-heading text-lg font-bold text-(--text-strong) mb-6 border-b border-(--border-soft) pb-3">
      Experience Details
    </h2>
    {experienceList.map((exp, index) => (
      <div
        key={exp.id}
        className="border border-(--border-soft) rounded-xl p-4 mb-4 hover:shadow-sm transition-all duration-200 bg-(--bg-app)/30"
      >
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-sm text-(--text-strong)">Experience {index + 1}</h3>
          {experienceList.length > 1 && (
            <button
              type="button"
              onClick={() => removeExperience(exp.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPERIENCE_FIELDS.map((field) => (
            <div key={field.name}>
              <label className="app-label block mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                value={exp[field.name]}
                onChange={(e) =>
                  updateExperience(exp.id, field.name, e.target.value)
                }
                placeholder={field.placeholder}
                className="app-input w-full"
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="app-label block mb-1.5">
            Description
          </label>
          <textarea
            value={exp.description}
            onChange={(e) =>
              updateExperience(exp.id, "description", e.target.value)
            }
            className="app-input w-full h-24"
            placeholder="e.g. Developed scalable backend APIs using Node.js and led a team of 4 engineers..."
          ></textarea>
        </div>
      </div>
    ))}
    <button
      type="button"
      onClick={addExperience}
      className="app-btn-secondary inline-flex items-center gap-2 px-4 py-2"
    >
      <Plus size={16} /> Add Experience
    </button>
  </div>
);

export default ExperienceTab;
