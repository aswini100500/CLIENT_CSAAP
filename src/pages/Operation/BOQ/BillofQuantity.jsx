//   // Demo Subletting when employer selected
//   useEffect(() => {
//     if (!selectedEmployer) return;
//     setLoading(true);
//     setTimeout(() => {
//       const demoSubletting = [
//         {
//           id: 1,
//           name: "Excavation Work",
//           description: "Earth excavation and site preparation",
//           contractor: "Sharma Earth Movers",
//           contact: "sharma.earth@email.com",
//           fields: [
//             {
//               label: "Benchmark Price",
//               key: "benchmarkPrice",
//               value: 500,
//               unit: "m³",
//             },
//             {
//               label: "Coated Price",
//               key: "coatedPrice",
//               value: 480,
//               unit: "m³",
//             },
//             { label: "Final Price", key: "finalPrice", value: 490, unit: "m³" },
//             { label: "Quantity", key: "quantity", value: 120, unit: "m³" },
//           ],
//           editing: false,
//           status: "active",
//         },
//         {
//           id: 2,
//           name: "Concrete Work",
//           description: "Foundation and structural concrete work",
//           contractor: "ABC Cement Works",
//           contact: "concrete@abcworks.com",
//           fields: [
//             {
//               label: "Benchmark Price",
//               key: "benchmarkPrice",
//               value: 650,
//               unit: "m³",
//             },
//             {
//               label: "Coated Price",
//               key: "coatedPrice",
//               value: 640,
//               unit: "m³",
//             },
//             { label: "Final Price", key: "finalPrice", value: 645, unit: "m³" },
//             { label: "Quantity", key: "quantity", value: 80, unit: "m³" },
//           ],
//           editing: false,
//           status: "active",
//         },
//       ];
//       setSubletting(demoSubletting);
//       setLoading(false);
//     }, 800);
//   }, [selectedEmployer]);

//   // Filter subletting items based on search
//   const filteredSubletting = subletting.filter(
//     (item) =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.contractor.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const toggleExpand = (id) => {
//     setExpanded(expanded === id ? null : id);
//   };

//   const handleFieldChange = (itemId, fieldKey, value) => {
//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === itemId
//           ? {
//               ...item,
//               fields: item.fields?.map((f) =>
//                 f.key === fieldKey ? { ...f, value: Number(value) } : f
//               ),
//             }
//           : item
//       )
//     );
//   };

//   const handleContractorChange = (id, field, value) => {
//     setSubletting((prev) =>
//       prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
//     );
//   };

//   const handleEditToggle = (id) => {
//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === id ? { ...item, editing: !item.editing } : item
//       )
//     );
//   };

//   const deleteSublettingItem = async (id, name) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: `Delete "${name}"?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       setSubletting((prev) => prev.filter((item) => item.id !== id));
//       if (expanded === id) setExpanded(null);
//       Swal.fire("Deleted!", "Subletting item has been deleted.", "success");
//     }
//   };

//   const addSublettingItem = async () => {
//     const { value: formValues } = await Swal.fire({
//       title: "Add New Subletting Item",
//       html: `
//         <input id="swal-name" class="swal2-input" placeholder="Work Item Name" required>
//         <input id="swal-description" class="swal2-input" placeholder="Description">
//         <input id="swal-contractor" class="swal2-input" placeholder="Contractor Name">
//         <input id="swal-contact" class="swal2-input" placeholder="Contractor Contact">
//       `,
//       focusConfirm: false,
//       showCancelButton: true,
//       confirmButtonText: "Add Item",
//       cancelButtonText: "Cancel",
//       preConfirm: () => {
//         return {
//           name: document.getElementById("swal-name").value,
//           description: document.getElementById("swal-description").value,
//           contractor: document.getElementById("swal-contractor").value,
//           contact: document.getElementById("swal-contact").value,
//         };
//       },
//       validation: (values) => {
//         if (!values.name) {
//           Swal.showValidationMessage("Please enter a work item name");
//         }
//       },
//     });

//     if (!formValues) return;

//     const newItem = {
//       id: Date.now(),
//       name: formValues.name,
//       description: formValues.description || "",
//       contractor: formValues.contractor || "",
//       contact: formValues.contact || "",
//       fields: [
//         {
//           label: "Benchmark Price",
//           key: "benchmarkPrice",
//           value: 0,
//           unit: "unit",
//         },
//         { label: "Coated Price", key: "coatedPrice", value: 0, unit: "unit" },
//         { label: "Final Price", key: "finalPrice", value: 0, unit: "unit" },
//         { label: "Quantity", key: "quantity", value: 0, unit: "unit" },
//       ],
//       editing: true,
//       status: "active",
//     };

//     setSubletting((prev) => [...prev, newItem]);
//     setExpanded(newItem.id);
//   };

//   const addFieldToItem = async (itemId) => {
//     const { value: fieldName } = await Swal.fire({
//       title: "Add New Field",
//       input: "text",
//       inputPlaceholder: "Field Name (e.g., Material Cost, Labor Cost)",
//       showCancelButton: true,
//       confirmButtonText: "Add Field",
//       cancelButtonText: "Cancel",
//     });

//     if (!fieldName) return;

//     const { value: unit } = await Swal.fire({
//       title: "Unit of Measurement",
//       input: "text",
//       inputPlaceholder: "e.g., m³, kg, unit",
//       showCancelButton: true,
//       confirmButtonText: "Add",
//       cancelButtonText: "Skip",
//     });

//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === itemId
//           ? {
//               ...item,
//               fields: [
//                 ...(item.fields || []),
//                 {
//                   label: fieldName,
//                   key: `field_${Date.now()}`,
//                   value: 0,
//                   unit: unit || "unit",
//                 },
//               ],
//             }
//           : item
//       )
//     );
//   };

//   const removeField = (itemId, fieldKey) => {
//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === itemId
//           ? {
//               ...item,
//               fields: item.fields.filter((f) => f.key !== fieldKey),
//             }
//           : item
//       )
//     );
//   };

//   const calculateTotal = (item) => {
//     if (!item || !Array.isArray(item.fields)) return 0;
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return Number(final) * Number(qty);
//   };

//   const calculateSavings = (item) => {
//     if (!item || !Array.isArray(item.fields)) return 0;
//     const benchmark =
//       item.fields.find((f) => f.key === "benchmarkPrice")?.value || 0;
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return (Number(benchmark) - Number(final)) * Number(qty);
//   };

//   const grandTotal = subletting.reduce(
//     (acc, item) => acc + calculateTotal(item),
//     0
//   );
//   const totalSavings = subletting.reduce(
//     (acc, item) => acc + calculateSavings(item),
//     0
//   );

//   const selectedProjectData = projects.find(
//     (p) => p.id === Number(selectedProject)
//   );
//   const selectedEmployerData = employers.find(
//     (e) => e.id === Number(selectedEmployer)
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <FileText className="h-8 w-8 text-blue-600" />
//             <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
//               Bill of Quantities
//             </h1>
//           </div>
//           <p className="text-lg text-gray-600 dark:text-gray-300">
//             Manage project subletting items and quantities efficiently
//           </p>
//         </div>

//         {/* Project & Employer Selection */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Project Selection */}
//             <div className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <Building className="h-5 w-5 text-blue-600" />
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Select Project
//                 </label>
//               </div>
//               <select
//                 value={selectedProject}
//                 onChange={(e) => setSelectedProject(e.target.value)}
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">-- Select Project --</option>
//                 {projects.map((proj) => (
//                   <option key={proj.id} value={proj.id}>
//                     {proj.name} • {proj.location} • {proj.budget}
//                   </option>
//                 ))}
//               </select>

//               {selectedProjectData && (
//                 <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//                   <p className="text-sm text-blue-800 dark:text-blue-200">
//                     <strong>Location:</strong> {selectedProjectData.location} •
//                     <strong> Budget:</strong> {selectedProjectData.budget}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Employer Selection */}
//             <div className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <Users className="h-5 w-5 text-green-600" />
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Select Principal Contractor
//                 </label>
//               </div>
//               <select
//                 value={selectedEmployer}
//                 onChange={(e) => setSelectedEmployer(e.target.value)}
//                 disabled={!selectedProject}
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-60 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               >
//                 <option value="">-- Select Employer --</option>
//                 {employers.map((emp) => (
//                   <option key={emp.id} value={emp.id}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </select>

//               {selectedEmployerData && (
//                 <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
//                   <p className="text-sm text-green-800 dark:text-green-200">
//                     <strong>Contact:</strong> {selectedEmployerData.contact}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Loader */}
//         {loading && (
//           <div className="flex justify-center items-center py-12">
//             <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
//             <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
//               Loading data...
//             </span>
//           </div>
//         )}

//         {/* Subletting Items Section */}
//         {!loading && selectedEmployer && (
//           <div className="space-y-6">
//             {/* Header with Stats and Actions */}
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
//               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
//                     <Calculator className="h-6 w-6 text-blue-600" />
//                     Subletting Items
//                   </h2>
//                   <p className="text-gray-600 dark:text-gray-300 mt-1">
//                     {subletting.length} items • ₹{grandTotal.toFixed(2)} total
//                   </p>
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-3">
//                   {/* Search */}
//                   <div className="relative">
//                     <input
//                       type="text"
//                       placeholder="Search items or contractors..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <svg
//                         className="h-5 w-5 text-gray-400"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                         />
//                       </svg>
//                     </div>
//                   </div>

//                   <button
//                     onClick={addSublettingItem}
//                     className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
//                   >
//                     <Plus size={18} /> Add Item
//                   </button>
//                 </div>
//               </div>

//               {/* Summary Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
//                   <p className="text-sm text-blue-600 dark:text-blue-400">
//                     Total Value
//                   </p>
//                   <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
//                     ₹{grandTotal.toFixed(2)}
//                   </p>
//                 </div>
//                 <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
//                   <p className="text-sm text-green-600 dark:text-green-400">
//                     Total Savings
//                   </p>
//                   <p className="text-2xl font-bold text-green-700 dark:text-green-300">
//                     ₹{totalSavings.toFixed(2)}
//                   </p>
//                 </div>
//                 <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
//                   <p className="text-sm text-purple-600 dark:text-purple-400">
//                     Items Count
//                   </p>
//                   <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
//                     {subletting.length}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Subletting Items List */}
//             <div className="space-y-4">
//               {filteredSubletting.length === 0 ? (
//                 <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
//                   <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//                     No subletting items found
//                   </h3>
//                   <p className="text-gray-500 dark:text-gray-400 mb-4">
//                     {searchTerm
//                       ? "Try adjusting your search terms"
//                       : "Get started by adding your first subletting item"}
//                   </p>
//                   <button
//                     onClick={addSublettingItem}
//                     className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
//                   >
//                     <Plus size={18} /> Add First Item
//                   </button>
//                 </div>
//               ) : (
//                 filteredSubletting.map((item) => (
//                   <div
//                     key={item.id}
//                     className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
//                   >
//                     {/* Item Header */}
//                     <button
//                       onClick={() => toggleExpand(item.id)}
//                       className="w-full flex justify-between items-center p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
//                     >
//                       <div className="flex items-start gap-4 flex-1">
//                         <div className="flex-1 text-left">
//                           <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
//                             {item.name}
//                           </h3>
//                           <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
//                             {item.contractor} • {item.description}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-lg font-bold text-green-600 dark:text-green-400">
//                             ₹{calculateTotal(item).toFixed(2)}
//                           </p>
//                           <p className="text-sm text-gray-500 dark:text-gray-400">
//                             {item.fields?.find((f) => f.key === "quantity")
//                               ?.value || 0}{" "}
//                             units
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-4 ml-4">
//                         <div
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             item.status === "active"
//                               ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
//                               : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
//                           }`}
//                         >
//                           {item.status}
//                         </div>
//                         {expanded === item.id ? (
//                           <ChevronUp className="text-gray-500" />
//                         ) : (
//                           <ChevronDown className="text-gray-500" />
//                         )}
//                       </div>
//                     </button>

//                     {/* Expanded Details */}
//                     {expanded === item.id && (
//                       <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
//                         {/* Basic Info */}
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                               Work Item Details
//                             </label>
//                             <input
//                               type="text"
//                               value={item.name}
//                               onChange={(e) =>
//                                 handleContractorChange(
//                                   item.id,
//                                   "name",
//                                   e.target.value
//                                 )
//                               }
//                               disabled={!item.editing}
//                               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mb-3"
//                               placeholder="Work item name"
//                             />
//                             <textarea
//                               value={item.description}
//                               onChange={(e) =>
//                                 handleContractorChange(
//                                   item.id,
//                                   "description",
//                                   e.target.value
//                                 )
//                               }
//                               disabled={!item.editing}
//                               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                               placeholder="Description"
//                               rows="2"
//                             />
//                           </div>

//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                               Contractor Details
//                             </label>
//                             <input
//                               type="text"
//                               value={item.contractor}
//                               onChange={(e) =>
//                                 handleContractorChange(
//                                   item.id,
//                                   "contractor",
//                                   e.target.value
//                                 )
//                               }
//                               disabled={!item.editing}
//                               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mb-3"
//                               placeholder="Contractor name"
//                             />
//                             <input
//                               type="text"
//                               value={item.contact}
//                               onChange={(e) =>
//                                 handleContractorChange(
//                                   item.id,
//                                   "contact",
//                                   e.target.value
//                                 )
//                               }
//                               disabled={!item.editing}
//                               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                               placeholder="Contact information"
//                             />
//                           </div>
//                         </div>

//                         {/* Pricing Fields */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
//                             Pricing & Quantities
//                           </label>
//                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                             {item.fields?.map((field) => (
//                               <div key={field.key} className="relative">
//                                 <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
//                                   {field.label}
//                                 </label>
//                                 <input
//                                   type="number"
//                                   value={field.value}
//                                   onChange={(e) =>
//                                     handleFieldChange(
//                                       item.id,
//                                       field.key,
//                                       e.target.value
//                                     )
//                                   }
//                                   disabled={!item.editing}
//                                   className="w-full p-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                                 />
//                                 <span className="absolute right-2 top-7 text-xs text-gray-500 dark:text-gray-400">
//                                   {field.unit}
//                                 </span>
//                                 {item.editing &&
//                                   field.key.includes("extraField") && (
//                                     <button
//                                       onClick={() =>
//                                         removeField(item.id, field.key)
//                                       }
//                                       className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
//                                     >
//                                       <Trash2 size={12} />
//                                     </button>
//                                   )}
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
//                           <div className="flex gap-3">
//                             <button
//                               onClick={() => addFieldToItem(item.id)}
//                               disabled={!item.editing}
//                               className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
//                             >
//                               <Plus size={16} /> Add Field
//                             </button>

