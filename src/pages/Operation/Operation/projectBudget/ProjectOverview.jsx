// import React, { useState } from "react";

// const ProjectOverview = () => {
//   // Sample form data
//   const [formData, setFormData] = useState({
//     selectedBudget: "Project Alpha",
//     documentSubject: "Quarterly Report",
//     documentDate: new Date().toISOString().split("T")[0],
//   });

//   // Sample data arrays
//   const [landAreas, setLandAreas] = useState([
//     { id: 1, description: "Plot A", landAreaCost: 500000, landDevelopmentCost: 200000, approvalCost: 50000 },
//     { id: 2, description: "Plot B", landAreaCost: 300000, landDevelopmentCost: 100000, approvalCost: 30000 },
//   ]);

//   const [commonFacilities, setCommonFacilities] = useState([
//     { id: 1, name: "Park", cost: 200000 },
//     { id: 2, name: "Community Hall", cost: 500000 },
//   ]);

//   const [constructionAreas, setConstructionAreas] = useState([
//     { id: 1, financialYear: "2025-26", superBuiltupArea: 1000, superBuiltupBudget: 1000000, builtupArea: 800, builtupBudget: 800000, carpetArea: 700, carpetBudget: 700000 },
//   ]);

//   const [saleableAreas, setSaleableAreas] = useState([
//     { id: 1, financialYear: "2025-26", superBuiltupArea: 500, superBuiltupBudget: 500000, builtupArea: 400, builtupBudget: 400000, carpetArea: 350, carpetBudget: 350000 },
//   ]);

//   // Totals
//   const totalLandAreaCost = landAreas.reduce(
//     (acc, la) => acc + Number(la.landAreaCost || 0) + Number(la.landDevelopmentCost || 0) + Number(la.approvalCost || 0),
//     0
//   );

//   const constructionTotals = {
//     superBuiltupArea: constructionAreas.reduce((acc, a) => acc + Number(a.superBuiltupArea || 0), 0),
//     superBuiltupBudget: constructionAreas.reduce((acc, a) => acc + Number(a.superBuiltupBudget || 0), 0),
//     builtupArea: constructionAreas.reduce((acc, a) => acc + Number(a.builtupArea || 0), 0),
//     builtupBudget: constructionAreas.reduce((acc, a) => acc + Number(a.builtupBudget || 0), 0),
//     carpetArea: constructionAreas.reduce((acc, a) => acc + Number(a.carpetArea || 0), 0),
//     carpetBudget: constructionAreas.reduce((acc, a) => acc + Number(a.carpetBudget || 0), 0),
//   };

//   const saleableTotals = {
//     superBuiltupArea: saleableAreas.reduce((acc, a) => acc + Number(a.superBuiltupArea || 0), 0),
//     superBuiltupBudget: saleableAreas.reduce((acc, a) => acc + Number(a.superBuiltupBudget || 0), 0),
//     builtupArea: saleableAreas.reduce((acc, a) => acc + Number(a.builtupArea || 0), 0),
//     builtupBudget: saleableAreas.reduce((acc, a) => acc + Number(a.builtupBudget || 0), 0),
//     carpetArea: saleableAreas.reduce((acc, a) => acc + Number(a.carpetArea || 0), 0),
//     carpetBudget: saleableAreas.reduce((acc, a) => acc + Number(a.carpetBudget || 0), 0),
//   };

//   // Profit calculations
//   const totalConstructionBudget = constructionTotals.superBuiltupBudget + saleableTotals.superBuiltupBudget;
//   const profit = 100000; // Sample
//   const profitRatio = totalConstructionBudget ? (profit / totalConstructionBudget) * 100 : 0;

//   const [submitted, setSubmitted] = useState(true);

//   // Placeholder PDF download function
//   const downloadPDF = () => {
//     alert("Download PDF clicked!");
//   };

