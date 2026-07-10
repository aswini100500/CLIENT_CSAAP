import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaPlus,
  FaFileExcel,
  FaUser,
  FaUserCheck,
  FaStar,
  FaChartBar,
  FaProjectDiagram,
  FaArrowRight,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSave,
  FaEye,
  FaEdit,
  FaEllipsisV,
  FaWhatsapp,
  FaSms,
  FaEnvelope,
  FaFileContract,
  FaMoneyCheckAlt,
  FaCalendar,
  FaFileAlt,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaFileInvoiceDollar,
} from "react-icons/fa";

const Customerlist = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showActionsDropdown, setShowActionsDropdown] = useState(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationDetails, setQuotationDetails] = useState({
    subject: "",
    message: "",
    items: [],
    totalAmount: 0,
    validUntil: "",
  });
  const [brokerList, setBrokerList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [apiError, setApiError] = useState(null);

  const API_BASE_URL = "https://api.csaap.com/api/tenantuser";
  const API_PARAMS = {
    subdomain: "cloudflare",
    name: "yyy Brown",
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setApiError(null);

      const response = await axios.get(`${API_BASE_URL}/customers`, {
        params: API_PARAMS,
      });

      if (response.data.success) {
        const apiCustomers = response.data.data.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
          alternatePhone: customer.alt_phone,
          company: "",
          industry: "",
          customerType: "Prospect",
          status: "Active",
          source: "Direct",
          assignedTo: "",
          brokerName: customer.broker_name || "",
          createdAt: customer.created_at,
          lastContact: customer.updated_at,
          totalValue: parseFloat(customer.negotiated_price) || 0,
          tags: [],
          website: "",
          address: customer.address || "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          employeeSize: "",
          annualRevenue: "",
          description: "",
          project: customer.project_name || "",
          unit: customer.unit_name || "",
          budget: parseFloat(customer.negotiated_price) || 0,
          convertedFromLead: false,
          originalLeadId: null,
          conversionDate: null,
          leadStatus: null,
          leadScore: null,

          apiData: {
            broker_id: customer.broker_id,
            project_id: customer.project_id,
            unit_id: customer.unit_id,
            original_price: customer.original_price,
            negotiated_price: customer.negotiated_price,
          },
        }));

        setCustomers(apiCustomers);

        const brokers = [
          ...new Set(
            response.data.data
              .filter((c) => c.broker_name)
              .map((c) => ({
                id: c.broker_id,
                name: c.broker_name,
              })),
          ),
        ];
        setBrokerList(brokers);

        await fetchAdditionalData();
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setApiError("Failed to load customer data. Please try again.");

      initializeSampleData();
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async () => {
    try {
      const projectList = [
        {
          id: 1,
          name: "Luxury Apartments",
          units: [
            { id: "A101", type: "Flat", price: 250000 },
            { id: "A102", type: "Flat", price: 275000 },
            { id: "A201", type: "Duplex", price: 450000 },
            { id: "A202", type: "Duplex", price: 480000 },
          ],
        },
        {
          id: 2,
          name: "Green Valley Homes",
          units: [
            { id: "GV101", type: "Flat", price: 220000 },
            { id: "GV102", type: "Flat", price: 230000 },
            { id: "GV201", type: "Duplex", price: 420000 },
            { id: "GV202", type: "Duplex", price: 440000 },
          ],
        },
        {
          id: 3,
          name: "Ocean View Residences",
          units: [
            { id: "OV101", type: "Flat", price: 350000 },
            { id: "OV102", type: "Flat", price: 370000 },
            { id: "OV201", type: "Duplex", price: 650000 },
            { id: "OV202", type: "Duplex", price: 680000 },
          ],
        },
      ];

      setProjects(projectList);
    } catch (error) {
      console.error("Error fetching additional data:", error);
    }
  };

  const initializeSampleData = () => {
    const sampleCustomers = [
      {
        id: 1,
        name: "Rajesh Kumar",
        contact: "+91 9876543210",
        email: "rajesh@abccorp.com",
        company: "ABC Corporation",
        industry: "Information Technology",
        customerType: "Enterprise",
        status: "Active",
        source: "Website",
        assignedTo: "Sales Team A",
        brokerName: "John Smith",
        createdAt: "2024-01-15",
        lastContact: "2024-06-20",
        totalValue: 375000,
        tags: ["VIP", "Enterprise", "Tech"],
        website: "www.abccorp.com",
        address: "123 Tech Park, Sector 62",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201309",
        country: "India",
        employeeSize: "500-1000",
        annualRevenue: "₹50-100 Cr",
        description: "Leading IT services company",
        convertedFromLead: true,
        originalLeadId: "L-27192",
        conversionDate: "2024-01-15",
        leadStatus: "accepted",
        leadScore: 85,
      },
    ];

    const sampleBrokers = [
      { id: 1, name: "John Smith" },
      { id: 2, name: "Emma Wilson" },
      { id: 3, name: "Robert Brown" },
    ];

    setCustomers(sampleCustomers);
    setBrokerList(sampleBrokers);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const projectList = [
    {
      id: 1,
      name: "Luxury Apartments",
      units: [
        { id: "A101", type: "Flat", price: 250000 },
        { id: "A102", type: "Flat", price: 275000 },
        { id: "A201", type: "Duplex", price: 450000 },
        { id: "A202", type: "Duplex", price: 480000 },
      ],
    },
    {
      id: 2,
      name: "Green Valley Homes",
      units: [
        { id: "GV101", type: "Flat", price: 220000 },
        { id: "GV102", type: "Flat", price: 230000 },
        { id: "GV201", type: "Duplex", price: 420000 },
        { id: "GV202", type: "Duplex", price: 440000 },
      ],
    },
    {
      id: 3,
      name: "Ocean View Residences",
      units: [
        { id: "OV101", type: "Flat", price: 350000 },
        { id: "OV102", type: "Flat", price: 370000 },
        { id: "OV201", type: "Duplex", price: 650000 },
        { id: "OV202", type: "Duplex", price: 680000 },
      ],
    },
  ];

  const paymentTemplates = [
    {
      id: 1,
      name: "Standard 5-Slab Plan",
      slabs: [
        { milestone: "Booking Amount", percentage: 10 },
        { milestone: "At Time of Agreement", percentage: 15 },
        { milestone: "On Foundation Complete", percentage: 20 },
        { milestone: "On Superstructure", percentage: 25 },
        { milestone: "On Possession", percentage: 30 },
      ],
    },
    {
      id: 2,
      name: "Flexi 5-Slab Plan",
      slabs: [
        { milestone: "Booking Amount", percentage: 5 },
        { milestone: "At Time of Agreement", percentage: 10 },
        { milestone: "On Foundation Complete", percentage: 15 },
        { milestone: "On Superstructure", percentage: 25 },
        { milestone: "On Possession", percentage: 45 },
      ],
    },
    {
      id: 3,
      name: "Quick 4-Slab Plan",
      slabs: [
        { milestone: "Booking Amount", percentage: 15 },
        { milestone: "At Time of Agreement", percentage: 20 },
        { milestone: "On Superstructure", percentage: 30 },
        { milestone: "On Possession", percentage: 35 },
      ],
    },
  ];

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    industry: "",
    customerType: "Prospect",
    source: "Website",
    assignedTo: "",
    brokerName: "",
    tags: [],
    website: "",
    employeeSize: "",
    annualRevenue: "",
    description: "",
    purchaseHistory: {
      projectId: "",
      unitId: "",
      originalPrice: 0,
      negotiatedPrice: 0,
    },
    paymentSlabs: [],
  });

  const [selectedProjectUnits, setSelectedProjectUnits] = useState([]);
  const [selectedPaymentTemplate, setSelectedPaymentTemplate] = useState("");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("purchaseHistory.")) {
      const field = name.split(".")[1];

      if (field === "projectId") {
        const project = projectList.find((p) => p.id === parseInt(value));
        const units = project ? project.units : [];
        setSelectedProjectUnits(units);

        setNewCustomer({
          ...newCustomer,
          purchaseHistory: {
            ...newCustomer.purchaseHistory,
            projectId: value,
            unitId: "",
            originalPrice: 0,
            negotiatedPrice: 0,
          },
        });
      } else if (field === "unitId") {
        const selectedUnit = selectedProjectUnits.find(
          (unit) => unit.id === value,
        );
        setNewCustomer({
          ...newCustomer,
          purchaseHistory: {
            ...newCustomer.purchaseHistory,
            unitId: value,
            originalPrice: selectedUnit ? selectedUnit.price : 0,
            negotiatedPrice: selectedUnit ? selectedUnit.price : 0,
          },
        });
      } else {
        setNewCustomer({
          ...newCustomer,
          purchaseHistory: {
            ...newCustomer.purchaseHistory,
            [field]:
              field === "negotiatedPrice" ? parseFloat(value) || 0 : value,
          },
        });
      }
    } else {
      setNewCustomer({
        ...newCustomer,
        [name]: value,
      });
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = parseInt(e.target.value);
    setSelectedPaymentTemplate(templateId);

    if (templateId && newCustomer.purchaseHistory.negotiatedPrice > 0) {
      const template = paymentTemplates.find((t) => t.id === templateId);
      if (template) {
        const totalPrice = newCustomer.purchaseHistory.negotiatedPrice;
        const today = new Date();

        const slabs = template.slabs.map((slab, index) => {
          const dueDate = new Date(today);
          dueDate.setDate(today.getDate() + (index + 1) * 30);

          return {
            milestone: slab.milestone,
            percentage: slab.percentage,
            amount: Math.round(totalPrice * (slab.percentage / 100)),
            dueDate: dueDate.toISOString().split("T")[0],
            status: index === 0 ? "Pending" : "Pending",
          };
        });

        setNewCustomer({
          ...newCustomer,
          paymentSlabs: slabs,
        });
      }
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.contact && customer.contact.includes(searchTerm)) ||
      (customer.originalLeadId &&
        customer.originalLeadId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "fromLeads" && customer.convertedFromLead) ||
      (filterStatus === "direct" && !customer.convertedFromLead) ||
      customer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.length,
    fromLeads: customers.filter((c) => c.convertedFromLead).length,
    direct: customers.filter((c) => !c.convertedFromLead).length,
    active: customers.filter((c) => c.status === "Active").length,
    leads: customers.filter((c) => c.status === "Lead").length,
    totalValue: customers.reduce(
      (sum, customer) => sum + customer.totalValue,
      0,
    ),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Lead":
        return "bg-yellow-100 text-yellow-800";
      case "Prospect":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case "Website":
        return "bg-purple-100 text-purple-800";
      case "Referral":
        return "bg-indigo-100 text-indigo-800";
      case "Social Media":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLeadStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewProfile = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleAction = (action, customer) => {
    setSelectedCustomer(customer);
    setShowActionsDropdown(null);

    switch (action) {
      case "view":
        handleViewProfile(customer);
        break;
      case "edit":
        handleEditCustomer(customer);
        break;
      case "contacts":
        navigate("/customer-contacts", { state: { customer } });
        break;
      case "send_quotation":
        handleSendQuotation(customer);
        break;
      case "whatsapp":
        handleWhatsAppMessage(customer);
        break;
      case "sms":
        handleSMSMessage(customer);
        break;
      case "email":
        handleEmailMessage(customer);
        break;
      case "create_project":
        handleCreateProject(customer);
        break;
      case "schedule_meeting":
        handleScheduleMeeting(customer);
        break;
      case "add_note":
        handleAddNote(customer);
        break;
      case "generate_contract":
        handleGenerateContract(customer);
        break;
      case "view_ledger":
        handleViewLedger(customer);
        break;
      case "delete":
        handleDeleteCustomer(customer);
        break;
      default:
        break;
    }
  };

  const closeModals = () => {
    setShowCustomerDetails(false);
    setShowEditCustomer(false);
    setSelectedCustomer(null);
    setShowQuotationModal(false);
  };

  const closeAddCustomer = () => {
    setShowAddCustomer(false);
    setNewCustomer({
      name: "",
      company: "",
      email: "",
      phone: "",
      alternatePhone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      industry: "",
      customerType: "Prospect",
      source: "Website",
      assignedTo: "",
      brokerName: "",
      tags: [],
      website: "",
      employeeSize: "",
      annualRevenue: "",
      description: "",
      purchaseHistory: {
        projectId: "",
        unitId: "",
        originalPrice: 0,
        negotiatedPrice: 0,
      },
      paymentSlabs: [],
    });
    setSelectedProjectUnits([]);
    setSelectedPaymentTemplate("");
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert("Please fill in required fields (Name and Email)");
      return;
    }

    try {
      const customerData = {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        alt_phone: newCustomer.alternatePhone,
        broker_id:
          brokerList.find((b) => b.name === newCustomer.brokerName)?.id || null,
        address: newCustomer.address,
        project_id: newCustomer.purchaseHistory.projectId,
        unit_id: newCustomer.purchaseHistory.unitId,
        original_price: newCustomer.purchaseHistory.originalPrice,
        negotiated_price: newCustomer.purchaseHistory.negotiatedPrice,
      };

      const customer = {
        id: Math.max(...customers.map((c) => c.id), 0) + 1,
        name: newCustomer.name,
        email: newCustomer.email,
        contact: newCustomer.phone,
        alternatePhone: newCustomer.alternatePhone,
        company: newCustomer.company,
        industry: newCustomer.industry,
        customerType: newCustomer.customerType,
        status: "Active",
        source: newCustomer.source,
        assignedTo: newCustomer.assignedTo,
        brokerName: newCustomer.brokerName,
        createdAt: new Date().toISOString().split("T")[0],
        lastContact: new Date().toISOString().split("T")[0],
        totalValue: newCustomer.purchaseHistory.negotiatedPrice || 0,
        tags: newCustomer.tags,
        website: newCustomer.website,
        address: newCustomer.address,
        city: newCustomer.city,
        state: newCustomer.state,
        pincode: newCustomer.pincode,
        country: newCustomer.country,
        employeeSize: newCustomer.employeeSize,
        annualRevenue: newCustomer.annualRevenue,
        description: newCustomer.description,
        project:
          projectList.find(
            (p) => p.id === parseInt(newCustomer.purchaseHistory.projectId),
          )?.name || "",
        unit:
          selectedProjectUnits.find(
            (u) => u.id === newCustomer.purchaseHistory.unitId,
          )?.id || "",
        budget: parseFloat(newCustomer.purchaseHistory.negotiatedPrice) || 0,
        paymentSlabs: newCustomer.paymentSlabs,
        convertedFromLead: false,
      };

      setCustomers([...customers, customer]);
      alert("Customer added successfully!");
      closeAddCustomer();
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Please try again.");
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({
      name: customer.name,
      company: customer.company || "",
      email: customer.email,
      phone: customer.contact || "",
      alternatePhone: customer.alternatePhone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      pincode: customer.pincode || "",
      country: customer.country || "India",
      industry: customer.industry || "",
      customerType: customer.customerType || "Prospect",
      source: customer.source || "Website",
      assignedTo: customer.assignedTo || "",
      brokerName: customer.brokerName || "",
      tags: customer.tags || [],
      website: customer.website || "",
      employeeSize: customer.employeeSize || "",
      annualRevenue: customer.annualRevenue || "",
      description: customer.description || "",
      purchaseHistory: {
        projectId: "",
        unitId: "",
        originalPrice: customer.budget || 0,
        negotiatedPrice: customer.budget || 0,
      },
      paymentSlabs: customer.paymentSlabs || [],
    });
    setShowEditCustomer(true);
  };

  const handleUpdateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert("Please fill in required fields (Name and Email)");
      return;
    }

    try {
      const updateData = {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        alt_phone: newCustomer.alternatePhone,
        broker_id:
          brokerList.find((b) => b.name === newCustomer.brokerName)?.id || null,
        address: newCustomer.address,
      };

      const updatedCustomer = {
        ...selectedCustomer,
        name: newCustomer.name,
        email: newCustomer.email,
        contact: newCustomer.phone,
        alternatePhone: newCustomer.alternatePhone,
        company: newCustomer.company,
        industry: newCustomer.industry,
        customerType: newCustomer.customerType,
        source: newCustomer.source,
        assignedTo: newCustomer.assignedTo,
        brokerName: newCustomer.brokerName,
        tags: newCustomer.tags,
        website: newCustomer.website,
        address: newCustomer.address,
        city: newCustomer.city,
        state: newCustomer.state,
        pincode: newCustomer.pincode,
        country: newCustomer.country,
        employeeSize: newCustomer.employeeSize,
        annualRevenue: newCustomer.annualRevenue,
        description: newCustomer.description,
        lastContact: new Date().toISOString().split("T")[0],
        paymentSlabs: newCustomer.paymentSlabs,
      };

      setCustomers(
        customers.map((c) =>
          c.id === selectedCustomer.id ? updatedCustomer : c,
        ),
      );
      alert("Customer updated successfully!");
      setShowEditCustomer(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer. Please try again.");
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      )
    ) {
      try {
        setCustomers(customers.filter((c) => c.id !== customer.id));
        alert(`Customer ${customer.name} has been deleted successfully.`);
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("Failed to delete customer. Please try again.");
      }
    }
  };

  const handleSendQuotation = (customer) => {
    setSelectedCustomer(customer);
    setQuotationDetails({
      subject: `Quotation for ${customer.company || customer.name}`,
      message: `Dear ${customer.name},\n\nPlease find our quotation attached.\n\nBest regards,\nYour Company`,
      items: [
        { name: "Product/Service 1", quantity: 1, price: 10000 },
        { name: "Product/Service 2", quantity: 2, price: 5000 },
      ],
      totalAmount: customer.totalValue || 20000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
    setShowQuotationModal(true);
  };

  const handleWhatsAppMessage = (customer) => {
    const message = `Hello ${customer.name}, thank you for your interest in our services. We're here to assist you with any questions you may have.`;
    const whatsappUrl = `https://wa.me/${customer.contact?.replace(/\D/g, "") || ""}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    alert(`Opening WhatsApp chat with ${customer.name}`);
  };

  const handleSMSMessage = (customer) => {
    const message = `Hello ${customer.name}, thank you for your interest. We'll contact you shortly.`;
    alert(`SMS would be sent to ${customer.contact}: "${message}"`);
  };

  const handleEmailMessage = (customer) => {
    const subject = "Thank you for your inquiry";
    const body = `Dear ${customer.name},\n\nThank you for your interest in our services. We'll get back to you shortly.\n\nBest regards,\nYour Team`;
    const mailtoUrl = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleCreateProject = (customer) => {
    navigate("/projects/new", { state: { customer } });
    alert(`Creating new project for ${customer.name}`);
  };

  const handleScheduleMeeting = (customer) => {
    alert(`Scheduling meeting with ${customer.name}`);
  };

  const handleAddNote = (customer) => {
    const note = prompt(`Add a note for ${customer.name}:`);
    if (note) {
      alert(`Note added: ${note}`);
    }
  };

  const handleGenerateContract = (customer) => {
    alert(`Generating contract for ${customer.name}`);
  };

  const handleViewLedger = (customer) => {
    navigate(`/customer-ledger/${customer.id}`);
  };

  const sendQuotation = (method) => {
    const { subject, message, totalAmount } = quotationDetails;

    switch (method) {
      case "whatsapp":
        const whatsappMsg = `${subject}\n\n${message}\n\nTotal Amount: ₹${totalAmount.toLocaleString()}`;
        const whatsappUrl = `https://wa.me/${selectedCustomer.contact?.replace(/\D/g, "") || ""}?text=${encodeURIComponent(whatsappMsg)}`;
        window.open(whatsappUrl, "_blank");
        break;
      case "sms":
        alert(`SMS quotation sent to ${selectedCustomer.contact}`);
        break;
      case "email":
        const emailBody = `${message}\n\nTotal Amount: ₹${totalAmount.toLocaleString()}\n\nPlease find the detailed quotation attached.`;
        const mailtoUrl = `mailto:${selectedCustomer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoUrl;
        break;
      default:
        break;
    }

    setShowQuotationModal(false);
    alert(
      `Quotation sent via ${method.toUpperCase()} to ${selectedCustomer.name}`,
    );
  };

  const exportToExcel = () => {
    alert("Exporting customer data to Excel...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠</span>
              <span className="text-red-700">{apiError}</span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Customer Management
              </h1>
              <p className="text-gray-600">
                All customers including those converted from leads
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              <button
                onClick={() => setShowAddCustomer(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Customer
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaFileExcel className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={fetchCustomers}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center shadow-md"
              >
                <FaArrowRight className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <FaUser className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Customers</div>
                <div className="text-xl font-bold text-gray-900">
                  {stats.total}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <FaUserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">From Leads</div>
                <div className="text-xl font-bold text-gray-900">
                  {stats.fromLeads}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <FaStar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Direct</div>
                <div className="text-xl font-bold text-gray-900">
                  {stats.direct}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <FaChartBar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Value</div>
                <div className="text-xl font-bold text-gray-900">
                  ₹{stats.totalValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <FaProjectDiagram className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Active</div>
                <div className="text-xl font-bold text-gray-900">
                  {stats.active}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <FaArrowRight className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Lead Conversion</div>
                <div className="text-xl font-bold text-gray-900">
                  {stats.fromLeads}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Customers
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, company, or contact..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter By
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Customers</option>
                <option value="fromLeads">From Leads</option>
                <option value="direct">Direct Customers</option>
                <option value="Active">Active</option>
                <option value="Lead">Leads</option>
                <option value="Prospect">Prospects</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <FaFilter className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {showAddCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4 text-white sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Add New Customer</h2>
                    <p className="text-blue-100">
                      Create a new customer profile
                    </p>
                  </div>
                  <button
                    onClick={closeAddCustomer}
                    className="text-white hover:text-gray-200 transition-colors duration-200 p-2"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddCustomer();
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Basic Information
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.name}
                          onChange={handleInputChange}
                          placeholder="Enter customer full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.email}
                          onChange={handleInputChange}
                          placeholder="Enter email address"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alternate Phone
                        </label>
                        <input
                          type="tel"
                          name="alternatePhone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.alternatePhone}
                          onChange={handleInputChange}
                          placeholder="Enter alternate phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Broker Name
                        </label>
                        <select
                          name="brokerName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.brokerName}
                          onChange={handleInputChange}
                        >
                          <option value="">Select a broker</option>
                          {brokerList.map((broker) => (
                            <option key={broker.id} value={broker.name}>
                              {broker.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Additional Information
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.company}
                          onChange={handleInputChange}
                          placeholder="Enter company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <select
                          name="industry"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.industry}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Industry</option>
                          <option value="Information Technology">
                            Information Technology
                          </option>
                          <option value="Software Development">
                            Software Development
                          </option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Retail">Retail</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Hospitality">Hospitality</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Type
                        </label>
                        <select
                          name="customerType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.customerType}
                          onChange={handleInputChange}
                        >
                          <option value="Prospect">Prospect</option>
                          <option value="SMB">SMB</option>
                          <option value="Enterprise">Enterprise</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Source
                        </label>
                        <select
                          name="source"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.source}
                          onChange={handleInputChange}
                        >
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Direct">Direct</option>
                          <option value="Event">Event</option>
                          <option value="Partner">Partner</option>
                          <option value="Existing Customer">
                            Existing Customer
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Project History
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project
                        </label>
                        <select
                          name="purchaseHistory.projectId"
                          value={newCustomer.purchaseHistory.projectId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a project</option>
                          {projectList.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit (Flat/Duplex)
                        </label>
                        <select
                          name="purchaseHistory.unitId"
                          value={newCustomer.purchaseHistory.unitId}
                          onChange={handleInputChange}
                          disabled={!newCustomer.purchaseHistory.projectId}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a unit</option>
                          {selectedProjectUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.id} ({unit.type}) -{" "}
                              {formatCurrency(unit.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Original Price
                        </label>
                        <input
                          type="text"
                          value={formatCurrency(
                            newCustomer.purchaseHistory.originalPrice,
                          )}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Negotiated Price
                        </label>
                        <input
                          type="number"
                          name="purchaseHistory.negotiatedPrice"
                          value={newCustomer.purchaseHistory.negotiatedPrice}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <textarea
                          name="address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={newCustomer.address}
                          onChange={handleInputChange}
                          placeholder="Enter full address"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>

                  {newCustomer.purchaseHistory.negotiatedPrice > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Payment Plan
                      </h3>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Payment Template
                        </label>
                        <select
                          value={selectedPaymentTemplate}
                          onChange={handleTemplateChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a payment template</option>
                          {paymentTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {newCustomer.paymentSlabs.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-md font-medium text-gray-700 mb-3">
                            Payment Schedule
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Milestone
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Percentage
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Due Date
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {newCustomer.paymentSlabs.map((slab, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {slab.milestone}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {slab.percentage}%
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {formatCurrency(slab.amount)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {slab.dueDate}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          slab.status === "Paid"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {slab.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeAddCustomer}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FaSave className="w-4 h-4 mr-2" />
                      Add Customer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Customer List ({filteredCustomers.length} customers)
              </h3>
              <div className="text-sm text-gray-600">
                {stats.fromLeads} from leads • {stats.direct} direct
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company & Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="font-semibold text-gray-900">
                            {customer.name}
                          </div>
                          {customer.convertedFromLead && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <FaArrowRight className="w-3 h-3 mr-1" />
                              From Lead
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.company || "No company specified"}
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/customerlist/${customer.id}`)
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-1 transition-colors"
                        >
                          <FaEye className="w-3 h-3 mr-1" />
                          View Profile
                        </button>
                        {customer.originalLeadId && (
                          <div className="text-xs text-gray-400 mt-1">
                            Lead ID: {customer.originalLeadId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {customer.company || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.industry || "N/A"}
                        </div>
                        {customer.project && (
                          <div className="text-xs text-blue-600 mt-1">
                            Project: {customer.project} • {customer.unit}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.contact || "No phone"}
                        </div>
                        {customer.brokerName && (
                          <div className="text-xs text-gray-500 mt-1">
                            Broker: {customer.brokerName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(customer.source)}`}
                        >
                          {customer.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}
                          >
                            {customer.status}
                          </span>
                          {customer.leadStatus && (
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getLeadStatusColor(customer.leadStatus)}`}
                            >
                              Lead: {customer.leadStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-1 py-2">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() =>
                              handleAction("send_quotation", customer)
                            }
                            className="p-2 text-green-700 rounded-lg hover:bg-green-50 transition-colors flex items-center"
                            title="Send Quotation"
                          >
                            <FaFileInvoiceDollar className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleAction("view", customer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleAction("edit", customer)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit Customer"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowActionsDropdown(
                                  showActionsDropdown === customer.id
                                    ? null
                                    : customer.id,
                                )
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="All Actions"
                            >
                              <FaEllipsisV className="w-4 h-4" />
                            </button>

                            {showActionsDropdown === customer.id && (
                              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
                                    Communication
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleAction("whatsapp", customer)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                                  >
                                    <FaWhatsapp className="w-4 h-4 mr-3 text-green-600" />
                                    Send WhatsApp Message
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction("sms", customer)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                                  >
                                    <FaSms className="w-4 h-4 mr-3 text-blue-600" />
                                    Send SMS
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction("email", customer)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50"
                                  >
                                    <FaEnvelope className="w-4 h-4 mr-3 text-red-600" />
                                    Send Email
                                  </button>

                                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-t">
                                    Business
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleAction("create_project", customer)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                                  >
                                    <FaProjectDiagram className="w-4 h-4 mr-3 text-purple-600" />
                                    Create Project
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction(
                                        "generate_contract",
                                        customer,
                                      )
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                                  >
                                    <FaFileContract className="w-4 h-4 mr-3 text-orange-600" />
                                    Generate Contract
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction("view_ledger", customer)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                                  >
                                    <FaMoneyCheckAlt className="w-4 h-4 mr-3 text-indigo-600" />
                                    View Ledger
                                  </button>

                                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-t">
                                    Other
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleAction("schedule_meeting", customer)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50"
                                  >
                                    <FaCalendar className="w-4 h-4 mr-3 text-yellow-600" />
                                    Schedule Meeting
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction("add_note", customer)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <FaFileAlt className="w-4 h-4 mr-3 text-gray-600" />
                                    Add Note
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction("delete", customer)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <FaTrash className="w-4 h-4 mr-3" />
                                    Delete Customer
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500 text-center">
                        <FaUser className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">
                          No customers found
                        </p>
                        <p className="text-sm mt-1">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing {filteredCustomers.length} of {customers.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              <FaChevronLeft className="w-3 h-3" />
              <span>Previous</span>
            </button>
            <button className="w-8 h-8 bg-blue-600 text-white rounded-lg font-medium">
              1
            </button>
            <button className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              <span>Next</span>
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customerlist;
