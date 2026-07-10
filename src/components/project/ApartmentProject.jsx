import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaEdit,
  FaChevronUp,
  FaChevronDown,
  FaBuilding,
  FaHome,
  FaCar,
  FaCheck,
  FaTimes,
  FaBed,
  FaBath,
  FaDoorOpen,
  FaRuler,
  FaLayerGroup,
  FaFolder,
  FaMapMarkerAlt,
  FaChevronRight,
  FaChevronLeft,
  FaHashtag,
  FaArrowRight,
  FaParking,
  FaCheckCircle,
  FaCogs,
  FaSortAmountUp,
  FaChartLine,
  FaInfoCircle,
  FaDatabase,
  FaCog,
  FaShieldAlt,
  FaSwimmingPool,
  FaDumbbell,
  FaLeaf,
  FaPlug,
  FaWifi,
  FaBroom,
  FaVideo,
  FaRulerCombined,
  FaPaperclip,
  FaPlusCircle,
  FaFileInvoice,
  FaChartPie,
  FaSpinner,
  FaDownload,
} from "react-icons/fa";
import {
  INITIAL_PRICE_DETAILS,
  INITIAL_PROPERTY_FEATURES,
  INITIAL_AREA_DETAILS,
  INITIAL_TRANSACTION_TYPE,
  INITIAL_APPROVAL_STATUS,
} from "../project/shared/initialStates";
import projectService from "./projectService";
import { X, Home, LayoutGrid, Building2 } from "lucide-react";
import axios from "axios";
import { getAuthSlug } from "../../store/authSession";

const getSlug = () => getAuthSlug();


const getFloorName = (floorNumber, floorType = "residential") => {
  const residentialNames = [
    "Ground Floor",
    "First Floor",
    "Second Floor",
    "Third Floor",
    "Fourth Floor",
    "Fifth Floor",
    "Sixth Floor",
    "Seventh Floor",
    "Eighth Floor",
    "Ninth Floor",
    "Tenth Floor",
    "Eleventh Floor",
    "Twelfth Floor",
    "Thirteenth Floor",
    "Fourteenth Floor",
    "Fifteenth Floor",
  ];

  const parkingNames = [
    "Ground Parking",
    "First Parking",
    "Second Parking",
    "Third Parking",
    "Fourth Parking",
    "Fifth Parking",
  ];

  if (floorType === "parking") {
    return floorNumber <= parkingNames.length
      ? parkingNames[floorNumber - 1]
      : `Parking ${floorNumber}`;
  }

  return floorNumber <= residentialNames.length
    ? residentialNames[floorNumber - 1]
    : `Floor ${floorNumber}`;
};

