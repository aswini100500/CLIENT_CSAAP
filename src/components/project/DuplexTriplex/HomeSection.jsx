// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     FaHome,
//     FaTrash,
//     FaSpinner,
//     FaCheckCircle,
//     FaSync,
//     FaSave,
//     FaArrowRight,
//     FaPlus,
//     FaInfoCircle,
//     FaTimes,
//     FaMapMarkerAlt,
//     FaBuilding,
//     FaRulerCombined,
//     FaFileAlt,
//     FaPaperclip,
//     FaHashtag,
//     FaCog,
//     FaLayerGroup,
//     FaUpload,
//     FaDatabase,
//     FaExclamationTriangle
// } from "react-icons/fa";

// export const HomeSection = ({
//     projectName,
//     setProjectName,
//     projectType,
//     setProjectType,
//     city,
//     setCity,
//     locality,
//     setLocality,
//     landArea,
//     setLandArea,
//     revenuePlots,
//     setRevenuePlots,
//     onGenerate,
//     onProceedToMainInfo,
//     constants,
//     PROJECT_TYPES,
//     isEditMode = false,
//     editingProjectId = null,
// }) => {
//     const [currentStep, setCurrentStep] = useState(1);
//     const [isLoading, setIsLoading] = useState(false);
//     const [localCity, setLocalCity] = useState(city || "");
//     const [localLocality, setLocalLocality] = useState(locality || "");
//     const [localLandArea, setLocalLandArea] = useState(landArea || 0);
//     const [localRevenuePlots, setLocalRevenuePlots] = useState(revenuePlots || 0);
//     const [localAttachment, setLocalAttachment] = useState(null);
//     const [generatedProjectId, setGeneratedProjectId] = useState(editingProjectId);
//     const [autoCreating, setAutoCreating] = useState(false);
//     const [plotsData, setPlotsData] = useState([]);
//     const [plotStatuses, setPlotStatuses] = useState({});
//     const [validationErrors, setValidationErrors] = useState({});
//     const [showPlotDetails, setShowPlotDetails] = useState(false);
//     const [showRevenueSection, setShowRevenueSection] = useState(false);

//     const projectTypes = PROJECT_TYPES || {
//            PLOTTING: "plotting",
//         DUPLEX: "duplex",
//         TRIPLEX: "triplex",
//         APARTMENT: "apartment",
//         COMMERCIAL: "commercial",
//          CUSTOM: "custom",
//     };

//     const projectTypeOptions = [
//         { value: projectTypes.PLOTTING, label: "Plotting ", icon: FaHome, color: "blue", description: "Multi-unit residential building" },

//         { value: projectTypes.DUPLEX, label: "Duplex", icon: FaBuilding, color: "indigo", description: "Two-story independent house" },
//         { value: projectTypes.TRIPLEX, label: "Triplex ", icon: FaLayerGroup, color: "purple", description: "Three-story independent house" },
//         { value: projectTypes.APARTMENT, label: "Apartment ", icon: FaHome, color: "blue", description: "Multi-unit residential building" },
//         { value: projectTypes.COMMERCIAL, label: "Commercial ", icon: FaBuilding, color: "amber", description: "Business or retail space" },
//     { value: projectTypes.CUSTOM, label: "Custom ", icon: FaHome, color: "blue", description: "Multi-unit residential building" },

//     ];

//     useEffect(() => {
//         if (localRevenuePlots > 0) {
//             const newPlots = [...plotsData];
//             for (let i = newPlots.length; i < localRevenuePlots; i++) {
//                 newPlots[i] = {
//                     area: "",
//                     entryPlotNo: "",
//                     khataNo: "",
//                     fileName: "",
//                     file: null,
//                     id: `plot_${Date.now()}_${i}`
//                 };
//             }
//             setPlotsData(newPlots.slice(0, localRevenuePlots));
//             if (localRevenuePlots > 0) setShowPlotDetails(true);
//         } else {
//             setPlotsData([]);
//         }
//     }, [localRevenuePlots]);

//     const handlePlotChange = (index, field, value) => {
//         const updated = [...plotsData];
//         updated[index][field] = value;
//         setPlotsData(updated);

//         setPlotStatuses(prev => ({
//             ...prev,
//             [index]: { status: "modified", timestamp: Date.now() }
//         }));
//     };

//     const handlePlotFileChange = (index, file) => {
//         const updated = [...plotsData];
//         updated[index] = {
//             ...updated[index],
//             file: file,
//             fileName: file ? file.name : ""
//         };
//         setPlotsData(updated);

//         setPlotStatuses(prev => ({
//             ...prev,
//             [index]: { status: "modified", timestamp: Date.now() }
//         }));
//     };



//     const removePlot = (index) => {
//         const updated = plotsData.filter((_, i) => i !== index);
//         setPlotsData(updated);
//         setLocalRevenuePlots(updated.length);

