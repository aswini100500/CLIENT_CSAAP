// // CustomProject.jsx
// import React, { useEffect, useState } from "react";
// import { FaInfoCircle, FaArrowLeft, FaCheck } from "react-icons/fa";

// const CustomProject = ({
//   projectName,
//   setProjectName,
//   projectType,
//   setProjectType,
//   city,
//   setCity,
//   locality,
//   setLocality,
//   onSaveProject,
//   PROJECT_TYPES = { CUSTOM: "custom", PLOTTING: "plotting", DUPLEX: "duplex", TRIPLEX: "triplex", APARTMENT: "apartment", COMMERCIAL: "commercial" },
//   activeType,
//   onBackToTypeList,
// }) => {
//   // Which custom sub-type is currently being configured: plotting, duplex, triplex, apartment, commercial
//   const [selectedCustomType, setSelectedCustomType] = useState(activeType || "");
//   const [showConfiguration, setShowConfiguration] = useState(Boolean(activeType));

//   // General descriptive fields
//   const [projectDescription, setProjectDescription] = useState("");
//   const [specialRequirements, setSpecialRequirements] = useState("");
//   const [projectTimeline, setProjectTimeline] = useState("");
//   const [additionalNotes, setAdditionalNotes] = useState("");

//   // Per-type configuration state
//   const [plottingConfig, setPlottingConfig] = useState({
//     totalPlots: "",
//     plotSizes: "",
//     roadWidth: "",
//     amenities: "",
//   });

//   const [duplexConfig, setDuplexConfig] = useState({
//     totalUnits: "",
//     unitSize: "",
//     floorPlan: "",
//     parkingSpaces: "",
//   });

//   const [triplexConfig, setTriplexConfig] = useState({
//     totalUnits: "",
//     unitSize: "",
//     amenities: "",
//   });

//   const [apartmentConfig, setApartmentConfig] = useState({
//     totalFloors: "",
//     unitsPerFloor: "",
//     unitTypes: "",
//     commonAmenities: "",
//   });

//   const [commercialConfig, setCommercialConfig] = useState({
//     commercialType: "",
//     totalUnits: "",
//     unitSizes: "",
//     parkingCapacity: "",
//   });

//   // sync parent-driven activeType
//   useEffect(() => {
//     if (activeType) {
//       setSelectedCustomType(activeType);
//       setShowConfiguration(true);
//     }
//   }, [activeType]);

//   // If parent toggles projectType to non-custom, reset
//   useEffect(() => {
//     if (projectType && projectType !== PROJECT_TYPES.CUSTOM) {
//       // keep project's projectType in sync
//       setSelectedCustomType("");
//       setShowConfiguration(false);
//     }
//   }, [projectType, PROJECT_TYPES.CUSTOM]);

//   const handleCustomTypeSelect = (type) => {
//     setSelectedCustomType(type);
//     setShowConfiguration(true);
//     // ensure top-level projectType remains a marker for the chosen sub-type while configuring
//     setProjectType(type);
//   };

//   const handleBackToSelection = () => {
//     setShowConfiguration(false);
//     setSelectedCustomType("");
//     if (onBackToTypeList) onBackToTypeList();
//   };

//   // Update helpers
//   const updatePlottingConfig = (field, value) => setPlottingConfig((p) => ({ ...p, [field]: value }));
//   const updateDuplexConfig = (field, value) => setDuplexConfig((p) => ({ ...p, [field]: value }));
//   const updateTriplexConfig = (field, value) => setTriplexConfig((p) => ({ ...p, [field]: value }));
//   const updateApartmentConfig = (field, value) => setApartmentConfig((p) => ({ ...p, [field]: value }));
//   const updateCommercialConfig = (field, value) => setCommercialConfig((p) => ({ ...p, [field]: value }));