//                             <button
//                               onClick={() =>
//                                 deleteSublettingItem(item.id, item.name)
//                               }
//                               className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
//                             >
//                               <Trash2 size={16} /> Delete
//                             </button>
//                           </div>

//                           <div className="flex items-center gap-6">
//                             <div className="text-right">
//                               <p className="text-sm text-gray-600 dark:text-gray-400">
//                                 Item Total
//                               </p>
//                               <p className="text-xl font-bold text-green-600 dark:text-green-400">
//                                 ₹{calculateTotal(item).toFixed(2)}
//                               </p>
//                               {calculateSavings(item) > 0 && (
//                                 <p className="text-xs text-green-600 dark:text-green-400">
//                                   Savings: ₹{calculateSavings(item).toFixed(2)}
//                                 </p>
//                               )}
//                             </div>

//                             <button
//                               onClick={() => handleEditToggle(item.id)}
//                               className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors duration-200 ${
//                                 item.editing
//                                   ? "bg-green-600 hover:bg-green-700 text-white"
//                                   : "bg-blue-600 hover:bg-blue-700 text-white"
//                               }`}
//                             >
//                               {item.editing ? (
//                                 <Save size={16} />
//                               ) : (
//                                 <Edit size={16} />
//                               )}
//                               {item.editing ? "Save Changes" : "Edit Item"}
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* Grand Total */}
//             {filteredSubletting.length > 0 && (
//               <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h3 className="text-xl font-bold">Grand Total</h3>
//                     <p className="text-blue-100">
//                       {subletting.length} items • Total Savings: ₹
//                       {totalSavings.toFixed(2)}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-3xl font-bold">
//                       ₹{grandTotal.toFixed(2)}
//                     </p>
//                     <p className="text-blue-100 text-sm">
//                       Inclusive of all items
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Empty State when no employer selected */}
//         {!loading && !selectedEmployer && selectedProject && (
//           <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
//             <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
//               Select a Principal Employer
//             </h3>
//             <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
//               Choose a principal employer from the dropdown above to start
//               managing subletting items and quantities for your project.
//             </p>
//           </div>
//         )}

//         {/* Empty State when no project selected */}
//         {!loading && !selectedProject && (
//           <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
//             <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
//               Select a Project
//             </h3>
//             <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
//               Choose a project from the dropdown above to get started with your
//               Bill of Quantities management.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Bill;



// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   Edit,
//   Save,
//   Loader2,
//   Trash2,
//   Calculator,
//   Building,
//   Users,
//   FileText,
// } from "lucide-react";
// import Swal from "sweetalert2";
// import "sweetalert2/dist/sweetalert2.min.css";

// const Bill = () => {
//   const [projects, setProjects] = useState([]);
//   const [employers, setEmployers] = useState([]);
//   const [subletting, setSubletting] = useState([]);
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedEmployer, setSelectedEmployer] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [expandedContractor, setExpandedContractor] = useState(null);
//   const [expandedItem, setExpandedItem] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Demo Projects
//   useEffect(() => {
//     setProjects([
//       { id: 1, name: "Project A", location: "Mumbai", budget: "₹25 Cr" },
//       { id: 2, name: "Project B", location: "Delhi", budget: "₹45 Cr" },
//       { id: 3, name: "Project C", location: "Bangalore", budget: "₹120 Cr" },
//     ]);
//   }, []);

//   // Load Principal Contractors based on selected project
//   useEffect(() => {
//     if (!selectedProject) return;
//     setLoading(true);
//     setTimeout(() => {
//       const demoEmployers = {
//         1: [
//           { id: 101, name: "ABC Constructions Ltd" },
//           { id: 102, name: "MegaBuild Corp" },
//         ],
//         2: [
//           { id: 103, name: "Skyline Developers" },
//           { id: 104, name: "UrbanRise Group" },
//         ],
//         3: [{ id: 105, name: "Highway Infra Pvt Ltd" }],
//       };
//       setEmployers(demoEmployers[selectedProject] || []);
//       setSelectedEmployer("");
//       setSubletting([]);
//       setLoading(false);
//     }, 500);
//   }, [selectedProject]);

//   // Load subletting items based on selected employer
//   useEffect(() => {
//     if (!selectedEmployer) return;
//     setLoading(true);
//     setTimeout(() => {
//       const demoSubletting = [
//         {
//           id: 1,
//           contractor: "Sharma Earth Movers",
//           name: "Excavation Work",
//           description: "Earth excavation and site preparation",
//           fields: [
//             { label: "Benchmark Price", key: "benchmarkPrice", value: 500, unit: "m³" },
//             { label: "Coated Price", key: "coatedPrice", value: 480, unit: "m³" },
//             { label: "Final Price", key: "finalPrice", value: 490, unit: "m³" },
//             { label: "Quantity", key: "quantity", value: 120, unit: "m³" },
//           ],
//           editing: false,
//           status: "active",
//         },
//         {
//           id: 2,
//           contractor: "ABC Cement Works",
//           name: "Concrete Work",
//           description: "Foundation and structural concrete work",
//           fields: [
//             { label: "Benchmark Price", key: "benchmarkPrice", value: 650, unit: "m³" },
//             { label: "Coated Price", key: "coatedPrice", value: 640, unit: "m³" },
//             { label: "Final Price", key: "finalPrice", value: 645, unit: "m³" },
//             { label: "Quantity", key: "quantity", value: 80, unit: "m³" },
//           ],
//           editing: false,
//           status: "active",
//         },
//       ];
//       setSubletting(demoSubletting);
//       setLoading(false);
//     }, 800);
//   }, [selectedEmployer]);

//   // Filter items by search term
//   const filteredSubletting = subletting.filter(
//     (item) =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.contractor.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Group sublets by contractor
//   const groupedByContractor = filteredSubletting.reduce((acc, item) => {
//     if (!acc[item.contractor]) acc[item.contractor] = [];
//     acc[item.contractor].push(item);
//     return acc;
//   }, {});

//   // Expand/collapse contractor card
//   const toggleContractor = (contractor) => {
//     setExpandedContractor(expandedContractor === contractor ? null : contractor);
//   };

//   // Expand/collapse sublet item
//   const toggleItem = (id) => {
//     setExpandedItem(expandedItem === id ? null : id);
//   };

//   const handleFieldChange = (itemId, fieldKey, value) => {
//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === itemId
//           ? { ...item, fields: item.fields.map((f) => (f.key === fieldKey ? { ...f, value: Number(value) } : f)) }
//           : item
//       )
//     );
//   };

//   const handleEditToggle = (id) => {
//     setSubletting((prev) =>
//       prev.map((item) => {
//         if (item.id === id) {
//           if (item.editing) {
//             // Save action (here you can call backend API)
//             console.log("Saving item", item);
//           }
//           return { ...item, editing: !item.editing };
//         }
//         return item;
//       })
//     );
//   };

//   const calculateTotal = (item) => {
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return final * qty;
//   };

//   const calculateSavings = (item) => {
//     const benchmark = item.fields.find((f) => f.key === "benchmarkPrice")?.value || 0;
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return (benchmark - final) * qty;
//   };

//   const grandTotal = filteredSubletting.reduce((acc, item) => acc + calculateTotal(item), 0);
//   const totalSavings = filteredSubletting.reduce((acc, item) => acc + calculateSavings(item), 0);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <FileText className="h-8 w-8 text-blue-600" />
//             <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Bill of Quantities</h1>
//           </div>
//           <p className="text-lg text-gray-600 dark:text-gray-300">Manage project subletting items efficiently</p>
//         </div>

//         {/* Project & Employer Selection */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div>
//               <label className="block mb-2 font-semibold">Select Project</label>
//               <select
//                 value={selectedProject}
//                 onChange={(e) => setSelectedProject(e.target.value)}
//                 className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//               >
//                 <option value="">-- Select Project --</option>
//                 {projects.map((proj) => (
//                   <option key={proj.id} value={proj.id}>
//                     {proj.name} • {proj.location} • {proj.budget}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold">Select Principal Contractor</label>
//               <select
//                 value={selectedEmployer}
//                 onChange={(e) => setSelectedEmployer(e.target.value)}
//                 disabled={!selectedProject}
//                 className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 disabled:opacity-60"
//               >
//                 <option value="">-- Select Contractor --</option>
//                 {employers.map((emp) => (
//                   <option key={emp.id} value={emp.id}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {loading && (
//           <div className="flex justify-center items-center py-12">
//             <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
//             <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading...</span>
//           </div>
//         )}

//         {/* Subletting List */}
//         {!loading && selectedEmployer && (
//           <div className="space-y-4">
//             {/* Search */}
//             <div className="mb-4">
//               <input
//                 type="text"
//                 placeholder="Search by item or contractor..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//               />
//             </div>

//             {Object.keys(groupedByContractor).map((contractor) => (
//               <div key={contractor} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
//                 <button
//                   onClick={() => toggleContractor(contractor)}
//                   className="w-full p-4 flex justify-between items-center font-semibold text-lg"
//                 >
//                   {contractor}
//                   {expandedContractor === contractor ? <ChevronUp /> : <ChevronDown />}
//                 </button>

//                 {expandedContractor === contractor &&
//                   groupedByContractor[contractor].map((item) => (
//                     <div key={item.id} className="border-t border-gray-200 dark:border-gray-700 p-4">
//                       <div className="flex justify-between items-center mb-2">
//                         <div>
//                           <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
//                           <p className="text-sm text-gray-500 dark:text-gray-300">{item.description}</p>
//                         </div>
//                         <button
//                           onClick={() => toggleItem(item.id)}
//                           className="px-3 py-1 bg-blue-600 text-white rounded-lg"
//                         >
//                           {expandedItem === item.id ? "Hide" : "Details"}
//                         </button>
//                       </div>

//                       {expandedItem === item.id && (
//                         <div className="mt-3 space-y-3">
//                           {item.fields.map((field) => (
//                             <div key={field.key} className="flex items-center gap-4">
//                               <label className="w-40 font-semibold text-gray-700 dark:text-gray-300">{field.label}:</label>
//                               {item.editing ? (
//                                 <input
//                                   type="number"
//                                   value={field.value}
//                                   onChange={(e) => handleFieldChange(item.id, field.key, e.target.value)}
//                                   className="p-2 border rounded-lg w-32"
//                                 />
//                               ) : (
//                                 <span className="text-gray-800 dark:text-gray-200">
//                                   {field.value} {field.unit}
//                                 </span>
//                               )}
//                             </div>
//                           ))}

//                           <div className="flex gap-4 mt-2">
//                             <span>Total: ₹{calculateTotal(item)}</span>
//                             <span className="text-green-600">Savings: ₹{calculateSavings(item)}</span>
//                           </div>

//                           <button
//                             onClick={() => handleEditToggle(item.id)}
//                             className="mt-2 px-4 py-1 bg-green-600 text-white rounded-lg"
//                           >
//                             {item.editing ? <Save className="inline mr-2 h-4 w-4" /> : <Edit className="inline mr-2 h-4 w-4" />}
//                             {item.editing ? "Save" : "Edit"}
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//               </div>
//             ))}

//             {/* Grand totals */}
//             {filteredSubletting.length > 0 && (
//               <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between font-semibold text-lg">
//                 <span>Grand Total: ₹{grandTotal}</span>
//                 <span>Total Savings: ₹{totalSavings}</span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Bill;



// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   Edit,
//   Save,
//   Loader2,
//   Trash2,
//   Calculator,
//   Building,
//   Users,
//   FileText,
//   Search,
//   MoreVertical,
// } from "lucide-react";
// import Swal from "sweetalert2";
// import "sweetalert2/dist/sweetalert2.min.css";

// const Bill = () => {
//   const [projects, setProjects] = useState([]);
//   const [employers, setEmployers] = useState([]);
//   const [subletting, setSubletting] = useState([]);
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedEmployer, setSelectedEmployer] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [expandedContractor, setExpandedContractor] = useState(null);
//   const [expandedItem, setExpandedItem] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showAddDropdown, setShowAddDropdown] = useState(false);

//   // Demo Projects
//   useEffect(() => {
//     setProjects([
//       { id: 1, name: "Project A", location: "Mumbai", budget: "₹25 Cr" },
//       { id: 2, name: "Project B", location: "Delhi", budget: "₹45 Cr" },
//       { id: 3, name: "Project C", location: "Bangalore", budget: "₹120 Cr" },
//     ]);
//   }, []);

//   // Load Principal Contractors based on selected project
//   useEffect(() => {
//     if (!selectedProject) return;
//     setLoading(true);
//     setTimeout(() => {
//       const demoEmployers = {
//         1: [
//           { id: 101, name: "ABC Constructions Ltd" },
//           { id: 102, name: "MegaBuild Corp" },
//         ],
//         2: [
//           { id: 103, name: "Skyline Developers" },
//           { id: 104, name: "UrbanRise Group" },
//         ],
//         3: [{ id: 105, name: "Highway Infra Pvt Ltd" }],
//       };
//       setEmployers(demoEmployers[selectedProject] || []);
//       setSelectedEmployer("");
//       setSubletting([]);
//       setLoading(false);
//     }, 500);
//   }, [selectedProject]);

