import React, { useState, useEffect } from "react";
import { FaProjectDiagram, FaSearch } from "react-icons/fa";
import operationApi from "../../../api/operation";

const ProjectSetupSelector = ({ currentSetup, onSelect, projects, setups, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (setup) => {
    const project = projects.find(p => p.id === setup.project_id && p.type?.toLowerCase() === setup.project_type?.toLowerCase());
    onSelect(project, setup);
    setShowDropdown(false);
    setSearchTerm(project ? project.name || project.project_name : `Setup #${setup.id}`);
  };

  const filteredSetups = setups.filter(s => {
    const project = projects.find(p => p.id === s.project_id && p.type?.toLowerCase() === s.project_type?.toLowerCase());
    const projectName = (project ? project.name || project.project_name : "").toLowerCase();
    return projectName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <FaProjectDiagram className="text-blue-600" /> Select Project Setup
      </label>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search for a project setup..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm || (currentSetup ? projects.find(p => p.id === currentSetup.project_id && p.type?.toLowerCase() === currentSetup.project_type?.toLowerCase())?.name || "" : "")}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </div>

      {showDropdown && filteredSetups.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredSetups.map((setup) => {
            const project = projects.find(p => p.id === setup.project_id && p.type?.toLowerCase() === setup.project_type?.toLowerCase());
            return (
              <div
                key={setup.id}
                onClick={() => handleSelect(setup)}
                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
              >
                <div className="font-semibold text-gray-800">
                  {project ? project.name || project.project_name : `Setup #${setup.id}`}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {setup.id} • Start: {setup.start_date} • Type: {setup.project_type}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectSetupSelector;
