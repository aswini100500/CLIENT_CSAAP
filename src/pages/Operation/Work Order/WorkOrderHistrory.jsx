import React, { useEffect, useState } from "react";
import { Search, Download, Eye, Loader } from "lucide-react";
import { jsPDF } from "jspdf";
import operationApi from "../../../api/operation";
import Swal from "sweetalert2";

const WorkOrderHistory = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch work orders from API
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await operationApi.getTenderWorkOrders();
      setWorkOrders(response.data.data || []);
    } catch (err) {
      console.error("Error fetching work orders:", err);
      setError("Failed to load work orders. Please try again.");
      Swal.fire("Error", "Failed to load work orders", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter by search term
  const filteredOrders = workOrders.filter(
    (order) =>
      (order.subject?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.project_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.contractor?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.tender?.tender_title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // PDF generation for selected order
  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("WORK ORDER", 105, y, { align: "center" });
    y += 10;
    doc.setDrawColor(37, 99, 235);
    doc.line(20, y, 190, y);
    y += 15;

    // Header Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("WORK ORDER DETAILS:", 20, y);
    y += 8;
    doc.setFont(undefined, "normal");

    doc.text(`Subject: ${order.subject || "-"}`, 20, y);
    y += 6;
    doc.text(`Work Order ID: ${order.id || "-"}`, 20, y);
    y += 6;
    doc.text(`Work Order Date: ${order.work_order_date || "-"}`, 20, y);
    y += 6;
    doc.text(`Completion Date: ${order.completion_date || "-"}`, 20, y);
    y += 8;

    // Tender Info
    if (order.tender) {
      doc.setFont(undefined, "bold");
      doc.text("TENDER INFORMATION:", 20, y);
      y += 6;
      doc.setFont(undefined, "normal");
      doc.text(`Tender: ${order.tender.tender_title || order.tender.title || "-"}`, 20, y);
      y += 6;
    }

    // Project Info
    if (order.project_name) {
      doc.text(`Project: ${order.project_name}`, 20, y);
      y += 6;
    }
    y += 6;

    // Contractor Info
    if (order.contractor) {
      doc.setFont(undefined, "bold");
      doc.text("CONTRACTOR INFORMATION:", 20, y);
      y += 6;
      doc.setFont(undefined, "normal");
      doc.text(`Name: ${order.contractor.name || "-"}`, 20, y);
      y += 6;
      if (order.contractor.contact_person) {
        doc.text(`Contact Person: ${order.contractor.contact_person}`, 20, y);
        y += 6;
      }
      if (order.contractor.address) {
        doc.text(`Address: ${order.contractor.address}`, 20, y);
        y += 6;
      }
      if (order.contractor.phone) {
        doc.text(`Phone: ${order.contractor.phone}`, 20, y);
        y += 6;
      }
      y += 6;
    }

    // Items Table
    if (order.items && order.items.length > 0) {
      doc.setFont(undefined, "bold");
      doc.text("ITEMS:", 20, y);
      y += 8;
      doc.text("S.No", 20, y);
      doc.text("Description", 35, y);
      doc.text("Unit", 100, y);
      doc.text("Qty", 120, y);
      doc.text("Rate (₹)", 140, y);
      doc.text("Amount (₹)", 165, y);
      y += 6;
      doc.line(20, y, 190, y);
      y += 6;

      doc.setFont(undefined, "normal");
      let itemTotal = 0;
      order.items.forEach((item, index) => {
        const itemAmount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
        itemTotal += itemAmount;

        doc.text(`${index + 1}`, 22, y);
        doc.text(`${item.description || "-"}`, 35, y);
        doc.text(`${item.unit || "-"}`, 100, y);
        doc.text(`${item.quantity || 0}`, 120, y);
        doc.text(`${parseFloat(item.rate || 0).toFixed(2)}`, 140, y);
        doc.text(`${itemAmount.toFixed(2)}`, 165, y);
        y += 8;
      });

      y += 4;
      doc.line(20, y, 190, y);
      y += 8;
      doc.setFont(undefined, "bold");
      doc.text(`Total Amount: ₹${itemTotal.toFixed(2)}`, 140, y);
    }

    // Note
    if (order.note) {
      y += 15;
      doc.setFont(undefined, "bold");
      doc.text("NOTE:", 20, y);
      y += 6;
      doc.setFont(undefined, "normal");
      const noteText = doc.splitTextToSize(order.note, 170);
      doc.text(noteText, 20, y);
    }

    doc.save(`work-order-${order.subject?.replace(/\s+/g, "-") || order.id}.pdf`);
  };

  // View order details
  const handleViewDetails = (order) => {
    const itemsText = order.items
      ?.map((item, idx) => `${idx + 1}. ${item.description} - ${item.quantity} ${item.unit} @ ₹${item.rate}`)
      .join("\n") || "No items";

    Swal.fire({
      title: order.subject || "Work Order Details",
      html: `
        <div style="text-align: left;">
          <p><strong>ID:</strong> ${order.id || "-"}</p>
          <p><strong>Tender:</strong> ${order.tender?.item || "-"}</p>
          <p><strong>Project:</strong> ${order.project?.name || "-"}</p>
          <p><strong>Contractor:</strong> ${order.contractor?.name || "-"}</p>
          <p><strong>Work Order Date:</strong> ${order.issue_date ? order.issue_date.split('T')[0] : "-"}</p>
          <p><strong>Completion Date:</strong> ${order.completion_date ? order.completion_date.split('T')[0] : "-"}</p>
          <p><strong>Items:</strong></p>
          <pre style="text-align: left; max-height: 200px; overflow-y: auto;">${itemsText}</pre>
          <p><strong>Status:</strong> ${order.status || "Active"}</p>
        </div>
      `,
      width: 600,
      confirmButtonText: "Close",
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-700">
          Work Order History
        </h2>
        <button
          onClick={fetchWorkOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-3">
        <Search size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search by subject, project, contractor, or tender..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={32} className="animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading work orders...</span>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredOrders.length > 0
              ? `Showing ${filteredOrders.length} of ${workOrders.length} work orders`
              : "No work orders found"}
          </div>

          {/* Work Orders Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold">Contractor</th>
                  <th className="px-4 py-3 text-left font-semibold">Tender</th>
                  <th className="px-4 py-3 text-left font-semibold">Project</th>
                  <th className="px-4 py-3 text-left font-semibold">Work Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Completion</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <tr
                      key={order.id || index}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                        {order.subject || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {order.contractor?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                        {order.tender?.item || order.tender?.title || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {order.project?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                        {order.issue_date ? order.issue_date.split('T')[0] : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                        {order.completion_date ? order.completion_date.split('T')[0] : "-"}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(order)}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      {searchTerm ? "No work orders match your search." : "No work orders found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkOrderHistory;


