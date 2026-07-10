import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useSearchParams, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";


import { CompanyProvider } from "./pages/ClientAccounting/context/CompanyContext";
import { UserProvider } from "./pages/ClientAccounting/context/UserContext";
import {
  clearLegacyAuthSessionStorage,
  getAuthToken,
  getAuthUser,
  resetPersistedAuthState,
} from "./store/authSession";
import {
  normalizeUserPayload,
  setUser as setActiveUser,
} from "./store/slices/userSlice";
import { setSuperAdmin } from "./submodules/hrms/redux/slices/superAdminSlice";


import AdminLayout from "./components/AdminLayout";



import Bill from "./pages/Operation/BOQ/Bill";
import Drivers from "./pages/Operation/Equipment management/Drivers";
import EquipmentManage from "./pages/Operation/Equipment management/EquipmentManage";
import Operator from "./pages/Operation/Equipment management/Operator";
import Vehicle from "./pages/Operation/Equipment management/Vehicle";
import AttachementContractor from "./pages/Operation/Operation/AttachementContractor";
import BillInward from "./pages/Operation/Operation/BillInward";
import ChangeHistoryContractor from "./pages/Operation/Operation/ChangeHistoryContractor";
import Compliances from "./pages/Operation/Operation/Compliances";
import Contractor from "./pages/Operation/Operation/Contractor";
import Equipment from "./pages/Operation/Operation/Equipment";
import HinderingReport from "./pages/Operation/Operation/HinderingReport";
import LabourRates from "./pages/Operation/Operation/LabourRates";
import Tendering from "./pages/Operation/Operation/Tendering";
import Vendor from "./pages/Operation/Operation/Vendor";
import ApprovalHistoryPage from "./pages/Operation/Operation/projectBudget/ApprovalHistrory";
import ProjectBudgetTabs from "./pages/Operation/Operation/projectBudget/ProjectBudget";
import DailyWorkReport from "./pages/Operation/Work Diary/DailyWorkReport";
import WorkDiary from "./pages/Operation/Work Diary/WorkDiary";
import Work from "./pages/Operation/Work Order/Work";
import IndentEntryO from "./pages/Operation/material mangement/IndentEntryO";


import EmployeeForm from "./components/EmployeeForm";
import ProjectsPage from "./components/projectCl/projectCl";
import BrokerPage from "./pages/BrokerPage";
import ContractorsPage from "./pages/ContractorPage";
import DashboardHome from "./pages/DashboardHome";
import BarcodeSale from "./pages/Stock&inventory/BarcodeSale";
import IndentEntry from "./pages/Stock&inventory/IndentEntry";
import PurchaseMain from "./pages/Stock&inventory/PurchaseMain";
import SalesEntry from "./pages/Stock&inventory/SaleEntry";
import StockEntry from "./pages/Stock&inventory/StockEntry";
import SupplierList from "./pages/Stock&inventory/SupplierList";
import SupplierPage from "./pages/SupplierPage";


import ClientBankActivites from "./pages/ClientAccounting/components/BankActivites";
import ClientCheque from "./pages/ClientAccounting/components/Cheque";
import ClientChequeRegister from "./pages/ClientAccounting/components/ChequeRegister";
import ClientCompanyForm from "./pages/ClientAccounting/components/CompanyForm";
import ClientContraVoucher from "./pages/ClientAccounting/components/ContraVoucher";
import ClientCreditNote from "./pages/ClientAccounting/components/CreditNote";
import ClientCreditNoteList from "./pages/ClientAccounting/components/CreditNoteList";
import ClientDashboard from "./pages/ClientAccounting/components/Dashboard";
import ClientDayBook from "./pages/ClientAccounting/components/DayBook";
import ClientDebitNote from "./pages/ClientAccounting/components/DebitNote";
import ClientDebitNoteList from "./pages/ClientAccounting/components/DebitNoteList";
import ClientGroupCreation from "./pages/ClientAccounting/components/GroupCreation";
import ClientJournalVoucher from "./pages/ClientAccounting/components/JournalVoucher";
import ClientLedgerForm from "./pages/ClientAccounting/components/LedgerForm";
import ClientListOFContraVoucher from "./pages/ClientAccounting/components/ListOFContraVoucher";
import ClientListOFPurchaseVoucher from "./pages/ClientAccounting/components/ListOFPurchaseVoucher";
import ClientListOfGroups from "./pages/ClientAccounting/components/ListOfGroups";
import ClientListOfJournalVoucher from "./pages/ClientAccounting/components/ListOfJournalVoucher";
import ClientListOfLedger from "./pages/ClientAccounting/components/ListOfLedger";
import ClientListOfPaymentVoucher from "./pages/ClientAccounting/components/ListOfPaymentVoucher";
import ClientListOfSaleVoucher from "./pages/ClientAccounting/components/ListOfSaleVoucher";
import ClientManufacturingList from "./pages/ClientAccounting/components/ManufactringList";

