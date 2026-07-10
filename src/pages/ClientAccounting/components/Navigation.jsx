import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Layers3,
  FolderKanban,
  BookText,
  ReceiptIndianRupee,
  FileSpreadsheet,
  BarChart2,
  BarChart4,
  Settings,
  Wallet,
  FileBarChart,
  Landmark,
  ArrowBigDownIcon,
  ChevronDown,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import SubscriptionModal from "./SubscriptionModal";

function Navigation() {
  const [isOpen, setIsOpen] = useState(true);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showBanking, setShowBanking] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const location = useLocation();
  const { userId, user, hasActiveSubscription, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !user) {
      navigate("/login");
    }
  }, [userId, user, navigate]);

  useEffect(() => {
    if (
      location.pathname.includes("purchasevoucher") ||
      location.pathname.includes("salevoucher") ||
      location.pathname.includes("contravoucher")
    ) {
      setVoucherOpen(true);
    }
  }, [location.pathname]);

  const links = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      requiresSubscription: false,
    },
    {
      path: "/subscription",
      label: "Subscription",
      icon: <CreditCard size={18} />,
      requiresSubscription: false,
    },
    {
      path: "/company",
      label: "Company",
      icon: <Building2 size={18} />,
      requiresSubscription: true,
    },
    {
      path: "/groupCreation",
      label: "Group Creation",
      icon: <Layers3 size={18} />,
      requiresSubscription: true,
    },
    {
      path: "/listOfGroups",
      label: "List Of Groups",
      icon: <FolderKanban size={18} />,
      requiresSubscription: true,
    },
    {
      path: "/ledger",
      label: "Ledger",
      icon: <BookText size={18} />,
      requiresSubscription: true,
    },
    {
      path: "/listOfLedgers",
      label: "List of Ledger",
      icon: <FileSpreadsheet size={18} />,
      requiresSubscription: true,
    },
    {
      path: "/statutoryReports",
      label: "Statutory Reports",
      icon: <ReceiptIndianRupee size={18} />,
      requiresSubscription: true,
    },
  ];

  const handleRestrictedClick = (e, requiresSubscription) => {
    if (requiresSubscription && !hasActiveSubscription) {
      e.preventDefault();
      setShowSubscriptionModal(true);
    }
  };

  const NavLink = ({ path, label, icon, requiresSubscription = false }) => {
    const active = location.pathname === path;
    return (
      <Link
        to={path}
        onClick={(e) => handleRestrictedClick(e, requiresSubscription)}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
          active
            ? "bg-blue-100 text-blue-800 font-semibold"
            : "hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        <span>{icon}</span>
        {isOpen && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className=" sidebar  flex font-[monospace] no-print">
      <div
        className={`${isOpen ? "w-60" : "w-16"} 
    fixed left-0 top-0 h-screen 
    overflow-y-auto 
    bg-white text-gray-800 
    p-4 flex flex-col 
    border-r border-gray-300 
    transition-all duration-300 
    scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200`}
      >
        <div
          onClick={() => navigate("/")}
          className=" cursor-pointer flex items-center justify-between mb-1 top-0 bg-white pb-2 z-10"
        >
          {isOpen && (
            <h1 className="text-lg font-bold tracking-wide text-blue-800">
              Accounting
            </h1>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-blue-700 transition"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <hr className="border-gray-300 mb-4" />

        <nav className="space-y-1">
          {links.map((item) => (
            <NavLink key={item.path} {...item} />
          ))}

          <div>
            <button
              onClick={(e) => {
                if (!hasActiveSubscription) {
                  setShowSubscriptionModal(true);
                } else {
                  setVoucherOpen(!voucherOpen);
                }
              }}
              className={`flex items-center w-full gap-3 px-3 py-2 rounded-md transition-all duration-200
    ${
      location.pathname.includes("voucher")
        ? "bg-blue-100 text-blue-800 font-semibold"
        : "hover:bg-blue-50 hover:text-blue-700"
    }`}
            >
              <Landmark size={20} />

              {isOpen && (
                <span className="flex items-center justify-between w-full">
                  Voucher
                  <ChevronDown
                    className={`ml-auto transition-transform duration-200 
          ${voucherOpen ? "rotate-180" : ""}`}
                  />
                </span>
              )}
            </button>

            {voucherOpen && (
              <div className="ml-2 mt-1  space-y-1">
                <NavLink
                  path="/contravoucher"
                  label="Contra Voucher"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/listOfContraVoucher"
                  label="List Of Contra Voucher"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/paymentVoucher"
                  label="Payment Voucher"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/listOfPaymentVoucher"
                  label="List Of Payment Voucher"
                  requiresSubscription={true}
                />

                <NavLink
                  path="/receptVoucher"
                  label="Recipt Voucher"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/listOfReciptVoucher"
                  label="List Of Receipt Voucher"
                  requiresSubscription={true}
                />

                <NavLink
                  path="/journalvoucher"
                  label="Journal Voucher"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/listOfJournalVoucher"
                  label="List Of Journal Voucher"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/manfacturing"
                  label="Manufacturing"
                  requiresSubscription={true}
                />

                <NavLink
                  path="/salevoucher"
                  label="Sale Voucher"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/listOfSaleVoucher"
                  label="List Of Sale Voucher"
                  requiresSubscription={true}
                />

                <NavLink
                  path="/purchasevoucher"
                  label="Purchase Voucher"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/listOfPurchaseVoucher"
                  label="List Of Purchase Voucher"
                  requiresSubscription={true}
                />

                <NavLink
                  path="/debitNote"
                  label="Debit Note"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/debitNotesList"
                  label="Debit Note List"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/creditNote"
                  label="Credit Note"
                  requiresSubscription={true}
                />

                <NavLink
                  path="/creditNotesList"
                  label="Credit Note List"
                  requiresSubscription={true}
                />
              </div>
            )}
          </div>

          <div>
            <button
              onClick={(e) => {
                if (!hasActiveSubscription) {
                  setShowSubscriptionModal(true);
                } else {
                  setShowBanking(!showBanking);
                }
              }}
              className={`flex items-center w-full gap-3 px-3 py-2 rounded-md transition-all duration-200
      ${
        location.pathname.includes("bank")
          ? "bg-blue-100 text-blue-800 font-semibold"
          : "hover:bg-blue-50 hover:text-blue-700"
      }`}
            >
              <Landmark size={20} />

              {isOpen && (
                <span className="flex items-center justify-between w-full">
                  Banking
                  <ChevronDown
                    className={`ml-auto transition-transform duration-200 
            ${showBanking ? "rotate-180" : ""}`}
                  />
                </span>
              )}
            </button>

            {showBanking && (
              <div className="ml-4 mt-2 space-y-1">
                <NavLink
                  path="/bank-activities"
                  label="Bank Activities"
                  requiresSubscription={true}
                />

                <NavLink
                  path="/cheque"
                  label="Cheque"
                  requiresSubscription={true}
                />

                <NavLink
                  path="/cheque-register"
                  label="Cheque Register"
                  requiresSubscription={true}
                />
              </div>
            )}
          </div>

          <NavLink
            path="/balanceSheet"
            label="Balance Sheet"
            icon={<FileSpreadsheet size={20} />}
            requiresSubscription={true}
          />
          <NavLink
            path="/trialBalance"
            label="Trial Balance"
            icon={<FileBarChart size={20} />}
            requiresSubscription={true}
          />
          <NavLink
            path="/reports"
            label="Reports"
            icon={<BarChart2 size={18} />}
            requiresSubscription={true}
          />
          <NavLink
            path="/dayBook"
            label="Day Book"
            icon={<Wallet size={18} />}
            requiresSubscription={true}
          />
          <NavLink
            path="/transactionSummary"
            label="Transactions Summary"
            icon={<BarChart4 size={18} />}
            requiresSubscription={true}
          />

          <div>
            <button
              onClick={(e) => {
                if (!hasActiveSubscription) {
                  setShowSubscriptionModal(true);
                } else {
                  setShowMore(!showMore);
                }
              }}
              className={`flex items-center w-full gap-3 px-3 py-2 rounded-md transition-all duration-200
      ${
        location.pathname.includes("stock")
          ? "bg-blue-100 text-blue-800 font-semibold"
          : "hover:bg-blue-50 hover:text-blue-700"
      }`}
            >
              <Building2 size={20} />

              {isOpen && (
                <span className="flex items-center justify-between w-full">
                  Inventory Book
                  <ChevronDown
                    className={`ml-auto transition-transform duration-200 
            ${showMore ? "rotate-180" : ""}`}
                  />
                </span>
              )}
            </button>

            {showMore && (
              <div className="ml-2 mt-1 space-y-1">
                <NavLink
                  path="/stockItemCreation"
                  label="Stock Item Creation"
                  requiresSubscription={true}
                />
                <NavLink
                  path="/stockGroupSummery"
                  label="Stock Group Summary"
                  requiresSubscription={true}
                />
              </div>
            )}
          </div>

          <NavLink
            path="/settings"
            label="Settings"
            icon={<Settings size={18} />}
            requiresSubscription={true}
          />
        </nav>
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="flex gap-4 text-red-700 font-bold mt-7 px-8 py-2 rounded-md text-md   hover:bg-blue-50 hover:text-blue-700"
        >
          Logout <LogOut size={20} />
        </button>

        <div className="mt-auto border-t border-gray-200 pt-4 text-center text-md text-gray-500 sticky bottom-0 bg-white pb-2">
          {isOpen ? "© 2025 Cloudsat Pvt Ltd" : "©"}
        </div>
      </div>

      <div
        className={`${
          isOpen ? "ml-60" : "ml-16"
        } w-full transition-all duration-300`}
      ></div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
}

export default Navigation;