//         setPlotStatuses(prev => {
//             const newStatuses = { ...prev };
//             delete newStatuses[index];
//             return Object.fromEntries(
//                 Object.entries(newStatuses).map(([key, value]) => {
//                     const numKey = parseInt(key);
//                     return numKey > index ? [(numKey - 1).toString(), value] : [key, value];
//                 })
//             );
//         });
//     };

//     const clearAllPlots = () => {
//         if (plotsData.length > 0) {
//             if (window.confirm(`Are you sure you want to remove all ${plotsData.length} plots?`)) {
//                 setPlotsData([]);
//                 setLocalRevenuePlots(0);
//                 setPlotStatuses({});
//                 setShowPlotDetails(false);
//             }
//         }
//     };

//     const addPlot = () => {
//         const newCount = localRevenuePlots + 1;
//         setLocalRevenuePlots(newCount);
//         setRevenuePlots(newCount);
//         setShowPlotDetails(true);
//     };

//     const validateForm = () => {
//         const errors = {};

//         if (!projectName.trim()) {
//             errors.projectName = "Project name is required";
//         }

//         if (!projectType) {
//             errors.projectType = "Project type is required";
//         }

//         if (localLandArea <= 0 && projectType !== "apartment") {
//             errors.landArea = "Valid land area is required";
//         }

//         setValidationErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     const handleAutoCreateProject = async () => {
//         if (!projectName.trim() || autoCreating) return;

//         setAutoCreating(true);
//         try {
//             await new Promise(resolve => setTimeout(resolve, 800));
//             if (!generatedProjectId) {
//                 const newId = `PRJ-${Date.now().toString(36).toUpperCase()}`;
//                 setGeneratedProjectId(newId);
//             }
//         } catch (error) {
//             console.error("Auto-create failed:", error);
//         } finally {
//             setAutoCreating(false);
//         }
//     };

// const handleSaveRevenuePlots = async () => {
//   setIsLoading(true);
//   try {
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     const updatedStatuses = {};
//     plotsData.forEach((plot, index) => {
//       if (plot.area || plot.entryPlotNo || plot.khataNo || plot.fileName) {
//         updatedStatuses[index] = { status: "saved", timestamp: Date.now() };
//       }
//     });
//     setPlotStatuses(updatedStatuses);

//     // ✅ SWITCH TO MAIN INFO TAB
//     if (typeof onProceedToMainInfo === "function") {
//       onProceedToMainInfo(); // 👉 calls setCurrentTab(1)
//     }
//   } finally {
//     setIsLoading(false);
//   }
// };


//     const getFilledPlotsCount = () => {
//         return plotsData.filter(plot =>
//             plot.area || plot.entryPlotNo || plot.khataNo || plot.fileName
//         ).length;
//     };

//     const getSavedPlotsCount = () => {
//         return Object.values(plotStatuses).filter(status => status.status === "saved").length;
//     };

//     const handleGenerateProject = async () => {
//         if (!validateForm()) {
//             return;
//         }

//         setIsLoading(true);
//         try {
//             await new Promise(resolve => setTimeout(resolve, 1200));

//             const projectData = {
//                 id: generatedProjectId || `PRJ-${Date.now()}`,
//                 name: projectName,
//                 type: projectType,
//                 city: localCity,
//                 locality: localLocality,
//                 landArea: localLandArea,
//                 revenuePlots: localRevenuePlots,
//                 attachment: localAttachment,
//                 plots: plotsData.filter(plot => plot.area || plot.entryPlotNo || plot.khataNo),
//                 totalPlotsConfigured: getFilledPlotsCount(),
//                 createdAt: new Date().toISOString(),
//                 status: "draft"
//             };

//             if (!generatedProjectId) {
//                 setGeneratedProjectId(projectData.id);
//             }

//             onGenerate(projectData);
//         } catch (error) {
//             console.error("Error generating project:", error);
//             setValidationErrors({ submit: "Failed to create project. Please try again." });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const showLocationFields = [
//         projectTypes.DUPLEX,
//         projectTypes.TRIPLEX,
//         projectTypes.APARTMENT,
//         projectTypes.COMMERCIAL,
//     ].includes(projectType);

//     const getProjectTypeColor = (type) => {
//         const option = projectTypeOptions.find(opt => opt.value === type);
//         return option?.color || "indigo";
//     };

//     const selectedProjectType = projectTypeOptions.find(opt => opt.value === projectType);

