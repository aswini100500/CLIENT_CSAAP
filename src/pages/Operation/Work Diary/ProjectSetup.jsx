import React, { useState, useEffect } from "react";
import { FaBuilding, FaUserTie, FaHome, FaFilePdf, FaImage, FaSearch, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaEye, FaDownload, FaTrash, FaPlus } from "react-icons/fa";
import operationApi from "../../../api/operation";

const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ProjectSetup = ({ onProjectSelect }) => {
  const [project, setProject] = useState("");
  const [contractor, setContractor] = useState("");
  const [units, setUnits] = useState([]);
  const [plans, setPlans] = useState({});
  const [stages, setStages] = useState([
    { id: generateUUID(), name: "Stage 1", description: "", start: "", end: "", status: "planned", budget: "", subStages: [] }
  ]);
  const [contractorSearchTerm, setContractorSearchTerm] = useState("");
  const [showContractorDropdown, setShowContractorDropdown] = useState(false);
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [contractorsList, setContractorsList] = useState([]);

  const getArrayData = (res) => {
    if (!res || !res.data) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data.contractors)) return res.data.contractors;
    return [];
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [apartments, commercials, plottings, duplexes, triplexes, custom, contractorsRes] = await Promise.all([
        operationApi.getApartments(),
        operationApi.getCommercials(),
        operationApi.getPlottings(),
        operationApi.getDuplexes(),
        operationApi.getTriplexes(),
        operationApi.getCustomProjects(),
        operationApi.getContractors()
      ]);

      const allProjects = [
        ...getArrayData(apartments).map(p => ({ ...p, type: 'Apartment', uid: `Apartment-${p.id}` })),
        ...getArrayData(commercials).map(p => ({ ...p, type: 'Commercial', uid: `Commercial-${p.id}` })),
        ...getArrayData(plottings).map(p => ({ ...p, type: 'Plotting', uid: `Plotting-${p.id}` })),
        ...getArrayData(duplexes).map(p => ({ ...p, type: 'Duplex', uid: `Duplex-${p.id}` })),
        ...getArrayData(triplexes).map(p => ({ ...p, type: 'Triplex', uid: `Triplex-${p.id}` })),
        ...getArrayData(custom).map(p => ({ ...p, type: 'Custom', uid: `Custom-${p.id}` }))
      ];

      setProjectsList(allProjects);
      setContractorsList(getArrayData(contractorsRes));

    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleContractorSelect = (c) => {
    setContractor(c.id);
    setContractorSearchTerm(c.name || c.contractor_name);
    setShowContractorDropdown(false);
  };

  const filteredContractors = (contractorsList || []).filter(c => 
    (c.name || c.contractor_name || "").toLowerCase().includes(contractorSearchTerm.toLowerCase()) ||
    (c.phone || "").toLowerCase().includes(contractorSearchTerm.toLowerCase())
  );

  const handleProjectChange = async (e) => {
    const selectedProjectUid = e.target.value;
    setProject(selectedProjectUid);
    
    const selectedProj = projectsList.find(p => p.uid === selectedProjectUid);
    let currentUnits = [];
    if (selectedProj) {

        currentUnits = selectedProj.units_data || selectedProj.units || [];
        if (typeof currentUnits === 'string') {
            try { currentUnits = JSON.parse(currentUnits); } catch (e) { currentUnits = []; }
        }
        setUnits(currentUnits);
    } else {
        setUnits([]);
    }
    setPlans({});


    try {
        if (!selectedProj) return;
        const setupsRes = await operationApi.getProjectSetups();
        const setups = getArrayData(setupsRes);
        const existingSetup = setups.find(s => s.project_id === selectedProj.id && s.project_type?.toLowerCase() === selectedProj.type?.toLowerCase());
        if (existingSetup) {
            setContractor(existingSetup.contractor_id);
            const selectedCont = (contractorsList || []).find(c => c.id === existingSetup.contractor_id);
            if (selectedCont) setContractorSearchTerm(selectedCont.name || selectedCont.contractor_name);
            setDates({ start: existingSetup.start_date, end: existingSetup.end_date });
            
            let loadedStages = existingSetup.stages;
            if (typeof loadedStages === 'string') {
                try { loadedStages = JSON.parse(loadedStages); } catch (e) { loadedStages = []; }
            }
            const formattedStages = (loadedStages || []).map((s, sIdx) => ({
                ...s,
                id: s.id || generateUUID(),
                subStages: (s.subStages || s.sub_stages || []).map((ss, ssIdx) => ({
                    ...ss,
                    id: ss.id || generateUUID()
                }))
            }));
            setStages(formattedStages);
            
            if (onProjectSelect) onProjectSelect(selectedProj, { ...existingSetup, stages: formattedStages, units_data: currentUnits });
        } else {
            if (onProjectSelect) onProjectSelect(selectedProj, null);
        }
    } catch (error) {
        console.error("Error checking existing setup:", error);
    }
  };

  const handlePlanUpload = (unitId, e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) && 
      file.size <= 10 * 1024 * 1024
    );

    setPlans(prev => ({
      ...prev,
      [unitId]: prev[unitId] ? [...prev[unitId], ...validFiles] : validFiles,
    }));
  };

  const removePlan = (unitId, index) => {
    setPlans(prev => ({
      ...prev,
      [unitId]: prev[unitId].filter((_, i) => i !== index),
    }));
  };

  const getFileIcon = (fileType) => {
    return fileType === 'application/pdf' ? 
      <FaFilePdf className="text-red-500" /> : 
      <FaImage className="text-green-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredUnits = units.filter(unit => 
    (unit.name || unit.type || "").toLowerCase().includes(unitSearchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!project || !contractor) {
      alert("Please select both project and contractor");
      return;
    }

    try {
        setLoading(true);
        const selectedProj = projectsList.find(p => p.uid === project);
        if (!selectedProj) {
            alert("No project selected");
            return;
        }

        const submissionData = { 
            project_id: selectedProj.id,
            project_type: selectedProj.type.toLowerCase(),
            contractor_id: parseInt(contractor), 
            start_date: dates.start, 
            end_date: dates.end, 
            status: "draft",
            stages: stages.map((s, sIdx) => ({
                id: s.id || generateUUID(),
                name: s.name,
                description: s.description,
                start: s.start_date || s.start,
                end: s.end_date || s.end,
                status: s.status,
                sub_stages: (s.subStages || s.sub_stages || []).map((ss, ssIdx) => ({
                    ...ss,
                    id: ss.id || generateUUID()
                }))
            })),
            units_data: units
        };
        
        const setupsRes = await operationApi.getProjectSetups();
        const setups = getArrayData(setupsRes);
        const existingSetup = setups.find(s => s.project_id === selectedProj.id && s.project_type?.toLowerCase() === selectedProj.type?.toLowerCase());

        let res;
        if (existingSetup) {
            res = await operationApi.updateProjectSetup(existingSetup.id, submissionData);
            alert("Project setup updated successfully!");
        } else {
            res = await operationApi.createProjectSetup(submissionData);
            alert("Project setup created successfully!");
        }
        
        const updatedSetup = res.data;
        if (typeof updatedSetup.stages === 'string') updatedSetup.stages = JSON.parse(updatedSetup.stages);
        if (typeof updatedSetup.units_data === 'string') updatedSetup.units_data = JSON.parse(updatedSetup.units_data);

        if (onProjectSelect) onProjectSelect(selectedProj, updatedSetup);
    } catch (error) {
        console.error("Error submitting project setup:", error);
        alert("Failed to submit project setup.");
    } finally {
        setLoading(false);
    }
  };

  const addStage = () => {
    const newStage = { id: generateUUID(), name: `Stage ${stages.length + 1}`, description: "", start: "", end: "", status: "planned", budget: "", subStages: [] };
    setStages(prev => [...prev, newStage]);
  };

  const removeStage = (id) => {
    if (stages.length > 1) setStages(prev => prev.filter(s => s.id !== id));
  };

  const updateStage = (id, field, value) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };


  const addSubStage = (stageId) => {
    const newSub = { id: generateUUID(), name: `Sub-stage `, description: "", status: "planned" };
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, subStages: [...(s.subStages || []), newSub] } : s));
  };

  const removeSubStage = (stageId, subId) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, subStages: (s.subStages || []).filter(ss => ss.id !== subId) } : s));
  };

  const updateSubStage = (stageId, subId, field, value) => {
    setStages(prev => prev.map(s => {
      if (s.id !== stageId) return s;
      return { ...s, subStages: (s.subStages || []).map(ss => ss.id === subId ? { ...ss, [field]: value } : ss) };
    }));
  };

  const selectedProject = projectsList.find(p => p.id === parseInt(project));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
          <FaBuilding className="text-blue-600" />
          Project Setup
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your construction project
        </p>
        {selectedProject && (
          <p className="text-sm text-gray-500 mt-1">Selected: {selectedProject.name} • {selectedProject.location} • {selectedProject.type}</p>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Project *
          </label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={project}
            onChange={handleProjectChange}
            disabled={loading}
          >
            <option value="">-- Select Project --</option>
            {projectsList.map((p) => (
              <option key={p.uid} value={p.uid}>
                [{p.type}] {p.name || p.project_name} - {p.location || p.site_location}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Contractor *
          </label>
          <div className="relative">
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search contractor..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={contractorSearchTerm}
                onChange={(e) => {
                  setContractorSearchTerm(e.target.value);
                  setShowContractorDropdown(true);
                  if (!e.target.value) setContractor("");
                }}
                onFocus={() => setShowContractorDropdown(true)}
              />
            </div>
            
            {showContractorDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredContractors.length > 0 ? (
                  filteredContractors.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleContractorSelect(c)}
                      className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                          <FaUserTie className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {c.name || c.contractor_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {c.phone || "No phone"} • {c.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No contractors found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <FaCalendarAlt className="inline mr-2" />
            Start Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={dates.start}
            onChange={(e) => setDates(prev => ({ ...prev, start: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <FaCalendarAlt className="inline mr-2" />
            End Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={dates.end}
            onChange={(e) => setDates(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
      </div>


      {units.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <FaHome className="text-purple-500" />
              Unit Plans
            </h3>
            <div className="relative w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search units..."
                value={unitSearchTerm}
                onChange={(e) => setUnitSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredUnits.map((unit) => (
              <div key={unit.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{unit.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unit.type} • {unit.size} • Floor {unit.floor}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    plans[unit.id]?.length ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-gray-100 text-gray-800 dark:bg-gray-600'
                  }`}>
                    {plans[unit.id]?.length || 0} files
                  </span>
                </div>

                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handlePlanUpload(unit.id, e)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                />

                {plans[unit.id]?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {plans[unit.id].map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                                <div>
                                  <div className="text-sm">{file.name}</div>
                                  <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                                </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="text-blue-500 hover:text-blue-700 p-1">
                            <FaEye size={14} />
                          </button>
                          <button className="text-green-500 hover:text-green-700 p-1">
                            <FaDownload size={14} />
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={() => removePlan(unit.id, index)}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}



      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 mt-6">
        <div className="flex items-center justify-between mb-6">
          <label className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FaCalendarAlt className="text-purple-500" />
            Project Stages & Timeline
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={addStage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Stage
            </button>
            <span className="text-sm text-gray-500">{stages.length} stages</span>
          </div>
        </div>

        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStage(stage.id, 'name', e.target.value)}
                    className="w-full text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 dark:text-white"
                    placeholder={`Stage ${index + 1} name`}
                  />
                  <textarea
                    placeholder="Stage description, tasks, and deliverables..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                    rows="3"
                    value={stage.description}
                    onChange={(e) => updateStage(stage.id, 'description', e.target.value)}
                  />

                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub-stages</label>
                    <div className="space-y-2 mt-2">
                      {(stage.subStages || []).map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => updateSubStage(stage.id, sub.id, 'name', e.target.value)}
                            placeholder="Sub-stage name"
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
                          />
                          <button
                            onClick={() => removeSubStage(stage.id, sub.id)}
                            className="text-red-500 p-2"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addSubStage(stage.id)}
                      className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <FaPlus /> Add Sub-stage
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={stage.start}
                      onChange={(e) => updateStage(stage.id, 'start', e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg p-2"
                    />
                    <input
                      type="date"
                      value={stage.end}
                      onChange={(e) => updateStage(stage.id, 'end', e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg p-2"
                    />
                  </div>

                  <button
                    onClick={() => removeStage(stage.id)}
                    disabled={stages.length === 1}
                    className="text-red-500 hover:text-red-700 mt-2 disabled:opacity-50"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600 mt-6">
        <div className="text-sm">
          {!project || !contractor ? (
            <p className="text-red-500 flex items-center gap-1">
              <FaExclamationTriangle />
              Please select project and contractor
            </p>
          ) : (
            <p className="text-green-500 flex items-center gap-1">
              <FaCheckCircle />
              Ready to submit
            </p>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!project || !contractor}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <FaCheckCircle />
          Submit Setup
        </button>
      </div>
    </div>
  );
};

export default ProjectSetup ;




