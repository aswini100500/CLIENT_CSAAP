import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { 
  Briefcase, MapPin, User, UserPlus, Trash2, 
  Loader2, Search, ShieldCheck, AlertCircle, ChevronDown, Building, Crown, Globe, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const API_URL = import.meta.env.VITE_ACCOUNTING_URL;

// --- API HELPER ---
const fetcher = ([url, token]) => axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.data);

const getEmployeeId = (emp) => {
  if (!emp) return '';
  const id = emp.id ?? emp.employee_id ?? emp.employeeId ?? emp.employeeid ?? emp.employeeProfileId;
  return id ? id.toString() : '';
};

const ProjectAssignment = () => {
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_CSAAP_URL || 'https://csaapnodeapi.csaap.com';
  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });
  // --- STATE ---
  const [employees, setEmployees] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  
  // Department & Role State
  const [departments, setDepartments] = useState([]);
  const [departmentRoles, setDepartmentRoles] = useState([]);
  const [globalRoles, setGlobalRoles] = useState([]); 
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  
  // Workflow Toggle State ('manager' = Step 1, 'team' = Step 2)
  const [assignmentMode, setAssignmentMode] = useState('manager'); 

  // Form State
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]); 
  const [selectedProjectNames, setSelectedProjectNames] = useState([]); 
  const [selectedBranches, setSelectedBranches] = useState([]);         
  const [selectedRoleId, setSelectedRoleId] = useState(''); 
  const [selectedRoleName, setSelectedRoleName] = useState(''); 
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Custom Dropdown State
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  // Fetch Assignments using SWR
  const assignmentsApiUrl = `${API_BASE_URL}/api/tenant/project-assignments`;
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useSWR(
    token ? [assignmentsApiUrl, token] : null,
    fetcher
  );

  // --- 🌟 FETCH EMPLOYEES ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const csaapToken = token;
        if (!csaapToken) {
          console.error("No authorization token found");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/tenant/hrms/all-employees`, {
          headers: { Authorization: `Bearer ${csaapToken}` }
        });

        const employeesData = response.data.data || response.data || [];
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employees.");
      }
    };
    if (token) {
      fetchEmployees();
    }
  }, [token]);

  // --- 🌟 FETCH PROJECTS ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const csaapToken = token;
        if (!csaapToken) {
          console.error("No authorization token found");
          return;
        }

        const PROJECT_SOURCES = [
          { path: "commercials", property_type: "commercial" },
          { path: "apartments", property_type: "apartment" },
          { path: "plottings", property_type: "plotting" },
          { path: "duplexes", property_type: "duplex" },
          { path: "triplexes", property_type: "triplex" },
          { path: "custom-projects", property_type: "custom_project" },
        ];

        const TENANT_API_BASE_URL = `${API_BASE_URL}/api/tenant`;

        const results = await Promise.allSettled(
          PROJECT_SOURCES.map(async ({ path, property_type }) => {
            const response = await axios.get(`${TENANT_API_BASE_URL}/${path}`, {
              headers: { Authorization: `Bearer ${csaapToken}` }
            });

            const projects = Array.isArray(response.data?.data) ? response.data.data : [];

            return projects.map((project) => ({
              id: project.id,
              name: project.name,
              property_type: property_type,
              display_type: project.type || property_type,
              locality: project.locality,
              city: project.city,
              branch: project.locality || project.city || 'Main',
              composite_key: `${property_type}:${project.id}`,
              location: [project?.locality, project?.city].filter(Boolean).join(", ")
            }));
          })
        );

        const allProjectsData = results
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value)
          .filter(project => project.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllProjects(allProjectsData);

        if (allProjectsData.length === 0) {
          toast.error("No projects found");
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
        toast.error("Failed to load projects");
        setAllProjects([]);
      }
    };
    if (token) {
      fetchProjects();
    }
  }, [token]);

  // --- 🌟 FETCH DEPARTMENTS ---
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const csaapToken = token;
        if (!csaapToken) {
          console.error("No authorization token found");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/tenant/departments`, {
          headers: { Authorization: `Bearer ${csaapToken}` }
        });

        const departmentsData = response.data.data || response.data || [];
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to load departments.");
      }
    };
    if (token) {
      fetchDepartments();
    }
  }, [token]);

  // --- 🌟 FETCH GLOBAL ROLES (MANAGER MODE) ---
  const fetchGlobalRoles = async () => {
    try {
      const csaapToken = token;
      if (!csaapToken) {
        console.error("No authorization token found");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/tenant/departments/roles`, {
        headers: { Authorization: `Bearer ${csaapToken}` }
      });

      const roles = response.data.data || response.data || [];
      setGlobalRoles(roles);
      if (roles.length > 0) {
        setSelectedRoleId(roles[0].id);
        setSelectedRoleName(roles[0].role_name);
      } else {
        setSelectedRoleId('');
        setSelectedRoleName('');
      }
    } catch (error) {
      console.error("Error fetching global roles:", error);
      toast.error("Failed to load global roles.");
    }
  };

  // --- 🌟 FETCH DEPARTMENT ROLES (TEAM MODE) ---
  const fetchDepartmentRoles = async (departmentId) => {
    try {
      if (!departmentId) return;
      
      const csaapToken = token;
      if (!csaapToken) {
        console.error("No authorization token found");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/tenant/departments/roles?department=${departmentId}`, {
        headers: { Authorization: `Bearer ${csaapToken}` }
      });

      const roles = response.data.data || response.data || [];
      setDepartmentRoles(roles);
      if (roles.length > 0) {
        setSelectedRoleId(roles[0].id);
        setSelectedRoleName(roles[0].role_name);
      } else {
        setSelectedRoleId('');
        setSelectedRoleName('');
      }
    } catch (error) {
      console.error("Error fetching department roles:", error);
      toast.error("Failed to load department roles.");
      setDepartmentRoles([]);
      setSelectedRoleId('');
      setSelectedRoleName('');
    }
  };

  // --- FETCH ROLES BASED ON MODE & DEPARTMENT ---
  useEffect(() => {
    if (token) {
      if (assignmentMode === 'manager') {
        fetchGlobalRoles();
      } else {
        if (!selectedDepartmentId) {
          setDepartmentRoles([]);
          setSelectedRoleId('');
          setSelectedRoleName('');
          return;
        }
        fetchDepartmentRoles(selectedDepartmentId);
      }
    }
  }, [selectedDepartmentId, assignmentMode, token]);

  // Handle clicking outside custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- CASCADING MULTI-SELECT LOGIC ---
  const uniqueProjectNames = useMemo(() => {
    const names = allProjects.map(p => p.name).filter(Boolean);
    return [...new Set(names)];
  }, [allProjects]);

  const availableBranches = useMemo(() => {
    if (selectedProjectNames.length === 0) return [];
    
    const branches = allProjects
      .filter(p => selectedProjectNames.includes(p.name))
      .map(p => {
        const branchName = p.branch || p.locality || 'Main';
        return {
          projectName: p.name,
          branchName: branchName,
          value: `${p.name}|${branchName}`
        };
      });

    const unique = [];
    const seen = new Set();
    for (const b of branches) {
      if (!seen.has(b.value)) {
        seen.add(b.value);
        unique.push(b);
      }
    }
    return unique;
  }, [selectedProjectNames, allProjects]);

  // Clean up selected branches if a project is un-checked
  useEffect(() => {
    const availableValues = availableBranches.map(b => b.value);
    setSelectedBranches(prev => prev.filter(val => availableValues.includes(val)));
  }, [availableBranches]);

  // Toggle Selections
  const handleEmployeeToggle = (id) => {
    setSelectedEmployeeIds(prev => prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]);
  };

  const handleProjectToggle = (name) => {
    setSelectedProjectNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleBranchToggle = (val) => {
    setSelectedBranches(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  // --- SUBMIT ASSIGNMENT MATRIX WITH PROPER ROLE HANDLING ---
// --- SUBMIT ASSIGNMENT MATRIX (FIXED FOR PROPER ROLE HANDLING) ---
const handleAssign = async (e) => {
  e.preventDefault();
  
  if (selectedEmployeeIds.length === 0 || selectedProjectNames.length === 0 || selectedBranches.length === 0) {
    return toast.error("Please select at least one employee, project, and location.");
  }
  if (!selectedRoleName) {
    return toast.error("Please select a role for this assignment.");
  }

  setIsAssigning(true);
  const toastId = toast.loading(`Preparing allocations...`);

  const validProjects = allProjects.filter(p => {
    const branchName = p.branch || p.locality || 'Main';
    const comboValue = `${p.name}|${branchName}`;
    return selectedProjectNames.includes(p.name) && selectedBranches.includes(comboValue);
  });

  if (validProjects.length === 0) {
    setIsAssigning(false);
    return toast.error("No valid Project/Location combinations found in the database.", { id: toastId });
  }

  try {
    const assignmentPromises = [];

    selectedEmployeeIds.forEach(empId => {
      const selectedEmp = employees.find(emp => getEmployeeId(emp) === empId);
      
      validProjects.forEach(proj => {
        let payload;
        
        if (assignmentMode === 'manager') {
          // Manager mode - set BOTH project_role AND assigned_global_role
          payload = {
            employeeid: getEmployeeId(selectedEmp),
            employeename: selectedEmp?.name || selectedEmp?.employee_name,
            projectid: parseInt(proj.id),
            projectname: proj.name,
            projectbranch: proj.branch || proj.locality || 'Main',
            project_type: proj.property_type,
            project_role: selectedRoleName, // ✅ Set project_role for managers too
            project_role_id: selectedRoleId,
            globalrole_assigned: 'yes',
            assigned_global_role: selectedRoleName,
            grade: "0"
          };
        } else {
          // Team mode - only project_role, no global role
          payload = {
            employeeid: getEmployeeId(selectedEmp),
            employeename: selectedEmp?.name || selectedEmp?.employee_name,
            projectid: parseInt(proj.id),
            projectname: proj.name,
            projectbranch: proj.branch || proj.locality || 'Main',
            project_type: proj.property_type,
            project_role: selectedRoleName, // ✅ Set project_role for team members
            project_role_id: selectedRoleId,
            department_id: parseInt(selectedDepartmentId),
            globalrole_assigned: 'no',
            assigned_global_role: null,
            grade: "0"
          };
        }
        
        console.log(`Sending ${assignmentMode} assignment payload:`, payload);
        assignmentPromises.push(axios.post(assignmentsApiUrl, payload, getAuthHeaders()));
      });
    });

    toast.loading(`Processing ${assignmentPromises.length} assignment(s)...`, { id: toastId });

    const results = await Promise.allSettled(assignmentPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Log detailed errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Assignment ${index + 1} failed:`, result.reason);
        console.error('Error response data:', result.reason?.response?.data);
        console.error('Error status:', result.reason?.response?.status);
      } else {
        console.log(`Assignment ${index + 1} successful:`, result.value?.data);
      }
    });

    if (failed > 0) {
      toast.error(`Assigned ${successful}, failed ${failed}. Check console for details.`, { id: toastId });
    } else {
      toast.success(`Successfully assigned ${successful} record(s)!`, { id: toastId });
    }
    
    // Reset form fields
    setSelectedEmployeeIds([]);
    setSelectedProjectNames([]);
    setSelectedBranches([]);
    setSelectedDepartmentId(''); 
    setSelectedRoleId('');
    setSelectedRoleName('');
    setIsEmployeeDropdownOpen(false);
    setIsProjectDropdownOpen(false);
    setIsBranchDropdownOpen(false);
    
    mutate(assignmentsApiUrl);
  } catch (error) {
    console.error('Assignment error:', error);
    toast.error("Failed to process assignments.", { id: toastId });
  } finally {
    setIsAssigning(false);
  }
};

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) return;
    const toastId = toast.loading("Removing assignment...");
    try {
      await axios.delete(`${assignmentsApiUrl}/${id}`, getAuthHeaders());
      toast.success("Assignment removed.", { id: toastId });
      mutate(assignmentsApiUrl);
    } catch (error) {
      toast.error("Failed to remove assignment.", { id: toastId });
    }
  };

  // --- FILTERING & PAGINATION ---
  const assignments = assignmentsData?.data || [];
  
  const filteredAssignments = assignments.filter(a => {
    const search = searchTerm.toLowerCase();
    return (
      (a.employeename && a.employeename.toLowerCase().includes(search)) ||
      (a.projectname && a.projectname.toLowerCase().includes(search)) ||
      (a.projectbranch && a.projectbranch.toLowerCase().includes(search)) ||
      (a.project_role && a.project_role.toLowerCase().includes(search)) ||
      (a.assigned_global_role && a.assigned_global_role.toLowerCase().includes(search))
    );
  });

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  
  // Get the slice of assignments for the current page
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 lg:p-10 bg-[#FDFDFF] min-h-screen relative font-sans">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '1rem', background: '#333', color: '#fff', fontWeight: 'bold', fontSize: '14px' } }} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-blue-600" size={32} />
          Project Allocations
        </h1>
        <p className="text-slate-500 font-medium mt-1 text-sm">
          Assign Global Managers or allocate staff to department roles across multiple projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: ASSIGNMENT FORM --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-6 sm:p-8 sticky top-8">
            
            {/* WORKFLOW MODE TOGGLE */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAssignmentMode('manager');
                  setSelectedDepartmentId('');
                  setSelectedRoleId('');
                  setSelectedRoleName('');
                }}
                className={`flex-1 py-2.5 text-[11px] flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-lg transition-all ${assignmentMode === 'manager' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Crown size={14} /> Assign Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssignmentMode('team');
                  setSelectedRoleId('');
                  setSelectedRoleName('');
                }}
                className={`flex-1 py-2.5 text-[11px] flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-lg transition-all ${assignmentMode === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <UserPlus size={14} /> Assign Team
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-5">
              
              {/* Employee Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee(s)</label>
                <div className="relative" ref={employeeDropdownRef}>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
                  <button 
                    type="button"
                    onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-700 outline-none transition-all flex items-center justify-between ${isEmployeeDropdownOpen ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-200'}`}
                  >
                    <span className="truncate">
                      {selectedEmployeeIds.length === 0 ? '-- Select Employees --' : `${selectedEmployeeIds.length} Employee(s) Selected`}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isEmployeeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isEmployeeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                      <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 mb-1">
                        <input 
                          type="checkbox" 
                          checked={selectedEmployeeIds.length === employees.length && employees.length > 0}
                          onChange={(e) => {
                            e.target.checked ? setSelectedEmployeeIds(employees.map(emp => getEmployeeId(emp))) : setSelectedEmployeeIds([]);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Select All</span>
                      </label>
                      
                      {employees.map(emp => {
                        const empId = getEmployeeId(emp);
                        return (
                          <label key={empId} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                            <input 
                              type="checkbox"
                              checked={selectedEmployeeIds.includes(empId)}
                              onChange={() => handleEmployeeToggle(empId)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{emp.name || emp.employee_name}</span>
                              {emp.designation && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{emp.designation}</span>}
                            </div>
                          </label>
                        );
                      })}
                      {employees.length === 0 && <div className="p-3 text-center text-xs font-bold text-slate-400">No employees found.</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Project Name Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Select Project Name(s)</label>
                <div className="relative" ref={projectDropdownRef}>
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
                  <button 
                    type="button"
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-700 outline-none transition-all flex items-center justify-between ${isProjectDropdownOpen ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-200'}`}
                  >
                    <span className="truncate">
                      {selectedProjectNames.length === 0 ? '-- Select Project Names --' : `${selectedProjectNames.length} Project(s) Selected`}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                      <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 mb-1">
                        <input 
                          type="checkbox" 
                          checked={selectedProjectNames.length === uniqueProjectNames.length && uniqueProjectNames.length > 0}
                          onChange={(e) => {
                            e.target.checked ? setSelectedProjectNames([...uniqueProjectNames]) : setSelectedProjectNames([]);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Select All</span>
                      </label>

                      {uniqueProjectNames.map(name => (
                        <label key={name} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox"
                            checked={selectedProjectNames.includes(name)}
                            onChange={() => handleProjectToggle(name)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm font-bold text-slate-700">{name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Select Location(s)</label>
                <div className="relative" ref={branchDropdownRef}>
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
                  <button 
                    type="button"
                    onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                    disabled={selectedProjectNames.length === 0 || availableBranches.length === 0}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-700 outline-none transition-all flex items-center justify-between disabled:opacity-50 disabled:bg-slate-100 ${isBranchDropdownOpen ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-200'}`}
                  >
                    <span className="truncate">
                      {selectedBranches.length === 0 ? '-- Select Locations --' : `${selectedBranches.length} Location(s) Selected`}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isBranchDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                      <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 mb-1">
                        <input 
                          type="checkbox" 
                          checked={selectedBranches.length === availableBranches.length && availableBranches.length > 0}
                          onChange={(e) => {
                            e.target.checked ? setSelectedBranches(availableBranches.map(b => b.value)) : setSelectedBranches([]);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Select All</span>
                      </label>

                      {availableBranches.map(branchObj => (
                        <label key={branchObj.value} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox"
                            checked={selectedBranches.includes(branchObj.value)}
                            onChange={() => handleBranchToggle(branchObj.value)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm font-bold text-slate-700">
                            {branchObj.projectName} <span className="text-slate-400 font-medium">({branchObj.branchName})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProjectNames.length > 0 && availableBranches.length === 0 && (
                   <p className="text-xs text-rose-500 font-bold ml-1 mt-1 flex items-center gap-1"><AlertCircle size={12}/> No locations found for selected projects.</p>
                )}
              </div>

              {/* MANAGER MODE: GLOBAL ROLE SELECTION */}
              {assignmentMode === 'manager' && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Global Role</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                      <select 
                        value={selectedRoleId}
                        onChange={(e) => {
                          const roleId = e.target.value;
                          const role = globalRoles.find(r => r.id === parseInt(roleId));
                          setSelectedRoleId(roleId);
                          setSelectedRoleName(role?.role_name || '');
                        }}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-50 focus:border-amber-300 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>-- Choose Global Role --</option>
                        {globalRoles.map(role => (
                          <option key={role.id} value={role.id}>{role.role_name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* TEAM MODE: DEPARTMENT & ROLE SELECTION */}
              {assignmentMode === 'team' && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select 
                        value={selectedDepartmentId}
                        onChange={(e) => {
                          setSelectedDepartmentId(e.target.value);
                          setSelectedRoleId(''); 
                          setSelectedRoleName('');
                        }}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>-- Choose Department --</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Role</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select 
                        value={selectedRoleId}
                        onChange={(e) => {
                          const roleId = e.target.value;
                          const role = departmentRoles.find(r => r.id === parseInt(roleId));
                          setSelectedRoleId(roleId);
                          setSelectedRoleName(role?.role_name || '');
                        }}
                        required
                        disabled={!selectedDepartmentId || departmentRoles.length === 0}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-50"
                      >
                        <option value="" disabled>-- Choose Role --</option>
                        {departmentRoles.map(role => (
                          <option key={role.id} value={role.id}>{role.role_name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isAssigning || selectedEmployeeIds.length === 0 || selectedProjectNames.length === 0 || selectedBranches.length === 0 || !selectedRoleName}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                >
                  {isAssigning ? <Loader2 size={16} className="animate-spin" /> : (assignmentMode === 'manager' ? <Crown size={16} /> : <UserPlus size={16} />)} 
                  {assignmentMode === 'manager' ? 'Confirm Project Manager(s)' : 'Allocate Team Member(s)'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: ACTIVE ASSIGNMENTS TABLE --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden w-full flex flex-col h-full">
            
            {/* Table Header & Search */}
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-800 tracking-tight">Active Allocations</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Total: {filteredAssignments.length} Records</p>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search staff or projects..." 
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none text-xs font-bold transition-all"
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto w-full block flex-1">
              <table className="w-full min-w-150">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee & Project Role</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Role</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Project</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isAssignmentsLoading ? (
                    <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
                  ) : filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><Briefcase className="text-slate-300" size={24}/></div>
                        <p className="text-slate-400 font-bold text-sm">No assignments found.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedAssignments.map((assignment) => {
                      const isGlobal = assignment.globalrole_assigned === 'yes';
                      const isManager = isGlobal || assignment.project_role?.toLowerCase().includes('manager');
                      
                      return (
                        <tr key={assignment.id} className={`hover:bg-slate-50/50 transition-colors ${isManager ? 'bg-amber-50/20' : ''}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border uppercase shrink-0 ${isManager ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {assignment.employeename?.[0] || 'E'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-slate-700">{assignment.employeename}</p>
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                  Project Role: {assignment.project_role || 'None'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            {isGlobal && assignment.assigned_global_role ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                <Globe size={10} /> {assignment.assigned_global_role}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              {assignment.projectname}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                              <MapPin size={12} className="text-slate-400" /> {assignment.projectbranch}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-center">
                              <button 
                                onClick={() => handleRemove(assignment.id)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-100 hover:border-rose-600 flex items-center gap-1.5"
                              >
                                <Trash2 size={12} /> Unassign
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 flex items-center gap-1"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectAssignment;