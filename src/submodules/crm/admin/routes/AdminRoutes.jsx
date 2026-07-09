import { Navigate, Route, Routes } from "react-router-dom";
import ComingSoon from "../components/ComingSoon";
import LeadList from "../pages/telemarketing/leads/LeadList";
import SalesPipeline from "../pages/telemarketing/leads/SalesPipeline";
import SimpleCSVUpload from "../pages/telemarketing/SimpleCSVUpload";
import CustomerList from "../pages/customers/CustomerList";
import ViewProfile from "../pages/customers/ViewProfile";
import CustomerLedger from "../pages/customers/CustomerLedger";
import QuotationForm from "../pages/telemarketing/leads/QuotationForm";
import Brokers from "../pages/brokers/Brokers";

export default function AdminRoutes() {
  return (
    <div className="crm-module-root">
      <Routes>
        <Route path="upload-leads" element={<SimpleCSVUpload />} />
        <Route path="lead-list" element={<LeadList />} />
        <Route path="sales-pipeline" element={<SalesPipeline />} />
        <Route path="quotation-form" element={<QuotationForm />} />
        <Route path="brokers" element={<Brokers />} />

        {/* Dummy Routes */}
        <Route
          path="site-visits"
          element={<ComingSoon title="Site Visits" />}
        />
        <Route path="bookings" element={<ComingSoon title="Bookings" />} />
        <Route path="lost" element={<ComingSoon title="Lost Leads" />} />
        <Route
          path="inventory"
          element={<ComingSoon title="Inventory (Projects & Units)" />}
        />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:customerId" element={<ViewProfile />} />
        <Route path="customers/:customerId/ledger" element={<CustomerLedger />} />
        <Route
          path="reports/leads"
          element={<ComingSoon title="Lead Reports" />}
        />
        <Route
          path="reports/sales"
          element={<ComingSoon title="Sales Reports" />}
        />

        {/* Default redirect - prefixing with /crm to match integrated route */}
        <Route path="/" element={<Navigate to="/crm/lead-list" replace />} />
        <Route path="*" element={<Navigate to="/crm/lead-list" replace />} />
      </Routes>
    </div>
  );
}