//     return (
//         <div className="bg-gradient-to-br from-slate-50 to-white p-2 md:p-6">
//             <div className="max-w-6xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <div className="flex items-center justify-between mb-6">
//                         <div className="flex items-center gap-4">
//                             <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
//                                 <FaCog className="text-white text-2xl" />
//                             </div>
//                             <div>
//                                 <h1 className="text-3xl font-bold text-slate-900">
//                                     {isEditMode ? "Edit Project" : "Create New Project"}
//                                 </h1>
//                                 <p className="text-slate-500 text-sm mt-1">
//                                     Configure all project details in one place
//                                 </p>
//                             </div>
//                         </div>

//                         {generatedProjectId && (
//                             <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
//                                 <FaDatabase className="text-indigo-500" size={14} />
//                                 <div>
//                                     <div className="text-xs font-medium text-slate-500">Project ID</div>
//                                     <code className="text-sm font-bold text-indigo-600">
//                                         {generatedProjectId}
//                                     </code>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Status Summary */}
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//                         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-indigo-100 rounded-lg">
//                                     <FaBuilding className="text-indigo-600" />
//                                 </div>
//                                 <div>
//                                     <div className="text-sm text-slate-500">Project</div>
//                                     <div className="font-semibold text-slate-900 truncate">
//                                         {projectName || "Not set"}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-blue-100 rounded-lg">
//                                     <FaMapMarkerAlt className="text-blue-600" />
//                                 </div>
//                                 <div>
//                                     <div className="text-sm text-slate-500">Location</div>
//                                     <div className="font-semibold text-slate-900">
//                                         {localCity ? `${localCity}, ${localLocality}` : "Not set"}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-amber-100 rounded-lg">
//                                     <FaLayerGroup className="text-amber-600" />
//                                 </div>
//                                 <div>
//                                     <div className="text-sm text-slate-500">Revenue Plots</div>
//                                     <div className="font-semibold text-slate-900">
//                                         {getFilledPlotsCount()}/{localRevenuePlots} configured
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-emerald-100 rounded-lg">
//                                     <FaCheckCircle className="text-emerald-600" />
//                                 </div>
//                                 <div>
//                                     <div className="text-sm text-slate-500">Status</div>
//                                     <div className="font-semibold text-slate-900">
//                                         {generatedProjectId ? "Created" : "Draft"}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Main Form */}
//                 <div className="space-y-4">
// <motion.div
//   initial={{ opacity: 0, y: 20 }}
//   animate={{ opacity: 1, y: 0 }}
//   className="bg-white rounded-2xl border p-5 border-slate-200 shadow-sm space-y-8"
// >
//   {/* ===== Basic Information Section ===== */}
//   <div>
//     <div className="flex items-center gap-3 mb-6">
//       <div className="p-2 bg-indigo-100 rounded-lg">
//         <FaBuilding className="text-indigo-600 text-xl" />
//       </div>
//       <div>
//         <h2 className="text-xl font-bold text-slate-900">
//           Basic Information
//         </h2>
//         <p className="text-slate-500 text-sm">
//           Essential project details
//         </p>
//       </div>
//     </div>

//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       {/* Project Name */}
//       <div>
//         <label className="block text-sm font-semibold text-slate-800 mb-2">
//           Project Name <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <input
//             type="text"
//             value={projectName}
//             onChange={(e) => setProjectName(e.target.value)}
//             onBlur={handleAutoCreateProject}
//             className={`w-full border ${
//               validationErrors.projectName
//                 ? "border-red-300"
//                 : "border-slate-300"
//             } rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
//             placeholder="e.g., Skyline Urban Heights"
//           />
//           {autoCreating && (
//             <div className="absolute right-3 top-3">
//               <FaSpinner className="animate-spin text-indigo-500" />
//             </div>
//           )}
//         </div>
//         {validationErrors.projectName && (
//           <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//             <FaExclamationTriangle size={12} />
//             {validationErrors.projectName}
//           </p>
//         )}
//       </div>

//       {/* Project Type */}
//       <div>
//         <label className="block text-sm font-semibold text-slate-800 mb-2">
//           Project Type <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={projectType}
//           onChange={(e) => setProjectType(e.target.value)}
//           className={`w-full border ${
//             validationErrors.projectType
//               ? "border-red-300"
//               : "border-slate-300"
//           } rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white`}
//         >
//           <option value="">Select project type</option>
//           {projectTypeOptions.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//         {validationErrors.projectType && (
//           <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//             <FaExclamationTriangle size={12} />
//             {validationErrors.projectType}
//           </p>
//         )}
//       </div>
//     </div>
//   </div>

//   {/* ===== Location & Area Section ===== */}

