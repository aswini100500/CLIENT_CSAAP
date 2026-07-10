import React, { useState } from "react";


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CreateWorkOrder from "./CreateWorkOrder";
import WorkOrderHistory from "./WorkOrderHistrory";

const WorkOrder = () => {
  const [documentDate, setDocumentDate] = useState("");

  const [activeTab, setActiveTab] = useState("Issue Work Order");
  const [items, setItems] = useState([
    {
      id: 1,
      slNo: 1,
      workDescription: "Site Preparation",
      uom: "SQM",
      orderQty: 1500,
      orderRate: 1250,
      orderAmount: 1875000,
    },
  ]);

  const navigationItems = ["Issue Work Order", "Work Order History"];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const totalAmount = items.reduce((sum, i) => sum + i.orderAmount, 0);

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Work Order", 14, 20);
    doc.text(`Date: ${documentDate}`, 150, 20);
    doc.text("Contractor Work Order Summary", 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Sl No", "Description", "UOM", "Qty", "Rate", "Amount"]],
      body: items.map((i) => [
        i.slNo,
        i.workDescription,
        i.uom,
        i.orderQty,
        i.orderRate,
        i.orderAmount,
      ]),
    });

    doc.text(
      `Total: ₹${totalAmount.toFixed(2)}`,
      14,
      doc.lastAutoTable.finalY + 10,
    );
    doc.save("work_order.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto flex space-x-1 px-6">
          {navigationItems.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg ${
                activeTab === tab
                  ? "bg-white text-blue-700 border-t-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto  bg-white  rounded-b-lg">
        {activeTab === "Issue Work Order" && <CreateWorkOrder />}

        {activeTab === "Work Order History" && <WorkOrderHistory />}

        {activeTab === "Summary" && (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Work Order Summary
            </h2>
            <p className="text-gray-700">
              Total Items: <span className="font-bold">{items.length}</span>
            </p>
            <p className="text-green-700 text-lg font-semibold">
              Total Work Order Value: {formatCurrency(totalAmount)}
            </p>
            <button
              onClick={handleGeneratePDF}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrder;
