import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";

import {
    FaSpinner,
    FaList,
    FaHome,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaInfoCircle,
    FaCheck,
    FaCheckCircle,
    FaArrowRight,
    FaEdit,
    FaTimes,
    FaMoneyBill,
    FaPlus,
    FaBolt,
    FaCogs,
    FaBuilding,
    FaLayerGroup,
    FaHandshake,
    FaUserTie,
    FaUsers,
    FaKey,
    FaStamp,
    FaHardHat,
    FaTools,
    FaMoneyCheckAlt,
    FaHandHoldingUsd,
    FaShieldAlt,
    FaCalendarAlt,
    FaCompass,
    FaRulerCombined,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export const MainInfoSection = ({
    mainInfo,
    setMainInfo,
    onSave,
    unitPrefix,
    setUnitPrefix,
    numUnits,
    setNumUnits,
    facilities,
    setFacilities,
    customFacilities,
    setCustomFacilities,
    projectType,
    PROJECT_TYPES,
    projectName,
    units,
    setUnits,
    onUnitClick,
    selectedUnit,
    showSpecifications,
    setShowSpecifications,
    setSelectedUnit,
    checkUnitCompletion,
    projectId,
    onContinueToFloors,
    isEditMode = false,
    selectedProject = null,
    onDeleteUnit,
    FACILITIES = [],
    FACING_OPTIONS = [],
    BROKER_LIST = [],
    INITIAL_MAIN_INFO = {},
    INITIAL_FLOOR_DETAILS = {},
    INITIAL_PROPERTY_FEATURES = {},
    INITIAL_AREA_DETAILS = {},
    INITIAL_APPROVAL_STATUS = [],
    INITIAL_TRANSACTION_TYPE = {},
    INITIAL_PRICE_DETAILS = {},
}) => {
    const { token: authToken } = useAuth();
    const [newFacility, setNewFacility] = useState("");
    const [broker, setBroker] = useState("");
    const [purchaser, setPurchaser] = useState("");
    const [contractor, setContractor] = useState("");
    const [staffEngaged, setStaffEngaged] = useState("");
    const [loanProvider, setLoanProvider] = useState("");
    const [possessionStatus, setPossessionStatus] = useState("");
    const [showCustomPossession, setShowCustomPossession] = useState(false);
    const [availableFromMonth, setAvailableFromMonth] = useState("");
    const [availableFromYear, setAvailableFromYear] = useState("");
    const [contractorWorkType, setContractorWorkType] = useState("");
    const [startSerialNo, setStartSerialNo] = useState("");
    const [propertyFeatures, setPropertyFeatures] = useState({
        openSides: "",
    });
    const [approvalStatus, setApprovalStatus] = useState([
        { authority: "", status: "" },
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);


    const [brokerListState, setBrokerListState] = useState([]);
    const [contractorList, setContractorsList] = useState([]);

    const [loadingBrokers, setLoadingBrokers] = useState(false);
    const [loadingContractors, setLoadingContractors] = useState(false);


  useEffect(() => {
    if (!authToken) return;
    const fetchBrokers = async () => {
      try {
        setLoadingBrokers(true);
        const response = await axios.get(
          `https://csaapnodeapi.csaap.com/api/tenant/broker`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setBrokerListState(response.data?.data || response.data || []);
      } catch (error) {
        console.error("Failed to fetch brokers:", error);
      } finally {
        setLoadingBrokers(false);
      }
    };

    const fetchContractors = async () => {
      try {
        setLoadingContractors(true);
        const response = await axios.get(
          `https://csaapnodeapi.csaap.com/api/tenant/contractors`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setContractorsList(response.data?.contractors || response.data || []);
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
      } finally {
        setLoadingContractors(false);
      }
    };

    fetchBrokers();
    fetchContractors();
  }, [authToken]);




    useEffect(() => {
        console.log('ðŸ”¥ MainInfoSection received units:', units, 'Length:', units?.length);
        if (selectedUnit) {
            setBroker(selectedUnit.broker_id?.toString() || "");
            setPurchaser(selectedUnit.purchaser || "");
            setContractor(selectedUnit.contractor || "");
            setStaffEngaged(selectedUnit.staff_engaged || "");
            const status = selectedUnit.possession_status || "";
            setPossessionStatus(status);
            const standardStatuses = ["Ready to Move", "Under Construction", "1 Month", "3 Months", "6 Months"];
            setShowCustomPossession(status !== "" && !standardStatuses.includes(status));
            setAvailableFromMonth(selectedUnit.transaction_type?.availableFrom?.month || "");
            setAvailableFromYear(selectedUnit.transaction_type?.availableFrom?.year || "");
            setContractorWorkType(selectedUnit.contractor_work_type || "");
            setPropertyFeatures(prev => ({
                ...prev,
                openSides: selectedUnit.open_sides?.toString() || "",
            }));
            const validApprovalStatus = Array.isArray(selectedUnit.approval_status) && selectedUnit.approval_status.length > 0
                ? selectedUnit.approval_status
                : [{ authority: "", status: "" }];
            setApprovalStatus(validApprovalStatus);
        } else {
            setBroker("");
            setPurchaser("");
            setContractor("");
            setStaffEngaged("");
            setLoanProvider("");
            setPossessionStatus("");
            setShowCustomPossession(false);
            setAvailableFromMonth("");
            setAvailableFromYear("");
            setContractorWorkType("");
            setPropertyFeatures({ openSides: "" });
            setApprovalStatus([{ authority: "", status: "" }]);
        }
    }, [selectedUnit]);

    const getRoomType = (unitData) => {
        const bedrooms = unitData.propertyFeatures?.bedrooms || 2;
        switch (bedrooms) {
            case 1: return "1BHK";
            case 2: return "2BHK";
            case 3: return "3BHK";
            case 4: return "4BHK";
            default: return `${bedrooms}BHK`;
        }
    };

    const EditableArea = ({ unit }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [areaValue, setAreaValue] = useState(unit.areaDetails?.carpetArea || "");

        const handleSave = () => {
            if (areaValue !== unit.areaDetails?.carpetArea) {
                const updatedUnits = units.map((u) => {
                    if (u.id === unit.id) {
                        return {
                            ...u,
                            areaDetails: { ...u.areaDetails, carpetArea: areaValue },
                        };
                    }
                    return u;
                });
                setUnits(updatedUnits);
            }
            setIsEditing(false);
        };

        const handleCancel = () => {
            setAreaValue(unit.areaDetails?.carpetArea || "");
            setIsEditing(false);
        };

        if (isEditing) {
            return (
                <div className="flex items-center gap-1.5">
                    <input
                        type="number"
                        value={areaValue}
                        onChange={(e) => setAreaValue(e.target.value)}
                        className="w-16 p-1 text-xs font-semibold border border-indigo-200 rounded-md focus:border-indigo-500 outline-none bg-white"
                        onKeyPress={(e) => e.key === "Enter" && handleSave()}
                    />
                    <button onClick={handleSave} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-all">
                        <FaCheck size={10} />
                    </button>
                    <button onClick={handleCancel} className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-all">
                        <FaTimes size={10} />
                    </button>
                </div>
            );
        }

        return (
            <div className={`flex items-center gap-1 group transition-all`}>
                <span className="text-xs text-slate-500 font-medium">Area:</span>
                <span className="text-sm font-bold text-slate-800">{unit.areaDetails?.carpetArea || "-"}</span>
                <span className="text-xs text-slate-400 font-medium">sqft</span>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-50 p-0.5 rounded"
                >
                    <FaEdit size={10} />
                </button>
            </div>
        );
    };

    const EditableUnitName = ({ unit }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [nameValue, setNameValue] = useState(unit.name || "");

        useEffect(() => {
            setNameValue(unit.name || "");
        }, [unit.name]);

        const handleSave = (e) => {
            if (e) e.stopPropagation();
            if (nameValue.trim() && nameValue !== unit.name) {
                const updatedUnits = units.map((u) => {
                    if (u.id === unit.id) {
                        return {
                            ...u,
                            name: nameValue,
                        };
                    }
                    return u;
                });
                setUnits(updatedUnits);
                if (selectedUnit && selectedUnit.id === unit.id) {
                    setSelectedUnit({ ...selectedUnit, name: nameValue });
                }
            }
            setIsEditing(false);
        };

        const handleCancel = (e) => {
            if (e) e.stopPropagation();
            setNameValue(unit.name || "");
            setIsEditing(false);
        };

        if (isEditing) {
            return (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="p-1 text-xs font-semibold border border-indigo-200 rounded-md focus:border-indigo-500 outline-none bg-white w-28"
                        onKeyPress={(e) => e.key === "Enter" && handleSave(e)}
                        autoFocus
                    />
                    <button onClick={handleSave} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-all">
                        <FaCheck size={10} />
                    </button>
                    <button onClick={handleCancel} className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-all">
                        <FaTimes size={10} />
                    </button>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5">
                <h5 className="text-sm font-bold text-slate-800">{unit.name}</h5>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-50 p-0.5 rounded"
                >
                    <FaEdit size={10} />
                </button>
            </div>
        );
    };


    const handleApprovalChange = (index, field, value) => {
        const updatedApprovals = [...approvalStatus];
        updatedApprovals[index][field] = value;
        setApprovalStatus(updatedApprovals);
        if (selectedUnit) {
            const updatedUnits = units.map(u =>
                u.id === selectedUnit.id ? { ...u, approval_status: updatedApprovals } : u
            );
            setUnits(updatedUnits);
        } else if (units.length > 0) {
            const updatedUnits = units.map(u => ({ ...u, approval_status: updatedApprovals }));
            setUnits(updatedUnits);
        }
    };

    const addApprovalAuthority = () => {
        const updatedApprovals = [...approvalStatus, { authority: "", status: "" }];
        setApprovalStatus(updatedApprovals);
        if (selectedUnit) {
            const updatedUnits = units.map(u =>
                u.id === selectedUnit.id ? { ...u, approval_status: updatedApprovals } : u
            );
            setUnits(updatedUnits);
        } else if (units.length > 0) {
            const updatedUnits = units.map(u => ({ ...u, approval_status: updatedApprovals }));
            setUnits(updatedUnits);
        }
    };

    const removeApprovalAuthority = (index) => {
        const updatedApprovals = approvalStatus.filter((_, i) => i !== index);
        setApprovalStatus(updatedApprovals);
        if (selectedUnit) {
            const updatedUnits = units.map(u =>
                u.id === selectedUnit.id ? { ...u, approval_status: updatedApprovals } : u
            );
            setUnits(updatedUnits);
        } else if (units.length > 0) {
            const updatedUnits = units.map(u => ({ ...u, approval_status: updatedApprovals }));
            setUnits(updatedUnits);
        }
    };

    const handleFacilityToggle = (facilityKey) => {
        setFacilities((prev) => ({
            ...prev,
            [facilityKey]: !prev[facilityKey],
        }));
    };

    const handleInputChange = (field, value) => {
        setMainInfo((prev) => {
            const updated = { ...prev, [field]: value };
            const ground = parseFloat(updated.groundFloorArea) || 0;
            const first = parseFloat(updated.firstFloorArea) || 0;
            const second = parseFloat(updated.secondFloorArea) || 0;
            const staircase = parseFloat(updated.staircaseArea) || 0;
            updated.totalBuiltUpArea = ground + first + second + staircase;
            return updated;
        });
    };

    const addCustomFacility = () => {
        if (newFacility.trim() && !customFacilities.includes(newFacility.trim())) {
            setCustomFacilities([...customFacilities, newFacility.trim()]);
            setNewFacility("");
        }
    };

    const removeCustomFacility = (facility) => {
        setCustomFacilities(customFacilities.filter((f) => f !== facility));
    };

    const generateUnits = async () => {
        if (numUnits <= 0 || !unitPrefix.trim()) return;

        setIsSaving(true);
        try {
            const newUnits = [];
            const currentMaxId = units.length > 0 ? Math.max(...units.map((u) => u.id)) : 0;

            for (let i = 0; i < numUnits; i++) {
                const serialNo = startSerialNo + i;
                const paddedNumber = String(serialNo).padStart(3, '0');
                const unitName = `${unitPrefix}-${paddedNumber}`;
                const unitId = currentMaxId + i + 1;

                const unitData = {
                    id: unitId,
                    name: unitName,
                    mainInfo: { ...INITIAL_MAIN_INFO },
                    floors: {
                        groundFloor: { ...INITIAL_FLOOR_DETAILS },
                        firstFloor: { ...INITIAL_FLOOR_DETAILS },
                        ...(projectType === PROJECT_TYPES.TRIPLEX && {
                            secondFloor: { ...INITIAL_FLOOR_DETAILS },
                        }),
                    },
                    propertyFeatures: {
                        bedrooms: projectType === PROJECT_TYPES.DUPLEX || projectType === PROJECT_TYPES.TRIPLEX ? 2 : 1,
                        bathrooms: projectType === PROJECT_TYPES.DUPLEX || projectType === PROJECT_TYPES.TRIPLEX ? 2 : 1,
                        balconies: 1,
                        parking: 1,
                    },
                    area_details: {
                        ...INITIAL_AREA_DETAILS,
                        carpet_area: projectType === PROJECT_TYPES.DUPLEX ? "1200" : projectType === PROJECT_TYPES.TRIPLEX ? "1500" : "1000",
                    },
                    approval_status: approvalStatus && approvalStatus.length > 0 && (approvalStatus[0].authority || approvalStatus[0].status) ? approvalStatus : [{ authority: "", status: "" }],
                    transaction_type: { possessionStatus: possessionStatus, availableFrom: { month: availableFromMonth, year: availableFromYear } },
                    priceDetails: { expectedPrice: "", tokenAmount: "", priceNegotiable: false },
                    broker_id: broker,
                    purchaser: purchaser,
                    contractor: contractor,
                    contractor_work_type: contractorWorkType,
                    staff_engaged: staffEngaged,
                    loan_provider: loanProvider,
                    possession_status: possessionStatus,
                    open_sides: propertyFeatures.openSides,
                    isComplete: false,
                };

                const localUnit = {
                    ...unitData,
                    id: unitId,
                    name: unitName,
                    unit_prefix: unitPrefix || "UNIT",
                    block_name: "Block A",
                    room_type: getRoomType(unitData),
                    floor_name: "Ground Floor",
                    facing: unitData.mainInfo?.facing || "North",
                    individual_boundary: unitData.mainInfo?.individualBoundary || false,
                    land_area: parseFloat(unitData.mainInfo?.landArea) || 0,
                    property_features: {
                        bedrooms: unitData.propertyFeatures?.bedrooms || 2,
                        bathrooms: unitData.propertyFeatures?.bathrooms || 2,
                        parking: unitData.propertyFeatures?.parking || 1,
                        balconies: unitData.propertyFeatures?.balconies || 1,
                    },
                    area_details: {
                        carpet_area: parseFloat(unitData.areaDetails?.carpetArea) || 0,
                        built_up_area: parseFloat(unitData.mainInfo?.totalBuiltUpArea) || 0,
                        plot_area: parseFloat(unitData.mainInfo?.landArea) || 0,
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                newUnits.push(localUnit);
            }

            setUnits((prev) => [...prev, ...newUnits]);
            setUnitPrefix("");
            setNumUnits("");
            setSuccess(`Generated ${numUnits} units successfully.`);
        } catch (error) {
            setError(`Failed to create units.`);
        } finally {
            setIsSaving(false);
        }
    };

    const hasFloorDetails = (unit) => {
        return (
            unit.floors &&
            (unit.floors.groundFloor?.totalBedrooms ||
                unit.floors.firstFloor?.totalBedrooms ||
                (unit.floors.secondFloor && unit.floors.secondFloor.totalBedrooms))
        );
    };

    return (
        <div className="bg-linear-to-br from-slate-50 to-white rounded-2xl border border-slate-200 overflow-hidden">



            <div className="p-2 space-y-2">

                <AnimatePresence mode="wait">
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="p-3 bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 border border-emerald-200"
                        >
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                                <FaCheckCircle size={12} />
                            </div>
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>


                {selectedUnit && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-linear-to-r from-white to-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full " />
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow">
                                <FaBuilding size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-slate-900">{selectedUnit.name}</h3>
                                    <span className="bg-linear-to-r from-indigo-50 to-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-indigo-200">
                                        Active
                                    </span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${hasFloorDetails(selectedUnit) ? "bg-emerald-500" : "bg-slate-300"}`} />
                                        <span className="text-xs font-medium text-slate-600">Floor Layout</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${selectedUnit.isComplete ? "bg-emerald-500" : "bg-slate-300"}`} />
                                        <span className="text-xs font-medium text-slate-600">Unit Core</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const updatedUnits = units.map(u => u.id === selectedUnit.id ? { ...u, isComplete: !u.isComplete } : u);
                                setUnits(updatedUnits);
                            }}
                            className={`mt-3 md:mt-0 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${selectedUnit.isComplete
                                ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600"
                                : "bg-linear-to-r from-slate-900 to-black text-white border-slate-900"}`}
                        >
                            {selectedUnit.isComplete ? "âœ“ Verified" : "Mark Ready"}
                        </button>
                    </motion.div>
                )}


                <div className="bg-white p-6 rounded-xl border border-slate-300 space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-linear-to-b from-indigo-500 to-indigo-600 rounded-full" />
                        <h4 className="text-lg font-bold text-slate-900">Parameter Matrix</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Facing Direction", key: "facing", type: "select", options: FACING_OPTIONS },
                            { label: "Total Land Area", key: "landArea", type: "number", suffix: "sqft" },
                            { label: "Ground Floor Area", key: "groundFloorArea", type: "number", suffix: "sqft" },
                            { label: "First Floor Area", key: "firstFloorArea", type: "number", suffix: "sqft" },
                            { label: "Second Floor Area", key: "secondFloorArea", type: "number", suffix: "sqft" },
                            { label: "Staircase Area", key: "staircaseArea", type: "number", suffix: "sqft" },
                            { label: "Total Built-up Area", key: "totalBuiltUpArea", type: "number", suffix: "sqft", disabled: true },
                        ].map((field) => (
                            <div key={field.key} className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{field.label}</label>
                                {field.type === "select" ? (
                                    <select
                                        value={mainInfo[field.key]}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 cursor-pointer"
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={mainInfo[field.key] || ""}
                                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                                            disabled={field.disabled}
                                            className={`w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 ${field.disabled ? "bg-slate-50 text-slate-500" : ""}`}
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                        {field.suffix && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                                {field.suffix}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}


                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Individual Boundary</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleInputChange("individualBoundary", true)}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${mainInfo.individualBoundary === true
                                        ? "bg-linear-to-r from-emerald-500 to-emerald-600 border-emerald-600 text-white"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"}`}
                                >
                                    ✓ Yes
                                </button>
                                <button
                                    onClick={() => handleInputChange("individualBoundary", false)}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${mainInfo.individualBoundary === false
                                        ? "bg-linear-to-r from-rose-500 to-rose-600 border-rose-600 text-white"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-rose-300"}`}
                                >
                                    ✕ No
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-4">

                        <div className="bg-white p-6 rounded-xl border border-slate-300 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-4 bg-linear-to-b from-indigo-500 to-indigo-600 rounded-full" />
                                <h4 className="text-lg font-bold text-slate-900">Unit Configuration</h4>
                            </div>
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <FaList size={11} className="text-indigo-500" />
                                            Total Units
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={numUnits}
                                            onChange={(e) => setNumUnits(e.target.value === "" ? "" : parseInt(e.target.value))}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-all text-sm font-semibold text-slate-800"
                                            placeholder="Enter units"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <FaList size={11} className="text-indigo-500" />
                                            Start Serial No
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={startSerialNo}
                                            onChange={(e) => setStartSerialNo(e.target.value === "" ? "" : parseInt(e.target.value))}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-all text-sm font-semibold text-slate-800"
                                            placeholder="e.g. 1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <FaEdit size={11} className="text-indigo-500" />
                                            Unit Prefix
                                        </label>
                                        <input
                                            type="text"
                                            value={unitPrefix}
                                            onChange={(e) => setUnitPrefix(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-all text-sm font-semibold text-slate-800"
                                            placeholder="E.g. UNIT"
                                        />
                                    </div>
                                </div>
                                {isEditMode && units.length > 0 ? (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-xs font-semibold text-blue-700 flex items-center gap-2">
                                            <FaCheckCircle size={12} />
                                            {units.length} units already created
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">Click on units below to edit them individually</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={generateUnits}
                                        disabled={isSaving || !unitPrefix.trim()}
                                        className="mt-4 w-full py-3 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? <FaSpinner className="animate-spin" size={12} /> : <FaPlus size={12} />}
                                        Generate {numUnits} Units
                                    </button>
                                )}
                            </div>
                        </div>


                        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-4 bg-linear-to-b from-amber-400 to-amber-500 rounded-full" />
                                <h4 className="text-lg font-bold text-slate-900">Amenities & Provisions</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {FACILITIES.map((facility) => (
                                        <button
                                            key={facility.key}
                                            onClick={() => handleFacilityToggle(facility.key)}
                                            className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider text-center transition-all ${facilities[facility.key]
                                                ? "bg-linear-to-br from-slate-900 to-black border-slate-900 text-white"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"}`}
                                        >
                                            {facility.label}
                                        </button>
                                    ))}
                                </div>


                                <div className="bg-linear-to-r from-amber-50 to-white p-4 rounded-lg border border-amber-100">
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Add Custom Facility</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newFacility}
                                            onChange={(e) => setNewFacility(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && addCustomFacility()}
                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:ring-1 focus:ring-amber-100 outline-none transition-all text-sm font-medium text-slate-700"
                                            placeholder="Custom facility..."
                                        />
                                        <button
                                            onClick={addCustomFacility}
                                            className="bg-linear-to-r from-amber-500 to-amber-600 text-white px-4 rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-sm"
                                        >
                                            <FaPlus size={10} className="inline mr-1.5" />
                                            Add
                                        </button>
                                    </div>
                                </div>


                                {customFacilities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {customFacilities.map((f, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 bg-linear-to-r from-white to-slate-50 border border-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
                                            >
                                                {f}
                                                <button
                                                    onClick={() => removeCustomFacility(f)}
                                                    className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 hover:bg-rose-50 rounded"
                                                >
                                                    <FaTimes size={10} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-linear-to-b from-indigo-400 to-indigo-500 rounded-full" />
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Unit Registry</h4>
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {units.length} Units
                            </span>
                        </div>
                        {console.log('ðŸ”¥ Unit Registry - units array:', units, 'Length:', units?.length, 'isEditMode:', isEditMode)}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 h-125 overflow-y-auto space-y-3">
                            {units.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <div className="w-16 h-16 bg-linear-to-br from-slate-100 to-white rounded-full flex items-center justify-center border border-dashed border-slate-300">
                                        <FaList size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-slate-500">No Units Created</p>
                                        <p className="text-xs text-slate-400">Generate units to start</p>
                                    </div>
                                </div>
                            ) : (
                                units.map((unit) => (
                                    <div
                                        key={unit.id}
                                        onClick={() => onUnitClick(unit)}
                                        className={`p-2 rounded-xl border cursor-pointer transition-all group ${selectedUnit?.id === unit.id
                                            ? "bg-linear-to-r from-indigo-50 to-white border-indigo-400 shadow"
                                            : "bg-white border-slate-100 hover:border-indigo-200"}`}
                                    >

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedUnit?.id === unit.id
                                                                ? "bg-linear-to-br from-indigo-500 to-indigo-600 text-white"
                                                                : "bg-slate-100 text-slate-500"
                                                                }`}
                                                        >
                                                            <FaHome size={12} />
                                                        </div>
                                                        <EditableUnitName unit={unit} />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {unit.isComplete && (
                                                            <div className="w-6 h-6 bg-linear-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200">
                                                                <FaCheckCircle size={10} />
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm(`Are you sure you want to delete unit "${unit.name}"?`)) {
                                                                    const updatedUnits = units.filter((u) => u.id !== unit.id);
                                                                    setUnits(updatedUnits);
                                                                    onDeleteUnit?.(unit.id);
                                                                    if (selectedUnit && selectedUnit.id === unit.id) {
                                                                        setSelectedUnit(null);
                                                                    }
                                                                }
                                                            }}
                                                            className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete Unit"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="border-l border-slate-100 pl-4">
                                                <EditableArea unit={unit} />
                                            </div>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>


                {selectedUnit && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-6 border-t border-slate-200 space-y-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex items-center gap-3 mb-3 md:mb-0">
                                <div className="w-1 h-5 bg-linear-to-b from-slate-900 to-black rounded-full" />
                                <h4 className="text-xl font-bold text-slate-900">Unit Specification</h4>
                            </div>
                        </div>


                        <section>
                            <div className="bg-white border border-slate-100 rounded-xl p-6">


                                <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 items-start">


                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
                                                    <FaShieldAlt size={13} />
                                                </div>
                                                <h5 className="text-sm font-bold text-slate-900">Operations &amp; Statutory</h5>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        {
                                                            label: "Open Sides",
                                                            value: propertyFeatures.openSides,
                                                            onChange: (e) => {
                                                                const val = e.target.value;
                                                                setPropertyFeatures(prev => ({ ...prev, openSides: val }));
                                                                if (selectedUnit) {
                                                                    setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, open_sides: val } : u));
                                                                } else if (units.length > 0) {
                                                                    setUnits(units.map(u => ({ ...u, open_sides: val })));
                                                                }
                                                            },
                                                            type: "select",
                                                            options: [1, 2, 3, 4].map(n => ({ id: n, label: `${n} Sides` }))
                                                        },
                                                        {
                                                            label: "Broker",
                                                            value: broker,
                                                            onChange: (e) => {
                                                                const val = e.target.value;
                                                                setBroker(val);
                                                                if (selectedUnit) {
                                                                    setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, broker_id: val } : u));
                                                                } else if (units.length > 0) {
                                                                    setUnits(units.map(u => ({ ...u, broker_id: val })));
                                                                }
                                                            },
                                                            type: "select",
                                                            options: brokerListState
                                                        },
                                                        {
                                                            label: "Staff Engaged",
                                                            value: staffEngaged,
                                                            onChange: (e) => {
                                                                const val = e.target.value;
                                                                setStaffEngaged(val);
                                                                if (selectedUnit) {
                                                                    setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, staff_engaged: val } : u));
                                                                } else if (units.length > 0) {
                                                                    setUnits(units.map(u => ({ ...u, staff_engaged: val })));
                                                                }
                                                            },
                                                            type: "text",
                                                            placeholder: "Staff name/ID"
                                                        },
                                                        {
                                                            label: "Contractor",
                                                            value: contractor,
                                                            onChange: (e) => {
                                                                const val = e.target.value;
                                                                setContractor(val);
                                                                if (selectedUnit) {
                                                                    setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, contractor: val } : u));
                                                                } else if (units.length > 0) {
                                                                    setUnits(units.map(u => ({ ...u, contractor: val })));
                                                                }
                                                            },
                                                            type: "select",
                                                            options: contractorList
                                                        },
                                                        {
                                                            label: "Work Type",
                                                            value: contractorWorkType,
                                                            onChange: (e) => {
                                                                const val = e.target.value;
                                                                setContractorWorkType(val);
                                                                if (selectedUnit) {
                                                                    setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, contractor_work_type: val } : u));
                                                                } else if (units.length > 0) {
                                                                    setUnits(units.map(u => ({ ...u, contractor_work_type: val })));
                                                                }
                                                            },
                                                            type: "select",
                                                            options: ["Civil Only", "Finishing Only", "Turnkey", "MEP Only", "Consulting"]
                                                        },
                                                        {
                                                            label: "Loan Provider",
                                                            value: loanProvider,
                                                            onChange: (e) => {
                                                                const val = e.target.value;
                                                                setLoanProvider(val);
                                                                if (selectedUnit) {
                                                                    setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, loan_provider: val } : u));
                                                                } else if (units.length > 0) {
                                                                    setUnits(units.map(u => ({ ...u, loan_provider: val })));
                                                                }
                                                            },
                                                            type: "text",
                                                            placeholder: "Loan provider"
                                                        },
                                                    ].map((field) => (
                                                        <div key={field.label} className="space-y-1">
                                                            <label className="text-xs font-semibold text-slate-600">{field.label}</label>
                                                            {field.type === "select" ? (
                                                                <select
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 cursor-pointer"
                                                                >
                                                                    <option value="">Select {field.label}</option>
                                                                    {field.options.map(opt => (
                                                                        <option key={opt?.id ?? opt} value={opt?.id ?? opt}>
                                                                            {opt?.name ?? opt?.label ?? opt}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                                                                    placeholder={field.placeholder}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>


                                        <div className="space-y-6">
                                            <div className="bg-white ">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
                                                        <FaKey size={13} />
                                                    </div>
                                                    <h5 className="text-sm font-bold text-slate-900">Transaction Details</h5>
                                                </div>

                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    {
                                                        label: "Possession Status",
                                                        value: possessionStatus,
                                                        onChange: (e) => {
                                                            const val = e.target.value;
                                                            if (val === "Other") {
                                                                setShowCustomPossession(true);
                                                                setPossessionStatus("");
                                                            } else {
                                                                setPossessionStatus(val);
                                                                if (selectedUnit) {
                                                                    setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, possession_status: val } : u));
                                                                } else if (units.length > 0) {
                                                                    setUnits(units.map(u => ({ ...u, possession_status: val })));
                                                                }
                                                            }
                                                        },
                                                        options: ["Ready to Move", "Under Construction", "1 Month", "3 Months", "6 Months", "Other"]
                                                    },
                                                    {
                                                        label: "Available Month",
                                                        value: availableFromMonth,
                                                        onChange: (e) => {
                                                            const val = e.target.value;
                                                            setAvailableFromMonth(val);
                                                            if (selectedUnit) {
                                                                setUnits(units.map(u => {
                                                                    if (u.id === selectedUnit.id) {
                                                                        const cur = u.transaction_type || { availableFrom: {} };
                                                                        return { ...u, transaction_type: { ...cur, availableFrom: { ...(cur.availableFrom || {}), month: val } } };
                                                                    }
                                                                    return u;
                                                                }));
                                                            }
                                                        },
                                                        options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                                                    },
                                                    {
                                                        label: "Available Year",
                                                        value: availableFromYear,
                                                        onChange: (e) => {
                                                            const val = e.target.value;
                                                            setAvailableFromYear(val);
                                                            if (selectedUnit) {
                                                                setUnits(units.map(u => {
                                                                    if (u.id === selectedUnit.id) {
                                                                        const cur = u.transaction_type || { availableFrom: {} };
                                                                        return { ...u, transaction_type: { ...cur, availableFrom: { ...(cur.availableFrom || {}), year: val } } };
                                                                    }
                                                                    return u;
                                                                }));
                                                            }
                                                        },
                                                        options: Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i)
                                                    },
                                                ].map((field) => (
                                                    <div key={field.label} className="space-y-1">
                                                        <label className="text-xs font-semibold text-slate-600">{field.label}</label>
                                                        {field.label === "Possession Status" && showCustomPossession ? (
                                                            <div className="flex gap-1.5">
                                                                <input
                                                                    type="text"
                                                                    value={possessionStatus}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setPossessionStatus(val);
                                                                        if (selectedUnit) {
                                                                            setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, possession_status: val } : u));
                                                                        } else if (units.length > 0) {
                                                                            setUnits(units.map(u => ({ ...u, possession_status: val })));
                                                                        }
                                                                    }}
                                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                                                                    placeholder="Possession status..."
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setShowCustomPossession(false);
                                                                        setPossessionStatus("");
                                                                        if (selectedUnit) {
                                                                            setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, possession_status: "" } : u));
                                                                        }
                                                                    }}
                                                                    className="px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-all"
                                                                >
                                                                    Reset
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 cursor-pointer"
                                                            >
                                                                <option value="">Select {field.label}</option>
                                                                {field.options.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-amber-400">
                                                <FaMoneyBill size={13} />
                                            </div>
                                            <h5 className="text-sm font-bold text-slate-900">Price Details</h5>
                                        </div>
                                        <div className="bg-linear-to-br from-slate-900 to-black rounded-xl p-5 text-white flex-1">
                                            <div className="space-y-4">
                                                {[
                                                    { label: "Expected Price", key: "expectedPrice" },
                                                    { label: "Booking Amount", key: "tokenAmount" },
                                                ].map((field) => (
                                                    <div key={field.key} className="space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{field.label}</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">&#8377;</span>
                                                            <input
                                                                type="number"
                                                                value={mainInfo[field.key] || ""}
                                                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2.5 focus:border-amber-400/50 outline-none text-sm font-bold text-white placeholder:text-white/20"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="pt-2">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer select-none"
                                                        onClick={() => handleInputChange("priceNegotiable", !mainInfo.priceNegotiable)}
                                                    >
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${mainInfo.priceNegotiable ? "bg-emerald-500 border-emerald-500" : "border-slate-500"
                                                            }`}>
                                                            {mainInfo.priceNegotiable && <span className="text-white text-xs font-bold">&#10003;</span>}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                            Price Negotiable
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>


                                <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-linear-to-br from-slate-50 to-white rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
                                                <FaStamp size={14} />
                                            </div>
                                            <h5 className="text-md font-bold text-slate-900">Approval Status Matrix</h5>
                                        </div>
                                        <button
                                            onClick={addApprovalAuthority}
                                            className="bg-linear-to-r from-slate-900 to-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-sm"
                                        >
                                            <FaPlus size={10} className="inline mr-1.5" />
                                            Add Authority
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {approvalStatus.map((approval, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-linear-to-r from-slate-50 to-white rounded-lg border border-slate-200 group relative"
                                            >
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-slate-900">Approval Authority</label>
                                                    <input
                                                        type="text"
                                                        value={approval.authority}
                                                        onChange={(e) => handleApprovalChange(index, "authority", e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none text-sm font-bold text-slate-800"
                                                        placeholder="e.g. BBMP, BDA"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-slate-900">Current Status</label>
                                                    <select
                                                        value={approval.status}
                                                        onChange={(e) => handleApprovalChange(index, "status", e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800 cursor-pointer"
                                                    >
                                                        <option value="">Select Status</option>
                                                        {["Applied", "Under Review", "Approved", "Rejected", "Pending Docs"].map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => removeApprovalAuthority(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-white text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 shadow border border-slate-200 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <FaTimes size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </section>

                        <div>
                            <button
                                onClick={onContinueToFloors}
                                className="px-8 py-3 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:shadow-sm"
                            >
                                Proceed to Next
                                <FaArrowRight size={10} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
