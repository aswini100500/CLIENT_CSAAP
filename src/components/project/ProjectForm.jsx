import React, { useState } from "react";
import { PROJECT_TYPES } from "../ABC/shared/Constants";
import { FaTimes, FaHome, FaBuilding } from "react-icons/fa";
import PlottingProject from "./PlottingProject";
import DuplexTriplexProject from "./DuplexTriplexProject";
import ApartmentProject from "./ApartmentProject";
import CommercialProject from "./CommercialProject";

const ProjectForm = ({ projects, setProjects, onClose }) => {
  const [projectType, setProjectType] = useState("");
  const [showCustomizeSelect, setShowCustomizeSelect] = useState(false);

  const handleProjectTypeChange = (e) => {
    const newType = e.target.value;
    setProjectType(newType);
    setShowCustomizeSelect(newType === PROJECT_TYPES.CUSTOM);
  };

  const handleCustomizeTypeSelect = (selectedType) => {
    setProjectType(selectedType);
    setShowCustomizeSelect(false);
  };

  const renderProjectForm = () => {
    if (showCustomizeSelect) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              Custom Project Setup
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition duration-150 flex items-center text-sm font-medium"
            >
              <FaTimes className="mr-1" />
              Cancel
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-6 text-indigo-700">
              Select Type to Customize
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["plotting", "duplex", "triplex", "apartment", "commercial"].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleCustomizeTypeSelect(type)}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left hover:bg-blue-50"
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                        <FaBuilding className="text-indigo-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 capitalize">
                        {type}
                      </h4>
                    </div>

                    {type === "duplex" && (
                      <p className="text-sm text-gray-600">
                        Fixed 2 floors (Ground + 1)
                      </p>
                    )}
                    {type === "triplex" && (
                      <p className="text-sm text-gray-600">
                        Fixed 3 floors (Ground + 1 + 2)
                      </p>
                    )}
                    {type === "apartment" && (
                      <p className="text-sm text-gray-600">
                        Multi-floor with customizable units
                      </p>
                    )}
                    {type === "plotting" && (
                      <p className="text-sm text-gray-600">
                        Land plots with individual specifications
                      </p>
                    )}
                    {type === "commercial" && (
                      <p className="text-sm text-gray-600">
                        Office spaces, shops, and commercial units
                      </p>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      );
    }

    switch (projectType) {
      case PROJECT_TYPES.PLOTTING:
        return (
          <PlottingProject
            projects={projects}
            setProjects={setProjects}
            onClose={onClose}
          />
        );

      case PROJECT_TYPES.DUPLEX:
      case PROJECT_TYPES.TRIPLEX:
        return (
          <DuplexTriplexProject
            projectType={projectType}
            projects={projects}
            setProjects={setProjects}
            onClose={onClose}
          />
        );

      case PROJECT_TYPES.APARTMENT:
        return (
          <ApartmentProject
            projects={projects}
            setProjects={setProjects}
            onClose={onClose}
          />
        );

      case PROJECT_TYPES.COMMERCIAL:
        return (
          <CommercialProject
            projects={projects}
            setProjects={setProjects}
            onClose={onClose}
          />
        );

      default:
        return renderBasicInfoForm();
    }
  };

  const renderBasicInfoForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
          Add New Project
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition duration-150 flex items-center text-sm font-medium"
        >
          <FaTimes className="mr-1" />
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="w-full bg-gray-50 p-4 md:p-5 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-indigo-700 flex items-center">
            <FaHome className="mr-2" />
            Project Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Type *
              </label>
              <select
                value={projectType}
                onChange={handleProjectTypeChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select project type</option>
                <option value="plotting">Plotting</option>
                <option value="duplex">Duplex</option>
                <option value="triplex">Triplex</option>
                <option value="apartment">Apartment</option>
                <option value="commercial">Commercial</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-50 p-4 md:p-5 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-indigo-700 flex items-center">
            <FaBuilding className="mr-2" />
            Next Steps
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Select a project type to continue with the specific configuration.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                • <strong>Plotting:</strong> For land plots and individual
                properties
              </li>
              <li>
                • <strong>Duplex/Triplex:</strong> For 2-3 floor independent
                houses
              </li>
              <li>
                • <strong>Apartment:</strong> For multi-unit residential
                buildings
              </li>
              <li>
                • <strong>Commercial:</strong> For office spaces, shops, and
                commercial properties
              </li>
              <li>
                • <strong>Custom:</strong> To customize existing project
                templates
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return renderProjectForm();
};

export default ProjectForm;
