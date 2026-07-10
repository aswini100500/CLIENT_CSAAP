import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useCompany } from "../context/CompanyContext";
import { ChevronDown, ChevronUp, Package, Trash2, Edit, Download, FileSpreadsheet, FileDown, Printer, UserRound, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";

const ManufacturingList = () => {
    const { companyId, employees } = useCompany();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.includes('/employee/hr') ? '/employee/hr/accounting/client' : '/accounting/client';
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { user } = useAuth();
    const loggedInRole = user?.role?.toLowerCase() || "admin";
    const loggedInEmployeeId = user?.employee_id || null;

    const isEmployeeDashboard = loggedInRole === 'employee';

    const getEmployeeName = (id) => {
        const emp = employees?.find(e => e.id == id);
        return emp ? (emp.name || emp.first_name || "Employee") : "Unknown Employee";
    };

    useEffect(() => {
        if (!companyId) return;
        fetchJournals();
    }, [companyId]);

    const fetchJournals = async () => {
        try {
            setLoading(true);
            const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL;
            const res = await axios.get(`${API_BASE_URL}/api/v1/manufacturing/list/${companyId}`);
            if (res.data.success) {
                setJournals(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching manufacturing list:", error);
            Swal.fire("Error", "Failed to load manufacturing journals", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {

        if (journals.length === 0) {

            Swal.fire(
                "Info",
                "No manufacturing journals to print",
                "info"
            );

            return;
        }

        const { default: jsPDF } =
            await import("jspdf");

        const autoTable =
            (
                await import(
                    "jspdf-autotable"
                )
            ).default;

        const doc =
            new jsPDF();

        const today =
            new Date()
                .toLocaleDateString(
                    "en-IN"
                );



        doc.setFontSize(22);

        doc.setTextColor(
            15,
            23,
            42
        );

        doc.text(
            "Manufacturing Report",
            14,
            18
        );

        doc.setFontSize(10);

        doc.setTextColor(
            100
        );

        doc.text(
            `Generated on: ${today}`,
            195,
            18,
            {
                align: "right"
            }
        );

        doc.setDrawColor(
            220
        );

        doc.line(
            14,
            24,
            195,
            24
        );



        const totalValue =
            journals.reduce(
                (sum, j) =>
                    sum +
                    Number(
                        j.grandTotal || 0
                    ),
                0
            );

        doc.setFontSize(11);

        doc.setTextColor(
            20
        );

        doc.text(
            `Total Journals: ${journals.length}`,
            14,
            34
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            `Total Value: Rs. ${totalValue.toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                }
            )}`,
            195,
            34,
            {
                align: "right"
            }
        );



        const tableData =
            journals.map(
                (j, i) => [

                    i + 1,

                    new Date(
                        j.date
                    ).toLocaleDateString(),

                    j.voucherNo,

                    j.productName,

                    j.finishedQty,

                    `Rs. ${Number(
                        j.effectiveRatePerFinished || 0
                    ).toFixed(2)}`,

                    `Rs. ${Number(
                        j.grandTotal || 0
                    ).toFixed(2)}`
                ]
            );

        autoTable(doc, {

            startY: 42,

            head: [[
                "#",
                "Date",
                "Voucher No",
                "Product Name",
                "Finished Qty",
                "Rate",
                "Total Cost"
            ]],

            body: tableData,

            foot: [[
                "",
                "",
                "",
                "",
                "",
                "TOTAL",
                `Rs. ${totalValue.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                    }
                )}`
            ]],

            theme: "grid",

            tableWidth: "auto",

            styles: {

                fontSize: 9,

                cellPadding: {
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5,
                },

                valign: "middle",

                lineColor: [
                    220,
                    220,
                    220
                ],

                lineWidth: 0.3,

                overflow: "linebreak",

                textColor: [
                    40,
                    40,
                    40
                ],
            },

            headStyles: {

                fillColor: [
                    37,
                    99,
                    235
                ],

                textColor: [
                    255,
                    255,
                    255
                ],

                fontStyle: "bold",

                halign: "center",

                fontSize: 10,
            },

            footStyles: {

                fillColor: [
                    245,
                    245,
                    245
                ],

                textColor: [
                    15,
                    23,
                    42
                ],

                fontStyle: "bold",

                fontSize: 10,
            },

            alternateRowStyles: {

                fillColor: [
                    252,
                    252,
                    252
                ],
            },

            columnStyles: {

                0: {
                    halign: "center",
                    cellWidth: 12,
                },

                1: {
                    halign: "center",
                    cellWidth: 28,
                },

                2: {
                    halign: "center",
                    cellWidth: 30,
                },

                3: {
                    halign: "left",
                    cellWidth: 55,
                },

                4: {
                    halign: "center",
                    cellWidth: 25,
                },

                5: {
                    halign: "right",
                    cellWidth: 28,
                },

                6: {
                    halign: "right",
                    cellWidth: 32,
                },
            },
        });



        const pageCount =
            doc.internal.getNumberOfPages();

        for (
            let i = 1;
            i <= pageCount;
            i++
        ) {

            doc.setPage(i);

            doc.setDrawColor(
                230
            );

            doc.line(
                14,
                285,
                195,
                285
            );

            doc.setFontSize(8);

            doc.setTextColor(
                120
            );

            doc.text(
                "Manufacturing Report",
                14,
                290
            );

            doc.text(
                `Page ${i} of ${pageCount}`,
                195,
                290,
                {
                    align: "right"
                }
            );
        }



        const blobURL =
            doc.output(
                "bloburl"
            );

        const printWindow =
            window.open(
                blobURL
            );

        printWindow.onload =
            () => {

                printWindow.focus();

                printWindow.print();
            };
    };
    const handleExport = () => {
        if (journals.length === 0) {
            Swal.fire("Info", "No data to export", "info");
            return;
        }
        const exportData = journals.map(j => ({
            Date: new Date(j.date).toLocaleDateString(),
            "Voucher No": j.voucherNo,
            "Product Name": j.productName,
            "Batch Name": j.batchName,
            "Finished Qty": j.finishedQty,
            "Effective Rate": j.effectiveRatePerFinished,
            "Total Cost": j.grandTotal,
            "Narration": j.narration
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Manufacturing");
        XLSX.writeFile(wb, "Manufacturing_Report.xlsx");
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will also reverse the stock adjustments!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL || import.meta.env.VITE_API_CLIENT_URL || "http://localhost:5000";
                await axios.delete(`${API_BASE_URL}/api/v1/manufacturing/delete/${id}`);
                Swal.fire("Deleted!", "Manufacturing journal has been deleted.", "success");
                fetchJournals();
            } catch (error) {
                Swal.fire("Error", "Failed to delete journal", "error");
            }
        }
    };

    const handleDownload = (id) => {
        const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL || import.meta.env.VITE_API_CLIENT_URL || "http://localhost:5000";
        window.open(`${API_BASE_URL}/api/v1/manufacturing/download-pdf/${id}`, "_blank");
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredJournals = journals.filter((j) => {
        if (isEmployeeDashboard) {
            if (j.employee_id != loggedInEmployeeId) return false;
        } else {
            const isCreatedByEmployee = j.employee_id && (j.role?.toLowerCase() === 'employee');
            if (showEmployeeActivity) {
                if (!isCreatedByEmployee) return false;
            } else {
                if (isCreatedByEmployee) return false;
            }
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const voucherNo = j.voucherNo?.toLowerCase() || "";
            const productName = j.productName?.toLowerCase() || "";
            if (!voucherNo.includes(query) && !productName.includes(query)) {
                return false;
            }
        }
        
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#F4F6F8] min-h-screen font-[monospace]">

            <div className="bg-[#005AB3] text-white px-5 py-3 shadow">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    

                    <h1 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                        Manufacturing History
                    </h1>


                    <div className="flex items-center gap-2.5 flex-wrap">


                        <div className="relative">
                            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Product / Voucher No."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8.5 pl-8 pr-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-56"
                            />
                        </div>


                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => {
                                    const basePath = loggedInRole === "employee" ? "/employee/hr/accounting/client" : "/accounting/client";
                                    navigate(`${basePath}/manfacturing`);
                                }}
                                className="flex items-center gap-1.5 bg-[#1a56db] hover:bg-blue-600 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create
                            </button>

                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                            >
                                <Printer size={14} /> Print
                            </button>


                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    disabled={filteredJournals.length === 0}
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileDown size={14} /> Export
                                    <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showExportMenu && (
                                    <div className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden">
                                        <button
                                            onClick={() => {
                                                handleExport();
                                                setShowExportMenu(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                                        >
                                            <FileSpreadsheet size={14} className="text-green-600" /> Excel
                                        </button>
                                        <button
                                            onClick={() => {
                                                handlePrint();
                                                setShowExportMenu(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                                        >
                                            <FileDown size={14} className="text-red-600" /> PDF
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!isEmployeeDashboard && (
                                <button
                                    onClick={() => setShowEmployeeActivity(prev => !prev)}
                                    className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
                                        showEmployeeActivity
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                                    }`}
                                >
                                    <UserRound size={14} />
                                    {showEmployeeActivity ? "Back to Journals" : "Employee Activity"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 max-w-350 mx-auto">
                <div className="flex items-center gap-2 text-[#5c6070] text-[13px] font-medium mb-4">
                    <Package size={16} />
                    <span>{filteredJournals.length} Journals Total</span>
                </div>

            <div className="bg-white border border-[#e2e2dc] rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#fcfcfb] border-b border-[#e2e2dc]">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c6070]">Date</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c6070]">Voucher No</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c6070]">Product Name</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c6070]">Finished Qty</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c6070]">Effective Rate</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c6070] text-right">Total Cost</th>
                            {showEmployeeActivity && <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c6070] text-left">Employee Name</th>}
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c6070] text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0ed]">
                        {filteredJournals.length === 0 ? (
                            <tr>
                                <td colSpan={showEmployeeActivity ? "8" : "7"} className="px-6 py-10 text-center text-[#5c6070] italic">
                                    No manufacturing journals found.
                                </td>
                            </tr>
                        ) : (
                            filteredJournals.map((j) => (
                                <React.Fragment key={j.id}>
                                    <tr className={`hover:bg-[#fcfcfb] transition-colors ${expandedId === j.id ? "bg-[#fcfcfb]" : ""}`}>
                                        <td className="px-6 py-4 text-[14px] text-[#0f1117] whitespace-nowrap">
                                            {new Date(j.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-[14px] font-medium text-[#1a56db]">
                                            {j.voucherNo}
                                        </td>
                                        <td className="px-6 py-4 text-[14px] text-[#0f1117]">
                                            {j.productName}
                                        </td>
                                        <td className="px-6 py-4 text-[14px] text-[#0f1117]">
                                            {j.finishedQty}
                                        </td>
                                        <td className="px-6 py-4 text-[14px] text-[#0f1117]">
                                            ₹ {Number(j.effectiveRatePerFinished || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-[14px] font-bold text-[#0f1117] text-right">
                                            ₹ {Number(j.grandTotal || 0).toFixed(2)}
                                        </td>
                                        {showEmployeeActivity && (
                                            <td className="px-6 py-4 text-[14px] text-[#0f1117] truncate max-w-32">
                                                {getEmployeeName(j.employee_id)}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => toggleExpand(j.id)}
                                                    className="p-1.5 text-[#5c6070] hover:bg-[#e2e2dc] rounded-md transition-colors"
                                                    title="View Details"
                                                >
                                                    {expandedId === j.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`${basePath}/manfacturing/${j.id}`)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(j.id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(j.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === j.id && (
                                        <tr className="bg-[#fcfcfb]">
                                            <td colSpan={showEmployeeActivity ? "8" : "7"} className="px-8 py-6 border-b border-[#e2e2dc]">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                                    <div>
                                                        <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#5c6070] mb-3 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                            Components (Consumption)
                                                        </h4>
                                                        <div className="bg-white border border-[#e2e2dc] rounded-lg overflow-hidden shadow-sm text-[13px]">
                                                            <table className="w-full">
                                                                <thead className="bg-[#f7f7f5] border-b border-[#e2e2dc]">
                                                                    <tr>
                                                                        <th className="px-3 py-2 font-semibold text-[#5c6070]">Item</th>
                                                                        <th className="px-3 py-2 font-semibold text-[#5c6070]">Godown</th>
                                                                        <th className="px-3 py-2 text-right font-semibold text-[#5c6070]">Qty</th>
                                                                        <th className="px-3 py-2 text-right font-semibold text-[#5c6070]">Rate</th>
                                                                        <th className="px-3 py-2 text-right font-semibold text-[#5c6070]">Amount</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-[#f0f0ed]">
                                                                    {j.components?.map((c, idx) => (
                                                                        <tr key={idx}>
                                                                            <td className="px-3 py-2 text-[#0f1117]">{c.itemName}</td>
                                                                            <td className="px-3 py-2 text-[#5c6070]">{c.godown}</td>
                                                                            <td className="px-3 py-2 text-right text-[#0f1117]">{c.qty}</td>
                                                                            <td className="px-3 py-2 text-right text-[#5c6070]">₹ {Number(c.rate || 0).toFixed(2)}</td>
                                                                            <td className="px-3 py-2 text-right font-medium text-[#0f1117]">₹ {Number(c.amount || 0).toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>


                                                    <div>
                                                        <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#5c6070] mb-3 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                            By-Products / Scrap
                                                        </h4>
                                                        {j.byProducts?.length > 0 ? (
                                                            <div className="bg-white border border-[#e2e2dc] rounded-lg overflow-hidden shadow-sm text-[13px]">
                                                                <table className="w-full">
                                                                    <thead className="bg-[#f7f7f5] border-b border-[#e2e2dc]">
                                                                        <tr>
                                                                            <th className="px-3 py-2 font-semibold text-[#5c6070]">Item</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-[#5c6070]">Qty</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-[#5c6070]">Amount</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-[#f0f0ed]">
                                                                        {j.byProducts.map((b, idx) => (
                                                                            <tr key={idx}>
                                                                                <td className="px-3 py-2 text-[#0f1117]">{b.itemName}</td>
                                                                                <td className="px-3 py-2 text-right text-[#0f1117]">{b.qty}</td>
                                                                                <td className="px-3 py-2 text-right font-medium text-[#0f1117]">₹ {Number(b.amount || 0).toFixed(2)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[#5c6070] text-[13px] italic bg-white border border-[#e2e2dc] rounded-lg p-4 text-center">
                                                                No by-products recorded.
                                                            </div>
                                                        )}

                                                        <div className="mt-4 p-4 bg-[#fcfcfb] border border-[#e2e2dc] rounded-lg">
                                                            <div className="flex justify-between text-[13px] text-[#5c6070] mb-1">
                                                                <span>Additional Cost:</span>
                                                                <span>₹ {Number(j.addlCost || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[14px] font-bold text-[#0f1117] pt-2 border-t border-[#e2e2dc]">
                                                                <span>Total Journal Value:</span>
                                                                <span>₹ {Number(j.grandTotal || 0).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {j.narration && (
                                                    <div className="mt-6 pt-4 border-t border-[#e2e2dc]">
                                                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#5c6070] mb-1">Narration</p>
                                                        <p className="text-[13px] text-[#0f1117] italic">{j.narration}</p>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
};

export default ManufacturingList;
