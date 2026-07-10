import { usePermission } from "../../../../../../hooks/usePermission";

const tabs = [
  { key: "new", label: "New Leads" },
  { key: "assigned", label: "Assigned" },
  { key: "followup", label: "Follow-up" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

const countByTab = (leads, tabKey) => {
  switch (tabKey) {
    case "new":
      return leads.filter((l) => l.stage === "NEW").length;
    case "assigned":
      return leads.filter((l) => l.stage !== "NEW").length;
    case "followup":
      return leads.filter((l) => l.stage === "FOLLOW_UP").length;

    case "accepted":
      return leads.filter((l) => l.stage === "ACCEPTED").length;
    case "rejected":
      return leads.filter((l) => l.stage === "REJECTED").length;
    default:
      return 0;
  }
};

const LeadTabsDock = ({ activeTab, onTabChange, leads, showNewTab = true }) => {
  const { hasAccess } = usePermission();
  const filteredTabs = tabs.filter((tab) => {
    if (tab.key === "new") return hasAccess("crm.leads.new_leads");
    if (tab.key === "assigned") return hasAccess("crm.leads.assigned");
    if (tab.key === "followup") return hasAccess("crm.leads.followup");

    if (tab.key === "accepted") return hasAccess("crm.leads.accepted");
    if (tab.key === "rejected") return hasAccess("crm.leads.rejected");
    return true;
  });
  return (
    <div
      className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-(--border-soft)"
      style={{ background: "color-mix(in srgb, var(--bg-app) 94%, white)" }}
    >
      <div className="flex items-center gap-2 overflow-x-auto">
        {filteredTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = countByTab(leads, tab.key);

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all ${isActive ? "border-transparent text-white shadow-[0_14px_28px_rgba(91,92,240,0.18)]" : "bg-white/88 border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"}`}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, var(--brand), #00c853)",
                    }
                  : undefined
              }
            >
              <span>{tab.label}</span>
              <span
                className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold tracking-[-0.01em] ${isActive ? "bg-white/16 text-white border border-white/10" : "bg-(--bg-subtle) text-(--text-soft)"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LeadTabsDock;
