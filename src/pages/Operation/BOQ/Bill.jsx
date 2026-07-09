import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import operationApi from '../../../api/operation';
import Bill from './BillofQuantity';
import AttachmentPage from './Attachment';

const DocumentForm = () => {
  const [documentDate, setDocumentDate] = useState('2025-04-08');
  const [taxRate, setTaxRate] = useState('');
  const [note, setNote] = useState(`If Business Rule is already configured then the system will consider each new document no as a provisional document, but without activating the start Workflow option. Approval authority will not be able to get the pending document for further approval. If any document is already in the approved stage then further approval process cannot start by using Start Workflow option. For adding or changing any existing detail you may use the Edit option without approval process. Or for getting further approval you may use the BOQ Amendment option.`);
  const [activeTab, setActiveTab] = useState('Main Info');
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  // Item Info state and functions
  const [items, setItems] = useState([
    {
      id: 1,
      slNo: 1,
      childRlNo: '',
      refNo: '',
      milestoneCode: '',
      workDescription: '',
      uom: 'NOS',
      orderQty: 0,
      orderRate: 0,
      orderAmount: 0,
      subProject: '',
      budget: 0
    }
  ]);

  const uomOptions = ['NOS', 'MTR', 'KG', 'SQFT', 'CUM', 'LTR'];

  useEffect(() => {
    const fetchApprovalHistory = async () => {
      try {
        const res = await operationApi.getBOQItems();
        const items = res.data?.data || res.data || [];

        const normalizeApprovalEntry = (record, index) => ({
          id: record.id ?? record._id ?? `approval-${index}`,
          approvedBy: record.approved_by_name || record.approved_by || record.approver_name || record.name || record.authority || 'Unknown',
          profile: record.profile || record.role || record.designation || 'N/A',
          actionInformation: record.action_information || record.action || record.notes || record.status || 'Updated',
          status: record.status || 'Completed',
          dateTime: record.approved_at || record.created_at || record.timestamp || record.date || 'N/A',
          remarks: record.remarks || record.comment || record.notes || '',
          createdBy: record.created_by_name || record.created_by || record.requested_by || 'System'
        });

        const normalizePendingEntry = (record, index) => ({
          id: record.id ?? record._id ?? `pending-${index}`,
          pendingWith: record.approved_by_name || record.approved_by || record.approver_name || record.name || record.authority || 'Unknown',
          profile: record.profile || record.role || record.designation || 'N/A',
          actionInformation: record.action_information || record.action || record.notes || record.status || 'Pending Approval',
          createdBy: record.created_by_name || record.created_by || record.requested_by || 'System'
        });

        const approvalRecords = [];
        const pendingRecords = [];

        items.forEach((item) => {
          const rawApprovals = item.approval_history || item.approvals || item.approvalHistory || item.approval_status || item.approvalStatus;
          if (rawApprovals) {
            const checks = Array.isArray(rawApprovals) ? rawApprovals : [rawApprovals];
            checks.forEach((record, index) => {
              approvalRecords.push(normalizeApprovalEntry(record, index));
              if (String(record.status).toLowerCase() === 'pending') {
                pendingRecords.push(normalizePendingEntry(record, index));
              }
            });
          }

          const rawPending = item.pending_approvals || item.pendingApprovals;
          if (rawPending) {
            const checks = Array.isArray(rawPending) ? rawPending : [rawPending];
            checks.forEach((record, index) => pendingRecords.push(normalizePendingEntry(record, index)));
          }
        });

        setApprovalHistory(approvalRecords);
        setPendingApprovals(pendingRecords);
        if ((approvalRecords && approvalRecords.length > 0) || (pendingRecords && pendingRecords.length > 0)) {
          setActiveTab('Approval History');
        }
      } catch (error) {
        console.error('Failed to fetch approval history:', error);
        setApprovalHistory([]);
        setPendingApprovals([]);
      }
    };

    fetchApprovalHistory();
  }, []);

  const handleAddItem = () => {
    const newItem = {
      id: items.length + 1,
      slNo: items.length + 1,
      childRlNo: '',
      refNo: '',
      milestoneCode: '',
      workDescription: '',
      uom: 'NOS',
      orderQty: 0,
      orderRate: 0,
      orderAmount: 0,
      subProject: '',
      budget: 0
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (id) => {
    if (items.length > 1) {
      const updatedItems = items.filter(item => item.id !== id)
        .map((item, index) => ({ ...item, slNo: index + 1 }));
      setItems(updatedItems);
    }
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate orderAmount if orderQty or orderRate changes
        if (field === 'orderQty' || field === 'orderRate') {
          updatedItem.orderAmount = updatedItem.orderQty * updatedItem.orderRate;
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const navigationItems = [
    'Main Info',
    'Attachment',
    'Approval History',
    'Change History'
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center ">
            {/* <h1 className="text-xl font-semibold text-gray-900">Document Management</h1> */}
            <div className="flex items-center space-x-4">
              {/* <span className="text-sm text-gray-500">Welcome, User</span> */}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 px-4 sm:px-6 lg:px-8">
            {navigationItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === item
                    ? 'bg-white text-blue-700 border-t-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3">
            <div className="flex items-center justify-between ">
              {/* <h2 className="text-xl font-semibold text-gray-800">{activeTab}</h2>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div> */}
            </div>
            
            {activeTab === 'Main Info' && (
              <Bill />
            )}
             {activeTab === 'Attachment' && (
              <AttachmentPage />
            )}
            {activeTab === 'Item Info' && (
             <div></div>
            )}

            {/* Approval History Tab */}
            {activeTab === 'Approval History' && (
              <div className="space-y-8">
                {/* Approved By Section */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Approved By</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved By</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profile</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action Information</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Time</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {approvalHistory.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                              No approval history available from server.
                            </td>
                          </tr>
                        ) : (
                          approvalHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.approvedBy}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.profile}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.actionInformation}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dateTime}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{item.remarks}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.createdBy}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Page 1 of 1 ({approvalHistory.length} items)
                    </div>
                  </div>
                </div>

                {/* Pending With Section */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Pending With</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending With</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profile</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action Information</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingApprovals.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                              No pending approval records available from server.
                            </td>
                          </tr>
                        ) : (
                          pendingApprovals.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.pendingWith}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.profile}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.actionInformation}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.createdBy}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Page 1 of 1 ({pendingApprovals.length} items)
                    </div>
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-red-800">Outflow Amount</div>
                    <div className="text-2xl font-bold text-red-900">160,636,929.37</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-800">Inflow Amount</div>
                    <div className="text-2xl font-bold text-green-900">0.00</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                    Cancel
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'Main Info' && activeTab !== 'Approval History' && activeTab !== 'Item Info' && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{activeTab}</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  The {activeTab.toLowerCase()} section is currently being developed and will be available soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;

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
//   const [expanded, setExpanded] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Demo Projects with more details
//   useEffect(() => {
//     setProjects([
//       { 
//         id: 1, 
//         name: "Project A - Housing Complex",
//         location: "Mumbai",
//         startDate: "2024-01-15",
//         budget: "₹25 Cr"
//       },
//       { 
//         id: 2, 
//         name: "Project B - Shopping Mall",
//         location: "Delhi",
//         startDate: "2024-02-01",
//         budget: "₹45 Cr"
//       },
//       { 
//         id: 3, 
//         name: "Project C - Highway Expansion",
//         location: "Bangalore",
//         startDate: "2024-03-10",
//         budget: "₹120 Cr"
//       },
//     ]);
//   }, []);

//   // Demo Employers when project selected
//   useEffect(() => {
//     if (!selectedProject) return;
//     setLoading(true);
//     setTimeout(() => {
//       const demoEmployers = {
//         1: [
//           { id: 101, name: "ABC Constructions Ltd", contact: "contact@abcconstructions.com" },
//           { id: 102, name: "MegaBuild Corp", contact: "info@megabuild.com" },
//         ],
//         2: [
//           { id: 103, name: "Skyline Developers", contact: "hello@skyline.dev" },
//           { id: 104, name: "UrbanRise Group", contact: "contact@urbanrise.com" },
//         ],
//         3: [{ id: 105, name: "Highway Infra Pvt Ltd", contact: "projects@highwayinfra.com" }],
//       };
//       setEmployers(demoEmployers[selectedProject] || []);
//       setSelectedEmployer("");
//       setSubletting([]);
//       setLoading(false);
//     }, 500);
//   }, [selectedProject]);

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
//           name: "Concrete Work",
//           description: "Foundation and structural concrete work",
//           contractor: "ABC Cement Works",
//           contact: "concrete@abcworks.com",
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

//   // Filter subletting items based on search
//   const filteredSubletting = subletting.filter(item =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.contractor.toLowerCase().includes(searchTerm.toLowerCase())
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
//       prev.map((item) => 
//         item.id === id ? { ...item, [field]: value } : item
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
//       if (expanded === id) setExpanded(null);
//       Swal.fire('Deleted!', 'Subletting item has been deleted.', 'success');
//     }
//   };

//   const addSublettingItem = async () => {
//     const { value: formValues } = await Swal.fire({
//       title: 'Add New Subletting Item',
//       html: `
//         <input id="swal-name" class="swal2-input" placeholder="Work Item Name" required>
//         <input id="swal-description" class="swal2-input" placeholder="Description">
//         <input id="swal-contractor" class="swal2-input" placeholder="Contractor Name">
//         <input id="swal-contact" class="swal2-input" placeholder="Contractor Contact">
//       `,
//       focusConfirm: false,
//       showCancelButton: true,
//       confirmButtonText: 'Add Item',
//       cancelButtonText: 'Cancel',
//       preConfirm: () => {
//         return {
//           name: document.getElementById('swal-name').value,
//           description: document.getElementById('swal-description').value,
//           contractor: document.getElementById('swal-contractor').value,
//           contact: document.getElementById('swal-contact').value
//         };
//       },
//       validation: (values) => {
//         if (!values.name) {
//           Swal.showValidationMessage('Please enter a work item name');
//         }
//       }
//     });

//     if (!formValues) return;

//     const newItem = {
//       id: Date.now(),
//       name: formValues.name,
//       description: formValues.description || '',
//       contractor: formValues.contractor || '',
//       contact: formValues.contact || '',
//       fields: [
//         { label: "Benchmark Price", key: "benchmarkPrice", value: 0, unit: "unit" },
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
//       title: 'Add New Field',
//       input: 'text',
//       inputPlaceholder: 'Field Name (e.g., Material Cost, Labor Cost)',
//       showCancelButton: true,
//       confirmButtonText: 'Add Field',
//       cancelButtonText: 'Cancel'
//     });

//     if (!fieldName) return;

//     const { value: unit } = await Swal.fire({
//       title: 'Unit of Measurement',
//       input: 'text',
//       inputPlaceholder: 'e.g., m³, kg, unit',
//       showCancelButton: true,
//       confirmButtonText: 'Add',
//       cancelButtonText: 'Skip'
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
//                   unit: unit || 'unit'
//                 },
//               ],
//             }
//           : item
//       )
//     );
//   };

//   const removeField = (itemId, fieldKey) => {
//     setSubletting(prev =>
//       prev.map(item =>
//         item.id === itemId
//           ? {
//               ...item,
//               fields: item.fields.filter(f => f.key !== fieldKey)
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
//     const benchmark = item.fields.find((f) => f.key === "benchmarkPrice")?.value || 0;
//     const final = item.fields.find((f) => f.key === "finalPrice")?.value || 0;
//     const qty = item.fields.find((f) => f.key === "quantity")?.value || 0;
//     return (Number(benchmark) - Number(final)) * Number(qty);
//   };

//   const grandTotal = subletting.reduce((acc, item) => acc + calculateTotal(item), 0);
//   const totalSavings = subletting.reduce((acc, item) => acc + calculateSavings(item), 0);

//   const selectedProjectData = projects.find(p => p.id === Number(selectedProject));
//   const selectedEmployerData = employers.find(e => e.id === Number(selectedEmployer));

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
//                       <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
//                   <p className="text-sm text-blue-600 dark:text-blue-400">Total Value</p>
//                   <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₹{grandTotal.toFixed(2)}</p>
//                 </div>
//                 <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
//                   <p className="text-sm text-green-600 dark:text-green-400">Total Savings</p>
//                   <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{totalSavings.toFixed(2)}</p>
//                 </div>
//                 <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
//                   <p className="text-sm text-purple-600 dark:text-purple-400">Items Count</p>
//                   <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{subletting.length}</p>
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
//                     {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first subletting item'}
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
//                             {item.fields?.find(f => f.key === 'quantity')?.value || 0} units
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-4 ml-4">
//                         <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           item.status === 'active' 
//                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                             : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
//                         }`}>
//                           {item.status}
//                         </div>
//                         {expanded === item.id ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
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
//                               onChange={(e) => handleContractorChange(item.id, 'name', e.target.value)}
//                               disabled={!item.editing}
//                               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mb-3"
//                               placeholder="Work item name"
//                             />
//                             <textarea
//                               value={item.description}
//                               onChange={(e) => handleContractorChange(item.id, 'description', e.target.value)}
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
//                               onChange={(e) => handleContractorChange(item.id, 'contractor', e.target.value)}
//                               disabled={!item.editing}
//                               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mb-3"
//                               placeholder="Contractor name"
//                             />
//                             <input
//                               type="text"
//                               value={item.contact}
//                               onChange={(e) => handleContractorChange(item.id, 'contact', e.target.value)}
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
//                                     handleFieldChange(item.id, field.key, e.target.value)
//                                   }
//                                   disabled={!item.editing}
//                                   className="w-full p-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//                                 />
//                                 <span className="absolute right-2 top-7 text-xs text-gray-500 dark:text-gray-400">
//                                   {field.unit}
//                                 </span>
//                                 {item.editing && field.key.includes('extraField') && (
//                                   <button
//                                     onClick={() => removeField(item.id, field.key)}
//                                     className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
//                                   >
//                                     <Trash2 size={12} />
//                                   </button>
//                                 )}
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
//                               onClick={() => deleteSublettingItem(item.id, item.name)}
//                               className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
//                             >
//                               <Trash2 size={16} /> Delete
//                             </button>
//                           </div>

//                           <div className="flex items-center gap-6">
//                             <div className="text-right">
//                               <p className="text-sm text-gray-600 dark:text-gray-400">Item Total</p>
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
//                                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                                   : 'bg-blue-600 hover:bg-blue-700 text-white'
//                               }`}
//                             >
//                               {item.editing ? <Save size={16} /> : <Edit size={16} />}
//                               {item.editing ? 'Save Changes' : 'Edit Item'}
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
//                       {subletting.length} items • Total Savings: ₹{totalSavings.toFixed(2)}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-3xl font-bold">₹{grandTotal.toFixed(2)}</p>
//                     <p className="text-blue-100 text-sm">Inclusive of all items</p>
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
//               Choose a principal employer from the dropdown above to start managing subletting items and quantities for your project.
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
//               Choose a project from the dropdown above to get started with your Bill of Quantities management.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Bill;



