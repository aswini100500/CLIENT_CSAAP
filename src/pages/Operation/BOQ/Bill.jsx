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

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center ">

            <div className="flex items-center space-x-4">

            </div>
          </div>
        </div>
      </div>


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


      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3">
            <div className="flex items-center justify-between ">

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


            {activeTab === 'Approval History' && (
              <div className="space-y-8">

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
























































































































































































































































































































































              































              




































                
















                  















































































































                          





































































                            




















                            










































































