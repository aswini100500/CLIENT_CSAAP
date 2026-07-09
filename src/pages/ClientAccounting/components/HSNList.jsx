import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';
import useAuth from '../../../hooks/useAuth';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Printer, Search, Hash, RefreshCw, Barcode } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const HSNList = () => {
  const [hsnData, setHsnData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const { companyId, employees } = useCompany();

  const { user, role } = useAuth();
  const loggedInRole = role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;
  const isEmployeeDashboard = loggedInRole === 'employee';

  const getEmployeeName = (id) => {
    const emp = employees?.find(e => e.id == id);
    return emp ? emp.name : "Unknown Employee";
  };

  useEffect(() => {
    if (companyId) fetchHSNData();
  }, [companyId]);

  const fetchHSNData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/getStockHSN/${companyId}`
      );
      if (response.data.message === 'HSN data fetched successfully') {
        setHsnData(response.data.data);
      } else {
        throw new Error('Failed to fetch HSN data');
      }
    } catch (err) {
      setError(err.message);
      Swal.fire('Error', 'Failed to load HSN data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = (isPrint = false) => {

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      'HSN Codes Report',
      14,
      18
    );

    const tableData =
      filteredHSN.map(
        (item, index) => ([
          index + 1,
          item.hsn || 'N/A',
        ])
      );

    autoTable(doc, {

      startY: 28,

      head: [[
        'S.No',
        'HSN Code',
      ]],

      body: tableData,

      styles: {
        fontSize: 10,
      },

      headStyles: {
        fillColor: [147, 51, 234],
      },
    });

    // ===== PRINT =====

    if (isPrint) {

      const blobURL =
        doc.output('bloburl');

      const printWindow =
        window.open(blobURL);

      printWindow.onload = () => {

        printWindow.focus();

        printWindow.print();
      };

    }

    // ===== DOWNLOAD =====

    else {

      doc.save(
        'HSN_Codes_Report.pdf'
      );
    }
  };


  const handlePrint = () => {

    handleExportPDF(true);

  };

  const filteredHSN = hsnData.filter((item) => {
    if (isEmployeeDashboard) {
      if (item.employee_id != loggedInEmployeeId) return false;
    } else {
      const isCreatedByEmployee = item.employee_id && (item.role?.toLowerCase() === 'employee');
      if (showEmployeeActivity) {
        if (!isCreatedByEmployee) return false;
      } else {
        if (isCreatedByEmployee) return false;
      }
    }
    return (item.hsn || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const uniqueHSN = [...new Set(hsnData.map((item) => item.hsn).filter(Boolean))];

  const handleExportExcel = () => {
    if (hsnData.length === 0) return;
    const exportData = hsnData.map((item, index) => ({
      'S.No': index + 1,
      'HSN Code': item.hsn || 'N/A',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HSNCodes');
    XLSX.writeFile(wb, 'HSN_Codes_Report.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading HSN data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load HSN data</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
          <button
            onClick={fetchHSNData}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center">
                <Barcode className="text-purple-600" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">HSN Codes</h1>
                <p className="text-xs text-gray-400 mt-0.5">All HSN / SAC codes</p>
              </div>
            </div>
            <div className="flex gap-2 no-print">
              <button
                onClick={fetchHSNData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              {!isEmployeeDashboard && (
                <button
                  onClick={() => setShowEmployeeActivity(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                    showEmployeeActivity
                      ? "bg-purple-800 text-white border-purple-800"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Hash size={14} /> 
                  {showEmployeeActivity ? "Back to HSN" : "Employee Activity"}
                </button>
              )}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Printer size={14} /> Print
              </button>
              <div className="flex gap-2 no-print">





                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <FileSpreadsheet size={14} />
                  Excel
                </button>

                <button
                  onClick={() => handleExportPDF()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  <Printer size={14} />
                  PDF
                </button>

              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Total items</p>
              <p className="text-2xl font-semibold text-gray-800">{hsnData.length}</p>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Unique HSN codes</p>
              <p className="text-2xl font-semibold text-purple-600">{uniqueHSN.length}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4 no-print">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search HSN codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">HSN codes</span>
              <span className="text-xs bg-purple-100 text-purple-600 font-medium px-2.5 py-0.5 rounded-full">
                {filteredHSN.length} shown
              </span>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-14">
                    S.No
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    HSN Code
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredHSN.length > 0 ? (
                  filteredHSN.map((item, index) => (
                    <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <Hash size={12} className="text-purple-600" />
                          </div>
                          {item.hsn ? (
                            <span className="font-mono text-sm font-medium text-gray-800">
                              {item.hsn}
                              {item.employee_id && item.role?.toLowerCase() === 'employee' && (
                                <span className="ml-2 font-sans text-xs text-gray-500 font-normal">
                                  (Created by: {getEmployeeName(item.employee_id)})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Not specified
                              {item.employee_id && item.role?.toLowerCase() === 'employee' && (
                                <span className="ml-2 font-sans text-xs text-gray-500 font-normal">
                                  (Created by: {getEmployeeName(item.employee_id)})
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-12 text-center">
                      <Hash className="mx-auto mb-2 text-gray-300" size={32} />
                      <p className="text-sm text-gray-400 font-medium">No HSN codes found</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {searchTerm ? 'Try a different search term' : 'Add HSN codes to stock items'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
};

export default HSNList;