//     {showLocationFields && (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0 }}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-2">
//               City
//             </label>
//             <input
//               type="text"
//               value={localCity}
//               onChange={(e) => {
//                 setLocalCity(e.target.value);
//                 setCity(e.target.value);
//               }}
//               className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//               placeholder="e.g., Mumbai"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-2">
//               Locality / Area
//             </label>
//             <input
//               type="text"
//               value={localLocality}
//               onChange={(e) => {
//                 setLocalLocality(e.target.value);
//                 setLocality(e.target.value);
//               }}
//               className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//               placeholder="e.g., Bandra West"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-2">
//               Total Land Area (sq.ft) <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={localLandArea}
//                 onChange={(e) => {
//                   const value = parseFloat(e.target.value) || 0;
//                   setLocalLandArea(value);
//                   setLandArea(value);
//                 }}
//                 className={`w-full border ${
//                   validationErrors.landArea
//                     ? "border-red-300"
//                     : "border-slate-300"
//                 } rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
//                 placeholder="0.00"
//               />
//               <div className="absolute right-3 top-3 text-slate-500 text-sm">
//                 sq.ft
//               </div>
//             </div>
//             {validationErrors.landArea && (
//               <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                 <FaExclamationTriangle size={12} />
//                 {validationErrors.landArea}
//               </p>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     )}

// </motion.div>

// <div className="flex justify-end pt-6">
//   <button
//     onClick={() => {
//       if (!validateForm()) return;
//       setCurrentStep(2);
//       setShowRevenueSection(true);
//     }}
//     className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold
//                hover:bg-indigo-700 transition-all flex items-center gap-2"
//   >
//     Next
//     <FaArrowRight />
//   </button>
// </div>


// {currentStep === 2 && (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     className="bg-white rounded-2xl"
//   >
//             {/* Revenue Plots Section */}
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="bg-white rounded-2xl border border-slate-200 p-5"
//                     >
//                         <div className="flex items-center justify-between mb-6">
//                             <div className="flex items-center gap-3">
//                                 <div className="p-2 bg-amber-100 rounded-lg">
//                                     <FaLayerGroup className="text-amber-600 text-xl" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-xl font-bold text-slate-900">Revenue Plots</h2>
//                                     <p className="text-slate-500 text-sm">Configure individual plot details</p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center gap-3">
//                                 <button
//                                     onClick={addPlot}
//                                     className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all flex items-center gap-2"
//                                 >
//                                     <FaPlus />
//                                     Add Plot
//                                 </button>
//                                 {localRevenuePlots > 0 && (
//                                     <button
//                                         onClick={clearAllPlots}
//                                         className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all flex items-center gap-2"
//                                     >
//                                         <FaTrash />
//                                         Clear All
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Plots Count Input */}
//                         <div className="mb-6">
//                             <label className="block text-sm font-semibold text-slate-700 mb-2">
//                                 Total Number of Plots
//                             </label>
//                             <div className="flex items-center gap-4">
//                                 <input
//                                     type="number"
//                                     min="0"
//                                     max="100"
//                                     value={localRevenuePlots}
//                                     onChange={(e) => {
//                                         const num = Math.min(Math.max(0, parseInt(e.target.value) || 0), 100);
//                                         setLocalRevenuePlots(num);
//                                         setRevenuePlots(num);
//                                         if (num > 0) setShowPlotDetails(true);
//                                     }}
//                                     className="w-32 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
//                                     placeholder="0"
//                                 />
//                                 <div className="text-sm text-slate-600">
//                                     <span className="font-semibold text-slate-900">{getFilledPlotsCount()}</span> out of <span className="font-semibold text-slate-900">{localRevenuePlots}</span> plots configured
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Plots Grid */}
//                         <AnimatePresence>
//                             {showPlotDetails && localRevenuePlots > 0 && (
//                                 <motion.div
//                                     initial={{ opacity: 0 }}
//                                     animate={{ opacity: 1 }}
//                                     exit={{ opacity: 0 }}
//                                     className="space-y-6"
//                                 >
//                                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                                         {plotsData.map((plot, index) => (
//                                             <motion.div
//                                                 key={plot.id || index}
//                                                 layout
//                                                 initial={{ opacity: 0, scale: 0.95 }}
//                                                 animate={{ opacity: 1, scale: 1 }}
//                                                 exit={{ opacity: 0, scale: 0.95 }}
//                                                 className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group hover:border-slate-300 transition-all"
//                                             >
//                                                 <button
//                                                     onClick={() => removePlot(index)}
//                                                     className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
//                                                 >
//                                                     <FaTimes size={10} />
//                                                 </button>

//                                                 <div className="flex items-center justify-between mb-4">
//                                                     <div className="flex items-center gap-2">
//                                                         <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
//                                                             <span className="text-sm font-bold text-slate-700">{index + 1}</span>
//                                                         </div>
//                                                         <div>
//                                                             <div className="text-sm font-semibold text-slate-800">Plot {index + 1}</div>
//                                                             <div className="text-xs text-slate-500">
//                                                                 {plot.area ? `${plot.area} sq.ft` : 'No area set'}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     {plotStatuses[index]?.status === "saved" && (
//                                                         <FaCheckCircle className="text-emerald-500" size={14} />
//                                                     )}
//                                                 </div>

