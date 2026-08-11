import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaHome,
  FaSearch,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import operationApi from "../../../api/operation";

const OpenClawModelSetupWizard = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [projectsList, setProjectsList] = useState([]);
  const [contractorsList, setContractorsList] = useState([]);
  const [selectedProjectUid, setSelectedProjectUid] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [contractorId, setContractorId] = useState("");
  const [contractorSearchTerm, setContractorSearchTerm] = useState("");
  const [showContractorDropdown, setShowContractorDropdown] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [units, setUnits] = useState([]);
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [plans, setPlans] = useState({});
  const [stages, setStages] = useState([
    {
      id: `stage-${Date.now()}`,
      name: "Stage 1",
      description: "",
      start: "",
      end: "",
      status: "planned",
      subStages: [],
    },
  ]);
  const [existingSetupId, setExistingSetupId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      const [
        apartments,
        commercials,
        plottings,
        duplexes,
        triplexes,
        custom,
        contractorsRes,
      ] = await Promise.all([
        operationApi.getApartments(),
        operationApi.getCommercials(),
        operationApi.getPlottings(),
        operationApi.getDuplexes(),
        operationApi.getTriplexes(),
        operationApi.getCustomProjects(),
        operationApi.getContractors(),
      ]);

      const allProjects = [
        ...getArrayData(apartments).map((p) => ({
          ...p,
          type: "Apartment",
          uid: `Apartment-${p.id}`,
        })),
        ...getArrayData(commercials).map((p) => ({
          ...p,
          type: "Commercial",
          uid: `Commercial-${p.id}`,
        })),
        ...getArrayData(plottings).map((p) => ({
          ...p,
          type: "Plotting",
          uid: `Plotting-${p.id}`,
        })),
        ...getArrayData(duplexes).map((p) => ({
          ...p,
          type: "Duplex",
          uid: `Duplex-${p.id}`,
        })),
        ...getArrayData(triplexes).map((p) => ({
          ...p,
          type: "Triplex",
          uid: `Triplex-${p.id}`,
        })),
        ...getArrayData(custom).map((p) => ({
          ...p,
          type: "Custom",
          uid: `Custom-${p.id}`,
        })),
      ];

      setProjectsList(allProjects);
      setContractorsList(getArrayData(contractorsRes));
    } catch (error) {
      console.error("Error fetching wizard data:", error);
      setErrorMessage("Unable to load wizard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (e) => {
    const selectedUid = e.target.value;
    setSelectedProjectUid(selectedUid);
    setStatusMessage("");
    setErrorMessage("");
    setExistingSetupId(null);
    setPlans({});

    const project =
      projectsList.find((item) => item.uid === selectedUid) || null;
    setSelectedProject(project);

    if (!project) {
      setUnits([]);
      return;
    }

    let currentUnits = project.units_data || project.units || [];
    if (typeof currentUnits === "string") {
      try {
        currentUnits = JSON.parse(currentUnits);
      } catch (err) {
        currentUnits = [];
      }
    }
    setUnits(Array.isArray(currentUnits) ? currentUnits : []);

    try {
      const setupsRes = await operationApi.getProjectSetups();
      const allSetups = getArrayData(setupsRes);
      const existingSetup = allSetups.find(
        (setup) =>
          setup.project_id === project.id &&
          setup.project_type?.toLowerCase() === project.type?.toLowerCase(),
      );

      if (existingSetup) {
        setExistingSetupId(existingSetup.id);
        setContractorId(existingSetup.contractor_id || "");
        const contractor = (contractorsList || []).find(
          (c) => c.id === existingSetup.contractor_id,
        );
        setContractorSearchTerm(
          contractor ? contractor.name || contractor.contractor_name : "",
        );
        setDates({
          start: existingSetup.start_date || "",
          end: existingSetup.end_date || "",
        });

        let loadedStages = existingSetup.stages;
        if (typeof loadedStages === "string") {
          try {
            loadedStages = JSON.parse(loadedStages);
          } catch (err) {
            loadedStages = [];
          }
        }
        setStages(
          Array.isArray(loadedStages) && loadedStages.length > 0
            ? loadedStages
            : [
                {
                  id: `stage-${Date.now()}`,
                  name: "Stage 1",
                  description: "",
                  start: "",
                  end: "",
                  status: "planned",
                  subStages: [],
                },
              ],
        );
      } else {
        setExistingSetupId(null);
        setContractorId("");
        setContractorSearchTerm("");
        setDates({ start: "", end: "" });
        setStages([
          {
            id: `stage-${Date.now()}`,
            name: "Stage 1",
            description: "",
            start: "",
            end: "",
            status: "planned",
            subStages: [],
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading existing setup:", error);
    }
  };

  const filteredContractors = (contractorsList || []).filter(
    (contractor) =>
      (contractor.name || contractor.contractor_name || "")
        .toLowerCase()
        .includes(contractorSearchTerm.toLowerCase()) ||
      (contractor.phone || "")
        .toLowerCase()
        .includes(contractorSearchTerm.toLowerCase()),
  );

  const handleContractorSelect = (contractor) => {
    setContractorId(contractor.id);
    setContractorSearchTerm(
      contractor.name || contractor.contractor_name || "",
    );
    setShowContractorDropdown(false);
  };

  const filteredUnits = units.filter((unit) =>
    (unit.name || unit.type || "")
      .toLowerCase()
      .includes(unitSearchTerm.toLowerCase()),
  );

  const handlePlanUpload = (unitId, e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type) &&
        file.size <= 10 * 1024 * 1024,
    );

    setPlans((prev) => ({
      ...prev,
      [unitId]: prev[unitId] ? [...prev[unitId], ...validFiles] : validFiles,
    }));
  };

  const removePlan = (unitId, index) => {
    setPlans((prev) => ({
      ...prev,
      [unitId]: prev[unitId].filter((_, idx) => idx !== index),
    }));
  };

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        id: `stage-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: `Stage ${prev.length + 1}`,
        description: "",
        start: "",
        end: "",
        status: "planned",
        subStages: [],
      },
    ]);
  };

  const removeStage = (id) => {
    if (stages.length === 1) return;
    setStages((prev) => prev.filter((stage) => stage.id !== id));
  };

  const updateStage = (id, field, value) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id ? { ...stage, [field]: value } : stage,
      ),
    );
  };

  const addSubStage = (stageId) => {
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id !== stageId) return stage;
        return {
          ...stage,
          subStages: [
            ...(stage.subStages || []),
            {
              id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: "Sub-stage",
              description: "",
              status: "planned",
            },
          ],
        };
      }),
    );
  };

  const removeSubStage = (stageId, subId) => {
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id !== stageId) return stage;
        return {
          ...stage,
          subStages: (stage.subStages || []).filter((sub) => sub.id !== subId),
        };
      }),
    );
  };

  const updateSubStage = (stageId, subId, field, value) => {
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id !== stageId) return stage;
        return {
          ...stage,
          subStages: (stage.subStages || []).map((sub) =>
            sub.id === subId ? { ...sub, [field]: value } : sub,
          ),
        };
      }),
    );
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!selectedProjectUid) {
        setErrorMessage("Select a project to continue.");
        return false;
      }
      if (!contractorId) {
        setErrorMessage("Select a contractor to continue.");
        return false;
      }
      if (!dates.start || !dates.end) {
        setErrorMessage("Provide a start and end date.");
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (stages.some((stage) => !stage.name.trim())) {
        setErrorMessage("All stage names must be filled.");
        return false;
      }
      return true;
    }

    return true;
  };

  const goToStep = (step) => {
    if (step === activeStep) return;
    if (step > activeStep && !validateStep(activeStep)) return;
    setErrorMessage("");
    setActiveStep(step);
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setErrorMessage("");
      setActiveStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(3)) return;

    try {
      setLoading(true);
      const project = projectsList.find(
        (item) => item.uid === selectedProjectUid,
      );
      if (!project) {
        setErrorMessage("Invalid project selected.");
        return;
      }

      const requestData = {
        project_id: project.id,
        project_type: project.type.toLowerCase(),
        contractor_id: parseInt(contractorId, 10),
        start_date: dates.start,
        end_date: dates.end,
        status: "draft",
        stages: stages.map((stage) => ({
          name: stage.name,
          description: stage.description,
          start: stage.start,
          end: stage.end,
          status: stage.status,
          sub_stages: stage.subStages || [],
        })),
        units_data: units,
      };

      let res;
      if (existingSetupId) {
        res = await operationApi.updateProjectSetup(
          existingSetupId,
          requestData,
        );
        setStatusMessage("OpenClaw model setup updated successfully.");
      } else {
        res = await operationApi.createProjectSetup(requestData);
        setStatusMessage("OpenClaw model setup created successfully.");
      }

      if (res?.data) {
        if (typeof res.data.stages === "string") {
          try {
            res.data.stages = JSON.parse(res.data.stages);
          } catch (err) {}
        }
        setExistingSetupId(res.data.id || existingSetupId);
      }

      setActiveStep(4);
    } catch (error) {
      console.error("OpenClaw wizard submit failed:", error);
      setErrorMessage("Unable to save OpenClaw model setup.");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              OpenClaw Model Setup Wizard
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Step through project setup, upload unit plans, define stages, and
              submit in a guided flow.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-[0.2em]">
            <span className="font-semibold text-slate-700">Current Step</span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
              {activeStep} / 4
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { step: 1, title: "Project details" },
            { step: 2, title: "Unit plans" },
            { step: 3, title: "Stages" },
            { step: 4, title: "Review" },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => goToStep(item.step)}
              className={`rounded-xl p-4 text-left border ${activeStep === item.step ? "border-green-700 bg-green-50 text-green-800 shadow" : "border-slate-200 bg-white text-slate-700 hover:border-green-300"}`}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Step {item.step}
              </div>
              <div className="mt-2 font-semibold">{item.title}</div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-700">
              {errorMessage}
            </div>
          )}
          {statusMessage && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700">
              {statusMessage}
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Select Project *
                  </label>
                  <select
                    value={selectedProjectUid}
                    onChange={handleProjectChange}
                    className="w-full border border-slate-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">-- Select Project --</option>
                    {projectsList.map((project) => (
                      <option key={project.uid} value={project.uid}>
                        [{project.type}] {project.name || project.project_name}{" "}
                        {project.location ? `• ${project.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium text-slate-700">
                    Select Contractor *
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={contractorSearchTerm}
                      onFocus={() => setShowContractorDropdown(true)}
                      onChange={(e) => {
                        setContractorSearchTerm(e.target.value);
                        setShowContractorDropdown(true);
                        if (!e.target.value) setContractorId("");
                      }}
                      placeholder="Search contractor..."
                      className="w-full border border-slate-300 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  {showContractorDropdown && contractorSearchTerm && (
                    <div className="absolute z-30 w-full mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto">
                      {filteredContractors.length > 0 ? (
                        filteredContractors.map((contractor) => (
                          <button
                            key={contractor.id}
                            type="button"
                            onClick={() => handleContractorSelect(contractor)}
                            className="w-full text-left p-3 hover:bg-blue-50"
                          >
                            <div className="font-semibold">
                              {contractor.name || contractor.contractor_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {contractor.phone || "No phone"}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-slate-500">
                          No contractors found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={dates.start}
                    onChange={(e) =>
                      setDates((prev) => ({ ...prev, start: e.target.value }))
                    }
                    className="w-full border border-slate-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={dates.end}
                    onChange={(e) =>
                      setDates((prev) => ({ ...prev, end: e.target.value }))
                    }
                    className="w-full border border-slate-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {selectedProject && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="text-sm text-slate-500">Project summary</div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Name
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {selectedProject.name || selectedProject.project_name}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Type
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {selectedProject.type}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Location
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {selectedProject.location ||
                          selectedProject.site_location ||
                          "Not available"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FaHome className="text-green-700" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Unit Plans
                </h2>
              </div>
              {units.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  Select a project first to see units.
                </div>
              ) : (
                <>
                  <div className="relative max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={unitSearchTerm}
                      onChange={(e) => setUnitSearchTerm(e.target.value)}
                      placeholder="Search unit plans..."
                      className="w-full border border-slate-300 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-4">
                    {filteredUnits.map((unit) => (
                      <div
                        key={unit.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {unit.name || `${unit.type} ${unit.id}`}
                            </div>
                            <div className="text-sm text-slate-500">
                              {unit.size ? `${unit.size} • ` : ""}Floor{" "}
                              {unit.floor || "N/A"}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-slate-600">
                            {plans[unit.id]?.length || 0} file(s)
                          </div>
                        </div>

                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handlePlanUpload(unit.id, e)}
                          className="mt-4 w-full cursor-pointer rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
                        />

                        {plans[unit.id]?.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {plans[unit.id].map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                              >
                                <div>
                                  <div className="font-medium text-slate-800">
                                    {file.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {formatFileSize(file.size)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePlan(unit.id, index)}
                                  className="rounded-full border border-slate-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-green-700" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Project Stages
                </h2>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Build the execution stages for your model setup.
                  </p>
                  <div className="erp-root">
                    <button
                      type="button"
                      onClick={addStage}
                      className="app-btn-primary"
                    >
                      <FaPlus className="inline mr-2" /> Add Stage
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) =>
                            updateStage(stage.id, "name", e.target.value)
                          }
                          placeholder={`Stage ${index + 1} name`}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <textarea
                          value={stage.description}
                          onChange={(e) =>
                            updateStage(stage.id, "description", e.target.value)
                          }
                          rows={3}
                          placeholder="Stage description"
                          className="mt-4 w-full rounded-2xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="flex flex-col gap-3 min-w-55">
                        <input
                          type="date"
                          value={stage.start}
                          onChange={(e) =>
                            updateStage(stage.id, "start", e.target.value)
                          }
                          className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="date"
                          value={stage.end}
                          onChange={(e) =>
                            updateStage(stage.id, "end", e.target.value)
                          }
                          className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeStage(stage.id)}
                          disabled={stages.length === 1}
                          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <FaTrash className="inline mr-2" /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-700">
                          Sub-stages
                        </div>
                        <div className="erp-root">
                          <button
                            type="button"
                            onClick={() => addSubStage(stage.id)}
                            className="app-btn-primary"
                          >
                            <FaPlus className="inline mr-2" /> Add
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {(stage.subStages || []).map((sub) => (
                          <div
                            key={sub.id}
                            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                          >
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) =>
                                updateSubStage(
                                  stage.id,
                                  sub.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="Sub-stage name"
                              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeSubStage(stage.id, sub.id)}
                              className="rounded-full border border-slate-300 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        {(!stage.subStages || stage.subStages.length === 0) && (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-4 text-sm text-slate-500">
                            No sub-stages added yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-emerald-500" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Review & Submit
                </h2>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Project
                  </h3>
                  <p className="mt-2 text-slate-900">
                    {selectedProject?.name ||
                      selectedProject?.project_name ||
                      "Not selected"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedProject?.type} •{" "}
                    {selectedProject?.location ||
                      selectedProject?.site_location ||
                      "No location"}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 border border-slate-200">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Contractor
                    </div>
                    <div className="mt-2 font-semibold text-slate-900">
                      {contractorSearchTerm || "Not selected"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border border-slate-200">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Timeline
                    </div>
                    <div className="mt-2 font-semibold text-slate-900">
                      {dates.start || "—"} to {dates.end || "—"}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">
                      Stages
                    </div>
                    <div className="text-sm text-slate-500">
                      {stages.length} total
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="rounded-2xl border border-slate-200 p-4 bg-slate-50"
                      >
                        <div className="font-semibold text-slate-900">
                          {stage.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {stage.description || "No description added."}
                        </div>
                        <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {stage.start || "Start not set"} →{" "}
                          {stage.end || "End not set"}
                        </div>
                        {(stage.subStages || []).length > 0 && (
                          <div className="mt-3 space-y-2">
                            {stage.subStages.map((sub) => (
                              <div
                                key={sub.id}
                                className="rounded-2xl bg-white p-3 border border-slate-200"
                              >
                                <div className="font-medium text-slate-900">
                                  {sub.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {sub.description ||
                                    "Sub-stage details not provided."}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Attachments
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Uploads are kept in the wizard session only and are not
                    posted to the backend.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {Object.keys(plans).length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-4 text-sm text-slate-500">
                        No files uploaded.
                      </div>
                    ) : (
                      Object.entries(plans).flatMap(([unitId, files]) =>
                        files.map((file, index) => (
                          <div
                            key={`${unitId}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="font-medium text-slate-900">
                                {file.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                        )),
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="text-sm text-slate-500">
                  Once you submit, the OpenClaw model setup will be saved in
                  project setups and available across work diary modules.
                </div>
              </div>
            </div>
          )}

          <div className="erp-root mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 1}
              className="app-btn-secondary flex items-center justify-center gap-2"
            >
              <FaArrowLeft /> Back
            </button>
            <div className="flex flex-col gap-3 sm:flex-row">
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="app-btn-primary flex items-center justify-center gap-2"
                >
                  Continue <FaArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="app-btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  {loading ? "Saving..." : "Submit Setup"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenClawModelSetupWizard;
