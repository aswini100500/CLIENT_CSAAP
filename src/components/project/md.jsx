import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus, FaTrashAlt, FaSave, FaEdit, FaChevronUp, FaChevronDown,
  FaBuilding, FaHome, FaCar, FaCheck, FaTimes, FaBed, FaBath,
  FaDoorOpen, FaRuler, FaLayerGroup, FaFolder, FaMapMarkerAlt,
  FaChevronRight, FaChevronLeft, FaHashtag, FaArrowRight,
  FaParking, FaCheckCircle, FaCogs, FaSortAmountUp,
  FaChartLine, FaInfoCircle, FaDatabase, FaCog
} from "react-icons/fa";
import {
  INITIAL_PRICE_DETAILS,
  INITIAL_PROPERTY_FEATURES,
  INITIAL_AREA_DETAILS,
  INITIAL_TRANSACTION_TYPE,
  INITIAL_APPROVAL_STATUS,
} from "../project/shared/initialStates";
import projectService from "./projectService";

// BHK Options
const BHK_OPTIONS = [
  "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "6BHK", "7BHK"
];

// Function to convert floor number to floor name
const getFloorName = (floorNumber, floorType = "residential") => {
  const residentialNames = [
    "Ground Floor", "First Floor", "Second Floor", "Third Floor", "Fourth Floor",
    "Fifth Floor", "Sixth Floor", "Seventh Floor", "Eighth Floor", "Ninth Floor",
    "Tenth Floor", "Eleventh Floor", "Twelfth Floor", "Thirteenth Floor",
    "Fourteenth Floor", "Fifteenth Floor"
  ];

  const parkingNames = [
    "Ground Parking", "First Parking", "Second Parking",
    "Third Parking", "Fourth Parking", "Fifth Parking"
  ];

  if (floorType === "parking") {
    return floorNumber <= parkingNames.length ? parkingNames[floorNumber - 1] : `Parking ${floorNumber}`;
  }

  return floorNumber <= residentialNames.length ? residentialNames[floorNumber - 1] : `Floor ${floorNumber}`;
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
}) => {
  // State management
  const [blocks, setBlocks] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [priceDetails, setPriceDetails] = useState(INITIAL_PRICE_DETAILS);
  const [propertyFeatures, setPropertyFeatures] = useState(INITIAL_PROPERTY_FEATURES);
  const [areaDetails, setAreaDetails] = useState(INITIAL_AREA_DETAILS);
  const [broker, setBroker] = useState("");
  const [purchaser, setPurchaser] = useState("");
  const [constructor, setConstructor] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(INITIAL_APPROVAL_STATUS);
  const [transactionType, setTransactionType] = useState(INITIAL_TRANSACTION_TYPE);
  const [revenuePlots, setRevenuePlots] = useState(0);
  const [plotsData, setPlotsData] = useState([]);
  const [landArea, setLandArea] = useState(0);
  const [projectId, setProjectId] = useState(editingProjectId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [staffEngaged, setStaffEngaged] = useState("");
  const [loanProvider, setLoanProvider] = useState("");
  const [loan, setLoan] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [newFacility, setNewFacility] = useState("");
  const [roomAreas, setRoomAreas] = useState({
    bedrooms: [],
    bathrooms: [],
    balconies: [],
  });
  const [activeTab, setActiveTab] = useState("project-info");
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [expandedFloors, setExpandedFloors] = useState({});

  // Manual input states
  const [manualBlockCount, setManualBlockCount] = useState(0);
  const [manualResidentialFloors, setManualResidentialFloors] = useState({});
  const [manualParkingFloors, setManualParkingFloors] = useState({});
  const [manualUnitCounts, setManualUnitCounts] = useState({});
  const [editingName, setEditingName] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // Load existing project data
  useEffect(() => {
    if (selectedProject && editingProjectId) {
      const projectData = selectedProject;
      setBlocks(projectData.blocks || []);
      setUnits(projectData.units || []);
      setTotalUnits(projectData.totalUnits || 0);
      setLandArea(projectData.landArea || 0);
      setProjectId(projectData.id);

      const blockExpansions = {};
      const floorExpansions = {};
      projectData.blocks?.forEach(block => {
        blockExpansions[block.id] = true;
        block.floors?.forEach(floor => {
          floorExpansions[`${block.id}-${floor.id}`] = true;
        });
      });
      setExpandedBlocks(blockExpansions);
      setExpandedFloors(floorExpansions);
    }
  }, [selectedProject, editingProjectId]);

  // Toggle block expansion
  const toggleBlockExpansion = (blockId) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  // Toggle floor expansion
  const toggleFloorExpansion = (blockId, floorId) => {
    setExpandedFloors(prev => ({
      ...prev,
      [`${blockId}-${floorId}`]: !prev[`${blockId}-${floorId}`]
    }));
  };

  // Save project handler
  const handleSaveProject = async () => {
    if (!projectName || !projectType) {
      alert("Please enter project name and type");
      return;
    }

    setIsSaving(true);

    try {
      const projectData = {
        name: projectName,
        type: projectType,
        city,
        locality,
        land_zone: landZone,
        land_area: landArea,
        blocks: [...blocks],
        revenuePlots: plotsData,
        approvalStatus: approvalStatus,
        broker,
        constructor,
        total_units: totalUnits
      };

      if (projectId) {
        // Update existing project
        await projectService.updateApartment(projectId, projectData);
        alert("Apartment project updated successfully!");
        if (onSaveProject) {
          onSaveProject({ ...projectData, id: projectId });
        }
      } else {
        // Create new project
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

  // Initialize room areas based on property features
  useEffect(() => {
    const beds = propertyFeatures.bedrooms || 0;
    const baths = propertyFeatures.bathrooms || 0;
    const balcs = propertyFeatures.balcony || 0;

    const newBedroomAreas = Array(beds).fill("").map((_, index) =>
      roomAreas.bedrooms[index] || ""
    );
    const newBathroomAreas = Array(baths).fill("").map((_, index) =>
      roomAreas.bathrooms[index] || ""
    );
    const newBalconyAreas = Array(balcs).fill("").map((_, index) =>
      roomAreas.balconies[index] || ""
    );

    setRoomAreas({
      bedrooms: newBedroomAreas,
      bathrooms: newBathroomAreas,
      balconies: newBalconyAreas,
    });
  }, [propertyFeatures.bedrooms, propertyFeatures.bathrooms, propertyFeatures.balcony]);

  // Room area handlers
  const handleRoomAreaChange = (roomType, index, value) => {
    setRoomAreas(prev => ({
      ...prev,
      [roomType]: prev[roomType].map((area, i) =>
        i === index ? value : area
      )
    }));
  };

  const calculateTotalRoomArea = (roomType) => {
    return roomAreas[roomType].reduce((sum, area) => sum + (parseFloat(area) || 0), 0);
  };

  const calculateTotalBedroomArea = () => calculateTotalRoomArea('bedrooms');
  const calculateTotalBathroomArea = () => calculateTotalRoomArea('bathrooms');
  const calculateTotalBalconyArea = () => calculateTotalRoomArea('balconies');

  // Generate unique ID
  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

const saveEditing = (key) => {
  const [type, id] = key.split("-");
  const unitId = Number(id);

  if (type === "unit") {
    updateUnit(unitId, "name", editingValue);
  }

  if (type === "unitType") {
    updateUnit(unitId, "roomType", editingValue);

    const bhk = parseInt(editingValue);
    if (!isNaN(bhk)) {
      updateUnit(unitId, "propertyFeatures", {
        bedrooms: bhk,
        bathrooms: Math.max(1, bhk - 1),
        balcony: Math.max(1, Math.floor(bhk / 2)),
      });
    }
  }

  setEditingName(null);
  setEditingValue("");
};



  // Save edited name/type
  const saveEditing = (type, id) => {
    const [entityType, entityId] = type.split('-');
    switch (entityType) {
      case 'block':
        updateBlock(parseInt(entityId), 'name', editingValue);
        break;
      case 'blockPrefix':
        updateBlock(parseInt(entityId), 'prefix', editingValue);
        break;
      case 'floor':
        const [blockId, floorId] = entityId.split('_');
        updateFloor(parseInt(blockId), parseInt(floorId), 'floorName', editingValue);
        break;
      case 'unit':
        updateUnit(parseInt(entityId), 'name', editingValue);
        break;
      case 'unitType':
        // Handle BHK selection - update both roomType and property features
        updateUnit(parseInt(entityId), 'roomType', editingValue);
        
        // Auto-update property features based on BHK selection
        const unitToUpdate = units.find(u => u.id === parseInt(entityId));
        if (unitToUpdate && editingValue) {
          const bhkNumber = parseInt(editingValue.charAt(0));
          if (!isNaN(bhkNumber)) {
            const updatedPropertyFeatures = {
              ...unitToUpdate.propertyFeatures,
              bedrooms: bhkNumber,
              bathrooms: Math.max(1, bhkNumber - 1),
              balcony: Math.max(1, Math.floor(bhkNumber / 2))
            };
            updateUnit(parseInt(entityId), 'propertyFeatures', updatedPropertyFeatures);
          }
        }
        break;
    }
    setEditingName(null);
    setEditingValue("");
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingName(null);
    setEditingValue("");
  };

  // Handle key press for editing
  const handleKeyPress = (e, type, id) => {
    if (e.key === 'Enter') {
      saveEditing(type, id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Add multiple blocks manually
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
    newBlocks.forEach(block => {
      setExpandedBlocks(prev => ({ ...prev, [block.id]: true }));
    });

    setManualBlockCount(0);
    alert(`Added ${manualBlockCount} blocks successfully!`);
  };

  // Add floors to block
  const addFloorsToBlock = (blockId) => {
    const residentialCount = manualResidentialFloors[blockId] || 0;
    const parkingCount = manualParkingFloors[blockId] || 0;

    if (residentialCount <= 0 && parkingCount <= 0) {
      alert("Please enter valid numbers for residential and/or parking floors");
      return;
    }

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newFloors = [];

    // Add residential floors
    for (let i = 1; i <= residentialCount; i++) {
      const floorNumber = block.floors.filter(f => f.floorType === 'residential').length + i;
      const floorName = getFloorName(floorNumber, 'residential');
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

    // Add parking floors
    for (let i = 1; i <= parkingCount; i++) {
      const floorNumber = block.floors.filter(f => f.floorType === 'parking').length + i;
      const floorName = getFloorName(floorNumber, 'parking');
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

    const updatedBlocks = blocks.map(b =>
      b.id === blockId
        ? {
          ...b,
          floors: [...b.floors, ...newFloors],
          residentialFloors: b.residentialFloors + residentialCount,
          parkingFloors: b.parkingFloors + parkingCount,
        }
        : b
    );

    setBlocks(updatedBlocks);
    newFloors.forEach(floor => {
      setExpandedFloors(prev => ({ ...prev, [`${blockId}-${floor.id}`]: true }));
    });

    setManualResidentialFloors(prev => ({ ...prev, [blockId]: 0 }));
    setManualParkingFloors(prev => ({ ...prev, [blockId]: 0 }));

    alert(`Added ${residentialCount} residential floors and ${parkingCount} parking floors to ${block.name} successfully!`);
  };

  // Add multiple units to a floor
  const addMultipleUnitsToFloor = (blockId, floorId) => {
    const unitCount = manualUnitCounts[`${blockId}-${floorId}`] || 0;
    if (unitCount <= 0) {
      alert("Please enter a valid number of units");
      return;
    }

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const floor = block.floors.find(f => f.id === floorId);
    if (!floor || floor.floorType === 'parking') return;

    const capacity = block.capacity || 0;
    const assigned = block.totalUnits || 0;
    const remaining = capacity - assigned;

    if (remaining <= 0) {
      alert("This block has no remaining unit capacity. Increase block capacity to add more units.");
      return;
    }

    const allowedCount = Math.min(unitCount, remaining);

    if (allowedCount < unitCount) {
      alert(`Only ${allowedCount} units can be added to this block (capacity reached).`);
    }

    const newUnits = [];
    for (let i = 1; i <= allowedCount; i++) {
      const unitNumber = floor.units.length + i;
      const unitPrefix = `${block.prefix}-${floor.floorNumber.toString().padStart(2, '0')}-${unitNumber.toString().padStart(2, '0')}`;
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
          bedrooms: 1,
          bathrooms: 1,
          balcony: 1 
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
        transactionType: { ...INITIAL_TRANSACTION_TYPE }
      };
      newUnits.push(newUnit);
    }

    const updatedBlocks = blocks.map(b => {
      if (b.id === blockId) {
        const updatedFloors = b.floors.map(f => {
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
    setUnits(prev => [...prev, ...newUnits]);
    setTotalUnits(prev => prev + newUnits.length);

    setManualUnitCounts(prev => ({ ...prev, [`${blockId}-${floorId}`]: 0 }));
    alert(`Added ${newUnits.length} units to ${floor.floorName} successfully!`);
  };

  // Update block details
  const updateBlock = (blockId, field, value) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, [field]: value } : block
    );
    setBlocks(updatedBlocks);
  };

  // Update floor details
  const updateFloor = (blockId, floorId, field, value) => {
    const updatedBlocks = blocks.map(block => {
      if (block.id === blockId) {
        const updatedFloors = block.floors.map(floor =>
          floor.id === floorId ? { ...floor, [field]: value } : floor
        );
        return { ...block, floors: updatedFloors };
      }
      return block;
    });
    setBlocks(updatedBlocks);
  };

  // Update unit details
const updateUnit = (unitId, field, value) => {
  setUnits(prev =>
    prev.map(unit =>
      unit.id === unitId ? { ...unit, [field]: value } : unit
    )
  );

  setBlocks(prev =>
    prev.map(block => ({
      ...block,
      floors: block.floors.map(floor => ({
        ...floor,
        units: floor.units.map(unit =>
          unit.id === unitId ? { ...unit, [field]: value } : unit
        )
      }))
    }))
  );

  // 🔥 KEEP selectedUnit IN SYNC
  setSelectedUnit(prev =>
    prev?.id === unitId ? { ...prev, [field]: value } : prev
  );
};


  // Remove block
  const removeBlock = (blockId) => {
    if (window.confirm("Are you sure you want to remove this block and all its floors/units?")) {
      const unitsToRemove = units.filter(unit => unit.blockId === blockId);
      const updatedUnits = units.filter(unit => unit.blockId !== blockId);

      if (selectedUnit && selectedUnit.blockId === blockId) {
        setSelectedUnit(null);
      }

      const updatedBlocks = blocks.filter(block => block.id !== blockId);

      setBlocks(updatedBlocks);
      setUnits(updatedUnits);
      setTotalUnits(prev => prev - unitsToRemove.length);

      alert("Block removed successfully!");
    }
  };

  // Remove floor
  const removeFloor = (blockId, floorId) => {
    if (window.confirm("Are you sure you want to remove this floor and all its units?")) {
      const block = blocks.find(b => b.id === blockId);
      const floor = block?.floors.find(f => f.id === floorId);

      if (!block || !floor) return;

      const unitsToRemove = units.filter(unit => unit.floorId === floorId);
      const updatedUnits = units.filter(unit => unit.floorId !== floorId);

      if (selectedUnit && selectedUnit.floorId === floorId) {
        setSelectedUnit(null);
      }

      const updatedBlocks = blocks.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            floors: b.floors.filter(f => f.id !== floorId),
            residentialFloors: floor.floorType === 'residential' ? b.residentialFloors - 1 : b.residentialFloors,
            parkingFloors: floor.floorType === 'parking' ? b.parkingFloors - 1 : b.parkingFloors,
            totalUnits: b.totalUnits - floor.units.length
          };
        }
        return b;
      });

      setBlocks(updatedBlocks);
      setUnits(updatedUnits);
      setTotalUnits(prev => prev - unitsToRemove.length);

      alert("Floor removed successfully!");
    }
  };

  // Remove unit
  const removeUnit = (unitId) => {
    if (window.confirm("Are you sure you want to remove this unit?")) {
      const unitToRemove = units.find(u => u.id === unitId);
      if (!unitToRemove) return;

      const updatedUnits = units.filter(unit => unit.id !== unitId);
      const updatedBlocks = blocks.map(block => {
        if (block.id === unitToRemove.blockId) {
          const updatedFloors = block.floors.map(floor => {
            if (floor.id === unitToRemove.floorId) {
              return {
                ...floor,
                units: floor.units.filter(u => u.id !== unitId),
                totalUnits: floor.totalUnits - 1,
              };
            }
            return floor;
          });

          return {
            ...block,
            floors: updatedFloors,
            totalUnits: block.totalUnits - 1
          };
        }
        return block;
      });

      setBlocks(updatedBlocks);
      setUnits(updatedUnits);
      setTotalUnits(prev => prev - 1);

      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
      }

      alert("Unit removed successfully!");
    }
  };

  // Handle unit click
  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setPropertyFeatures(unit.propertyFeatures || INITIAL_PROPERTY_FEATURES);
    setAreaDetails(unit.areaDetails || INITIAL_AREA_DETAILS);
    setPriceDetails(unit.priceDetails || INITIAL_PRICE_DETAILS);
    setBroker(unit.broker || "");
    setPurchaser(unit.purchaser || "");
    setConstructor(unit.constructor || "");
    setStaffEngaged(unit.staffEngaged || "");
    setLoanProvider(unit.loanProvider || "");
    setLoan(unit.loan || "");
    setFacilities(unit.facilities || []);
    setApprovalStatus(unit.approvalStatus || INITIAL_APPROVAL_STATUS);
    setTransactionType(unit.transactionType || INITIAL_TRANSACTION_TYPE);
  };

  // Render room area inputs
  const renderRoomAreaInputs = () => {
    const beds = propertyFeatures.bedrooms || 0;
    const baths = propertyFeatures.bathrooms || 0;
    const balcs = propertyFeatures.balcony || 0;

    return (
      <div className="space-y-4">
        {/* Bedroom Areas */}
        {beds > 0 && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <FaBed className="mr-2 text-purple-600 h-4 w-4" />
              Bedroom Areas (sq. ft)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.from({ length: beds }, (_, index) => (
                <div key={`bed-${index}`} className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    Bedroom {index + 1}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomAreas.bedrooms[index] || ""}
                    onChange={(e) => handleRoomAreaChange('bedrooms', index, e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Area"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Bedroom Area:</span>
                <span className="font-semibold text-purple-700">
                  {calculateTotalBedroomArea().toLocaleString()} sq. ft
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bathroom Areas */}
        {baths > 0 && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <FaBath className="mr-2 text-blue-600 h-4 w-4" />
              Bathroom Areas (sq. ft)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.from({ length: baths }, (_, index) => (
                <div key={`bath-${index}`} className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    Bathroom {index + 1}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomAreas.bathrooms[index] || ""}
                    onChange={(e) => handleRoomAreaChange('bathrooms', index, e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Area"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Bathroom Area:</span>
                <span className="font-semibold text-blue-700">
                  {calculateTotalBathroomArea().toLocaleString()} sq. ft
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Balcony Areas */}
        {balcs > 0 && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <FaDoorOpen className="mr-2 text-green-600 h-4 w-4" />
              Balcony Areas (sq. ft)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.from({ length: balcs }, (_, index) => (
                <div key={`balcony-${index}`} className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    Balcony {index + 1}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomAreas.balconies[index] || ""}
                    onChange={(e) => handleRoomAreaChange('balconies', index, e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="Area"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Balcony Area:</span>
                <span className="font-semibold text-green-700">
                  {calculateTotalBalconyArea().toLocaleString()} sq. ft
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Navigation Tabs Component
  const NavigationTabs = () => (
    <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/20 p-1 mb-6 shadow-sm">
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab("project-info")}
          className={`flex items-center px-4 py-2 rounded-lg transition-all font-medium text-sm ${activeTab === "project-info"
            ? "bg-indigo-600 text-white shadow shadow-indigo-600/20"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <FaHome className={`mr-2 h-4 w-4 ${activeTab === "project-info" ? 'text-indigo-200' : 'text-slate-400'}`} />
          Project Info
        </button>

        <button
          onClick={() => setActiveTab("blocks")}
          className={`flex items-center px-4 py-2 rounded-lg transition-all font-medium text-sm ${activeTab === "blocks"
            ? "bg-indigo-600 text-white shadow shadow-indigo-600/20"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <FaLayerGroup className={`mr-2 h-4 w-4 ${activeTab === "blocks" ? 'text-indigo-200' : 'text-slate-400'}`} />
          Blocks <span className={`ml-1 text-xs py-0.5 px-1 rounded ${activeTab === "blocks" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{blocks.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("units")}
          className={`flex items-center px-4 py-2 rounded-lg transition-all font-medium text-sm ${activeTab === "units"
            ? "bg-indigo-600 text-white shadow shadow-indigo-600/20"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <FaBuilding className={`mr-2 h-4 w-4 ${activeTab === "units" ? 'text-indigo-200' : 'text-slate-400'}`} />
          Units <span className={`ml-1 text-xs py-0.5 px-1 rounded ${activeTab === "units" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{units.length}</span>
        </button>
      </div>
    </div>
  );

  // Statistics Card Component
  const StatisticsCard = ({ icon, label, value, color }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-lg border border-white/50 p-3 shadow-sm">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color} mr-3`}>
          {icon}
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">{value}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
        </div>
      </div>
    </div>
  );

  // Enhanced Project Info Section
  const renderProjectInfo = () => (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
          <div className="flex items-center">
            <FaCheckCircle className="text-emerald-500 mr-2 h-4 w-4" />
            <div>
              <h4 className="font-semibold text-emerald-800 text-sm">Success!</h4>
              <p className="text-emerald-700 text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Project Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatisticsCard
          icon={<FaLayerGroup className="h-5 w-5 text-indigo-600" />}
          label="Total Blocks"
          value={blocks.length}
          color="bg-indigo-50"
        />
        <StatisticsCard
          icon={<FaBuilding className="h-5 w-5 text-emerald-600" />}
          label="Total Units"
          value={totalUnits}
          color="bg-emerald-50"
        />
        <StatisticsCard
          icon={<FaBuilding className="h-5 w-5 text-blue-600" />}
          label="Total Floors"
          value={blocks.reduce((sum, block) => sum + block.floors.length, 0)}
          color="bg-blue-50"
        />
        <StatisticsCard
          icon={<FaCar className="h-5 w-5 text-amber-600" />}
          label="Parking Floors"
          value={blocks.reduce((sum, block) => sum + block.floors.filter(f => f.floorType === 'parking').length, 0)}
          color="bg-amber-50"
        />
      </div>

      {/* Project Basic Info */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-xl border border-white/60 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center">
            <div className="p-1.5 bg-indigo-100 rounded-md mr-2">
              <FaHome className="text-indigo-600 h-4 w-4" />
            </div>
            Project Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                Project Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                Project Type <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer font-medium"
                >
                  <option value="">Select project type</option>
                  {Object.values(PROJECT_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                  <FaChevronDown className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-xl border border-white/60 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center">
            <div className="p-1.5 bg-blue-100 rounded-md mr-2">
              <FaMapMarkerAlt className="text-blue-600 h-4 w-4" />
            </div>
            Property Location
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                  placeholder="Enter City"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Locality
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                  placeholder="Enter Locality"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                Total Land Area (sq. ft)
              </label>
              <input
                type="number"
                min="0"
                value={landArea}
                onChange={(e) => setLandArea(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                placeholder="Enter total land area"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      <div className="flex justify-between items-center pt-2">
        <div></div>
        <button
          onClick={() => setActiveTab("blocks")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center"
        >
          Next: Add Blocks
          <FaChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Blocks Management Section
  const renderBlocks = () => (
    <div className="space-y-4">
      {/* Add Multiple Blocks Section */}
      <div className="bg-white/80 backdrop-blur-xl p-4 rounded-xl border border-white/60 shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1 text-slate-800 flex items-center">
              <div className="p-1.5 bg-indigo-100 rounded-md mr-2">
                <FaSortAmountUp className="text-indigo-600 h-4 w-4" />
              </div>
              Add New Blocks
            </h3>
            <p className="text-slate-500 text-sm">Batch create blocks for your project.</p>
          </div>

          <div className="flex-1 max-w-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Number of Blocks
            </label>
            <div className="flex rounded-lg overflow-hidden">
              <input
                type="number"
                min="1"
                max="50"
                value={manualBlockCount}
                onChange={(e) => setManualBlockCount(parseInt(e.target.value) || 0)}
                className="flex-1 bg-white border border-r-0 border-slate-200 px-3 py-2 text-slate-900 focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Ex. 5"
              />
              <button
                onClick={addMultipleBlocks}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 font-medium transition-all duration-200 flex items-center"
              >
                <FaPlus className="mr-1 h-3 w-3" />
                Add Blocks
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-2">
        {blocks.length === 0 ? (
          <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
            <FaLayerGroup className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700 mb-1">No Blocks Created</h3>
            <p className="text-slate-500 mb-3">Start by adding blocks to the project</p>
            <div className="flex items-center justify-center space-x-2">
              <input
                type="number"
                min="1"
                max="50"
                value={manualBlockCount}
                onChange={(e) => setManualBlockCount(parseInt(e.target.value) || 0)}
                className="w-24 border border-slate-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Number"
              />
              <button
                onClick={addMultipleBlocks}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded transition-all duration-200 flex items-center"
              >
                <FaPlus className="mr-1 h-3 w-3" />
                Add Blocks
              </button>
            </div>
          </div>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="bg-white/80 backdrop-blur-md rounded-lg border border-white/60 shadow-sm overflow-hidden">
              {/* Block Header */}
              <div
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${expandedBlocks[block.id] ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}
                onClick={() => toggleBlockExpansion(block.id)}
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-100 p-1.5 rounded-md">
                    <FaLayerGroup className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      {/* Editable Block Name */}
                      <div className="relative group">
                        {editingName === `block-${block.id}` ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyPress={(e) => handleKeyPress(e, `block-${block.id}`, block.id)}
                              className="text-base font-semibold text-slate-900 border-b border-indigo-500 bg-transparent focus:outline-none px-1"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEditing(`block-${block.id}`, block.id)}
                              className="text-emerald-600 hover:text-emerald-800"
                            >
                              <FaCheck className="h-3 w-3" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTimes className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <h3 className="text-lg font-semibold text-slate-900">{block.name}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing('block', block.id, block.name);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity"
                            >
                              <FaEdit className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Editable Block Prefix */}
                      <div className="relative group">
                        {editingName === `blockPrefix-${block.id}` ? (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-slate-500">(</span>
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyPress={(e) => handleKeyPress(e, `blockPrefix-${block.id}`, block.id)}
                              className="text-xs text-slate-500 border-b border-indigo-500 bg-transparent focus:outline-none px-1 w-10"
                              autoFocus
                            />
                            <span className="text-xs text-slate-500">)</span>
                            <button
                              onClick={() => saveEditing(`blockPrefix-${block.id}`, block.id)}
                              className="text-emerald-600 hover:text-emerald-800"
                            >
                              <FaCheck className="h-2 w-2" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTimes className="h-2 w-2" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-0.5">
                            <span className="text-xs text-slate-500">({block.prefix})</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing('blockPrefix', block.id, block.prefix);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity"
                            >
                              <FaEdit className="h-2 w-2" />
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {block.floors.filter(f => f.floorType === 'residential').length} residential
                      </span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                        {block.floors.filter(f => f.floorType === 'parking').length} parking
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                        {block.totalUnits}/{block.capacity || 0} units
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="transform transition-transform duration-200">
                    {expandedBlocks[block.id] ? (
                      <FaChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <FaChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Block Content - Expanded */}
              {expandedBlocks[block.id] && (
                <div className="p-3 space-y-3">
                  {/* Block Configuration */}
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <h4 className="text-md font-semibold text-slate-800 mb-1 flex items-center">
                      <FaCogs className="mr-1 h-3 w-3" />
                      Block Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-0.5">
                          Block Name
                        </label>
                        <input
                          type="text"
                          value={block.name}
                          onChange={(e) => updateBlock(block.id, 'name', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-0.5">
                          Block Prefix
                        </label>
                        <input
                          type="text"
                          value={block.prefix}
                          onChange={(e) => updateBlock(block.id, 'prefix', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
                        />
                      </div>


                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-0.5">
                          Total Units (Capacity) for Block
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            value={block.capacity || 0}
                            onChange={(e) => updateBlock(block.id, 'capacity', parseInt(e.target.value) || 0)}
                            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
                            placeholder="Capacity"
                          />
                          <div className="text-xs text-slate-500 whitespace-nowrap">
                            <span className="font-medium text-indigo-600">
                              {block.totalUnits} / {block.capacity || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add Floors Section */}
                    <div className="mt-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-0.5">
                           Total Residential Floors
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={manualResidentialFloors[block.id] || ""}
                            onChange={(e) => setManualResidentialFloors(prev => ({
                              ...prev,
                              [block.id]: parseInt(e.target.value) || 0
                            }))}
                            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-0.5">
                          Total Parking Floors
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={manualParkingFloors[block.id] || ""}
                            onChange={(e) => setManualParkingFloors(prev => ({
                              ...prev,
                              [block.id]: parseInt(e.target.value) || 0
                            }))}
                            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-0.5">
                            Units
                          </label>
                          <div className="text-xs text-slate-500 px-1">
                            Add units to each floor individually
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => addFloorsToBlock(block.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-2 rounded text-sm flex items-center justify-center"
                          >
                            <FaPlus className="mr-1 h-3 w-3" />
                            Add Floors
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-between">
                      <div className="text-xs text-slate-600">
                        Total units in block: {block.totalUnits}
                      </div>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-0.5 rounded text-xs flex items-center transition-colors"
                      >
                        <FaTrashAlt className="mr-0.5 h-3 w-3" />
                        Remove Block
                      </button>
                    </div>
                  </div>

                  {/* Floors List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-semibold text-slate-800 flex items-center">
                        <FaChartLine className="mr-1 text-blue-600 h-4 w-4" />
                        Floors ({block.floors.length})
                      </h4>
                    </div>

                    {block.floors.length === 0 ? (
                      <div className="bg-slate-50 rounded border-2 border-dashed border-slate-300 p-4 text-center">
                        <FaChartLine className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                        <p className="text-sm text-slate-500">No floors added to this block yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {block.floors.map((floor) => (
                          <div key={floor.id} className="bg-white rounded border border-slate-200 overflow-hidden">
                            {/* Floor Header */}
                            <div
                              className="flex items-center justify-between p-2 bg-linear-to-r from-blue-50 to-white border-b border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors"
                              onClick={() => toggleFloorExpansion(block.id, floor.id)}
                            >
                              <div className="flex items-center space-x-2">
                                <div className={`p-1 rounded ${floor.floorType === 'parking' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                                  {floor.floorType === 'parking' ? (
                                    <FaParking className="h-4 w-4 text-amber-600" />
                                  ) : (
                                    <FaChartLine className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-1">
                                    {/* Editable Floor Name */}
                                    <div className="relative group">
                                      {editingName === `floor-${block.id}_${floor.id}` ? (
                                        <div className="flex items-center space-x-1">
                                          <input
                                            type="text"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            onKeyPress={(e) => handleKeyPress(e, `floor-${block.id}_${floor.id}`, `${block.id}_${floor.id}`)}
                                            className="font-semibold text-slate-900 border-b border-blue-500 bg-transparent focus:outline-none px-1"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => saveEditing(`floor-${block.id}_${floor.id}`, `${block.id}_${floor.id}`)}
                                            className="text-emerald-600 hover:text-emerald-800"
                                          >
                                            <FaCheck className="h-2 w-2" />
                                          </button>
                                          <button
                                            onClick={cancelEditing}
                                            className="text-red-600 hover:text-red-800"
                                          >
                                            <FaTimes className="h-2 w-2" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-1">
                                          <h5 className="font-semibold text-slate-900">{floor.floorName}</h5>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              startEditing('floor', `${block.id}_${floor.id}`, floor.floorName);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                                          >
                                            <FaEdit className="h-2 w-2" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <span className={`px-1 py-0.5 rounded-full text-xs font-medium ${floor.floorType === 'parking'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                      }`}>
                                      {floor.floorType === 'parking' ? 'Parking' : 'Residential'}
                                    </span>
                                    {floor.floorType === 'residential' && (
                                      <span className="px-1 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                                        {floor.units.length} units
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {floor.floorType === 'residential' && (
                                  <div className="flex items-center space-x-1">
                                    <input
                                      type="number"
                                      min="1"
                                      value={manualUnitCounts[`${block.id}-${floor.id}`] || ""}
                                      onChange={(e) => setManualUnitCounts(prev => ({
                                        ...prev,
                                        [`${block.id}-${floor.id}`]: parseInt(e.target.value) || 0
                                      }))}
                                      className="w-16 border border-slate-300 rounded px-1.5 py-1.5 text-xs"
                                      placeholder="Units"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addMultipleUnitsToFloor(block.id, floor.id);
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-1.5 py-1.5 rounded text-xs flex items-center"
                                    >
                                      <FaPlus className="mr-0.5 h-2 w-2" />
                                      Add Units
                                    </button>
                                  </div>
                                )}
                                <div className="transform transition-transform duration-200">
                                  {expandedFloors[`${block.id}-${floor.id}`] ? (
                                    <FaChevronUp className="h-3 w-3 text-slate-400" />
                                  ) : (
                                    <FaChevronDown className="h-3 w-3 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Floor Content - Expanded */}
                            {expandedFloors[`${block.id}-${floor.id}`] && (
                              <div className="p-2 space-y-2">
                                {/* Floor Configuration */}
                                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-1">
                                    <div>
                                      <label className="block text-sm font-medium text-slate-600 mb-0.5">
                                        Floor Name
                                      </label>
                                      <input
                                        type="text"
                                        value={floor.floorName}
                                        onChange={(e) => updateFloor(block.id, floor.id, 'floorName', e.target.value)}
                                        className="w-full border border-slate-300 rounded px-1.5 py-1.5 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-1 flex justify-end">
                                    <button
                                      onClick={() => removeFloor(block.id, floor.id)}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-1.5 py-0.5 rounded text-xs flex items-center transition-colors"
                                    >
                                      <FaTrashAlt className="mr-0.5 h-2 w-2" />
                                      Remove Floor
                                    </button>
                                  </div>
                                </div>

                                {/* Units List - Only for residential floors */}
                                {floor.floorType === 'residential' && (
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <h6 className="text-sm font-semibold text-slate-700 flex items-center">
                                        <FaBuilding className="mr-1 text-slate-500 h-2.5 w-2.5" />
                                        Units ({floor.units.length})
                                      </h6>
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="number"
                                          min="1"
                                          value={manualUnitCounts[`${block.id}-${floor.id}`] || ""}
                                          onChange={(e) => setManualUnitCounts(prev => ({
                                            ...prev,
                                            [`${block.id}-${floor.id}`]: parseInt(e.target.value) || 0
                                          }))}
                                          className="w-16 border border-slate-300 rounded px-1.5 py-1 text-xs"
                                          placeholder="Units"
                                        />
                                        <button
                                          onClick={() => addMultipleUnitsToFloor(block.id, floor.id)}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-1.5 py-1 rounded text-xs flex items-center"
                                        >
                                          <FaPlus className="mr-0.5 h-2 w-2" />
                                          Add Units
                                        </button>
                                      </div>
                                    </div>

                                    {floor.units.length === 0 ? (
                                      <div className="bg-slate-50 rounded border-2 border-dashed border-slate-300 p-3 text-center">
                                        <FaBuilding className="mx-auto h-6 w-6 text-slate-300 mb-1" />
                                        <p className="text-xs text-slate-500">No units on this floor yet</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                          Add any number of units
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                                        {floor.units.map((unit) => (
                                          <div key={unit.id} className="group relative">
                                            <div
                                              className={`bg-white border rounded p-1.5 cursor-pointer transition-all duration-200 hover:shadow-sm ${selectedUnit?.id === unit.id
                                                ? 'border-indigo-300 bg-indigo-50'
                                                : 'border-slate-200 hover:border-indigo-200'
                                                }`}
                                              onClick={() => handleUnitClick(unit)}
                                            >
                                              <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center">
                                                  <div className={`w-6 h-6 rounded flex items-center justify-center mr-1 ${unit.isComplete ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                                    <span className={`text-xs font-bold ${unit.isComplete ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                      {unit.unitNumber}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    {/* Editable Unit Name */}
                                                    <div className="flex items-center space-x-0.5 mb-0.5">
                                                      {editingName === `unit-${unit.id}` ? (
                                                        <div className="flex items-center space-x-1">
                                                          <input
                                                            type="text"
                                                            value={editingValue}
                                                            onChange={(e) => setEditingValue(e.target.value)}
                                                            onKeyPress={(e) => handleKeyPress(e, `unit-${unit.id}`, unit.id)}
                                                            className="text-xs font-medium text-slate-900 border-b border-indigo-500 bg-transparent focus:outline-none px-1 w-20"
                                                            autoFocus
                                                          />
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              saveEditing(`unit-${unit.id}`, unit.id);
                                                            }}
                                                            className="text-emerald-600 hover:text-emerald-800"
                                                          >
                                                            <FaCheck className="h-2 w-2" />
                                                          </button>
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              cancelEditing();
                                                            }}
                                                            className="text-red-600 hover:text-red-800"
                                                          >
                                                            <FaTimes className="h-2 w-2" />
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <div className="flex items-center space-x-1">
                                                          <h6 className="font-medium text-slate-900 text-xs">{unit.name}</h6>
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              startEditing('unit', unit.id, unit.name);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity"
                                                          >
                                                            <FaEdit className="h-2 w-2" />
                                                          </button>
                                                        </div>
                                                      )}
                                                    </div>

                                                    {/* Unit Type Dropdown */}
                                                    <div className="flex items-center space-x-0.5">
                                                      {editingName === `unitType-${unit.id}` ? (
                                                        <div className="flex items-center space-x-1">
                                                          <select
                                                            value={editingValue}
                                                            onChange={(e) => setEditingValue(e.target.value)}
                                                            onKeyPress={(e) => handleKeyPress(e, `unitType-${unit.id}`, unit.id)}
                                                            className="text-xs border border-indigo-500 rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            autoFocus
                                                          >
                                                            <option value="">Select Type</option>
                                                            {BHK_OPTIONS.map(type => (
                                                              <option key={type} value={type}>{type}</option>
                                                            ))}
                                                          </select>
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              saveEditing(`unitType-${unit.id}`, unit.id);
                                                              // Also update property features based on BHK selection
                                                              const bhkNumber = parseInt(editingValue.charAt(0));
                                                              if (!isNaN(bhkNumber)) {
                                                                updateUnit(unit.id, 'propertyFeatures', {
                                                                  ...unit.propertyFeatures,
                                                                  bedrooms: bhkNumber,
                                                                  bathrooms: Math.max(1, bhkNumber - 1),
                                                                  balcony: Math.max(1, Math.floor(bhkNumber / 2))
                                                                });
                                                              }
                                                            }}
                                                            className="text-emerald-600 hover:text-emerald-800"
                                                          >
                                                            <FaCheck className="h-2 w-2" />
                                                          </button>
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              cancelEditing();
                                                            }}
                                                            className="text-red-600 hover:text-red-800"
                                                          >
                                                            <FaTimes className="h-2 w-2" />
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <div className="flex items-center space-x-1">
                                                          <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {unit.roomType}
                                                          </span>
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              startEditing('unitType', unit.id, unit.roomType);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity"
                                                          >
                                                            <FaEdit className="h-1.5 w-1.5" />
                                                          </button>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                {unit.isComplete && (
                                                  <FaCheckCircle className="text-emerald-500 h-3 w-3" />
                                                )}
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => removeUnit(unit.id)}
                                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-3">
        <button
          onClick={() => setActiveTab("project-info")}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded transition-all duration-200 font-medium flex items-center"
        >
          <FaChevronLeft className="mr-1 h-3 w-3" />
          Back
        </button>
        <button
          onClick={() => setActiveTab("units")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded transition-all duration-200 font-medium flex items-center"
        >
          Next: View Units
          <FaChevronRight className="ml-1 h-3 w-3" />
        </button>
      </div>
    </div>
  );

  // Enhanced Units Section
  const renderUnits = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Units List */}
      <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl p-4 rounded-xl border border-white/60 shadow-sm flex flex-col h-[calc(100vh-10rem)] min-h-125">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <div className="p-1.5 bg-indigo-100 rounded-md mr-2">
              <FaBuilding className="text-indigo-600 h-4 w-4" />
            </div>
            All Units
          </h2>
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold border border-indigo-100">
            {units.length} UNITS
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1 grow">
          {units.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center justify-center h-full text-slate-400">
              <div className="bg-slate-50 p-4 rounded-full mb-2">
                <FaBuilding className="h-8 w-8 text-slate-300" />
              </div>
              <p className="font-medium text-sm">No units created yet</p>
              <p className="text-xs mt-0.5">Add blocks and units to see them here.</p>
            </div>
          ) : (
            units.map((unit, idx) => {
              const block = blocks.find(b => b.id === unit.blockId);
              const floor = block?.floors.find(f => f.id === unit.floorId);

              return (
                <div
                  key={unit.id}
                  className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 group relative ${selectedUnit?.id === unit.id
                    ? "bg-indigo-600 border-indigo-600 shadow text-white"
                    : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow"
                    }`}
                  onClick={() => handleUnitClick(unit)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded flex items-center justify-center mr-2 ${selectedUnit?.id === unit.id
                        ? "bg-white/20 text-white"
                        : unit.isComplete ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                        }`}>
                        <span className="font-bold text-xs">
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 mb-0.5">
                          <h4 className={`font-bold text-sm ${selectedUnit?.id === unit.id ? 'text-white' : 'text-slate-800'}`}>
                            {unit.name}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing('unit', unit.id, unit.name);
                            }}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedUnit?.id === unit.id
                              ? 'text-indigo-100 hover:text-white'
                              : 'text-slate-400 hover:text-indigo-600'
                              }`}
                          >
                            <FaEdit className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${selectedUnit?.id === unit.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                            }`}>
                            {unit.roomType}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing('unitType', unit.id, unit.roomType);
                            }}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedUnit?.id === unit.id
                              ? 'text-indigo-100 hover:text-white'
                              : 'text-slate-400 hover:text-indigo-600'
                              }`}
                          >
                            <FaEdit className="h-2 w-2" />
                          </button>
                          <p className={`text-xs mt-0.5 ${selectedUnit?.id === unit.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {block?.name} • {floor?.floorName}
                          </p>
                        </div>
                      </div>
                    </div>
                    {unit.isComplete && (
                      <div className={`p-0.5 rounded ${selectedUnit?.id === unit.id ? 'bg-white/20' : 'bg-emerald-50'}`}>
                        <FaCheckCircle className={`${selectedUnit?.id === unit.id ? 'text-emerald-300' : 'text-emerald-500'} h-3 w-3`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Unit Details */}
      <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-4 rounded-xl border border-white/60 shadow-sm">
        {selectedUnit ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                {/* Editable Unit Name in header */}
                <div className="flex items-center space-x-2 mb-1">
                  {editingName === `unit-${selectedUnit.id}` ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, `unit-${selectedUnit.id}`, selectedUnit.id)}
                        className="text-lg font-bold text-slate-900 border-b border-indigo-500 bg-transparent focus:outline-none px-1"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditing(`unit-${selectedUnit.id}`, selectedUnit.id)}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        <FaCheck className="h-3 w-3" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <h2 className="text-lg font-bold text-slate-900">{selectedUnit.name}</h2>
                      <button
                        onClick={() => startEditing('unit', selectedUnit.id, selectedUnit.name)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <FaEdit className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Editable Unit Type in header */}
                <div className="flex items-center space-x-1">
                  {editingName === `unitType-${selectedUnit.id}` ? (
                    <div className="flex items-center space-x-1">
                      <select
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, `unitType-${selectedUnit.id}`, selectedUnit.id)}
                        className="text-sm border border-indigo-500 rounded px-2 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      >
                        <option value="">Select BHK Type</option>
                        {BHK_OPTIONS.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => saveEditing(`unitType-${selectedUnit.id}`, selectedUnit.id)}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        <FaCheck className="h-3 w-3" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <p className="text-slate-500 text-sm">{selectedUnit.roomType}</p>
                      <button
                        onClick={() => startEditing('unitType', selectedUnit.id, selectedUnit.roomType)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <FaEdit className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                  {selectedUnit.roomType}
                </span>
                {selectedUnit.isComplete && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-medium flex items-center">
                    <FaCheckCircle className="mr-0.5 h-2.5 w-2.5" />
                    Complete
                  </span>
                )}
              </div>
            </div>

            {/* Room Configuration */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="text-base font-semibold mb-2 text-slate-800 flex items-center">
                <FaLayerGroup className="mr-1 text-indigo-600 h-4 w-4" />
                Room Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      <FaBed className="mr-1 text-purple-600 h-3 w-3" />
                      Bedrooms
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={propertyFeatures.bedrooms || ""}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          bedrooms: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-16 border border-slate-300 rounded px-2 py-0.5 text-center text-sm"
                    />
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      <FaBath className="mr-1 text-blue-600 h-3 w-3" />
                      Bathrooms
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={propertyFeatures.bathrooms || ""}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          bathrooms: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-16 border border-slate-300 rounded px-2 py-0.5 text-center text-sm"
                    />
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      <FaDoorOpen className="mr-1 text-green-600 h-3 w-3" />
                      Balcony
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={propertyFeatures.balcony || ""}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          balcony: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-16 border border-slate-300 rounded px-2 py-0.5 text-center text-sm"
                    />
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 mb-1">
                      Furnished Status
                    </span>
                    <select
                      value={propertyFeatures.furnishedStatus || "Unfurnished"}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          furnishedStatus: e.target.value,
                        })
                      }
                      className="border border-slate-300 rounded px-2 py-0.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Fully Furnished">Fully Furnished</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Room Area Inputs */}
              {renderRoomAreaInputs()}
            </div>

            {/* Facilities Section */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="text-base font-semibold mb-2 text-slate-800 flex items-center">
                <FaCogs className="mr-1 text-indigo-600 h-4 w-4" />
                Facilities
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Enter facility name"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={() => {
                    if (newFacility.trim()) {
                      setFacilities([...facilities, { id: Date.now(), name: newFacility }]);
                      setNewFacility("");
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                >
                  <FaPlus className="mr-1 h-3 w-3" />
                  Add
                </button>
              </div>
              {facilities.length > 0 && (
                <div className="space-y-1">
                  {facilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="flex items-center justify-between bg-white p-2 rounded border border-slate-200"
                    >
                      <span className="text-sm text-slate-700">{facility.name}</span>
                      <button
                        onClick={() =>
                          setFacilities(facilities.filter((f) => f.id !== facility.id))
                        }
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <FaTrashAlt className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Information Section */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="text-base font-semibold mb-3 text-slate-800 flex items-center">
                <FaInfoCircle className="mr-1 text-indigo-600 h-4 w-4" />
                Additional Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Broker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Broker
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Select a broker"
                      value={broker}
                      onChange={(e) => setBroker(e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <button className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-3 py-1 rounded text-sm transition-colors">
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Purchaser */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Purchaser
                  </label>
                  <input
                    type="text"
                    placeholder="Enter purchaser name"
                    value={purchaser}
                    onChange={(e) => setPurchaser(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Contractor */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contractor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Select a contractor"
                      value={constructor}
                      onChange={(e) => setConstructor(e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <button className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-3 py-1 rounded text-sm transition-colors">
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Staff Engaged */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Staff Engaged (if any)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter staff name or ID"
                    value={staffEngaged}
                    onChange={(e) => setStaffEngaged(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Loan Provider */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loan Provider
                  </label>
                  <input
                    type="text"
                    placeholder="Enter loan provider name"
                    value={loanProvider}
                    onChange={(e) => setLoanProvider(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Loan Provided */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loan Provided
                  </label>
                  <input
                    type="text"
                    placeholder="Enter loan details"
                    value={loan}
                    onChange={(e) => setLoan(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Approval Status
                </label>

                <div className="space-y-3">
                  {approvalStatus.map((approval, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      {/* Authority + Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="e.g., RERA, Local Authority"
                          value={approval.authority}
                          onChange={(e) => {
                            const updated = [...approvalStatus];
                            updated[idx].authority = e.target.value;
                            setApprovalStatus(updated);
                          }}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />

                        <select
                          value={approval.status}
                          onChange={(e) => {
                            const updated = [...approvalStatus];
                            updated[idx].status = e.target.value;
                            setApprovalStatus(updated);
                          }}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        >
                          <option value="">Select status</option>
                          <option value="Approved">Approved</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() =>
                          setApprovalStatus(approvalStatus.filter((_, i) => i !== idx))
                        }
                        className="mt-1 text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setApprovalStatus([...approvalStatus, { authority: "", status: "" }])
                    }
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    + Add More
                  </button>
                </div>
              </div>
            </div>

            {/* Price Details Section */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="text-base font-semibold mb-3 text-slate-800 flex items-center">
                <FaCog className="mr-1 text-green-600 h-4 w-4" />
                Price Details
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className={`flex-1 ${isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                  } text-white py-2 px-3 rounded-lg transition-all duration-200 font-medium`}
              >
                {isSaving ? "Saving..." : "Save Project"}
              </button>
              <button
                onClick={() => {
                  updateUnit(selectedUnit.id, 'propertyFeatures', propertyFeatures);
                  updateUnit(selectedUnit.id, 'areaDetails', areaDetails);
                  updateUnit(selectedUnit.id, 'priceDetails', priceDetails);
                  updateUnit(selectedUnit.id, 'broker', broker);
                  updateUnit(selectedUnit.id, 'purchaser', purchaser);
                  updateUnit(selectedUnit.id, 'constructor', constructor);
                  updateUnit(selectedUnit.id, 'staffEngaged', staffEngaged);
                  updateUnit(selectedUnit.id, 'loanProvider', loanProvider);
                  updateUnit(selectedUnit.id, 'loan', loan);
                  updateUnit(selectedUnit.id, 'facilities', facilities);
                  updateUnit(selectedUnit.id, 'approvalStatus', approvalStatus);

                  const isComplete = !!(
                    priceDetails.expectedPrice &&
                    areaDetails.carpetArea &&
                    purchaser &&
                    constructor
                  );

                  updateUnit(selectedUnit.id, 'isComplete', isComplete);

                  alert("Unit updated successfully!");
                }}
                disabled={isSaving}
                className={`flex-1 ${isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white py-2 px-3 rounded-lg transition-all duration-200 font-medium`}
              >
                {isSaving ? "Updating..." : "Update Unit"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaBuilding className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Select a Unit
            </h3>
            <p className="text-slate-500 mb-3 text-sm">
              Click on a unit from the list to view and edit information
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {units.slice(0, 3).map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => handleUnitClick(unit)}
                  className={`px-2 py-1 rounded font-medium text-sm transition-colors ${unit.isComplete
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    }`}
                >
                  {unit.name} ({unit.roomType})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="lg:col-span-3 flex justify-between items-center pt-2">
        <button
          onClick={() => setActiveTab("blocks")}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded transition-all duration-200 font-medium flex items-center"
        >
          <FaChevronLeft className="mr-1 h-3 w-3" />
          Back to Blocks
        </button>
        <button
          onClick={handleSaveProject}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded transition-all duration-200 font-medium flex items-center"
        >
          <FaSave className="mr-1 h-3 w-3" />
          Save Project
        </button>
      </div>
    </div>
  );

  // Main render with tab navigation
  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 p-2 md:p-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Navigation Tabs */}
        <NavigationTabs />

        {/* Content based on active tab */}
        {activeTab === "project-info" && renderProjectInfo()}
        {activeTab === "blocks" && renderBlocks()}
        {activeTab === "units" && renderUnits()}

        {/* Footer Actions */}
        <div className="sticky bottom-2 bg-white/90 backdrop-blur-xl p-2 rounded-lg border border-white/50 shadow ring-1 ring-black/5 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{units.length}</span> units <span className="mx-0.5">•</span>
                <span className="font-semibold text-slate-700">{blocks.reduce((sum, b) => sum + (b.capacity || 0), 0)}</span> capacity
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={handleSaveProject}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded transition-all duration-200 font-medium text-xs shadow-sm"
              >
                Save Draft
              </button>
              <button
                onClick={handleSaveProject}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-all duration-200 font-medium text-xs shadow"
              >
                Complete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentProject;