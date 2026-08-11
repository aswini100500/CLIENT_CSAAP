import React from "react";

import { useState, useEffect } from "react";

import {
  FaHome,
  FaArrowRight,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaSync,
  FaSave,
} from "react-icons/fa";

const HomeSection = ({
  projectName,
  setProjectName,
  projectType,
  setProjectType,
  city,
  setCity,
  locality,
  setLocality,
  landArea,
  setLandArea,
  revenuePlots,
  setRevenuePlots,
  addRevenuePlotNumber,
  setAddRevenuePlotNumber,
  attachment,
  setAttachment,
  onGenerate,
  isEditMode = false,
  editingProjectId = null,
  constants = {},
  PROJECT_TYPES,
}) => {
  const defaultConstants = {
    PROJECT_TYPES: {
      PLOTTING: "plotting",
      DUPLEX: "duplex",
      TRIPLEX: "triplex",
      APARTMENT: "apartment",
      COMMERCIAL: "commercial",
      CUSTOM: "custom",
    },
  };

  const safeConstants = { ...defaultConstants, ...constants };
  const projectTypes = PROJECT_TYPES || safeConstants.PROJECT_TYPES;

  const projectTypeOptions = [
    { value: projectTypes.PLOTTING, label: "Plotting" },
    { value: projectTypes.DUPLEX, label: "Duplex" },
    { value: projectTypes.TRIPLEX, label: "Triplex" },
    { value: projectTypes.APARTMENT, label: "Apartment" },
    { value: projectTypes.COMMERCIAL, label: "Commercial" },
    { value: projectTypes.CUSTOM, label: "Custom" },
  ];

  const [plotsData, setPlotsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedProjectId, setGeneratedProjectId] = useState(null);
  const [lastCreatedProjectName, setLastCreatedProjectName] = useState("");
  const [autoCreating, setAutoCreating] = useState(false);
  const [apiBaseUrl] = useState("https://api.csaap.com/api/tenantuser");

  const [plotStatuses, setPlotStatuses] = useState({});

  const [localCity, setLocalCity] = useState(city || "");
  const [localLocality, setLocalLocality] = useState(locality || "");
  const [localLandArea, setLocalLandArea] = useState(landArea || 0);
  const [localRevenuePlots, setLocalRevenuePlots] = useState(revenuePlots || 0);
  const [localAttachment, setLocalAttachment] = useState(attachment || null);

  useEffect(() => {
    const saved = localStorage.getItem("latestProjectId");
    const savedName = localStorage.getItem("latestProjectName");
    if (saved) setGeneratedProjectId(saved);
    if (savedName) setLastCreatedProjectName(savedName);
    if (revenuePlots && plotsData.length < revenuePlots) {
      const newPlots = [...plotsData];
      for (let i = plotsData.length; i < revenuePlots; i++) {
        newPlots[i] = {
          area: "",
          entryPlotNo: "",
          khataNo: "",
          fileName: "",
          file: null,
        };
      }
      setPlotsData(newPlots);
    }
  }, []);

  useEffect(() => {
    const target = Math.max(0, parseInt(localRevenuePlots) || 0);
    if (target > plotsData.length) {
      const newPlots = [...plotsData];
      for (let i = plotsData.length; i < target; i++) {
        newPlots[i] = {
          area: "",
          entryPlotNo: "",
          khataNo: "",
          fileName: "",
          file: null,
        };
      }
      setPlotsData(newPlots);
    } else if (target < plotsData.length) {
      setPlotsData(plotsData.slice(0, target));
      setPlotStatuses((prev) => {
        const next = {};
        for (let i = 0; i < target; i++) {
          next[i] = prev[i] || { status: "idle", message: "" };
        }
        return next;
      });
    }
  }, [localRevenuePlots]);

  const handleProjectNameChange = (value) => {
    if (
      generatedProjectId &&
      lastCreatedProjectName &&
      value !== lastCreatedProjectName
    ) {
      setGeneratedProjectId(null);
      localStorage.removeItem("latestProjectId");
      localStorage.removeItem("latestProjectName");
      setLastCreatedProjectName("");
    }
    setProjectName(value);
  };

  const handlePlotChange = (index, field, value) => {
    const updatedPlotsData = [...plotsData];
    updatedPlotsData[index] = { ...updatedPlotsData[index], [field]: value };
    setPlotsData(updatedPlotsData);
    setPlotStatuses((prev) => ({
      ...prev,
      [index]: { status: "idle", message: "" },
    }));
  };

  const handlePlotFileChange = (index, file) => {
    const updatedPlotsData = [...plotsData];
    updatedPlotsData[index] = {
      ...updatedPlotsData[index],
      fileName: file ? file.name : "",
      file: file || null,
    };
    setPlotsData(updatedPlotsData);
    setPlotStatuses((prev) => ({
      ...prev,
      [index]: { status: "idle", message: "" },
    }));
  };

  const safeNumber = (v) => {
    const n = Number(String(v || 0).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const calculateTotalPlotsArea = () => {
    return plotsData.reduce((total, plot) => total + safeNumber(plot?.area), 0);
  };

  const getFilledPlotsCount = () =>
    plotsData.filter(
      (plot) =>
        plot &&
        (plot.area || plot.entryPlotNo || plot.khataNo || plot.fileName),
    ).length;

  const trySyncParent = (field, value) => {
    if (field === "city" && typeof setCity === "function") setCity(value);
    if (field === "locality" && typeof setLocality === "function")
      setLocality(value);
    if (field === "landArea" && typeof setLandArea === "function")
      setLandArea(value);
    if (field === "revenuePlots" && typeof setRevenuePlots === "function")
      setRevenuePlots(value);
    if (field === "attachment" && typeof setAttachment === "function")
      setAttachment(value);
  };

  const clearAllPlots = () => {
    setPlotsData([]);
    setLocalRevenuePlots(0);
    trySyncParent("revenuePlots", 0);
    setPlotStatuses({});
  };

  const addPlot = () => {
    setLocalRevenuePlots((prev) => {
      const next = prev + 1;
      trySyncParent("revenuePlots", next);
      return next;
    });
  };

  const removePlot = (index) => {
    const updatedPlotsData = plotsData.filter((_, i) => i !== index);
    setPlotsData(updatedPlotsData);
    setLocalRevenuePlots((prev) => {
      const next = Math.max(0, prev - 1);
      trySyncParent("revenuePlots", next);
      return next;
    });

    setPlotStatuses((prev) => {
      const newStatus = {};
      updatedPlotsData.forEach((_, i) => {
        newStatus[i] = prev[i] || { status: "idle", message: "" };
      });
      return newStatus;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalAttachment(file);
      trySyncParent("attachment", file);
    }
  };

  const createProjectAPI = async (payload) => {
    const token = localStorage.getItem("authToken") || "";
    const url = `${apiBaseUrl}/projects`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`HTTP ${resp.status} - ${txt || resp.statusText}`);
    }

    return resp.json();
  };

  const checkProjectExists = async (projectId) => {
    const token = localStorage.getItem("authToken") || "";
    try {
      const checkUrl = `${apiBaseUrl}/projects/${projectId}?subdomain=cloudflare`;
      const response = await fetch(checkUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Error checking project:", error);
      return false;
    }
  };
  const handleSaveRevenuePlots = async () => {
    const projectId = generatedProjectId || editingProjectId;

    if (!projectId) {
      alert(
        "Please create the project first (project ID missing). Enter project name and click Generate Project.",
      );
      return;
    }

    const exists = await checkProjectExists(projectId);
    if (!exists) {
      if (generatedProjectId) {
        localStorage.removeItem("latestProjectId");
        localStorage.removeItem("latestProjectName");
        setGeneratedProjectId(null);
        setLastCreatedProjectName("");
      }

      alert(
        `The project with ID ${projectId} was not found on the server.\n\n` +
          `Please click "Generate Project" first to create/update the project, then save revenue plots again.`,
      );
      return;
    }

    if (!plotsData || plotsData.length === 0) {
      alert("No plots to save.");
      return;
    }

    const token = localStorage.getItem("authToken") || "";

    const filledPlots = plotsData
      .map((plot, idx) => ({ plot, idx }))
      .filter(
        (item) =>
          item.plot &&
          (item.plot.area ||
            item.plot.entryPlotNo ||
            item.plot.khataNo ||
            item.plot.fileName),
      );

    if (filledPlots.length === 0) {
      alert("No filled plots to save.");
      return;
    }

    const initStatuses = {};
    filledPlots.forEach(({ idx }) => {
      initStatuses[idx] = { status: "pending", message: "" };
    });
    setPlotStatuses((prev) => ({ ...prev, ...initStatuses }));

    setIsLoading(true);

    try {
      const endpointBase = `${apiBaseUrl}/projects/${projectId}/revenue-plots`;

      const requests = filledPlots.map(({ plot, idx }) => {
        const plotNumber = idx + 1;

        const payload = {
          subdomain: "cloudflare",
          plot_number: plotNumber,
          area: plot.area ? Number(plot.area) : 0,
          entry_plot_no: plot.entryPlotNo || "",
          khata_no: plot.khataNo || "",
          plot_document: plot.fileName || "",
          file_name: plot.fileName || "",
        };

        return fetch(endpointBase, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        })
          .then(async (resp) => {
            if (!resp.ok) {
              const txt = await resp.text().catch(() => "");
              let msg = txt || resp.statusText;
              try {
                const j = JSON.parse(txt);
                if (j?.message) msg = j.message;
              } catch (e) {}
              throw new Error(msg);
            }
            return resp.json().then((j) => ({ result: j, idx }));
          })
          .catch((err) => {
            throw { err, idx };
          });
      });

      const results = await Promise.allSettled(requests);
      let successes = 0;
      const failures = [];

      results.forEach((r) => {
        if (r.status === "fulfilled") {
          const { idx } = r.value;
          successes++;
          setPlotStatuses((prev) => ({
            ...prev,
            [idx]: { status: "saved", message: "created" },
          }));
        } else {
          const reason = r.reason;
          const idx = reason?.idx;
          const message =
            (reason?.err && reason?.err.message) ||
            (reason && reason.message) ||
            "Unknown error";

          if (typeof idx === "number") {
            setPlotStatuses((prev) => ({
              ...prev,
              [idx]: { status: "error", message },
            }));
          }
          failures.push({ idx, message });
        }
      });

      if (successes > 0) {
        alert(
          `${successes} revenue plot(s) saved successfully for project ${projectId}.`,
        );
      }
      if (failures.length > 0) {
        const first = failures[0];
        alert(
          `${failures.length} plot(s) failed. First error (plot ${
            typeof first.idx === "number" ? first.idx + 1 : "?"
          }): ${first.message}. Check console for details.`,
        );
        console.error("Revenue plot save failures:", failures);
      }
    } catch (err) {
      console.error("Error saving revenue plots:", err);
      alert(`Failed to save revenue plots: ${err.message || "Check console"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoCreateProject = async () => {
    if (!projectName || autoCreating) return;
    if (lastCreatedProjectName && projectName === lastCreatedProjectName) {
      return;
    }

    setAutoCreating(true);
    try {
      const minimalPayload = {
        name: projectName,
        type: projectType || projectTypes.PLOTTING,
        subdomain: "cloudflare",
      };

      const result = await createProjectAPI(minimalPayload);

      const newId =
        result?.project?.id ||
        result?.id ||
        result?.data?.id ||
        result?.project?._id ||
        result?.data?._id ||
        null;

      if (newId) {
        setGeneratedProjectId(newId);
        setLastCreatedProjectName(projectName);
        localStorage.setItem("latestProjectId", newId);
        localStorage.setItem("latestProjectName", projectName);
        alert(`Project created (ID: ${newId}). You can now continue editing.`);
      } else {
        if (result?.project) {
          const maybe = result.project.id || result.project._id || null;
          if (maybe) {
            setGeneratedProjectId(maybe);
            setLastCreatedProjectName(projectName);
            localStorage.setItem("latestProjectId", maybe);
            localStorage.setItem("latestProjectName", projectName);
            alert(`Project created (ID: ${maybe}).`);
          } else {
            console.warn("Project created but no ID in response:", result);
            alert(
              "Project created but API didn't return an ID. Check console.",
            );
          }
        } else {
          console.warn("Unexpected create project response:", result);
          alert(
            "Project API responded but did not return an ID. Check console.",
          );
        }
      }
    } catch (err) {
      console.error("Auto-create project failed:", err);
      alert(`Auto-create failed: ${err.message || "Check console"}`);
    } finally {
      setAutoCreating(false);
    }
  };

  const handleProjectNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAutoCreateProject();
    }
  };

  const isEditing =
    Boolean(isEditMode) ||
    Boolean(generatedProjectId) ||
    Boolean(editingProjectId);

  const handleGenerateProject = async () => {
    if (!projectName || !projectType) {
      alert("Please enter project name and select project type");
      return;
    }

    if (projectType === projectTypes.DUPLEX && !localLandArea) {
      alert("Please enter land area for duplex project");
      return;
    }

    if (projectType === projectTypes.TRIPLEX && !localLandArea) {
      alert("Please enter land area for triplex project");
      return;
    }

    if (projectType === projectTypes.PLOTTING && !localRevenuePlots) {
      alert("Please enter revenue plots for plotting project");
      return;
    }

    setIsLoading(true);
    let createdLocally = false;

    try {
      const projectData = {
        subdomain: "cloudflare",
        name: projectName,
        type: projectType,
        city: localCity || "",
        locality: localLocality || "",
        land_zone: "Residential",
        residential_sub_type:
          projectType === projectTypes.DUPLEX
            ? "duplex"
            : projectType === projectTypes.TRIPLEX
              ? "triplex"
              : "",
        total_land_area: parseInt(localLandArea),
        built_up_area: parseInt(localLandArea) * 0.8,
        total_floors:
          projectType === projectTypes.DUPLEX
            ? 2
            : projectType === projectTypes.TRIPLEX
              ? 3
              : 1,
        kissama: `Generated ${projectType} project`,
        boundary_type: "compound_wall",
        broker_id: 1,
        purchaser: "",
        constructor: "",
        approval_status: [{ authority: "RERA", status: "Pending" }],
        transaction_details: {
          possession_status: "Under Construction",
          available_from: {
            month: "January",
            year: new Date().getFullYear().toString(),
          },
        },
        price_details: {
          expected_price: "0",
          token_amount: "0",
          price_negotiable: false,
          price_per_sqft: 0,
        },
        attachment: localAttachment ? localAttachment.name : "",
        common_facilities: [
          { name: "Car Parking", selected: true },
          { name: "Security", selected: true },
        ],
        custom_selected_types: [projectType, "residential"],
        current_custom_type: projectType,
        ...(projectType === projectTypes.PLOTTING && {
          revenue_plots: localRevenuePlots,
          plots_data: plotsData,
        }),
        ...((projectType === projectTypes.DUPLEX ||
          projectType === projectTypes.TRIPLEX) && {
          unit_configuration: [
            { floor: "Ground", units: 1, configuration: "3BHK" },
            ...(projectType === projectTypes.DUPLEX
              ? [{ floor: "First", units: 1, configuration: "3BHK" }]
              : [
                  { floor: "First", units: 1, configuration: "3BHK" },
                  { floor: "Second", units: 1, configuration: "3BHK" },
                ]),
          ],
        }),
      };

      const token = localStorage.getItem("authToken") || "";

      if (generatedProjectId) {
        const projectExists = await checkProjectExists(generatedProjectId);

        if (!projectExists) {try {
            const result = await createProjectAPI(projectData);

            const newId =
              result?.project?.id ||
              result?.id ||
              result?.data?.id ||
              result?.project?._id ||
              result?.data?._id ||
              null;

            if (newId) {
              setGeneratedProjectId(newId);
              setLastCreatedProjectName(projectName);
              localStorage.setItem("latestProjectId", newId);
              localStorage.setItem("latestProjectName", projectName);

              const localProjectData = {
                id: newId,
                name: projectName,
                type: projectType,
                city: localCity || "",
                locality: localLocality || "",
                landArea: localLandArea || "",
                revenuePlots: localRevenuePlots || "",
                addRevenuePlotNumber: addRevenuePlotNumber || "",
                attachment: localAttachment || null,
                plotsData: plotsData,
                createdAt: new Date().toLocaleDateString("en-IN"),
                updatedAt: new Date().toLocaleDateString("en-IN"),
                status: "created",
                apiData: result.project || result,
              };
              onGenerate(localProjectData);
              alert(
                `Project "${projectName}" created successfully with ID: ${newId}`,
              );
              setIsLoading(false);
              return;
            }
          } catch (createError) {
            console.error("Error creating new project:", createError);
            alert(`Failed to create project: ${createError.message}`);
            setIsLoading(false);
            return;
          }
        }

        try {
          const updateUrl = `${apiBaseUrl}/projects/${generatedProjectId}?subdomain=cloudflare`;

          const response = await fetch(updateUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(projectData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `HTTP ${response.status} - ${errorText || response.statusText}`,
            );
          }

          const result = await response.json();

          const localProjectData = {
            id: generatedProjectId,
            name: projectName,
            type: projectType,
            city: localCity || "",
            locality: localLocality || "",
            landArea: localLandArea || "",
            revenuePlots: localRevenuePlots || "",
            addRevenuePlotNumber: addRevenuePlotNumber || "",
            attachment: localAttachment || null,
            plotsData: plotsData,
            updatedAt: new Date().toLocaleDateString("en-IN"),
            status: "updated",
            apiData: result.project || result,
          };

          onGenerate(localProjectData);
          alert(
            `Project "${projectName}" updated successfully with ID: ${generatedProjectId}`,
          );
        } catch (updateError) {
          console.error("Error updating project:", updateError);
          alert(`Failed to update project: ${updateError.message}`);
          createdLocally = true;
        }
      } else {
        try {
          const result = await createProjectAPI(projectData);

          const newId =
            result?.project?.id ||
            result?.id ||
            result?.data?.id ||
            result?.project?._id ||
            result?.data?._id ||
            null;

          if (newId) {
            setGeneratedProjectId(newId);
            setLastCreatedProjectName(projectName);
            localStorage.setItem("latestProjectId", newId);
            localStorage.setItem("latestProjectName", projectName);

            const localProjectData = {
              id: newId,
              name: projectName,
              type: projectType,
              city: localCity || "",
              locality: localLocality || "",
              landArea: localLandArea || "",
              revenuePlots: localRevenuePlots || "",
              addRevenuePlotNumber: addRevenuePlotNumber || "",
              attachment: localAttachment || null,
              plotsData: plotsData,
              createdAt: new Date().toLocaleDateString("en-IN"),
              updatedAt: new Date().toLocaleDateString("en-IN"),
              status: "created",
              apiData: result.project || result,
            };
            onGenerate(localProjectData);
            alert(
              `Project "${projectName}" created successfully with ID: ${newId}`,
            );
          } else {
            createdLocally = true;
          }
        } catch (error) {
          console.error("Error creating project:", error);
          alert(`Failed to create project: ${error.message}`);
          createdLocally = true;
        }
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert(`Failed to save project: ${error.message}`);
      createdLocally = true;
    } finally {
      setIsLoading(false);
      if (createdLocally) {
        const localProjectData = {
          id: generatedProjectId || Date.now(),
          name: projectName,
          type: projectType,
          city: localCity || "",
          locality: localLocality || "",
          landArea: localLandArea || "",
          revenuePlots: localRevenuePlots || "",
          addRevenuePlotNumber: addRevenuePlotNumber || "",
          attachment: localAttachment || null,
          plotsData: plotsData,
          updatedAt: new Date().toLocaleDateString("en-IN"),
          status: generatedProjectId
            ? "draft_updated_offline"
            : "draft_offline",
        };
        onGenerate(localProjectData);
        alert(
          generatedProjectId
            ? "Project updated locally (API failed)."
            : "Project created locally (API failed).",
        );
      }
    }
  };

  const showLocationFields = [
    projectTypes.DUPLEX,
    projectTypes.TRIPLEX,
    projectTypes.APARTMENT,
    projectTypes.COMMERCIAL,
  ].includes(projectType);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {generatedProjectId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaHome className="text-green-600 mr-2" />
              <span className="font-semibold text-green-800">
                {lastCreatedProjectName === projectName
                  ? "Project updated Successfully!"
                  : "Project Created Successfully!"}
              </span>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Project ID: {generatedProjectId}
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">
            {lastCreatedProjectName === projectName
              ? "Project is loaded and ready for editing. Make your changes and click 'Update Project' to save."
              : "Project ID has been generated and saved. You can now proceed to add project details."}
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaHome className="mr-3 text-indigo-600" />
        Create New Project
      </h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => handleProjectNameChange(e.target.value)}
                  onKeyDown={handleProjectNameKeyDown}
                  className="w-full border border-gray-300 rounded-md p-3 pr-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter project name"
                />

                {!isEditing && (
                  <div>
                    <button
                      type="button"
                      onClick={handleAutoCreateProject}
                      disabled={
                        autoCreating ||
                        !projectName ||
                        projectName === lastCreatedProjectName
                      }
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-md text-sm font-medium ${
                        autoCreating ||
                        !projectName ||
                        projectName === lastCreatedProjectName
                          ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                      title={
                        projectName === lastCreatedProjectName
                          ? "Already created for this name"
                          : "Create project"
                      }
                    >
                      {autoCreating ? (
                        <span className="flex items-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Creating
                        </span>
                      ) : (
                        "Done"
                      )}
                    </button>
                    <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                      {autoCreating ? (
                        <FaSync className="animate-spin text-indigo-500" />
                      ) : generatedProjectId ? (
                        <FaCheckCircle
                          className="text-green-600"
                          title={`Project created successfully`}
                        />
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs">
                {autoCreating ? (
                  <span className="text-sm text-indigo-600">
                    Creating project...
                  </span>
                ) : generatedProjectId ? (
                  <span className="text-sm text-green-600">
                    Project created
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">
                    Press Enter or click Create to create project (no
                    auto-create on blur).
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select project type</option>
                {projectTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showLocationFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={localCity}
                  onChange={(e) => {
                    setLocalCity(e.target.value);
                    trySyncParent("city", e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locality
                </label>
                <input
                  type="text"
                  value={localLocality}
                  onChange={(e) => {
                    setLocalLocality(e.target.value);
                    trySyncParent("locality", e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter locality"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Land Area (sq. ft)
                </label>
                <input
                  type="number"
                  min="0"
                  value={localLandArea}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setLocalLandArea(v);
                    trySyncParent("landArea", v);
                  }}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter total land area"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 md:p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-indigo-700">
              Revenue Plots Configuration
            </h2>
            {localRevenuePlots > 0 && (
              <button
                onClick={clearAllPlots}
                className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
              >
                <FaTrash className="mr-1" /> Clear All Plots
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Number of Revenue Plots
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={localRevenuePlots}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  const limited = Math.min(
                    Math.max(0, isNaN(num) ? 0 : num),
                    50,
                  );
                  setLocalRevenuePlots(limited);
                  trySyncParent("revenuePlots", limited);
                }}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter total plots"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Attachment (if any)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const f = e.target.files[0];
                  setLocalAttachment(f || null);
                  trySyncParent("attachment", f || null);
                }}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {localAttachment && (
                <p className="text-xs text-green-600 mt-1 truncate">
                  ✓ {localAttachment.name}
                </p>
              )}
            </div>
          </div>

          {localRevenuePlots > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Revenue Plot Details ({localRevenuePlots}{" "}
                  {localRevenuePlots === 1 ? "Plot" : "Plots"})
                </h4>
                <span className="text-sm text-gray-600">
                  Enter details for each revenue plot
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plotsData.map((plot, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg border border-gray-300 p-4 space-y-3 relative"
                  >
                    <button
                      onClick={() => removePlot(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Remove plot"
                    >
                      ×
                    </button>

                    <div className="flex items-center justify-between border-b pb-2">
                      <h5 className="font-medium text-gray-800">
                        Plot {index + 1}
                      </h5>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Plot Area (sq. ft)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={plot?.area || ""}
                        onChange={(e) =>
                          handlePlotChange(index, "area", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter area"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Entry Plot No.
                      </label>
                      <input
                        type="text"
                        value={plot?.entryPlotNo || ""}
                        onChange={(e) =>
                          handlePlotChange(index, "entryPlotNo", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter plot number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Khata No.
                      </label>
                      <input
                        type="text"
                        value={plot?.khataNo || ""}
                        onChange={(e) =>
                          handlePlotChange(index, "khataNo", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter khata number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Plot Document
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          handlePlotFileChange(index, e.target.files[0])
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {plot?.fileName && (
                        <p className="text-xs text-green-600 mt-1 truncate">
                          ✓ {plot.fileName}
                        </p>
                      )}
                    </div>

                    <div>
                      {plotStatuses[index] &&
                        plotStatuses[index].status === "pending" && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                            Saving…
                          </span>
                        )}
                      {plotStatuses[index] &&
                        plotStatuses[index].status === "saved" && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            Saved ({plotStatuses[index].message})
                          </span>
                        )}
                      {plotStatuses[index] &&
                        plotStatuses[index].status === "error" && (
                          <div>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              Error
                            </span>
                            <div className="text-red-700 text-xs mt-1 wrap-break-word">
                              {plotStatuses[index].message}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600">
                    {getFilledPlotsCount()} of {localRevenuePlots} plots filled
                  </span>
                </div>

                <div className="mt-2 text-xs text-blue-700 flex items-center justify-between">
                  <button
                    onClick={handleSaveRevenuePlots}
                    disabled={isLoading || getFilledPlotsCount() === 0}
                    className={`px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-all duration-200 flex items-center gap-1 ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> Save Revenue Plots
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleGenerateProject}
            disabled={isLoading || !projectName || !projectType}
            className={`px-8 py-3 rounded-md font-medium text-white flex items-center transition-colors ${
              isLoading || !projectName || !projectType
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {generatedProjectId
                  ? "Updating Project..."
                  : "Creating Project..."}
              </>
            ) : (
              <>
                {generatedProjectId ? "Update Project" : "Generate Project"}
                <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