const ApartmentProject = ({
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
  isSubtype = false,
  PROJECT_TYPES = {
    APARTMENT: "Apartment",
    PLOTTING: "Plotting",
    DUPLEX: "Duplex",
    TRIPLEX: "Triplex",
    COMMERCIAL: "Commercial",
    CUSTOM: "Custom",
  },
  editingProjectId,
  selectedProject,
  onClose,
  openInUnitsTab = false,
}) => {

  const [blocks, setBlocks] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [priceDetails, setPriceDetails] = useState(INITIAL_PRICE_DETAILS);
  const [propertyFeatures, setPropertyFeatures] = useState(
    INITIAL_PROPERTY_FEATURES,
  );
  const [areaDetails, setAreaDetails] = useState(INITIAL_AREA_DETAILS);
  const [broker, setBroker] = useState("");

  const [constructor, setConstructor] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(INITIAL_APPROVAL_STATUS);
  const [transactionType, setTransactionType] = useState(
    INITIAL_TRANSACTION_TYPE,
  );
  const [revenuePlots, setRevenuePlots] = useState([]);
  const [revenuePlotsCount, setRevenuePlotsCount] = useState(0);
  const [showPlotDetails, setShowPlotDetails] = useState(false);
  const [landArea, setLandArea] = useState(0);
  const [projectId, setProjectId] = useState(editingProjectId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [staffEngaged, setStaffEngaged] = useState("");
  const [loanProvider, setLoanProvider] = useState("");
  const [loan, setLoan] = useState("");
  const [facilities, setFacilities] = useState([]);

  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [newFacility, setNewFacility] = useState("");
  const [roomAreas, setRoomAreas] = useState({
    bedrooms: [],
    bathrooms: [],
    balconies: [],
  });
  const [activeTab, setActiveTab] = useState("project-info");
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [expandedFloors, setExpandedFloors] = useState({});


  const [manualBlockCount, setManualBlockCount] = useState(0);
  const [manualResidentialFloors, setManualResidentialFloors] = useState({});
  const [manualParkingFloors, setManualParkingFloors] = useState({});
  const [manualUnitCounts, setManualUnitCounts] = useState({});
  const [editingName, setEditingName] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editMode, setEditMode] = useState(
    editingProjectId ? "overview" : "blocks",
  );

  const [showBlockUnitOverview, setShowBlockUnitOverview] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const [brokersList, setBrokersList] = useState([]);
  const [contractorsList, setContractorsList] = useState([]);

  const [loadingBrokers, setLoadingBrokers] = useState(false);
  const [loadingContractors, setLoadingContractors] = useState(false);


  useEffect(() => {
    if (selectedProject && editingProjectId) {
      let parsedBlocks = [];


      if (selectedProject.blocks_data) {
        try {
          parsedBlocks =
            typeof selectedProject.blocks_data === "string"
              ? JSON.parse(selectedProject.blocks_data)
              : selectedProject.blocks_data;
        } catch (e) {
          console.error("Failed to parse blocks_data", e);
        }
      }


      const extractedUnits = [];
      parsedBlocks.forEach((block) => {
        block.floors?.forEach((floor) => {
          floor.units?.forEach((unit) => {
            extractedUnits.push(unit);
          });
        });
      });


      setBlocks(parsedBlocks);
      setUnits(extractedUnits);
      setTotalUnits(selectedProject.total_units || extractedUnits.length);
      setLandArea(selectedProject.land_area || 0);
    }

    if (selectedProject?.revenue_plots_data) {
      try {
        const parsedPlots =
          typeof selectedProject.revenue_plots_data === "string"
            ? JSON.parse(selectedProject.revenue_plots_data)
            : selectedProject.revenue_plots_data;

        setRevenuePlots(parsedPlots || []);
        setRevenuePlotsCount(
          parsedPlots?.length || selectedProject.revenue_plots || 0,
        );
      } catch (e) {
        console.error("Failed to parse revenue plots", e);
        setRevenuePlots([]);
      }
    }
  }, [selectedProject, editingProjectId]);


  const handleRevenuePlotsCountChange = (newCount) => {
    setRevenuePlotsCount(newCount);
    if (newCount > 0) {
      const newPlots = [...revenuePlots];
      if (newPlots.length < newCount) {
        for (let i = newPlots.length; i < newCount; i++) {
          newPlots[i] = {
            plot_area_sqft: "",
            plot_no: "",
            khata_no: "",
            fileName: "",
            file: null,
            status: "available",
            id: `plot_${Date.now()}_${i}`,
          };
        }
      } else if (newPlots.length > newCount) {
        newPlots.splice(newCount);
      }
      setRevenuePlots(newPlots);
      setShowPlotDetails(true);
    } else {
      setRevenuePlots([]);
    }
  };

  const handlePlotChange = (index, field, value) => {
    const updated = [...revenuePlots];
    updated[index][field] = value;
    setRevenuePlots(updated);
  };

  const handlePlotFileChange = (index, file) => {
    const updated = [...revenuePlots];
    updated[index] = {
      ...updated[index],
      file: file,
      fileName: file ? file.name : "",
    };
    setRevenuePlots(updated);
  };

  const removePlot = (index) => {
    const updated = revenuePlots.filter((_, i) => i !== index);
    setRevenuePlots(updated);
    setRevenuePlotsCount(updated.length);
  };

  const addPlot = () => {
    const newCount = revenuePlotsCount + 1;
    setRevenuePlotsCount(newCount);
    setRevenuePlots([
      ...revenuePlots,
      {
        plot_area_sqft: "",
        plot_no: "",
        khata_no: "",
        fileName: "",
        file: null,
        status: "available",
        id: `plot_${Date.now()}_${revenuePlots.length}`,
      },
    ]);
    setShowPlotDetails(true);
  };

  useEffect(() => {
    if (editingProjectId) {
      setEditMode("overview");
    } else {
      setEditMode("blocks");
    }
  }, [editingProjectId]);

  useEffect(() => {
    if (editingProjectId && selectedProject && openInUnitsTab) {
      setActiveTab("units");
    }
  }, [editingProjectId, selectedProject, openInUnitsTab]);


  const toggleBlockExpansion = (blockId) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };


  const toggleFloorExpansion = (blockId, floorId) => {
    setExpandedFloors((prev) => ({
      ...prev,
      [`${blockId}-${floorId}`]: !prev[`${blockId}-${floorId}`],
    }));
  };


  const handleSaveProject = async () => {
    if (!projectName || !projectType) {
      alert("Please enter project name and type");
      return;
    }

    setIsSaving(true);

    try {

      let finalBlocks = blocks.map((block) => {
        const updatedFloors = block.floors.map((floor) => {
          const updatedUnits = floor.units.map((unit) => {
            const isCurrentlyEditing =
              selectedUnit && unit.id === selectedUnit.id;

            if (isCurrentlyEditing) {
              const updatedUnit = {
                ...unit,
                ...selectedUnit,
                priceDetails,
                areaDetails,
                propertyFeatures,
                roomAreas,
                broker,
                constructor,
                approvalStatus,
                loan,
                loanProvider,
                staffEngaged,
                facilities,
                isComplete: true,
                lastSaved: new Date().toISOString(),
                isBeingEdited: false,
              };
              return updatedUnit;
            }
            return unit;
          });
          return { ...floor, units: updatedUnits };
        });
        return { ...block, floors: updatedFloors };
      });

      if (selectedUnit) {

        setBlocks(finalBlocks);
        setUnits((prev) =>
          prev.map((u) => {
            if (u.id === selectedUnit.id) {
              return {
                ...u,
                ...selectedUnit,
                priceDetails,
                areaDetails,
                propertyFeatures,
                roomAreas,
                broker,
                constructor,
                approvalStatus,
                loan,
                loanProvider,
                staffEngaged,
                facilities,
                isComplete: true,
                lastSaved: new Date().toISOString(),
                isBeingEdited: false,
              };
            }
            return u;
          }),
        );
      }

      const projectData = {
        name: projectName,
        type: projectType,
        city,
        locality,
        slug: getSlug(),
        subdomain: getSlug(),
        land_zone: landZone,
        land_area: landArea,
        blocks: finalBlocks,
        revenue_plots: revenuePlotsCount,
        revenuePlotsData: (revenuePlots || [])
          .filter(
            (plot) =>
              plot.plot_no ||
              plot.plot_area_sqft ||
              plot.khata_no ||
              plot.fileName,
          )
          .map((plot) => {
            const { file, ...rest } = plot;
            return rest;
          }),
        total_units: totalUnits,
        approvalStatus: approvalStatus,
        broker,
        constructor,
      };
      console.log(projectData);

      if (isSubtype) {


        onSaveProject?.({ ...projectData, id: projectId });
        setSuccessMessage("Project saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setIsSaving(false);
        return;
      }

      if (projectId) {

        await projectService.updateApartment(projectId, projectData);
        alert("Apartment project updated successfully!");
        if (onSaveProject) {
          onSaveProject({ ...projectData, id: projectId });
        }
      } else {

        const response = await projectService.createApartment(projectData);
        setProjectId(response.id);
        alert(`Apartment project created successfully with ID: ${response.id}`);
        if (onSaveProject) {
          onSaveProject({ ...projectData, id: response.id });
        }
      }

      setSuccessMessage("Project saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving apartment project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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

  const renderBlockUnitOverview = () => {
    const blocks = normalizeBlocks(apartmentBlocks);
    const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

    return (
      <div className="space-y-6">

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBlockUnitOverview(false)}
            className="p-2 rounded-xl hover:bg-slate-100"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-xl font-bold">Block & Unit Editing Overview</h2>
            <p className="text-sm text-slate-500">
              Select a block to manage its units
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="space-y-3">
            {blocks.map((block) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlockId(block.id)}
                className={`cursor-pointer p-4 rounded-2xl border transition
                ${
                  selectedBlockId === block.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-(--border-soft) hover:bg-slate-50"
                }`}
              >
                <div className="font-semibold">Block {block.name}</div>
                <div className="text-sm text-slate-500">
                  {block._units.length} unit(s)
                </div>
              </div>
            ))}
          </div>


          <div className="lg:col-span-2">
            {!selectedBlock ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-slate-500">
                Select a block to view units
              </div>
            ) : (
              <div className="bg-white rounded-2xl border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Last Saved
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedBlock._units.map((unit) => (
                      <tr
                        key={unit.id}
                        className={`${
                          unit.isBeingEdited
                            ? "bg-blue-50"
                            : unit.lastSaved
                              ? "bg-emerald-50"
                              : "bg-slate-50/30 opacity-70"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium">
                          {unit.unitNo || unit.name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                            {unit?.propertyFeatures?.possessionStatus || unit?.possessionStatus || "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {unit.isBeingEdited
                            ? "Being Edited"
                            : unit.lastSaved
                              ? "Saved"
                              : "Draft"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setShowBlockUnitOverview(false);
                              editUnit(unit.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
                          >
                            <FaPen />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };




  const handleRoomAreaChange = (roomType, index, value) => {
    setRoomAreas((prev) => {
      const currentArray = [...(prev[roomType] || [])];
      while (currentArray.length <= index) {
        currentArray.push("");
      }
      currentArray[index] = value;
      return {
        ...prev,
        [roomType]: currentArray,
      };
    });
  };

  const calculateTotalRoomArea = (roomType) => {
    return roomAreas[roomType].reduce(
      (sum, area) => sum + (parseFloat(area) || 0),
      0,
    );
  };

  const calculateTotalBedroomArea = () => calculateTotalRoomArea("bedrooms");
  const calculateTotalBathroomArea = () => calculateTotalRoomArea("bathrooms");
  const calculateTotalBalconyArea = () => calculateTotalRoomArea("balconies");


  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);


  const startEditing = (type, id, currentValue) => {
    setEditingName(`${type}-${id}`);
    setEditingValue(currentValue);
  };


  const saveEditing = (type, id) => {
    const [entityType, entityId] = type.split("-");
    switch (entityType) {
      case "block":
        updateBlock(parseInt(entityId), "name", editingValue);
        break;
      case "blockPrefix":
        updateBlock(parseInt(entityId), "prefix", editingValue);
        break;
      case "floor":
        const [blockId, floorId] = entityId.split("_");
        updateFloor(
          parseInt(blockId),
          parseInt(floorId),
          "floorName",
          editingValue,
        );
        break;
      case "unit":
        updateUnit(parseInt(entityId), "name", editingValue);
        break;
      case "unitType":
        updateUnit(parseInt(entityId), "roomType", editingValue);
        break;
    }
    setEditingName(null);
    setEditingValue("");
  };


  const cancelEditing = () => {
    setEditingName(null);
    setEditingValue("");
  };


  const handleKeyPress = (e, type, id) => {
    if (e.key === "Enter") {
      saveEditing(type, id);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };


  const addMultipleBlocks = () => {
    if (manualBlockCount <= 0) {
      alert("Please enter a valid number of blocks");
      return;
    }

    const newBlocks = [];
    for (let i = 1; i <= manualBlockCount; i++) {
      const blockNumber = blocks.length + i;
      const newBlock = {
        id: generateId(),
        name: `Block ${blockNumber}`,
        prefix: `B${blockNumber}`,
        description: "",
        totalUnits: 0,
        capacity: 0,
        parkingFloors: 0,
        residentialFloors: 0,
        floors: [],
        isExpanded: true,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      newBlocks.push(newBlock);
    }

    setBlocks([...blocks, ...newBlocks]);
    newBlocks.forEach((block) => {
      setExpandedBlocks((prev) => ({ ...prev, [block.id]: true }));
    });

    setManualBlockCount(0);
    alert(`Added ${manualBlockCount} blocks successfully!`);
  };


  const addFloorsToBlock = (blockId) => {
    const residentialCount = manualResidentialFloors[blockId] || 0;
    const parkingCount = manualParkingFloors[blockId] || 0;

    if (residentialCount <= 0 && parkingCount <= 0) {
      alert("Please enter valid numbers for residential and/or parking floors");
      return;
    }

    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    const newFloors = [];


    for (let i = 1; i <= residentialCount; i++) {
      const floorNumber =
        block.floors.filter((f) => f.floorType === "residential").length + i;
      const floorName = getFloorName(floorNumber, "residential");
      const newFloor = {
        id: generateId(),
        blockId: blockId,
        floorNumber: floorNumber,
        floorName: floorName,
        floorType: "residential",
        totalUnits: 0,
        units: [],
        description: "",
        isExpanded: true,
        status: "draft",
      };
      newFloors.push(newFloor);
    }


    for (let i = 1; i <= parkingCount; i++) {
      const floorNumber =
        block.floors.filter((f) => f.floorType === "parking").length + i;
      const floorName = getFloorName(floorNumber, "parking");
      const newFloor = {
        id: generateId(),
        blockId: blockId,
        floorNumber: floorNumber,
        floorName: floorName,
        floorType: "parking",
        totalUnits: 0,
        units: [],
        description: "",
        isExpanded: true,
        status: "draft",
      };
      newFloors.push(newFloor);
    }

    const updatedBlocks = blocks.map((b) =>
      b.id === blockId
        ? {
            ...b,
            floors: [...b.floors, ...newFloors],
            residentialFloors: b.residentialFloors + residentialCount,
            parkingFloors: b.parkingFloors + parkingCount,
          }
        : b,
    );

    setBlocks(updatedBlocks);
    newFloors.forEach((floor) => {
      setExpandedFloors((prev) => ({
        ...prev,
        [`${blockId}-${floor.id}`]: true,
      }));
    });

    setManualResidentialFloors((prev) => ({ ...prev, [blockId]: 0 }));
    setManualParkingFloors((prev) => ({ ...prev, [blockId]: 0 }));

    alert(
      `Added ${residentialCount} residential floors and ${parkingCount} parking floors to ${block.name} successfully!`,
    );
  };


  const BHK_OPTIONS = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "6BHK", "7BHK"];


  const addMultipleUnitsToFloor = (blockId, floorId) => {
    const unitCount = manualUnitCounts[`${blockId}-${floorId}`] || 0;
    if (unitCount <= 0) {
      alert("Please enter a valid number of units");
      return;
    }

    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    const floor = block.floors.find((f) => f.id === floorId);
    if (!floor || floor.floorType === "parking") return;

    const capacity = block.capacity || 0;
    const assigned = block.totalUnits || 0;
    const remaining = capacity - assigned;

    if (remaining <= 0) {
      alert(
        "This block has no remaining unit capacity. Increase block capacity to add more units.",
      );
      return;
    }

    const allowedCount = Math.min(unitCount, remaining);

    if (allowedCount < unitCount) {
      alert(
        `Only ${allowedCount} units can be added to this block (capacity reached).`,
      );
    }

    const newUnits = [];
    for (let i = 1; i <= allowedCount; i++) {
      const unitNumber = floor.units.length + i;
      const unitPrefix = `${block.prefix}-${floor.floorNumber.toString().padStart(2, "0")}-${unitNumber.toString().padStart(2, "0")}`;
      const newUnit = {
        id: generateId(),
        blockId: blockId,
        floorId: floorId,
        name: unitPrefix,
        unitNumber: unitNumber,
        unitType: "1BHK",
        roomType: "1BHK",
        propertyFeatures: {
          ...INITIAL_PROPERTY_FEATURES,
          bedrooms: 0,
          bathrooms: 0,
          balcony: 0,
        },
        areaDetails: { ...INITIAL_AREA_DETAILS },
        priceDetails: { ...INITIAL_PRICE_DETAILS },
        broker: "",
        purchaser: "",
        constructor: "",
        status: "draft",
        isComplete: false,
        facilities: [],
        approvalStatus: [...INITIAL_APPROVAL_STATUS],
        transactionType: { ...INITIAL_TRANSACTION_TYPE },
      };
      newUnits.push(newUnit);
    }

    const updatedBlocks = blocks.map((b) => {
      if (b.id === blockId) {
        const updatedFloors = b.floors.map((f) => {
          if (f.id === floorId) {
            return {
              ...f,
              units: [...f.units, ...newUnits],
              totalUnits: f.totalUnits + newUnits.length,
            };
          }
          return f;
        });

        return {
          ...b,
          floors: updatedFloors,
          totalUnits: b.totalUnits + newUnits.length,
        };
      }
      return b;
    });

    setBlocks(updatedBlocks);
    setUnits((prev) => [...prev, ...newUnits]);
    setTotalUnits((prev) => prev + newUnits.length);

    setManualUnitCounts((prev) => ({ ...prev, [`${blockId}-${floorId}`]: 0 }));
    alert(`Added ${newUnits.length} units to ${floor.floorName} successfully!`);
  };


  const updateBlock = (blockId, field, value) => {
    const updatedBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, [field]: value } : block,
    );
    setBlocks(updatedBlocks);
  };


  const updateFloor = (blockId, floorId, field, value) => {
    const updatedBlocks = blocks.map((block) => {
      if (block.id === blockId) {
        const updatedFloors = block.floors.map((floor) =>
          floor.id === floorId ? { ...floor, [field]: value } : floor,
        );
        return { ...block, floors: updatedFloors };
      }
      return block;
    });
    setBlocks(updatedBlocks);
  };


  const updateUnit = (unitId, field, value) => {
    const updatedUnits = units.map((unit) =>
      unit.id === unitId ? { ...unit, [field]: value } : unit,
    );
    setUnits(updatedUnits);

    const updatedBlocks = blocks.map((block) => {
      const updatedFloors = block.floors.map((floor) => {
        const updatedFloorUnits = floor.units.map((unit) =>
          unit.id === unitId ? { ...unit, [field]: value } : unit,
        );
        return { ...floor, units: updatedFloorUnits };
      });
      return { ...block, floors: updatedFloors };
    });
    setBlocks(updatedBlocks);
  };


  const removeBlock = (blockId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this block and all its floors/units?",
      )
    ) {
      const unitsToRemove = units.filter((unit) => unit.blockId === blockId);
      const updatedUnits = units.filter((unit) => unit.blockId !== blockId);

      if (selectedUnit && selectedUnit.blockId === blockId) {
        setSelectedUnit(null);
      }

      const updatedBlocks = blocks.filter((block) => block.id !== blockId);

      setBlocks(updatedBlocks);
      setUnits(updatedUnits);
      setTotalUnits((prev) => prev - unitsToRemove.length);

      alert("Block removed successfully!");
    }
  };


  const removeFloor = (blockId, floorId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this floor and all its units?",
      )
    ) {
      const block = blocks.find((b) => b.id === blockId);
      const floor = block?.floors.find((f) => f.id === floorId);

      if (!block || !floor) return;

      const unitsToRemove = units.filter((unit) => unit.floorId === floorId);
      const updatedUnits = units.filter((unit) => unit.floorId !== floorId);

      if (selectedUnit && selectedUnit.floorId === floorId) {
        setSelectedUnit(null);
      }

      const updatedBlocks = blocks.map((b) => {
        if (b.id === blockId) {
          return {
            ...b,
            floors: b.floors.filter((f) => f.id !== floorId),
            residentialFloors:
              floor.floorType === "residential"
                ? b.residentialFloors - 1
                : b.residentialFloors,
            parkingFloors:
              floor.floorType === "parking"
                ? b.parkingFloors - 1
                : b.parkingFloors,
            totalUnits: b.totalUnits - floor.units.length,
          };
        }
        return b;
      });

      setBlocks(updatedBlocks);
      setUnits(updatedUnits);
      setTotalUnits((prev) => prev - unitsToRemove.length);

      alert("Floor removed successfully!");
    }
  };


  const removeUnit = (unitId) => {
    if (window.confirm("Are you sure you want to remove this unit?")) {
      const unitToRemove = units.find((u) => u.id === unitId);
      if (!unitToRemove) return;

      const updatedUnits = units.filter((unit) => unit.id !== unitId);
      const updatedBlocks = blocks.map((block) => {
        if (block.id === unitToRemove.blockId) {
          const updatedFloors = block.floors.map((floor) => {
            if (floor.id === unitToRemove.floorId) {
              return {
                ...floor,
                units: floor.units.filter((u) => u.id !== unitId),
                totalUnits: floor.totalUnits - 1,
              };
            }
            return floor;
          });

          return {
            ...block,
            floors: updatedFloors,
            totalUnits: block.totalUnits - 1,
          };
        }
        return block;
      });

      setBlocks(updatedBlocks);
      setUnits(updatedUnits);
      setTotalUnits((prev) => prev - 1);

      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
      }

      alert("Unit removed successfully!");
    }
  };


  const handleUnitNameChange = (unitId, newName) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return { ...u, name: newName };
      }),
    );

    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        floors: block.floors.map((floor) => ({
          ...floor,
          units: floor.units.map((u) => {
            if (u.id !== unitId) return u;
            return { ...u, name: newName };
          }),
        })),
      })),
    );

    if (selectedUnit && selectedUnit.id === unitId) {
      setSelectedUnit((prev) => ({ ...prev, name: newName }));
    }
  };


  const handleUnitTypeChange = (unitId, newType) => {
    const bhkNumber = parseInt(newType.charAt(0)) || 1;

    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return {
          ...u,
          unitType: newType,
          roomType: newType,
          propertyFeatures: {
            ...(u.propertyFeatures || INITIAL_PROPERTY_FEATURES),
            bedrooms: bhkNumber,
            bathrooms: Math.max(1, bhkNumber - 1),
            balcony: Math.max(1, Math.floor(bhkNumber / 2)),
          },
        };
      }),
    );

    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        floors: block.floors.map((floor) => ({
          ...floor,
          units: floor.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              unitType: newType,
              roomType: newType,
              propertyFeatures: {
                ...(u.propertyFeatures || INITIAL_PROPERTY_FEATURES),
                bedrooms: bhkNumber,
                bathrooms: Math.max(1, bhkNumber - 1),
                balcony: Math.max(1, Math.floor(bhkNumber / 2)),
              },
            };
          }),
        })),
      })),
    );

    if (selectedUnit && selectedUnit.id === unitId) {
      setPropertyFeatures((prev) => ({
        ...prev,
        bedrooms: bhkNumber,
        bathrooms: Math.max(1, bhkNumber - 1),
        balcony: Math.max(1, Math.floor(bhkNumber / 2)),
      }));
      setSelectedUnit((prev) => ({
        ...prev,
        unitType: newType,
        roomType: newType,
        propertyFeatures: {
          ...(prev.propertyFeatures || INITIAL_PROPERTY_FEATURES),
          bedrooms: bhkNumber,
          bathrooms: Math.max(1, bhkNumber - 1),
          balcony: Math.max(1, Math.floor(bhkNumber / 2)),
        },
      }));
    }
  };


  const handleUnitClick = (unit) => {

    if (selectedUnit) {
      const updatedUnit = {
        ...selectedUnit,
        priceDetails,
        areaDetails,
        propertyFeatures,
        roomAreas,
        broker,
        constructor,
        approvalStatus,
        loan,
        loanProvider,
        staffEngaged,
        facilities,
        isComplete: !!(
          priceDetails.expectedPrice &&
          areaDetails.carpetArea &&
          constructor
        ),
      };

      setUnits((prev) =>
        prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u)),
      );
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== updatedUnit.blockId) return block;
          return {
            ...block,
            floors: block.floors.map((floor) => {
              if (floor.id !== updatedUnit.floorId) return floor;
              return {
                ...floor,
                units: floor.units.map((u) =>
                  u.id === updatedUnit.id ? updatedUnit : u,
                ),
              };
            }),
          };
        }),
      );
    }


    setSelectedUnit(unit);
    setPropertyFeatures(unit.propertyFeatures || INITIAL_PROPERTY_FEATURES);
    setAreaDetails(unit.areaDetails || INITIAL_AREA_DETAILS);
    setPriceDetails(unit.priceDetails || INITIAL_PRICE_DETAILS);
    setBroker(unit.broker || "");

    setConstructor(unit.constructor || "");
    setStaffEngaged(unit.staffEngaged || "");
    setLoanProvider(unit.loanProvider || "");
    setLoan(unit.loan || "");


    const formattedFacilities = (unit.facilities || []).map((f, i) =>
      typeof f === "string" ? { id: Date.now() + i, name: f } : f,
    );
    setFacilities(formattedFacilities);

    setApprovalStatus(unit.approvalStatus || INITIAL_APPROVAL_STATUS);
    setTransactionType(unit.transactionType || INITIAL_TRANSACTION_TYPE);


    if (unit.roomAreas) {
      setRoomAreas(unit.roomAreas);
    } else {

      setRoomAreas({
        bedrooms: [],
        bathrooms: [],
        balconies: [],
      });
    }
  };


  const renderRoomAreaInputs = () => {
    const beds = propertyFeatures.bedrooms || 0;
    const baths = propertyFeatures.bathrooms || 0;
    const balcs = propertyFeatures.balcony || 0;

    return (
      <div className="space-y-3.5 mt-3">

        {beds > 0 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
              <FaBed className="w-3.5 h-3.5 text-purple-600" />
              Bedroom Areas (sq. ft)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: beds }, (_, index) => (
                <div key={`bed-${index}`} className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Bedroom {index + 1}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomAreas.bedrooms[index] || ""}
                    onChange={(e) =>
                      handleRoomAreaChange("bedrooms", index, e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-300 bg-white"
                    placeholder="Area"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between text-[13px] font-semibold">
              <span className="text-slate-500">Total Bedroom Area</span>
              <span className="text-purple-700 font-bold">
                {calculateTotalBedroomArea().toLocaleString()} sq. ft
              </span>
            </div>
          </div>
        )}


        {baths > 0 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
              <FaBath className="w-3.5 h-3.5 text-blue-600" />
              Bathroom Areas (sq. ft)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: baths }, (_, index) => (
                <div key={`bath-${index}`} className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Bathroom {index + 1}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomAreas.bathrooms[index] || ""}
                    onChange={(e) =>
                      handleRoomAreaChange("bathrooms", index, e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-300 bg-white"
                    placeholder="Area"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between text-[13px] font-semibold">
              <span className="text-slate-500">Total Bathroom Area</span>
              <span className="text-blue-700 font-bold">
                {calculateTotalBathroomArea().toLocaleString()} sq. ft
              </span>
            </div>
          </div>
        )}


        {balcs > 0 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
              <FaDoorOpen className="w-3.5 h-3.5 text-green-600" />
              Balcony Areas (sq. ft)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: balcs }, (_, index) => (
                <div key={`balcony-${index}`} className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Balcony {index + 1}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomAreas.balconies[index] || ""}
                    onChange={(e) =>
                      handleRoomAreaChange("balconies", index, e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-300 bg-white"
                    placeholder="Area"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between text-[13px] font-semibold">
              <span className="text-slate-500">Total Balcony Area</span>
              <span className="text-green-700 font-bold">
                {calculateTotalBalconyArea().toLocaleString()} sq. ft
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };


  const NavigationTabs = () => {
    const tabs = [
      { id: "project-info", label: "Project info", icon: Home },
      { id: "blocks", label: "Blocks", icon: LayoutGrid, count: blocks.length },
      { id: "units", label: "Units", icon: Building2, count: units.length },
    ];

    return (
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 pb-3 pt-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                active
                  ? "border-emerald-600 text-slate-900 rounded-b-lg"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`}
              />
              <span>{label}</span>
              {count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };


  const StatisticsCard = ({ icon, label, value, color }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wide">
            {label}
          </p>
          <div className="mt-1.5 text-[26px] font-semibold leading-none text-slate-900">
            {value}
          </div>
        </div>
        <div
          className={`w-8.5 h-8.5 rounded-[9px] flex items-center justify-center shrink-0 ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const renderProjectInfo = () => (
    <div className="space-y-4">

      {successMessage && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5 text-sm text-emerald-800">
          <FaCheckCircle className="text-emerald-500 w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}


      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatisticsCard
          icon={<FaLayerGroup className="h-4 w-4 text-emerald-600" />}
          label="Total Blocks"
          value={blocks.length}
          color="bg-emerald-50"
        />
        <StatisticsCard
          icon={<FaBuilding className="h-4 w-4 text-emerald-600" />}
          label="Total Units"
          value={totalUnits}
          color="bg-emerald-50"
        />
        <StatisticsCard
          icon={<FaBuilding className="h-4 w-4 text-blue-600" />}
          label="Total Floors"
          value={blocks.reduce((s, b) => s + b.floors.length, 0)}
          color="bg-blue-50"
        />
        <StatisticsCard
          icon={<FaCar className="h-4 w-4 text-amber-600" />}
          label="Parking Floors"
          value={blocks.reduce(
            (s, b) =>
              s + b.floors.filter((f) => f.floorType === "parking").length,
            0,
          )}
          color="bg-amber-50"
        />
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-[7px] bg-emerald-50 flex items-center justify-center">
              <FaHome className="text-emerald-600 h-3.5 w-3.5" />
            </div>
            <span className="text-[15px] font-semibold text-slate-800">
              Project information
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                Project name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                Project type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select project type</option>
                  {Object.values(PROJECT_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>


        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-[7px] bg-blue-50 flex items-center justify-center">
              <FaMapMarkerAlt className="text-blue-600 h-3.5 w-3.5" />
            </div>
            <span className="text-[15px] font-semibold text-slate-800">
              Property location
            </span>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                ["City", city, setCity, "Enter city"],
                ["Locality", locality, setLocality, "Enter locality"],
              ].map(([lbl, val, setter, ph]) => (
                <div key={lbl} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    {lbl}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={ph}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-slate-400 uppercase tracking-wide">
                Total land area (sq. ft)
              </label>
              <input
                type="number"
                min="0"
                value={landArea}
                onChange={(e) => setLandArea(parseFloat(e.target.value))}
                placeholder="Enter total land area"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[7px] bg-emerald-50 flex items-center justify-center">
              <FaRulerCombined className="text-emerald-600 h-3.5 w-3.5" />
            </div>
            <span className="text-[13px] font-semibold text-slate-800">
              Revenue plots
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-[11px] text-slate-400">Total plots</span>
              <input
                type="number"
                min="0"
                max="50"
                value={revenuePlotsCount}
                onChange={(e) =>
                  handleRevenuePlotsCountChange(parseInt(e.target.value) || 0)
                }
                className="w-8 bg-transparent text-center text-sm font-semibold text-emerald-600 outline-none"
              />
            </div>
            <button
              onClick={() => setShowPlotDetails(!showPlotDetails)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors bg-white"
            >
              {showPlotDetails ? (
                <FaChevronUp className="h-3 w-3" />
              ) : (
                <FaChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {showPlotDetails && (
          <div className="p-4 bg-slate-50/30">
            {revenuePlots.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <FaRulerCombined className="h-6 w-6 opacity-40 text-emerald-600" />
                <p className="text-sm">
                  Enter a number above to add revenue plots
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {revenuePlots.map((plot, index) => (
                  <div
                    key={plot.id || index}
                    className="border border-slate-200 rounded-xl p-3 bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center justify-center">
                        {index + 1}
                      </div>
                      <button
                        onClick={() => removePlot(index)}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <FaTrashAlt size={11} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ["Plot no", "plot_no", "101"],
                          ["Area (sqft)", "plot_area_sqft", "1200"],
                        ].map(([lbl, key, ph]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                              {lbl}
                            </label>
                            <input
                              type="text"
                              value={plot[key]}
                              onChange={(e) =>
                                handlePlotChange(index, key, e.target.value)
                              }
                              placeholder={ph}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          Khata no
                        </label>
                        <input
                          type="text"
                          value={plot.khata_no}
                          onChange={(e) =>
                            handlePlotChange(index, "khata_no", e.target.value)
                          }
                          placeholder="K-45"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                        />
                      </div>
                      <label
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl cursor-pointer text-[11px] transition-all border border-dashed ${
                          plot.fileName
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {plot.fileName ? (
                          <FaCheck size={9} />
                        ) : (
                          <FaPaperclip size={10} />
                        )}
                        <span className="truncate max-w-30">
                          {plot.fileName || "Attach document"}
                        </span>
                        {plot.fileName && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handlePlotFileChange(index, null);
                            }}
                            className="ml-auto"
                          >
                            <FaTimes size={9} className="text-slate-400" />
                          </button>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) =>
                            handlePlotFileChange(index, e.target.files[0])
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addPlot}
                  className="border border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all text-sm bg-white"
                >
                  <FaPlusCircle size={20} />
                  Add plot
                </button>
              </div>
            )}
          </div>
        )}
      </div>


      <div className="flex justify-end pt-1">
        <button
          onClick={() => setActiveTab("blocks")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
        >
          Next: add blocks
          <FaChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  const renderEditOverview = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">
        Project Editing Overview
      </h2>

      {blocks.map((block) => {
        const blockSaved = block.status === "saved";

        return (
          <div
            key={block.id}
            className={`p-3 rounded-xl border ${
              blockSaved
                ? "bg-white border-(--border-soft)"
                : "bg-slate-50 border-slate-300 italic opacity-70"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{block.name}</h3>
                <p className="text-xs text-slate-500">
                  {block.floors.length} floors • {block.totalUnits} units
                </p>
              </div>

              <button
                onClick={() => {
                  setEditMode("blocks");
                  setActiveTab("blocks");
                  setExpandedBlocks({ [block.id]: true });
                }}
                className="text-emerald-600 hover:text-emerald-800 text-sm"
              >
                ✏️ Edit Block
              </button>
            </div>


            <div className="mt-2 grid grid-cols-2 md:grid-cols-6 gap-1">
              {block.floors
                .flatMap((f) => f.units)
                .map((unit) => (
                  <div
                    key={unit.id}
                    onClick={() => {
                      setActiveTab("units");
                      handleUnitClick(unit);
                    }}
                    className={`text-xs p-1 rounded cursor-pointer text-center ${
                      unit.isComplete
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-500 italic"
                    }`}
                  >
                    {unit.name}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );



  const renderBlocks = () => (
    <div className="space-y-4">

      <div className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-800">
            <FaSortAmountUp className="w-3.5 h-3.5 text-emerald-600" />
            Add new blocks
          </div>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Batch-create blocks for your project
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="50"
            value={manualBlockCount}
            onChange={(e) => setManualBlockCount(parseInt(e.target.value) || 0)}
            placeholder="Count"
            className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] text-center
                     outline-none focus:border-emerald-500 bg-white"
          />
          <button
            onClick={addMultipleBlocks}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700
                     text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <FaPlus className="w-3 h-3" /> Add blocks
          </button>
        </div>
      </div>


      <div className="space-y-2">
        {blocks.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 border border-dashed border-slate-200 rounded-xl text-slate-400">
            <FaLayerGroup className="w-8 h-8 opacity-25" />
            <p className="text-[13px]">No blocks yet — add some above</p>
          </div>
        ) : (
          blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              expandedBlocks={expandedBlocks}
              toggleBlockExpansion={toggleBlockExpansion}
              expandedFloors={expandedFloors}
              toggleFloorExpansion={toggleFloorExpansion}
              manualResidentialFloors={manualResidentialFloors}
              setManualResidentialFloors={setManualResidentialFloors}
              manualParkingFloors={manualParkingFloors}
              setManualParkingFloors={setManualParkingFloors}
              manualUnitCounts={manualUnitCounts}
              setManualUnitCounts={setManualUnitCounts}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
              addFloorsToBlock={addFloorsToBlock}
              addMultipleUnitsToFloor={addMultipleUnitsToFloor}
              updateFloor={updateFloor}
              removeFloor={removeFloor}
              removeUnit={removeUnit}
              handleUnitClick={handleUnitClick}
              selectedUnit={selectedUnit}
              editingName={editingName}
              editingValue={editingValue}
              setEditingValue={setEditingValue}
              startEditing={startEditing}
              saveEditing={saveEditing}
              cancelEditing={cancelEditing}
              onUnitNameChange={handleUnitNameChange}
              onUnitTypeChange={handleUnitTypeChange}
            />
          ))
        )}
      </div>


      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setActiveTab("project-info")}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg
                   text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <FaChevronLeft className="w-3 h-3" /> Back
        </button>
        <button
          onClick={() => setActiveTab("units")}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700
                   text-white text-[13px] font-medium rounded-lg transition-colors"
        >
          Next: view units <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );


  const renderUnits = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-[calc(100vh-10rem)] min-h-125">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            <FaBuilding className="w-3.5 h-3.5 text-emerald-600" />
            All Units
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            {units.length} units
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1 grow">
          {units.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center justify-center h-full text-slate-400">
              <div className="bg-slate-50 p-4 rounded-full mb-2">
                <FaBuilding className="h-8 w-8 text-slate-300" />
              </div>
              <p className="font-medium text-sm">No units created yet</p>
              <p className="text-xs mt-0.5">
                Add blocks and units to see them here.
              </p>
            </div>
          ) : (
            units.map((unit, idx) => {
              const block = blocks.find((b) => b.id === unit.blockId);
              const floor = block?.floors.find((f) => f.id === unit.floorId);

              return (
                <div
                  key={unit.id}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all duration-200 group relative ${
                    selectedUnit?.id === unit.id
                      ? "bg-emerald-600 border-emerald-600 shadow-sm text-white"
                      : "bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40"
                  }`}
                  onClick={() => handleUnitClick(unit)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold ${
                          selectedUnit?.id === unit.id
                            ? "bg-white/20 text-white"
                            : unit.isComplete
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          {editingName === `unit-${unit.id}` ? (
                            <span
                              className="inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                autoFocus
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    saveEditing(`unit-${unit.id}`, unit.id);
                                  if (e.key === "Escape") cancelEditing();
                                }}
                                className={`border-b bg-transparent outline-none text-[13px] font-semibold w-24 px-0.5 ${
                                  selectedUnit?.id === unit.id
                                    ? "border-white text-white"
                                    : "border-emerald-500 text-slate-800"
                                }`}
                              />
                              <button
                                onClick={() =>
                                  saveEditing(`unit-${unit.id}`, unit.id)
                                }
                                className={
                                  selectedUnit?.id === unit.id
                                    ? "text-white"
                                    : "text-emerald-600"
                                }
                              >
                                <FaCheck className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className={
                                  selectedUnit?.id === unit.id
                                    ? "text-emerald-200"
                                    : "text-red-400"
                                }
                              >
                                <FaTimes className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ) : (
                            <span className="group/edit inline-flex items-center gap-1">
                              <span
                                className={`text-[13px] font-semibold ${selectedUnit?.id === unit.id ? "text-white" : "text-slate-800"}`}
                              >
                                {unit.name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing("unit", unit.id, unit.name);
                                }}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                  selectedUnit?.id === unit.id
                                    ? "text-emerald-200 hover:text-white"
                                    : "text-slate-300 hover:text-emerald-500"
                                }`}
                              >
                                <FaEdit className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] ${selectedUnit?.id === unit.id ? "text-emerald-100" : "text-slate-400"}`}
                        >
                          {block?.name} • {floor?.floorName}
                        </p>
                      </div>
                    </div>
                    {unit.isComplete && (
                      <FaCheckCircle
                        className={`w-3.5 h-3.5 ${selectedUnit?.id === unit.id ? "text-white" : "text-emerald-500"}`}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>


      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-[calc(100vh-10rem)] min-h-125 overflow-y-auto">
        {selectedUnit ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
                  <FaBuilding className="w-4 h-4 text-emerald-600" />
                  {selectedUnit.name}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Room type: {selectedUnit.roomType}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {selectedUnit.roomType}
                </span>
                {selectedUnit.isComplete && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                    <FaCheckCircle className="w-3 h-3 text-emerald-500" />
                    Complete
                  </span>
                )}
              </div>
            </div>


            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SectionTitle icon={FaLayerGroup}>
                Room Configuration
              </SectionTitle>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide flex items-center gap-1 mb-1">
                    <FaBed className="text-purple-600 w-3 h-3" /> Bedrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={propertyFeatures.bedrooms || ""}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setPropertyFeatures({
                        ...propertyFeatures,
                        bedrooms: val,
                      });

                      const newAreas = Array(Number(val) || 0)
                        .fill("")
                        .map((_, i) => roomAreas.bedrooms[i] || "");
                      setRoomAreas((prev) => ({ ...prev, bedrooms: newAreas }));
                    }}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-center text-[13px] text-slate-800 bg-white"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide flex items-center gap-1 mb-1">
                    <FaBath className="text-blue-600 w-3 h-3" /> Bathrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={propertyFeatures.bathrooms || ""}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setPropertyFeatures({
                        ...propertyFeatures,
                        bathrooms: val,
                      });

                      const newAreas = Array(Number(val) || 0)
                        .fill("")
                        .map((_, i) => roomAreas.bathrooms[i] || "");
                      setRoomAreas((prev) => ({
                        ...prev,
                        bathrooms: newAreas,
                      }));
                    }}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-center text-[13px] text-slate-800 bg-white"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide flex items-center gap-1 mb-1">
                    <FaDoorOpen className="text-green-600 w-3 h-3" /> Balconies
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={propertyFeatures.balcony || ""}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setPropertyFeatures({
                        ...propertyFeatures,
                        balcony: val,
                      });

                      const newAreas = Array(Number(val) || 0)
                        .fill("")
                        .map((_, i) => roomAreas.balconies[i] || "");
                      setRoomAreas((prev) => ({
                        ...prev,
                        balconies: newAreas,
                      }));
                    }}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-center text-[13px] text-slate-800 bg-white"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide mb-1 block">
                    Furnished Status
                  </label>
                  <select
                    value={propertyFeatures.furnishedStatus || "Unfurnished"}
                    onChange={(e) =>
                      setPropertyFeatures({
                        ...propertyFeatures,
                        furnishedStatus: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-[13px] text-slate-800 bg-white"
                  >
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                  </select>
                </div>
              </div>


              {renderRoomAreaInputs()}
            </div>


            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SectionTitle icon={FaRuler}>Area Details</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Carpet Area (sq. ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaDetails.carpetArea ?? ""}
                    onChange={(e) =>
                      setAreaDetails({
                        ...areaDetails,
                        carpetArea: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Built-up Area (sq. ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaDetails.builtUpArea ?? ""}
                    onChange={(e) =>
                      setAreaDetails({
                        ...areaDetails,
                        builtUpArea: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Super Built-up (sq. ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaDetails.superBuiltUpArea ?? ""}
                    onChange={(e) =>
                      setAreaDetails({
                        ...areaDetails,
                        superBuiltUpArea: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Construction Area (sq. ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaDetails.constructionArea ?? ""}
                    onChange={(e) =>
                      setAreaDetails({
                        ...areaDetails,
                        constructionArea: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Land Area (sq. ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaDetails.landArea ?? ""}
                    onChange={(e) =>
                      setAreaDetails({
                        ...areaDetails,
                        landArea: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Available From
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={areaDetails.availableFromMonth ?? ""}
                      onChange={(e) =>
                        setAreaDetails({
                          ...areaDetails,
                          availableFromMonth: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                    >
                      <option value="">Month</option>
                      <option value="01">Jan</option>
                      <option value="02">Feb</option>
                      <option value="03">Mar</option>
                      <option value="04">Apr</option>
                      <option value="05">May</option>
                      <option value="06">Jun</option>
                      <option value="07">Jul</option>
                      <option value="08">Aug</option>
                      <option value="09">Sep</option>
                      <option value="10">Oct</option>
                      <option value="11">Nov</option>
                      <option value="12">Dec</option>
                    </select>
                    <input
                      type="number"
                      min="2020"
                      max="2050"
                      placeholder="Year"
                      value={areaDetails.availableFromYear ?? ""}
                      onChange={(e) =>
                        setAreaDetails({
                          ...areaDetails,
                          availableFromYear: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SectionTitle icon={FaCogs}>Facilities</SectionTitle>


              {facilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {(showAllFacilities
                    ? facilities
                    : facilities.slice(0, 6)
                  ).map((facility) => (
                    <div
                      key={facility.id}
                      className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[12px]"
                    >
                      <span className="text-slate-700 font-medium">
                        {facility.name}
                      </span>
                      <button
                        onClick={() =>
                          setFacilities((prev) =>
                            prev.filter((f) => f.id !== facility.id),
                          )
                        }
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrashAlt className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}


              {facilities.length > 6 && (
                <button
                  onClick={() => setShowAllFacilities((v) => !v)}
                  className="text-[11px] text-emerald-600 hover:underline mb-2 font-medium"
                >
                  {showAllFacilities
                    ? "Show less"
                    : `Show ${facilities.length - 6} more`}
                </button>
              )}


              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter facility name"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white placeholder:text-slate-300"
                />
                <button
                  onClick={() => {
                    const value = newFacility.trim();
                    if (!value) return;


                    if (
                      facilities.some((f) => {
                        const fName = typeof f === "string" ? f : f.name || "";
                        return fName.toLowerCase() === value.toLowerCase();
                      })
                    ) {
                      alert("Facility already added");
                      return;
                    }

                    setFacilities((prev) => [
                      ...prev,
                      { id: Date.now(), name: value },
                    ]);
                    setNewFacility("");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>


            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SectionTitle icon={FaInfoCircle}>
                Additional Information
              </SectionTitle>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                <div className="col-span-full">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide mb-2 block">
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


                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Broker
                  </label>
                  <select
                    value={broker}
                    onChange={(e) => setBroker(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  >
                    <option value="">
                      {loadingBrokers ? "Loading brokers..." : "Select Broker"}
                    </option>

                    {brokersList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Contractor
                  </label>
                  <select
                    value={constructor}
                    onChange={(e) => setConstructor(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  >
                    <option value="">
                      {loadingContractors
                        ? "Loading contractors..."
                        : "Select Contractor"}
                    </option>

                    {contractorsList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Staff Engaged
                  </label>
                  <input
                    type="text"
                    placeholder="Staff name or ID"
                    value={staffEngaged}
                    onChange={(e) => setStaffEngaged(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white placeholder:text-slate-300"
                  />
                </div>


                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Loan Available
                  </label>
                  <select
                    value={loan}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLoan(val);
                      if (val === "No") setLoanProvider("");
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {loan === "Yes" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                      Loan Provider Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC, SBI"
                      value={loanProvider}
                      onChange={(e) => setLoanProvider(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white placeholder:text-slate-300"
                    />
                  </div>
                )}
              </div>


              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-2.5">
                  Approval Status
                </label>

                <div className="space-y-2">
                  {approvalStatus.map((approval, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="e.g., RERA, Local Authority"
                          value={approval.authority}
                          onChange={(e) => {
                            const updated = [...approvalStatus];
                            updated[idx].authority = e.target.value;
                            setApprovalStatus(updated);
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white placeholder:text-slate-300"
                        />

                        <select
                          value={approval.status}
                          onChange={(e) => {
                            const updated = [...approvalStatus];
                            updated[idx].status = e.target.value;
                            setApprovalStatus(updated);
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                        >
                          <option value="">Select status</option>
                          <option value="Approved">Approved</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <button
                        onClick={() =>
                          setApprovalStatus(
                            approvalStatus.filter((_, i) => i !== idx),
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Remove approval"
                      >
                        <FaTrashAlt className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setApprovalStatus([
                        ...approvalStatus,
                        { authority: "", status: "" },
                      ])
                    }
                    className="flex items-center gap-1 text-[12px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    <FaPlus className="w-2.5 h-2.5" /> Add Approval Status
                  </button>
                </div>
              </div>
            </div>


            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <SectionTitle icon={FaCog}>Price Details</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Expected Price (₹)
                  </label>
                  <input
                    type="text"
                    value={priceDetails.expectedPrice}
                    onChange={(e) =>
                      setPriceDetails({
                        ...priceDetails,
                        expectedPrice: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400 tracking-wide">
                    Token Amount (₹)
                  </label>
                  <input
                    type="text"
                    value={priceDetails.tokenAmount}
                    onChange={(e) =>
                      setPriceDetails({
                        ...priceDetails,
                        tokenAmount: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                  />
                </div>
              </div>
            </div>


            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                  isSaving
                    ? "bg-emerald-400 text-white cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <FaSave className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save Project"}
              </button>
              <button
                onClick={() => {
                  updateUnit(
                    selectedUnit.id,
                    "propertyFeatures",
                    propertyFeatures,
                  );
                  updateUnit(selectedUnit.id, "areaDetails", areaDetails);
                  updateUnit(selectedUnit.id, "priceDetails", priceDetails);
                  updateUnit(selectedUnit.id, "broker", broker);
                  updateUnit(selectedUnit.id, "constructor", constructor);
                  updateUnit(selectedUnit.id, "staffEngaged", staffEngaged);
                  updateUnit(selectedUnit.id, "loanProvider", loanProvider);
                  updateUnit(selectedUnit.id, "loan", loan);
                  updateUnit(selectedUnit.id, "facilities", facilities);
                  updateUnit(selectedUnit.id, "approvalStatus", approvalStatus);

                  const isComplete = !!(
                    priceDetails.expectedPrice &&
                    areaDetails.carpetArea &&
                    constructor
                  );

                  updateUnit(selectedUnit.id, "isComplete", isComplete);
                  updateUnit(selectedUnit.id, "lastSaved", true);

                  alert("Unit updated successfully!");
                }}
                disabled={isSaving}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                  isSaving
                    ? "bg-emerald-400 text-white cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <FaCheckCircle className="w-3.5 h-3.5" />
                {isSaving ? "Updating..." : "Update Unit"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-slate-400 my-auto">
            <FaBuilding className="mx-auto w-8 h-8 opacity-25 mb-2" />
            <h3 className="text-[13px] font-medium text-slate-800 mb-0.5">
              Select a unit
            </h3>
            <p className="text-[12px] text-slate-400 mb-4">
              Click a unit from the list to view and edit details
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => handleUnitClick(unit)}
                  className={`px-2.5 py-1.5 border text-[12px] font-medium rounded-lg transition-all ${
                    unit.isComplete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {unit.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>


      <div className="lg:col-span-3 flex items-center justify-between pt-3 mt-1 border-t border-slate-200/60">
        <button
          onClick={() => setActiveTab("blocks")}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <FaChevronLeft className="w-3 h-3" /> Back to Blocks
        </button>
        <button
          onClick={handleSaveProject}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-medium rounded-lg transition-colors"
        >
          <FaSave className="w-3.5 h-3.5" /> Save Project
        </button>
      </div>
    </div>
  );




  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 p-2 md:p-4 font-sans relative">

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-0 right-2 z-50
                     w-9 h-9 rounded-full
                     flex items-center justify-center
                     text-gray-500 hover:text-red-600
                     hover:bg-red-50 transition"
          title="Back to Project List"
        >
          <X size={18} strokeWidth={2} />
        </button>
      )}
      <div className="max-w-7xl mx-auto space-y-4 mt-4 ">

        <NavigationTabs />

        {activeTab === "project-info" && renderProjectInfo()}

        {activeTab === "blocks" && (
          <>
            {editingProjectId
              ? editMode === "overview"
                ? renderEditOverview()
                : renderBlocks()
              : renderBlocks()}
          </>
        )}

        {activeTab === "units" && renderUnits()}



      </div>
    </div>
  );
};



const Pill = ({ children, color = "green" }) => {
  const colors = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colors[color]}`}
    >
      {children}
    </span>
  );
};

const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2.5">
    <Icon className="w-3.5 h-3.5" />
    {children}
  </div>
);

const FieldInput = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-medium text-slate-400 tracking-wide">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-800
               outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all
               placeholder:text-slate-300 bg-white"
    />
  </div>
);

const BtnDanger = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-slate-500 border border-slate-200
             rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
  >
    {children}
  </button>
);

const UnitCell = ({
  unit,
  onRemove,
  onClick,
  onNameChange,
  onTypeChange,
  bhkOptions = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "6BHK", "7BHK"],
}) => (
  <div
    onClick={onClick}
    className={`group relative border rounded-lg p-2 cursor-pointer transition-all flex flex-col gap-1
    ${
      unit.isComplete
        ? "border-emerald-200 bg-emerald-50"
        : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40"
    }`}
  >
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove(unit.id);
      }}
      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full
               text-[10px] items-center justify-center hidden group-hover:flex"
    >
      ×
    </button>
    <div className="flex items-center justify-between">
      <div
        className={`w-5 h-5 rounded text-[10px] font-medium flex items-center justify-center shrink-0
      ${unit.isComplete ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
      >
        {unit.unitNumber}
      </div>
      <select
        value={unit.roomType || unit.unitType || "1BHK"}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          onTypeChange(unit.id, e.target.value);
        }}
        className="text-[10px] text-slate-500 bg-transparent border-none outline-none font-medium cursor-pointer focus:ring-0 p-0 text-right w-16"
      >
        {bhkOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
    <input
      type="text"
      value={unit.name}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        onNameChange(unit.id, e.target.value);
      }}
      className="text-[11px] font-medium text-slate-800 bg-transparent border-none outline-none w-full focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1 py-0.5"
    />
    {unit.isComplete && (
      <FaCheckCircle className="absolute top-1.5 right-1.5 text-emerald-500 w-2.5 h-2.5 pointer-events-none" />
    )}
  </div>
);

const EditableLabel = ({
  value,
  editKey,
  onStart,
  onSave,
  onCancel,
  editingName,
  editingValue,
  setEditingValue,
  className = "",
}) => {
  const isEditing = editingName === editKey;
  return isEditing ? (
    <span
      className="inline-flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        autoFocus
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(editKey);
          if (e.key === "Escape") onCancel();
        }}
        className="border-b border-emerald-500 bg-transparent outline-none text-[13px] font-medium w-24 px-0.5"
      />
      <button onClick={() => onSave(editKey)} className="text-emerald-600">
        <FaCheck className="w-2.5 h-2.5" />
      </button>
      <button onClick={onCancel} className="text-red-400">
        <FaTimes className="w-2.5 h-2.5" />
      </button>
    </span>
  ) : (
    <span className={`group/edit inline-flex items-center gap-1 ${className}`}>
      <span>{value}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart(editKey, value);
        }}
        className="opacity-0 group-hover/edit:opacity-100 text-slate-300 hover:text-emerald-500 transition-opacity"
      >
        <FaEdit className="w-2.5 h-2.5" />
      </button>
    </span>
  );
};