//   // Load demo subletting items with 27 sublets
//   useEffect(() => {
//     if (!selectedEmployer) return;
//     setLoading(true);
//     setTimeout(() => {
    //   const demoSubletting = [
    //     // Earthwork (5 items)
    //     {
    //       id: 1,
    //       contractor: "Sharma Earth Movers",
    //       name: "Site Excavation",
    //       category: "Earthwork",
    //       description: "General site excavation up to 1.5m depth",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 450, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 420, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 430, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 1500, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 2,
    //       contractor: "Earthworks India",
    //       name: "Rock Excavation",
    //       category: "Earthwork",
    //       description: "Hard rock excavation with blasting",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 1200, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 1100, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 1150, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 800, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 3,
    //       contractor: "Ground Level Corp",
    //       name: "Backfilling",
    //       category: "Earthwork",
    //       description: "Backfilling with approved soil",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 350, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 320, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 330, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 1200, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 4,
    //       contractor: "Sharma Earth Movers",
    //       name: "Soil Compaction",
    //       category: "Earthwork",
    //       description: "Mechanical compaction of filled soil",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 180, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 160, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 170, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 2500, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 5,
    //       contractor: "Earthworks India",
    //       name: "Site Grading",
    //       category: "Earthwork",
    //       description: "Final site grading and leveling",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 85, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 75, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 80, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 5000, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },

    //     // Concrete Work (6 items)
    //     {
    //       id: 6,
    //       contractor: "ABC Cement Works",
    //       name: "Foundation Concrete",
    //       category: "Concrete Work",
    //       description: "M25 grade concrete for foundations",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 6500, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 6200, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 6300, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 450, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 7,
    //       contractor: "Concrete Masters",
    //       name: "Column Concrete",
    //       category: "Concrete Work",
    //       description: "M30 grade concrete for columns",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 7200, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 6900, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 7000, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 320, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 8,
    //       contractor: "ABC Cement Works",
    //       name: "Slab Concrete",
    //       category: "Concrete Work",
    //       description: "M25 grade concrete for slabs",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 6300, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 6000, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 6100, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 680, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 9,
    //       contractor: "RMC Suppliers",
    //       name: "Ready Mix Concrete",
    //       category: "Concrete Work",
    //       description: "Ready mix concrete supply and pouring",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 5800, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 5500, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 5600, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 1200, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 10,
    //       contractor: "Concrete Masters",
    //       name: "Concrete Finishing",
    //       category: "Concrete Work",
    //       description: "Surface finishing and curing",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 45, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 40, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 42, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 8500, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 11,
    //       contractor: "ABC Cement Works",
    //       name: "Concrete Repair",
    //       category: "Concrete Work",
    //       description: "Repair and rectification work",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 280, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 250, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 260, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 120, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },

    //     // Masonry Work (4 items)
    //     {
    //       id: 12,
    //       contractor: "Brickwork Contractors",
    //       name: "Brick Masonry",
    //       category: "Masonry Work",
    //       description: "Clay brick masonry work",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 850, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 800, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 820, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 650, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 13,
    //       contractor: "Stone Masonry Co",
    //       name: "Stone Cladding",
    //       category: "Masonry Work",
    //       description: "Natural stone cladding work",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 2200, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 2000, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 2100, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 450, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 14,
    //       contractor: "Brickwork Contractors",
    //       name: "Block Work",
    //       category: "Masonry Work",
    //       description: "Concrete block masonry",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 750, unit: "m³" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 700, unit: "m³" },
    //         { label: "Final Price", key: "finalPrice", value: 720, unit: "m³" },
    //         { label: "Quantity", key: "quantity", value: 420, unit: "m³" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 15,
    //       contractor: "Masonry Experts",
    //       name: "Plastering Work",
    //       category: "Masonry Work",
    //       description: "Internal and external plastering",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 180, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 160, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 170, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 12500, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },

    //     // Steel Work (3 items)
    //     {
    //       id: 16,
    //       contractor: "Steel Fabricators Ltd",
    //       name: "Structural Steel",
    //       category: "Steel Work",
    //       description: "Fabrication and erection of structural steel",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 85, unit: "kg" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 80, unit: "kg" },
    //         { label: "Final Price", key: "finalPrice", value: 82, unit: "kg" },
    //         { label: "Quantity", key: "quantity", value: 125000, unit: "kg" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 17,
    //       contractor: "Rebar Solutions",
    //       name: "Reinforcement Steel",
    //       category: "Steel Work",
    //       description: "Reinforcement steel cutting and bending",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 72, unit: "kg" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 68, unit: "kg" },
    //         { label: "Final Price", key: "finalPrice", value: 70, unit: "kg" },
    //         { label: "Quantity", key: "quantity", value: 185000, unit: "kg" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 18,
    //       contractor: "Steel Fabricators Ltd",
    //       name: "Steel Fixing",
    //       category: "Steel Work",
    //       description: "Steel fixing and tying work",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 12, unit: "kg" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 10, unit: "kg" },
    //         { label: "Final Price", key: "finalPrice", value: 11, unit: "kg" },
    //         { label: "Quantity", key: "quantity", value: 185000, unit: "kg" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },

    //     // Plumbing (3 items)
    //     {
    //       id: 19,
    //       contractor: "Water Systems Inc",
    //       name: "Internal Plumbing",
    //       category: "Plumbing",
    //       description: "Internal water supply and drainage",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 450, unit: "m" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 420, unit: "m" },
    //         { label: "Final Price", key: "finalPrice", value: 430, unit: "m" },
    //         { label: "Quantity", key: "quantity", value: 2800, unit: "m" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 20,
    //       contractor: "Plumbing Experts",
    //       name: "External Plumbing",
    //       category: "Plumbing",
    //       description: "External drainage and sewer lines",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 680, unit: "m" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 650, unit: "m" },
    //         { label: "Final Price", key: "finalPrice", value: 660, unit: "m" },
    //         { label: "Quantity", key: "quantity", value: 1500, unit: "m" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 21,
    //       contractor: "Water Systems Inc",
    //       name: "Sanitary Installation",
    //       category: "Plumbing",
    //       description: "Sanitary ware and fixture installation",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 2800, unit: "unit" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 2500, unit: "unit" },
    //         { label: "Final Price", key: "finalPrice", value: 2600, unit: "unit" },
    //         { label: "Quantity", key: "quantity", value: 450, unit: "unit" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },

    //     // Electrical (3 items)
    //     {
    //       id: 22,
    //       contractor: "Power Solutions Ltd",
    //       name: "Internal Electrical",
    //       category: "Electrical",
    //       description: "Internal wiring and fittings",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 220, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 200, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 210, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 12500, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 23,
    //       contractor: "Electrical Works Co",
    //       name: "External Electrical",
    //       category: "Electrical",
    //       description: "External cabling and distribution",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 380, unit: "m" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 350, unit: "m" },
    //         { label: "Final Price", key: "finalPrice", value: 360, unit: "m" },
    //         { label: "Quantity", key: "quantity", value: 2800, unit: "m" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 24,
    //       contractor: "Power Solutions Ltd",
    //       name: "Lighting Installation",
    //       category: "Electrical",
    //       description: "Lighting fixture installation",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 850, unit: "point" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 800, unit: "point" },
    //         { label: "Final Price", key: "finalPrice", value: 820, unit: "point" },
    //         { label: "Quantity", key: "quantity", value: 1200, unit: "point" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },

    //     // Finishes (3 items)
    //     {
    //       id: 25,
    //       contractor: "Interior Finishers",
    //       name: "Flooring Work",
    //       category: "Finishes",
    //       description: "Tile and stone flooring",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 320, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 300, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 310, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 8500, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 26,
    //       contractor: "Paint Masters",
    //       name: "Painting Work",
    //       category: "Finishes",
    //       description: "Internal and external painting",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 55, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 50, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 52, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 28500, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //     {
    //       id: 27,
    //       contractor: "Interior Finishers",
    //       name: "False Ceiling",
    //       category: "Finishes",
    //       description: "Gypsum board false ceiling",
    //       fields: [
    //         { label: "Benchmark Price", key: "benchmarkPrice", value: 450, unit: "m²" },
    //         { label: "Quoted Price", key: "quotedPrice", value: 420, unit: "m²" },
    //         { label: "Final Price", key: "finalPrice", value: 430, unit: "m²" },
    //         { label: "Quantity", key: "quantity", value: 4200, unit: "m²" },
    //       ],
    //       editing: false,
    //       status: "active",
    //     },
    //   ];
//       setSubletting(demoSubletting);
//       setLoading(false);
//     }, 800);
//   }, [selectedEmployer]);

//   // Filter items by search term
//   const filteredSubletting = subletting.filter(
//     (item) =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.category.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Group sublets by contractor
//   const groupedByContractor = filteredSubletting.reduce((acc, item) => {
//     if (!acc[item.contractor]) acc[item.contractor] = [];
//     acc[item.contractor].push(item);
//     return acc;
//   }, {});

//   // Expand/collapse contractor card
//   const toggleContractor = (contractor) => {
//     setExpandedContractor(expandedContractor === contractor ? null : contractor);
//   };

//   // Expand/collapse sublet item
//   const toggleItem = (id) => {
//     setExpandedItem(expandedItem === id ? null : id);
//   };

//   const handleFieldChange = (itemId, fieldKey, value) => {
//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === itemId
//           ? { ...item, fields: item.fields.map((f) => (f.key === fieldKey ? { ...f, value: Number(value) } : f)) }
//           : item
//       )
//     );
//   };

//   const handleEditToggle = (id) => {
//     setSubletting((prev) =>
//       prev.map((item) => {
//         if (item.id === id) {
//           if (item.editing) {
//             // Save action
//             console.log("Saving item", item);
//           }
//           return { ...item, editing: !item.editing };
//         }
//         return item;
//       })
//     );
//   };

//   const deleteSublettingItem = async (id, name) => {
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: `Delete "${name}"?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'Cancel'
//     });

//     if (result.isConfirmed) {
//       setSubletting(prev => prev.filter(item => item.id !== id));
//       if (expandedItem === id) setExpandedItem(null);
//       Swal.fire('Deleted!', 'Subletting item has been deleted.', 'success');
//     }
//   };

//   const addNewSublettingItem = async () => {
//     const { value: formValues } = await Swal.fire({
//       title: 'Add New Subletting Item',
//       html: `
//         <input id="swal-contractor" class="swal2-input" placeholder="Contractor Name" required>
//         <input id="swal-name" class="swal2-input" placeholder="Work Item Name" required>
//         <input id="swal-category" class="swal2-input" placeholder="Category">
//         <input id="swal-description" class="swal2-input" placeholder="Description">
//         <input id="swal-benchmark" class="swal2-input" placeholder="Benchmark Price" type="number">
//         <input id="swal-quoted" class="swal2-input" placeholder="Quoted Price" type="number">
//         <input id="swal-final" class="swal2-input" placeholder="Final Price" type="number">
//         <input id="swal-quantity" class="swal2-input" placeholder="Quantity" type="number">
//         <input id="swal-unit" class="swal2-input" placeholder="Unit (m³, m², kg, etc)">
//       `,
//       focusConfirm: false,
//       showCancelButton: true,
//       confirmButtonText: 'Add Item',
//       cancelButtonText: 'Cancel',
//       preConfirm: () => {
//         return {
//           contractor: document.getElementById('swal-contractor').value,
//           name: document.getElementById('swal-name').value,
//           category: document.getElementById('swal-category').value,
//           description: document.getElementById('swal-description').value,
//           benchmark: document.getElementById('swal-benchmark').value,
//           quoted: document.getElementById('swal-quoted').value,
//           final: document.getElementById('swal-final').value,
//           quantity: document.getElementById('swal-quantity').value,
//           unit: document.getElementById('swal-unit').value
//         };
//       },
//       validation: (values) => {
//         if (!values.contractor || !values.name) {
//           Swal.showValidationMessage('Please enter contractor and work item name');
//         }
//       }
//     });

//     if (!formValues) return;

//     const newItem = {
//       id: Date.now(),
//       contractor: formValues.contractor,
//       name: formValues.name,
//       category: formValues.category || 'General',
//       description: formValues.description || '',
//       fields: [
//         { label: "Benchmark Price", key: "benchmarkPrice", value: Number(formValues.benchmark) || 0, unit: formValues.unit || 'unit' },
//         { label: "Quoted Price", key: "quotedPrice", value: Number(formValues.quoted) || 0, unit: formValues.unit || 'unit' },
//         { label: "Final Price", key: "finalPrice", value: Number(formValues.final) || 0, unit: formValues.unit || 'unit' },
//         { label: "Quantity", key: "quantity", value: Number(formValues.quantity) || 0, unit: formValues.unit || 'unit' },
//       ],
//       editing: false,
//       status: "active",
//     };

//     setSubletting((prev) => [...prev, newItem]);
//     setExpandedContractor(newItem.contractor);
//     setExpandedItem(newItem.id);
//     setShowAddDropdown(false);
//   };

//   const calculateTotal = (item) => {
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return final * qty;
//   };

//   const calculateSavings = (item) => {
//     const benchmark = item.fields.find((f) => f.key === "benchmarkPrice")?.value || 0;
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return (benchmark - final) * qty;
//   };

//   const grandTotal = filteredSubletting.reduce((acc, item) => acc + calculateTotal(item), 0);
//   const totalSavings = filteredSubletting.reduce((acc, item) => acc + calculateSavings(item), 0);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <FileText className="h-8 w-8 text-blue-600" />
//             <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Bill of Quantities</h1>
//           </div>
//           <p className="text-lg text-gray-600 dark:text-gray-300">Manage project subletting items efficiently</p>
//         </div>

//         {/* Project & Employer Selection */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div>
//               <label className="block mb-2 font-semibold">Select Project</label>
//               <select
//                 value={selectedProject}
//                 onChange={(e) => setSelectedProject(e.target.value)}
//                 className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//               >
//                 <option value="">-- Select Project --</option>
//                 {projects.map((proj) => (
//                   <option key={proj.id} value={proj.id}>
//                     {proj.name} • {proj.location} • {proj.budget}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block mb-2 font-semibold">Select Principal Contractor</label>
//               <select
//                 value={selectedEmployer}
//                 onChange={(e) => setSelectedEmployer(e.target.value)}
//                 disabled={!selectedProject}
//                 className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 disabled:opacity-60"
//               >
//                 <option value="">-- Select Contractor --</option>
//                 {employers.map((emp) => (
//                   <option key={emp.id} value={emp.id}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {loading && (
//           <div className="flex justify-center items-center py-12">
//             <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
//             <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading...</span>
//           </div>
//         )}

//         {/* Subletting List */}
//         {!loading && selectedEmployer && (
//           <div className="space-y-6">
//             {/* Header with Search and Add Button */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
//               <div className="flex items-center gap-4">
//                 {/* Add Button with Dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={() => setShowAddDropdown(!showAddDropdown)}
//                     className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
//                   >
//                     <Plus size={20} />
//                     Add Sublet
//                   </button>
                  
//                   {/* Dropdown Menu */}
//                   {showAddDropdown && (
//                     <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-10">
//                       <button
//                         onClick={addNewSublettingItem}
//                         className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg flex items-center gap-2"
//                       >
//                         <Plus size={16} />
//                         Add New Subletting Item
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 <div className="text-sm text-gray-600 dark:text-gray-300">
//                   {filteredSubletting.length} items • {Object.keys(groupedByContractor).length} contractors
//                 </div>
//               </div>

