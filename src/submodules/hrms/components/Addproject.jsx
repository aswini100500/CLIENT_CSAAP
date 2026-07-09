import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const ProjectAssignment = () => {
  // Sample data with shifts
  const [employees, setEmployees] = useState([]);

  // const [employees, setEmployees] = useState([]);

  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetchProjects();
  }, []);
  const { user } = useAuth();
  console.log("Current user in ProjectAssignment:", user);
  const company_id = user.id;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const csaapToken = user.token;

      if (!csaapToken) {
        console.error("CSAAP token not found");
        return;
      }
      const res = await axios.get(
        "https://api.cloudsat.in/api/superadmin/employees/",
        {
          headers: {
            Authorization: `Bearer ${csaapToken}`,
          },
        },
      );

      // API returns { success, data }
      setEmployees(res.data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/projects/company/${company_id}`,
      );
      console.log(res);

      const normalizedProjects = res.data.map((p) => ({
        ...p,
        assignedTo: Array.isArray(p.assignedTo)
          ? p.assignedTo
          : p.assignedTo != null
            ? [p.assignedTo] // wrap single ID into array
            : [],
      }));
      setProjects(normalizedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Not Started",
    preferredShift: "day",
    partyName: "",
    consigneeName: "",
    projectLocation: "",
    consigneeAddress: "",
    projectType: "",
    projectValue: "",
    paymentSlab: "",
    projectHead: "",
    shiftTiming: "day",
  });

  const [assignment, setAssignment] = useState({
    projectId: "",
    employeeId: "",
    shift: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [view, setView] = useState("projects"); // projects, shift-view, calendar

  // Shift configurations
  const shifts = [
    {
      id: "morning",
      name: "Morning Shift",
      time: "06:00 - 14:00",
      icon: "🌅",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "day",
      name: "Day Shift",
      time: "09:00 - 17:00",
      icon: "☀️",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "night",
      name: "Night Shift",
      time: "22:00 - 06:00",
      icon: "🌙",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  // Add New Project
  // Add New Project
  const handleAddProject = async (e) => {
    e.preventDefault();

    if (!newProject.name.trim()) return;

    const project = {
      ...newProject,
      preferredShift: newProject.shiftTiming,
      shiftTiming: newProject.shiftTiming,
      assignedTo: [],
      company_id: user.id, // use the valid current user ID
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/projects`,
        project,
      );
      setProjects([...projects, res.data.project]);

      Swal.fire({
        icon: "success",
        title: "Project Added",
        text: `${project.name} has been added successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });

      // reset form
      setNewProject({
        name: "",
        description: "",
        status: "Not Started",
        preferredShift: "day",
        partyName: "",
        consigneeName: "",
        projectLocation: "",
        consigneeAddress: "",
        projectType: "",
        projectValue: "",
        paymentSlab: "",
        projectHead: "",
        shiftTiming: "day",
      });
    } catch (err) {
      console.error("Error adding project:", err.response?.data || err.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to add project",
      });
    }
  };

  // Assign Project
  const handleAssignProject = (e) => {
    e.preventDefault();
    if (!assignment.projectId || !assignment.employeeId) return;

    const updatedProjects = projects.map((project) =>
      project.id === parseInt(assignment.projectId)
        ? {
            ...project,
            assignedTo: [
              ...new Set([
                ...(Array.isArray(project.assignedTo)
                  ? project.assignedTo
                  : []),
                assignment.employeeId,
              ]),
            ],
          }
        : project,
    );

    setProjects(updatedProjects);
    setAssignment({ projectId: "", employeeId: "", shift: "" });

    const employeeName = getEmployeeName(assignment.employeeId);
    const projectName = projects.find(
      (p) => p.id === parseInt(assignment.projectId),
    )?.name;

    Swal.fire({
      icon: "success",
      title: "Project Assigned",
      text: `${employeeName} has been assigned to ${projectName}.`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Remove Employee from Project
  const handleRemoveEmployee = (projectId, employeeId) => {
    const employeeName = getEmployeeName(employeeId);
    const projectName = projects.find((p) => p.id === projectId)?.name;

    Swal.fire({
      title: "Are you sure?",
      text: `Remove ${employeeName} from ${projectName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove",
    }).then((result) => {
      if (result.isConfirmed) {
        setProjects(
          projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  assignedTo: project.assignedTo.filter(
                    (id) => id !== employeeId,
                  ),
                }
              : project,
          ),
        );

        Swal.fire({
          icon: "success",
          title: "Removed",
          text: `${employeeName} has been removed from ${projectName}.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Change Employee Shift
  const handleChangeShift = (employeeId, newShift) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    Swal.fire({
      title: "Change Shift",
      text: `Change ${employee.name}'s shift to ${getShiftName(newShift)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Shift Changed",
          text: `${employee.name} is now on ${getShiftName(newShift)}`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const getEmployeeName = (id) => {
    if (!id) return "Unknown";
    return employees.find((emp) => String(emp.id) === String(id))?.name || "Unknown";
  };
  const getShiftName = (shiftId) =>
    shifts.find((shift) => shift.id === shiftId)?.name || shiftId;
  const getShiftIcon = (shiftId) =>
    shifts.find((shift) => shift.id === shiftId)?.icon || "⏰";
  const getShiftColor = (shiftId) =>
    shifts.find((shift) => shift.id === shiftId)?.color ||
    "bg-gray-100 text-gray-800";

  // Project Stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => p.status === "Completed",
  ).length;
  const ongoingProjects = projects.filter(
    (p) => p.status === "In Progress",
  ).length;

  // Shift Stats
  const morningShiftProjects = projects.filter(
    (p) => p.preferredShift === "morning",
  ).length;
  const dayShiftProjects = projects.filter(
    (p) => p.preferredShift === "day",
  ).length;
  const nightShiftProjects = projects.filter(
    (p) => p.preferredShift === "night",
  ).length;

  // Filtered Projects (Search + Shift Filter)
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (shiftFilter === "all" || p.preferredShift === shiftFilter),
  );

  const employeesByShift = shifts.map((shift) => ({
    ...shift,
    employees: employees.filter((emp) => emp.shift === shift.id),
    projects: projects.filter((proj) => proj.preferredShift === shift.id),
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header Section */}
      {/* <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Project Management System</h1>
        <p className="text-gray-600">Manage projects, assignments, and shifts efficiently</p>
      </div> */}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* View Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            {["projects", "shift-view", "calendar"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  view === v
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {v === "projects"
                  ? "Projects View"
                  : v === "shift-view"
                    ? "Shift View"
                    : "Calendar View"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Projects
            </h3>
            <p className="text-2xl font-bold text-blue-600">{totalProjects}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {completedProjects}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-700">Ongoing</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {ongoingProjects}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Morning Shift
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {morningShiftProjects}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-700">Day Shift</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {dayShiftProjects}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-700">Night Shift</h3>
            <p className="text-2xl font-bold text-purple-600">
              {nightShiftProjects}
            </p>
          </div>
        </section>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shifts</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {view === "projects" && (
          <>
            {/* Add New Project Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add New Project
              </h2>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) =>
                        setNewProject({ ...newProject, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift Timing
                    </label>
                    <select
                      value={newProject.shiftTiming}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          shiftTiming: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {shifts.map((shift) => (
                        <option key={shift.id} value={shift.id}>
                          {shift.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Party Name
                    </label>
                    <input
                      type="text"
                      value={newProject.partyName}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          partyName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Party Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consignee Name
                    </label>
                    <input
                      type="text"
                      value={newProject.consigneeName}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          consigneeName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Consignee Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Location
                    </label>
                    <input
                      type="text"
                      value={newProject.projectLocation}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          projectLocation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Project Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consignee Address
                    </label>
                    <input
                      type="text"
                      value={newProject.consigneeAddress}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          consigneeAddress: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Consignee Address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Project
                    </label>
                    <input
                      type="text"
                      value={newProject.projectType}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          projectType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Project Type"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value of Project
                    </label>
                    <input
                      type="number"
                      value={newProject.projectValue}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          projectValue: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Project Value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Slab
                    </label>
                    <input
                      type="text"
                      value={newProject.paymentSlab}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          paymentSlab: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Payment Slab"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Head
                    </label>
                    <select
                      value={newProject.projectHead}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          projectHead: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Project Head</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.postApplied}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Project description"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Add Project
                </button>
              </form>
            </section>

            {/* Project Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm p-4 space-y-2"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 wrap-break-word whitespace-normal">
                    {project.description}
                  </p>
                  <p className="text-sm text-gray-700">
                    Status:{" "}
                    <span className="font-medium">{project.status}</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    Shift:{" "}
                    <span
                      className={`font-medium ${getShiftColor(project.preferredShift)}`}
                    >
                      {getShiftName(project.preferredShift)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700">
                    Party: {project.partyName}
                  </p>
                  <p className="text-sm text-gray-700">
                    Consignee: {project.consigneeName}
                  </p>
                  <p className="text-sm text-gray-700">
                    Location: {project.projectLocation}
                  </p>
                  <p className="text-sm text-gray-700">
                    Project Head: {getEmployeeName(project.projectHead)}
                  </p>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectAssignment;
