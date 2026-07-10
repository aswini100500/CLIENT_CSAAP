import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Printer,
  Calendar,
  DollarSign,
  Building,
  Award,
  Clock,
  TrendingUp,
  Shield,
  X,
  Search,
  Filter,
  ChevronDown,
  FileSignature,
  FileCheck,
  Receipt,
  Heart,
  GraduationCap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const EmployeeDocuments = ({ darkMode, employeeData }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentType, setDocumentType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "month",
    direction: "desc",
  });

  const employee = {
    id: "EMP001",
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    department: "Engineering",
    position: "Senior Software Engineer",
    joinDate: "2020-06-15",
    employeeType: "Full-time",
    manager: "Sarah Johnson",
    bankDetails: {
      bankName: "Chase Bank",
      accountNumber: "****1234",
      routingNumber: "****5678",
      accountType: "Checking",
    },
    taxInfo: {
      ssn: "***-**-1234",
      filingStatus: "Single",
      allowances: 2,
      taxId: "TX123456",
    },
    epfoDetails: {
      uan: "UAN1234567890",
      memberId: "MEM123456",
      pfAccount: "PF1234567890",
      epsAccount: "EPS1234567890",
    },
  };

  const payslips = [
    {
      id: 1,
      month: "January",
      year: 2026,
      period: "Jan 1 - Jan 31, 2026",
      salaryDate: "2026-01-31",
      grossPay: 8500.0,
      netPay: 6250.5,
      totalDeductions: 2249.5,
      status: "paid",
      paymentMode: "Bank Transfer",
      transactionId: "TXN123456789",
      earnings: [
        { type: "Basic Salary", amount: 5000.0 },
        { type: "Housing Allowance", amount: 1500.0 },
        { type: "Transport Allowance", amount: 500.0 },
        { type: "Medical Allowance", amount: 500.0 },
        { type: "Special Allowance", amount: 500.0 },
        { type: "Overtime (15 hrs)", amount: 250.0 },
        { type: "Performance Bonus", amount: 500.0 },
      ],
      deductions: [
        { type: "EPF - Employee Provident Fund", amount: 600.0 },
        { type: "EPS - Pension Scheme", amount: 250.0 },
        { type: "EDLI - Insurance", amount: 15.0 },
        { type: "PF Admin Charges", amount: 1.5 },
        { type: "ESI", amount: 212.5 },
        { type: "Professional Tax", amount: 200.0 },
        { type: "Income Tax", amount: 750.0 },
        { type: "Labor Welfare", amount: 20.0 },
        { type: "Other Deductions", amount: 200.5 },
      ],
      epfoBalance: {
        epfBalance: 45678.5,
        epsBalance: 23456.75,
        edliBalance: 3456.8,
        totalEpfoBalance: 72592.05,
        previousBalance: 45245.55,
        employeeContribution: 600.0,
        employerContribution: 600.0,
        interestEarned: 432.5,
        interestRate: 8.25,
      },
      overtime: {
        hours: 15,
        rate: 16.67,
        amount: 250.0,
        ytdHours: 15,
        ytdAmount: 250.0,
      },
      yearToDate: {
        grossPay: 8500.0,
        netPay: 6250.5,
        pfContribution: 1200.0,
        taxDeducted: 750.0,
        overtimeTotal: 250.0,
        overtimeHours: 15,
      },
    },
    {
      id: 2,
      month: "February",
      year: 2026,
      period: "Feb 1 - Feb 28, 2026",
      salaryDate: "2026-02-28",
      grossPay: 8800.0,
      netPay: 6450.75,
      totalDeductions: 2349.25,
      status: "paid",
      paymentMode: "Bank Transfer",
      transactionId: "TXN987654321",
      earnings: [
        { type: "Basic Salary", amount: 5000.0 },
        { type: "Housing Allowance", amount: 1500.0 },
        { type: "Transport Allowance", amount: 500.0 },
        { type: "Medical Allowance", amount: 500.0 },
        { type: "Special Allowance", amount: 500.0 },
        { type: "Overtime (30 hrs)", amount: 500.0 },
        { type: "Performance Bonus", amount: 500.0 },
        { type: "Incentives", amount: 200.0 },
        { type: "Arrears", amount: 100.0 },
      ],
      deductions: [
        { type: "EPF - Employee Provident Fund", amount: 600.0 },
        { type: "EPS - Pension Scheme", amount: 250.0 },
        { type: "EDLI - Insurance", amount: 15.0 },
        { type: "PF Admin Charges", amount: 1.5 },
        { type: "ESI", amount: 220.0 },
        { type: "Professional Tax", amount: 200.0 },
        { type: "Income Tax", amount: 800.0 },
        { type: "Labor Welfare", amount: 20.0 },
        { type: "Other Deductions", amount: 242.75 },
      ],
      epfoBalance: {
        epfBalance: 46278.5,
        epsBalance: 23706.75,
        edliBalance: 3472.3,
        totalEpfoBalance: 73457.55,
        previousBalance: 45678.5,
        employeeContribution: 600.0,
        employerContribution: 600.0,
        interestEarned: 438.75,
        interestRate: 8.25,
      },
      overtime: {
        hours: 30,
        rate: 16.67,
        amount: 500.0,
        ytdHours: 45,
        ytdAmount: 750.0,
      },
      yearToDate: {
        grossPay: 17300.0,
        netPay: 12701.25,
        pfContribution: 2400.0,
        taxDeducted: 1550.0,
        overtimeTotal: 750.0,
        overtimeHours: 45,
      },
    },
    {
      id: 3,
      month: "March",
      year: 2026,
      period: "Mar 1 - Mar 31, 2026",
      salaryDate: "2026-03-31",
      grossPay: 9200.0,
      netPay: 6750.25,
      totalDeductions: 2449.75,
      status: "pending",
      paymentMode: "Bank Transfer",
      transactionId: "TXN456789123",
      earnings: [
        { type: "Basic Salary", amount: 5000.0 },
        { type: "Housing Allowance", amount: 1500.0 },
        { type: "Transport Allowance", amount: 500.0 },
        { type: "Medical Allowance", amount: 500.0 },
        { type: "Special Allowance", amount: 500.0 },
        { type: "Overtime (45 hrs)", amount: 750.0 },
        { type: "Performance Bonus", amount: 500.0 },
        { type: "Incentives", amount: 300.0 },
        { type: "Arrears", amount: 250.0 },
      ],
      deductions: [
        { type: "EPF - Employee Provident Fund", amount: 600.0 },
        { type: "EPS - Pension Scheme", amount: 250.0 },
        { type: "EDLI - Insurance", amount: 15.0 },
        { type: "PF Admin Charges", amount: 1.5 },
        { type: "ESI", amount: 230.0 },
        { type: "Professional Tax", amount: 200.0 },
        { type: "Income Tax", amount: 850.0 },
        { type: "Labor Welfare", amount: 20.0 },
        { type: "Other Deductions", amount: 283.25 },
      ],
      epfoBalance: {
        epfBalance: 46878.5,
        epsBalance: 23956.75,
        edliBalance: 3487.8,
        totalEpfoBalance: 74323.05,
        previousBalance: 46278.5,
        employeeContribution: 600.0,
        employerContribution: 600.0,
        interestEarned: 445.25,
        interestRate: 8.25,
      },
      overtime: {
        hours: 45,
        rate: 16.67,
        amount: 750.0,
        ytdHours: 90,
        ytdAmount: 1500.0,
      },
      yearToDate: {
        grossPay: 26500.0,
        netPay: 19451.5,
        pfContribution: 3600.0,
        taxDeducted: 2400.0,
        overtimeTotal: 1500.0,
        overtimeHours: 90,
      },
    },
  ];

  const officialDocuments = [
    {
      id: 101,
      type: "offer",
      title: "Employment Offer Letter",
      date: "2020-05-20",
      description:
        "Initial employment offer for Senior Software Engineer position",
      status: "signed",
      signedBy: "John Smith",
      signedDate: "2020-05-25",
      pdfUrl: "#",
      template: "standard",
    },
    {
      id: 102,
      type: "contract",
      title: "Employment Contract",
      date: "2020-06-01",
      description: "Formal employment contract with terms and conditions",
      status: "signed",
      signedBy: "John Smith",
      signedDate: "2020-06-05",
      pdfUrl: "#",
      expiryDate: "2023-06-01",
    },
    {
      id: 103,
      type: "appraisal",
      title: "Performance Appraisal 2025",
      date: "2025-12-15",
      description: "Annual performance review and salary revision",
      status: "completed",
      rating: 4.5,
      newSalary: 102000,
      increment: 12,
      pdfUrl: "#",
    },
    {
      id: 104,
      type: "promotion",
      title: "Promotion Letter - Senior Engineer",
      date: "2022-06-15",
      description:
        "Promotion from Software Engineer to Senior Software Engineer",
      status: "signed",
      previousPosition: "Software Engineer",
      newPosition: "Senior Software Engineer",
      effectiveDate: "2022-07-01",
      pdfUrl: "#",
    },
    {
      id: 105,
      type: "bonus",
      title: "Annual Bonus Letter 2025",
      date: "2025-12-20",
      description: "Year-end performance bonus confirmation",
      bonusAmount: 15000,
      paymentDate: "2026-01-15",
      status: "issued",
      pdfUrl: "#",
    },
    {
      id: 106,
      type: "training",
      title: "Training Certification - AWS",
      date: "2024-08-10",
      description: "AWS Certified Solutions Architect",
      provider: "Amazon Web Services",
      expiryDate: "2027-08-10",
      credentialId: "AWS-CSA-2024-12345",
      status: "active",
      pdfUrl: "#",
    },
    {
      id: 107,
      type: "benefits",
      title: "Benefits Enrollment Confirmation",
      date: "2026-01-05",
      description: "2026 Benefits enrollment summary",
      healthPlan: "Premium PPO",
      dentalPlan: "Standard",
      visionPlan: "Standard",
      status: "active",
      pdfUrl: "#",
    },
    {
      id: 108,
      type: "nda",
      title: "Non-Disclosure Agreement",
      date: "2020-06-01",
      description: "Confidentiality agreement",
      status: "signed",
      signedBy: "John Smith",
      signedDate: "2020-06-05",
      pdfUrl: "#",
    },
  ];

  const allDocuments = [
    ...payslips.map((p) => ({ ...p, docType: "payslip" })),
    ...officialDocuments,
  ];

  const filteredDocuments = allDocuments.filter((doc) => {
    if (
      documentType !== "all" &&
      doc.docType !== documentType &&
      doc.type !== documentType
    )
      return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.title?.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.month?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const sortPayslips = (payslips) => {
    return [...payslips].sort((a, b) => {
      if (sortConfig.key === "month") {
        const monthOrder = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const aIndex = monthOrder.indexOf(a.month);
        const bIndex = monthOrder.indexOf(b.month);
        return sortConfig.direction === "asc"
          ? aIndex - bIndex
          : bIndex - aIndex;
      }
      if (sortConfig.key === "year") {
        return sortConfig.direction === "asc"
          ? a.year - b.year
          : b.year - a.year;
      }
      if (sortConfig.key === "salaryDate") {
        return sortConfig.direction === "asc"
          ? new Date(a.salaryDate) - new Date(b.salaryDate)
          : new Date(b.salaryDate) - new Date(a.salaryDate);
      }
      return 0;
    });
  };

  const payslipsList = sortPayslips(payslips);

  const getDocumentIcon = (type) => {
    switch (type) {
      case "payslip":
        return Receipt;
      case "offer":
        return FileSignature;
      case "contract":
        return FileCheck;
      case "appraisal":
        return TrendingUp;
      case "promotion":
        return Award;
      case "bonus":
        return DollarSign;
      case "training":
        return GraduationCap;
      case "benefits":
        return Heart;
      case "nda":
        return Shield;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "signed":
      case "active":
      case "paid":
      case "completed":
      case "issued":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadPayslipPDF = async (payslip) => {
    const pdfContent = document.createElement("div");
    pdfContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; background: white;">
        <!-- Company Header -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">COMPANY NAME</h1>
          <p style="color: #666; margin: 5px 0;">123 Business Avenue, Suite 100, New York, NY 10001</p>
          <p style="color: #666; margin: 5px 0;">Phone: +1 (555) 123-4567 | Email: finance@company.com</p>
          <h2 style="color: #333; margin: 15px 0 5px; font-size: 24px;">PAYSLIP FOR ${payslip.month} ${payslip.year}</h2>
          <p style="color: #666; margin: 0;">Period: ${payslip.period}</p>
          <p style="color: #666; margin: 0;">Salary Date: ${payslip.salaryDate}</p>
        </div>

        <!-- Employee Details Table -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Employee Details</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; width: 25%;">Employee Name:</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${employee.name}</td>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6; width: 25%;">Employee ID:</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${employee.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6;">Department:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${employee.department}</td>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6;">Designation:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${employee.position}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6;">UAN Number:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${employee.epfoDetails.uan}</td>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f3f4f6;">PF Member ID:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${employee.epfoDetails.memberId}</td>
            </tr>
          </table>
        </div>

        <!-- Earnings Table -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Earnings</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background: #2563eb; color: white;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${payslip.earnings
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${item.type}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.amount)}</td>
                </tr>
              `,
                )
                .join("")}
              <tr style="background: #e8f4fd; font-weight: bold;">
                <td style="padding: 8px; border: 1px solid #ddd;">Total Earnings</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(payslip.grossPay)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Deductions Table -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Deductions</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background: #dc2626; color: white;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${payslip.deductions
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${item.type}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.amount)}</td>
                </tr>
              `,
                )
                .join("")}
              <tr style="background: #fee2e2; font-weight: bold;">
                <td style="padding: 8px; border: 1px solid #ddd;">Total Deductions</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(payslip.totalDeductions)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Net Pay -->
        <div style="margin-bottom: 25px; background: #dcfce7; padding: 15px; border-radius: 8px;">
          <table style="width: 100%;">
            <tr>
              <td style="font-size: 18px; font-weight: bold;">NET PAY (Take Home)</td>
              <td style="font-size: 24px; font-weight: bold; color: #16a34a; text-align: right;">${formatCurrency(payslip.netPay)}</td>
            </tr>
          </table>
        </div>

        <!-- EPFO Balance Table -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">EPFO Balance Summary</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #2563eb;">
            <thead>
              <tr style="background: #2563eb; color: white;">
                <th style="padding: 8px; text-align: left; border: 1px solid #2563eb;">Component</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #2563eb;">Previous Balance</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #2563eb;">Employee Contribution</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #2563eb;">Employer Contribution</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #2563eb;">Interest</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #2563eb;">Total Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #2563eb;">EPF Account</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">${formatCurrency(payslip.epfoBalance.previousBalance)}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">${formatCurrency(payslip.epfoBalance.employeeContribution)}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">${formatCurrency(payslip.epfoBalance.employerContribution)}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">${formatCurrency(payslip.epfoBalance.interestEarned)}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb; font-weight: bold;">${formatCurrency(payslip.epfoBalance.epfBalance)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #2563eb;">EPS Account</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">${formatCurrency(payslip.epfoBalance.epsBalance - 250)}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">250.00</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">250.00</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">-</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb; font-weight: bold;">${formatCurrency(payslip.epfoBalance.epsBalance)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #2563eb;">EDLI Account</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">${formatCurrency(payslip.epfoBalance.edliBalance - 15)}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">-</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">15.00</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb;">-</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #2563eb; font-weight: bold;">${formatCurrency(payslip.epfoBalance.edliBalance)}</td>
              </tr>
              <tr style="background: #f0f7ff; font-weight: bold;">
                <td style="padding: 10px; border: 1px solid #2563eb;" colspan="5">TOTAL EPFO BALANCE</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #2563eb;">${formatCurrency(payslip.epfoBalance.totalEpfoBalance)}</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 5px; font-size: 12px; color: #666;">Interest Rate: ${payslip.epfoBalance.interestRate}% p.a.</p>
        </div>

        <!-- Overtime Table -->
        ${
          payslip.overtime.hours > 0
            ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Overtime Summary</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #f59e0b;">
            <thead>
              <tr style="background: #f59e0b; color: white;">
                <th style="padding: 8px; text-align: left; border: 1px solid #f59e0b;">Period</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #f59e0b;">Hours</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #f59e0b;">Rate</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #f59e0b;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #f59e0b;">This Month</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #f59e0b;">${payslip.overtime.hours}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #f59e0b;">$${payslip.overtime.rate}/hr</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #f59e0b; font-weight: bold;">${formatCurrency(payslip.overtime.amount)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #f59e0b;">Year to Date</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #f59e0b;">${payslip.overtime.ytdHours}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #f59e0b;">-</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #f59e0b; font-weight: bold;">${formatCurrency(payslip.overtime.ytdAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <!-- Year to Date Table -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Year to Date (YTD) Summary</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #6b7280;">
            <thead>
              <tr style="background: #6b7280; color: white;">
                <th style="padding: 8px; text-align: left; border: 1px solid #6b7280;">Description</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #6b7280;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #6b7280;">Gross Earnings</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #6b7280;">${formatCurrency(payslip.yearToDate.grossPay)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #6b7280;">Net Pay</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #6b7280;">${formatCurrency(payslip.yearToDate.netPay)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #6b7280;">Total PF Contribution</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #6b7280;">${formatCurrency(payslip.yearToDate.pfContribution)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #6b7280;">Total Tax Deducted</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #6b7280;">${formatCurrency(payslip.yearToDate.taxDeducted)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Payment Details -->
        <div style="margin-bottom: 20px; padding: 10px; background: #f9fafb; border-radius: 8px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px; color: #666;">Payment Date:</td>
              <td style="padding: 5px; font-weight: bold;">${payslip.salaryDate}</td>
              <td style="padding: 5px; color: #666;">Payment Mode:</td>
              <td style="padding: 5px; font-weight: bold;">${payslip.paymentMode}</td>
            </tr>
            <tr>
              <td style="padding: 5px; color: #666;">Transaction ID:</td>
              <td style="padding: 5px; font-weight: bold;">${payslip.transactionId}</td>
              <td style="padding: 5px; color: #666;">Status:</td>
              <td style="padding: 5px; font-weight: bold; color: ${payslip.status === "paid" ? "#16a34a" : "#ca8a04"}">${payslip.status.toUpperCase()}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #666; font-size: 12px;">
          <p>This is a computer generated document. No signature is required.</p>
          <p>For any queries, please contact HR or Finance department.</p>
          <p>© ${payslip.year} Company Name. All rights reserved.</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;

    document.body.appendChild(pdfContent);

    try {
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip-${payslip.month}-${payslip.year}-${employee.name}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      document.body.removeChild(pdfContent);
    }
  };

  const downloadDocument = (doc) => {
    if (doc.docType === "payslip") {
      downloadPayslipPDF(doc);
    } else {
      alert(`Downloading ${doc.title}`);
    }
  };

  const viewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column)
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                YTD Gross Pay
              </p>
              <p
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {formatCurrency(26500)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 12% from last year</p>
        </div>

        <div
          className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Total Documents
              </p>
              <p
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {allDocuments.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">8 new this year</p>
        </div>

        <div
          className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Pending Actions
              </p>
              <p
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                2
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">Review required</p>
        </div>

        <div
          className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Next Payday
              </p>
              <p
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Mar 31
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">In 11 days</p>
        </div>
      </div>

      <div
        className={`rounded-xl shadow-lg p-4 transition-colors duration-300 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setDocumentType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                documentType === "all"
                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Documents
            </button>
            <button
              onClick={() => setDocumentType("payslip")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                documentType === "payslip"
                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Payslips
            </button>
            <button
              onClick={() => setDocumentType("offer")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                documentType === "offer"
                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Official Letters
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            <button
              className={`p-2 rounded-lg border ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {documentType === "payslip" ? (
        <div
          className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2
              className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Payslips History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() =>
                      setSortConfig({
                        key: "month",
                        direction:
                          sortConfig.direction === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>Month</span>
                      <SortIcon column="month" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() =>
                      setSortConfig({
                        key: "year",
                        direction:
                          sortConfig.direction === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>Year</span>
                      <SortIcon column="year" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Period
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() =>
                      setSortConfig({
                        key: "salaryDate",
                        direction:
                          sortConfig.direction === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>Salary Date</span>
                      <SortIcon column="salaryDate" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {payslipsList.map((payslip) => (
                  <tr
                    key={payslip.id}
                    className={`hover:bg-opacity-50 ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {payslip.month}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {payslip.year}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {payslip.period}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {formatDate(payslip.salaryDate)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(payslip.grossPay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      {formatCurrency(payslip.netPay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payslip.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payslip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => downloadDocument(payslip)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments
            .filter((doc) => doc.docType !== "payslip")
            .map((doc) => {
              const Icon = getDocumentIcon(doc.type);
              return (
                <div
                  key={doc.id}
                  className={`group rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-750"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => viewDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}
                    >
                      {doc.status.toUpperCase()}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {doc.title}
                  </h3>

                  <p
                    className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {doc.description}
                  </p>

                  <p
                    className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Issued: {new Date(doc.date).toLocaleDateString()}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewDocument(doc);
                      }}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadDocument(doc);
                      }}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} sticky top-0 bg-inherit z-10`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-lg ${
                      selectedDocument.docType === "payslip"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {selectedDocument.docType === "payslip" ? (
                      <Receipt className="h-6 w-6 text-green-600" />
                    ) : (
                      <FileText className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedDocument.docType === "payslip"
                        ? `${selectedDocument.month} ${selectedDocument.year} Payslip`
                        : selectedDocument.title}
                    </h2>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {selectedDocument.docType === "payslip"
                        ? selectedDocument.period
                        : `Issued: ${new Date(selectedDocument.date).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadDocument(selectedDocument)}
                    className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </button>
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <X
                      className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {selectedDocument.docType === "payslip" ? (
                <div
                  className={`rounded-lg p-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className="text-center mb-6 pb-6 border-b border-gray-300 dark:border-gray-600">
                    <h3 className="text-2xl font-bold text-blue-600">
                      Company Name
                    </h3>
                    <p className="text-gray-500">
                      123 Business Ave, Suite 100, New York, NY 10001
                    </p>
                    <p className="text-gray-500">
                      Payslip for {selectedDocument.month}{" "}
                      {selectedDocument.year}
                    </p>
                    <p className="text-gray-500">
                      Salary Date: {selectedDocument.salaryDate}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Employee Details</h4>
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-medium w-1/4">
                            Employee Name
                          </td>
                          <td className="border border-gray-300 p-2">
                            {employee.name}
                          </td>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-medium w-1/4">
                            Employee ID
                          </td>
                          <td className="border border-gray-300 p-2">
                            {employee.id}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                            Department
                          </td>
                          <td className="border border-gray-300 p-2">
                            {employee.department}
                          </td>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                            Position
                          </td>
                          <td className="border border-gray-300 p-2">
                            {employee.position}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                            UAN Number
                          </td>
                          <td className="border border-gray-300 p-2">
                            {employee.epfoDetails.uan}
                          </td>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-medium">
                            PF Member ID
                          </td>
                          <td className="border border-gray-300 p-2">
                            {employee.epfoDetails.memberId}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Earnings</h4>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-blue-600 text-white">
                          <th className="border border-gray-300 p-2 text-left">
                            Description
                          </th>
                          <th className="border border-gray-300 p-2 text-right">
                            Amount (USD)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDocument.earnings.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 p-2">
                              {item.type}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-blue-100 font-bold">
                          <td className="border border-gray-300 p-2">
                            Total Earnings
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            {formatCurrency(selectedDocument.grossPay)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Deductions</h4>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-red-600 text-white">
                          <th className="border border-gray-300 p-2 text-left">
                            Description
                          </th>
                          <th className="border border-gray-300 p-2 text-right">
                            Amount (USD)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDocument.deductions.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 p-2">
                              {item.type}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-red-100 font-bold">
                          <td className="border border-gray-300 p-2">
                            Total Deductions
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            {formatCurrency(selectedDocument.totalDeductions)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-6 p-4 bg-green-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">
                        NET PAY (Take Home)
                      </span>
                      <span className="font-bold text-2xl text-green-600">
                        {formatCurrency(selectedDocument.netPay)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-lg p-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className="text-center mb-6 pb-6 border-b border-gray-300 dark:border-gray-600">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Building className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-600">
                      Company Name
                    </h3>
                    <p className="text-gray-500">Official Document</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold mb-4">
                        {selectedDocument.title}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {selectedDocument.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Document Type</p>
                        <p className="font-medium capitalize">
                          {selectedDocument.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issue Date</p>
                        <p className="font-medium">
                          {new Date(selectedDocument.date).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedDocument.signedBy && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Signed By</p>
                            <p className="font-medium">
                              {selectedDocument.signedBy}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Signed Date</p>
                            <p className="font-medium">
                              {new Date(
                                selectedDocument.signedDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`p-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"} flex justify-end space-x-3`}
            >
              <button
                onClick={() => downloadDocument(selectedDocument)}
                className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