//               {/* Search */}
//               <div className="relative w-full sm:w-64">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <input
//                   type="text"
//                   placeholder="Search items, contractors..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             {/* Contractors List */}
//             <div className="space-y-4">
//               {Object.keys(groupedByContractor).length === 0 ? (
//                 <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
//                   <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//                     No subletting items found
//                   </h3>
//                   <p className="text-gray-500 dark:text-gray-400 mb-4">
//                     {searchTerm ? 'Try adjusting your search terms' : 'Add your first subletting item'}
//                   </p>
//                   <button
//                     onClick={addNewSublettingItem}
//                     className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
//                   >
//                     <Plus size={18} /> Add First Item
//                   </button>
//                 </div>
//               ) : (
//                 Object.keys(groupedByContractor).map((contractor) => (
//                   <div key={contractor} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//                     {/* Contractor Header */}
//                     <button
//                       onClick={() => toggleContractor(contractor)}
//                       className="w-full p-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
//                           <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <div className="text-left">
//                           <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{contractor}</h3>
//                           <p className="text-sm text-gray-600 dark:text-gray-300">
//                             {groupedByContractor[contractor].length} items • 
//                             ₹{groupedByContractor[contractor].reduce((sum, item) => sum + calculateTotal(item), 0).toLocaleString()}
//                           </p>
//                         </div>
//                       </div>
//                       {expandedContractor === contractor ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
//                     </button>

//                     {/* Contractor Items */}
//                     {expandedContractor === contractor && (
//                       <div className="border-t border-gray-200 dark:border-gray-700">
//                         {groupedByContractor[contractor].map((item) => (
//                           <div key={item.id} className="border-b border-gray-100 dark:border-gray-600 last:border-b-0">
//                             <div className="p-4">
//                               <div className="flex justify-between items-start mb-3">
//                                 <div className="flex-1">
//                                   <div className="flex items-center gap-3 mb-2">
//                                     <span className="font-semibold text-gray-800 dark:text-white">{item.name}</span>
//                                     <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
//                                       {item.category}
//                                     </span>
//                                   </div>
//                                   <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
//                                   <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
//                                     <span>Total: ₹{calculateTotal(item).toLocaleString()}</span>
//                                     {calculateSavings(item) > 0 && (
//                                       <span className="text-green-600">Savings: ₹{calculateSavings(item).toLocaleString()}</span>
//                                     )}
//                                   </div>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     onClick={() => toggleItem(item.id)}
//                                     className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200"
//                                   >
//                                     {expandedItem === item.id ? "Hide" : "Details"}
//                                   </button>
//                                   <div className="relative">
//                                     <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
//                                       <MoreVertical size={16} />
//                                     </button>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Item Details */}
//                               {expandedItem === item.id && (
//                                 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                                     {item.fields.map((field) => (
//                                       <div key={field.key} className="flex items-center justify-between">
//                                         <label className="font-medium text-gray-700 dark:text-gray-300">{field.label}:</label>
//                                         <div className="flex items-center gap-2">
//                                           {item.editing ? (
//                                             <input
//                                               type="number"
//                                               value={field.value}
//                                               onChange={(e) => handleFieldChange(item.id, field.key, e.target.value)}
//                                               className="w-32 p-2 border rounded-lg bg-white dark:bg-gray-600"
//                                             />
//                                           ) : (
//                                             <span className="text-gray-800 dark:text-gray-200 font-semibold">
//                                               {field.value.toLocaleString()}
//                                             </span>
//                                           )}
//                                           <span className="text-sm text-gray-500 dark:text-gray-400 w-12">{field.unit}</span>
//                                         </div>
//                                       </div>
//                                     ))}
//                                   </div>

//                                   <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
//                                     <button
//                                       onClick={() => deleteSublettingItem(item.id, item.name)}
//                                       className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
//                                     >
//                                       <Trash2 size={16} />
//                                       Delete
//                                     </button>
//                                     <button
//                                       onClick={() => handleEditToggle(item.id)}
//                                       className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
//                                         item.editing
//                                           ? 'bg-green-600 hover:bg-green-700 text-white'
//                                           : 'bg-blue-600 hover:bg-blue-700 text-white'
//                                       }`}
//                                     >
//                                       {item.editing ? <Save size={16} /> : <Edit size={16} />}
//                                       {item.editing ? "Save Changes" : "Edit Item"}
//                                     </button>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* Grand Totals */}
//             {filteredSubletting.length > 0 && (
//               <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
//                 <div className="flex flex-col sm:flex-row justify-between items-center">
//                   <div className="text-center sm:text-left mb-4 sm:mb-0">
//                     <h3 className="text-xl font-bold">Project Summary</h3>
//                     <p className="text-blue-100">
//                       {filteredSubletting.length} items • {Object.keys(groupedByContractor).length} contractors
//                     </p>
//                   </div>
//                   <div className="text-center sm:text-right">
//                     <p className="text-2xl sm:text-3xl font-bold">₹{grandTotal.toLocaleString()}</p>
//                     <p className="text-blue-100">Grand Total</p>
//                   </div>
//                   <div className="text-center sm:text-right mt-4 sm:mt-0">
//                     <p className="text-xl font-bold text-green-300">₹{totalSavings.toLocaleString()}</p>
//                     <p className="text-blue-100">Total Savings</p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Bill;



// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   Trash2,
//   FileText,
//   MoreVertical,
//   Users,
//   Search,
//   Loader2,
// } from "lucide-react";
// import Swal from "sweetalert2";

// const Bill = () => {
//   const [projects, setProjects] = useState([]);
//   const [employers, setEmployers] = useState([]);
//   const [subletting, setSubletting] = useState([]);
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedEmployer, setSelectedEmployer] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [expandedContractor, setExpandedContractor] = useState(null);
//   const [expandedItem, setExpandedItem] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showAddDropdown, setShowAddDropdown] = useState(false);

//   // Demo Projects
//   useEffect(() => {
//     setProjects([
//       { id: 1, name: "Project A", location: "Mumbai", budget: "₹25 Cr" },
//       { id: 2, name: "Project B", location: "Delhi", budget: "₹45 Cr" },
//       { id: 3, name: "Project C", location: "Bangalore", budget: "₹120 Cr" },
//     ]);
//   }, []);

// const demoSublettingNames = [
//     "land scaled", "tree cutting", "earth work", 
//     "concrete", "brick Work", "stone masonary",
//     "wood Work", "hardware", " Plumbing", "roof treatment",
//     "floring specification","glazing", "Landscape Development", "Marble Flooring", "koud",
//     "fire extinguisher", "Painting Work", "Quarry Tile Work", "rain water harvesting",
//     // "Terrace Tiling", "lift and other mechanicals", "Ventilation System",
//     // "Wall Cladding Work", "X-tra Floor Coating", "Yard Leveling Work", "Zinc Coating Work",
//   ];

// const [demoItems, setDemoItems] = useState(
//   demoSublettingNames.map((name, idx) => ({
//     id: idx + 1,
//     contractor: "",
//     name,
//     saved: false
//   }))
// );

// // Generic field updater for demo items (handles contractor, benchmark, quoted, final, quantity, unit, etc.)
// const handleDemoFieldChange = (id, field, value) => {
//   setDemoItems(prev =>
//     prev.map(item =>
//       item.id === id ? { ...item, [field]: value } : item
//     )
//   );
// };

// // keep a small helper for contractor-specific updates (optional)
// const handleDemoContractorChange = (id, value) => {
//   handleDemoFieldChange(id, "contractor", value);
// };

// const saveDemoItem = (id) => {
//   setDemoItems(prev => prev.map(item => item.id === id ? {...item, saved: true} : item));
//   Swal.fire("Saved!", "Subletting item has been saved.", "success");
// };

// // Load Principal Contractors based on selected project
//   useEffect(() => {
//     if (!selectedProject) return;
//     setLoading(true);
//     setTimeout(() => {
//       const demoEmployers = {
//         1: [
//           { id: 101, name: "ABC Constructions Ltd" },
//           { id: 102, name: "MegaBuild Corp" },
//         ],
//         2: [
//           { id: 103, name: "Skyline Developers" },
//           { id: 104, name: "UrbanRise Group" },
//         ],
//         3: [{ id: 105, name: "Highway Infra Pvt Ltd" }],
//       };
//       setEmployers(demoEmployers[selectedProject] || []);
//       setSelectedEmployer("");
//       setSubletting([]);
//       setLoading(false);
//     }, 500);
//   }, [selectedProject]);

//   // Load demo subletting items (all 27 items)
//   useEffect(() => {
//     if (!selectedEmployer) return;
//     setLoading(true);
//     setTimeout(() => {
//            const demoSubletting = [
//         {
//           id: 1,
//           contractor: "Sharma Earth Movers",
//           name: "Site Excavation",
//           category: "Earthwork",
//           description: "General site excavation up to 1.5m depth",
//           fields: [
//             { label: "Benchmark Price", key: "benchmarkPrice", value: 450, unit: "m³" },
//             { label: "Quoted Price", key: "quotedPrice", value: 420, unit: "m³" },
//             { label: "Final Price", key: "finalPrice", value: 430, unit: "m³" },
//             { label: "Quantity", key: "quantity", value: 1500, unit: "m³" },
//           ],
//           editing: false,
//           status: "active",
//         },
//         {
//           id: 2,
//           contractor: "Earthworks India",
//           name: "Rock Excavation",
//           category: "Earthwork",
//           description: "Hard rock excavation with blasting",
//           fields: [
//             { label: "Benchmark Price", key: "benchmarkPrice", value: 1200, unit: "m³" },
//             { label: "Quoted Price", key: "quotedPrice", value: 1100, unit: "m³" },
//             { label: "Final Price", key: "finalPrice", value: 1150, unit: "m³" },
//             { label: "Quantity", key: "quantity", value: 800, unit: "m³" },
//           ],
//           editing: false,
//           status: "active",
//         },
//         {
//           id: 3,
//           contractor: "Ground Level Corp",
//           name: "Backfilling",
//           category: "Earthwork",
//           description: "Backfilling with approved soil",
//           fields: [
//             { label: "Benchmark Price", key: "benchmarkPrice", value: 350, unit: "m³" },
//             { label: "Quoted Price", key: "quotedPrice", value: 320, unit: "m³" },
//             { label: "Final Price", key: "finalPrice", value: 330, unit: "m³" },
//             { label: "Quantity", key: "quantity", value: 1200, unit: "m³" },
//           ],
//           editing: false,
//           status: "active",
//         },
//       ];
//       setSubletting(demoSubletting);
//       setLoading(false);
//     }, 800);
//   }, [selectedEmployer]);

//   const filteredSubletting = subletting.filter(
//     (item) =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.category.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const groupedByContractor = filteredSubletting.reduce((acc, item) => {
//     if (!acc[item.contractor]) acc[item.contractor] = [];
//     acc[item.contractor].push(item);
//     return acc;
//   }, {});

//   const toggleContractor = (contractor) => {
//     setExpandedContractor(expandedContractor === contractor ? null : contractor);
//   };

//   const toggleItem = (id) => {
//     setExpandedItem(expandedItem === id ? null : id);
//   };

//   const handleFieldChange = (itemId, fieldKey, value) => {
//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === itemId
//           ? {
//               ...item,
//               fields: item.fields.map((f) =>
//                 f.key === fieldKey ? { ...f, value: Number(value) } : f
//               ),
//             }
//           : item
//       )
//     );
//   };

//   const handleEditToggle = (id) => {
//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === id ? { ...item, editing: !item.editing } : item
//       )
//     );
//   };

//   const deleteSublettingItem = async (id, name) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: `Delete "${name}"?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       setSubletting((prev) => prev.filter((item) => item.id !== id));
//       if (expandedItem === id) setExpandedItem(null);
//       Swal.fire("Deleted!", "Subletting item has been deleted.", "success");
//     }
//   };

//   const addNewSublettingItem = async () => {
//     const { value: formValues } = await Swal.fire({
//       title: "Add New Subletting Item",
//       html: `
//         <input id="swal-contractor" class="swal2-input" placeholder="Contractor Name" required>
//         <input id="swal-name" class="swal2-input" placeholder="Work Item Name" required>
//         <input id="swal-category" class="swal2-input" placeholder="Category">
//         <input id="swal-description" class="swal2-input" placeholder="Description">
//         <input id="swal-benchmark" class="swal2-input" placeholder="Benchmark Price" type="number">
//         <input id="swal-quoted" class="swal2-input" placeholder="Quoted Price" type="number">
//         <input id="swal-final" class="swal2-input" placeholder="Final Price" type="number">
//         <input id="swal-quantity" class="swal2-input" placeholder="Quantity" type="number">
//         <input id="swal-unit" class="swal2-input" placeholder="Unit (m³, m², kg, etc)">
//       `,
//       focusConfirm: false,
//       showCancelButton: true,
//       confirmButtonText: "Add Item",
//       cancelButtonText: "Cancel",
//       preConfirm: () => ({
//         contractor: document.getElementById("swal-contractor").value,
//         name: document.getElementById("swal-name").value,
//         category: document.getElementById("swal-category").value,
//         description: document.getElementById("swal-description").value,
//         benchmark: document.getElementById("swal-benchmark").value,
//         quoted: document.getElementById("swal-quoted").value,
//         final: document.getElementById("swal-final").value,
//         quantity: document.getElementById("swal-quantity").value,
//         unit: document.getElementById("swal-unit").value,
//       }),
//     });

//     if (!formValues) return;

//     const newItem = {
//       id: Date.now(),
//       contractor: formValues.contractor,
//       name: formValues.name,
//       category: formValues.category || "General",
//       description: formValues.description || "",
//       fields: [
//         {
//           label: "Benchmark Price",
//           key: "benchmarkPrice",
//           value: Number(formValues.benchmark) || 0,
//           unit: formValues.unit || "unit",
//         },
//         {
//           label: "Quoted Price",
//           key: "quotedPrice",
//           value: Number(formValues.quoted) || 0,
//           unit: formValues.unit || "unit",
//         },
//         {
//           label: "Final Price",
//           key: "finalPrice",
//           value: Number(formValues.final) || 0,
//           unit: formValues.unit || "unit",
//         },
//         {
//           label: "Quantity",
//           key: "quantity",
//           value: Number(formValues.quantity) || 0,
//           unit: formValues.unit || "unit",
//         },
//       ],
//       editing: false,
//       status: "active",
//     };

//     setSubletting((prev) => [...prev, newItem]);
//     setExpandedContractor(newItem.contractor);
//     setExpandedItem(newItem.id);
//     setShowAddDropdown(false);
//   };

//   const calculateTotal = (item) => {
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return final * qty;
//   };

