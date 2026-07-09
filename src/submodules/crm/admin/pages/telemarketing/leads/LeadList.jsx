import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api";
import { AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePermission } from "../../../../../../hooks/usePermission";
import useAuth from "../../../../../../hooks/useAuth";


import AssignLeadModal from "./AssignLeadModal";
import LeadDetailsModal from "./LeadDetailsModal";
import LeadFormModal from "./LeadFormModal";
import LeadQueueTable from "./LeadQueueTable";
import LeadTabsDock from "./LeadTabsDock";
import LeadTimelineModal from "./LeadTimelineModal";
import ReportEntryModal from "./ReportEntryModal";
import TransferLeadModal from "./TransferLeadModal";
import CreatePaymentSlabModal from "./CreatePaymentSlabModal";
import ViewPaymentSlabsModal from "./ViewPaymentSlabsModal";
import ProjectSetupModal from "./ProjectSetupModal";
import CreateProjectModal from "./CreateProjectModal";
import CustomerProfileSetupModal from "./CustomerProfileSetupModal";

import LeadListSk from "../../../components/skeletons/LeadListSk";
import { getOutcomesForStage, getOutcomesForTab } from "./leadUtils";

const defaultLeadForm = {
  name: "",
  phone: "",
  email: "",
  project_id: "",
  source: "",
  location: "",
  broker_id: "",
  commission: "",
  unit_id: "",
  unit_name: "",
};

const defaultReportData = {
  leadId: "",
  outcome: "NO_RESPONSE",
  note: "",
  nextFollowUpAt: "",
  siteVisitScheduledAt: "",
  siteVisitAssignedTo: "",
};

