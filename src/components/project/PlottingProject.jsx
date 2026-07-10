


























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaCheckCircle,
  FaQuestionCircle,
  FaRulerCombined,
  FaBuilding,
  FaLayerGroup,
  FaMoneyBill,
  FaSave,
  FaEdit,
  FaChevronRight,
  FaMapMarkerAlt,
  FaChartLine,
  FaSortAmountUp,
  FaInfoCircle,
  FaArrowRight,
  FaTimes,
  FaChevronUp,
  FaChevronDown,
  FaArrowLeft,
  FaEye,
  FaTable,
  FaFileAlt,
  FaPen,
  FaSave as FaSaveIcon,
  FaLongArrowAltLeft,
  FaCalendarAlt,
  FaCogs
} from "react-icons/fa";
import axios from "axios";
import projectService from "./projectService";
import useAuth from "../../hooks/useAuth";

const PlottingProject = ({
  projectName,
  setProjectName,
  projectType,
  setProjectType,
  city,
  setCity,
  locality,
  setLocality,
  landZone,
  setLandZone,
  onSaveProject,
  PROJECT_TYPES = {
    APARTMENT: "Apartment",
    PLOTTING: "Plotting",
    DUPLEX: "Duplex",
    TRIPLEX: "Triplex",
    COMMERCIAL: "Commercial",
    CUSTOM: "Custom",
  },
  onClose,
  editingProjectId,
  selectedProject,
  editingPlotId,
  initialLandArea = "",
  initialRevenuePlots = 0,
  initialParsedPlotsData = [],
  initialParsedRevenuePlotsData = [],
  initialTab = "project-info",
  isSubtype = false
}) => {
  const { user } = useAuth();

  const [revenuePlots, setRevenuePlots] = useState(initialRevenuePlots);
  const [loadingBrokers, setLoadingBrokers] = useState(false);
  const [plots, setPlots] = useState(initialParsedPlotsData);
  const [plotsData, setPlotsData] = useState(initialParsedRevenuePlotsData);

  const [selectedPlots, setSelectedPlots] = useState([]);
  const [isCornerPlot, setIsCornerPlot] = useState(false);
  const [priceDetails, setPriceDetails] = useState({ expectedPrice: "", tokenAmount: "" });


  const [propertyFeatures, setPropertyFeatures] = useState({
    landArea: initialLandArea,
    propertyStatus: "",
    hasOuthouse: "",
    outhouseArea: "",
    possessionStatus: "",
    availableFromMonth: "",
    availableFromYear: "",
    openSides: "",
    roadWidth: "",
    boundaryWall: "",
    gatedColony: ""
  });

  const [areaDetails, setAreaDetails] = useState({ plotArea: "", plotLength: "", plotBreadth: "" });
  const [kissama, setKissama] = useState("");
  const [purchaser, setPurchaser] = useState("");
  const [constructor, setConstructor] = useState("");
  const [brokersList, setBrokersList] = useState([]);

  const [attachment, setAttachment] = useState(null);


  const [manualPlotCount, setManualPlotCount] = useState(0);


  const [boundary, setBoundary] = useState("");
  const [reference, setReference] = useState("");
  const [staffEngaged, setStaffEngaged] = useState("");

  const [loanProvider, setLoanProvider] = useState("");
  const [plotCustomFacilities, setPlotCustomFacilities] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState([{ authority: "", status: "" }]);
  const [broker, setBroker] = useState("");
  const [contractorsList, setContractorsList] = useState([]);
  const [loadingContractors, setLoadingContractors] = useState(false);



  const [editingPlotIdInternal, setEditingPlotIdInternal] = useState(null);
  const [currentPlotData, setCurrentPlotData] = useState(null);

  useEffect(() => {
    if (initialParsedPlotsData && initialParsedPlotsData.length > 0) {
      setPlots(initialParsedPlotsData);
    }
  }, [initialParsedPlotsData]);

  useEffect(() => {
    if (initialParsedRevenuePlotsData && initialParsedRevenuePlotsData.length > 0) {
      setPlotsData(initialParsedRevenuePlotsData);
    }
  }, [initialParsedRevenuePlotsData]);


  const [activeTab, setActiveTab] = useState(initialTab);


  const FACILITIES = [
    { key: "parking", label: "Parking" },
    { key: "gym", label: "Gym" },
    { key: "pool", label: "Swimming Pool" },
    { key: "garden", label: "Garden" },
    { key: "security", label: "Security" },
    { key: "elevator", label: "Elevator" },
  ];


  useEffect(() => {






    if (selectedProject && editingProjectId) {
      const projectData = selectedProject;


      if (projectData.plots_data && initialParsedPlotsData.length === 0) {
        try {
          let parsedPlots = [];
          if (typeof projectData.plots_data === 'string') {
            parsedPlots = JSON.parse(projectData.plots_data);
          } else if (Array.isArray(projectData.plots_data)) {
            parsedPlots = projectData.plots_data;
          }

          if (parsedPlots.length > 0) {
            setPlots(parsedPlots);

          }
        } catch (error) {
          console.error("Error parsing plots_data:", error);
        }
      }


      if (projectData.revenue_plots_data && initialParsedRevenuePlotsData.length === 0) {
        try {
          let parsedRevenuePlots = [];
          if (typeof projectData.revenue_plots_data === 'string') {
            parsedRevenuePlots = JSON.parse(projectData.revenue_plots_data);
          } else if (Array.isArray(projectData.revenue_plots_data)) {
            parsedRevenuePlots = projectData.revenue_plots_data;
          }

          if (parsedRevenuePlots.length > 0) {
            setPlotsData(parsedRevenuePlots);

          }
        } catch (error) {
          console.error("Error parsing revenue_plots_data:", error);
        }
      }


      if (projectData.revenue_plots && revenuePlots === 0) {
        setRevenuePlots(projectData.revenue_plots);

      }


      if (projectData.land_area && !propertyFeatures.landArea) {
        setPropertyFeatures(prev => ({
          ...prev,
          landArea: projectData.land_area
        }));

      }


      if (projectData.broker) {
        setBroker(projectData.broker);
      }
      if (projectData.constructor) {
        setConstructor(projectData.constructor);
      }


      if (editingPlotId && plots.length > 0) {
        const plotToEdit = plots.find(p => p.id === editingPlotId);
        if (plotToEdit) {
          setCurrentPlotData(plotToEdit);
          loadPlotDataForEditing(plotToEdit);

          setTimeout(() => {
            setActiveTab("plots");
            setSelectedPlots([editingPlotId]);
          }, 100);
        }
      }
    }


    if (initialParsedPlotsData.length > 0 && plots.length === 0) {
      setPlots(initialParsedPlotsData);

    }

    if (initialParsedRevenuePlotsData.length > 0 && plotsData.length === 0) {
      setPlotsData(initialParsedRevenuePlotsData);

    }

  }, [selectedProject, editingProjectId, editingPlotId, initialParsedPlotsData, initialParsedRevenuePlotsData, initialRevenuePlots, initialLandArea]);


  useEffect(() => {
    if (editingPlotIdInternal) {
      const plotToEdit = plots.find(p => p.id === editingPlotIdInternal);
      if (plotToEdit) {
        setCurrentPlotData(plotToEdit);
        loadPlotDataForEditing(plotToEdit);
      }
    }
  }, [editingPlotIdInternal, plots]);


  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoadingBrokers(true);
        const data = await projectService.getAllBrokers();
        setBrokersList(data || []);
      } catch (error) {
        console.error("Failed to fetch brokers:", error);
      } finally {
        setLoadingBrokers(false);
      }
    };

    const fetchContractors = async () => {
      try {
        setLoadingContractors(true);
        const data = await projectService.getAllContractors();
        setContractorsList(data || []);
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
      } finally {
        setLoadingContractors(false);
      }
    };

    fetchBrokers();
    fetchContractors();
  }, []);



  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);


  const handleApprovalChange = (index, field, value) => {
    const updatedApprovals = [...approvalStatus];
    updatedApprovals[index] = { ...updatedApprovals[index], [field]: value };
    setApprovalStatus(updatedApprovals);
  };


  const addApprovalAuthority = () => {
    setApprovalStatus([...approvalStatus, { authority: "", status: "" }]);
  };


  const removeApprovalAuthority = (index) => {
    setApprovalStatus(approvalStatus.filter((_, i) => i !== index));
  };

  const renderBrokerSelect = () => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        Broker
      </label>

      <select
        value={broker}
        onChange={(e) => setBroker(e.target.value)}
        disabled={loadingBrokers}
        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm
                 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                 outline-none transition-all"
      >
        <option value="">
          {loadingBrokers ? "Loading brokers..." : "Select broker"}
        </option>

        {Array.isArray(brokersList) &&
          brokersList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))
        }

      </select>
    </div>
  );

  const renderContractorSelect = () => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        Contractor
      </label>

      <select
        value={constructor}
        onChange={(e) => setConstructor(e.target.value)}
        disabled={loadingContractors}
        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm
                 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                 outline-none transition-all"
      >
        <option value="">
          {loadingContractors ? "Loading contractors..." : "Select contractor"}
        </option>

        {Array.isArray(contractorsList) &&
          contractorsList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))
        }

      </select>
    </div>
  );



  const loadPlotDataForEditing = (plot) => {
    setIsCornerPlot(plot.isCornerPlot || false);
    setPriceDetails({
      expectedPrice: plot.priceDetails?.expectedPrice || "",
      tokenAmount: plot.priceDetails?.tokenAmount || ""
    });
    setPropertyFeatures(prev => ({
      ...prev,
      landArea: plot.propertyFeatures?.landArea || prev.landArea,
      propertyStatus: plot.propertyFeatures?.propertyStatus || "",
      hasOuthouse: plot.propertyFeatures?.hasOuthouse || "",
      outhouseArea: plot.propertyFeatures?.outhouseArea || "",
      possessionStatus: plot.propertyFeatures?.possessionStatus || "",
      availableFromMonth: plot.propertyFeatures?.availableFromMonth || "",
      availableFromYear: plot.propertyFeatures?.availableFromYear || "",
      openSides: plot.propertyFeatures?.openSides || "",
      roadWidth: plot.propertyFeatures?.roadWidth || "",
      boundaryWall: plot.propertyFeatures?.boundaryWall || "",
      gatedColony: plot.propertyFeatures?.gatedColony || "",
    }));
    setAreaDetails({
      plotArea: plot.areaDetails?.plotArea || "",
      plotLength: plot.areaDetails?.plotLength || "",
      plotBreadth: plot.areaDetails?.plotBreadth || ""
    });
    setKissama(plot.kissama || "");
    setPurchaser(plot.purchaser || "");
    setConstructor(plot.constructor || "");
    setBroker(plot.broker || "");
  };


  const handleSaveProject = async () => {
    if (!projectName || !projectType) {
      alert("Please enter project name and type");
      return;
    }

    try {

      const projectData = {
        id: editingProjectId,
        name: projectName,
        type: projectType,
        city,
        locality,
        landZone,
        slug: user?.slug || "",
        landArea: propertyFeatures.landArea || null,
        plots: plots,
        revenuePlots: revenuePlots || 0,
        plotsData: plotsData,
        broker: broker || null,
        constructor: constructor || ""
      };



      if (isSubtype) {


        onSaveProject?.(projectData);
        return;
      }

      if (onSaveProject) {
        await onSaveProject(projectData);
      }

      alert("Project saved successfully!");

    } catch (error) {
      console.error("❌ Error saving plotting project:", error);
      alert("Failed to save project.");
    }
  };



  const addMultiplePlots = () => {
    if (manualPlotCount <= 0) {
      alert("Please enter a valid number of plots");
      return;
    }

    const newPlots = [];
    for (let i = 1; i <= manualPlotCount; i++) {
      const plotNumber = plots.length + i;
      const plotName = `Plot ${plotNumber}`;

      const newPlot = {
        id: generateId(),
        name: plotName,
        isCornerPlot: false,
        priceDetails: { expectedPrice: "", tokenAmount: "" },
        propertyFeatures: {
          landArea: propertyFeatures.landArea || "",
          propertyStatus: "",
          hasOuthouse: "",
          outhouseArea: "",
          possessionStatus: "",
          availableFromMonth: "",
          availableFromYear: "",
          openSides: "",
          roadWidth: "",
          boundaryWall: "",
          gatedColony: ""
        },
        areaDetails: { plotArea: "", plotLength: "", plotBreadth: "" },
        kissama: "",
        purchaser: "",
        broker:"",
        constructor: "",
        isComplete: false,
        status: "draft",
        isBeingEdited: false,
        lastSaved: null,
      };
      newPlots.push(newPlot);
    }

    setPlots([...plots, ...newPlots]);
    setManualPlotCount(0);
    alert(`Added ${manualPlotCount} plots successfully!`);
  };


  const handlePlotClick = (plot) => {
    if (selectedPlots.includes(plot.id)) {

      const newSelection = selectedPlots.filter(id => id !== plot.id);
      setSelectedPlots(newSelection);
      if (newSelection.length === 0) setCurrentPlotData(null);
    } else {
      setSelectedPlots([...selectedPlots, plot.id]);
      setCurrentPlotData(plot);
      loadPlotDataForEditing(plot);
    }
  };

  const togglePlotSelection = (plot) => {
    handlePlotClick(plot);
  };


  const savePlotChanges = (plotIds) => {
    if (!plotIds || plotIds.length === 0) return;

    const updatedPlots = plots.map((plot) => {
      if (plotIds.includes(plot.id)) {
        const updatedPlot = {
          ...plot,
          isCornerPlot,
          priceDetails,
          propertyFeatures,
          areaDetails,
          kissama,
          purchaser,
          broker,
          constructor,
          lastSaved: new Date().toISOString(),
        };
        updatedPlot.isComplete = !!(
          priceDetails.expectedPrice &&
          areaDetails.plotArea &&
          purchaser &&
          constructor
        );
        return updatedPlot;
      }
      return plot;
    });

    setPlots(updatedPlots);
    alert(`Plot details saved to ${plotIds.length} plot(s)!`);
  };


  const removePlot = (plotId) => {
    if (window.confirm("Are you sure you want to remove this plot?")) {
      const updatedPlots = plots.filter(plot => plot.id !== plotId);
      setPlots(updatedPlots);
      setSelectedPlots(prev => prev.filter(id => id !== plotId));
      alert("Plot removed successfully!");
    }
  };


  const handlePlotChange = (index, field, value) => {
    const updatedPlotsData = [...plotsData];
    if (!updatedPlotsData[index]) {
      updatedPlotsData[index] = {};
    }
    updatedPlotsData[index][field] = value;
    setPlotsData(updatedPlotsData);
  };

  const handlePlotFileChange = (index, file) => {
    const updatedPlotsData = [...plotsData];
    if (!updatedPlotsData[index]) {
      updatedPlotsData[index] = {};
    }
    updatedPlotsData[index].fileName = file ? file.name : "";
    updatedPlotsData[index].file = file;
    setPlotsData(updatedPlotsData);
  };

  const calculateTotalPlotsArea = () => {
    return plotsData.reduce((total, plot) => {
      return total + (parseFloat(plot?.area) || 0);
    }, 0);
  };

  const getFilledPlotsCount = () => {
    return plotsData.filter(
      (plot) => plot && (plot.area || plot.entryPlotNo || plot.khataNo)
    ).length;
  };


  const handleSaveRevenuePlots = () => {
    alert("Revenue plots saved successfully!");
    setActiveTab("plots");
  };


  const NavigationTabs = () => {
    const tabs = [
      { id: "project-info", label: "Project Info", icon: FaBuilding },
      { id: "revenue-plots", label: "Revenue Plots", icon: FaChartLine },
      { id: "plots", label: "Plots & Details", icon: FaLayerGroup },
    ];

    return (
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 pb-3 pt-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${active
                ? "border-emerald-600 text-slate-900 rounded-b-lg"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
              {label}
            </button>
          );
        })}
      </div>
    );
  };


  const renderProjectInfo = () => (
    <div className="space-y-6">



      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center">
            <FaBuilding className="mr-2 text-emerald-600 h-5 w-5" />
            Project Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className=" text-sm font-medium text-slate-700 mb-1 flex items-center">
                <span className="text-red-500 mr-1">*</span>
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 flex items-center">
                <span className="text-red-500 mr-1">*</span>
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">Select project type</option>
                {Object.values(PROJECT_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-emerald-600 h-5 w-5" />
            Property Location
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Enter City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Locality
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Enter Locality"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Land Zone
                </label>
                <input
                  type="text"
                  value={landZone}
                  onChange={(e) => setLandZone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Enter Land Zone"
                />
              </div>
              <div>
                <label className=" text-sm font-medium text-slate-700 mb-1 flex items-center">
                  <FaRulerCombined className="mr-2 text-slate-400 h-4 w-4" />
                  Total Land Area (sq. ft)
                </label>
                <input
                  type="number"
                  min="0"
                  value={propertyFeatures.landArea}
                  onChange={(e) => setPropertyFeatures({ ...propertyFeatures, landArea: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Enter total land area"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="pt-6">
        <button
          onClick={() => setActiveTab('revenue-plots')}
          className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all duration-200"
        >
          <span>Continue to Revenue Plots</span>
          <FaChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );


  const renderRevenuePlots = () => (
    <div className="space-y-2">

      <button
        onClick={() => setActiveTab('project-info')}
        className="flex items-center text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded-xl transition-all duration-200"
      >
        <FaArrowLeft className="mr-2 h-4 w-4" />
        Back to Project Info
      </button>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <FaChartLine className="mr-3 text-emerald-600" />
          Revenue Plots Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total Number of Revenue Plots
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={revenuePlots}
              onChange={(e) => {
                const newCount = parseInt(e.target.value) || 0;
                setRevenuePlots(newCount);

                if (newCount > plotsData.length) {
                  const newPlotsData = [...plotsData];
                  while (newPlotsData.length < newCount) {
                    newPlotsData.push({});
                  }
                  setPlotsData(newPlotsData);
                } else if (newCount < plotsData.length) {

                  setPlotsData(plotsData.slice(0, newCount));
                }
              }}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Enter total plots"
            />
            <p className="text-xs text-slate-500 mt-1">
              Currently have {plotsData.length} revenue plots configured
            </p>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Upload Attachment (if any)
            </label>
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {attachment && (
              <p className="text-sm text-emerald-600 mt-2">
                ✓ {attachment.name}
              </p>
            )}
          </div>
        </div>

        {revenuePlots > 0 && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                Revenue Plot Details ({revenuePlots} {revenuePlots === 1 ? "Plot" : "Plots"})
              </h3>
              <span className="text-sm text-slate-500">
                {getFilledPlotsCount()} of {revenuePlots} plots filled
              </span>
            </div>

            {plotsData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plotsData.map((plot, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-slate-300 p-4 space-y-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-semibold text-slate-800">
                          Plot {index + 1}
                        </h5>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const newPlots = plotsData.filter((_, i) => i !== index);
                          setPlotsData(newPlots);
                          setRevenuePlots(newPlots.length);
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete this plot"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Plot Area (sq. ft)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={plot?.area || ""}
                        onChange={(e) =>
                          handlePlotChange(index, "area", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Enter area"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Entry Plot No.
                      </label>
                      <input
                        type="text"
                        value={plot?.entryPlotNo || ""}
                        onChange={(e) =>
                          handlePlotChange(index, "entryPlotNo", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Enter plot number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Khata No.
                      </label>
                      <input
                        type="text"
                        value={plot?.khataNo || ""}
                        onChange={(e) =>
                          handlePlotChange(index, "khataNo", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Enter khata number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Plot Document
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          handlePlotFileChange(index, e.target.files[0])
                        }
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                      {plot?.fileName && (
                        <p className="text-xs text-emerald-600 mt-2 truncate">
                          ✓ {plot.fileName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No revenue plots configured yet.</p>
                <p className="text-sm text-slate-400 mt-1">Adjust the number of revenue plots above to start adding details.</p>
              </div>
            )}


            <div className="mt-6 p-4 bg-linear-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-emerald-800">
                    Summary
                  </h4>
                  <p className="text-sm text-emerald-600 mt-1">
                    Total Plots Area: <span className="font-bold">{calculateTotalPlotsArea()}</span> sq. ft
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {getFilledPlotsCount()} of {revenuePlots} plots filled
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSaveRevenuePlots}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center"
                  >
                    <FaSave className="mr-2" />
                    Save Revenue Plots & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {revenuePlots === 0 && (
          <div className="pt-6">
            <button
              onClick={() => setActiveTab('plots')}
              className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all duration-200"
            >
              <span>Continue to Plots & Details</span>
              <FaChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );


  const renderPlots = () => {


    return (
      <div className="space-y-6">

        <button
          onClick={() => setActiveTab('revenue-plots')}
          className="flex items-center text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all duration-200"
        >
          <FaArrowLeft className="mr-2 h-4 w-4" />
          Back to Revenue Plots
        </button>




        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1 space-y-6">


            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center">
                <FaSortAmountUp className="mr-2 text-emerald-600 h-5 w-5" />
                Add Multiple Plots
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Number of Plots to Add
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={manualPlotCount}
                      onChange={(e) => setManualPlotCount(parseInt(e.target.value) || 0)}
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Enter number of plots"
                    />
                    <button
                      onClick={addMultiplePlots}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Plots
                    </button>
                  </div>
                </div>
              </div>
            </div>


            <div className="space-y-2">
              {plots.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
                  <FaTable className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Plots Created</h3>
                  <p className="text-slate-500 mb-4">Start by adding plots to the project</p>
                  <div className="flex items-center justify-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={manualPlotCount}
                      onChange={(e) => setManualPlotCount(parseInt(e.target.value) || 0)}
                      className="w-32 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Number"
                    />
                    <button
                      onClick={addMultiplePlots}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Plots
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={plots.length > 0 && selectedPlots.length === plots.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlots(plots.map(p => p.id));
                            if (plots.length > 0) {
                              setCurrentPlotData(plots[0]);
                              loadPlotDataForEditing(plots[0]);
                            }
                          } else {
                            setSelectedPlots([]);
                            setCurrentPlotData(null);
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Select All Plots</span>
                    </label>
                    <span className="text-xs text-slate-500 font-medium">{selectedPlots.length} selected</span>
                  </div>
                  {plots.map((plot) => (
                    <div
                      key={plot.id}
                      onClick={() => handlePlotClick(plot)}
                      className={`cursor-pointer bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${selectedPlots.includes(plot.id)
                        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                    >

                      <div className="flex items-center justify-between p-3 bg-linear-to-r from-slate-50 to-white">
                        <div className="flex items-center space-x-4">
                          <input 
                            type="checkbox"
                            checked={selectedPlots.includes(plot.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              togglePlotSelection(plot);
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                        <div className={`p-2 rounded-xl ${plot.isComplete ? 'bg-emerald-100' : 'bg-emerald-100'}`}>
                          <FaTable className={`h-4 w-4 ${plot.isComplete ? 'text-emerald-600' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-md font-semibold text-slate-900">{plot.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${plot.isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                              {plot.isComplete ? 'Complete' : 'In Progress'}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            Area: {plot.areaDetails?.plotArea || '0'} Sq-yd
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlotClick(plot);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit this plot"
                        >
                          <FaPen size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                </>
              )}
            </div>
          </div>


          <div className="lg:col-span-2">
            {selectedPlots.length > 0 ? (
              <div className="flex flex-col h-full space-y-4">
                {(() => {
                  const plot = plots.find(p => p.id === selectedPlots[0]);
                  return plot ? renderPlotDetailsPanel(true, plot) : null;
                })()}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => savePlotChanges(selectedPlots)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center font-semibold shadow-md"
                  >
                    <FaCheck className="mr-2" />
                    {selectedPlots.length > 1 ? `Save to ${selectedPlots.length} Plots` : "Save Plot Details"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                <div className="text-center py-12">
                  <FaBuilding className="mx-auto h-16 w-16 text-emerald-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Select a Plot
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Select a plot to view and edit detailed information
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="pt-6">
          <button
            onClick={handleSaveProject}
            className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all duration-200"
          >
            <FaSave className="mr-2 h-5 w-5" />
            <span>Save Complete Project</span>
          </button>
        </div>
      </div>
    );
  };


  const renderPlotDetailsPanel = (isInEditMode = false, plot = null) => {
    const currentPlot = plot || currentPlotData;

    if (!currentPlot && !isInEditMode) {
      return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
          <div className="text-center py-12">
            <FaBuilding className="mx-auto h-16 w-16 text-emerald-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isInEditMode ? 'No Plot Selected' : 'Select a Plot'}
            </h3>
            <p className="text-slate-500 mb-4">
              {isInEditMode
                ? 'Return to table view to select a plot'
                : 'Select a plot from the list to view and edit details'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full plot-details-panel">
        {!isInEditMode && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {selectedPlots.length > 1 ? `Editing ${selectedPlots.length} Plots` : currentPlot.name}
              </h2>
              <p className="text-slate-500 text-sm">
                {selectedPlots.length > 1 ? 'Changes will apply to all selected plots' : `Plot ID: ${currentPlot.id}`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentPlot.isComplete
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-100 text-emerald-800"
                }`}>
                {currentPlot.isComplete ? "Complete" : "In Progress"}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${isCornerPlot
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
                }`}>
                {isCornerPlot ? "Corner Plot" : "Regular Plot"}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-semibold mb-3 text-slate-800 flex items-center">
              <FaQuestionCircle className="mr-2 text-emerald-600 h-4 w-4" />
              Plot Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Is this a corner plot?
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={isCornerPlot}
                      onChange={() => setIsCornerPlot(true)}
                      className="text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                    />
                    <span className="ml-2 text-xs text-slate-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={!isCornerPlot}
                      onChange={() => setIsCornerPlot(false)}
                      className="text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                    />
                    <span className="ml-2 text-xs text-slate-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>


          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-emerald-700 flex items-center">
              <FaBuilding className="mr-2" />
              Property Features
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Status
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["prehold", "lease", "vacant"].map((status) => (
                  <label
                    key={status}
                    className="inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="propertyStatus"
                      checked={propertyFeatures.propertyStatus === status}
                      onChange={() =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          propertyStatus: status,
                        })
                      }
                      className="text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>


            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Land Area (sqft)
              </label>
              <input
                type="number"
                value={propertyFeatures.landArea}
                onChange={(e) =>
                  setPropertyFeatures({
                    ...propertyFeatures,
                    landArea: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-md p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter land area in square feet"
              />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 mb-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outhouse Available
                </label>
                <div className="flex space-x-6 mb-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="hasOuthouse"
                      checked={propertyFeatures.hasOuthouse === "Yes"}
                      onChange={() =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          hasOuthouse: "Yes",
                        })
                      }
                      className="text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="hasOuthouse"
                      checked={propertyFeatures.hasOuthouse === "No"}
                      onChange={() =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          hasOuthouse: "No",
                          outhouseArea: "",
                        })
                      }
                      className="text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>

                {propertyFeatures.hasOuthouse === "Yes" && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outhouse Area (sqft)
                    </label>
                    <input
                      type="number"
                      value={propertyFeatures.outhouseArea}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          outhouseArea: e.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter outhouse area"
                    />
                  </div>
                )}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possession Status
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Ready to Move", "In Progress", "Completed", "Pending"].map((status) => (
                    <label key={status} className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="possessionStatus"
                        checked={propertyFeatures.possessionStatus === status}
                        onChange={() =>
                          setPropertyFeatures({
                            ...propertyFeatures,
                            possessionStatus: status,
                          })
                        }
                        className="text-emerald-600 focus:ring-emerald-500 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>


            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available From
              </label>
              <div className="flex space-x-4">
                <select
                  value={propertyFeatures.availableFromMonth}
                  onChange={(e) =>
                    setPropertyFeatures({
                      ...propertyFeatures,
                      availableFromMonth: e.target.value,
                    })
                  }
                  className="border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
                <select
                  value={propertyFeatures.availableFromYear}
                  onChange={(e) =>
                    setPropertyFeatures({
                      ...propertyFeatures,
                      availableFromYear: e.target.value,
                    })
                  }
                  className="border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Year</option>
                  {Array.from(
                    { length: 10 },
                    (_, i) => new Date().getFullYear() + i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. of Open Sides
                </label>
                <select
                  value={propertyFeatures.openSides}
                  onChange={(e) =>
                    setPropertyFeatures({
                      ...propertyFeatures,
                      openSides: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select</option>
                  <option value="1">1 Side</option>
                  <option value="2">2 Sides</option>
                  <option value="3">3 Sides</option>
                  <option value="4">4 Sides</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width of Road Facing the Plot (Meters)
                </label>
                <input
                  type="number"
                  value={propertyFeatures.roadWidth}
                  onChange={(e) =>
                    setPropertyFeatures({
                      ...propertyFeatures,
                      roadWidth: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Meters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Boundary Wall Made
                </label>
                <select
                  value={propertyFeatures.boundaryWall}
                  onChange={(e) =>
                    setPropertyFeatures({
                      ...propertyFeatures,
                      boundaryWall: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gated Colony
                </label>
                <select
                  value={propertyFeatures.gatedColony}
                  onChange={(e) =>
                    setPropertyFeatures({
                      ...propertyFeatures,
                      gatedColony: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>


            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Facilities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {FACILITIES.map((facility) => (
                  <label
                    key={facility.key}
                    className="inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={propertyFeatures[facility.key] || false}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          [facility.key]: e.target.checked,
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {facility.label}
                    </span>
                  </label>
                ))}
                {plotCustomFacilities.map((facility, idx) => (
                  <label
                    key={idx}
                    className="inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={propertyFeatures[facility] || false}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          [facility]: e.target.checked,
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {facility}
                    </span>
                    <button
                      type="button"
                      className="ml-2 text-gray-500"
                      onClick={() =>
                        setPlotCustomFacilities(
                          plotCustomFacilities.filter((f) => f !== facility)
                        )
                      }
                    >
                      <FaTrash />
                    </button>
                  </label>
                ))}
              </div>
              <div className="flex mt-2">
                <input
                  type="text"
                  placeholder="Add custom facility"
                  className="border border-slate-200 rounded-md p-2 flex-1"
                  value={propertyFeatures.newFacility || ""}
                  onChange={(e) =>
                    setPropertyFeatures({
                      ...propertyFeatures,
                      newFacility: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="ml-2 bg-emerald-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    if (
                      propertyFeatures.newFacility &&
                      !plotCustomFacilities.includes(
                        propertyFeatures.newFacility.trim()
                      )
                    ) {
                      setPlotCustomFacilities([
                        ...plotCustomFacilities,
                        propertyFeatures.newFacility.trim(),
                      ]);
                      setPropertyFeatures({
                        ...propertyFeatures,
                        newFacility: "",
                      });
                    }
                  }}
                >
                  Add More
                </button>
              </div>
            </div>
          </div>


          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold mb-3 text-slate-800 flex items-center">
              <FaRulerCombined className="mr-2 text-emerald-600 h-4 w-4" />
              Area Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Plot Area (Sq-yd)
                </label>
                <input
                  type="number"
                  min="0"
                  value={areaDetails.plotArea || ""}
                  onChange={(e) =>
                    setAreaDetails({
                      ...areaDetails,
                      plotArea: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="Sq-yd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Plot Length (yd)
                </label>
                <input
                  type="number"
                  min="0"
                  value={areaDetails.plotLength || ""}
                  onChange={(e) =>
                    setAreaDetails({
                      ...areaDetails,
                      plotLength: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="yd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Plot Breadth (yd)
                </label>
                <input
                  type="number"
                  min="0"
                  value={areaDetails.plotBreadth || ""}
                  onChange={(e) =>
                    setAreaDetails({
                      ...areaDetails,
                      plotBreadth: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="yd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Land Area (sqft)
                </label>
                <input
                  type="number"
                  value={propertyFeatures.landArea || ""}
                  onChange={(e) =>
                    setPropertyFeatures({
                      ...propertyFeatures,
                      landArea: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="sqft"
                />
              </div>
            </div>
          </div>


          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-emerald-700">
              Additional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kissama
                </label>
                <input
                  type="text"
                  value={kissama}
                  onChange={(e) => setKissama(e.target.value)}
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter Kissama details"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Boundary Type
                </label>
                <select
                  value={boundary}
                  onChange={(e) => setBoundary(e.target.value)}
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select boundary type</option>
                  <option value="brick">Brick</option>
                  <option value="concrete">Concrete</option>
                  <option value="iron">Iron</option>
                  <option value="wood">Wood</option>
                  <option value="none">None</option>
                </select>
              </div>


              <div>
                {renderBrokerSelect()}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter reference details"
                />
              </div>


              <div>
                {renderContractorSelect()}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Engaged (if any)
                </label>
                <input
                  type="text"
                  value={staffEngaged}
                  onChange={(e) => setStaffEngaged(e.target.value)}
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter staff name or ID"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Provider
                </label>
                <input
                  type="text"
                  value={loanProvider}
                  onChange={(e) => setLoanProvider(e.target.value)}
                  className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter loan provider name"
                />
              </div>
            </div>
          </div>


          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-emerald-700">
              Approval Status
            </h3>
            <div className="space-y-4">
              {approvalStatus.map((approval, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approval Authority
                    </label>
                    <input
                      type="text"
                      value={approval.authority}
                      onChange={(e) =>
                        handleApprovalChange(index, "authority", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., RERA, Local Authority"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={approval.status}
                      onChange={(e) =>
                        handleApprovalChange(index, "status", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select status</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Applied">Applied</option>
                    </select>
                  </div>
                  <div>
                    {index === approvalStatus.length - 1 ? (
                      <button
                        onClick={addApprovalAuthority}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition duration-300"
                      >
                        + Add More
                      </button>
                    ) : (
                      <button
                        onClick={() => removeApprovalAuthority(index)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className=" border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold mb-3 text-slate-800 flex items-center">
              <FaMoneyBill className="mr-2 text-emerald-600 h-4 w-4" />
              Price Details
            </h3>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Expected Price (₹)
                </label>
                <input
                  type="text"
                  value={priceDetails.expectedPrice || ""}
                  onChange={(e) =>
                    setPriceDetails({
                      ...priceDetails,
                      expectedPrice: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="e.g., 5000000"
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Token Amount (₹)
                </label>
                <input
                  type="text"
                  value={priceDetails.tokenAmount || ""}
                  onChange={(e) =>
                    setPriceDetails({
                      ...priceDetails,
                      tokenAmount: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="e.g., 50000"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-white p-4 relative md:p-6">

      {onClose && (
        <button
          onClick={onClose}
          className="absolute  right-0 top-0 z-20
                   w-10 h-10 rounded-full
                   flex items-center justify-center
                   text-slate-500 hover:text-slate-800
                   hover:bg-slate-200 transition"
          title="Back to Project List"
        >
          <FaTimes size={18} />
        </button>
      )}
      <div className="max-w-7xl mx-auto space-y-6 ">


        <NavigationTabs />


        {activeTab === "project-info" && renderProjectInfo()}
        {activeTab === "revenue-plots" && renderRevenuePlots()}
        {activeTab === "plots" && renderPlots()}
      </div>
    </div>
  );
};

export default PlottingProject;