import ClientManufacturing from "./pages/ClientAccounting/components/Manufacturing";
import ClientPaymentVoucher from "./pages/ClientAccounting/components/PaymentVoucher";
import ClientPurchaseVoucher from "./pages/ClientAccounting/components/PurchaseVoucher";
import ClientReceiveVouchers from "./pages/ClientAccounting/components/ReceiveVouchers";
import ClientReceiveVouchersList from "./pages/ClientAccounting/components/ReceiveVouchersList";
import ClientReports from "./pages/ClientAccounting/components/Reports";
import ClientSaleVoucher from "./pages/ClientAccounting/components/SaleVoucher";
import ClientStatutoryReports from "./pages/ClientAccounting/components/StatutoryReports";
import ClientStockGroupSummary from "./pages/ClientAccounting/components/StockGroupSummery";
import ClientStockItemCreation from "./pages/ClientAccounting/components/StockItemCreation";
import ClientTrialBalance from "./pages/ClientAccounting/components/TrailBalance";
import ClientTransactionSummery from "./pages/ClientAccounting/components/TransactionSummery";
import ClientGSTSummary from "./pages/ClientAccounting/components/GSTSummary";
import CustomerManagementAccounting from "./pages/ClientAccounting/components/CustomerManagementAccounting";
import PlansPage from "./pages/PlansPage";
import UserPlanDetails from "./pages/HRMS/plans/UserPlanDetails";
import ContactUs from "./pages/ContactUs";




import AdminRoutes from "./submodules/crm/admin/routes/AdminRoutes";
import HRMSAdminRoutes from "./submodules/hrms/routes/AdminRoutes";
import HRMSEmployeeRoutes from "./submodules/hrms/routes/EmployeeRoutes";



import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentsPage from "./pages/PaymentsPage";
import AllCompanies from "./pages/UserManagement/AllCompanies";
import CompanyPaymentSetup from "./pages/UserManagement/CompanyPaymentSetup";
import DepartmentRoleManager from "./pages/UserManagement/DepartmentRoleManager";
import PermissionManager from "./pages/UserManagement/PermissionManager";
import ProjectAssignment from "./pages/UserManagement/ProjectAssignment";
import BookingCancellations from "./pages/UserManagement/BookingCancellations";
import HSNList from "./pages/ClientAccounting/components/HSNList";

import StockNamesList from "./pages/ClientAccounting/components/StockNamesList";
import CashActivities from "./pages/ClientAccounting/components/Cash";

import SuperAdminAccountingActivity from "./pages/SuperAdmin/Accounting/SuperAdminAccountingActivity";
import SuperAdminAccountingLedgers from "./pages/SuperAdmin/Accounting/SuperAdminAccountingLedgers";
import SuperAdminAccountingStocks from "./pages/SuperAdmin/Accounting/SuperAdminAccountingStocks";
import SuperAdminAccountingVouchers from "./pages/SuperAdmin/Accounting/SuperAdminAccountingVouchers";
import GstDetails from "./pages/SuperAdmin/Accounting/GstDetails";
import CompanyProfilePage from "./pages/CompanyProfile";

const XYZRedirect = () => {
  const [searchParams] = useSearchParams();
  const { company_id: routeCompanyId } = useParams();
  const token = useSelector((state) => state.user.token);

  let company_id = routeCompanyId || searchParams.get("company_id");

  if (!company_id) {
    const keys = Array.from(searchParams.keys());
    if (keys.length > 0 && !isNaN(keys[0])) {
      company_id = keys[0];
    }
  }

  if (company_id) {
    const targetPath = `/employee/xyz/${company_id}?${searchParams.toString()}`;

    if (!token) {
      return (
        <Navigate
          to="/employee/login"
          state={{
            from: {
              pathname: `/employee/xyz/${company_id}`,
              search: `?${searchParams.toString()}`,
            },
          }}
          replace
        />
      );
    }

    return <Navigate to={targetPath} replace />;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8fafc" }}>
      <h2 style={{ fontSize: "1.25rem", color: "#334155", fontWeight: "600" }}>404 | Page not found</h2>
    </div>
  );
};