//   const calculateSavings = (item) => {
//     const benchmark = item.fields.find((f) => f.key === "benchmarkPrice")?.value || 0;
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return (benchmark - final) * qty;
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-center items-center ">
//         <h4 className="text-2xl font-bold ">Cloudsat Pvt Ltd</h4>
//         <span className="text-sm font-smibold ">( * Primary Contractor)</span>
//       </div>

//       {/* Project & Contractor Selection */}
//       <div className="flex gap-4 flex-wrap">
//         <select
//           value={selectedProject}
//           onChange={(e) => setSelectedProject(e.target.value)}
//           className="px-4 py-2 border rounded-lg"
//         >
//           <option value="">Select Project</option>
//           {projects.map((p) => (
//             <option key={p.id} value={p.id}>
//               {p.name} ({p.location}) - {p.budget}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedEmployer}
//           onChange={(e) => setSelectedEmployer(e.target.value)}
//           disabled={!selectedProject}
//           className="px-4 py-2 border rounded-lg"
//         >
//           <option value="">Select Principal Contractor</option>
//           {employers.map((e) => (
//             <option key={e.id} value={e.name}>
//               {e.name}
//             </option>
//           ))}
//         </select>

//         <div className="flex-1 relative">
//           <input
//             type="text"
//             placeholder="Search subletting items..."
//             className="w-full px-4 py-2 border rounded-lg"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
//         </div>
//       </div>

//       {/* Loading Spinner */}
//       {loading && (
//         <div className="text-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin mx-auto" />
//         </div>
//       )}

//       {/* Contractors List */}
//       {!loading && (
//         <div className="space-y-4">
//           {Object.keys(groupedByContractor).length === 0 ? (
//             <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
//               <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//                 No subletting items found
//               </h3>
//               <p className="text-gray-500 dark:text-gray-400 mb-4">
//                 {searchTerm
//                   ? "Try adjusting your search terms"
//                   : "Add your first subletting item"}
//               </p>
//               <button
//                 onClick={addNewSublettingItem}
//                 className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
//               >
//                 <Plus size={18} /> Add First Item
//               </button>
//             </div>
//           ) : (
//             Object.keys(groupedByContractor).map((contractor) => (
//               <div
//                 key={contractor}
//                 className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
//               >
//                 {/* Contractor Header */}
//                 <div className="flex justify-between items-center p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
//                   <div className="flex items-center gap-4">
//                     <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
//                       <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <div className="text-left">
//                       <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
//                         {contractor}
//                       </h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-300">
//                         {groupedByContractor[contractor].length} items • ₹
//                         {groupedByContractor[contractor]
//                           .reduce((sum, item) => sum + calculateTotal(item), 0)
//                           .toLocaleString()}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={addNewSublettingItem}
//                       className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors duration-200"
//                     >
//                       <Plus size={16} /> Add
//                     </button>
//                     <button onClick={() => toggleContractor(contractor)}>
//                       {expandedContractor === contractor ? (
//                         <ChevronUp className="text-gray-500" />
//                       ) : (
//                         <ChevronDown className="text-gray-500" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Contractor Items */}
//                 {expandedContractor === contractor &&
//                   groupedByContractor[contractor].map((item) => (
//                     <div
//                       key={item.id}
//                       className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-2"
//                     >
//                       <div className="flex justify-between items-center">
//                         <h4 className="font-medium text-gray-800 dark:text-white">
//                           {item.name}
//                         </h4>
//                         <div className="flex items-center gap-2">
//                           <button onClick={() => handleEditToggle(item.id)}>
//                             <FileText className="h-4 w-4 text-blue-600" />
//                           </button>
//                           <button
//                             onClick={() =>
//                               deleteSublettingItem(item.id, item.name)
//                             }
//                             className="text-red-600 hover:text-red-800"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                           <button onClick={() => toggleItem(item.id)}>
//                             {expandedItem === item.id ? (
//                               <ChevronUp className="text-gray-500" />
//                             ) : (
//                               <ChevronDown className="text-gray-500" />
//                             )}
//                           </button>
//                         </div>
//                       </div>

//                       {/* Expanded Item Fields */}
//                       {expandedItem === item.id && (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                           {item.fields.map((f) => (
//                             <div key={f.key} className="flex flex-col">
//                               <label className="text-sm text-gray-600 dark:text-gray-300">
//                                 {f.label} ({f.unit})
//                               </label>
//                               <input
//                                 type="number"
//                                 value={f.value}
//                                 onChange={(e) =>
//                                   handleFieldChange(
//                                     item.id,
//                                     f.key,
//                                     e.target.value
//                                   )
//                                 }
//                                 className="px-3 py-2 border rounded-lg"
//                               />
//                             </div>
//                           ))}
//                           <div className="flex flex-col justify-end">
//                             <p className="text-gray-700 dark:text-gray-300">
//                               Total: ₹{calculateTotal(item).toLocaleString()}
//                             </p>
//                             <p className="text-gray-500 dark:text-gray-400">
//                               Savings: ₹
//                               {calculateSavings(item).toLocaleString()}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {/* Demo Subletting Names Section */}
      
//       <div className="mt-8 space-y-4">
//         <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
//           Subletting Items
//         </h3>

//         {demoItems.map((item) => (
//           <div
//             key={item.id}
//             className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
//           >
//             <div className="flex items-center justify-between gap-4">
//               <p className="font-semibold text-xl dark:text-gray-300">{item.name}</p>
//               <button
//                 onClick={() =>
//                   setDemoItems((prev) =>
//                     prev.map((i) =>
//                       i.id === item.id
//                         ? { ...i, editing: !i.editing } 
//                         : i
//                     )
//                   )
//                 }
//                 className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Add
//               </button>
//             </div>

//             {/* Dropdown Form */}
//             {item.editing && (
//              <div className="mt-4 border-t pt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg transition-all space-y-4">
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//     <div className="flex flex-col">
//       <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//         Contractor Name
//       </label>
//       <input
//         type="text"
//         placeholder="Enter contractor name"
//         value={item.contractor}
//         onChange={(e) =>
//           handleDemoFieldChange(item.id, "contractor", e.target.value)
//         }
//         className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//       />
//     </div>

//     <div className="flex flex-col">
//       <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//         Benchmark Price
//       </label>
//       <input
//         type="number"
//         placeholder="0"
//         value={item.benchmark || ""}
//         onChange={(e) =>
//           handleDemoFieldChange(item.id, "benchmark", e.target.value)
//         }
//         className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//       />
//     </div>

//     <div className="flex flex-col">
//       <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//         Quoted Price
//       </label>
//       <input
//         type="number"
//         placeholder="0"
//         value={item.quoted || ""}
//         onChange={(e) =>
//           handleDemoFieldChange(item.id, "quoted", e.target.value)
//         }
//         className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//       />
//     </div>

//     <div className="flex flex-col">
//       <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//         Final Price
//       </label>
//       <input
//         type="number"
//         placeholder="0"
//         value={item.final || ""}
//         onChange={(e) =>
//           handleDemoFieldChange(item.id, "final", e.target.value)
//         }
//         className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//       />
//     </div>

//     <div className="flex flex-col">
//       <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//         Quantity
//       </label>
//       <input
//         type="number"
//         placeholder="0"
//         value={item.quantity || ""}
//         onChange={(e) =>
//           handleDemoFieldChange(item.id, "quantity", e.target.value)
//         }
//         className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//       />
//     </div>

//     <div className="flex flex-col">
//       <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//         Unit
//       </label>
//       <input
//         type="text"
//         placeholder="Unit"
//         value={item.unit || ""}
//         onChange={(e) =>
//           handleDemoFieldChange(item.id, "unit", e.target.value)
//         }
//         className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//       />
//     </div>
//   </div>

//   <div className="flex justify-end">
//     <button
//       onClick={() => {
//         const newSubletting = {
//           id: Date.now(),
//           contractor: item.contractor,
//           name: item.name,
//           category: "General",
//           description: "",
//           fields: [
//             { label: "Benchmark Price", key: "benchmarkPrice", value: Number(item.benchmark) || 0, unit: item.unit || "unit" },
//             { label: "Quoted Price", key: "quotedPrice", value: Number(item.quoted) || 0, unit: item.unit || "unit" },
//             { label: "Final Price", key: "finalPrice", value: Number(item.final) || 0, unit: item.unit || "unit" },
//             { label: "Quantity", key: "quantity", value: Number(item.quantity) || 0, unit: item.unit || "unit" },
//           ],
//           editing: false,
//           status: "active",
//         };
//         setSubletting((prev) => [...prev, newSubletting]);
//         setDemoItems((prev) =>
//           prev.map((i) =>
//             i.id === item.id
//               ? { ...i, editing: false, contractor: "", benchmark: "", quoted: "", final: "", quantity: "", unit: "" }
//               : i
//           )
//         );
//       }}
//       className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all"
//     >
//       Save
//     </button>
//   </div>
// </div>

//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Bill;




// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   Trash2,
//   FileText,
//   Users,
//   Search,
//   Loader2,
//   Save,
//   X,
// } from "lucide-react";
// import Swal from "sweetalert2";

// const Bill = () => {
//   const [sikun , useSikun] = useState("Ashirbad")
//   const [projects, setProjects] = useState([]);
//   const [employers, setEmployers] = useState([]);
//   const [subletting, setSubletting] = useState([]);
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedEmployer, setSelectedEmployer] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [expandedContractor, setExpandedContractor] = useState(null);
//   const [expandedItem, setExpandedItem] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   console.log(sikun);
  
//   // Demo Projects
//   useEffect(() => {
//     setProjects([
//       { id: 1, name: "Project A", location: "Mumbai", budget: "₹25 Cr" },
//       { id: 2, name: "Project B", location: "Delhi", budget: "₹45 Cr" },
//       { id: 3, name: "Project C", location: "Bangalore", budget: "₹120 Cr" },
//     ]);
//   }, []);

//   const demoSublettingNames = [
//     "land scaled", "tree cutting", "earth work", 
//     "concrete", "brick Work", "stone masonary",
//     "wood Work", "hardware", " Plumbing", "roof treatment",
//     "floring specification","glazing", "Landscape Development", "Marble Flooring", "koud",
//     "fire extinguisher", "Painting Work", "Quarry Tile Work", "rain water harvesting",
//      "Terrace Tiling", "lift and other mechanicals", "Ventilation System",
//     "Wall Cladding Work", "X-tra Floor Coating", "Yard Leveling Work", "Zinc Coating Work",
//   ];

//   const [demoItems, setDemoItems] = useState(
//     demoSublettingNames.map((name, idx) => ({
//       id: idx + 1,
//       contractors: [""], // Array to support multiple contractors
//       name,
//       fields: [
//         { label: "Benchmark Price", key: "benchmarkPrice", value: "", unit: "" },
//         { label: "Quoted Price", key: "quotedPrice", value: "", unit: "" },
//         { label: "Final Price", key: "finalPrice", value: "", unit: "" },
//         { label: "Quantity", key: "quantity", value: "", unit: "unit" },
//       ],
//       saved: false,
//       editing: false
//     }))
//   );

//   // Generic field updater for demo items
//   const handleDemoFieldChange = (itemId, fieldType, value, index = 0) => {
//     setDemoItems(prev =>
//       prev.map(item => {
//         if (item.id === itemId) {
//           if (fieldType === "contractor") {
//             const newContractors = [...item.contractors];
//             newContractors[index] = value;
//             return { ...item, contractors: newContractors };
//           } else if (fieldType === "field") {
//             const newFields = [...item.fields];
//             newFields[index] = { ...newFields[index], value };
//             return { ...item, fields: newFields };
//           } else if (fieldType === "unit") {
//             const newFields = [...item.fields];
//             newFields[index] = { ...newFields[index], unit: value };
//             return { ...item, fields: newFields };
//           }
//         }
//         return item;
//       })
//     );
//   };

//   // Add new contractor to an item
//   const addContractor = (itemId) => {
//     setDemoItems(prev =>
//       prev.map(item =>
//         item.id === itemId 
//           ? { ...item, contractors: [...item.contractors, ""] }
//           : item
//       )
//     );
//   };

//   // Remove contractor from an item
//   const removeContractor = (itemId, contractorIndex) => {
//     setDemoItems(prev =>
//       prev.map(item =>
//         item.id === itemId 
//           ? { 
//               ...item, 
//               contractors: item.contractors.filter((_, idx) => idx !== contractorIndex) 
//             }
//           : item
//       )
//     );
//   };

//   // Add new custom field to an item
//   const addCustomField = (itemId) => {
//     const newField = {
//       label: `Custom Field ${Math.floor(Math.random() * 1000)}`,
//       key: `custom_${Date.now()}`,
//       value: "",
//       unit: "unit"
//     };
    
//     setDemoItems(prev =>
//       prev.map(item =>
//         item.id === itemId 
//           ? { ...item, fields: [...item.fields, newField] }
//           : item
//       )
//     );
//   };

//   // Remove field from an item
//   const removeField = (itemId, fieldIndex) => {
//     setDemoItems(prev =>
//       prev.map(item =>
//         item.id === itemId 
//           ? { 
//               ...item, 
//               fields: item.fields.filter((_, idx) => idx !== fieldIndex) 
//             }
//           : item
//       )
//     );
//   };

//   // Load Principal Contractors based on selected project
//   useEffect(() => {
//     if (!selectedProject) return;
//     setLoading(true);
//     setTimeout(() => {
//       const demoEmployers = {
//         1: [
//           { id: 101, name: "ABC Constructions Ltd" },
//           { id: 102, name: "MegaBuild Corp" },
//         ],
//         2: [
//           { id: 103, name: "Skyline Developers" },
//           { id: 104, name: "UrbanRise Group" },
//         ],
//         3: [{ id: 105, name: "Highway Infra Pvt Ltd" }],
//       };
//       setEmployers(demoEmployers[selectedProject] || []);
//       setSelectedEmployer("");
//       setSubletting([]);
//       setLoading(false);
//     }, 500);
//   }, [selectedProject]);

//   // Load demo subletting items
//   useEffect(() => {
//     if (!selectedEmployer) return;
//     setLoading(true);
//     setTimeout(() => {
//       const demoSubletting = [
//         {
//           id: 1,
//           contractor: "Sharma Earth Movers",
//           name: "Site Excavation",
//           category: "Earthwork",
//           description: "General site excavation up to 1.5m depth",
//           fields: [
//             { label: "Benchmark Price", key: "benchmarkPrice", value: 450, unit: "m³" },
//             { label: "Quoted Price", key: "quotedPrice", value: 420, unit: "m³" },
//             { label: "Final Price", key: "finalPrice", value: 430, unit: "m³" },
//             { label: "Quantity", key: "quantity", value: 1500, unit: "m³" },
//           ],
//           editing: false,
//           status: "active",
//         },
//       ];
//       setSubletting(demoSubletting);
//       setLoading(false);
//     }, 800);
//   }, [selectedEmployer]);