//   const getConfigurationData = () => {
//     switch (selectedCustomType) {
//       case "plotting":
//       case PROJECT_TYPES.PLOTTING:
//         return plottingConfig;
//       case "duplex":
//       case PROJECT_TYPES.DUPLEX:
//         return duplexConfig;
//       case "triplex":
//       case PROJECT_TYPES.TRIPLEX:
//         return triplexConfig;
//       case "apartment":
//       case PROJECT_TYPES.APARTMENT:
//         return apartmentConfig;
//       case "commercial":
//       case PROJECT_TYPES.COMMERCIAL:
//         return commercialConfig;
//       default:
//         return {};
//     }
//   };

//   const handleSaveProject = () => {
//     if (!projectName) {
//       alert("Please enter project name.");
//       return;
//     }
//     if (!selectedCustomType) {
//       alert("Please choose a custom project type to configure.");
//       return;
//     }

//     const config = getConfigurationData();

//     const projectData = {
//       id: Date.now(),
//       name: projectName,
//       type: selectedCustomType || projectType || PROJECT_TYPES.CUSTOM,
//       customType: selectedCustomType,
//       city,
//       locality,
//       description: projectDescription,
//       specialRequirements,
//       timeline: projectTimeline,
//       additionalNotes,
//       configuration: config,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     // call parent save handler
//     if (onSaveProject) {
//       onSaveProject(projectData);
//     } else {
//       console.warn("onSaveProject not provided. projectData:", projectData);
//     }
//   };

//   // Render per-type configuration panels
//   const renderConfigurationSection = () => {
//     if (!selectedCustomType) return null;

//     const type = selectedCustomType;