const FloorCard = ({
  block,
  floor,
  expandedFloors,
  toggleFloorExpansion,
  manualUnitCounts,
  setManualUnitCounts,
  addMultipleUnitsToFloor,
  updateFloor,
  removeFloor,
  removeUnit,
  handleUnitClick,
  selectedUnit,
  editingName,
  editingValue,
  setEditingValue,
  startEditing,
  saveEditing,
  cancelEditing,
  onUnitNameChange,
  onUnitTypeChange,
}) => {
  const isExpanded = expandedFloors[`${block.id}-${floor.id}`];
  const isPark = floor.floorType === "parking";
  const unitKey = `${block.id}-${floor.id}`;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">

      <div
        onClick={() => toggleFloorExpansion(block.id, floor.id)}
        className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors
        ${isPark ? "bg-amber-50 border-b border-amber-100" : "bg-blue-50 border-b border-blue-100"}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center
          ${isPark ? "bg-amber-100" : "bg-blue-100"}`}
          >
            {isPark ? (
              <FaParking className="w-3 h-3 text-amber-600" />
            ) : (
              <FaChartLine className="w-3 h-3 text-blue-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-800">
              <EditableLabel
                value={floor.floorName}
                editKey={`floor-${block.id}_${floor.id}`}
                editingName={editingName}
                editingValue={editingValue}
                setEditingValue={setEditingValue}
                onStart={(key, val) =>
                  startEditing("floor", `${block.id}_${floor.id}`, val)
                }
                onSave={() =>
                  saveEditing(
                    `floor-${block.id}_${floor.id}`,
                    `${block.id}_${floor.id}`,
                  )
                }
                onCancel={cancelEditing}
              />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Pill color={isPark ? "amber" : "blue"}>
                {isPark ? "Parking" : "Residential"}
              </Pill>
              {!isPark && <Pill color="green">{floor.units.length} units</Pill>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPark && (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="number"
                min="1"
                value={manualUnitCounts[unitKey] || ""}
                onChange={(e) =>
                  setManualUnitCounts((p) => ({
                    ...p,
                    [unitKey]: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="Qty"
                className="w-14 px-2 py-1 border border-slate-200 rounded-lg text-[12px] text-center
                         outline-none focus:border-emerald-500 bg-white"
              />
              <button
                onClick={() => addMultipleUnitsToFloor(block.id, floor.id)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700
                         text-white text-[11px] font-medium rounded-lg transition-colors"
              >
                <FaPlus className="w-2 h-2" /> Add units
              </button>
            </div>
          )}
          <FaChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>


      {isExpanded && (
        <div className="p-3 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400 font-medium">
                Floor name
              </label>
              <input
                type="text"
                value={floor.floorName}
                onChange={(e) =>
                  updateFloor(block.id, floor.id, "floorName", e.target.value)
                }
                className="px-2.5 py-1 border border-slate-200 rounded-lg text-[12px] w-44
                         outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            <BtnDanger onClick={() => removeFloor(block.id, floor.id)}>
              <FaTrashAlt className="w-3 h-3" /> Remove floor
            </BtnDanger>
          </div>

          {!isPark && (
            <>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                Units on this floor
              </div>
              {floor.units.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-[12px]">
                  <FaBuilding className="mx-auto w-5 h-5 mb-1.5 opacity-30" />
                  No units yet — add some above
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-1.5">
                  {floor.units.map((unit) => (
                    <UnitCell
                      key={unit.id}
                      unit={unit}
                      onRemove={removeUnit}
                      onClick={() => handleUnitClick(unit)}
                      onNameChange={onUnitNameChange}
                      onTypeChange={onUnitTypeChange}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const BlockCard = ({
  block,
  expandedBlocks,
  toggleBlockExpansion,
  expandedFloors,
  toggleFloorExpansion,
  manualResidentialFloors,
  setManualResidentialFloors,
  manualParkingFloors,
  setManualParkingFloors,
  manualUnitCounts,
  setManualUnitCounts,
  updateBlock,
  removeBlock,
  addFloorsToBlock,
  addMultipleUnitsToFloor,
  updateFloor,
  removeFloor,
  removeUnit,
  handleUnitClick,
  selectedUnit,
  editingName,
  editingValue,
  setEditingValue,
  startEditing,
  saveEditing,
  cancelEditing,
  onUnitNameChange,
  onUnitTypeChange,
}) => {
  const isExpanded = expandedBlocks[block.id];
  const resCnt = block.floors.filter(
    (f) => f.floorType === "residential",
  ).length;
  const pkCnt = block.floors.filter((f) => f.floorType === "parking").length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">

      <div
        onClick={() => toggleBlockExpansion(block.id)}
        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors
        ${isExpanded ? "bg-emerald-50 border-b border-emerald-100" : "hover:bg-slate-50"}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7.5 h-7.5 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <FaLayerGroup className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-900">
              <EditableLabel
                value={block.name}
                editKey={`block-${block.id}`}
                editingName={editingName}
                editingValue={editingValue}
                setEditingValue={setEditingValue}
                onStart={(_, val) => startEditing("block", block.id, val)}
                onSave={() => saveEditing(`block-${block.id}`, block.id)}
                onCancel={cancelEditing}
              />
              <span className="text-slate-400 font-normal">
                (
                <EditableLabel
                  value={block.prefix}
                  editKey={`blockPrefix-${block.id}`}
                  editingName={editingName}
                  editingValue={editingValue}
                  setEditingValue={setEditingValue}
                  onStart={(_, val) =>
                    startEditing("blockPrefix", block.id, val)
                  }
                  onSave={() =>
                    saveEditing(`blockPrefix-${block.id}`, block.id)
                  }
                  onCancel={cancelEditing}
                />
                )
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Pill color="green">{resCnt} residential</Pill>
              {pkCnt > 0 && <Pill color="amber">{pkCnt} parking</Pill>}
              <Pill color="blue">
                {block.totalUnits} / {block.capacity || 0} units
              </Pill>
            </div>
          </div>
        </div>
        <FaChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </div>


      {isExpanded && (
        <div className="p-4 space-y-4">

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <SectionTitle icon={FaCogs}>Block configuration</SectionTitle>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <FieldInput
                label="Block name"
                type="text"
                value={block.name}
                onChange={(e) => updateBlock(block.id, "name", e.target.value)}
              />
              <FieldInput
                label="Block prefix"
                type="text"
                value={block.prefix}
                onChange={(e) =>
                  updateBlock(block.id, "prefix", e.target.value)
                }
              />
              <FieldInput
                label="Capacity (units)"
                type="number"
                min="0"
                value={block.capacity || 0}
                onChange={(e) =>
                  updateBlock(
                    block.id,
                    "capacity",
                    parseInt(e.target.value) || 0,
                  )
                }
              />
            </div>

            <SectionTitle icon={FaPlus}>Add floors</SectionTitle>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <FieldInput
                label="Residential floors"
                type="number"
                min="0"
                max="50"
                placeholder="0"
                value={manualResidentialFloors[block.id] || ""}
                onChange={(e) =>
                  setManualResidentialFloors((p) => ({
                    ...p,
                    [block.id]: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <FieldInput
                label="Parking floors"
                type="number"
                min="0"
                max="20"
                placeholder="0"
                value={manualParkingFloors[block.id] || ""}
                onChange={(e) =>
                  setManualParkingFloors((p) => ({
                    ...p,
                    [block.id]: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <button
                onClick={() => addFloorsToBlock(block.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700
                         text-white text-[13px] font-medium rounded-lg transition-colors h-8.5"
              >
                <FaPlus className="w-3 h-3" /> Add floors
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
              <span className="text-[12px] text-slate-400">
                Total units:{" "}
                <strong className="text-slate-700">{block.totalUnits}</strong>
              </span>
              <BtnDanger onClick={() => removeBlock(block.id)}>
                <FaTrashAlt className="w-3 h-3" /> Remove block
              </BtnDanger>
            </div>
          </div>


          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
              <FaChartLine className="w-3.5 h-3.5 text-blue-500" />
              Floors ({block.floors.length})
            </div>
            {block.floors.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-1.5 border border-dashed border-slate-200 rounded-xl text-slate-400">
                <FaChartLine className="w-5 h-5 opacity-30" />
                <span className="text-[12px]">No floors added yet</span>
              </div>
            ) : (
              block.floors.map((floor) => (
                <FloorCard
                  key={floor.id}
                  block={block}
                  floor={floor}
                  expandedFloors={expandedFloors}
                  toggleFloorExpansion={toggleFloorExpansion}
                  manualUnitCounts={manualUnitCounts}
                  setManualUnitCounts={setManualUnitCounts}
                  addMultipleUnitsToFloor={addMultipleUnitsToFloor}
                  updateFloor={updateFloor}
                  removeFloor={removeFloor}
                  removeUnit={removeUnit}
                  handleUnitClick={handleUnitClick}
                  selectedUnit={selectedUnit}
                  editingName={editingName}
                  editingValue={editingValue}
                  setEditingValue={setEditingValue}
                  startEditing={startEditing}
                  saveEditing={saveEditing}
                  cancelEditing={cancelEditing}
                  onUnitNameChange={onUnitNameChange}
                  onUnitTypeChange={onUnitTypeChange}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentProject;