const LeadList = () => {
  const queryClient = useQueryClient();
  const { has } = usePermission();
  const canViewAll = has("crm.leads.view_all");
  const canCreate = has("crm.leads.create");

  const { user, companyId, token } = useAuth();

  const [activeTab, setActiveTab] = useState(canViewAll ? "new" : "assigned");

  // Dynamic page-level actions based on active tab namespace
  const canAssign = useMemo(() => {
    if (activeTab === "new") return has("crm.leads.new_leads.assign");
    if (activeTab === "assigned") return has("crm.leads.assigned.assign");
    return false;
  }, [activeTab, has]);

  const canTransfer = useMemo(() => {
    if (activeTab === "assigned") return has("crm.leads.assigned.transfer");
    if (activeTab === "followup") return has("crm.leads.followup.transfer");
    return false;
  }, [activeTab, has]);

  const canDelete = useMemo(() => {
    if (activeTab === "new") return has("crm.leads.new_leads.delete");
    return false;
  }, [activeTab, has]);

  const canEdit = useMemo(() => {
    if (activeTab === "new") return has("crm.leads.new_leads.edit") || has("crm.leads.new_leads.create");
    if (activeTab === "assigned") return has("crm.leads.assigned.edit");
    if (activeTab === "followup") return has("crm.leads.followup.edit");
    if (activeTab === "interested") return has("crm.leads.interested.edit");
    if (activeTab === "accepted") return has("crm.leads.accepted.edit");
    if (activeTab === "rejected") return has("crm.leads.rejected.edit");
    return false;
  }, [activeTab, has]);

  const canCreatePaymentSlab = useMemo(() => {
    if (activeTab === "accepted") return has("crm.leads.accepted.payment_slab.create");
    return false;
  }, [activeTab, has]);

  const canViewPaymentSlabs = useMemo(() => {
    if (activeTab === "accepted") return has("crm.leads.accepted.payment_slab.view");
    return false;
  }, [activeTab, has]);

  const canCreateProject = useMemo(() => {
    if (activeTab === "accepted") return has("crm.leads.accepted.project.create");
    return false;
  }, [activeTab, has]);

  const canProjectSetup = useMemo(() => {
    if (activeTab === "accepted") return has("crm.leads.accepted.project.setup");
    return false;
  }, [activeTab, has]);

  const canCustomerProfileSetup = useMemo(() => {
    if (activeTab === "accepted") return has("crm.leads.accepted.customer.setup");
    return false;
  }, [activeTab, has]);

  const canReportEntry = useMemo(() => {
    if (activeTab === "assigned") return has("crm.leads.assigned.interaction");
    if (activeTab === "followup") return has("crm.leads.followup.interaction");
    if (activeTab === "interested") return has("crm.leads.interested.interaction");
    return false;
  }, [activeTab, has]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showReportEntry, setShowReportEntry] = useState(false);
  const [showAssignLead, setShowAssignLead] = useState(false);
  const [showTransferLead, setShowTransferLead] = useState(false);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [assignLead, setAssignLead] = useState(null);
  const [transferLead, setTransferLead] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [reportData, setReportData] = useState(defaultReportData);
  const [leadForm, setLeadForm] = useState(defaultLeadForm);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineLead, setTimelineLead] = useState(null);
  const [showPaymentSlab, setShowPaymentSlab] = useState(false);
  const [paymentSlabLead, setPaymentSlabLead] = useState(null);
  const [showViewPaymentSlab, setShowViewPaymentSlab] = useState(false);
  const [viewPaymentSlabLead, setViewPaymentSlabLead] = useState(null);
  const [showProjectSetup, setShowProjectSetup] = useState(false);
  const [projectSetupLead, setProjectSetupLead] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [createProjectLead, setCreateProjectLead] = useState(null);
  const [showCustomerProfileSetup, setShowCustomerProfileSetup] = useState(false);
  const [customerProfileSetupLead, setCustomerProfileSetupLead] = useState(null);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setContentVisible(true);
    }, 40);

    return () => clearTimeout(revealTimer);
  }, []);

  const {
    data: rawLeads = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: canViewAll ? ["leads", companyId] : ["leads", companyId, user.id],
    queryFn: async () => {
      if (canViewAll) {
        const response = await api.get("/api/leads", {
          params: { company_id: companyId, limit: 500 },
        });
        return response.data.data || [];
      } else {
        const response = await api.get("/api/leads/employee", {
          params: {
            companyId,
            employeeId: user.id,
          },
        });
        return response.data.data || [];
      }
    },
    enabled: !!companyId && (canViewAll || !!user.id),
  });

  const { data: projectOptions = [] } = useQuery({
    queryKey: ["project-options", token],
    queryFn: async () => {
      const response = await api.get("/api/projects/options");
      return response.data.data || [];
    },
    enabled: !!token,
  });

  const projectOptionsMap = useMemo(() => {
    const map = new Map();
    projectOptions.forEach((p) => {
      if (p.project_id) {
        map.set(p.project_id, p.name);
      }
    });
    return map;
  }, [projectOptions]);

  const createLeadMutation = useMutation({
    mutationFn: (newLead) => api.post("/api/leads", newLead),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      setShowLeadForm(false);
      setEditingLead(null);
      alert("New lead created successfully!");
    },
    onError: (error) => {
      alert(
        `Error creating lead: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, updatedData }) =>
      api.put(`/api/leads/${id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      setShowLeadForm(false);
      setEditingLead(null);
      alert("Lead updated successfully!");
    },
    onError: (error) => {
      alert(
        `Error updating lead: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/leads/${id}`, { params: { company_id: companyId } }),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      alert("Lead deleted successfully!");
    },
    onError: (error) => {
      alert(
        `Error deleting lead: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const logInteractionMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.post(`/api/leads/${id}/interactions`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      setShowReportEntry(false);
      setSelectedLead(null);
      setReportData(defaultReportData);
      alert("Interaction logged successfully!");
    },
    onError: (error) => {
      alert(
        `Error logging interaction: ${
          error.response?.data?.message || error.message
        }`,
      );
    },
  });

  const assignLeadMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/api/leads/${id}/assign`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      setShowAssignLead(false);
      setAssignLead(null);
      setAssignedTo("");
      alert("Lead assigned successfully!");
    },
    onError: (error) => {
      alert(
        `Error assigning lead: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const transferLeadMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/api/leads/${id}/transfer`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      setShowTransferLead(false);
      setTransferLead(null);
      setAssignedTo("");
      alert("Lead transfer updated successfully!");
    },
    onError: (error) => {
      alert(
        `Error transferring lead: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const leads = useMemo(
    () =>
      rawLeads.map((lead) => ({
        ...lead,
        name: lead.name || "Unnamed lead",
        email: lead.email || "",
      })),
    [rawLeads],
  );

  const handleViewDetails = (lead) => {
    setViewingLead(lead);
    setShowLeadDetails(true);
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setLeadForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      project_id: lead.project_id || "",
      source: lead.source || "",
      location: lead.location || "",
      broker_id: lead.broker_id || "",
      commission: lead.commission || "",
      unit_id: lead.unit_id || "",
      unit_name: lead.unit_name || "",
    });
    setShowLeadForm(true);
  };

  const handleReportEntry = (lead) => {
    const outcomes = getOutcomesForTab(activeTab, lead.status);
    if (outcomes.length === 0) {
      alert("This lead must be assigned before logging an interaction.");
      return;
    }

    setSelectedLead(lead);
    setReportData({
      ...defaultReportData,
      leadId: lead.id,
      outcome: outcomes[0]?.value || "NO_RESPONSE",
    });
    setShowReportEntry(true);
  };

  const handleViewTimeline = (lead) => {
    setTimelineLead(lead);
    setShowTimeline(true);
  };

  const handleAssignLead = (lead) => {
    setAssignLead(lead);
    setAssignedTo("");
    setShowAssignLead(true);
  };

  const handleTransferLead = (lead) => {
    setTransferLead(lead);
    setAssignedTo("");
    setShowTransferLead(true);
  };

  const handleDeleteLead = (lead) => {
    if (window.confirm(`Are you sure you want to delete lead: ${lead.name}?`)) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  const handleSaveAssignment = () => {
    if (!assignedTo) {
      alert("Please select a valid team member.");
      return;
    }

    const payload = {
      company_id: companyId,
      assigned_to: assignedTo,
    };

    if (assignLead) {
      assignLeadMutation.mutate({ id: assignLead.id, payload });
    } else if (transferLead) {
      transferLeadMutation.mutate({ id: transferLead.id, payload });
    }
  };

  const handleSaveReport = () => {
    if (!reportData.outcome) {
      alert("Please select an outcome.");
      return;
    }

    if (
      ["NO_RESPONSE", "CALL_BACK"].includes(reportData.outcome) &&
      !reportData.nextFollowUpAt
    ) {
      alert("Next follow-up date is required for this outcome.");
      return;
    }

    if (
      reportData.outcome === "SITE_VISIT_SCHEDULED" &&
      !reportData.siteVisitScheduledAt
    ) {
      alert("Schedule date and time are required for this outcome.");
      return;
    }

    if (
      reportData.outcome === "SITE_VISIT_SCHEDULED" &&
      !reportData.siteVisitAssignedTo
    ) {
      alert("Please assign a team member for the site visit.");
      return;
    }

    logInteractionMutation.mutate({
      id: reportData.leadId,
      payload: {
        company_id: companyId,
        outcome: reportData.outcome,
        note: reportData.note,
        next_follow_up_at: reportData.nextFollowUpAt || null,
        site_visit_scheduled_at: reportData.siteVisitScheduledAt || null,
        site_visit_assigned_to: reportData.siteVisitAssignedTo || null,
      },
    });
  };

  const handleSaveLead = () => {
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      alert("Please fill in required fields: Name and Phone.");
      return;
    }

    const payload = {
      ...leadForm,
      company_id: companyId,
      company_slug: user.slug || user.company_slug || "default",
    };

    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, updatedData: payload });
    } else {
      createLeadMutation.mutate(payload);
    }
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setLeadForm(defaultLeadForm);
    setShowLeadForm(true);
  };

  const handleExportLeads = (leadSubset = leads) => {
    if (leadSubset.length === 0) {
      alert("No leads to export!");
      return;
    }

    const headers = [
      "Name",
      "Phone",
      "Email",
      "Stage",
      "Status",
      "Last Contacted",
      "Next Follow-up",
      "Assigned To",
    ];
    const csvRows = [
      headers.join(","),
      ...leadSubset.map((lead) =>
        [
          `"${lead.name || ""}"`,
          `"${lead.phone || ""}"`,
          `"${lead.email || ""}"`,
          `"${lead.stage || ""}"`,
          `"${lead.status || ""}"`,
          `"${lead.last_contacted_at || ""}"`,
          `"${lead.next_follow_up_at || ""}"`,
          `"${lead.assignee?.name || lead.assigned_to || ""}"`,
        ].join(","),
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `leads_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Exported ${leadSubset.length} leads successfully!`);
  };

  if (isLoading) {
    return <LeadListSk />;
  }

  return (
    <div
      className={`app-shell p-4 transition-all duration-400 ease-out ${ contentVisible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-sm translate-y-2" }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {queryError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={16}
                className="text-red-400 mt-0.5 shrink-0"
              />
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Error loading leads
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {queryError.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {!queryError && (
          <LeadTabsDock
            activeTab={activeTab}
            onTabChange={setActiveTab}
            leads={leads}
            showNewTab={canViewAll}
          />
        )}

        {!queryError ? (
          <LeadQueueTable
            activeTab={activeTab}
            leads={leads}
            onCreateLead={canCreate ? handleCreateLead : undefined}
            onExportLeads={has("crm.leads.export") ? handleExportLeads : undefined}
            onViewDetails={handleViewDetails}
            onViewTimeline={handleViewTimeline}
            onReportEntry={canReportEntry ? handleReportEntry : undefined}
            onAssignLead={canAssign ? handleAssignLead : undefined}
            onTransferLead={canTransfer ? handleTransferLead : undefined}
            onDeleteLead={canDelete ? handleDeleteLead : undefined}
            showAssignee={canViewAll}
            onCreatePaymentSlab={canCreatePaymentSlab ? (lead) => {
              setPaymentSlabLead(lead);
              setShowPaymentSlab(true);
            } : undefined}
            onViewPaymentSlabs={canViewPaymentSlabs ? (lead) => {
              setViewPaymentSlabLead(lead);
              setShowViewPaymentSlab(true);
            } : undefined}
            onProjectSetup={canProjectSetup ? (lead) => {
              setProjectSetupLead(lead);
              setShowProjectSetup(true);
            } : undefined}
            onCreateProject={canCreateProject ? (lead) => {
              setCreateProjectLead(lead);
              setShowCreateProject(true);
            } : undefined}
            onCustomerProfileSetup={canCustomerProfileSetup ? (lead) => {
              setCustomerProfileSetupLead(lead);
              setShowCustomerProfileSetup(true);
            } : undefined}
          />
        ) : null}

        {showLeadDetails && viewingLead && (
          <LeadDetailsModal
            lead={viewingLead}
            onClose={() => {
              setShowLeadDetails(false);
              setViewingLead(null);
            }}
            onEdit={canEdit ? () => {
              setShowLeadDetails(false);
              handleEdit(viewingLead);
            } : undefined}
            onReportEntry={() => {
              setShowLeadDetails(false);
              handleReportEntry(viewingLead);
            }}
            onViewTimeline={() => {
              setShowLeadDetails(false);
              handleViewTimeline(viewingLead);
            }}
          />
        )}

        {showReportEntry && selectedLead && (
          <ReportEntryModal
            lead={selectedLead}
            reportData={reportData}
            setReportData={setReportData}
            onClose={() => {
              setShowReportEntry(false);
              setSelectedLead(null);
            }}
            onSave={handleSaveReport}
            activeTab={activeTab}
          />
        )}

        {showLeadForm && (
          <LeadFormModal
            editingLead={editingLead}
            leadForm={leadForm}
            setLeadForm={setLeadForm}
            onClose={() => {
              setShowLeadForm(false);
              setEditingLead(null);
            }}
            onSave={handleSaveLead}
          />
        )}

        {showAssignLead && assignLead && (
          <AssignLeadModal
            lead={assignLead}
            assignedTo={assignedTo}
            setAssignedTo={setAssignedTo}
            onClose={() => {
              setShowAssignLead(false);
              setAssignLead(null);
              setAssignedTo("");
            }}
            onSave={handleSaveAssignment}
            isSaving={assignLeadMutation.isPending}
          />
        )}

        {showTransferLead && transferLead && (
          <TransferLeadModal
            lead={transferLead}
            assignedTo={assignedTo}
            setAssignedTo={setAssignedTo}
            onClose={() => {
              setShowTransferLead(false);
              setTransferLead(null);
              setAssignedTo("");
            }}
            onSave={handleSaveAssignment}
            isSaving={transferLeadMutation.isPending}
          />
        )}

        {showTimeline && timelineLead && (
          <LeadTimelineModal
            lead={timelineLead}
            onClose={() => {
              setShowTimeline(false);
              setTimelineLead(null);
            }}
          />
        )}

        {showPaymentSlab && paymentSlabLead && (
          <CreatePaymentSlabModal
            lead={paymentSlabLead}
            projectName={projectOptionsMap.get(paymentSlabLead.project_id) || paymentSlabLead.project_id || "Default Project"}
            onClose={() => {
              setShowPaymentSlab(false);
              setPaymentSlabLead(null);
            }}
            onSaveSuccess={() => {
              queryClient.invalidateQueries(["leads"]);
            }}
          />
        )}

        {showViewPaymentSlab && viewPaymentSlabLead && (
          <ViewPaymentSlabsModal
            lead={viewPaymentSlabLead}
            projectName={projectOptionsMap.get(viewPaymentSlabLead.project_id) || viewPaymentSlabLead.project_id || "Default Project"}
            onClose={() => {
              setShowViewPaymentSlab(false);
              setViewPaymentSlabLead(null);
            }}
            onEdit={() => {
              setShowViewPaymentSlab(false);
              const targetLead = viewPaymentSlabLead;
              setViewPaymentSlabLead(null);
              setPaymentSlabLead(targetLead);
              setShowPaymentSlab(true);
            }}
          />
        )}

        {showProjectSetup && projectSetupLead && (
          <ProjectSetupModal
            lead={projectSetupLead}
            onClose={() => {
              setShowProjectSetup(false);
              setProjectSetupLead(null);
            }}
            onSaveSuccess={() => {
              queryClient.invalidateQueries(["leads"]);
            }}
          />
        )}

        {showCreateProject && createProjectLead && (
          <CreateProjectModal
            lead={createProjectLead}
            onClose={() => {
              setShowCreateProject(false);
              setCreateProjectLead(null);
            }}
            onSaveSuccess={() => {
              queryClient.invalidateQueries(["leads"]);
            }}
          />
        )}

        {showCustomerProfileSetup && customerProfileSetupLead && (
          <CustomerProfileSetupModal
            lead={customerProfileSetupLead}
            onClose={() => {
              setShowCustomerProfileSetup(false);
              setCustomerProfileSetupLead(null);
            }}
            onSaveSuccess={() => {
              queryClient.invalidateQueries(["leads"]);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LeadList;