//                                                 <div className="space-y-3">
//                                                     <div>
//                                                         <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
//                                                             <FaRulerCombined size={10} />
//                                                             Plot Area (sq.ft)
//                                                         </label>
//                                                         <input
//                                                             type="number"
//                                                             value={plot.area}
//                                                             onChange={(e) => handlePlotChange(index, "area", e.target.value)}
//                                                             className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//                                                             placeholder="0.00"
//                                                         />
//                                                     </div>

//                                                     <div>
//                                                         <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
//                                                             <FaHashtag size={10} />
//                                                             Entry Plot Number
//                                                         </label>
//                                                         <input
//                                                             type="text"
//                                                             value={plot.entryPlotNo}
//                                                             onChange={(e) => handlePlotChange(index, "entryPlotNo", e.target.value)}
//                                                             className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//                                                             placeholder="Plot number"
//                                                         />
//                                                     </div>

//                                                     <div>
//                                                         <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
//                                                             <FaFileAlt size={10} />
//                                                             Khata Number
//                                                         </label>
//                                                         <input
//                                                             type="text"
//                                                             value={plot.khataNo}
//                                                             onChange={(e) => handlePlotChange(index, "khataNo", e.target.value)}
//                                                             className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//                                                             placeholder="Khata number"
//                                                         />
//                                                     </div>

//                                                     <div>
//                                                         <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
//                                                             <FaPaperclip size={10} />
//                                                             Attachment
//                                                         </label>
//                                                         <div className="relative">
//                                                             <input
//                                                                 type="file"
//                                                                 onChange={(e) => handlePlotFileChange(index, e.target.files[0])}
//                                                                 className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
//                                                             />
//                                                             {plot.fileName && (
//                                                                 <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-2">
//                                                                     <FaPaperclip size={10} />
//                                                                     <span className="truncate">{plot.fileName}</span>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </motion.div>
//                                         ))}
//                                     </div>
//                                     {getFilledPlotsCount() > 0 && (
//                                         <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
//                                             <div className="flex items-center justify-between">
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="p-2 bg-indigo-100 rounded-lg">
//                                                         <FaSave className="text-indigo-600" />
//                                                     </div>
//                                                     <div>
//                                                         <div className="font-semibold text-slate-800">
//                                                             {getFilledPlotsCount()} plot{getFilledPlotsCount() !== 1 ? 's' : ''} ready to save
//                                                         </div>
//                                                         <div className="text-sm text-slate-600">
//                                                             {getSavedPlotsCount()} already saved
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <button
//                                                     onClick={handleSaveRevenuePlots}
//                                                     disabled={isLoading}
//                                                     className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2"
//                                                 >
//                                                     {isLoading ? (
//                                                         <>
//                                                             <FaSpinner className="animate-spin" />
//                                                             Saving...
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <FaSave />
//                                                           Save Revenue Plots & Continue
//                                                         </>
//                                                     )}
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </motion.div>
//                             )}
//                         </AnimatePresence>
//                     </motion.div>
//   </motion.div>
// )}






//                     {/* Submit Section */}
//                     {/* <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl"
//                     >
//                         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//                             <div className="flex items-center gap-4">
//                                 <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
//                                     <FaInfoCircle className="text-white text-2xl" />
//                                 </div>
//                                 <div>
//                                     <h3 className="text-xl font-bold text-white">Ready to {generatedProjectId ? 'Update' : 'Create'} Project</h3>
//                                     <p className="text-slate-300 text-sm mt-1">
//                                         Review all details before final submission
//                                     </p>
//                                 </div>
//                             </div>

//                             <div className="flex flex-col items-end">
//                                 <div className="flex items-center gap-4 mb-3">
//                                     <div className="text-right">
//                                         <div className="text-sm text-slate-300">Project Status</div>
//                                         <div className="text-lg font-bold text-white">
//                                             {generatedProjectId ? 'Ready to Update' : 'Ready to Create'}
//                                         </div>
//                                     </div>
//                                     <div className="text-right">
//                                         <div className="text-sm text-slate-300">Plots Configured</div>
//                                         <div className="text-lg font-bold text-white">
//                                             {getFilledPlotsCount()}/{localRevenuePlots}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <button
//                                     onClick={handleGenerateProject}
//                                     disabled={isLoading || !projectName || !projectType}
//                                     className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg"
//                                 >
//                                     {isLoading ? (
//                                         <>
//                                             <FaSpinner className="animate-spin" />
//                                             Processing...
//                                         </>
//                                     ) : (
//                                         <>
//                                             {generatedProjectId ? 'Update Project' : 'Create Project'}
//                                             <FaArrowRight />
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </motion.div> */}
//                 </div>
//             </div>
//         </div>
//     );
// };




