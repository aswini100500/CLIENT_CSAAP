// import React, { useState } from 'react';
// import { 
//   FaTools, 
//   FaSearch, 
//   FaUndo, 
//   FaCheck, 
//   FaTimes, 
//   FaSave,
//   FaCar,
//   FaClock,
//   FaBox,
//   FaGasPump,
//   FaIndustry,
//   FaBan,
//   FaBolt,
//   FaCheckCircle,
//   FaCalendar,
//   FaWrench,
//   FaDollarSign,
//   FaChartLine,
//   FaHistory,
//   FaCog
// } from 'react-icons/fa';

// const Equipment = () => {
//   const [formData, setFormData] = useState({
//     equipment: '',
//     costCentre: '',
//     faCode: '',
//     standardFuel: '',
//     fuelPerKm: 0,
//     fuelPerHour: 0,
//     fuelPerUnit: 0,
//     fuelPerLiter: 0,
//     productionPerHour: 0,
//     maxIdleHour: 0,
//     maxBreakDownHour: 0,
//     minWorkingHour: 0,
//     standardWorkingPerDay: 0,
//     standardMaintenanceCost: 0,
//     hireCharges: 0,
//     lifeCycleAge: 0
//   });

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'number' ? parseFloat(value) || 0 : value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Form submitted:', formData);
//     // Handle form submission logic here
//   };

//   const handleCancel = () => {
//     // Handle cancel logic here
//     console.log('Form cancelled');
//   };

//   const handleReset = () => {
//     setFormData({
//       equipment: '',
//       costCentre: '',
//       faCode: '',
//       standardFuel: '',
//       fuelPerKm: 0,
//       fuelPerHour: 0,
//       fuelPerUnit: 0,
//       fuelPerLiter: 0,
//       productionPerHour: 0,
//       maxIdleHour: 0,
//       maxBreakDownHour: 0,
//       minWorkingHour: 0,
//       standardWorkingPerDay: 0,
//       standardMaintenanceCost: 0,
//       hireCharges: 0,
//       lifeCycleAge: 0
//     });
//   };

//   const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
//   const labelClasses = "font-medium text-gray-700 text-sm";
//   const buttonClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="bg-white/20 p-3 rounded-xl mr-4">
//                 <FaTools className="text-white text-2xl" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white mb-1">Equipment Management</h1>
//                 <p className="text-blue-100 text-sm flex items-center">
//                   <FaCog className="mr-2" />
//                   Configure equipment parameters and specifications
//                 </p>
//               </div>
//             </div>
//             <div className="bg-blue-500 rounded-lg px-3 py-1 flex items-center">
//               <FaCheckCircle className="text-white mr-2" />
//               <span className="text-white text-sm font-medium">Active</span>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8">
//           {/* Main Info Section */}
//           <div className="mb-8">
//             <div className="flex items-center mb-6">
//               <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div>
//               <h2 className="text-xl font-bold text-gray-800 flex items-center">
//                 <FaHistory className="mr-2 text-blue-600" />
//                 Main Information
//               </h2>
//             </div>
            
//             {/* Change History Section */}
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-700 flex items-center">
//                   <FaCog className="mr-2 text-gray-600" />
//                   Equipment Configuration
//                 </h3>
                
//               </div>
              