//     if (type === "plotting" || type === PROJECT_TYPES.PLOTTING) {
//       return (
//         <div className="space-y-4">
//           <h4 className="text-md font-semibold">Plotting Configuration</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium">Total Plots</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={plottingConfig.totalPlots}
//                 onChange={(e) => updatePlottingConfig("totalPlots", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 10"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Plot Sizes (comma separated)</label>
//               <input
//                 type="text"
//                 value={plottingConfig.plotSizes}
//                 onChange={(e) => updatePlottingConfig("plotSizes", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 30x40, 25x40"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Road Width</label>
//               <input
//                 type="text"
//                 value={plottingConfig.roadWidth}
//                 onChange={(e) => updatePlottingConfig("roadWidth", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 30 ft"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Amenities</label>
//               <input
//                 type="text"
//                 value={plottingConfig.amenities}
//                 onChange={(e) => updatePlottingConfig("amenities", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. Park, Streetlights"
//               />
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (type === "duplex" || type === PROJECT_TYPES.DUPLEX) {
//       return (
//         <div className="space-y-4">
//           <h4 className="text-md font-semibold">Duplex Configuration</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium">Total Units</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={duplexConfig.totalUnits}
//                 onChange={(e) => updateDuplexConfig("totalUnits", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 2"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Unit Size (sq ft)</label>
//               <input
//                 type="text"
//                 value={duplexConfig.unitSize}
//                 onChange={(e) => updateDuplexConfig("unitSize", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 1200"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Preferred Floor Plan</label>
//               <input
//                 type="text"
//                 value={duplexConfig.floorPlan}
//                 onChange={(e) => updateDuplexConfig("floorPlan", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 2BHK / Open plan"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Parking Spaces</label>
//               <input
//                 type="number"
//                 min="0"
//                 value={duplexConfig.parkingSpaces}
//                 onChange={(e) => updateDuplexConfig("parkingSpaces", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="number of parking spaces"
//               />
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (type === "triplex" || type === PROJECT_TYPES.TRIPLEX) {
//       return (
//         <div className="space-y-4">
//           <h4 className="text-md font-semibold">Triplex Configuration</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium">Total Units</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={triplexConfig.totalUnits}
//                 onChange={(e) => updateTriplexConfig("totalUnits", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 3"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Unit Size (sq ft)</label>
//               <input
//                 type="text"
//                 value={triplexConfig.unitSize}
//                 onChange={(e) => updateTriplexConfig("unitSize", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 900"
//               />
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium">Amenities / Notes</label>
//               <input
//                 type="text"
//                 value={triplexConfig.amenities}
//                 onChange={(e) => updateTriplexConfig("amenities", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. Terrace, lift, generator"
//               />
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (type === "apartment" || type === PROJECT_TYPES.APARTMENT) {
//       return (
//         <div className="space-y-4">
//           <h4 className="text-md font-semibold">Apartment Configuration</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium">Total Floors</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={apartmentConfig.totalFloors}
//                 onChange={(e) => updateApartmentConfig("totalFloors", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 6"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Units Per Floor</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={apartmentConfig.unitsPerFloor}
//                 onChange={(e) => updateApartmentConfig("unitsPerFloor", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 4"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Unit Types</label>
//               <input
//                 type="text"
//                 value={apartmentConfig.unitTypes}
//                 onChange={(e) => updateApartmentConfig("unitTypes", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 1BHK,2BHK"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Common Amenities</label>
//               <input
//                 type="text"
//                 value={apartmentConfig.commonAmenities}
//                 onChange={(e) => updateApartmentConfig("commonAmenities", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. Gym, Pool"
//               />
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (type === "commercial" || type === PROJECT_TYPES.COMMERCIAL) {
//       return (
//         <div className="space-y-4">
//           <h4 className="text-md font-semibold">Commercial Configuration</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium">Commercial Type</label>
//               <select
//                 value={commercialConfig.commercialType}
//                 onChange={(e) => updateCommercialConfig("commercialType", e.target.value)}
//                 className="w-full border rounded p-2"
//               >
//                 <option value="">Select</option>
//                 <option value="office">Office</option>
//                 <option value="shop">Shop</option>
//                 <option value="showroom">Showroom</option>
//                 <option value="land">Land</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Total Units / Blocks</label>
//               <input
//                 type="number"
//                 min="0"
//                 value={commercialConfig.totalUnits}
//                 onChange={(e) => updateCommercialConfig("totalUnits", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="Number of units or blocks"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Unit Sizes</label>
//               <input
//                 type="text"
//                 value={commercialConfig.unitSizes}
//                 onChange={(e) => updateCommercialConfig("unitSizes", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="e.g. 400 sqft, 800 sqft"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Parking Capacity</label>
//               <input
//                 type="number"
//                 min="0"
//                 value={commercialConfig.parkingCapacity}
//                 onChange={(e) => updateCommercialConfig("parkingCapacity", e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="Number of parking spaces"
//               />
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return null;
//   };

//   const typeCard = (typeKey, title, description) => {
//     const isActive = selectedCustomType === typeKey;
//     return (
//       <button
//         key={typeKey}
//         onClick={() => handleCustomTypeSelect(typeKey)}
//         className={`bg-white border rounded-xl p-5 text-left transition-shadow duration-150 ${isActive ? "border-indigo-400 shadow-md bg-indigo-50" : "hover:shadow-sm"}`}
//       >
//         <div className="flex items-center justify-between">
//           <div>
//             <h4 className="text-lg font-semibold capitalize">{title}</h4>
//             <p className="text-sm text-gray-600 mt-1">{description}</p>
//           </div>
//           {isActive && <FaCheck className="text-indigo-600" />}
//         </div>
//       </button>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Basic project info */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="bg-gray-50 p-4 rounded border">
//           <h3 className="text-lg font-semibold text-indigo-700 mb-3">Project Information</h3>
//           <div className="space-y-3">
//             <div>
//               <label className="block text-sm font-medium">Project Name *</label>
//               <input
//                 type="text"
//                 value={projectName}
//                 onChange={(e) => setProjectName(e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="Enter project name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Project Type *</label>
//               <select
//                 value={projectType || PROJECT_TYPES.CUSTOM}
//                 onChange={(e) => {
//                   setProjectType(e.target.value);
//                 }}
//                 className="w-full border rounded p-2"
//               >
//                 <option value="">{/* empty for safety */}</option>
//                 <option value={PROJECT_TYPES.CUSTOM}>Custom</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="bg-gray-50 p-4 rounded border">
//           <h3 className="text-lg font-semibold text-indigo-700 mb-3">Property Location</h3>
//           <div className="space-y-3">
//             <div>
//               <label className="block text-sm font-medium">City</label>
//               <input
//                 type="text"
//                 value={city}
//                 onChange={(e) => setCity(e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="Enter city"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Locality</label>
//               <input
//                 type="text"
//                 value={locality}
//                 onChange={(e) => setLocality(e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="Enter locality"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* If no configuration active, show type selection grid */}
//       {!showConfiguration && (
//         <div className="bg-white border rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <FaInfoCircle className="text-indigo-500 mr-2" />
//               <h3 className="text-lg font-semibold text-gray-900">Select Project Type to Customize</h3>
//             </div>
//             <div className="text-sm text-gray-600">Choose one type to configure</div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {typeCard("plotting", "Plotting", "Land plots with individual specifications")}
//             {typeCard("duplex", "Duplex", "Two-floor residential (ground + 1)")}
//             {typeCard("triplex", "Triplex", "Three-floor residential")}
//             {typeCard("apartment", "Apartment", "Multi-floor apartment building")}
//             {typeCard("commercial", "Commercial", "Office / Shop / Showroom / Land")}
//           </div>
//         </div>
//       )}

//       {/* Configuration panel for a chosen type */}
//       {showConfiguration && selectedCustomType && (
//         <div className="bg-white rounded-lg border p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <button onClick={handleBackToSelection} className="text-indigo-600 mr-4">
//                 <FaArrowLeft className="inline mr-2" /> Back
//               </button>
//               <div>
//                 <h3 className="text-lg font-semibold text-indigo-700 capitalize">
//                   {selectedCustomType} Configuration
//                 </h3>
//                 <p className="text-sm text-gray-600 mt-1">Configure the {selectedCustomType} project details below.</p>
//               </div>
//             </div>

//             <div className="text-sm text-gray-500">
//               <span className="bg-indigo-100 px-2 py-1 rounded-full capitalize">{selectedCustomType}</span>
//             </div>
//           </div>

//           {/* Notes and general info */}
//           <div className="mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium">Project Description</label>
//                 <textarea
//                   rows="4"
//                   value={projectDescription}
//                   onChange={(e) => setProjectDescription(e.target.value)}
//                   className="w-full border rounded p-2"
//                   placeholder="Describe the project requirements"
//                 />
//               </div>

//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-sm font-medium">Special Requirements</label>
//                   <input
//                     type="text"
//                     value={specialRequirements}
//                     onChange={(e) => setSpecialRequirements(e.target.value)}
//                     className="w-full border rounded p-2"
//                     placeholder="Any special constraints or features"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium">Project Timeline</label>
//                   <select
//                     value={projectTimeline}
//                     onChange={(e) => setProjectTimeline(e.target.value)}
//                     className="w-full border rounded p-2"
//                   >
//                     <option value="">Select timeline</option>
//                     <option value="short">Short (1-6 months)</option>
//                     <option value="medium">Medium (6-12 months)</option>
//                     <option value="long">Long (1+ years)</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4">
//               <label className="block text-sm font-medium">Additional Notes</label>
//               <textarea
//                 rows="2"
//                 value={additionalNotes}
//                 onChange={(e) => setAdditionalNotes(e.target.value)}
//                 className="w-full border rounded p-2"
//                 placeholder="Extra notes"
//               />
//             </div>
//           </div>

//           {/* Specific configuration for the chosen type */}
//           <div className="mb-6">{renderConfigurationSection()}</div>

//           <div className="flex justify-end gap-3">
//             <button
//               onClick={handleBackToSelection}
//               className="px-4 py-2 rounded border hover:bg-gray-50"
//             >
//               Cancel
//             </button>

//             <button
//               onClick={handleSaveProject}
//               className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700"
//             >
//               Save Custom Project
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomProject;
