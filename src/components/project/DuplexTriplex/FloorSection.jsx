import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaHome,
    FaCheckCircle,
    FaExclamationTriangle,
    FaSave,
    FaArrowRight,
    FaInfoCircle,
    FaDraftingCompass,
    FaRulerCombined,
    FaCog,
    FaSpinner,
    FaBed,
    FaBath,
    FaBook,
    FaCube,
    FaWarehouse,
    FaPen,
    FaShapes,
    FaTimesCircle
} from "react-icons/fa";

export const FloorSection = ({
    floorData,
    setFloorData,
    floorName,
    selectedUnit,
    floorKey,
    onNext,
    isLastFloor = false,
}) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleInputChange = (field, value) => {
        setFloorData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleArrayInputChange = (field, index, value) => {
        setFloorData((prev) => {
            const currentArray = prev[field] || [];
            const newArray = [...currentArray];
            newArray[index] = value;
            return {
                ...prev,
                [field]: newArray,
            };
        });
    };

    const handleSave = () => {
        setLoading(true);
        setMessage(null);

        setTimeout(() => {
            setMessage({
                type: "success",
                text: isLastFloor
                    ? "🎯 Unit node fully synchronized with master registry."
                    : `✅ ${floorName} architectural specifications updated successfully.`,
            });

            setLoading(false);

            // Always proceed to next step or save
            if (typeof onNext === "function") {
                // For last floor, onNext is the actual save handler from parent
                // We can wait a tiny bit to let the local success message show
                setTimeout(() => {
                    onNext();
                }, 500);
            }
        }, 800);
    };

    const getFloorIcon = () => {
        switch (floorName) {
            case "Ground Floor":
                return <FaCube className="text-white" />;
            case "First Floor":
                return <FaShapes className="text-white" />;
            case "Second Floor":
                return <FaCube className="text-white" />;
            default:
                return <FaDraftingCompass className="text-white" />;
        }
    };

    const getFloorColor = () => {
        switch (floorName) {
            case "Ground Floor":
                return "from-emerald-500 to-emerald-600";
            case "First Floor":
                return "from-blue-500 to-blue-600";
            case "Second Floor":
                return "from-purple-500 to-purple-600";
            default:
                return "from-indigo-500 to-indigo-600";
        }
    };

    const renderDynamicFields = (count, label, icon, arrayKey) => {
        const numCount = parseInt(count) || 0;
        if (numCount === 0) return null;

        return (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="col-span-1 sm:col-span-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-3 mt-1 mb-2"
            >
                
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        {icon}
                        {label} Area Specifications
                    </label>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                        {numCount} {numCount === 1 ? 'Unit' : 'Units'} Defined
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {Array.from({ length: numCount }).map((_, index) => (
                        <div key={index} className="relative group">
                            <div className="absolute -top-2 left-2 px-1.5 bg-white text-[9px] font-bold text-slate-400 z-10 rounded-sm border border-slate-100 group-focus-within:text-indigo-500 group-focus-within:border-indigo-200 transition-colors">
                                {label} {index + 1}
                            </div>
                            <input
                                type="number"
                                value={(floorData[arrayKey] && floorData[arrayKey][index]) || ""}
                                onChange={(e) => handleArrayInputChange(arrayKey, index, e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-all text-sm font-semibold text-slate-800 placeholder:text-slate-300 shadow-sm"
                                placeholder="0.00"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                SQFT
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="bg-linear-to-br from-slate-50 to-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            {/* Header */}
            <div className="px-5 py-3 bg-linear-to-r from-white to-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-linear-to-br ${getFloorColor()} rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:rotate-6 duration-500`}>
                        {getFloorIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{floorName} Architectural Node</h3>
                        <p className="text-slate-500 text-xs font-medium tracking-wide mt-0.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-linear-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse" />
                            Structural and spatial configuration matrix
                        </p>
                    </div>
                </div>
                {selectedUnit && (
                    <div className="flex items-center gap-2 bg-linear-to-r from-indigo-50 to-white border border-indigo-100 pl-3 pr-2 py-1 rounded-full shadow-sm">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">Edited Unit:</span>
                        <div className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-md">
                            {selectedUnit.name}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Success/Error Message */}
                <AnimatePresence mode="wait">
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border shadow-md ${message.type === "success"
                                ? "bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-linear-to-r from-rose-50 to-rose-100 text-rose-800 border-rose-200"
                                }`}
                        >
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                {message.type === "success" ?
                                    <FaCheckCircle className="text-emerald-500 text-sm" /> :
                                    <FaExclamationTriangle className="text-rose-500 text-sm" />
                                }
                            </div>
                            <div className="flex-1">{message.text}</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!selectedUnit ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-16 bg-linear-to-br from-white to-slate-50 border-2 border-slate-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="w-16 h-16 bg-linear-to-br from-slate-100 to-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-300 shadow-lg">
                            <FaHome size={28} />
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h4 className="text-base font-bold text-slate-800 tracking-tight">Instance Binding Required</h4>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Please select a target unit from the registry to initialize architectural mapping.
                                All spatial configurations will be applied to the selected unit.
                            </p>
                        </div>
                        <div className="w-32 h-1 bg-linear-to-r from-transparent via-indigo-200 to-transparent rounded-full" />
                    </motion.div>
                ) : (
                    <>
                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                            {/* Volumetric Matrix Card */}
                            <section className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-md">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-9 h-9 bg-linear-to-br from-slate-50 to-white rounded-lg flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm">
                                        <FaRulerCombined size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-slate-900">Volumetric Matrix</h4>
                                        <p className="text-slate-500 text-xs font-medium">Spatial dimensions and room configurations</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Count Fields */}
                                    {[
                                        { label: "Bedroom Count", key: "totalBedrooms", icon: <FaBed className="text-blue-500" />, areaKey: "bedroomAreas", areaLabel: "Bedroom" },
                                        { label: "Bathroom Count", key: "totalBathrooms", icon: <FaBath className="text-emerald-500" />, areaKey: "bathroomAreas", areaLabel: "Bathroom" },
                                        { label: "Study Room Count", key: "studyRoom", icon: <FaBook className="text-amber-500" />, areaKey: "studyRoomAreas", areaLabel: "Study Room" },
                                        { label: "Balcony Count", key: "balcony", icon: <FaCube className="text-purple-500" />, areaKey: "balconyAreas", areaLabel: "Balcony" },
                                    ].map((item) => (
                                        <React.Fragment key={item.key}>
                                            <motion.div
                                                whileHover={{ y: -2 }}
                                                className="space-y-2"
                                            >
                                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    {item.icon}
                                                    {item.label}
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={floorData[item.key] || ""}
                                                        onChange={(e) => handleInputChange(item.key, e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-all text-sm font-semibold text-slate-800 placeholder:text-slate-300"
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                                        Units
                                                    </span>
                                                </div>
                                            </motion.div>
                                            
                                            {/* Area Fields for this specific count */}
                                            {renderDynamicFields(
                                                floorData[item.key],
                                                item.areaLabel,
                                                item.icon,
                                                item.areaKey
                                            )}
                                        </React.Fragment>
                                    ))}

                                    {/* Other Area Fields */}
                                    {[
                                        { label: "Living Area", key: "livingArea", icon: <FaHome className="text-rose-500" />, unit: "SQFT" },
                                        { label: "Dining Area", key: "diningArea", icon: <FaRulerCombined className="text-indigo-500" />, unit: "SQFT" },
                                    ].map((item) => (
                                        <motion.div
                                            key={item.key}
                                            whileHover={{ y: -2 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                {item.icon}
                                                {item.label}
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    value={floorData[item.key] || ""}
                                                    onChange={(e) => handleInputChange(item.key, e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-all text-sm font-semibold text-slate-800 placeholder:text-slate-300"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                                    {item.unit}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Core Provisions Card */}
                            <section className="space-y-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 bg-linear-to-br from-slate-50 to-white rounded-lg flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm">
                                            <FaCog size={14} />
                                        </div>
                                        <div>
                                            <h5 className="text-base font-bold text-slate-900">Core Provisions</h5>
                                            <p className="text-slate-500 text-xs font-medium">Essential amenities</p>
                                        </div>
                                    </div>

                                    {/* Kitchen System & Storage Garage - Side by Side */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Kitchen System */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                                <span>Kitchen System</span>
                                                {floorData["kitchen"] === "Yes" && (
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Area Required</span>
                                                )}
                                            </label>
                                            <div className="flex gap-2">
                                                {["Yes", "No"].map((opt) => (
                                                    <div key={opt} className="flex-1">
                                                        <input
                                                            type="radio"
                                                            id={`kitchen-${opt}`}
                                                            name="kitchen"
                                                            value={opt}
                                                            checked={floorData["kitchen"] === opt}
                                                            onChange={() => handleInputChange("kitchen", opt)}
                                                            className="hidden"
                                                        />
                                                        <label
                                                            htmlFor={`kitchen-${opt}`}
                                                            className={`flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer ${floorData["kitchen"] === opt
                                                                    ? opt === "Yes"
                                                                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                                                        : "bg-rose-50 border-rose-500 text-rose-700"
                                                                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-400"
                                                                }`}
                                                        >
                                                            {opt === "Yes" ? (
                                                                <FaCheckCircle className="mr-1.5 text-emerald-500" />
                                                            ) : (
                                                                <FaTimesCircle className="mr-1.5 text-rose-500" />
                                                            )}
                                                            {opt}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Kitchen Area Input */}
                                            <AnimatePresence>
                                                {floorData["kitchen"] === "Yes" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="relative group mt-2"
                                                    >
                                                        <input
                                                            type="number"
                                                            value={floorData.kitchenArea || ""}
                                                            onChange={(e) => handleInputChange("kitchenArea", e.target.value)}
                                                            className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg pl-3 pr-8 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-50 outline-none transition-all text-sm font-semibold text-slate-800 placeholder:text-slate-300 shadow-sm"
                                                            placeholder="Kitchen Area"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-400 group-focus-within:text-emerald-500 transition-colors">
                                                            SQFT
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Storage Garage */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                                <span>Storage Garage</span>
                                                {floorData["garage"] === "Yes" && (
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Area Required</span>
                                                )}
                                            </label>
                                            <div className="flex gap-2">
                                                {["Yes", "No"].map((opt) => (
                                                    <div key={opt} className="flex-1">
                                                        <input
                                                            type="radio"
                                                            id={`garage-${opt}`}
                                                            name="garage"
                                                            value={opt}
                                                            checked={floorData["garage"] === opt}
                                                            onChange={() => handleInputChange("garage", opt)}
                                                            className="hidden"
                                                        />
                                                        <label
                                                            htmlFor={`garage-${opt}`}
                                                            className={`flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer ${floorData["garage"] === opt
                                                                    ? opt === "Yes"
                                                                        ? "bg-blue-50 border-blue-500 text-blue-700"
                                                                        : "bg-slate-100 border-slate-400 text-slate-700"
                                                                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-400"
                                                                }`}
                                                        >
                                                            {opt === "Yes" ? (
                                                                <FaWarehouse className="mr-1.5 text-blue-500" />
                                                            ) : (
                                                                <FaTimesCircle className="mr-1.5 text-slate-500" />
                                                            )}
                                                            {opt}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Garage Area Input */}
                                            <AnimatePresence>
                                                {floorData["garage"] === "Yes" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="relative group mt-2"
                                                    >
                                                        <input
                                                            type="number"
                                                            value={floorData.garageArea || ""}
                                                            onChange={(e) => handleInputChange("garageArea", e.target.value)}
                                                            className="w-full bg-blue-50/30 border border-blue-100 rounded-lg pl-3 pr-8 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-50 outline-none transition-all text-sm font-semibold text-slate-800 placeholder:text-slate-300 shadow-sm"
                                                            placeholder="Garage Area"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-blue-400 group-focus-within:text-blue-500 transition-colors">
                                                            SQFT
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Architectural Notes */}
                                    <div className="pt-3 border-t border-slate-100 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <FaPen className="text-indigo-500" />
                                            Architectural Notes
                                        </label>
                                        <textarea
                                            value={floorData.additionalNotes || ""}
                                            onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                                            rows="4"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                                            placeholder="Specify distinct architectural requirements, material specifications, or special features..."
                                        />
                                        <div className="text-xs text-slate-400 text-right">
                                            {floorData.additionalNotes?.length || 0}/500 characters
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm"
                        >
                            {/* Left: Info Section */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <FaInfoCircle className="text-indigo-600" size={20} />
                                </div>
                                <div>
                                    <div className="text-base font-semibold text-slate-900 mb-1">
                                        {isLastFloor ? "Final Review" : "Ready to Continue"}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {isLastFloor
                                            ? "Save project to database"
                                            : "Proceed to next step"
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action Button */}
                            <div className="border-l border-slate-200 md:pl-6">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className={`px-6 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${loading
                                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                                            : isLastFloor
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {isLastFloor ? "Save Project" : "Continue"}
                                            <FaArrowRight />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};