//               {/* Main Form Grid */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Basic Information Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaTools className="mr-2 text-blue-600" />
//                     Basic Information
//                   </h4>
//                   <div className="space-y-4">
//                     <div>
//                       <label className={`${labelClasses} block mb-2`}>Equipment Name</label>
//                       <input
//                         type="text"
//                         name="equipment"
//                         value={formData.equipment}
//                         onChange={handleChange}
//                         className={inputClasses}
//                         placeholder="Enter equipment name"
//                       />
//                     </div>
//                     <div>
//                       <label className={`${labelClasses} block mb-2`}>Cost Centre</label>
//                       <input
//                         type="text"
//                         name="costCentre"
//                         value={formData.costCentre}
//                         onChange={handleChange}
//                         className={inputClasses}
//                         placeholder="Enter cost centre"
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className={`${labelClasses} block mb-2`}>FA Code</label>
//                         <input
//                           type="text"
//                           name="faCode"
//                           value={formData.faCode}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           placeholder="FA Code"
//                         />
//                       </div>
//                       <div>
//                         <label className={`${labelClasses} block mb-2`}>Standard Fuel</label>
//                         <input
//                           type="text"
//                           name="standardFuel"
//                           value={formData.standardFuel}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           placeholder="Fuel type"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Fuel Configuration Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaGasPump className="mr-2 text-green-600" />
//                     Fuel Configuration
//                   </h4>
//                   <div className="space-y-4">
//                     {[
//                       { label: 'Fuel Per Km', value: formData.fuelPerKm, name: 'fuelPerKm', icon: <FaCar className="text-blue-600" /> },
//                       { label: 'Fuel Per Hour', value: formData.fuelPerHour, name: 'fuelPerHour', icon: <FaClock className="text-purple-600" /> },
//                       { label: 'Fuel Per Unit', value: formData.fuelPerUnit, name: 'fuelPerUnit', icon: <FaBox className="text-orange-600" /> },
//                       { label: 'Fuel Per Liter', value: formData.fuelPerLiter, name: 'fuelPerLiter', icon: <FaGasPump className="text-red-600" /> }
//                     ].map((field, index) => (
//                       <div key={index}>
//                         <label className={`${labelClasses} mb-2 flex items-center`}>
//                           <span className="mr-2">{field.icon}</span>
//                           {field.label}
//                         </label>
//                         <div className="flex gap-2">
//                           <input
//                             type="number"
//                             name={field.name}
//                             value={field.value}
//                             onChange={handleChange}
//                             className={inputClasses}
//                             step="0.01"
//                             min="0"
//                           />
//                           <button 
//                             type="button"
//                             className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center whitespace-nowrap"
//                           >
//                             <FaSearch className="mr-2" />
//                             UoM
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Production Configuration Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaIndustry className="mr-2 text-indigo-600" />
//                     Production Settings
//                   </h4>
//                   <div className="space-y-4">
//                     <div>
//                       <label className={`${labelClasses}  mb-2 flex items-center`}>
                       
//                         Production Per Hour
//                       </label>
//                       <div className="flex gap-2">
//                         <input
//                           type="number"
//                           name="productionPerHour"
//                           value={formData.productionPerHour}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           step="0.01"
//                           min="0"
//                         />
//                         <button 
//                           type="button"
//                           className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center whitespace-nowrap"
//                         >
//                           <FaSearch className="mr-2" />
//                           UoM
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Operational Limits Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaBan className="mr-2 text-red-600" />
//                     Operational Limits
//                   </h4>
//                   <div className="space-y-4">
//                     {[
//                       { label: 'Maximum Idle Hour', value: formData.maxIdleHour, name: 'maxIdleHour' },
//                       { label: 'Maximum Break Down Hour', value: formData.maxBreakDownHour, name: 'maxBreakDownHour', icon: <FaBolt className="text-yellow-600" /> },
//                       { label: 'Expected Min Working Hour', value: formData.minWorkingHour, name: 'minWorkingHour', icon: <FaCheckCircle className="text-green-600" /> },
//                       { label: 'Standard Working Per Day', value: formData.standardWorkingPerDay, name: 'standardWorkingPerDay', icon: <FaCalendar className="text-blue-600" /> }
//                     ].map((field, index) => (
//                       <div key={index}>
//                         <label className={`${labelClasses} mb-2 flex items-center`}>
//                           <span className="mr-2">{field.icon}</span>
//                           {field.label}
//                         </label>
//                         <input
//                           type="number"
//                           name={field.name}
//                           value={field.value}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           min="0"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Financial Configuration Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaDollarSign className="mr-2 text-green-600" />
//                     Financial Settings
//                   </h4>
//                   <div className="space-y-4">
//                     {[
//                       { label: 'Standard Maintenance Cost', value: formData.standardMaintenanceCost, name: 'standardMaintenanceCost', icon: <FaWrench className="text-gray-600" /> },
//                       { label: 'Hire Charges', value: formData.hireCharges, name: 'hireCharges', icon: <FaDollarSign className="text-green-600" /> },
//                       { label: 'Life Cycle Age (Years)', value: formData.lifeCycleAge, name: 'lifeCycleAge', icon: <FaChartLine className="text-purple-600" /> }
//                     ].map((field, index) => (
//                       <div key={index}>
//                         <label className={`${labelClasses} mb-2 flex items-center`}>
//                           <span className="mr-2">{field.icon}</span>
//                           {field.label}
//                         </label>
//                         <input
//                           type="number"
//                           name={field.name}
//                           value={field.value}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           step="0.01"
//                           min="0"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-between items-center pt-8 border-t border-gray-200">
//             <div className="text-sm text-gray-500 flex items-center">
//               <FaHistory className="mr-2" />
//               Last updated: {new Date().toLocaleDateString()}
//             </div>
//             <div className="flex space-x-3">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className={`${buttonClasses} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 flex items-center`}
//               >
//                 <FaTimes className="mr-2" />
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className={`${buttonClasses} bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg shadow-blue-500/25 flex items-center`}
//               >
//                 <FaSave className="mr-2" />
//                 Save Equipment
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Equipment;