const App = () => {
  const [isVerifying, setIsVerifying] = useState(true);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const authState = useSelector((state) => state.user);
  const isAuthenticated = authState.isAuthenticated;

  useEffect(() => {
    const verifyUserSession = async () => {
      const isLocalAuth = import.meta.env.VITE_LOCAL_AUTH === "true";

      if (isLocalAuth && localStorage.getItem("explicit_logout") === "true") {
        await resetPersistedAuthState();
        queryClient.setQueryData(["authUser"], null);
        setIsVerifying(false);
        return;
      }

      clearLegacyAuthSessionStorage();

      if (authState.isAuthenticated && authState.token) {
        queryClient.setQueryData(["authUser"], {
          user: authState,
          isAuthenticated: true,
        });
        setIsVerifying(false);
        return;
      }


      if (window.location.pathname.startsWith("/employee")) {
        setIsVerifying(false);
        return;
      }




      if (isLocalAuth) {

        const existingToken = getAuthToken();
        const existingUser = getAuthUser();
        if (existingToken && existingUser) {
          const currentSlug = window.location.hostname.split(".")[0];
          const normalizedUser = normalizeUserPayload({
            ...existingUser,
            token: existingToken,
            csaapToken: existingUser?.csaapToken || existingToken,
            slug: existingUser?.slug || currentSlug,
            subdomain:
              existingUser?.subdomain || existingUser?.slug || currentSlug,
            companyName:
              existingUser?.companyName ||
              existingUser?.subdomain ||
              existingUser?.slug ||
              currentSlug,
            company_id:
              existingUser?.company_id ??
              existingUser?.tenant_id ??
              null,
            isEmployee: Boolean(existingUser?.isEmployee),
          });

          dispatch(setActiveUser(normalizedUser));
          queryClient.setQueryData(["authUser"], {
            user: normalizedUser,
            isAuthenticated: true,
          });
          setIsVerifying(false);
          return;
        }
      }

      try {
        const currentSlug = window.location.hostname.split(".")[0];
        const response = await fetch(
          "https://csaapnodeapi.csaap.com/api/tenant/verify",
          {
            method: "GET",
            headers: { "x-tenant-slug": currentSlug },
            credentials: "include",
          },
        );

        const data = await response.json();

        if (response.ok && data.success) {
          const normalizedUser = normalizeUserPayload({
            ...data.user,
            token: data.token ?? data.user?.token ?? "",
            csaapToken: data.token ?? data.user?.csaapToken ?? "",
            slug: data.user?.slug || currentSlug,
            subdomain: data.user?.subdomain || data.user?.slug || currentSlug,
            companyName:
              data.user?.companyName ||
              data.user?.subdomain ||
              data.user?.slug ||
              currentSlug,
            company_id: data.user?.company_id ?? data.user?.tenant_id ?? null,
            isEmployee: Boolean(data.user?.isEmployee),
          });

          dispatch(setActiveUser(normalizedUser));
          clearLegacyAuthSessionStorage();
          if (normalizedUser.company_id) {
            sessionStorage.setItem(
              "selectedCompanyId",
              String(normalizedUser.company_id),
            );
            sessionStorage.setItem(
              "selectedCompanyName",
              normalizedUser.companyName || normalizedUser.slug || "",
            );
          }
          if (!normalizedUser.isEmployee && data.token) {
            dispatch(setSuperAdmin({ user: normalizedUser, token: data.token }));
          }
          queryClient.setQueryData(["authUser"], {
            user: normalizedUser,
            isAuthenticated: true,
          });
        } else {
          await resetPersistedAuthState();
          queryClient.setQueryData(["authUser"], null);
        }
      } catch (error) {
        console.error("Verification failed:", error);
        if (authState.isAuthenticated && authState.token) {
          queryClient.setQueryData(["authUser"], {
            user: authState,
            isAuthenticated: true,
          });
        } else {
          await resetPersistedAuthState();
          queryClient.setQueryData(["authUser"], null);
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyUserSession();
  }, [authState, dispatch, queryClient]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#00a651]" strokeWidth={2.5} />
        <span className="text-sm font-semibold text-slate-600 font-body">
          Verifying your workspace...
        </span>
      </div>
    );
  }

  return (
    <UserProvider>
      <CompanyProvider>
        <Routes>

          <Route
            path="/admin/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login key="admin" />
              )
            }
          />
          <Route path="/employee/login" element={<Login key="employee" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/employee/*" element={<HRMSEmployeeRoutes />} />
          <Route path="/xyz" element={<XYZRedirect />} />
          <Route path="/xyz/:company_id" element={<XYZRedirect />} />


          <Route
            element={
              isAuthenticated ? (
                <AdminLayout />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/login"
              element={<Navigate to="/admin/login" replace />}
            />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/crm/*" element={<AdminRoutes />} />
            <Route path="/hrms/*" element={<HRMSAdminRoutes />} />


            <Route path="/project-budget" element={<ProjectBudgetTabs />} />
            <Route path="/bill" element={<Bill />} />
            <Route path="/bill-inward" element={<BillInward />} />
            <Route path="/work-order" element={<Work />} />
            <Route path="/contractor" element={<Contractor />} />
            <Route path="/vendor" element={<Vendor />} />
            <Route path="/tendering" element={<Tendering />} />
            <Route path="/equipment-standard" element={<Equipment />} />
            <Route path="/indent-main" element={<IndentEntryO />} />
            <Route path="/work-diary" element={<WorkDiary />} />
            <Route path="/daily-work-report" element={<DailyWorkReport />} />
            <Route path="/hindering-report" element={<HinderingReport />} />
            <Route path="/labour-rates" element={<LabourRates />} />
            <Route path="/compliances" element={<Compliances />} />
            <Route path="/vehicles" element={<Vehicle />} />
            <Route path="/equipment-manage" element={<EquipmentManage />} />
            <Route path="/operator" element={<Operator />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route
              path="/attachment-contractor"
              element={<AttachementContractor />}
            />
            <Route path="/approval-history" element={<ApprovalHistoryPage />} />
            <Route
              path="/change-history"
              element={<ChangeHistoryContractor />}
            />


            <Route
              path="/accounting/client/dashboard"
              element={<ClientDashboard />}
            />
            <Route
              path="/accounting/client/company"
              element={<ClientCompanyForm />}
            />
            <Route
              path="/accounting/client/groupCreation"
              element={<ClientGroupCreation />}
            />
            <Route
              path="/accounting/client/listOfGroups"
              element={<ClientListOfGroups />}
            />
            <Route
              path="/accounting/client/ledger"
              element={<ClientLedgerForm />}
            />
            <Route
              path="/accounting/client/ledger/:id"
              element={<ClientLedgerForm />}
            />
            <Route
              path="/accounting/client/listOfLedgers"
              element={<ClientListOfLedger />}
            />
            <Route
              path="/accounting/client/statutoryReports"
              element={<ClientStatutoryReports />}
            />
            <Route
              path="/accounting/client/customer-management"
              element={<CustomerManagementAccounting />}
            />
            <Route
              path="/accounting/client/contravoucher"
              element={<ClientContraVoucher />}
            />

            <Route
              path="/accounting/client/contravoucher/:id"
              element={<ClientContraVoucher />}
            />
            <Route
              path="/accounting/client/listOfContraVoucher"
              element={<ClientListOFContraVoucher />}
            />
            <Route
              path="/accounting/client/paymentVoucher"
              element={<ClientPaymentVoucher />}
            />
            <Route
              path="/accounting/client/listOfPaymentVoucher"
              element={<ClientListOfPaymentVoucher />}
            />
            <Route
              path="/accounting/client/paymentVoucher/:id"
              element={<ClientPaymentVoucher />}
            />
            <Route
              path="/accounting/client/receptVoucher"
              element={<ClientReceiveVouchers />}
            />

            <Route
              path="/accounting/client/receptVoucher/:id"
              element={<ClientReceiveVouchers />}
            />
            <Route
              path="/accounting/client/listOfReciptVoucher"
              element={<ClientReceiveVouchersList />}
            />
            <Route
              path="/accounting/client/journalvoucher"
              element={<ClientJournalVoucher />}
            />
            <Route
              path="/accounting/client/journalvoucher/:id"
              element={<ClientJournalVoucher />}
            />
            <Route
              path="/accounting/client/listOfJournalVoucher"
              element={<ClientListOfJournalVoucher />}
            />
            <Route
              path="/accounting/client/manfacturing"
              element={<ClientManufacturing />}
            />
            <Route
              path="/accounting/client/manfacturing/:id"
              element={<ClientManufacturing />}
            />

            <Route
              path="/accounting/client/manfacturinglist"
              element={<ClientManufacturingList />}
            />
            <Route
              path="/accounting/client/salevoucher"
              element={<ClientSaleVoucher />}
            />
            <Route
              path="/accounting/client/listOfSaleVoucher"
              element={<ClientListOfSaleVoucher />}
            />
            <Route
              path="/accounting/client/salevoucher/:id"
              element={<ClientSaleVoucher />}
            />
            <Route
              path="/accounting/client/purchasevoucher"
              element={<ClientPurchaseVoucher />}
            />
            <Route
              path="/accounting/client/purchasevoucher/:id"
              element={<ClientPurchaseVoucher />}
            />
            <Route
              path="/accounting/client/listOfPurchaseVoucher"
              element={<ClientListOFPurchaseVoucher />}
            />
            <Route
              path="/accounting/client/debitNote"
              element={<ClientDebitNote />}
            />
            <Route
              path="/accounting/client/debitNote/:id"
              element={<ClientDebitNote />}
            />
            <Route
              path="/accounting/client/debitNotesList"
              element={<ClientDebitNoteList />}
            />
            <Route
              path="/accounting/client/creditNote"
              element={<ClientCreditNote />}
            />
            <Route
              path="/accounting/client/creditNote/:id"
              element={<ClientCreditNote />}
            />
            <Route
              path="/accounting/client/creditNotesList"
              element={<ClientCreditNoteList />}
            />
            <Route
              path="/accounting/client/bank-activities"
              element={<ClientBankActivites />}
            />
            <Route
              path="/accounting/client/cash"
              element={<CashActivities />}
            />

            <Route
              path="/accounting/client/trialBalance"
              element={<ClientTrialBalance />}
            />
            <Route
              path="/accounting/client/reports"
              element={<ClientReports />}
            />
            <Route
              path="/accounting/client/gst-summary"
              element={<ClientGSTSummary />}
            />
            <Route
              path="/accounting/client/dayBook"
              element={<ClientDayBook />}
            />
            <Route
              path="/accounting/client/transactionSummary"
              element={<ClientTransactionSummery />}
            />
            <Route
              path="/accounting/client/stockItemCreation"
              element={<ClientStockItemCreation />}
            />
            <Route
              path="/accounting/client/stockGroupSummery"
              element={<ClientStockGroupSummary />}
            />
            <Route
              path="/accounting/client/hsnsummery"
              element={<HSNList />}
            />
            <Route
              path="/accounting/client/stocklist"
              element={<StockNamesList />}
            />


            <Route path="/brokers" element={<BrokerPage />} />
            <Route path="/suppliers" element={<SupplierPage />} />
            <Route path="/contractors" element={<ContractorsPage />} />
            <Route
              path="/builder-erp/admin/purchase-main"
              element={<PurchaseMain />}
            />
            <Route
              path="/builder-erp/admin/stock-entry"
              element={<StockEntry />}
            />
            <Route
              path="/builder-erp/admin/sale-main"
              element={<SalesEntry />}
            />
            <Route
              path="/builder-erp/admin/indent-main"
              element={<IndentEntry />}
            />
            <Route
              path="/builder-erp/admin/supplier-list"
              element={<SupplierList />}
            />
            <Route
              path="/builder-erp/admin/barcode-sale"
              element={<BarcodeSale />}
            />
            <Route
              path="/builder-erp/admin/employee-form"
              element={<EmployeeForm />}
            />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/users/payments" element={<PaymentsPage />} />
            <Route path="/users/plans" element={<PlansPage />} />
            <Route path="/users/all-companies" element={<AllCompanies />} />

            <Route
              path="/users/company-payment/:id"
              element={<CompanyPaymentSetup />}
            />
            <Route
              path="/users/permission-manager"
              element={<PermissionManager />}
            />
            <Route
              path="/users/department-role-manager"
              element={<DepartmentRoleManager />}
            />

            <Route
              path="/users/user-plan-details"
              element={<UserPlanDetails />}
            />
            <Route
              path="/users/project-assignment"
              element={<ProjectAssignment />}
            />
            <Route
              path="/users/booking-cancellations"
              element={<BookingCancellations />}
            />


            <Route
              path="/superadmin/accounting/superadmin/activity"
              element={<SuperAdminAccountingActivity />}
            />
            <Route
              path="/superadmin/accounting/superadmin/ledgers"
              element={<SuperAdminAccountingLedgers />}
            />
            <Route
              path="/superadmin/accounting/superadmin/stocks"
              element={<SuperAdminAccountingStocks />}
            />
            <Route
              path="/superadmin/accounting/superadmin/vouchers"
              element={<SuperAdminAccountingVouchers />}
            />
            <Route
              path="/superadmin/accounting/superadmin/gst-details"
              element={<GstDetails />}
            />
             <Route
              path="/profile"
              element={<CompanyProfilePage />} />
            <Route
              path="/contact-us"
              element={<ContactUs />} />
          </Route>




          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-gray-500">
                <h2 className="text-xl">404 | Page not found</h2>
              </div>
            }
          />
        </Routes>
      </CompanyProvider>
    </UserProvider>
  );
};

export default App;