//   const filteredSubletting = subletting.filter(
//     (item) =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   const groupedByContractor = filteredSubletting.reduce((acc, item) => {
//     if (!acc[item.contractor]) acc[item.contractor] = [];
//     acc[item.contractor].push(item);
//     return acc;
//   }, {});

//   const toggleContractor = (contractor) => {
//     setExpandedContractor(expandedContractor === contractor ? null : contractor);
//   };

//   const toggleItem = (id) => {
//     setExpandedItem(expandedItem === id ? null : id);
//   };

//   const toggleDemoItemEdit = (id) => {
//     setDemoItems(prev => prev.map(item => 
//       item.id === id ? { ...item, editing: !item.editing } : item
//     ));
//   };

//   const handleFieldChange = (itemId, fieldKey, value) => {
//     setSubletting((prev) =>
//       prev.map((item) =>
//         item.id === itemId
//           ? {
//               ...item,
//               fields: item.fields.map((f) =>
//                 f.key === fieldKey ? { ...f, value: Number(value) } : f
//               ),
//             }
//           : item
//       )
//     );
//   };

//   const deleteSublettingItem = async (id, name) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: `Delete "${name}"?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       setSubletting((prev) => prev.filter((item) => item.id !== id));
//       if (expandedItem === id) setExpandedItem(null);
//       Swal.fire("Deleted!", "Subletting item has been deleted.", "success");
//     }
//   };

//  const addNewSublettingItem = async () => {
//   const { value: formValues } = await Swal.fire({
//     width: "450px", // narrower modal
//     height: "4500px",
//     padding: "1px", // reduced padding
//     html: `
//       <div style="display: flex; flex-direction: column; gap: 6px;">
//         <input id="swal-contractor" class="swal2-input" placeholder="Contractor Name" style="height: 32px; font-size: 13px;">
//         <input id="swal-name" class="swal2-input" placeholder="Work Item Name" style="height: 32px; font-size: 13px;">
//         <input id="swal-category" class="swal2-input" placeholder="Category" style="height: 32px; font-size: 13px;">
//         <input id="swal-description" class="swal2-input" placeholder="Description" style="height: 32px; font-size: 13px;">
//         <input id="swal-benchmark" class="swal2-input" placeholder="Benchmark Price" type="number" style="height: 32px; font-size: 13px;">
//         <input id="swal-quoted" class="swal2-input" placeholder="Quoted Price" type="number" style="height: 32px; font-size: 13px;">
//         <input id="swal-final" class="swal2-input" placeholder="Final Price" type="number" style="height: 32px; font-size: 13px;">
//         <input id="swal-quantity" class="swal2-input" placeholder="Quantity" type="number" style="height: 32px; font-size: 13px;">
//         <input id="swal-unit" class="swal2-input" placeholder="Unit (m³, m², kg, etc)" style="height: 32px; font-size: 13px;">
//       </div>
//     `,
//     focusConfirm: false,
//     showCancelButton: true,
//     confirmButtonText: "Add",
//     cancelButtonText: "Cancel",
//     customClass: {
//       popup: "rounded-lg shadow-lg",
//       confirmButton: "bg-green-600 text-white px-4 py-1 rounded text-sm",
//       cancelButton: "bg-gray-400 text-white px-4 py-1 rounded text-sm",
//     },
//     preConfirm: () => ({
//       contractor: document.getElementById("swal-contractor").value,
//       name: document.getElementById("swal-name").value,
//       category: document.getElementById("swal-category").value,
//       description: document.getElementById("swal-description").value,
//       benchmark: document.getElementById("swal-benchmark").value,
//       quoted: document.getElementById("swal-quoted").value,
//       final: document.getElementById("swal-final").value,
//       quantity: document.getElementById("swal-quantity").value,
//       unit: document.getElementById("swal-unit").value,
//     }),
//   });

//   if (!formValues) return;

//   const newItem = {
//     id: Date.now(),
//     contractor: formValues.contractor || "",
//     name: formValues.name,
//     category: formValues.category || "General",
//     description: formValues.description || "",
//     fields: [
//       { label: "Benchmark Price", key: "benchmarkPrice", value: Number(formValues.benchmark) || 0, unit: "" },
//       { label: "Quoted Price", key: "quotedPrice", value: Number(formValues.quoted) || 0, unit: "" },
//       { label: "Final Price", key: "finalPrice", value: Number(formValues.final) || 0, unit: "" },
//       { label: "Quantity", key: "quantity", value: Number(formValues.quantity) || 0, unit: formValues.unit || "unit" },
//     ],
//     editing: false,
//     status: "active",
//   };

//   setSubletting((prev) => [...prev, newItem]);
//   if (newItem.contractor) setExpandedContractor(newItem.contractor);
//   setExpandedItem(newItem.id);
// };


//   const saveDemoItem = (item) => {
//     // Create separate subletting items for each contractor
//     item.contractors.forEach(contractor => {
//       if (contractor.trim()) {
//         const newSubletting = {
//           id: Date.now() + Math.random(),
//           contractor: contractor,
//           name: item.name,
//           category: "General",
//           description: "",
//           fields: item.fields.map(field => ({
//             ...field,
//             value: Number(field.value) || 0
//           })),
//           editing: false,
//           status: "active",
//         };
//         setSubletting(prev => [...prev, newSubletting]);
//       }
//     });

//     setDemoItems(prev => prev.map(i => 
//       i.id === item.id ? { ...i, editing: false, saved: true } : i
//     ));
    
//     Swal.fire("Saved!", `${item.name} has been added to subletting items.`, "success");
//   };

//   const calculateTotal = (item) => {
//     if (item.fields) {
//       const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//       const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//       return final * qty;
//     }
//     return 0;
//   };

//   const calculateSavings = (item) => {
//     if (item.fields) {
//       const benchmark = item.fields.find((f) => f.key === "benchmarkPrice")?.value || 0;
//       const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//       const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//       return (benchmark - final) * qty;
//     }
//     return 0;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
//           <div className="flex items-center justify-center gap-4 mb-4">
//             <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
//               <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Cloudsat Pvt Ltd</h1>
//               <p className="text-gray-600 dark:text-gray-300 text-lg">(* Primary Contractor)</p>
//             </div>
//           </div>
//           {/* <p className="text-gray-600 dark:text-gray-300">Comprehensive Bill of Quantities Management</p> */}
//         </div>

//         {/* Project Selection */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Select Project
//               </label>
//               <select
//                 value={selectedProject}
//                 onChange={(e) => setSelectedProject(e.target.value)}
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">-- Select Project --</option>
//                 {projects.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.name} • {p.location} • {p.budget}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Select  Contractors
//               </label>
//               <select
//                 value={selectedEmployer}
//                 onChange={(e) => setSelectedEmployer(e.target.value)}
//                 disabled={!selectedProject}
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-60 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">-- Select Contractor --</option>
//                 {employers.map((e) => (
//                   <option key={e.id} value={e.id}>
//                     {e.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Loading Spinner */}
//         {loading && (
//           <div className="flex justify-center items-center py-12">
//             <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//             <span className="ml-3 text-gray-600 dark:text-gray-300">Loading project data...</span>
//           </div>
//         )}

//         {/* Main Content */}
//         {!loading && selectedEmployer && (
//           <div className="space-y-6">
//             {/* Action Bar */}
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                 <div className="flex items-center gap-4">
//                   <button
//                     onClick={addNewSublettingItem}
//                     className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
//                   >
//                     <Plus size={20} />
//                     Add Custom Item
//                   </button>
                  
//                   <div className="text-sm text-gray-600 dark:text-gray-300">
//                     {subletting.length} assigned items • {Object.keys(groupedByContractor).length} contractors
//                   </div>
//                 </div>

//                 {/* Search */}
//                 <div className="relative w-full sm:w-64">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <input
//                     type="text"
//                     placeholder="Search items or contractors..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Assigned Subletting Items */}
//             {Object.keys(groupedByContractor).length > 0 && (
//               <div className="space-y-4">
//                 <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
//                   Assigned Subletting Items
//                 </h3>
                
//                 {Object.keys(groupedByContractor).map((contractor) => (
//                   <div key={contractor} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//                     {/* Contractor Header */}
//                     <div className="flex justify-between items-center p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
//                       <div className="flex items-center gap-4">
//                         <div className="w-12 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
//                           <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
//                             {contractor}
//                           </h3>
//                           <p className="text-sm text-gray-600 dark:text-gray-300">
//                             {groupedByContractor[contractor].length} items • 
//                             ₹{groupedByContractor[contractor].reduce((sum, item) => sum + calculateTotal(item), 0).toLocaleString()}
//                           </p>
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => toggleContractor(contractor)}
//                         className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
//                       >
//                         {expandedContractor === contractor ? (
//                           <ChevronUp className="text-gray-500" />
//                         ) : (
//                           <ChevronDown className="text-gray-500" />
//                         )}
//                       </button>
//                     </div>

//                     {/* Contractor Items */}
//                     {expandedContractor === contractor && (
//                       <div className="border-t border-gray-200 dark:border-gray-700">
//                         {groupedByContractor[contractor].map((item) => (
//                           <div key={item.id} className="border-b border-gray-100 dark:border-gray-600 last:border-b-0 p-6">
//                             <div className="flex justify-between items-start mb-4">
//                               <div className="flex-1">
//                                 <h4 className="font-medium text-gray-800 dark:text-white text-lg">{item.name}</h4>
//                                 {item.description && (
//                                   <p className="text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
//                                 )}
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <button
//                                   onClick={() => deleteSublettingItem(item.id, item.name)}
//                                   className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
//                                 >
//                                   <Trash2 size={16} />
//                                 </button>
//                                 <button
//                                   onClick={() => toggleItem(item.id)}
//                                   className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
//                                 >
//                                   {expandedItem === item.id ? (
//                                     <ChevronUp className="text-gray-500" />
//                                   ) : (
//                                     <ChevronDown className="text-gray-500" />
//                                   )}
//                                 </button>
//                               </div>
//                             </div>

//                             {/* Item Details */}
//                             {expandedItem === item.id && (
//                               <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//                                   {item.fields.map((field) => (
//                                     <div key={field.key}>
//                                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                         {field.label}
//                                       </label>
//                                       <div className="flex items-center gap-2">
//                                         <input
//                                           type="number"
//                                           value={field.value}
//                                           onChange={(e) => handleFieldChange(item.id, field.key, e.target.value)}
//                                           className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         />
//                                         {(field.key === "quantity" || field.key.startsWith("custom_")) && (
//                                           <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
//                                             {field.unit}
//                                           </span>
//                                         )}
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                                 <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
//                                   <div className="text-sm">
//                                     <span className="font-semibold text-gray-700 dark:text-gray-300">
//                                       Total: ₹{calculateTotal(item).toLocaleString()}
//                                     </span>
//                                     {calculateSavings(item) > 0 && (
//                                       <span className="ml-4 text-green-600">
//                                         Savings: ₹{calculateSavings(item).toLocaleString()}
//                                       </span>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Available Subletting Items */}
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
//                   Subletting Items ({demoItems.length})
//                 </h3>
//                 <div className="text-sm text-gray-600 dark:text-gray-300">
//                   {demoItems.filter(item => item.saved).length} saved
//                 </div>
//               </div>
              
//               <div className="space-y-4">
//                 {demoItems.map((item) => (
//                   <div
//                     key={item.id}
//                     className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-3">
//                         <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
//                         <span className="font-medium text-gray-800 dark:text-white">
//                           {item.name}
//                         </span>
//                         {item.saved && (
//                           <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
//                             Saved
//                           </span>
//                         )}
//                       </div>
                      
//                       {!item.editing ? (
//                         <button
//                           onClick={() => toggleDemoItemEdit(item.id)}
//                           disabled={item.saved}
//                           className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm"
//                         >
//                           <Plus size={14} />
//                           {item.saved ? "Saved" : "Assign"}
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => toggleDemoItemEdit(item.id)}
//                           className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm"
//                         >
//                           Cancel
//                         </button>
//                       )}
//                     </div>

//                     {/* Edit Form */}
//                     {item.editing && (
//                       <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                         {/* Contractors Section */}
//                         <div className="space-y-3">
//                           <div className="flex items-center justify-between">
//                             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                               Contractors
//                             </label>
//                             <button
//                               onClick={() => addContractor(item.id)}
//                               className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
//                             >
//                               <Plus size={12} />
//                               Add Contractor
//                             </button>
//                           </div>
                          
//                           {item.contractors.map((contractor, contractorIndex) => (
//                             <div key={contractorIndex} className="flex items-center gap-2">
//                               <input
//                                 type="text"
//                                 placeholder="Contractor Name"
//                                 value={contractor}
//                                 onChange={(e) => handleDemoFieldChange(item.id, "contractor", e.target.value, contractorIndex)}
//                                 className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                               />
//                               {item.contractors.length > 1 && (
//                                 <button
//                                   onClick={() => removeContractor(item.id, contractorIndex)}
//                                   className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
//                                 >
//                                   <X size={16} />
//                                 </button>
//                               )}
//                             </div>
//                           ))}
//                         </div>