import React, { useState } from "react";
import Vehicle from "../Equipment management/Vehicle";
import EquipmentManage from "../Equipment management/EquipmentManage";
import Operator from "../Equipment management/Operator";
import Drivers from "../Equipment management/Drivers";

const Equipment = () => {
  const [activeTab, setActiveTab] = useState("vehicles");

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Equipment Management</h1>
      {/* Tabs */}
      <div className="flex flex-wrap gap-0.5 border-b border-gray-300 mb-2">
        {["vehicles", "equipment", "operators", "drivers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-blue-600 border-t shadow-xl"
                : "bg-white text-gray-700 hover:bg-blue-50"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-2xl shadow-md transition-all">
        {activeTab === "vehicles" && (
            <Vehicle />
        )}

        {activeTab === "equipment" && (
         <EquipmentManage />
        )}

        {activeTab === "operators" && (
        <Operator />
        )}

        {activeTab === "drivers" && (
         <Drivers />
        )}
      </div>
    </div>
  );
};

export default Equipment;









// import React, { useState } from 'react';
// import { 
//   FaTools, 
//   FaSearch, 
//   FaUndo, 
//   FaCheck, 
//   FaTimes, 
//   FaSave,
//   FaCar,
//   FaClock,
//   FaBox,
//   FaGasPump,
//   FaIndustry,
//   FaBan,
//   FaBolt,
//   FaCheckCircle,
//   FaCalendar,
//   FaWrench,
//   FaDollarSign,
//   FaChartLine,
//   FaHistory,
//   FaCog
// } from 'react-icons/fa';

// const Equipment = () => {
//   const [formData, setFormData] = useState({
//     equipment: '',
//     costCentre: '',
//     faCode: '',
//     standardFuel: '',
//     fuelPerKm: 0,
//     fuelPerHour: 0,
//     fuelPerUnit: 0,
//     fuelPerLiter: 0,
//     productionPerHour: 0,
//     maxIdleHour: 0,
//     maxBreakDownHour: 0,
//     minWorkingHour: 0,
//     standardWorkingPerDay: 0,
//     standardMaintenanceCost: 0,
//     hireCharges: 0,
//     lifeCycleAge: 0
//   });

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'number' ? parseFloat(value) || 0 : value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Form submitted:', formData);
//     // Handle form submission logic here
//   };

//   const handleCancel = () => {
//     // Handle cancel logic here
//     console.log('Form cancelled');
//   };

//   const handleReset = () => {
//     setFormData({
//       equipment: '',
//       costCentre: '',
//       faCode: '',
//       standardFuel: '',
//       fuelPerKm: 0,
//       fuelPerHour: 0,
//       fuelPerUnit: 0,
//       fuelPerLiter: 0,
//       productionPerHour: 0,
//       maxIdleHour: 0,
//       maxBreakDownHour: 0,
//       minWorkingHour: 0,
//       standardWorkingPerDay: 0,
//       standardMaintenanceCost: 0,
//       hireCharges: 0,
//       lifeCycleAge: 0
//     });
//   };

//   const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
//   const labelClasses = "font-medium text-gray-700 text-sm";
//   const buttonClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="bg-white/20 p-3 rounded-xl mr-4">
//                 <FaTools className="text-white text-2xl" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white mb-1">Equipment Management</h1>
//                 <p className="text-blue-100 text-sm flex items-center">
//                   <FaCog className="mr-2" />
//                   Configure equipment parameters and specifications
//                 </p>
//               </div>
//             </div>
//             <div className="bg-blue-500 rounded-lg px-3 py-1 flex items-center">
//               <FaCheckCircle className="text-white mr-2" />
//               <span className="text-white text-sm font-medium">Active</span>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8">
//           {/* Main Info Section */}
//           <div className="mb-8">
//             <div className="flex items-center mb-6">
//               <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div>
//               <h2 className="text-xl font-bold text-gray-800 flex items-center">
//                 <FaHistory className="mr-2 text-blue-600" />
//                 Main Information
//               </h2>
//             </div>
            
//             {/* Change History Section */}
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-700 flex items-center">
//                   <FaCog className="mr-2 text-gray-600" />
//                   Equipment Configuration
//                 </h3>
                
//               </div>
              
//               {/* Main Form Grid */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Basic Information Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaTools className="mr-2 text-blue-600" />
//                     Basic Information
//                   </h4>
//                   <div className="space-y-4">
//                     <div>
//                       <label className={`${labelClasses} block mb-2`}>Equipment Name</label>
//                       <input
//                         type="text"
//                         name="equipment"
//                         value={formData.equipment}
//                         onChange={handleChange}
//                         className={inputClasses}
//                         placeholder="Enter equipment name"
//                       />
//                     </div>
//                     <div>
//                       <label className={`${labelClasses} block mb-2`}>Cost Centre</label>
//                       <input
//                         type="text"
//                         name="costCentre"
//                         value={formData.costCentre}
//                         onChange={handleChange}
//                         className={inputClasses}
//                         placeholder="Enter cost centre"
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className={`${labelClasses} block mb-2`}>FA Code</label>
//                         <input
//                           type="text"
//                           name="faCode"
//                           value={formData.faCode}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           placeholder="FA Code"
//                         />
//                       </div>
//                       <div>
//                         <label className={`${labelClasses} block mb-2`}>Standard Fuel</label>
//                         <input
//                           type="text"
//                           name="standardFuel"
//                           value={formData.standardFuel}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           placeholder="Fuel type"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Fuel Configuration Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaGasPump className="mr-2 text-green-600" />
//                     Fuel Configuration
//                   </h4>
//                   <div className="space-y-4">
//                     {[
//                       { label: 'Fuel Per Km', value: formData.fuelPerKm, name: 'fuelPerKm', icon: <FaCar className="text-blue-600" /> },
//                       { label: 'Fuel Per Hour', value: formData.fuelPerHour, name: 'fuelPerHour', icon: <FaClock className="text-purple-600" /> },
//                       { label: 'Fuel Per Unit', value: formData.fuelPerUnit, name: 'fuelPerUnit', icon: <FaBox className="text-orange-600" /> },
//                       { label: 'Fuel Per Liter', value: formData.fuelPerLiter, name: 'fuelPerLiter', icon: <FaGasPump className="text-red-600" /> }
//                     ].map((field, index) => (
//                       <div key={index}>
//                         <label className={`${labelClasses} mb-2 flex items-center`}>
//                           <span className="mr-2">{field.icon}</span>
//                           {field.label}
//                         </label>
//                         <div className="flex gap-2">
//                           <input
//                             type="number"
//                             name={field.name}
//                             value={field.value}
//                             onChange={handleChange}
//                             className={inputClasses}
//                             step="0.01"
//                             min="0"
//                           />
//                           <button 
//                             type="button"
//                             className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center whitespace-nowrap"
//                           >
//                             <FaSearch className="mr-2" />
//                             UoM
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Production Configuration Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaIndustry className="mr-2 text-indigo-600" />
//                     Production Settings
//                   </h4>
//                   <div className="space-y-4">
//                     <div>
//                       <label className={`${labelClasses}  mb-2 flex items-center`}>
                       
//                         Production Per Hour
//                       </label>
//                       <div className="flex gap-2">
//                         <input
//                           type="number"
//                           name="productionPerHour"
//                           value={formData.productionPerHour}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           step="0.01"
//                           min="0"
//                         />
//                         <button 
//                           type="button"
//                           className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center whitespace-nowrap"
//                         >
//                           <FaSearch className="mr-2" />
//                           UoM
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Operational Limits Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaBan className="mr-2 text-red-600" />
//                     Operational Limits
//                   </h4>
//                   <div className="space-y-4">
//                     {[
//                       { label: 'Maximum Idle Hour', value: formData.maxIdleHour, name: 'maxIdleHour' },
//                       { label: 'Maximum Break Down Hour', value: formData.maxBreakDownHour, name: 'maxBreakDownHour', icon: <FaBolt className="text-yellow-600" /> },
//                       { label: 'Expected Min Working Hour', value: formData.minWorkingHour, name: 'minWorkingHour', icon: <FaCheckCircle className="text-green-600" /> },
//                       { label: 'Standard Working Per Day', value: formData.standardWorkingPerDay, name: 'standardWorkingPerDay', icon: <FaCalendar className="text-blue-600" /> }
//                     ].map((field, index) => (
//                       <div key={index}>
//                         <label className={`${labelClasses} mb-2 flex items-center`}>
//                           <span className="mr-2">{field.icon}</span>
//                           {field.label}
//                         </label>
//                         <input
//                           type="number"
//                           name={field.name}
//                           value={field.value}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           min="0"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Financial Configuration Card */}
//                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
//                     <FaDollarSign className="mr-2 text-green-600" />
//                     Financial Settings
//                   </h4>
//                   <div className="space-y-4">
//                     {[
//                       { label: 'Standard Maintenance Cost', value: formData.standardMaintenanceCost, name: 'standardMaintenanceCost', icon: <FaWrench className="text-gray-600" /> },
//                       { label: 'Hire Charges', value: formData.hireCharges, name: 'hireCharges', icon: <FaDollarSign className="text-green-600" /> },
//                       { label: 'Life Cycle Age (Years)', value: formData.lifeCycleAge, name: 'lifeCycleAge', icon: <FaChartLine className="text-purple-600" /> }
//                     ].map((field, index) => (
//                       <div key={index}>
//                         <label className={`${labelClasses} mb-2 flex items-center`}>
//                           <span className="mr-2">{field.icon}</span>
//                           {field.label}
//                         </label>
//                         <input
//                           type="number"
//                           name={field.name}
//                           value={field.value}
//                           onChange={handleChange}
//                           className={inputClasses}
//                           step="0.01"
//                           min="0"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-between items-center pt-8 border-t border-gray-200">
//             <div className="text-sm text-gray-500 flex items-center">
//               <FaHistory className="mr-2" />
//               Last updated: {new Date().toLocaleDateString()}
//             </div>
//             <div className="flex space-x-3">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className={`${buttonClasses} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 flex items-center`}
//               >
//                 <FaTimes className="mr-2" />
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className={`${buttonClasses} bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg shadow-blue-500/25 flex items-center`}
//               >
//                 <FaSave className="mr-2" />
//                 Save Equipment
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Equipment;