import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaHome,
    FaTrash,
    FaSpinner,
    FaCheckCircle,
    FaSync,
    FaSave,
    FaArrowRight,
    FaPlus,
    FaInfoCircle,
    FaTimes,
    FaMapMarkerAlt,
    FaBuilding,
    FaRulerCombined,
    FaFileAlt,
    FaPaperclip,
    FaHashtag,
    FaCog,
    FaLayerGroup,
    FaUpload,
    FaDatabase,
    FaExclamationTriangle
} from "react-icons/fa";

export const HomeSection = ({
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
    revenuePlotsData = [],
    setRevenuePlotsData,
    onGenerate,
    onProceedToMainInfo,
    constants,
    PROJECT_TYPES,
    isEditMode = false,
    editingProjectId = null,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [localCity, setLocalCity] = useState(city || "");
    const [localLocality, setLocalLocality] = useState(locality || "");
    const [localLandArea, setLocalLandArea] = useState(landArea || "");
    const [localRevenuePlots, setLocalRevenuePlots] = useState(revenuePlots || 0);
    const [localAttachment, setLocalAttachment] = useState(null);
    const [generatedProjectId, setGeneratedProjectId] = useState(editingProjectId);
    const [autoCreating, setAutoCreating] = useState(false);
    const plotsData = revenuePlotsData || [];
    const setPlotsData = setRevenuePlotsData;
    const [plotStatuses, setPlotStatuses] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [showPlotDetails, setShowPlotDetails] = useState(false);

    const projectTypes = PROJECT_TYPES || {
        PLOTTING: "plotting",
        DUPLEX: "duplex",
        TRIPLEX: "triplex",
        APARTMENT: "apartment",
        COMMERCIAL: "commercial",
        CUSTOM: "custom",
    };

    const projectTypeOptions = [
        { value: projectTypes.PLOTTING, label: "Plotting ", icon: FaHome, color: "blue", description: "Multi-unit residential building" },
        { value: projectTypes.DUPLEX, label: "Duplex", icon: FaBuilding, color: "indigo", description: "Two-story independent house" },
        { value: projectTypes.TRIPLEX, label: "Triplex ", icon: FaLayerGroup, color: "purple", description: "Three-story independent house" },
        { value: projectTypes.APARTMENT, label: "Apartment ", icon: FaHome, color: "blue", description: "Multi-unit residential building" },
        { value: projectTypes.COMMERCIAL, label: "Commercial ", icon: FaBuilding, color: "amber", description: "Business or retail space" },
        { value: projectTypes.CUSTOM, label: "Custom ", icon: FaHome, color: "blue", description: "Multi-unit residential building" },
    ];

    useEffect(() => {
        if (localRevenuePlots > 0) {
            const newPlots = [...plotsData];
            for (let i = newPlots.length; i < localRevenuePlots; i++) {
                newPlots[i] = {
                    plot_area_sqft: "",
                    plot_no: "",
                    khata_no: "",
                    fileName: "",
                    file: null,
                    status: "available",
                    id: `plot_${Date.now()}_${i}`
                };
            }
            setPlotsData(newPlots.slice(0, localRevenuePlots));
            if (localRevenuePlots > 0) setShowPlotDetails(true);
        } else {
            setPlotsData([]);
        }
    }, [localRevenuePlots]);

    const handlePlotChange = (index, field, value) => {
        const updated = [...plotsData];
        updated[index][field] = value;
        setPlotsData(updated);

        setPlotStatuses(prev => ({
            ...prev,
            [index]: { status: "modified", timestamp: Date.now() }
        }));
    };

    const handlePlotFileChange = (index, file) => {
        const updated = [...plotsData];
        updated[index] = {
            ...updated[index],
            file: file,
            fileName: file ? file.name : ""
        };
        setPlotsData(updated);

        setPlotStatuses(prev => ({
            ...prev,
            [index]: { status: "modified", timestamp: Date.now() }
        }));
    };

    const removePlot = (index) => {
        const updated = plotsData.filter((_, i) => i !== index);
        setPlotsData(updated);
        setLocalRevenuePlots(updated.length);

        setPlotStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[index];
            return Object.fromEntries(
                Object.entries(newStatuses).map(([key, value]) => {
                    const numKey = parseInt(key);
                    return numKey > index ? [(numKey - 1).toString(), value] : [key, value];
                })
            );
        });
    };

    const clearAllPlots = () => {
        if (plotsData.length > 0) {
            if (window.confirm(`Are you sure you want to remove all ${plotsData.length} plots?`)) {
                setPlotsData([]);
                setLocalRevenuePlots(0);
                setPlotStatuses({});
                setShowPlotDetails(false);
            }
        }
    };

    const addPlot = () => {
        const newCount = localRevenuePlots + 1;
        setLocalRevenuePlots(newCount);
        setRevenuePlots(newCount);
        setShowPlotDetails(true);
    };

    const validateForm = () => {
        const errors = {};

        if (!projectName.trim()) {
            errors.projectName = "Project name is required";
        }

        if (!projectType) {
            errors.projectType = "Project type is required";
        }

        if (localLandArea <= 0 && projectType !== "apartment") {
            errors.landArea = "Valid land area is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAutoCreateProject = async () => {
        if (!projectName.trim() || autoCreating) return;

        setAutoCreating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            if (!generatedProjectId) {
                const newId = `PRJ-${Date.now().toString(36).toUpperCase()}`;
                setGeneratedProjectId(newId);
            }
        } catch (error) {
            console.error("Auto-create failed:", error);
        } finally {
            setAutoCreating(false);
        }
    };

    const handleSaveRevenuePlots = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const updatedStatuses = {};
            plotsData.forEach((plot, index) => {
                if (plot.plot_area_sqft || plot.plot_no || plot.khata_no || plot.fileName) {
                    updatedStatuses[index] = { status: "saved", timestamp: Date.now() };
                }
            });
            setPlotStatuses(updatedStatuses);

            // Sync with parent
            if (typeof setRevenuePlotsData === "function") {
                setRevenuePlotsData(plotsData);
            }

            // ✅ SWITCH TO MAIN INFO TAB
            if (typeof onProceedToMainInfo === "function") {
                onProceedToMainInfo(); // 👉 calls setCurrentTab(1)
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getFilledPlotsCount = () => {
        return plotsData.filter(plot =>
            plot.plot_area_sqft || plot.plot_no || plot.khata_no || plot.fileName
        ).length;
    };

    const getSavedPlotsCount = () => {
        return Object.values(plotStatuses).filter(status => status.status === "saved").length;
    };

    const handleGenerateProject = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));

            const projectData = {
                id: generatedProjectId || `PRJ-${Date.now()}`,
                name: projectName,
                type: projectType,
                city: localCity,
                locality: localLocality,
                landArea: localLandArea,
                revenuePlots: localRevenuePlots,
                attachment: localAttachment,
                plots: plotsData.filter(plot => plot.plot_area_sqft || plot.plot_no || plot.khata_no),
                totalPlotsConfigured: getFilledPlotsCount(),
                createdAt: new Date().toISOString(),
                status: "draft"
            };

            if (!generatedProjectId) {
                setGeneratedProjectId(projectData.id);
            }

            if (typeof setRevenuePlotsData === "function") {
                setRevenuePlotsData(plotsData);
            }

            onGenerate(projectData);
        } catch (error) {
            console.error("Error generating project:", error);
            setValidationErrors({ submit: "Failed to create project. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const showLocationFields = [
        projectTypes.DUPLEX,
        projectTypes.TRIPLEX,
        projectTypes.APARTMENT,
        projectTypes.COMMERCIAL,
    ].includes(projectType);

    return (
        <div className="bg-linear-to-br from-slate-50 to-white p-2 md:p-6">
            <div className="w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                <FaCog className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    {isEditMode ? "Edit Project" : "Create New Project"}
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">
                                    Configure all project details in one place
                                </p>
                            </div>
                        </div>

                        {generatedProjectId && (
                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-2 py-2 shadow-sm">
                                <FaDatabase className="text-indigo-500" size={14} />
                                <div>
                                    <div className="text-xs font-medium text-slate-500">Project ID</div>
                                    <code className="text-sm font-bold text-indigo-600">
                                        {generatedProjectId}
                                    </code>
                                </div>
                            </div>
                        )}
                    </div>


                </div>

                {/* Main Form */}
                <div className="space-y-3 justify-center">
                    {/* Basic Information Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border p-5 border-slate-200 shadow-sm space-y-4"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <FaBuilding className="text-indigo-600 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Basic Information
                                    </h2>
                                    <p className="text-slate-500 text-sm">
                                        Essential project details
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Project Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            onBlur={handleAutoCreateProject}
                                            className={`w-full border ${validationErrors.projectName
                                                ? "border-red-300"
                                                : "border-slate-300"
                                                } rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                                            placeholder="e.g., Skyline Urban Heights"
                                        />
                                        {autoCreating && (
                                            <div className="absolute right-3 top-3">
                                                <FaSpinner className="animate-spin text-indigo-500" />
                                            </div>
                                        )}
                                    </div>
                                    {validationErrors.projectName && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <FaExclamationTriangle size={12} />
                                            {validationErrors.projectName}
                                        </p>
                                    )}
                                </div>

                                {/* Project Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                                        Project Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={projectType}
                                        onChange={(e) => setProjectType(e.target.value)}
                                        className={`w-full border ${validationErrors.projectType
                                            ? "border-red-300"
                                            : "border-slate-300"
                                            } rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white`}
                                    >
                                        <option value="">Select project type</option>
                                        {projectTypeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.projectType && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <FaExclamationTriangle size={12} />
                                            {validationErrors.projectType}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location & Area Section */}
                        {showLocationFields && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={localCity}
                                            onChange={(e) => {
                                                setLocalCity(e.target.value);
                                                setCity(e.target.value);
                                            }}
                                            className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g., Mumbai"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Locality / Area
                                        </label>
                                        <input
                                            type="text"
                                            value={localLocality}
                                            onChange={(e) => {
                                                setLocalLocality(e.target.value);
                                                setLocality(e.target.value);
                                            }}
                                            className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g., Bandra West"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Total Land Area (sq.ft) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={localLandArea}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setLocalLandArea(value);
                                                    setLandArea(value);
                                                }}
                                                className={`w-full border ${validationErrors.landArea
                                                    ? "border-red-300"
                                                    : "border-slate-300"
                                                    } rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                                                placeholder="0.00"
                                            />
                                            <div className="absolute right-3 top-3 text-slate-500 text-sm">
                                                sq.ft
                                            </div>
                                        </div>
                                        {validationErrors.landArea && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                <FaExclamationTriangle size={12} />
                                                {validationErrors.landArea}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Revenue Plots Section - Always Visible */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 p-5"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <FaLayerGroup className="text-amber-600 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Revenue Plots</h2>
                                    <p className="text-slate-500 text-sm">Configure individual plot details</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={addPlot}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all flex items-center gap-2"
                                >
                                    <FaPlus />
                                    Add Plot
                                </button>
                                {localRevenuePlots > 0 && (
                                    <button
                                        onClick={clearAllPlots}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all flex items-center gap-2"
                                    >
                                        <FaTrash />
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Plots Count Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Total Number of Plots
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={localRevenuePlots}
                                    onChange={(e) => {
                                        const num = Math.min(Math.max(0, parseInt(e.target.value)), 100);
                                        setLocalRevenuePlots(num);
                                        setRevenuePlots(num);
                                        if (num > 0) setShowPlotDetails(true);
                                    }}
                                    className="w-32 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    placeholder=""
                                />
                                <div className="text-sm text-slate-600">
                                    <span className="font-semibold text-slate-900">{getFilledPlotsCount()}</span> out of <span className="font-semibold text-slate-900">{localRevenuePlots}</span> plots configured
                                </div>
                            </div>
                        </div>

                        {/* Plots Grid */}
                        <AnimatePresence>
                            {showPlotDetails && localRevenuePlots > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {plotsData.map((plot, index) => (
                                            <motion.div
                                                key={plot.id || index}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group hover:border-slate-300 transition-all"
                                            >
                                                <button
                                                    onClick={() => removePlot(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                >
                                                    <FaTimes size={10} />
                                                </button>

                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                                                            <span className="text-sm font-bold text-slate-700">{index + 1}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-800">Plot {index + 1}</div>
                                                            <div className="text-xs text-slate-500">
                                                                {plot.plot_area_sqft ? `${plot.plot_area_sqft} sq.ft` : 'No area set'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {plotStatuses[index]?.status === "saved" && (
                                                        <FaCheckCircle className="text-emerald-500" size={14} />
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                                                            <FaRulerCombined size={10} />
                                                            Plot Area (sq.ft)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={plot.plot_area_sqft}
                                                            onChange={(e) => handlePlotChange(index, "plot_area_sqft", e.target.value)}
                                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                            placeholder="0.00"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                                                            <FaHashtag size={10} />
                                                            Entry Plot Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={plot.plot_no}
                                                            onChange={(e) => handlePlotChange(index, "plot_no", e.target.value)}
                                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                            placeholder="Plot number"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                                                            <FaFileAlt size={10} />
                                                            Khata Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={plot.khata_no}
                                                            onChange={(e) => handlePlotChange(index, "khata_no", e.target.value)}
                                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                            placeholder="Khata number"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                                                            <FaPaperclip size={10} />
                                                            Attachment
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                onChange={(e) => handlePlotFileChange(index, e.target.files[0])}
                                                                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                                            />
                                                            {plot.fileName && (
                                                                <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-2">
                                                                    <FaPaperclip size={10} />
                                                                    <span className="truncate">{plot.fileName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {getFilledPlotsCount() > 0 && (
                                        <div className="bg-linear-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                                        <FaSave className="text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">
                                                            {getFilledPlotsCount()} plot{getFilledPlotsCount() !== 1 ? 's' : ''} ready to save
                                                        </div>
                                                        <div className="text-sm text-slate-600">
                                                            {getSavedPlotsCount()} already saved
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleSaveRevenuePlots}
                                                    disabled={isLoading}
                                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <FaSpinner className="animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaSave />
                                                            Save Revenue Plots & Continue
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};