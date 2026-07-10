





























      









































































import React, { useState } from "react";

const ApprovalHistoryPage = () => {

  const [approvalData, setApprovalData] = useState({
    approved: [
      {
        id: 1,
        approvedBy: "Sarah Johnson",
        profile: "Project Manager",
        actionInfo: "Initial budget review",
        status: "approved",
        dateTime: "2024-01-15 09:30 AM",
        remarks: "Budget aligns with project scope",
        createdBy: "System Admin",
        avatar: "👩‍💼",
        duration: "2 hours",
      },
      {
        id: 2,
        approvedBy: "Mike Chen",
        profile: "Finance Director",
        actionInfo: "Financial compliance check",
        status: "approved",
        dateTime: "2024-01-15 11:45 AM",
        remarks: "All financial guidelines met",
        createdBy: "Sarah Johnson",
        avatar: "👨‍💼",
        duration: "1 day",
      },
      {
        id: 3,
        approvedBy: "Emily Davis",
        profile: "Legal Counsel",
        actionInfo: "Contract compliance",
        status: "approved",
        dateTime: "2024-01-16 02:15 PM",
        remarks: "Legal requirements satisfied",
        createdBy: "Mike Chen",
        avatar: "👩‍⚖️",
        duration: "4 hours",
      }
    ],
    pending: [
      {
        id: 4,
        pendingWith: "David Wilson",
        profile: "CTO",
        actionInfo: "Technical feasibility review",
        status: "pending",
        createdBy: "Emily Davis",
        avatar: "👨‍💻",
        assignedDate: "2024-01-16",
        expectedDate: "2024-01-18",
        priority: "high",
      },
      {
        id: 5,
        pendingWith: "Lisa Rodriguez",
        profile: "Operations Head",
        actionInfo: "Resource allocation approval",
        status: "pending",
        createdBy: "Emily Davis",
        avatar: "👩‍💼",
        assignedDate: "2024-01-16",
        expectedDate: "2024-01-19",
        priority: "medium",
      }
    ],
    rejected: [
      {
        id: 6,
        approvedBy: "Tom Baker",
        profile: "Quality Assurance",
        actionInfo: "Quality standards check",
        status: "rejected",
        dateTime: "2024-01-14 03:20 PM",
        remarks: "Incomplete risk assessment documentation",
        createdBy: "System Admin",
        avatar: "👨‍🔬",
        duration: "6 hours",
        rejectionReason: "Missing risk assessment section",
      }
    ]
  });

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");


  const statusConfig = {
    approved: { label: "Approved", color: "bg-green-100 text-green-800 border-green-200", icon: "✅" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "⏳" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200", icon: "❌" }
  };

  const priorityConfig = {
    high: { label: "High", color: "bg-red-100 text-red-800" },
    medium: { label: "Medium", color: "bg-orange-100 text-orange-800" },
    low: { label: "Low", color: "bg-blue-100 text-blue-800" }
  };


  const filteredData = {
    approved: approvalData.approved.filter(item =>
      item.approvedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actionInfo.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    pending: approvalData.pending.filter(item =>
      item.pendingWith.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actionInfo.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    rejected: approvalData.rejected.filter(item =>
      item.approvedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actionInfo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  };

  const allItems = [
    ...filteredData.approved.map(item => ({ ...item, type: 'approved' })),
    ...filteredData.pending.map(item => ({ ...item, type: 'pending' })),
    ...filteredData.rejected.map(item => ({ ...item, type: 'rejected' }))
  ];

  const displayData = activeTab === "all" ? allItems : filteredData[activeTab];

  const getStatusBadge = (status, priority = null) => (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[status].color}`}>
        {statusConfig[status].icon} {statusConfig[status].label}
      </span>
      {priority && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[priority].color}`}>
          {priorityConfig[priority].label}
        </span>
      )}
    </div>
  );

  const StatCard = ({ title, count, color, icon }) => (
    <div className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approval History</h1>
          <p className="text-gray-600">Track and manage budget approval workflow</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Approvals"
            count={allItems.length}
            color="border-blue-500"
            icon="📊"
          />
          <StatCard
            title="Approved"
            count={approvalData.approved.length}
            color="border-green-500"
            icon="✅"
          />
          <StatCard
            title="Pending"
            count={approvalData.pending.length}
            color="border-yellow-500"
            icon="⏳"
          />
          <StatCard
            title="Rejected"
            count={approvalData.rejected.length}
            color="border-red-500"
            icon="❌"
          />
        </div>


        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">

            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, profile, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>


            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All", count: allItems.length },
                { id: "approved", label: "Approved", count: approvalData.approved.length },
                { id: "pending", label: "Pending", count: approvalData.pending.length },
                { id: "rejected", label: "Rejected", count: approvalData.rejected.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>


        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Approval Workflow</h2>
          </div>
          
          <div className="p-6">
            {displayData.length > 0 ? (
              <div className="space-y-4">
                {displayData.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">

                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                        {item.avatar}
                      </div>
                    </div>


                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {item.type === 'pending' ? item.pendingWith : item.approvedBy}
                          </h3>
                          <p className="text-sm text-gray-500">{item.profile}</p>
                        </div>
                        {getStatusBadge(item.status, item.priority)}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{item.actionInfo}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {item.dateTime && (
                          <span>🕒 {item.dateTime}</span>
                        )}
                        {item.duration && (
                          <span>⏱️ {item.duration}</span>
                        )}
                        {item.assignedDate && (
                          <span>📅 Assigned: {item.assignedDate}</span>
                        )}
                        {item.expectedDate && (
                          <span>🎯 Expected: {item.expectedDate}</span>
                        )}
                        <span>👤 Created by: {item.createdBy}</span>
                      </div>


                      {item.remarks && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-800">
                            <span className="font-medium">Remarks:</span> {item.remarks}
                          </p>
                        </div>
                      )}


                      {item.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                          <p className="text-xs text-red-800">
                            <span className="font-medium">Rejection Reason:</span> {item.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg mb-2">No approval records found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm ? "Try adjusting your search terms" : "No approvals in this category"}
                </p>
              </div>
            )}
          </div>
        </div>


        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Approval Process Info</h3>
              <p className="text-blue-800 text-sm">
                The approval workflow follows a sequential process. Each stage must be completed before moving to the next.
                Pending approvals will be automatically reminded after 48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalHistoryPage;