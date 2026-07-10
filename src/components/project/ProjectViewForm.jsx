import axios from "axios";
import React, { useState, useEffect } from "react";
import projectService from "./projectService";
import useAuth from "../../hooks/useAuth";
import { getProjectOverallStatus } from "./shared/utils";
import {
  FaTimes,
  FaBuilding,
  FaRulerCombined,
  FaClipboardList,
  FaMoneyBill,
  FaCheckCircle,
  FaList,
  FaSpinner,
  FaPlus,
  FaMapMarkerAlt,
  FaCalendar,
  FaRuler,
  FaFileAlt,
  FaUser,
  FaHardHat,
  FaUsers,
  FaHandshake,
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaLayerGroup,
  FaDownload,
  FaInfoCircle,
  FaUniversity,
  FaDoorOpen,
  FaUtensils,
  FaCar,
} from "react-icons/fa";

const ProjectViewForm = ({ project = {}, onClose, token }) => {
  const { user, token: authVal } = useAuth();
  const [floorDetails, setFloorDetails] = useState({});
  const [loadingFloors, setLoadingFloors] = useState({});
  const [revenuePlots, setRevenuePlots] = useState([]);
  const [loadingRevenuePlots, setLoadingRevenuePlots] = useState(false);
  const [revenuePlotsError, setRevenuePlotsError] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [creatingFloor, setCreatingFloor] = useState(null);
  const [selectedApartmentUnit, setSelectedApartmentUnit] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    property: true,
    revenue: true,
    additional: false,
    approvals: false,
    transaction: true,
    price: true,
    commercial: true,
    plots: true,
    units: true,
    blocks: true,
    custom: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const get = (obj, ...keys) => {
    for (const k of keys) {
      if (!obj) continue;

      if (typeof k === "string" && k.includes(".")) {
        const parts = k.split(".");
        let value = obj;
        for (const part of parts) {
          if (value && value[part] !== undefined && value[part] !== null) {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }
        if (value !== undefined) return value;
      } else {
        if (obj[k] !== undefined && obj[k] !== null) return obj[k];
      }
    }
    return undefined;
  };

  const getEffectiveProject = () => {
    if (
      (project.type === "Custom" || project.type === "custom") &&
      project.configuration
    ) {
      try {
        const config =
          typeof project.configuration === "string"
            ? JSON.parse(project.configuration)
            : project.configuration;
        if (config && typeof config === "object") {
          return { ...project, ...config };
        }
      } catch (e) {
        console.error("Failed to expand custom project configuration:", e);
      }
    }
    return project;
  };

  const effectiveProject = getEffectiveProject();

  const price =
    get(effectiveProject, "priceDetails") ||
    get(effectiveProject, "price_details") ||
    get(effectiveProject, "unit_price_details") ||
    get(effectiveProject, "price") ||
    {};

  const transaction =
    get(effectiveProject, "transactionDetails") ||
    get(effectiveProject, "transaction_details") ||
    get(effectiveProject, "transaction_type") ||
    get(effectiveProject, "transaction") ||
    {};

  const approval =
    get(effectiveProject, "approvalStatus") ||
    get(effectiveProject, "approval_status") ||
    get(effectiveProject, "approvals") ||
    [];

  const plots = get(effectiveProject, "plots") || [];
  const units =
    get(effectiveProject, "units") ||
    get(effectiveProject, "unit_configuration") ||
    [];

  const commercialFeatures =
    get(effectiveProject, "commercialFeatures") ||
    get(effectiveProject, "common_facilities") ||
    get(effectiveProject, "facilities") ||
    [];

  const additional = {
    kissama:
      get(effectiveProject, "kissama") ||
      get(effectiveProject, "kissama_details") ||
      "",
    boundary:
      get(effectiveProject, "boundary") ||
      get(effectiveProject, "boundary_type") ||
      "",
    broker: get(project, "broker") || get(project, "broker_id") || "",

    constructor: get(project, "constructor") || "",
    staffEngaged:
      get(project, "staffEngaged") || get(project, "staff_engaged") || "",
    loanProvider:
      get(project, "loanProvider") || get(project, "loan_provider") || "",
    attachment:
      (get(project, "attachment") &&
        (typeof get(project, "attachment") === "string"
          ? get(project, "attachment")
          : get(project, "attachment").name ||
            JSON.stringify(get(project, "attachment")))) ||
      "",
  };

  const parseData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse data string:", e);
        return [];
      }
    }
    return [];
  };

  const normalizedPlotsData = parseData(
    get(effectiveProject, "plots_data", "plotsData", "plots"),
  );

  const normalizedBlocksData = parseData(
    get(effectiveProject, "blocks_data", "blocksData", "blocks"),
  );

  const normalizedUnitsData = parseData(
    get(
      effectiveProject,
      "units_data",
      "unitsData",
      "units",
      "unit_configuration",
    ),
  );

  const rawPf =
    get(project, "propertyFeatures") ||
    get(project, "property_features") ||
    get(project, "property_feature") ||
    get(project, "pf") ||
    {};

  const pf = { ...rawPf };

  const td =
    get(project, "transaction_details", "transactionDetails") || transaction;

  if (!pf.propertyStatus && !pf.property_status) {
    pf.propertyStatus =
      get(rawPf, "propertyStatus", "property_status") ||
      get(td, "possession_status", "possessionStatus") ||
      "";
  }

  if (!pf.landArea) {
    pf.landArea =
      get(rawPf, "landArea", "land_area", "land_area_sqft") ||
      project.total_land_area ||
      project.landArea ||
      project.land_area ||
      "";
  }

  if (!pf.openSides) {
    pf.openSides = get(rawPf, "openSides", "open_sides");
  }

  if (!pf.roadWidth) {
    pf.roadWidth = get(rawPf, "roadWidth", "road_width");
  }

  if (!pf.boundaryWall) {
    pf.boundaryWall = get(rawPf, "boundaryWall", "boundary_wall");
  }

  if (!pf.gatedColony) {
    pf.gatedColony = get(rawPf, "gatedColony", "gated_colony");
  }

  if (!pf.hasOuthouse) {
    pf.hasOuthouse = get(rawPf, "hasOuthouse", "has_outhouse");
  }

  if (!pf.possessionStatus) {
    pf.possessionStatus =
      get(rawPf, "possessionStatus", "possession_status") ||
      get(td, "possession_status", "possessionStatus") ||
      "";
  }

  if (!pf.availableFromMonth || !pf.availableFromYear) {
    const available =
      get(rawPf, "availableFrom") ||
      get(td, "available_from", "availableFrom") ||
      {};
    pf.availableFromMonth =
      pf.availableFromMonth ||
      available.month ||
      get(rawPf, "availableFromMonth", "available_from_month") ||
      "";
    pf.availableFromYear =
      pf.availableFromYear ||
      available.year ||
      get(rawPf, "availableFromYear", "available_from_year") ||
      "";
  }

  const safeNumber = (v) => {
    const n = Number(String(v ?? "").replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const totalRevenueArea = revenuePlots.reduce(
    (s, p) => s + safeNumber(get(p, "plot_area_sqft", "area", "plot_area")),
    0,
  );

  const formatMoney = (v) => {
    if (v === undefined || v === null || v === "") return "N/A";
    const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(n)) return v;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  const getExpectedPriceFromProject = (p) => {
    if (!p) return 0;
    return (
      p?.priceDetails?.expectedPrice ??
      p?.price_details?.expected_price ??
      p?.expected_price ??
      p?.starting_price ??
      p?.price ??
      0
    );
  };

  const authToken = authVal || token || localStorage.getItem("authToken") || "";
  const dynamicSlug = user?.slug || "";

  const fetchRevenuePlots = async () => {
    if (!project?.id) {
      console.warn("No project ID available for fetching revenue plots");
      return;
    }

    const currentSubTypes = get(project, "subTypes", "sub_types") || [];
    const parsedSubTypes =
      typeof currentSubTypes === "string"
        ? JSON.parse(currentSubTypes)
        : currentSubTypes;

    const localPlots =
      get(effectiveProject, "revenue_plots_data") ||
      get(effectiveProject, "plotsData");
    const parsedLocalPlots = parseData(localPlots);

    const normalizedType = (project.type || "").toString().toLowerCase();
    const isPlottingCompatible =
      [
        "plotting",
        "custom",
        "commercial",
        "duplex",
        "triplex",
        "apartment",
      ].includes(normalizedType) ||
      (parsedSubTypes &&
        parsedSubTypes.some((st) => st.toLowerCase().includes("plotting")));

    if (parsedLocalPlots && parsedLocalPlots.length > 0) {
      setRevenuePlots(parsedLocalPlots);
    }

    if (
      !isPlottingCompatible &&
      (!parsedLocalPlots || parsedLocalPlots.length === 0)
    ) {
      setRevenuePlots([]);
      return;
    }

    setLoadingRevenuePlots(true);
    setRevenuePlotsError(null);

    try {
      let fetchedProjectData = null;
      const type = (project.type || "").toString().toLowerCase();

      switch (type) {
        case "apartment":
          fetchedProjectData = await projectService.getApartmentById(
            project.id,
          );
          break;
        case "commercial":
          fetchedProjectData = await projectService.getCommercialById(
            project.id,
          );
          break;
        case "plotting":
          fetchedProjectData = await projectService.getPlottingById(project.id);
          break;
        case "duplex":
          fetchedProjectData = await projectService.getDuplexById(project.id);
          break;
        case "triplex":
          fetchedProjectData = await projectService.getTriplexById(project.id);
          break;
        case "custom":
          fetchedProjectData = await projectService.getCustomProjectById(
            project.id,
          );
          break;
        default:
          break;
      }

      let plotsArray = [];
      if (fetchedProjectData) {
        let targetData = fetchedProjectData;
        if (type === "custom" && fetchedProjectData.configuration) {
          try {
            const config =
              typeof fetchedProjectData.configuration === "string"
                ? JSON.parse(fetchedProjectData.configuration)
                : fetchedProjectData.configuration;
            if (config && typeof config === "object") {
              targetData = { ...fetchedProjectData, ...config };
            }
          } catch (e) {
            console.error(
              "Failed to parse custom config during revenue plots fetch:",
              e,
            );
          }
        }

        const rawPlots =
          targetData.revenue_plots_data ||
          targetData.revenuePlotsData ||
          targetData.plotsData ||
          targetData.plots_data;

        plotsArray = parseData(rawPlots);
      }

      if (
        plotsArray.length === 0 &&
        parsedLocalPlots &&
        parsedLocalPlots.length > 0
      ) {
        plotsArray = parsedLocalPlots;
      }

      setRevenuePlots(plotsArray || []);
    } catch (error) {
      console.error(
        "Error fetching revenue plots from local controller:",
        error,
      );

      if (parsedLocalPlots && parsedLocalPlots.length > 0) {
        setRevenuePlots(parsedLocalPlots);
      } else {
        setRevenuePlotsError(error.message || "Failed to fetch revenue plots");
      }
    } finally {
      setLoadingRevenuePlots(false);
    }
  };

  const fetchFloorDetails = async (
    projectIdParam,
    unitIdParam,
    floorKeyParam,
  ) => {
    const cacheKey = `${projectIdParam}-${unitIdParam}-${floorKeyParam}`;

    if (loadingFloors[cacheKey] || floorDetails[cacheKey]) {
      return;
    }

    setLoadingFloors((prev) => ({ ...prev, [cacheKey]: true }));

    try {
      const response = await axios.request({
        method: "get",
        url: `https://api.csaap.com/api/tenantuser/projects/${projectIdParam}/units/${unitIdParam}/floor-details/${floorKeyParam}`,
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          slug: dynamicSlug,
          subdomain: dynamicSlug,
        },
        validateStatus: () => true,
        timeout: 20000,
      });

      if (response.status >= 200 && response.status < 300) {
        setFloorDetails((prev) => ({
          ...prev,
          [cacheKey]: response.data,
        }));
      } else {
        setFloorDetails((prev) => ({
          ...prev,
          [cacheKey]: response.data ?? null,
        }));
      }
    } catch (error) {
      console.error(
        `[fetchFloorDetails] network/error for ${cacheKey}:`,
        error,
      );
      setFloorDetails((prev) => ({
        ...prev,
        [cacheKey]: null,
      }));
    } finally {
      setLoadingFloors((prev) => ({ ...prev, [cacheKey]: false }));
    }
  };

  useEffect(() => {
    if (project?.id) {
      fetchRevenuePlots();
    }
  }, [project?.id, project?.type]);

  useEffect(() => {
    if (!project || !project.id) return;
    if (!Array.isArray(units) || units.length === 0) return;

    units.forEach((unit, unitIndex) => {
      const uId = unit.id || unit.apiId || unitIndex;
      const projectIdVal = project.id;

      const floorDetailsArray = unit.floor_details || [];

      if (floorDetailsArray.length > 0) {
        floorDetailsArray.forEach((floorDetail) => {
          const floorKey = floorDetail.floor_key;
          if (floorKey) {
            fetchFloorDetails(projectIdVal, uId, floorKey);
          }
        });
      } else {
        const floorsToCheck = [
          { key: "groundFloor", title: "Ground Floor" },
          { key: "firstFloor", title: "1st Floor" },
          { key: "secondFloor", title: "2nd Floor" },
        ];

        const floors =
          get(unit, "floors") || (unit.floorDetails ? unit.floorDetails : {});

        floorsToCheck.forEach(({ key }) => {
          const floorData = get(floors, key) || get(unit, key);
          if (
            floorData &&
            (floorData.id || Object.keys(floorData).length > 0)
          ) {
            fetchFloorDetails(projectIdVal, uId, key);
          }
        });
      }
    });
  }, [units, project.id]);

  const handleDownloadDocument = (plot) => {
    const documentUrl = get(plot, "plot_document", "document_url");
    const fileName = get(plot, "fileName", "file_name", "plot_document.pdf");

    if (documentUrl) {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Document not available for download");
    }
  };

  const FloorBlock = ({
    title,
    floor = {},
    projectId,
    unitId,
    floorKey,
    unitData = null,
  }) => {
    const cacheKey = `${projectId}-${unitId}-${floorKey}`;
    const apiFloorData = floorDetails[cacheKey];
    const isLoading = loadingFloors[cacheKey];

    const unitFloorDetails = unitData?.floor_details || [];
    const floorFromUnitDetails = unitFloorDetails.find(
      (f) => f.floor_key === floorKey,
    );
    const finalFloorData = apiFloorData || floorFromUnitDetails || floor;

    if (!finalFloorData || Object.keys(finalFloorData).length === 0) {
      return (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-semibold text-gray-700">{title}</h5>
            <button
              onClick={() => setCreatingFloor(cacheKey)}
              className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1.5 font-medium"
            >
              <FaPlus size={10} /> Add Details
            </button>
          </div>
          <p className="text-sm text-gray-500 italic">
            No floor data available
          </p>
        </div>
      );
    }

    const floorData = apiFloorData || floor;
    const bedrooms = get(
      floorData,
      "total_bedrooms",
      "totalBedrooms",
      "bedrooms",
      "bedroom_count",
    );
    const bathrooms = get(
      floorData,
      "total_bathrooms",
      "totalBathrooms",
      "bathrooms",
      "toilets",
    );
    const area = get(
      floorData,
      "living_area",
      "bedroom_area",
      "area",
      "floorArea",
      "totalArea",
      "carpetArea",
    );
    const studyRoom = get(floorData, "study_room", "studyRoom");
    const bathroomAreas = get(floorData, "bathroom_areas", "bathroomAreas");
    const bedroomAreas = get(floorData, "bedroom_areas", "bedroomAreas");
    const studyRoomAreas = get(floorData, "study_room_area", "studyRoomAreas");
    const livingArea = get(floorData, "living_area", "livingArea");
    const balcony = get(floorData, "balcony");
    const balconyArea = get(floorData, "balcony_area", "balconyArea");
    const kitchen = get(floorData, "kitchen");
    const kitchenArea = get(floorData, "kitchen_area", "kitchenArea");
    const garage = get(floorData, "garage");
    const garageArea = get(floorData, "garage_area", "garageArea");
    const diningArea = get(floorData, "dining_area", "diningArea");
    const additionalNotes = get(
      floorData,
      "additional_notes",
      "additionalNotes",
    );

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-semibold text-gray-800">{title}</h5>
          <div className="flex items-center gap-2">
            {isLoading && <FaSpinner className="animate-spin text-blue-500" />}
            {apiFloorData && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Live Data
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-purple-50 p-2 rounded-lg">
            <div className="text-xs text-purple-600 font-medium">Bedrooms</div>
            <div className="text-gray-800 font-semibold">
              {bedrooms ?? "N/A"}
            </div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg">
            <div className="text-xs text-green-600 font-medium">Bathrooms</div>
            <div className="text-gray-800 font-semibold">
              {bathrooms ?? "N/A"}
            </div>
          </div>

          {studyRoom && (
            <div className="bg-orange-50 p-2 rounded-lg">
              <div className="text-xs text-orange-600 font-medium">
                Study Rooms
              </div>
              <div className="text-gray-800 font-semibold">{studyRoom}</div>
            </div>
          )}
          {balcony && (
            <div className="bg-pink-50 p-2 rounded-lg">
              <div className="text-xs text-pink-600 font-medium">Balconies</div>
              <div className="text-gray-800 font-semibold">{balcony}</div>
            </div>
          )}
          {kitchen && (
            <div className="bg-red-50 p-2 rounded-lg">
              <div className="text-xs text-red-600 font-medium">Kitchen</div>
              <div className="text-gray-800 font-semibold">{kitchen}</div>
            </div>
          )}
          {garage && (
            <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 font-medium">Garage</div>
              <div className="text-gray-800 font-semibold">{garage}</div>
            </div>
          )}
        </div>

        {(bedroomAreas ||
          bathroomAreas ||
          balconyArea ||
          studyRoomAreas ||
          livingArea ||
          diningArea ||
          additionalNotes) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 font-medium mb-2">
              Additional Details
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              {bedroomAreas && (
                <div>
                  <span className="font-medium">Bedroom Areas:</span>{" "}
                  {bedroomAreas.map((area, index) => (
                    <span key={index}>{area} sq-ft, </span>
                  ))}
                </div>
              )}
              {bathroomAreas && (
                <div>
                  <span className="font-medium">Bathroom Areas:</span>{" "}
                  {bathroomAreas.map((area, index) => (
                    <span key={index}>{area} sq-ft, </span>
                  ))}
                </div>
              )}
              {studyRoomAreas && (
                <div>
                  <span className="font-medium">Study Area:</span>{" "}
                  {studyRoomAreas.map((area, index) => (
                    <span key={index}>{area} sq-ft, </span>
                  ))}
                </div>
              )}
              {livingArea && (
                <div>
                  <span className="font-medium">Living Area:</span> {livingArea}{" "}
                  sq-ft
                </div>
              )}
              {balconyArea && (
                <div>
                  <span className="font-medium">Balcony Area:</span>{" "}
                  {balconyArea} sq-ft
                </div>
              )}
              {diningArea && (
                <div>
                  <span className="font-medium">Dining Area:</span> {diningArea}{" "}
                  sq-ft
                </div>
              )}
              {garage && (
                <div>
                  <span className="font-medium">Garage:</span> {garage}
                </div>
              )}
              {kitchenArea && (
                <div>
                  <span className="font-medium">Kitchen Area:</span>{" "}
                  {kitchenArea} sq-ft
                </div>
              )}
              {garageArea && (
                <div>
                  <span className="font-medium">Garage Area:</span> {garageArea}{" "}
                  sq-ft
                </div>
              )}
              {additionalNotes && (
                <div className="mt-2">
                  <div className="font-medium text-gray-600">Notes:</div>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">
                    {additionalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-4 z-10">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {project.name || "Unnamed Project"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {project.type ||
                        project.project_type ||
                        project.custom_type ||
                        "Type unknown"}
                    </span>
                    {(() => {
                      const overallStatus = getProjectOverallStatus(project);
                      return overallStatus ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            overallStatus === "Completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : overallStatus === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : overallStatus === "In Progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : overallStatus === "Ready to Move"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {overallStatus}
                        </span>
                      ) : null;
                    })()}
                    {project.commercial_sub_type ||
                      (project.commercialSubType && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {project.commercial_sub_type ||
                            project.commercialSubType}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <StatCard
              icon={<FaMapMarkerAlt className="text-blue-500" />}
              label="Location"
              value={`${effectiveProject.city || "N/A"}${
                effectiveProject.locality
                  ? `, ${effectiveProject.locality}`
                  : ""
              }`}
            />
            <StatCard
              icon={<FaRuler className="text-green-500" />}
              label="Land Area"
              value={
                effectiveProject.total_land_area ||
                effectiveProject.landArea ||
                effectiveProject.land_area ||
                "N/A"
              }
            />
            <StatCard
              icon={<FaCalendar className="text-purple-500" />}
              label="Created"
              value={
                effectiveProject.createdAt ||
                effectiveProject.created_at ||
                "N/A"
              }
            />
            <StatCard
              icon={<FaLayerGroup className="text-orange-500" />}
              label="Revenue Plots"
              value={revenuePlots.length}
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <CollapsibleSection
            title="Revenue Plots"
            icon={<FaRulerCombined className="text-green-600" />}
            isExpanded={expandedSections.revenue}
            onToggle={() => toggleSection("revenue")}
            count={revenuePlots.length}
          >
            {expandedSections.revenue && (
              <div className="space-y-4">
                {loadingRevenuePlots ? (
                  <div className="flex justify-center items-center py-8">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
                    <span className="text-gray-600">
                      Loading revenue plots...
                    </span>
                  </div>
                ) : revenuePlotsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-red-700 font-semibold mb-2">
                      Error Loading Revenue Plots
                    </div>
                    <div className="text-red-600 text-sm">
                      {revenuePlotsError}
                    </div>
                    <button
                      onClick={fetchRevenuePlots}
                      className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Retry
                    </button>
                  </div>
                ) : revenuePlots.length === 0 ? (
                  <EmptyState message="No revenue plots data available" />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {revenuePlots.map((rp, i) => (
                        <div
                          key={rp.id || i}
                          className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-700 font-bold text-sm">
                                  {i + 1}
                                </span>
                              </div>
                              <h5 className="font-semibold text-gray-800">
                                Plot {rp.plot_number || i + 1}
                              </h5>
                            </div>
                            {get(rp, "plot_document", "document_url") && (
                              <button
                                onClick={() => handleDownloadDocument(rp)}
                                className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                                title="Download Document"
                              >
                                <FaDownload size={14} />
                              </button>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <DetailRow
                              label="Area"
                              value={get(rp, "plot_area_sqft", "area")}
                              suffix="sq-ft"
                            />
                            <DetailRow
                              label="Entry Plot No"
                              value={get(
                                rp,
                                "plot_no",
                                "entry_plot_no",
                                "entryPlotNo",
                              )}
                            />
                            <DetailRow
                              label="Khata No"
                              value={get(rp, "khata_no", "khataNo")}
                            />

                            <DetailRow
                              label="Document"
                              value={get(
                                rp,
                                "fileName",
                                "file_name",
                                "plot_document",
                              )}
                            />
                            {rp.created_at && (
                              <DetailRow
                                label="Created"
                                value={new Date(
                                  rp.created_at,
                                ).toLocaleDateString()}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaRuler className="text-white" />
                          <span className="font-semibold">
                            Total Revenue Area
                          </span>
                        </div>
                        <span className="text-xl font-bold">
                          {totalRevenueArea.toLocaleString()} sq-ft
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CollapsibleSection>

          {project.type !== "commercial" &&
            (normalizedPlotsData.length > 0 || project.type === "plotting") && (
              <CollapsibleSection
                title="Plots Configuration"
                icon={<FaRulerCombined className="text-orange-600" />}
                isExpanded={expandedSections.plots}
                onToggle={() => toggleSection("plots")}
                count={normalizedPlotsData.length}
              >
                {expandedSections.plots && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {normalizedPlotsData.length === 0 ? (
                      <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <FaRulerCombined className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">
                          No individual plots configured yet.
                        </p>
                      </div>
                    ) : (
                      normalizedPlotsData.map((p, i) => (
                        <div
                          key={p.id || i}
                          className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all border-l-4 border-l-orange-500"
                        >
                          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {p.name || `Plot ${i + 1}`}
                            </h4>
                            <div className="flex gap-1.5">
                              {p.isCornerPlot && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                  Corner
                                </span>
                              )}
                              {(() => {
                                const status =
                                  get(p, "propertyFeatures.possessionStatus") ||
                                  get(p, "possessionStatus");
                                if (!status) return null;
                                return (
                                  <span
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                      status === "Completed"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : status === "Pending"
                                          ? "bg-amber-100 text-amber-700"
                                          : status === "In Progress"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {status}
                                  </span>
                                );
                              })()}
                              {p.isComplete ? (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                  Complete
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                  Draft
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">
                                Dimensions & Area
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 col-span-2">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <div className="text-[10px] text-gray-500">
                                        Length
                                      </div>
                                      <div className="text-xs font-bold text-gray-800">
                                        {get(p, "areaDetails.plotLength") ||
                                          "—"}{" "}
                                        <span className="text-[9px] font-normal text-gray-500">
                                          yd
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-gray-500">
                                        Breadth
                                      </div>
                                      <div className="text-xs font-bold text-gray-800">
                                        {get(p, "areaDetails.plotBreadth") ||
                                          "—"}{" "}
                                        <span className="text-[9px] font-normal text-gray-500">
                                          yd
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-gray-500">
                                        Plot Area
                                      </div>
                                      <div className="text-xs font-bold text-gray-800">
                                        {get(p, "areaDetails.plotArea") || "—"}{" "}
                                        <span className="text-[9px] font-normal text-gray-500">
                                          sq-yd
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100 col-span-2">
                                  <div className="flex justify-between items-center">
                                    <div className="text-xs text-indigo-800 font-medium">
                                      Land Area
                                    </div>
                                    <div className="text-sm font-bold text-indigo-700">
                                      {get(p, "propertyFeatures.landArea") ||
                                        "—"}{" "}
                                      <span className="text-[10px] font-normal text-indigo-500">
                                        sqft
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <DetailRow
                                label="Exp. Price"
                                value={formatMoney(
                                  get(p, "priceDetails.expectedPrice", "price"),
                                )}
                              />
                              <DetailRow
                                label="Token Amount"
                                value={formatMoney(
                                  get(p, "priceDetails.tokenAmount"),
                                )}
                              />
                            </div>

                            <div className="bg-orange-50/50 rounded-xl p-3 space-y-2 border border-orange-100">
                              <DetailRow label="Kissama" value={p.kissama} />
                              <DetailRow
                                label="Road Width"
                                value={get(p, "propertyFeatures.roadWidth")}
                                suffix="ft"
                              />
                              <DetailRow
                                label="Open Sides"
                                value={get(p, "propertyFeatures.openSides")}
                              />
                              <DetailRow
                                label="Property Status"
                                value={get(
                                  p,
                                  "propertyFeatures.propertyStatus",
                                )}
                              />
                              <DetailRow
                                label="Possession"
                                value={get(
                                  p,
                                  "propertyFeatures.possessionStatus",
                                )}
                              />

                              <div className="pt-2 border-t border-orange-200 mt-2 space-y-2">
                                <DetailRow
                                  label="Available From"
                                  value={`${get(p, "propertyFeatures.availableFromMonth") || ""} ${get(p, "propertyFeatures.availableFromYear") || ""}`.trim()}
                                />
                                <DetailRow
                                  label="Boundary Wall"
                                  value={get(
                                    p,
                                    "propertyFeatures.boundaryWall",
                                  )}
                                />
                                <DetailRow
                                  label="Gated Colony"
                                  value={get(p, "propertyFeatures.gatedColony")}
                                />

                                <DetailRow
                                  label="Has Outhouse"
                                  value={get(p, "propertyFeatures.hasOuthouse")}
                                />
                                {get(p, "propertyFeatures.hasOuthouse") ===
                                  "Yes" && (
                                  <DetailRow
                                    label="Outhouse Area"
                                    value={get(
                                      p,
                                      "propertyFeatures.outhouseArea",
                                    )}
                                    suffix="sqft"
                                  />
                                )}
                              </div>

                              {(get(p, "propertyFeatures.parking") ||
                                get(p, "propertyFeatures.garden")) && (
                                <div className="pt-2 mt-2 border-t border-orange-200">
                                  <span className="text-xs text-gray-500 mb-1 block">
                                    Facilities:
                                  </span>
                                  <div className="flex gap-2 flex-wrap">
                                    {get(p, "propertyFeatures.parking") && (
                                      <span className="px-2 py-0.5 bg-white text-orange-700 border border-orange-200 rounded-lg text-[10px] font-medium shadow-sm">
                                        Parking
                                      </span>
                                    )}
                                    {get(p, "propertyFeatures.garden") && (
                                      <span className="px-2 py-0.5 bg-white text-orange-700 border border-orange-200 rounded-lg text-[10px] font-medium shadow-sm">
                                        Garden
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-gray-100 space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaHardHat className="text-gray-400 text-[10px]" />
                                <span className="font-medium">Contractor:</span>
                                <span className="text-gray-900">
                                  {get(p, "constructor") || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaUser className="text-gray-400 text-[10px]" />
                                <span className="font-medium">Broker:</span>
                                <span className="text-gray-900">
                                  {get(p, "broker") || "None"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaFileAlt className="text-gray-400 text-[10px]" />
                                <span className="font-medium">Reference:</span>
                                <span className="text-gray-900">
                                  {get(p, "reference") || "None"}
                                </span>
                              </div>
                              {get(p, "staffEngaged") && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <FaUserTie className="text-gray-400 text-[10px]" />
                                  <span className="font-medium">
                                    Staff Engaged:
                                  </span>
                                  <span className="text-gray-900">
                                    {get(p, "staffEngaged")}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaUniversity className="text-gray-400 text-[10px]" />
                                <span className="font-medium">
                                  Loan Provider:
                                </span>
                                <span className="text-gray-900">
                                  {get(p, "loanProvider") || "None"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CollapsibleSection>
            )}

          {(normalizedBlocksData.length > 0 ||
            (project.type || "").toLowerCase() === "apartment") && (
            <CollapsibleSection
              title="Blocks & Floors Overview"
              icon={<FaLayerGroup className="text-indigo-600" />}
              isExpanded={expandedSections.blocks}
              onToggle={() => toggleSection("blocks")}
              count={normalizedBlocksData.length}
            >
              {expandedSections.blocks && (
                <div className="grid grid-cols-1 gap-6">
                  {normalizedBlocksData.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <FaLayerGroup className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">
                        No blocks configured.
                      </p>
                    </div>
                  ) : (
                    normalizedBlocksData.map((block, bIdx) => (
                      <div
                        key={block.id || bIdx}
                        className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                      >
                        <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <FaLayerGroup className="text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">
                                {block.name}
                              </h4>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                {block.prefix} • {block.totalUnits || 0}/
                                {block.capacity || 0} Units
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold shadow-sm">
                              {block.residentialFloors || 0} Res.
                            </span>
                            <span className="px-3 py-1 bg-white border border-amber-100 text-amber-700 rounded-full text-xs font-bold shadow-sm">
                              {block.parkingFloors || 0} Park.
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(block.floors || []).map((floor, fIdx) => (
                              <div
                                key={floor.id || fIdx}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs"
                              >
                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
                                  <h5 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    {floor.floorName}
                                  </h5>
                                  <span
                                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${floor.floorType === "parking" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                                  >
                                    {floor.floorType}
                                  </span>
                                </div>

                                <div className="grid grid-cols-4 gap-1.5">
                                  {(floor.units || []).map((unit, uIdx) => (
                                    <button
                                      key={unit.id || uIdx}
                                      onClick={() =>
                                        setSelectedApartmentUnit(unit)
                                      }
                                      className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                                        unit.isComplete
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-sm"
                                          : "bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100"
                                      }`}
                                    >
                                      <span className="text-[10px] font-bold truncate w-full px-1 text-center">
                                        {unit.name ||
                                          unit.unitNo ||
                                          `U${uIdx + 1}`}
                                      </span>
                                      <span className="text-[8px] font-medium opacity-70">
                                        {unit.unitType ||
                                          unit.roomType ||
                                          "N/A"}
                                      </span>
                                    </button>
                                  ))}
                                  {(!floor.units ||
                                    floor.units.length === 0) && (
                                    <div className="col-span-4 py-2 text-center text-[10px] text-gray-400 italic">
                                      No units added
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CollapsibleSection>
          )}

          {(normalizedUnitsData.length > 0 ||
            ["duplex", "triplex"].includes(project.type)) && (
            <CollapsibleSection
              title="Units Configuration"
              icon={<FaHome className="text-blue-600" />}
              isExpanded={expandedSections.units}
              onToggle={() => toggleSection("units")}
              count={normalizedUnitsData.length}
            >
              {expandedSections.units && (
                <div className="space-y-6">
                  {normalizedUnitsData.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <FaHome className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">No units configured.</p>
                    </div>
                  ) : (
                    normalizedUnitsData.map((u, i) => {
                      const unitId = u.id || u.apiId || i;
                      const projectId = project.id;
                      const floors =
                        get(u, "floors") ||
                        (u.floorDetails ? u.floorDetails : {});

                      return (
                        <div
                          key={unitId}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <FaHome className="text-indigo-600" />
                              </div>
                              <div>
                                {project.type === "commercial" && u.floor && (
                                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                                    {u.floor}
                                  </div>
                                )}
                                <h4 className="font-bold text-gray-900 text-lg leading-tight">
                                  {u.name || `Unit ${i + 1}`}
                                </h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {get(u, "roomType", "room_type") || "N/A"}
                                  </span>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    {get(
                                      u,
                                      "areaDetails.carpetArea",
                                      "areaDetails.carpet_area",
                                      "area",
                                    ) || "N/A"}{" "}
                                    sq-ft
                                  </span>
                                  {u.isComplete && (
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                      Complete
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500 space-y-1">
                              <div>ID: {u.id ?? "—"}</div>
                              {u.apiId && <div>API: {u.apiId}</div>}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <DetailRow
                              label="Price"
                              value={formatMoney(
                                get(
                                  u,
                                  "priceDetails.expectedPrice",
                                  "priceDetails.expected_price",
                                ),
                              )}
                            />

                            <DetailRow
                              label="Contractor"
                              value={u.constructor}
                            />
                          </div>

                          {(u.mainInfo ||
                            u.propertyFeatures ||
                            u.broker ||
                            u.broker_id ||
                            u.contractor ||
                            u.open_sides ||
                            u.staff_engaged ||
                            u.loan_provider ||
                            u.possession_status ||
                            u.approval_status) && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FaInfoCircle className="text-blue-500" />{" "}
                                Property Details
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                                {u.mainInfo && (
                                  <>
                                    {u.mainInfo.facing && (
                                      <DetailRow
                                        label="Facing"
                                        value={u.mainInfo.facing}
                                      />
                                    )}
                                    {u.mainInfo.landArea && (
                                      <DetailRow
                                        label="Land Area"
                                        value={u.mainInfo.landArea}
                                        suffix="sq-ft"
                                      />
                                    )}
                                    {u.mainInfo.totalBuiltUpArea && (
                                      <DetailRow
                                        label="Built-up Area"
                                        value={u.mainInfo.totalBuiltUpArea}
                                        suffix="sq-ft"
                                      />
                                    )}
                                    {u.mainInfo.groundFloorArea && (
                                      <DetailRow
                                        label="Ground Floor Area"
                                        value={u.mainInfo.groundFloorArea}
                                        suffix="sq-ft"
                                      />
                                    )}
                                    {u.mainInfo.firstFloorArea && (
                                      <DetailRow
                                        label="1st Floor Area"
                                        value={u.mainInfo.firstFloorArea}
                                        suffix="sq-ft"
                                      />
                                    )}
                                    {u.mainInfo.secondFloorArea && (
                                      <DetailRow
                                        label="2nd Floor Area"
                                        value={u.mainInfo.secondFloorArea}
                                        suffix="sq-ft"
                                      />
                                    )}
                                    {u.mainInfo.staircaseArea && (
                                      <DetailRow
                                        label="Staircase Area"
                                        value={u.mainInfo.staircaseArea}
                                        suffix="sq-ft"
                                      />
                                    )}
                                    {u.mainInfo.individualBoundary !==
                                      undefined && (
                                      <DetailRow
                                        label="Individual Boundary"
                                        value={
                                          u.mainInfo.individualBoundary
                                            ? "Yes"
                                            : "No"
                                        }
                                      />
                                    )}
                                  </>
                                )}

                                {u.propertyFeatures && (
                                  <>
                                    {u.propertyFeatures.bedrooms && (
                                      <DetailRow
                                        label="Bedrooms"
                                        value={u.propertyFeatures.bedrooms}
                                      />
                                    )}
                                    {u.propertyFeatures.bathrooms && (
                                      <DetailRow
                                        label="Bathrooms"
                                        value={u.propertyFeatures.bathrooms}
                                      />
                                    )}
                                    {u.propertyFeatures.balconies && (
                                      <DetailRow
                                        label="Balconies"
                                        value={u.propertyFeatures.balconies}
                                      />
                                    )}
                                    {u.propertyFeatures.parking && (
                                      <DetailRow
                                        label="Parking"
                                        value={u.propertyFeatures.parking}
                                      />
                                    )}
                                    {u.propertyFeatures.totalRooms && (
                                      <DetailRow
                                        label="Total Rooms"
                                        value={u.propertyFeatures.totalRooms}
                                      />
                                    )}
                                    {u.propertyFeatures.roomAreas &&
                                      Array.isArray(
                                        u.propertyFeatures.roomAreas,
                                      ) &&
                                      u.propertyFeatures.roomAreas.length >
                                        0 && (
                                        <DetailRow
                                          label="Room Areas"
                                          value={u.propertyFeatures.roomAreas
                                            .filter(Boolean)
                                            .map((a) => `${a} sqft`)
                                            .join(", ")}
                                        />
                                      )}
                                    {u.propertyFeatures.washrooms && (
                                      <DetailRow
                                        label="Washrooms"
                                        value={u.propertyFeatures.washrooms}
                                      />
                                    )}
                                    {u.propertyFeatures.washroomAreas &&
                                      Array.isArray(
                                        u.propertyFeatures.washroomAreas,
                                      ) &&
                                      u.propertyFeatures.washroomAreas.length >
                                        0 && (
                                        <DetailRow
                                          label="Washroom Areas"
                                          value={u.propertyFeatures.washroomAreas
                                            .filter(Boolean)
                                            .map((a) => `${a} sqft`)
                                            .join(", ")}
                                        />
                                      )}
                                    {u.propertyFeatures.personalWashroom && (
                                      <DetailRow
                                        label="Personal Washroom"
                                        value={
                                          u.propertyFeatures.personalWashroom
                                        }
                                      />
                                    )}
                                    {u.propertyFeatures
                                      .personalWashroomArea && (
                                      <DetailRow
                                        label="Personal Washroom Area"
                                        value={
                                          u.propertyFeatures
                                            .personalWashroomArea
                                        }
                                        suffix="sqft"
                                      />
                                    )}
                                    {u.propertyFeatures.furnishedStatus && (
                                      <DetailRow
                                        label="Furnishing Status"
                                        value={
                                          u.propertyFeatures.furnishedStatus
                                        }
                                      />
                                    )}
                                    {u.propertyFeatures.pantryCafeteria && (
                                      <DetailRow
                                        label="Pantry/Cafeteria"
                                        value={
                                          u.propertyFeatures.pantryCafeteria
                                        }
                                      />
                                    )}
                                  </>
                                )}
                                {u.open_sides && (
                                  <DetailRow
                                    label="Open Sides"
                                    value={`${u.open_sides} Sides`}
                                  />
                                )}

                                {get(u, "broker", "broker_id") && (
                                  <DetailRow
                                    label="Broker"
                                    value={get(u, "broker", "broker_id")}
                                  />
                                )}
                                {u.staff_engaged && (
                                  <DetailRow
                                    label="Staff Engaged"
                                    value={u.staff_engaged}
                                  />
                                )}
                                {u.contractor && (
                                  <DetailRow
                                    label="Contractor"
                                    value={u.contractor}
                                  />
                                )}
                                {u.contractor_work_type && (
                                  <DetailRow
                                    label="Work Type"
                                    value={u.contractor_work_type}
                                  />
                                )}
                                {u.loan_provider && (
                                  <DetailRow
                                    label="Loan Provider"
                                    value={u.loan_provider}
                                  />
                                )}
                                {(() => {
                                  const status =
                                    get(
                                      u,
                                      "propertyFeatures.possessionStatus",
                                    ) ||
                                    get(u, "possessionStatus") ||
                                    get(u, "possession_status") ||
                                    get(
                                      u,
                                      "transactionType.possessionStatus",
                                    ) ||
                                    get(
                                      u,
                                      "propertyFeatures.possession_status",
                                    );
                                  if (!status) return null;
                                  return (
                                    <DetailRow
                                      label="Possession Status"
                                      value={status}
                                    />
                                  );
                                })()}
                                {u.transactionType?.availableFromMonth &&
                                  u.transactionType?.availableFromYear && (
                                    <DetailRow
                                      label="Available From"
                                      value={`${u.transactionType.availableFromMonth} ${u.transactionType.availableFromYear}`}
                                    />
                                  )}
                                {u.transactionType?.currentlyLeasedOut && (
                                  <DetailRow
                                    label="Currently Leased Out"
                                    value={u.transactionType.currentlyLeasedOut}
                                  />
                                )}
                                {u.transactionType?.assuredReturns && (
                                  <DetailRow
                                    label="Assured Returns"
                                    value={u.transactionType.assuredReturns}
                                  />
                                )}
                                {u.transaction_type?.availableFrom?.month &&
                                  u.transaction_type?.availableFrom?.year && (
                                    <DetailRow
                                      label="Available From"
                                      value={`${u.transaction_type.availableFrom.month} ${u.transaction_type.availableFrom.year}`}
                                    />
                                  )}
                                {get(
                                  u,
                                  "fileName",
                                  "file_name",
                                  "attachment",
                                ) && (
                                  <DetailRow
                                    label="Attachment"
                                    value={get(
                                      u,
                                      "fileName",
                                      "file_name",
                                      "attachment",
                                    )}
                                  />
                                )}
                              </div>
                              {u.approval_status &&
                                Array.isArray(u.approval_status) &&
                                u.approval_status.some(
                                  (a) => a.authority || a.status,
                                ) && (
                                  <div className="mt-3 border-t border-gray-200 pt-3">
                                    <h6 className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                                      Approval Status
                                    </h6>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {u.approval_status.map(
                                        (approval, idx) =>
                                          (approval.authority ||
                                            approval.status) && (
                                            <div
                                              key={idx}
                                              className="bg-white p-2 rounded border border-gray-100 text-sm"
                                            >
                                              <div className="font-medium text-gray-800">
                                                {approval.authority ||
                                                  "Unknown"}
                                              </div>
                                              <div className="text-gray-500 text-xs">
                                                {approval.status || "N/A"}
                                              </div>
                                            </div>
                                          ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                          {project.type !== "commercial" && (
                            <div className="mt-4">
                              <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FaLayerGroup className="text-gray-500" />
                                Floor Details
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FloorBlock
                                  title="Ground Floor"
                                  floor={
                                    get(
                                      floors,
                                      "groundFloor",
                                      "ground_floor",
                                    ) || get(u, "groundFloor", "ground_floor")
                                  }
                                  projectId={projectId}
                                  unitId={unitId}
                                  floorKey="groundFloor"
                                  unitData={u}
                                />
                                <FloorBlock
                                  title="1st Floor"
                                  floor={
                                    get(floors, "firstFloor", "first_floor") ||
                                    get(u, "firstFloor", "first_floor")
                                  }
                                  projectId={projectId}
                                  unitId={unitId}
                                  floorKey="firstFloor"
                                  unitData={u}
                                />
                                {get(floors, "secondFloor", "second_floor") ||
                                get(u, "secondFloor", "second_floor") ? (
                                  <FloorBlock
                                    title="2nd Floor"
                                    floor={
                                      get(
                                        floors,
                                        "secondFloor",
                                        "second_floor",
                                      ) || get(u, "secondFloor", "second_floor")
                                    }
                                    projectId={projectId}
                                    unitId={unitId}
                                    floorKey="secondFloor"
                                    unitData={u}
                                  />
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CollapsibleSection>
          )}

          {project.type === "custom" && (
            <CollapsibleSection
              title="Custom Project Components"
              icon={<FaLayerGroup className="text-pink-600" />}
              isExpanded={expandedSections.custom}
              onToggle={() => toggleSection("custom")}
            >
              {expandedSections.custom && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(() => {
                      const rawSubTypes = get(project, "subTypes", "sub_types");
                      const subTypes = Array.isArray(rawSubTypes)
                        ? rawSubTypes
                        : typeof rawSubTypes === "string"
                          ? parseData(rawSubTypes)
                          : [];

                      return (subTypes || []).map((type, i) => {
                        let isComplete = false;
                        let hasData = false;

                        if (type === "plotting") {
                          hasData = plots.length > 0;
                          isComplete =
                            hasData && plots.every((p) => p.isComplete);
                        } else {
                          const subUnits = units.filter(
                            (u) => u.projectType === type || u.type === type,
                          );
                          hasData = subUnits.length > 0;
                          isComplete =
                            hasData && subUnits.every((u) => u.isComplete);
                        }

                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2 pr-3 shadow-sm"
                          >
                            <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-bold uppercase tracking-wider">
                              {type}
                            </span>
                            {!hasData ? (
                              <span className="text-[10px] text-gray-500 font-semibold flex items-center">
                                <FaInfoCircle className="mr-1 text-gray-400" />{" "}
                                No Data
                              </span>
                            ) : isComplete ? (
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                                <FaCheckCircle className="mr-1 text-emerald-500" />{" "}
                                Complete
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-semibold flex items-center">
                                <FaTimes className="mr-1 text-amber-500" />{" "}
                                Incomplete
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {project.configuration && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                        <FaLayerGroup /> Configuration Summary
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                          icon={<FaRulerCombined className="text-orange-500" />}
                          label="Plots"
                          value={normalizedPlotsData.length}
                        />
                        <StatCard
                          icon={<FaBuilding className="text-indigo-500" />}
                          label="Blocks"
                          value={normalizedBlocksData.length}
                        />
                        <StatCard
                          icon={<FaHome className="text-blue-500" />}
                          label="Units"
                          value={normalizedUnitsData.length}
                        />
                        <StatCard
                          icon={<FaCalendar className="text-purple-500" />}
                          label="Revenue Plots"
                          value={revenuePlots.length}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CollapsibleSection>
          )}
        </div>
      </div>

      {selectedApartmentUnit && (
        <div
          className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ pointerEvents: "auto" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-linear-to-r from-indigo-600 to-blue-600 p-6 flex justify-between items-start text-white">
              <div>
                <h3 className="text-xl font-bold">
                  {get(selectedApartmentUnit, "name") ||
                    get(selectedApartmentUnit, "unitNo") ||
                    "Unit Details"}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Type:{" "}
                  {get(
                    selectedApartmentUnit,
                    "unitType",
                    "roomType",
                    "unit_type",
                    "room_type",
                  ) || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setSelectedApartmentUnit(null)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <PriceCard
                  label="Expected Price"
                  value={formatMoney(
                    get(
                      selectedApartmentUnit,
                      "priceDetails.expectedPrice",
                      "priceDetails.expected_price",
                      "expectedPrice",
                      "expected_price",
                    ),
                  )}
                />
                <PriceCard
                  type="secondary"
                  label="Token Amount"
                  value={formatMoney(
                    get(
                      selectedApartmentUnit,
                      "priceDetails.tokenAmount",
                      "priceDetails.token_amount",
                      "tokenAmount",
                      "token_amount",
                    ),
                  )}
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <FaLayerGroup /> Room Configuration
                </h4>
                <div className="flex gap-4 mb-3">
                  <div className="bg-white px-3 py-2 rounded-lg border border-purple-100 text-center flex-1">
                    <div className="text-xs text-purple-600 font-bold uppercase">
                      Bedrooms
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {get(
                        selectedApartmentUnit,
                        "propertyFeatures.bedrooms",
                        "bedrooms",
                      ) || 0}
                    </div>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-purple-100 text-center flex-1">
                    <div className="text-xs text-purple-600 font-bold uppercase">
                      Bathrooms
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {get(
                        selectedApartmentUnit,
                        "propertyFeatures.bathrooms",
                        "bathrooms",
                      ) || 0}
                    </div>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-purple-100 text-center flex-1">
                    <div className="text-xs text-purple-600 font-bold uppercase">
                      Balconies
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {get(
                        selectedApartmentUnit,
                        "propertyFeatures.balcony",
                        "balcony",
                      ) || 0}
                    </div>
                  </div>
                </div>

                {(() => {
                  const roomAreas =
                    get(selectedApartmentUnit, "roomAreas") || {};
                  const bedroomAreas = roomAreas.bedrooms || [];
                  const bathroomAreas = roomAreas.bathrooms || [];
                  const balconyAreas = roomAreas.balconies || [];

                  if (
                    bedroomAreas.length === 0 &&
                    bathroomAreas.length === 0 &&
                    balconyAreas.length === 0
                  )
                    return null;

                  return (
                    <div className="space-y-2 mt-3 pt-3 border-t border-purple-200">
                      {bedroomAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {bedroomAreas.map((area, idx) =>
                            area ? (
                              <span
                                key={`bed-${idx}`}
                                className="text-xs bg-white text-purple-700 px-2 py-1 rounded border border-purple-100"
                              >
                                🛏️ Bed {idx + 1}: <b>{area} sqft</b>
                              </span>
                            ) : null,
                          )}
                        </div>
                      )}
                      {bathroomAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {bathroomAreas.map((area, idx) =>
                            area ? (
                              <span
                                key={`bath-${idx}`}
                                className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-100"
                              >
                                🚿 Bath {idx + 1}: <b>{area} sqft</b>
                              </span>
                            ) : null,
                          )}
                        </div>
                      )}
                      {balconyAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {balconyAreas.map((area, idx) =>
                            area ? (
                              <span
                                key={`balc-${idx}`}
                                className="text-xs bg-white text-green-700 px-2 py-1 rounded border border-green-100"
                              >
                                🌿 Balcony {idx + 1}: <b>{area} sqft</b>
                              </span>
                            ) : null,
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailCard
                  label="Carpet Area"
                  value={get(
                    selectedApartmentUnit,
                    "areaDetails.carpetArea",
                    "areaDetails.carpet_area",
                    "carpetArea",
                    "carpet_area",
                  )}
                  suffix="sq-ft"
                />
                <DetailCard
                  label="Built-up Area"
                  value={get(
                    selectedApartmentUnit,
                    "areaDetails.builtUpArea",
                    "areaDetails.built_up_area",
                    "builtUpArea",
                    "built_up_area",
                  )}
                  suffix="sq-ft"
                />
                <DetailCard
                  label="Super Built-up"
                  value={get(
                    selectedApartmentUnit,
                    "areaDetails.superBuiltUpArea",
                    "areaDetails.super_built_up_area",
                    "superBuiltUpArea",
                    "super_built_up_area",
                  )}
                  suffix="sq-ft"
                />
                <DetailCard
                  label="Construction Area"
                  value={get(
                    selectedApartmentUnit,
                    "areaDetails.constructionArea",
                    "areaDetails.construction_area",
                    "constructionArea",
                    "construction_area",
                  )}
                  suffix="sq-ft"
                />
                <DetailCard
                  label="Land Area"
                  value={get(
                    selectedApartmentUnit,
                    "areaDetails.landArea",
                    "areaDetails.land_area",
                    "landArea",
                    "land_area",
                  )}
                  suffix="sq-ft"
                />
                <DetailCard
                  label="Available From"
                  value={`${get(selectedApartmentUnit, "areaDetails.availableFromMonth") || "--"}/${get(selectedApartmentUnit, "areaDetails.availableFromYear") || "--"}`}
                  icon={<FaCalendar className="text-gray-400" />}
                />
              </div>

              {(() => {
                const facilities =
                  get(selectedApartmentUnit, "facilities") || [];
                if (facilities.length > 0) {
                  return (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                        <FaList /> Facilities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {facilities.map((fac, i) => (
                          <span
                            key={i}
                            className="bg-white text-orange-700 px-2 py-1 rounded-lg text-xs font-medium border border-orange-200"
                          >
                            {fac.name || fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Additional Info
                </h4>

                <DetailRow
                  label="Contractor"
                  value={
                    get(selectedApartmentUnit, "constructor") ||
                    get(selectedApartmentUnit, "contractor") ||
                    "N/A"
                  }
                />
                <DetailRow
                  label="Broker"
                  value={get(selectedApartmentUnit, "broker") || "N/A"}
                />
                <DetailRow
                  label="Staff Engaged"
                  value={get(selectedApartmentUnit, "staffEngaged") || "N/A"}
                />
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-gray-600">Loan:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {get(selectedApartmentUnit, "loan") === "Yes" ? (
                      <span className="text-sm font-semibold text-gray-900">
                        Provided by{" "}
                        {get(selectedApartmentUnit, "loanProvider") || "Bank"}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not Availed</span>
                    )}
                  </span>
                </div>

                {(() => {
                  const approvals =
                    get(selectedApartmentUnit, "approvalStatus") || [];
                  const validApprovals = approvals.filter(
                    (a) => a.authority && a.status,
                  );

                  if (validApprovals.length > 0) {
                    return (
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          Approvals
                        </span>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {validApprovals.map((app, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-white px-2 py-1 rounded border border-gray-200"
                            >
                              <span className="text-xs text-gray-600">
                                {app.authority}
                              </span>
                              <span className="text-xs font-bold text-emerald-600">
                                {app.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Construction Status
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded ${selectedApartmentUnit.isComplete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {selectedApartmentUnit.isComplete
                      ? "Complete"
                      : "In Progress"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedApartmentUnit(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium">{label}</div>
          <div className="text-sm font-semibold text-gray-900">
            {value || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  children,
  isExpanded,
  onToggle,
  count,
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {count !== undefined && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </button>
      {isExpanded && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

function DetailCard({ icon, label, value, suffix, className = "" }) {
  return (
    <div
      className={`bg-gray-50 rounded-lg p-3 border border-gray-200 ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-500">{icon}</span>}
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
      <div className="text-sm font-semibold text-gray-900">
        {value || "N/A"}{" "}
        {value && suffix && (
          <span className="text-gray-500 text-xs">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function PriceCard({ label, value, type = "primary" }) {
  const bgColor =
    type === "primary"
      ? "from-green-50 to-emerald-50 border-green-200"
      : "from-blue-50 to-cyan-50 border-blue-200";
  const textColor = type === "primary" ? "text-green-700" : "text-blue-700";

  return (
    <div className={`bg-linear-to-br ${bgColor} border rounded-xl p-4`}>
      <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
      <div className={`text-lg font-bold ${textColor}`}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value, suffix }) {
  let displayValue = value;

  if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (value === null || value === undefined || value === "") {
    displayValue = "N/A";
  }

  return (
    <div className="flex gap-3 items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-semibold text-gray-900">
        {displayValue}{" "}
        {displayValue !== "N/A" && suffix && (
          <span className="text-gray-500 text-xs">{suffix}</span>
        )}
      </span>
    </div>
  );
}
function EmptyState({ message }) {
  return (
    <div className="text-center py-8">
      <div className="text-gray-400 text-sm">{message}</div>
    </div>
  );
}

function FloorBlock({ title, floor }) {
  if (!floor || Object.keys(floor).length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h6 className="font-semibold text-gray-700 mb-2 text-sm">{title}</h6>
        <p className="text-xs text-gray-400">No data available</p>
      </div>
    );
  }

  const parseArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const bedroomAreas = parseArray(floor.bedroomAreas || floor.bedroom_areas);
  const bathroomAreas = parseArray(floor.bathroomAreas || floor.bathroom_areas);
  const studyRoomAreas = parseArray(
    floor.studyRoomAreas || floor.study_room_areas,
  );
  const kitchenArea = floor.kitchenArea || floor.kitchen_area;
  const garageArea = floor.garageArea || floor.garage_area;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <h6 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
        <FaDoorOpen className="text-indigo-500" />
        {title}
      </h6>

      <div className="space-y-3">
        {(floor.totalBedrooms || floor.totalBathrooms || floor.studyRoom) && (
          <div className="grid grid-cols-3 gap-2">
            {floor.totalBedrooms && (
              <div className="text-center bg-blue-50 rounded-lg p-2 border border-blue-100">
                <div className="text-[10px] text-blue-600 font-medium">
                  Bedrooms
                </div>
                <div className="text-sm font-bold text-blue-700">
                  {floor.totalBedrooms}
                </div>
              </div>
            )}
            {floor.totalBathrooms && (
              <div className="text-center bg-cyan-50 rounded-lg p-2 border border-cyan-100">
                <div className="text-[10px] text-cyan-600 font-medium">
                  Bathrooms
                </div>
                <div className="text-sm font-bold text-cyan-700">
                  {floor.totalBathrooms}
                </div>
              </div>
            )}
            {floor.studyRoom && (
              <div className="text-center bg-purple-50 rounded-lg p-2 border border-purple-100">
                <div className="text-[10px] text-purple-600 font-medium">
                  Study Rooms
                </div>
                <div className="text-sm font-bold text-purple-700">
                  {floor.studyRoom}
                </div>
              </div>
            )}
          </div>
        )}

        {bedroomAreas.length > 0 && (
          <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">
              Bedroom Areas (sq-ft)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {bedroomAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium"
                >
                  BR{idx + 1}: {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {bathroomAreas.length > 0 && (
          <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">
              Bathroom Areas (sq-ft)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {bathroomAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px] font-medium"
                >
                  BA{idx + 1}: {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {studyRoomAreas.length > 0 && (
          <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">
              Study Room Areas (sq-ft)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {studyRoomAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium"
                >
                  SR{idx + 1}: {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {(floor.livingArea ||
          floor.diningArea ||
          kitchenArea ||
          garageArea) && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {floor.livingArea && (
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <div className="text-[9px] text-green-600 font-medium">
                  Living Area
                </div>
                <div className="text-xs font-bold text-green-700">
                  {floor.livingArea}{" "}
                  <span className="text-[9px] font-normal text-green-500">
                    sq-ft
                  </span>
                </div>
              </div>
            )}
            {floor.diningArea && (
              <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                <div className="text-[9px] text-amber-600 font-medium">
                  Dining Area
                </div>
                <div className="text-xs font-bold text-amber-700">
                  {floor.diningArea}{" "}
                  <span className="text-[9px] font-normal text-amber-500">
                    sq-ft
                  </span>
                </div>
              </div>
            )}
            {kitchenArea && (
              <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                <div className="text-[9px] text-red-600 font-medium">
                  Kitchen Area
                </div>
                <div className="text-xs font-bold text-red-700">
                  {kitchenArea}{" "}
                  <span className="text-[9px] font-normal text-red-500">
                    sq-ft
                  </span>
                </div>
              </div>
            )}
            {garageArea && (
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="text-[9px] text-gray-600 font-medium">
                  Garage Area
                </div>
                <div className="text-xs font-bold text-gray-700">
                  {garageArea}{" "}
                  <span className="text-[9px] font-normal text-gray-500">
                    sq-ft
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {(floor.kitchen || floor.garage) && (
          <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100">
            {floor.kitchen && floor.kitchen !== "No" && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-medium flex items-center gap-1">
                <FaUtensils className="text-[8px]" /> Kitchen
              </span>
            )}
            {floor.garage && floor.garage !== "No" && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-medium flex items-center gap-1">
                <FaCar className="text-[8px]" /> Garage
              </span>
            )}
          </div>
        )}

        {floor.additionalNotes && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">
              Notes
            </div>
            <p className="text-[10px] text-gray-600 italic">
              {floor.additionalNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectViewForm;