//   return (
//     <div className="space-y-6 p-4">
//       {/* Project Info */}
//       <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
//         <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Project Info</h4>
//         <table className="w-full text-sm">
//           <tbody>
//             <tr>
//               <td className="py-1 text-gray-600 dark:text-gray-300">Project</td>
//               <td className="py-1 font-medium">{formData.selectedBudget || "-"}</td>
//             </tr>
//             <tr>
//               <td className="py-1 text-gray-600 dark:text-gray-300">Document Subject</td>
//               <td className="py-1 font-medium">{formData.documentSubject || "-"}</td>
//             </tr>
//             <tr>
//               <td className="py-1 text-gray-600 dark:text-gray-300">Document Date</td>
//               <td className="py-1 font-medium">{formData.documentDate || "-"}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* Land Areas */}
//       <div>
//         <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Land Areas</h4>
//         {landAreas.length === 0 ? (
//           <div className="text-sm text-gray-500">No land areas added.</div>
//         ) : (
//           <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gray-100 dark:bg-gray-800">
//                   <th className="p-2 text-left">#</th>
//                   <th className="p-2 text-left">Description</th>
//                   <th className="p-2 text-right">Land Area Cost (₹)</th>
//                   <th className="p-2 text-right">Development Cost (₹)</th>
//                   <th className="p-2 text-right">Approval Cost (₹)</th>
//                   <th className="p-2 text-right">Total (₹)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {landAreas.map((la, i) => (
//                   <tr key={la.id} className="border-t border-gray-100 dark:border-gray-700">
//                     <td className="p-2">{i + 1}</td>
//                     <td className="p-2">{la.description || "-"}</td>
//                     <td className="p-2 text-right">{Number(la.landAreaCost || 0)}</td>
//                     <td className="p-2 text-right">{Number(la.landDevelopmentCost || 0)}</td>
//                     <td className="p-2 text-right">{Number(la.approvalCost || 0)}</td>
//                     <td className="p-2 text-right">
//                       {Number(la.landAreaCost || 0) + Number(la.landDevelopmentCost || 0) + Number(la.approvalCost || 0)}
//                     </td>
//                   </tr>
//                 ))}
//                 <tr className="font-semibold bg-gray-50 dark:bg-gray-900">
//                   <td className="p-2" colSpan={5}>Total Land Area Cost</td>
//                   <td className="p-2 text-right">{totalLandAreaCost}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Common Facilities */}
//       <div>
//         <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Common Facilities</h4>
//         {commonFacilities.length === 0 ? (
//           <div className="text-sm text-gray-500">No common facilities added.</div>
//         ) : (
//           <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gray-100 dark:bg-gray-800">
//                   <th className="p-2 text-left">#</th>
//                   <th className="p-2 text-left">Facility</th>
//                   <th className="p-2 text-right">Budget (₹)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {commonFacilities.map((f, i) => (
//                   <tr key={f.id} className="border-t border-gray-100 dark:border-gray-700">
//                     <td className="p-2">{i + 1}</td>
//                     <td className="p-2">{f.name || "-"}</td>
//                     <td className="p-2 text-right">{Number(f.cost || 0)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="flex items-center justify-between mt-4">
//         <div>
//           <div className="text-lg font-semibold">Profit: ₹{profit}</div>
//           <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
//             <span>Profit Ratio: </span>
//             <span className="font-medium">{totalConstructionBudget ? profitRatio.toFixed(2) + "%" : "N/A"}</span>
//             <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>
//           </div>
//           <div className="text-xs text-gray-500 italic mt-1">Profit ratio pending final approval.</div>
//         </div>
//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={() => setSubmitted(false)}
//             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
//           >
//             Edit
//           </button>
//           <button
//             type="button"
//             onClick={downloadPDF}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg"
//           >
//             Download PDF
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectOverview;



import React from "react";

const ProjectOverview = ({ 
  formData, 
  landAreas, 
  commonFacilities, 
  constructionAreas, 
  saleableAreas, 
  constructionTotals, 
  saleableTotals, 
  totalLandAreaCost, 
  profit, 
  profitRatio, 
  onEdit, 
  onDownloadPDF 
}) => {
  return (
    <div className="space-y-6 p-4">
      {/* Project Info */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Project Info</h4>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1 text-gray-600 dark:text-gray-300">Project</td>
              <td className="py-1 font-medium">{formData.projectName || "-"}</td>
            </tr>
            <tr>
              <td className="py-1 text-gray-600 dark:text-gray-300">Document Subject</td>
              <td className="py-1 font-medium">{formData.documentSubject || "-"}</td>
            </tr>
            <tr>
              <td className="py-1 text-gray-600 dark:text-gray-300">Document Date</td>
              <td className="py-1 font-medium">{formData.documentDate || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Land Areas */}
      <div>
        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Land Areas</h4>
        {landAreas.length === 0 ? (
          <div className="text-sm text-gray-500">No land areas added.</div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Land Area Cost (₹)</th>
                  <th className="p-2 text-right">Development Cost (₹)</th>
                  <th className="p-2 text-right">Approval Cost (₹)</th>
                  <th className="p-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {landAreas.map((la, i) => (
                  <tr key={la.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{la.description || "-"}</td>
                    <td className="p-2 text-right">{Number(la.landAreaCost || 0)}</td>
                    <td className="p-2 text-right">{Number(la.landDevelopmentCost || 0)}</td>
                    <td className="p-2 text-right">{Number(la.approvalCost || 0)}</td>
                    <td className="p-2 text-right">
                      {Number(la.landAreaCost || 0) + Number(la.landDevelopmentCost || 0) + Number(la.approvalCost || 0)}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold bg-gray-50 dark:bg-gray-900">
                  <td className="p-2" colSpan={5}>Total Land Area Cost</td>
                  <td className="p-2 text-right">{totalLandAreaCost}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Common Facilities */}
      <div>
        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Common Facilities</h4>
        {commonFacilities.length === 0 ? (
          <div className="text-sm text-gray-500">No common facilities added.</div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Facility</th>
                  <th className="p-2 text-right">Budget (₹)</th>
                </tr>
              </thead>
              <tbody>
                {commonFacilities.map((f, i) => (
                  <tr key={f.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{f.name || "-"}</td>
                    <td className="p-2 text-right">{Number(f.cost || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="text-lg font-semibold">Profit: ₹{profit}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
            <span>Profit Ratio: </span>
            <span className="font-medium">{profitRatio ? profitRatio.toFixed(2) + "%" : "N/A"}</span>
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>
          </div>
          <div className="text-xs text-gray-500 italic mt-1">Profit ratio pending final approval.</div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDownloadPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;