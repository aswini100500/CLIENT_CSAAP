import React, { useMemo } from "react";
import { FaBuilding, FaMapMarkerAlt, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import ProjectDetailsTable from "./ProjectDetailsTable";
import { getProjectOverallStatus } from "./shared/utils";

const ProjectList = ({ 
  projects, 
  expandedProject, 
  toggleProjectExpansion, 
  editProject, 
  deleteProject, 
  editPlotFromTable, 
  editUnitFromTable 
}) => {
  const sortedProjects = useMemo(() => {
    try {
      return [...projects].sort((a, b) => {
        const da = a?.createdAt ? Date.parse(a.createdAt) : 0;
        const db = b?.createdAt ? Date.parse(b.createdAt) : 0;
        if (!isNaN(db) && !isNaN(da)) return db - da;
        // fallback to id if dates missing or unparsable
        return (b.id || 0) - (a.id || 0);
      });
    } catch (e) {
      return projects;
    }
  }, [projects]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-2 md:p-4 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            Projects Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Projects: {projects.length}
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 md:py-12">
          <FaBuilding className="w-14 h-14 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first project
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-indigo-100 text-indigo-800">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  Project
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  Type
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  Location
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  Units/Plots
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  Created
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedProjects.map((project) => (
                <React.Fragment key={project.id}>
                  <tr className="hover:bg-gray-50 transition duration-150 border-b border-gray-100">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              project.type === "plotting"
                                ? "bg-green-500"
                                : project.type === "duplex"
                                ? "bg-blue-500"
                                : project.type === "triplex"
                                ? "bg-orange-500"
                                : project.type === "apartment"
                                ? "bg-purple-500"
                                : project.type === "custom"
                                ? "bg-pink-500"
                                : "bg-gray-500"
                            }`}
                          >
                            {project.type === "plotting"
                              ? "P"
                              : project.type === "duplex"
                              ? "D"
                              : project.type === "triplex"
                              ? "T"
                              : project.type === "apartment"
                              ? "A"
                              : project.type === "custom"
                              ? "C"
                              : "C"}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                          <button
                            onClick={() => toggleProjectExpansion(project.id)}
                            className="text-indigo-600 text-xs flex items-center mt-1 hover:text-indigo-800"
                          >
                            {expandedProject === project.id ? (
                              <>
                                <FaChevronUp className="mr-1 text-xs" />
                                Hide details
                              </>
                            ) : (
                              <>
                                <FaChevronDown className="mr-1 text-xs" />
                                Show{" "}
                                {project.plots?.length > 0
                                  ? "plots"
                                  : "units"}{" "}
                                details (
                                {project.plots?.length ||
                                  project.units?.length ||
                                  0}
                                )
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {project.type.charAt(0).toUpperCase() +
                          project.type.slice(1)}
                      </span>
                      {project.commercialSubType && (
                        <div className="text-xs text-gray-500 mt-1">
                          {project.commercialSubType}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaMapMarkerAlt className="mr-1 text-red-500" />
                        {project.city || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {project.locality || "-"}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {project.floorConfigurations &&
                      project.floorConfigurations.length > 0
                        ? project.floorConfigurations
                            .map((floor) => {
                              const names = [];
                              const rooms = floor.rooms || 0;
                              for (let i = 0; i < rooms; i++) {
                                const roomType =
                                  floor.roomTypes?.[i] ||
                                  floor.roomTypes?.[0] ||
                                  "Unit";
                                names.push(
                                  `${floor.floorName} - ${i + 1} (${roomType})`
                                );
                              }
                              return names;
                            })
                            .flat()
                            .slice(0, 6)
                            .join(", ") +
                          (project.floorConfigurations.reduce(
                            (s, f) => s + (f.rooms || 0),
                            0
                          ) > 6
                            ? "..."
                            : "")
                        : project.plots
                            ?.filter((p) => p.isComplete)
                            .map((p) => p.name)
                            .join(", ") ||
                          project.units
                            ?.filter((u) => u.isComplete)
                            .map((u) => u.name)
                            .join(", ") ||
                          "-"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            project.plots?.length > 0 || project.units?.length > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {project.plots?.length > 0 || project.units?.length > 0
                            ? "Active"
                            : "Draft"}
                        </span>
                        {(() => {
                          const overallStatus = getProjectOverallStatus(project);
                          return (
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              overallStatus === "Completed" ? "bg-emerald-100 text-emerald-700" :
                              overallStatus === "Pending" ? "bg-amber-100 text-amber-700" :
                              overallStatus === "In Progress" ? "bg-blue-100 text-blue-700" :
                              overallStatus === "Ready to Move" ? "bg-indigo-100 text-indigo-700" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {overallStatus}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {project.createdAt}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => editProject(project)}
                          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-900 transition duration-150"
                          title="Edit Project"
                        >
                          <FaEdit className="mr-1 h-4 w-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => deleteProject(project.id)}
                          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition duration-150"
                          title="Delete Project"
                        >
                          <FaTrash className="mr-1 h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedProject === project.id && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <ProjectDetailsTable
                          project={project}
                          onEditPlot={editPlotFromTable}
                          onEditUnit={editUnitFromTable}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectList;