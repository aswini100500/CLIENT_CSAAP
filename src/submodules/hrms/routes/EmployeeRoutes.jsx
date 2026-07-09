import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import RoutePermissionGuard from "../../../components/RoutePermissionGuard";
import useAuth from "../../../hooks/useAuth";

import ComingSoon from "../../crm/admin/components/ComingSoon";
import LeadList from "../../crm/admin/pages/telemarketing/leads/LeadList";
import SimpleCSVUpload from "../../crm/admin/pages/telemarketing/SimpleCSVUpload";
import CustomerList from "../../crm/admin/pages/customers/CustomerList";
import ViewProfile from "../../crm/admin/pages/customers/ViewProfile";
import CustomerLedger from "../../crm/admin/pages/customers/CustomerLedger";
import QuotationForm from "../../crm/admin/pages/telemarketing/leads/QuotationForm";
import SalesPipeline from "../../crm/admin/pages/telemarketing/leads/SalesPipeline";

import Dashboard from "../components/Dashboard";
import AllReport from "../components/AllReport";
import CalendarTabs from "../components/CalendarTabs";
import AttendanceTabs from "../components/AttendanceTabs";
import JoinedEmployee from "../components/JoinedEmployee";
import MessageTabs from "../components/MessageTabs";
import Task from "../components/Employee Management/Task";
import ArchivedTasks from "../components/Employee Management/ArchivedTasks";
import JobTabs from "../components/JobTabs";
import PayrollPage from "../components/PayRoll/Payrollpage";
import Layout from "../../../components/EmployeeLayout";
import EmployeeProfile from "../Employee dashboard/components/EmployeeProfile";
import AttendanceEmployeeTabs from "../Employee dashboard/pages/AttendanceTabs";
import AssignTask from "../Employee dashboard/pages/AssignTask";
import ComplainOfEmployee from "../Employee dashboard/pages/ComplainofEmployee";
import DashboardEmployee from "../Employee dashboard/pages/DashboardEmployee";
import EmployeeCalendar from "../Employee dashboard/pages/EmployeeCalendar";
import EmployeeDocuments from "../Employee dashboard/pages/EmployeeDocuments";
import LeaveManagement from "../Employee dashboard/pages/LeaveManagement";
import Message from "../Employee dashboard/pages/Message";
import MyserviceRequest from "../Employee dashboard/pages/Myservicerequest";
import TaskTabs from "../Employee dashboard/pages/TaskTabs";
import Timesheet from "../Employee dashboard/pages/Timesheet";
import WorkReportTabs from "../Employee dashboard/pages/WorkReportTabs";
import XYZ from "../components/pages/Xyz";

import ClientCompanyForm from "../../../pages/ClientAccounting/components/CompanyForm";
import ClientDashboard from "../../../pages/ClientAccounting/components/Dashboard";
import ClientGroupCreation from "../../../pages/ClientAccounting/components/GroupCreation";
import ClientListOfGroups from "../../../pages/ClientAccounting/components/ListOfGroups";
import ClientLedgerForm from "../../../pages/ClientAccounting/components/LedgerForm";
import ClientListOfLedger from "../../../pages/ClientAccounting/components/ListOfLedger";
import ClientStatutoryReports from "../../../pages/ClientAccounting/components/StatutoryReports";
import ClientContraVoucher from "../../../pages/ClientAccounting/components/ContraVoucher";
import ClientListOFContraVoucher from "../../../pages/ClientAccounting/components/ListOFContraVoucher";
import ClientPaymentVoucher from "../../../pages/ClientAccounting/components/PaymentVoucher";
import ClientListOfPaymentVoucher from "../../../pages/ClientAccounting/components/ListOfPaymentVoucher";
import ClientReceiveVouchers from "../../../pages/ClientAccounting/components/ReceiveVouchers";
import ClientReceiveVouchersList from "../../../pages/ClientAccounting/components/ReceiveVouchersList";
import ClientJournalVoucher from "../../../pages/ClientAccounting/components/JournalVoucher";
import ClientListOfJournalVoucher from "../../../pages/ClientAccounting/components/ListOfJournalVoucher";
import ClientManufacturing from "../../../pages/ClientAccounting/components/Manufacturing";
import ClientSaleVoucher from "../../../pages/ClientAccounting/components/SaleVoucher";
import ClientListOfSaleVoucher from "../../../pages/ClientAccounting/components/ListOfSaleVoucher";
import ClientPurchaseVoucher from "../../../pages/ClientAccounting/components/PurchaseVoucher";
import ClientListOFPurchaseVoucher from "../../../pages/ClientAccounting/components/ListOFPurchaseVoucher";
import ClientDebitNote from "../../../pages/ClientAccounting/components/DebitNote";
import ClientDebitNoteList from "../../../pages/ClientAccounting/components/DebitNoteList";
import ClientCreditNote from "../../../pages/ClientAccounting/components/CreditNote";
import ClientCreditNoteList from "../../../pages/ClientAccounting/components/CreditNoteList";
import ClientBankActivites from "../../../pages/ClientAccounting/components/BankActivites";
import ClientCheque from "../../../pages/ClientAccounting/components/Cheque";
import ClientChequeRegister from "../../../pages/ClientAccounting/components/ChequeRegister";
import ClientTrialBalance from "../../../pages/ClientAccounting/components/TrailBalance";
import ClientReports from "../../../pages/ClientAccounting/components/Reports";
import ClientDayBook from "../../../pages/ClientAccounting/components/DayBook";
import ClientTransactionSummery from "../../../pages/ClientAccounting/components/TransactionSummery";
import ClientStockItemCreation from "../../../pages/ClientAccounting/components/StockItemCreation";
import ClientStockGroupSummary from "../../../pages/ClientAccounting/components/StockGroupSummery";
import ClientManufacturingList from "../../../pages/ClientAccounting/components/ManufactringList"
import ClientGSTSummary from "../../../pages/ClientAccounting/components/GSTSummary";


import EmployeeForm from "../components/EmployeeForm/Addemployee";
import AcceptedEmployees from "../components/AcceptEmployees";
import TerminateEmployeePage from "../components/TerminateEmployee";
import TransferPage from "../components/Transfer";
import DesignationDetailsInsidePage from "../components/pages/Designationdetailsinsidepage";
import IDCardMaker from "../components/Idcard";
import VisitingCardMaker from "../components/Visitingcard";
import ViewEmployeeDocuments from "../components/Documentview";
import ViewTermsConditions from "../components/Termcondition";
import TimewiseAttendance from "../components/TimewiseAttendance";
import MonthlyLateComingReport from "../components/LateComingReport";
import EarlyGoingReport from "../components/EarlygoingReport";
import OverTime from "../components/OverTime";
import LeaveReport from "../components/Leave";

function EmployeeProtectedRoute() {
  const location = useLocation();
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/employee/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default function EmployeeRoutes() {
  return (
    <Routes>
      <Route element={<EmployeeProtectedRoute />}>
        <Route path="xyz/:company_id" element={<XYZ />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* ── Base Employee Portal routes (Accessible based on employee self-service permissions) ── */}
          <Route element={<RoutePermissionGuard permission="hrms.self_service.dashboard" />}>
            <Route path="dashboard" element={<DashboardEmployee />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.self_service.profile" />}>
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>
          <Route element={<RoutePermissionGuard permission={[
            "hrms.self_service.attendance",
            "hrms.self_service.timesheet",
            "hrms.self_service.leave"
          ]} />}>
            <Route path="attendance" element={<AttendanceEmployeeTabs />} />
            <Route
              path="attendance/add-attendance"
              element={<AttendanceEmployeeTabs defaultTab="add-attendance" />}
            />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="timesheet" element={<Timesheet />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.self_service.work_report" />}>
            <Route path="work-report" element={<WorkReportTabs />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.self_service.message" />}>
            <Route path="message" element={<Message />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.self_service.complain" />}>
            <Route path="complain" element={<ComplainOfEmployee />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.self_service.documents" />}>
            <Route path="documents" element={<EmployeeDocuments />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.self_service.calendar" />}>
            <Route path="calendar" element={<EmployeeCalendar />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.self_service.service_request" />}>
            <Route path="service-request" element={<MyserviceRequest />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.self_service.tasks" />}>
            <Route path="tasks" element={<TaskTabs />} />
            <Route path="assign-task" element={<AssignTask />} />
            <Route path="archived-tasks" element={<ArchivedTasks />} />
          </Route>

          {/* ── HRMS Module Admin/HR Routes ── */}
          <Route element={<RoutePermissionGuard permission="hrms.dashboard" />}>
            <Route path="hr/dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.employee" />}>
            <Route path="hr/joined-employee" element={<JoinedEmployee />} />
            <Route
              path="hr/add-employee"
              element={<EmployeeForm mode="create" basePath="/employee/hr" />}
            />
            <Route
              path="hr/edit-candidate"
              element={<EmployeeForm mode="edit" basePath="/employee/hr" />}
            />
            <Route path="hr/accept-employee" element={<AcceptedEmployees />} />
            <Route
              path="hr/terminate-employee"
              element={<TerminateEmployeePage />}
            />
            <Route path="hr/transfer" element={<TransferPage />} />
            <Route
              path="hr/promotion"
              element={<DesignationDetailsInsidePage />}
            />
            <Route path="hr/download-idcard" element={<IDCardMaker />} />
            <Route
              path="hr/download-visitingcard"
              element={<VisitingCardMaker />}
            />
            <Route
              path="hr/view-document"
              element={<ViewEmployeeDocuments />}
            />
            <Route path="hr/termcondition" element={<ViewTermsConditions />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.attendance" />}>
            <Route path="hr/attendanceuser" element={<AttendanceTabs />} />
            <Route
              path="hr/timewise-attendance"
              element={<TimewiseAttendance />}
            />
            <Route
              path="hr/late-coming-report"
              element={<MonthlyLateComingReport />}
            />
            <Route
              path="hr/early-going-report"
              element={<EarlyGoingReport />}
            />
            <Route path="hr/overtime" element={<OverTime />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.tasks" />}>
            <Route path="hr/task" element={<Task />} />
            <Route path="hr/tasks" element={<Task />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.message" />}>
            <Route path="hr/message-to-employee" element={<MessageTabs />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.job" />}>
            <Route path="hr/job-posting" element={<JobTabs />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.payroll" />}>
            <Route path="hr/payroll" element={<PayrollPage />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.report" />}>
            <Route path="hr/all-report" element={<AllReport />} />
          </Route>
          <Route element={<RoutePermissionGuard permission="hrms.calendar" />}>
            <Route path="hr/calendar" element={<CalendarTabs />} />
          </Route>

          {/* ── Accounting Module Admin Routes ── */}
          <Route>
            <Route path="hr/accounting/client/dashboard" element={<ClientDashboard />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/company" element={<ClientCompanyForm />} />
            <Route path="hr/accounting/client/groupCreation" element={<ClientGroupCreation />} />
            <Route path="hr/accounting/client/listOfGroups" element={<ClientListOfGroups />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/ledger" element={<ClientLedgerForm />} />
            <Route path="hr/accounting/client/ledger/:id" element={<ClientLedgerForm />} />
            <Route path="hr/accounting/client/listOfLedgers" element={<ClientListOfLedger />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/statutoryReports" element={<ClientStatutoryReports />} />
            <Route path="hr/accounting/client/trialBalance" element={<ClientTrialBalance />} />
            <Route path="hr/accounting/client/reports" element={<ClientReports />} />
            <Route path="hr/accounting/client/transactionSummary" element={<ClientTransactionSummery />} />
            <Route path="hr/accounting/client/gst-summary" element={<ClientGSTSummary />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/contravoucher" element={<ClientContraVoucher />} />
            <Route path="hr/accounting/client/contravoucher/:id" element={<ClientContraVoucher />} />
            <Route path="hr/accounting/client/listOfContraVoucher" element={<ClientListOFContraVoucher />} />
            <Route path="hr/accounting/client/paymentVoucher" element={<ClientPaymentVoucher />} />
            <Route path="hr/accounting/client/paymentVoucher/:id" element={<ClientPaymentVoucher />} />
            <Route path="hr/accounting/client/listOfPaymentVoucher" element={<ClientListOfPaymentVoucher />} />
            <Route path="hr/accounting/client/receptVoucher" element={<ClientReceiveVouchers />} />
            <Route path="hr/accounting/client/receptVoucher/:id" element={<ClientReceiveVouchers />} />
            <Route path="hr/accounting/client/listOfReciptVoucher" element={<ClientReceiveVouchersList />} />
            <Route path="hr/accounting/client/journalvoucher" element={<ClientJournalVoucher />} />
            <Route path="hr/accounting/client/journalvoucher/:id" element={<ClientJournalVoucher />} />
            <Route path="hr/accounting/client/listOfJournalVoucher" element={<ClientListOfJournalVoucher />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/salevoucher" element={<ClientSaleVoucher />} />
            <Route path="hr/accounting/client/salevoucher/:id" element={<ClientSaleVoucher />} />
            <Route path="hr/accounting/client/listOfSaleVoucher" element={<ClientListOfSaleVoucher />} />
            <Route path="hr/accounting/client/purchasevoucher" element={<ClientPurchaseVoucher />} />
            <Route path="hr/accounting/client/purchasevoucher/:id" element={<ClientPurchaseVoucher />} />
            <Route path="hr/accounting/client/listOfPurchaseVoucher" element={<ClientListOFPurchaseVoucher />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/debitNote" element={<ClientDebitNote />} />
            <Route path="hr/accounting/client/debitNote/:id" element={<ClientDebitNote />} />
            <Route path="hr/accounting/client/debitNotesList" element={<ClientDebitNoteList />} />
            <Route path="hr/accounting/client/creditNote" element={<ClientCreditNote />} />
            <Route path="hr/accounting/client/creditNote/:id" element={<ClientCreditNote />} />
            <Route path="hr/accounting/client/creditNotesList" element={<ClientCreditNoteList />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/manfacturing" element={<ClientManufacturing />} />
            <Route path="hr/accounting/client/manfacturinglist" element={<ClientManufacturingList />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/bank-activities" element={<ClientBankActivites />} />
            <Route path="hr/accounting/client/cheque" element={<ClientCheque />} />
            <Route path="hr/accounting/client/cheque-register" element={<ClientChequeRegister />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/dayBook" element={<ClientDayBook />} />
          </Route>
          <Route>
            <Route path="hr/accounting/client/stockItemCreation" element={<ClientStockItemCreation />} />
            <Route path="hr/accounting/client/stockGroupSummery" element={<ClientStockGroupSummary />} />
          </Route>

          {/* ── CRM Module Admin Routes ── */}
          <Route element={<RoutePermissionGuard permission="crm.upload" />}>
            <Route
              path="crm/csv-upload-tab"
              element={<SimpleCSVUpload />}
            />
          </Route>
          <Route element={<RoutePermissionGuard permission="crm.leads" />}>
            <Route
              path="crm/lead-management"
              element={<LeadList />}
            />
            <Route
              path="crm/sales-pipeline"
              element={<SalesPipeline />}
            />
          </Route>
          <Route element={<RoutePermissionGuard permission="crm.quotation" />}>
            <Route
              path="crm/quotation-form"
              element={<QuotationForm />}
            />
          </Route>
          <Route element={<RoutePermissionGuard permission="crm.customers" />}>
            <Route
              path="crm/customerlist"
              element={<CustomerList />}
            />
            <Route
              path="crm/customers/:customerId"
              element={<ViewProfile />}
            />
            <Route
              path="crm/customers/:customerId/ledger"
              element={<CustomerLedger />}
            />
          </Route>
          <Route element={<RoutePermissionGuard permission="crm.escalation" />}>
            <Route
              path="crm/escalation-path"
              element={<ComingSoon title="Escalation Path" />}
            />
          </Route>
          <Route element={<RoutePermissionGuard permission="crm.feedback" />}>
            <Route
              path="crm/feedback"
              element={<ComingSoon title="Feedback" />}
            />
          </Route>
          <Route element={<RoutePermissionGuard permission="crm.payment" />}>
            <Route path="crm/payment" element={<ComingSoon title="Payment" />} />
          </Route>
          <Route
            element={<RoutePermissionGuard permission="crm.taskmeeting" />}
          >
            <Route
              path="crm/taskmeeting"
              element={<ComingSoon title="Task & Meetings" />}
            />
          </Route>
          <Route element={<RoutePermissionGuard permission="crm.support" />}>
            <Route path="crm/support" element={<ComingSoon title="Support" />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/employee/dashboard" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