//                         {/* Fields Section */}
//                         <div className="space-y-3">
//                           <div className="flex items-center justify-between">
//                             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                               Pricing & Quantities
//                             </label>
//                             <button
//                               onClick={() => addCustomField(item.id)}
//                               className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
//                             >
//                               <Plus size={12} />
//                               Add Field
//                             </button>
//                           </div>
                          
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {item.fields.map((field, fieldIndex) => (
//                               <div key={fieldIndex} className="flex items-end gap-2">
//                                 <div className="flex-1">
//                                   <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
//                                     {field.label}
//                                   </label>
//                                   <div className="flex gap-2">
//                                     <input
//                                       type="number"
//                                       placeholder="0"
//                                       value={field.value}
//                                       onChange={(e) => handleDemoFieldChange(item.id, "field", e.target.value, fieldIndex)}
//                                       className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     />
//                                     {(field.key === "quantity" || field.key.startsWith("custom_")) && (
//                                       <select
//                                         value={field.unit}
//                                         onChange={(e) => handleDemoFieldChange(item.id, "unit", e.target.value, fieldIndex)}
//                                         className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                                       >
//                                         <option value="unit">unit</option>
//                                         <option value="m²">m²</option>
//                                         <option value="m³">m³</option>
//                                         <option value="kg">kg</option>
//                                         <option value="m">m</option>
//                                         <option value="set">set</option>
//                                       </select>
//                                     )}
//                                   </div>
//                                 </div>
//                                 {fieldIndex >= 4 && (
//                                   <button
//                                     onClick={() => removeField(item.id, fieldIndex)}
//                                     className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded mb-1"
//                                   >
//                                     <X size={16} />
//                                   </button>
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         {/* Save Button */}
//                         <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-600">
//                           <button
//                             onClick={() => saveDemoItem(item)}
//                             className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
//                           >
//                             <Save size={16} />
//                             Save Item
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Bill;




import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileText,
  Users,
  Search,
  Loader2,
  Save,
  X,
  Crown,
  UserCheck,
  UserPlus,
  Paperclip,
  Download,
  Eye,
} from "lucide-react";
import operationApi from "../../../api/operation";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const Bill = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [subletting, setSubletting] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedContractor, setExpandedContractor] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contractors, setContractors] = useState([]);
  // Fetch Projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const [apts, comms, plots, dup, tri, custom] = await Promise.all([
          operationApi.getApartments(),
          operationApi.getCommercials(),
          operationApi.getPlottings(),
          operationApi.getDuplexes(),
          operationApi.getTriplexes(),
          operationApi.getCustomProjects()
        ]);

        const allProjects = [
          ...(apts.data.data || []),
          ...(comms.data.data || []),
          ...(plots.data.data || []),
          ...(dup.data.data || []),
          ...(tri.data.data || []),
          ...(custom.data.data || [])
        ].map(p => ({
          id: p.id,
          name: p.project_name || p.name
        }));
        
        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching BOQ projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  
  const demoSublettingNames = [
    "Land scaled", "Tree cutting", "Earth work", 
    "Concrete", "Brick Work", "Stone masonary",
    "Wood Work", "Hardware", " Plumbing", "Roof treatment",
    "Floring specification","Glazing", "Landscape Development", "Marble Flooring", "Road and draining",
    "Fire extinguisher", "Painting Work", "Quarry Tile Work", "Rain water harvesting",
     "Elctrical", "Lift and other mechanicals", "Ventilation System",
    "Ciling and Wall Lining",  "Demolation & Dismanting","Stand By Generate and allied Services", 
  ];
  
  const [demoItems, setDemoItems] = useState(
    demoSublettingNames.map((name, idx) => ({
      id: idx + 1,
      contractors: [],
      name,
      fields: [
        { label: "Benchmark Price", key: "benchmarkPrice", value: "", unit: "" },
        { label: "Quoted Price", key: "quotedPrice", value: "", unit: "" },
        { label: "Final Price", key: "finalPrice", value: "", unit: "" },
        { label: "Quantity", key: "quantity", value: "", unit: "unit" },
        { label: "File", key: "file", value: "", unit: "", file: null }
      ],
      saved: false,
      editing: false
    }))
  );

  // Function to handle file upload
  const handleFileUpload = (itemId, fieldIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      setDemoItems(prev =>
        prev.map(item => {
          if (item.id === itemId) {
            const newFields = [...item.fields];
            newFields[fieldIndex] = { 
              ...newFields[fieldIndex], 
              value: file.name,
              file: file 
            };
            return { ...item, fields: newFields };
          }
          return item;
        })
      );
      
      Swal.fire("Success!", `File "${file.name}" has been uploaded.`, "success");
    }
  };

  // Function to remove uploaded file
  const removeFile = (itemId, fieldIndex) => {
    setDemoItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newFields = [...item.fields];
          newFields[fieldIndex] = { 
            ...newFields[fieldIndex], 
            value: "",
            file: null 
          };
          return { ...item, fields: newFields };
        }
        return item;
      })
    );
  };

  // Function to view/download file
  const handleFileAction = (itemId, fieldIndex) => {
    const item = demoItems.find(item => item.id === itemId);
    if (item) {
      const field = item.fields[fieldIndex];
      if (field.file) {
        // Create a temporary URL for the file
        const fileUrl = URL.createObjectURL(field.file);
        
        // Open in new tab for viewing (for images/PDFs) or download
        if (field.file.type.includes('image') || field.file.type.includes('pdf')) {
          window.open(fileUrl, '_blank');
        } else {
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = field.file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        // Clean up URL after use
        setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
      }
    }
  };

  // Function to open contractor selection modal
  const openContractorSelection = async (itemId, contractorIndex = 0) => {
    if (!projectName) {
      Swal.fire("Info", "Please select a project first to view contractors.", "info");
      return;
    }

    const availableContractors = [...principalContractors, ...normalContractors];
    
    if (availableContractors.length === 0) {
      Swal.fire("Info", "No contractors available for the selected project.", "info");
      return;
    }

    const { value: selectedContractorId } = await Swal.fire({
      title: "Select Contractor",
      width: "500px",
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 mb-4">Choose a contractor for this work item:</p>
          <select id="contractor-select" class="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">-- Select Contractor --</option>
            ${principalContractors.length > 0 ? `
              <optgroup label="Principal Contractors" class="text-blue-600 font-semibold">
                ${principalContractors.map(c => `<option value="${c.id}" class="text-blue-700">${c.name}</option>`).join('')}
              </optgroup>
            ` : ''}
            ${normalContractors.length > 0 ? `
              <optgroup label="Sub-Contractors" class="text-gray-600">
                ${normalContractors.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </optgroup>
            ` : ''}
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Select",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-lg shadow-lg",
        confirmButton: "bg-blue-600 text-white px-4 py-2 rounded text-sm",
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded text-sm",
      },
      preConfirm: () => {
        const select = document.getElementById('contractor-select');
        return select.value;
      }
    });

    if (selectedContractorId) {
      const selectedContractor = availableContractors.find(c => c.id.toString() === selectedContractorId);
      if (selectedContractor) {
        setDemoItems(prev =>
          prev.map(item => {
            if (item.id === itemId) {
              const newContractors = [...item.contractors];
              newContractors[contractorIndex] = selectedContractor.name;
              return { ...item, contractors: newContractors };
            }
            return item;
          })
        );
      }
    }
  };

  // Generic field updater for demo items
  const handleDemoFieldChange = (itemId, fieldType, value, index = 0) => {
    setDemoItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          if (fieldType === "field") {
            const newFields = [...item.fields];
            newFields[index] = { ...newFields[index], value };
            return { ...item, fields: newFields };
          } else if (fieldType === "unit") {
            const newFields = [...item.fields];
            newFields[index] = { ...newFields[index], unit: value };
            return { ...item, fields: newFields };
          }
        }
        return item;
      })
    );
  };

  // Add new contractor to an item
  const addContractor = (itemId) => {
    setDemoItems(prev =>
      prev.map(item =>
        item.id === itemId 
          ? { ...item, contractors: [...item.contractors, ""] }
          : item
      )
    );
  };

  // Remove contractor from an item
  const removeContractor = (itemId, contractorIndex) => {
    setDemoItems(prev =>
      prev.map(item =>
        item.id === itemId 
          ? { 
              ...item, 
              contractors: item.contractors.filter((_, idx) => idx !== contractorIndex) 
            }
          : item
      )
    );
  };

  // Add new custom field to an item
  const addCustomField = (itemId) => {
    const newField = {
      label: `Custom Field ${Math.floor(Math.random() * 1000)}`,
      key: `custom_${Date.now()}`,
      value: "",
      unit: "unit"
    };
    
    setDemoItems(prev =>
      prev.map(item =>
        item.id === itemId 
          ? { ...item, fields: [...item.fields, newField] }
          : item
      )
    );
  };

  // Remove field from an item
  const removeField = (itemId, fieldIndex) => {
    setDemoItems(prev =>
      prev.map(item =>
        item.id === itemId 
          ? { 
              ...item, 
              fields: item.fields.filter((_, idx) => idx !== fieldIndex) 
            }
          : item
      )
    );
  };

  // fetch all contractors once on mount
  useEffect(() => {
    setLoading(true);
    operationApi.getContractors()
      .then((res) => {
        const list = res.data?.contractors || [];
        setContractors(list.map(c => ({ ...c, type: c.type || "normal" })));
        setEmployers(list.map(c => ({ ...c, type: c.type || "normal" })));
      })
      .catch((err) => {
        console.error("failed to load contractors", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // update employer list when projectName or contractors change
  // if filtering returns zero results we fall back to full list
  useEffect(() => {
    if (!projectName) {
      setEmployers(contractors);
    } else {
      let filtered = contractors.filter(
        (c) => c.project_name === projectName
      );
      if (filtered.length === 0) {
        filtered = contractors; // no project_name match? show all
      }
      setEmployers(filtered);
    }
    setSelectedEmployer("");
    setSubletting([]);
  }, [projectName, contractors]);

  // Load BOQ items from server
  const fetchBOQItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await operationApi.getBOQItems();
      console.debug("getBOQItems response:", res?.data ?? res);
      const items = res.data?.data || res.data || [];
      
      const selectedContractorObj = contractors.find(c => c.id.toString() === selectedEmployer.toString());
      const selectedContractorName = selectedContractorObj ? selectedContractorObj.name : "";

      const filtered = items.filter(item => {
        const itemProjName = item.project_name || item.projectName || item.project;
        const itemContractor = item.contractor_name || item.contractorName || item.contractor;
        
        const matchProject = !projectName || (itemProjName && itemProjName.toString().toLowerCase() === projectName.toString().toLowerCase());
        const matchContractor = !selectedContractorName || (itemContractor && itemContractor.toString().toLowerCase() === selectedContractorName.toString().toLowerCase());
        
        return matchProject && matchContractor;
      });

      const mapped = filtered.map(item => {
        let fields = item.fields || item.items || [];
        if (fields.length === 0) {
          fields = [
            { label: "Benchmark Price", key: "benchmarkPrice", value: item.benchmark_price || item.benchmarkPrice || 0, unit: item.unit || "" },
            { label: "Quoted Price", key: "quotedPrice", value: item.quoted_price || item.quotedPrice || 0, unit: item.unit || "" },
            { label: "Final Price", key: "finalPrice", value: item.final_price || item.finalPrice || 0, unit: item.unit || "" },
            { label: "Quantity", key: "quantity", value: item.quantity || 0, unit: item.unit || "unit" },
          ];
        }

        const attachments = item.attachments || [];

        return {
          id: item.id || item._id,
          contractor: item.contractor || selectedContractorName,
          name: item.name || item.title || "BOQ Item",
          category: item.category || "General",
          description: item.description || "",
          fields: fields,
          editing: false,
          status: (item.status === "approved" || item.status === "rejected" || item.status === "pending") ? item.status : "pending",
          attachments: attachments,
        };
      });

      setSubletting(mapped);
    } catch (error) {
      console.error("Error fetching BOQ items:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployer, projectName, contractors]);

  useEffect(() => {
    fetchBOQItems();
  }, [fetchBOQItems]);

  const filteredSubletting = subletting.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedByContractor = filteredSubletting.reduce((acc, item) => {
    if (!acc[item.contractor]) acc[item.contractor] = [];
    acc[item.contractor].push(item);
    return acc;
  }, {});

  const toggleContractor = (contractor) => {
    setExpandedContractor(expandedContractor === contractor ? null : contractor);
  };

  const toggleItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const toggleDemoItemEdit = (id) => {
    setDemoItems(prev => prev.map(item => 
      item.id === id ? { ...item, editing: !item.editing } : item
    ));
  };

  const handleFieldChange = (itemId, fieldKey, value) => {
    setSubletting((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              fields: item.fields.map((f) =>
                f.key === fieldKey ? { ...f, value: Number(value) } : f
              ),
            }
          : item
      )
    );
  };

  const deleteSublettingItem = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await operationApi.deleteBOQItem(id);
        Swal.fire("Deleted!", "Subletting item has been deleted.", "success");
        if (expandedItem === id) setExpandedItem(null);
        await fetchBOQItems();
      } catch (error) {
        console.error("Error deleting BOQ item:", error);
        Swal.fire("Error", "Failed to delete item from the server.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const addNewSublettingItem = async () => {
    const availableContractors = [...principalContractors, ...normalContractors];
    const contractorOptions = availableContractors.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    const { value: formValues } = await Swal.fire({
      width: "500px",
      title: "Add Custom BOQ Item",
      html: `
        <div style="display: flex; flex-direction: column; gap: 8px;" class="text-left">
          <label class="text-xs font-semibold text-gray-600">Contractor Name *</label>
          <select id="swal-contractor" class="swal2-input style-select" style="margin: 0; width: 100%; height: 38px; font-size: 14px; border-radius: 6px;">
            <option value="">-- Select Contractor --</option>
            ${contractorOptions}
          </select>
          
          <label class="text-xs font-semibold text-gray-600 mt-2">Work Item Name *</label>
          <input id="swal-name" class="swal2-input" placeholder="Work Item Name" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
          
          <label class="text-xs font-semibold text-gray-600 mt-2">Category</label>
          <input id="swal-category" class="swal2-input" placeholder="Category" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
          
          <label class="text-xs font-semibold text-gray-600 mt-2">Description</label>
          <input id="swal-description" class="swal2-input" placeholder="Description" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
          
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label class="text-xs font-semibold text-gray-600">Benchmark Price</label>
              <input id="swal-benchmark" class="swal2-input" placeholder="0" type="number" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Quoted Price</label>
              <input id="swal-quoted" class="swal2-input" placeholder="0" type="number" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-2 mt-2">
            <div class="col-span-2">
              <label class="text-xs font-semibold text-gray-600">Final Price</label>
              <input id="swal-final" class="swal2-input" placeholder="0" type="number" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Unit</label>
              <input id="swal-unit" class="swal2-input" placeholder="e.g. m³, kg" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
            </div>
          </div>
          
          <label class="text-xs font-semibold text-gray-600 mt-2">Quantity</label>
          <input id="swal-quantity" class="swal2-input" placeholder="0" type="number" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-lg shadow-lg",
        confirmButton: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm",
        cancelButton: "bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm",
      },
      preConfirm: () => {
        const contractor = document.getElementById("swal-contractor").value;
        const name = document.getElementById("swal-name").value;
        if (!contractor) {
          Swal.showValidationMessage("Contractor is required");
          return false;
        }
        if (!name) {
          Swal.showValidationMessage("Work item name is required");
          return false;
        }
        return {
          contractor,
          name,
          category: document.getElementById("swal-category").value,
          description: document.getElementById("swal-description").value,
          benchmark: document.getElementById("swal-benchmark").value,
          quoted: document.getElementById("swal-quoted").value,
          final: document.getElementById("swal-final").value,
          quantity: document.getElementById("swal-quantity").value,
          unit: document.getElementById("swal-unit").value,
        };
      },
    });

    if (!formValues) return;

    try {
      setLoading(true);
      const postData = {
        project_name: projectName || "Unassigned Project",
        project_id: projects.find(p => p.name === projectName)?.id || null,
        project_type:projects.find(p => p.name === projectName)?.type || "null",
        employee_id: contractors.find(c => c.name === formValues.contractor)?.id || null,
        contractor: formValues.contractor,
        name: formValues.name,
        category: formValues.category || "General",
        description: formValues.description || "",
        status: "pending",
        item: [
          { label: "Benchmark Price", key: "benchmarkPrice", value: Number(formValues.benchmark) || 0, unit: "" },
          { label: "Quoted Price", key: "quotedPrice", value: Number(formValues.quoted) || 0, unit: "" },
          { label: "Final Price", key: "finalPrice", value: Number(formValues.final) || 0, unit: "" },
          { label: "Quantity", key: "quantity", value: Number(formValues.quantity) || 0, unit: formValues.unit || "unit" },
        ]
      };

      await operationApi.createBOQItem(postData);
      Swal.fire("Added!", "Custom BOQ item created on server.", "success");
      await fetchBOQItems();
    } catch (error) {
      console.error("Error creating custom BOQ item:", error);
      Swal.fire("Error", "Failed to create custom BOQ item on server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveDemoItem = async (item) => {
    try {
      setLoading(true);
      const activeContractors = item.contractors.filter(c => c.trim());
      if (activeContractors.length === 0) {
        Swal.fire("Warning", "Please select at least one contractor.", "warning");
        return;
      }

      for (const contractorName of activeContractors) {
        const payloadFields = item.fields.map(field => ({
          label: field.label,
          key: field.key,
          value: Number(field.value) || 0,
          unit: field.unit || ""
        }));

        const postData = {
          project_name: projectName || "Unassigned Project",
          contractor: contractorName,
          name: item.name,
          category: "General",
          description: "",
          status: "pending",
          item: payloadFields
        };

        const createRes = await operationApi.createBOQItem(postData);
        const newBOQItem = createRes.data?.data || createRes.data;
        const newId = newBOQItem?.id || newBOQItem?._id;

        const fileField = item.fields.find(f => f.key === "file");
        if (fileField && fileField.file && newId) {
          const formData = new FormData();
          formData.append("file", fileField.file);
          await operationApi.uploadAttachment(newId, formData);
        }
      }

      Swal.fire("Saved!", `${item.name} has been assigned and saved on the server.`, "success");
      
      setDemoItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, editing: false, saved: true } : i
      ));

      await fetchBOQItems();
    } catch (error) {
      console.error("Error saving BOQ item:", error);
      Swal.fire("Error", "Failed to save BOQ item to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItemChanges = async (item) => {
    try {
      setLoading(true);
      const updatedFields = item.fields.map(f => ({
        label: f.label,
        key: f.key,
        value: Number(f.value) || 0,
        unit: f.unit || ""
      }));

      await operationApi.updateDocument(item.id, updatedFields);
      
      await operationApi.updateBOQItem(item.id, {
        name: item.name,
        category: item.category,
        description: item.description,
        item: updatedFields,
        status: (item.status === "approved" || item.status === "rejected" || item.status === "pending") ? item.status : "pending"
      });

      Swal.fire("Success", "BOQ Item pricing updated successfully.", "success");
      await fetchBOQItems();
    } catch (error) {
      console.error("Error saving BOQ changes:", error);
      Swal.fire("Error", "Failed to save changes to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentApproverId = () => {
    if (!user) return null;
    const id = user.user_id || user.id || user.userId || user.uid || user.employee_id;
    return Number(id) || null;
  };

  const handleApproveItem = async (item) => {
    const approverId = getCurrentApproverId();
    if (!approverId) {
      Swal.fire("Error", "Unable to determine current approver ID for approval.", "error");
      return;
    }

    try {
      setLoading(true);
      await operationApi.addApproval(item.id, {
        approved_by: approverId,
        timestamp: new Date().toISOString()
      });
      await operationApi.updateBOQItem(item.id, {
        ...item,
        status: "approved"
      });
      
      Swal.fire("Approved!", "This BOQ Item has been successfully approved.", "success");
      await fetchBOQItems();
    } catch (error) {
      console.error("Error approving BOQ item:", error);
      Swal.fire("Error", "Failed to approve BOQ item.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadItemAttachment = async (itemId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      
      await operationApi.uploadAttachment(itemId, formData);
      Swal.fire("Success", `File "${file.name}" uploaded successfully.`, "success");
      await fetchBOQItems();
    } catch (error) {
      console.error("Error uploading attachment:", error);
      Swal.fire("Error", "Failed to upload attachment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItemAttachment = async (itemId, attachmentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Remove this attachment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await operationApi.deleteAttachment(itemId, attachmentId);
        Swal.fire("Deleted!", "Attachment has been removed.", "success");
        await fetchBOQItems();
      } catch (error) {
        console.error("Error deleting attachment:", error);
        Swal.fire("Error", "Failed to delete attachment.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewAttachment = (attachment) => {
    const url = attachment.url || attachment.file_url || attachment.fileUrl || attachment.filePath || attachment.path;
    if (url) {
      window.open(url, '_blank');
      return;
    }

    Swal.fire("Unable to open attachment", "The attachment does not have a valid URL.", "warning");
  };

  const calculateTotal = (item) => {
    const fields = item.fields || item.item || [];
    const final = fields.find((f) => f.key === "finalPrice")?.value || 0;
    const qty = fields.find((f) => f.key === "quantity")?.value || 0;
    return final * qty;
  };

  const calculateSavings = (item) => {
    const fields = item.fields || item.item || [];
    const benchmark = fields.find((f) => f.key === "benchmarkPrice")?.value || 0;
    const final = fields.find((f) => f.key === "finalPrice")?.value || 0;
    const qty = fields.find((f) => f.key === "quantity")?.value || 0;
    return (benchmark - final) * qty;
  };

  // Group contractors by type for better organization in dropdown
  const principalContractors = employers.filter(emp => emp.type === "principal");
  const normalContractors = employers.filter(emp => emp.type === "normal");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto space-y-6">
      

        {/* Project Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <select
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Contractors
              </label>
              <select
                value={selectedEmployer}
                onChange={(e) => setSelectedEmployer(e.target.value)}
                // allow selection even without projectName, filtering will handle it
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select Contractor --</option>
                
                {/* Principal Contractors Group */}
                {principalContractors.length > 0 && (
                  <optgroup label="Principal Contractors" className="text-blue-600 font-semibold">
                    {principalContractors.map((e) => (
                      <option key={e.id} value={e.id} className="text-blue-700">
                         {e.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Normal Contractors Group */}
                {normalContractors.length > 0 && (
                  <optgroup label="Sub-Contractors" className="text-gray-600">
                    {normalContractors.map((e) => (
                      <option key={e.id} value={e.id}>
                         {e.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading project data...</span>
          </div>
        )}

        {/* Main Content */}
        {!loading && (selectedEmployer || subletting.length > 0) && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={addNewSublettingItem}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
                  >
                    <Plus size={20} />
                    Add Custom Item
                  </button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {subletting.length} assigned items • {Object.keys(groupedByContractor).length} contractors
                  </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search items or contractors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Assigned Subletting Items */}
            {Object.keys(groupedByContractor).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Assigned Subletting Items
                </h3>
                
                {Object.keys(groupedByContractor).map((contractor) => (
                  <div key={contractor} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Contractor Header */}
                    <div className="flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {contractor}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {groupedByContractor[contractor].length} items • 
                            ₹{groupedByContractor[contractor].reduce((sum, item) => sum + calculateTotal(item), 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleContractor(contractor)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                      >
                        {expandedContractor === contractor ? (
                          <ChevronUp className="text-gray-500" />
                        ) : (
                          <ChevronDown className="text-gray-500" />
                        )}
                      </button>
                    </div>

                    {/* Contractor Items */}
                    {expandedContractor === contractor && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        {groupedByContractor[contractor].map((item) => (
                          <div key={item.id} className="border-b border-gray-100 dark:border-gray-600 last:border-b-0 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium text-gray-800 dark:text-white text-lg">{item.name}</h4>
                                  {item.status === "approved" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                      <UserCheck size={12} /> Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                      Active
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => deleteSublettingItem(item.id, item.name)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={() => toggleItem(item.id)}
                                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                >
                                  {expandedItem === item.id ? (
                                    <ChevronUp className="text-gray-500" />
                                  ) : (
                                    <ChevronDown className="text-gray-500" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Item Details */}
                            {expandedItem === item.id && (
                              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-6">
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Pricing & Quantities</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {item.fields.map((field) => (
                                      <div key={field.key}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {field.label}
                                        </label>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            value={field.value}
                                            onChange={(e) => handleFieldChange(item.id, field.key, e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                          {(field.key === "quantity" || field.key.startsWith("custom_")) && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                              {field.unit}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Attachment Manager for Item */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attachments & Documents</h5>
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors duration-150">
                                      <Paperclip size={12} />
                                      Upload Document
                                      <input
                                        type="file"
                                        onChange={(e) => handleUploadItemAttachment(item.id, e)}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                      />
                                    </label>
                                  </div>

                                  {item.attachments && item.attachments.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                      {item.attachments.map((att) => (
                                        <div key={att.id || att._id} className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                          <div className="flex items-center gap-2 truncate flex-1">
                                            <Paperclip className="h-4 w-4 text-blue-500 shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                                              {att.name || att.file_name || att.fileName || "Document"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 ml-2">
                                            <button
                                              onClick={() => handleViewAttachment(att)}
                                              title="View document"
                                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-750 text-blue-600 dark:text-blue-400 rounded"
                                            >
                                              <Eye size={14} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteItemAttachment(item.id, att.id || att._id)}
                                              title="Remove attachment"
                                              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded"
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No attachments uploaded yet.</p>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 dark:border-gray-600 gap-4">
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                      Total: ₹{calculateTotal(item).toLocaleString()}
                                    </span>
                                    {calculateSavings(item) > 0 && (
                                      <span className="ml-4 text-green-600">
                                        Savings: ₹{calculateSavings(item).toLocaleString()}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    {item.status !== "approved" && (
                                      <button
                                        onClick={() => handleApproveItem(item)}
                                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                      >
                                        <UserCheck size={16} /> Approve Item
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleSaveItemChanges(item)}
                                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                      <Save size={16} /> Save Changes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Available Subletting Items */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Subletting Items ({demoItems.length})
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {demoItems.filter(item => item.saved).length} saved
                </div>
              </div>
              
              <div className="space-y-4">
                {demoItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                        <span className="font-medium text-gray-800 dark:text-white">
                          {item.name}
                        </span>
                        {item.saved && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                            Saved
                          </span>
                        )}
                      </div>
                      
                      {!item.editing ? (
                        <button
                          onClick={() => toggleDemoItemEdit(item.id)}
                          disabled={item.saved}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm"
                        >
                          <Plus size={14} />
                          {item.saved ? "Saved" : "Assign"}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleDemoItemEdit(item.id)}
                          className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* Edit Form */}
                    {item.editing && (
                      <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {/* Contractors Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Contractors
                            </label>
                            <button
                              onClick={() => addContractor(item.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                            >
                              <Plus size={12} />
                              Add Contractor
                            </button>
                          </div>
                          
                          {item.contractors.map((contractor, contractorIndex) => (
                            <div key={contractorIndex} className="flex items-center gap-2">
                              <div className="flex-1">
                                {contractor ? (
                                  <div className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <span className="text-green-700 dark:text-green-300 font-medium">
                                      {contractor}
                                    </span>
                                    <button
                                      onClick={() => removeContractor(item.id, contractorIndex)}
                                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => openContractorSelection(item.id, contractorIndex)}
                                    className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-gray-600 dark:text-gray-300 flex items-center gap-2 justify-center"
                                  >
                                    <UserPlus size={14} />
                                    Select Contractor
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Fields Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Pricing & Quantities
                            </label>
                            <button
                              onClick={() => addCustomField(item.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                            >
                              <Plus size={12} />
                              Add Field
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {item.fields.map((field, fieldIndex) => (
                              <div key={fieldIndex} className="flex items-end gap-2">
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    {field.label}
                                  </label>
                                  <div className="flex gap-2">
                                    {field.key === "file" ? (
                                      <div className="flex-1">
                                        {field.value ? (
                                          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                              <Paperclip className="h-4 w-4 text-blue-600" />
                                              <span className="text-sm text-blue-700 dark:text-blue-300 truncate max-w-37.5">
                                                {field.value}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() => handleFileAction(item.id, fieldIndex)}
                                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                              >
                                                <Eye size={14} />
                                              </button>
                                              <button
                                                onClick={() => removeFile(item.id, fieldIndex)}
                                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                              >
                                                <X size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-gray-600 dark:text-gray-300 cursor-pointer">
                                            <Paperclip className="h-4 w-4" />
                                            <span className="text-sm">Upload File</span>
                                            <input
                                              type="file"
                                              onChange={(e) => handleFileUpload(item.id, fieldIndex, e)}
                                              className="hidden"
                                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                            />
                                          </label>
                                        )}
                                      </div>
                                    ) : (
                                      <>
                                        <input
                                          type={field.key.includes("Price") ? "number" : "text"}
                                          placeholder="0"
                                          value={field.value}
                                          onChange={(e) => handleDemoFieldChange(item.id, "field", e.target.value, fieldIndex)}
                                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {(field.key === "quantity" || field.key.startsWith("custom_")) && (
                                          <select
                                            value={field.unit}
                                            onChange={(e) => handleDemoFieldChange(item.id, "unit", e.target.value, fieldIndex)}
                                            className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                          >
                                            <option value="unit">unit</option>
                                            <option value="m²">m²</option>
                                            <option value="m³">m³</option>
                                            <option value="kg">kg</option>
                                            <option value="m">m</option>
                                            <option value="set">set</option>
                                          </select>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                                {fieldIndex >= 5 && field.key !== "file" && (
                                  <button
                                    onClick={() => removeField(item.id, fieldIndex)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded mb-1"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => saveDemoItem(item)}
                            disabled={item.contractors.length === 0 || item.contractors.every(c => !c.trim())}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                          >
                            <Save size={16} />
                            Save Item
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bill;


