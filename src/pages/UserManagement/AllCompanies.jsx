import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, CreditCard, Loader2, Search } from "lucide-react";

const AllCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://csaapnodeapi.csaap.com/api/admin/companies",
        );
        if (response.data && response.data.success) {
          setCompanies(response.data.data || []);
        } else {
          setError("Failed to fetch companies data.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching companies.");
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSetPayment = (company) => {
    const sessionData = {
      tenant_id: company.id,
      company_id: company.id,
      id: company.id,
    };

    sessionStorage.setItem("viewingCompany", JSON.stringify(sessionData));
    sessionStorage.setItem("company_id", company.id);

    navigate(`/users/company-payment/${company.id}`);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.db_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="erp-root min-h-screen p-6 bg-[var(--bg-app)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="app-title flex items-center gap-2">
            <Building2 className="text-[var(--brand)]" />
            All Companies
          </h1>
          <p className="app-subtitle mt-1">
            Manage registered companies and their payments
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--text-soft)]" />
          </div>
          <input
            type="text"
            placeholder="Search companies..."
            className="app-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-[var(--rose-500,#f43f5e)] rounded-r-lg text-rose-700">
          <p className="font-medium text-sm">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 app-panel">
          <Loader2 className="animate-spin h-8 w-8 text-[var(--brand)] mb-4" />
          <span className="ml-3 text-[var(--text-soft)] font-medium">
            Loading companies...
          </span>
        </div>
      ) : (
        <div className="app-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border-soft)] text-sm">
              <thead className="bg-[var(--bg-subtle)] text-[var(--text-strong)] text-left uppercase font-semibold text-xs tracking-wider border-b border-[var(--border-soft)]">
                <tr>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Database</th>
                  <th className="px-6 py-4">Admin Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)] bg-white">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="hover:bg-[var(--bg-subtle)] transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--text-strong)]">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--text-soft)]">
                        {company.db_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--text-soft)]">
                        {company.admin_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.status === "active" ||
                            company.status === "approved"
                              ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {company.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--text-soft)]">
                        {new Date(company.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleSetPayment(company)}
                          className="app-btn-secondary !min-h-[34px] !py-1.5 !px-3 inline-flex items-center gap-1.5 text-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-[var(--brand)]" />
                          View Details & Pay
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-[var(--text-faint)]"
                    >
                      No companies found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[var(--bg-subtle)] px-6 py-3 border-t border-[var(--border-soft)] text-xs text-[var(--text-soft)] text-right font-medium">
            Showing {filteredCompanies.length} companies
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCompanies;
