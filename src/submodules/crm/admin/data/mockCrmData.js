


const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));


const INITIAL_PROJECTS = [
  {
    id: 1,
    name: "Grand Heights",
    location: "Sector 62, Noida",
    description: "Premium residential apartments with world-class amenities.",
    status: "active",
    total_units: 120,
    sold_units: 42,
    available_units: 78,
    starting_price: 6500000,
    blocks: [
      { id: 101, name: "Tower A" },
      { id: 102, name: "Tower B" }
    ],
    units: [
      { id: 1001, block_id: 101, unit_number: "A-101", room_type: "2BHK", floor: "1st Floor", price: 6500000, carpet_area: 1100, builtup_area: 1250, status: "available" },
      { id: 1002, block_id: 101, unit_number: "A-102", room_type: "3BHK", floor: "1st Floor", price: 8500000, carpet_area: 1450, builtup_area: 1600, status: "sold" },
      { id: 1003, block_id: 102, unit_number: "B-201", room_type: "2BHK", floor: "2nd Floor", price: 6700000, carpet_area: 1120, builtup_area: 1280, status: "available" },
      { id: 1004, block_id: 102, unit_number: "B-202", room_type: "4BHK", floor: "2nd Floor", price: 12500000, carpet_area: 2100, builtup_area: 2350, status: "sold" }
    ]
  },
  {
    id: 2,
    name: "Oasis Meadows",
    location: "Golf Course Road, Gurugram",
    description: "Ultra-luxury smart penthouses with panoramic green vistas.",
    status: "active",
    total_units: 50,
    sold_units: 18,
    available_units: 32,
    starting_price: 18000000,
    blocks: [
      { id: 201, name: "Phase 1" },
      { id: 202, name: "Phase 2" }
    ],
    units: [
      { id: 2001, block_id: 201, unit_number: "P1-102", room_type: "3BHK Villa", floor: "Ground Floor", price: 18000000, carpet_area: 2800, builtup_area: 3200, status: "available" },
      { id: 2002, block_id: 201, unit_number: "P1-504", room_type: "4BHK Penthouse", floor: "5th Floor", price: 28500000, carpet_area: 4200, builtup_area: 4800, status: "sold" },
      { id: 2003, block_id: 202, unit_number: "P2-205", room_type: "3BHK Villa", floor: "2nd Floor", price: 19500000, carpet_area: 2900, builtup_area: 3350, status: "available" }
    ]
  }
];

const INITIAL_BROKERS = [
  { id: 1, name: "Apex Realty Group", email: "deals@apexrealty.com", phone: "+91 9899123456", commission: "2.0%" },
  { id: 2, name: "Sterling Realty Advisors", email: "contact@sterlingre.in", phone: "+91 9811002233", commission: "1.5%" },
  { id: 3, name: "Century Real Estate", email: "broker@century.com", phone: "+91 9999008877", commission: "1.75%" }
];

const INITIAL_STAFF = [
  { id: 1, name: "Amit Sharma", email: "amit.sharma@buildererp.com", role: "Sales Manager", department: "Sales", phone: "+91 9876501234" },
  { id: 2, name: "Priya Singh", email: "priya.singh@buildererp.com", role: "Sales Executive", department: "Sales", phone: "+91 9876505678" },
  { id: 3, name: "Rahul Varma", email: "rahul.varma@buildererp.com", role: "Customer Relations", department: "Support", phone: "+91 9876509012" }
];

const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    company: "ABC Corporation",
    email: "rajesh@abccorp.com",
    contact: "+91 9876543210",
    alternatePhone: "+91 9999112233",
    industry: "Information Technology",
    customerType: "Enterprise",
    status: "Active",
    source: "Website",
    assignedTo: "Amit Sharma",
    brokerName: "Apex Realty Group",
    brokerId: 1,
    createdAt: "2026-01-15",
    lastContact: "2026-05-20",
    totalValue: 8500000,
    originalPrice: 8500000,
    tags: ["VIP", "Enterprise", "IT"],
    website: "www.abccorp.com",
    address: "123 Tech Park, Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201309",
    country: "India",
    employeeSize: "500-1000",
    annualRevenue: "₹50-100 Cr",
    description: "Leading IT services company. Booked a 3BHK flat at Grand Heights.",
    projectId: 1,
    projectName: "Grand Heights",
    unitId: 1002,
    unitNumber: "A-102",
    blockId: 101,
    blockName: "Tower A",
    floorName: "1st Floor",
    convertedFromLead: true,
    originalLeadId: "L-27192",
    conversionDate: "2026-01-15",
    leadScore: 85,
    projectStages: [
      { id: 1, name: "Site Acquisition", startDate: "2026-01-20", endDate: "2026-02-15", progress: 100, status: "completed", description: "Land acquisition and title deed clearance", budget: "1700000", paymentPercentage: "20.00", paymentSteps: [{ id: 11, description: "Token Advance Booking", amount: "500000.00", percentage: "5.88", date: "2026-01-15" }, { id: 12, description: "Allotment Letter signing", amount: "1200000.00", percentage: "14.12", date: "2026-01-20" }] },
      { id: 2, name: "Planning & Design", startDate: "2026-02-16", endDate: "2026-03-31", progress: 100, status: "completed", description: "Architectural drawings and structural safety approvals", budget: "850000", paymentPercentage: "10.00", paymentSteps: [{ id: 21, description: "Architectural Layout Approval", amount: "850000.00", percentage: "10.00", date: "2026-02-28" }] },
      { id: 3, name: "Foundation", startDate: "2026-04-01", endDate: "2026-05-30", progress: 75, status: "in-progress", description: "Site excavation and concrete reinforcement foundation", budget: "2125000", paymentPercentage: "25.00", paymentSteps: [{ id: 31, description: "Plinth Level Completion", amount: "2125000.00", percentage: "25.00", date: "2026-04-10" }] },
      { id: 4, name: "Superstructure", startDate: "2026-06-01", endDate: "2026-10-31", progress: 0, status: "pending", description: "RCC brickwork framing and slab casting", budget: "2550000", paymentPercentage: "30.00", paymentSteps: [{ id: 41, description: "Slab Casting Floor 1", amount: "1275000.00", percentage: "15.00", date: "" }, { id: 42, description: "Slab Casting Floor 2", amount: "1275000.00", percentage: "15.00", date: "" }] },
      { id: 5, name: "Finishing", startDate: "2026-11-01", endDate: "2027-01-31", progress: 0, status: "pending", description: "Plumbing, electrical wiring, tiles and interior paintwork", budget: "850000", paymentPercentage: "10.00", paymentSteps: [{ id: 51, description: "Plumbing & Tiling completion", amount: "850000.00", percentage: "10.00", date: "" }] },
      { id: 6, name: "Handover", startDate: "2027-02-01", endDate: "2027-03-31", progress: 0, status: "pending", description: "Final registration, NOC certificates, and handing keys", budget: "425000", paymentPercentage: "5.00", paymentSteps: [{ id: 61, description: "Key Handover and Registration", amount: "425000.00", percentage: "5.00", date: "" }] }
    ]
  },
  {
    id: 2,
    name: "Kavita Mehta",
    company: "Individual",
    email: "kavita.mehta@yahoo.com",
    contact: "+91 9811223344",
    alternatePhone: "",
    industry: "Healthcare",
    customerType: "Individual",
    status: "Active",
    source: "Broker Referral",
    assignedTo: "Priya Singh",
    brokerName: "Sterling Realty Advisors",
    brokerId: 2,
    createdAt: "2026-03-05",
    lastContact: "2026-05-28",
    totalValue: 18000000,
    originalPrice: 19500000,
    tags: ["High Budget", "Doctor"],
    website: "",
    address: "B-501, Green Meadows, DLF Phase 3",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    country: "India",
    employeeSize: "",
    annualRevenue: "",
    description: "Pediatric consultant. Booked a 3BHK Villa at Oasis Meadows. Discount applied.",
    projectId: 2,
    projectName: "Oasis Meadows",
    unitId: 2001,
    unitNumber: "P1-102",
    blockId: 201,
    blockName: "Phase 1",
    floorName: "Ground Floor",
    convertedFromLead: false,
    leadScore: 92,
    projectStages: [
      { id: 1, name: "Site Acquisition", startDate: "2026-03-10", endDate: "2026-04-10", progress: 100, status: "completed", description: "Land verification", budget: "3900000", paymentPercentage: "20.00", paymentSteps: [{ id: 101, description: "Booking token", amount: "1000000.00", percentage: "5.13", date: "2026-03-05" }, { id: 102, description: "Allotment payment", amount: "2900000.00", percentage: "14.87", date: "2026-03-15" }] },
      { id: 2, name: "Planning & Design", startDate: "2026-04-11", endDate: "2026-05-10", progress: 100, status: "completed", description: "Villa structural custom blueprints", budget: "1950000", paymentPercentage: "10.00", paymentSteps: [{ id: 103, description: "Custom Design approval", amount: "1950000.00", percentage: "10.00", date: "2026-04-20" }] },
      { id: 3, name: "Foundation", startDate: "2026-05-11", endDate: "2026-06-30", progress: 40, status: "in-progress", description: "Deep pile foundation", budget: "4875000", paymentPercentage: "25.00", paymentSteps: [{ id: 104, description: "Foundation cast", amount: "4875000.00", percentage: "25.00", date: "2026-05-15" }] },
      { id: 4, name: "Superstructure", startDate: "2026-07-01", endDate: "2026-11-30", progress: 0, status: "pending", description: "Villa double height frame construction", budget: "5850000", paymentPercentage: "30.00", paymentSteps: [] },
      { id: 5, name: "Finishing", startDate: "2026-12-01", endDate: "2027-02-28", progress: 0, status: "pending", description: "Italian marble fittings & lighting layout", budget: "1950000", paymentPercentage: "10.00", paymentSteps: [] },
      { id: 6, name: "Handover", startDate: "2027-03-01", endDate: "2027-04-30", progress: 0, status: "pending", description: "Possession keys, landscaping & security integration", budget: "-525000", paymentPercentage: "-2.69", paymentSteps: [{ id: 105, description: "Final Handover Payment (Discount Applied)", amount: "-525000.00", percentage: "-2.69", date: "" }] }

    ]
  }
];

const INITIAL_INTERACTIONS = [
  { id: 1, customerId: 1, type: "Meeting", date: "2026-01-15", time: "11:30", subject: "Initial Site Tour & Unit Selection", outcome: "Positive", notes: "Rajesh visited the Grand Heights site. Extremely impressed with Tower A view. Discussed budget range.", assignedTo: "Amit Sharma", duration: "60", location: "Grand Heights Site Office", priority: "High", contactId: null, followUpDate: "2026-01-18", followUpNotes: "Draft flat booking quote." },
  { id: 2, customerId: 1, type: "Call", date: "2026-01-18", time: "16:15", subject: "Quote Review and Token Booking negotiation", outcome: "Positive", notes: "Negotiated base rate. Agreed to original budget profile. Customer agreed to pay token advance of 5 Lakhs.", assignedTo: "Amit Sharma", duration: "15", location: "Virtual", priority: "High", contactId: null, followUpDate: "2026-01-20", followUpNotes: "Execute Booking documents." },
  { id: 3, customerId: 1, type: "Email", date: "2026-04-12", time: "10:00", subject: "Plinth Level Completion Certificate Shared", outcome: "Neutral", notes: "Shared formal invoice for plinth completion payment milestone (25% total value).", assignedTo: "Rahul Varma", duration: "10", location: "Virtual", priority: "Medium", contactId: null, followUpDate: "", followUpNotes: "" },
  { id: 4, customerId: 2, type: "Meeting", date: "2026-03-05", time: "14:00", subject: "Pricing Negotiation & Booking Agreement", outcome: "Positive", notes: "Negotiations concluded with a final price of ₹1.80 Cr (₹15 Lakhs discount). Booking token accepted.", assignedTo: "Priya Singh", duration: "90", location: "Builder ERP HQ Boardroom", priority: "High", contactId: null, followUpDate: "2026-03-10", followUpNotes: "Share architectural drawings." }
];

const INITIAL_DOCUMENTS = [
  { id: 1, customerId: 1, title: "Booking Allotment Letter", type: "Agreement", fileName: "Allotment_Rajesh_Kumar_A102.pdf", fileSize: 245000, category: "Contract", tags: ["signed", "booking"], uploadedBy: "Amit Sharma", uploadedAt: "2026-01-20" },
  { id: 2, customerId: 1, title: "Pan Card & Aadhaar Verification", type: "KYC Document", fileName: "Rajesh_Kumar_KYC.pdf", fileSize: 1800000, category: "KYC", tags: ["verified"], uploadedBy: "Amit Sharma", uploadedAt: "2026-01-15" },
  { id: 3, customerId: 2, title: "Oasis Meadows Purchase Agreement", type: "Agreement", fileName: "OasisMeadows_Villa102_Kavita.pdf", fileSize: 320000, category: "Contract", tags: ["executed", "stamped"], uploadedBy: "Priya Singh", uploadedAt: "2026-03-15" }
];

const INITIAL_PAYMENTS = [
  { id: 1, customerId: 1, invoiceNumber: "INV-2026-001", amount: 500000, totalAmount: 500000, gstAmount: 0, date: "2026-01-15", dueDate: "2026-01-20", status: "Paid", paymentMethod: "Cheque", transactionId: "CHQ-891024", description: "Booking Advance Token Payment", projectId: 1, projectName: "Grand Heights", bankName: "HDFC Bank", checkNumber: "891024", receivedFrom: "Rajesh Kumar", receivedBy: "Amit Sharma" },
  { id: 2, customerId: 1, invoiceNumber: "INV-2026-042", amount: 1200000, totalAmount: 1200000, gstAmount: 0, date: "2026-01-20", dueDate: "2026-01-30", status: "Paid", paymentMethod: "Bank Transfer", transactionId: "TXN-902182012", description: "Allotment Letter Booking Balance Stage 1", projectId: 1, projectName: "Grand Heights", receivedFrom: "ABC Corporation", receivedBy: "Amit Sharma" },
  { id: 3, customerId: 1, invoiceNumber: "INV-2026-105", amount: 2125000, totalAmount: 2125000, gstAmount: 0, date: "2026-04-10", dueDate: "2026-04-25", status: "Pending", paymentMethod: "Bank Transfer", transactionId: "", description: "Plinth Level Completion Stage 3 Demand Invoice", projectId: 1, projectName: "Grand Heights", receivedFrom: "", receivedBy: "Rahul Varma" },
  { id: 4, customerId: 2, invoiceNumber: "INV-2026-009", amount: 1000000, totalAmount: 1000000, gstAmount: 0, date: "2026-03-05", dueDate: "2026-03-10", status: "Paid", paymentMethod: "Bank Transfer", transactionId: "NEFT-782019", description: "Initial Booking Token Advance", projectId: 2, projectName: "Oasis Meadows", receivedFrom: "Kavita Mehta", receivedBy: "Priya Singh" },
  { id: 5, customerId: 2, invoiceNumber: "INV-2026-018", amount: 2900000, totalAmount: 2900000, gstAmount: 0, date: "2026-03-15", dueDate: "2026-03-25", status: "Paid", paymentMethod: "Cheque", transactionId: "CHQ-718290", description: "Allotment confirmation - Oasis Meadows Stage 1", projectId: 2, projectName: "Oasis Meadows", bankName: "ICICI Bank", checkNumber: "718290", receivedFrom: "Kavita Mehta", receivedBy: "Priya Singh" }
];

const INITIAL_TRANSACTIONS = [
  { id: 1, sl: 1, customerId: 1, transactionDate: "2026-01-15", transactionType: "Payment", remark: "Token Advance Booking Amount - Recvd.", accountNo: "HDFC A/C ***2012", debitAmount: 0, creditAmount: 500000, balance: 500000 },
  { id: 2, sl: 2, customerId: 1, transactionDate: "2026-01-20", transactionType: "Payment", remark: "Allotment Letter signing payment - Recvd.", accountNo: "HDFC A/C ***2012", debitAmount: 0, creditAmount: 1200000, balance: 1700000 },
  { id: 3, sl: 3, customerId: 1, transactionDate: "2026-04-10", transactionType: "Debit", remark: "Demand Raised: Plinth Level Milestone Stage 3", accountNo: "ERP Ledger A/C", debitAmount: 2125000, creditAmount: 0, balance: -425000 },
  { id: 4, sl: 1, customerId: 2, transactionDate: "2026-03-05", transactionType: "Payment", remark: "Initial Booking Token Advance - Recvd.", accountNo: "ICICI A/C ***0819", debitAmount: 0, creditAmount: 1000000, balance: 1000000 },
  { id: 5, sl: 2, customerId: 2, transactionDate: "2026-03-15", transactionType: "Payment", remark: "Allotment confirmation - Recvd.", accountNo: "ICICI A/C ***0819", debitAmount: 0, creditAmount: 2900000, balance: 3900000 }
];


const getStorageItem = (key, defaultVal) => {
  const data = localStorage.getItem(`builder_crm_${key}`);
  if (!data) {
    localStorage.setItem(`builder_crm_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
};

const setStorageItem = (key, val) => {
  localStorage.setItem(`builder_crm_${key}`, JSON.stringify(val));
};


const initDB = () => {
  getStorageItem("projects", INITIAL_PROJECTS);
  getStorageItem("brokers", INITIAL_BROKERS);
  getStorageItem("staff", INITIAL_STAFF);
  getStorageItem("customers", INITIAL_CUSTOMERS);
  getStorageItem("interactions", INITIAL_INTERACTIONS);
  getStorageItem("documents", INITIAL_DOCUMENTS);
  getStorageItem("payments", INITIAL_PAYMENTS);
  getStorageItem("transactions", INITIAL_TRANSACTIONS);
};
initDB();


export const mockCrmData = {

  getProjects: async () => {
    await delay();
    return getStorageItem("projects", INITIAL_PROJECTS);
  },


  getBrokers: async () => {
    await delay();
    return getStorageItem("brokers", INITIAL_BROKERS);
  },


  getStaff: async () => {
    await delay();
    return getStorageItem("staff", INITIAL_STAFF);
  },


  getCustomers: async () => {
    await delay();
    return getStorageItem("customers", INITIAL_CUSTOMERS);
  },

  getCustomerById: async (id) => {
    await delay();
    const customers = getStorageItem("customers", INITIAL_CUSTOMERS);
    return customers.find(c => c.id === parseInt(id)) || null;
  },

  addCustomer: async (customerData) => {
    await delay(250);
    const customers = getStorageItem("customers", INITIAL_CUSTOMERS);
    

    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    

    const projects = getStorageItem("projects", INITIAL_PROJECTS);
    const projId = parseInt(customerData.projectId);
    const blockId = parseInt(customerData.blockId);
    const unitId = parseInt(customerData.unitId);
    
    const selectedProject = projects.find(p => p.id === projId);
    const selectedBlock = selectedProject?.blocks?.find(b => b.id === blockId);
    const selectedUnit = selectedProject?.units?.find(u => u.id === unitId);

    const brokerList = getStorageItem("brokers", INITIAL_BROKERS);
    const bkId = parseInt(customerData.brokerId);
    const selectedBroker = brokerList.find(b => b.id === bkId);
    
    const newCustomer = {
      ...customerData,
      id: newId,
      projectId: projId || null,
      projectName: selectedProject ? selectedProject.name : "",
      blockId: blockId || null,
      blockName: selectedBlock ? selectedBlock.name : "",
      unitId: unitId || null,
      unitNumber: selectedUnit ? selectedUnit.unit_number : "",
      floorName: selectedUnit ? selectedUnit.floor : "",
      brokerId: bkId || null,
      brokerName: selectedBroker ? selectedBroker.name : "",
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0],
      totalValue: parseFloat(customerData.totalValue) || 0,
      originalPrice: selectedUnit ? selectedUnit.price : (parseFloat(customerData.totalValue) || 0),
      status: customerData.status || "Active",
      tags: customerData.tags || ["New Client"],
      projectStages: customerData.projectStages || []
    };
    

    if (selectedUnit) {
      selectedUnit.status = "sold";
      setStorageItem("projects", projects);
    }
    

    const transactions = getStorageItem("transactions", INITIAL_TRANSACTIONS);
    const transactionId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const initialDebit = {
      id: transactionId,
      sl: 1,
      customerId: newId,
      transactionDate: newCustomer.createdAt,
      transactionType: "Debit",
      remark: `Initial Demand raised for booking flat: ${newCustomer.unitNumber}`,
      accountNo: "ERP Ledger A/C",
      debitAmount: newCustomer.totalValue,
      creditAmount: 0,
      balance: -newCustomer.totalValue
    };
    transactions.push(initialDebit);
    setStorageItem("transactions", transactions);
    
    customers.push(newCustomer);
    setStorageItem("customers", customers);
    return newCustomer;
  },

  updateCustomer: async (id, updatedData) => {
    await delay(250);
    const customers = getStorageItem("customers", INITIAL_CUSTOMERS);
    const index = customers.findIndex(c => c.id === parseInt(id));
    if (index === -1) throw new Error("Customer not found");
    
    const originalCustomer = customers[index];
    const projects = getStorageItem("projects", INITIAL_PROJECTS);
    

    const oldUnitId = originalCustomer.unitId;
    const newUnitId = parseInt(updatedData.unitId);
    
    if (oldUnitId !== newUnitId) {

      projects.forEach(p => {
        const oldUnit = p.units?.find(u => u.id === oldUnitId);
        if (oldUnit) oldUnit.status = "available";
      });

      const targetProj = projects.find(p => p.id === parseInt(updatedData.projectId));
      const newUnit = targetProj?.units?.find(u => u.id === newUnitId);
      if (newUnit) newUnit.status = "sold";
      setStorageItem("projects", projects);
    }
    

    const projId = parseInt(updatedData.projectId);
    const blockId = parseInt(updatedData.blockId);
    const selectedProject = projects.find(p => p.id === projId);
    const selectedBlock = selectedProject?.blocks?.find(b => b.id === blockId);
    const selectedUnit = selectedProject?.units?.find(u => u.id === newUnitId);

    const brokerList = getStorageItem("brokers", INITIAL_BROKERS);
    const bkId = parseInt(updatedData.brokerId);
    const selectedBroker = brokerList.find(b => b.id === bkId);

    const updatedCustomer = {
      ...originalCustomer,
      ...updatedData,
      id: parseInt(id),
      projectId: projId || null,
      projectName: selectedProject ? selectedProject.name : "",
      blockId: blockId || null,
      blockName: selectedBlock ? selectedBlock.name : "",
      unitId: newUnitId || null,
      unitNumber: selectedUnit ? selectedUnit.unit_number : "",
      floorName: selectedUnit ? selectedUnit.floor : "",
      brokerId: bkId || null,
      brokerName: selectedBroker ? selectedBroker.name : "",
      totalValue: parseFloat(updatedData.totalValue) || originalCustomer.totalValue,
      originalPrice: selectedUnit ? selectedUnit.price : (parseFloat(updatedData.originalPrice) || originalCustomer.originalPrice),
      lastContact: new Date().toISOString().split('T')[0]
    };
    
    customers[index] = updatedCustomer;
    setStorageItem("customers", customers);
    return updatedCustomer;
  },

  deleteCustomer: async (id) => {
    await delay(200);
    const customers = getStorageItem("customers", INITIAL_CUSTOMERS);
    const index = customers.findIndex(c => c.id === parseInt(id));
    if (index === -1) throw new Error("Customer not found");
    
    const customer = customers[index];
    

    const projects = getStorageItem("projects", INITIAL_PROJECTS);
    projects.forEach(p => {
      const u = p.units?.find(unit => unit.id === customer.unitId);
      if (u) u.status = "available";
    });
    setStorageItem("projects", projects);
    

    customers.splice(index, 1);
    setStorageItem("customers", customers);
    

    const payments = getStorageItem("payments", INITIAL_PAYMENTS).filter(p => p.customerId !== parseInt(id));
    setStorageItem("payments", payments);
    
    const interactions = getStorageItem("interactions", INITIAL_INTERACTIONS).filter(i => i.customerId !== parseInt(id));
    setStorageItem("interactions", interactions);
    
    const documents = getStorageItem("documents", INITIAL_DOCUMENTS).filter(d => d.customerId !== parseInt(id));
    setStorageItem("documents", documents);
    
    const transactions = getStorageItem("transactions", INITIAL_TRANSACTIONS).filter(t => t.customerId !== parseInt(id));
    setStorageItem("transactions", transactions);

    return true;
  },


  saveProjectStages: async (customerId, stages) => {
    await delay(200);
    const customers = getStorageItem("customers", INITIAL_CUSTOMERS);
    const index = customers.findIndex(c => c.id === parseInt(customerId));
    if (index !== -1) {
      customers[index].projectStages = stages;
      setStorageItem("customers", customers);
      return stages;
    }
    throw new Error("Customer not found");
  },


  getInteractions: async (customerId) => {
    await delay();
    const interactions = getStorageItem("interactions", INITIAL_INTERACTIONS);
    return interactions.filter(i => i.customerId === parseInt(customerId));
  },

  addInteraction: async (customerId, interactionData) => {
    await delay(150);
    const interactions = getStorageItem("interactions", INITIAL_INTERACTIONS);
    const newId = interactions.length > 0 ? Math.max(...interactions.map(i => i.id)) + 1 : 1;
    const newInteraction = {
      ...interactionData,
      id: newId,
      customerId: parseInt(customerId),
      date: interactionData.date || new Date().toISOString().split('T')[0]
    };
    interactions.push(newInteraction);
    setStorageItem("interactions", interactions);
    return newInteraction;
  },


  getDocuments: async (customerId) => {
    await delay();
    const docs = getStorageItem("documents", INITIAL_DOCUMENTS);
    return docs.filter(d => d.customerId === parseInt(customerId));
  },

  addDocument: async (customerId, docData) => {
    await delay(200);
    const docs = getStorageItem("documents", INITIAL_DOCUMENTS);
    const newId = docs.length > 0 ? Math.max(...docs.map(d => d.id)) + 1 : 1;
    const newDoc = {
      ...docData,
      id: newId,
      customerId: parseInt(customerId),
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    docs.push(newDoc);
    setStorageItem("documents", docs);
    return newDoc;
  },

  deleteDocument: async (docId) => {
    await delay(150);
    const docs = getStorageItem("documents", INITIAL_DOCUMENTS);
    const index = docs.findIndex(d => d.id === parseInt(docId));
    if (index !== -1) {
      docs.splice(index, 1);
      setStorageItem("documents", docs);
      return true;
    }
    return false;
  },


  getPayments: async (customerId) => {
    await delay();
    const payments = getStorageItem("payments", INITIAL_PAYMENTS);
    return payments.filter(p => p.customerId === parseInt(customerId));
  },

  addPayment: async (customerId, paymentData) => {
    await delay(250);
    const payments = getStorageItem("payments", INITIAL_PAYMENTS);
    const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
    
    const customers = getStorageItem("customers", INITIAL_CUSTOMERS);
    const customer = customers.find(c => c.id === parseInt(customerId));

    const newPayment = {
      ...paymentData,
      id: newId,
      customerId: parseInt(customerId),
      projectName: customer ? customer.projectName : "",
      projectId: customer ? customer.projectId : null,
      amount: parseFloat(paymentData.amount) || 0,
      totalAmount: parseFloat(paymentData.amount) || 0,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      status: paymentData.status || "Paid"
    };
    payments.push(newPayment);
    setStorageItem("payments", payments);


    if (newPayment.status === "Paid") {
      const transactions = getStorageItem("transactions", INITIAL_TRANSACTIONS);
      const ledgerId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
      

      const clientTransactions = transactions.filter(t => t.customerId === parseInt(customerId));
      const currentBalance = clientTransactions.length > 0 ? clientTransactions[clientTransactions.length - 1].balance : 0;
      
      const newLedgerEntry = {
        id: ledgerId,
        sl: clientTransactions.length + 1,
        customerId: parseInt(customerId),
        transactionDate: newPayment.date,
        transactionType: "Payment",
        remark: newPayment.description || `Payment received: Invoice #${newPayment.invoiceNumber}`,
        accountNo: newPayment.paymentMethod === "Bank Transfer" ? "HDFC A/C ***2012" : (newPayment.paymentMethod === "Cheque" ? `${newPayment.bankName} Chq #${newPayment.checkNumber}` : "Cash Drawer"),
        debitAmount: 0,
        creditAmount: newPayment.amount,
        balance: currentBalance + newPayment.amount
      };
      
      transactions.push(newLedgerEntry);
      setStorageItem("transactions", transactions);
    } else {

      const transactions = getStorageItem("transactions", INITIAL_TRANSACTIONS);
      const ledgerId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
      
      const clientTransactions = transactions.filter(t => t.customerId === parseInt(customerId));
      const currentBalance = clientTransactions.length > 0 ? clientTransactions[clientTransactions.length - 1].balance : 0;
      
      const newLedgerEntry = {
        id: ledgerId,
        sl: clientTransactions.length + 1,
        customerId: parseInt(customerId),
        transactionDate: newPayment.date,
        transactionType: "Debit",
        remark: `Demand Raised: Invoice #${newPayment.invoiceNumber} - ${newPayment.description}`,
        accountNo: "ERP Ledger A/C",
        debitAmount: newPayment.amount,
        creditAmount: 0,
        balance: currentBalance - newPayment.amount
      };
      
      transactions.push(newLedgerEntry);
      setStorageItem("transactions", transactions);
    }
    
    return newPayment;
  },

  updatePaymentStatus: async (paymentId, status) => {
    await delay(200);
    const payments = getStorageItem("payments", INITIAL_PAYMENTS);
    const payment = payments.find(p => p.id === parseInt(paymentId));
    if (payment) {
      const oldStatus = payment.status;
      payment.status = status;
      setStorageItem("payments", payments);
      

      if (oldStatus !== "Paid" && status === "Paid") {
        const transactions = getStorageItem("transactions", INITIAL_TRANSACTIONS);
        const ledgerId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
        
        const clientTransactions = transactions.filter(t => t.customerId === payment.customerId);
        const currentBalance = clientTransactions.length > 0 ? clientTransactions[clientTransactions.length - 1].balance : 0;
        
        const newLedgerEntry = {
          id: ledgerId,
          sl: clientTransactions.length + 1,
          customerId: payment.customerId,
          transactionDate: new Date().toISOString().split('T')[0],
          transactionType: "Payment",
          remark: `Payment completed: Invoice #${payment.invoiceNumber}`,
          accountNo: payment.paymentMethod === "Bank Transfer" ? "HDFC A/C ***2012" : "ERP Ledger A/C",
          debitAmount: 0,
          creditAmount: payment.amount,
          balance: currentBalance + payment.amount
        };
        transactions.push(newLedgerEntry);
        setStorageItem("transactions", transactions);
      }
      return payment;
    }
    throw new Error("Invoice payment not found");
  },


  getLedgerEntries: async (customerId) => {
    await delay();
    const transactions = getStorageItem("transactions", INITIAL_TRANSACTIONS);
    return transactions.filter(t => t.customerId === parseInt(customerId));
  },

  addLedgerEntry: async (customerId, entryData) => {
    await delay(150);
    const transactions = getStorageItem("transactions", INITIAL_TRANSACTIONS);
    const clientTransactions = transactions.filter(t => t.customerId === parseInt(customerId));
    
    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const currentBalance = clientTransactions.length > 0 ? clientTransactions[clientTransactions.length - 1].balance : 0;
    
    const debit = parseFloat(entryData.debit) || 0;
    const credit = parseFloat(entryData.credit) || 0;
    

    const newBalance = currentBalance - debit + credit;

    const newEntry = {
      id: newId,
      sl: clientTransactions.length + 1,
      customerId: parseInt(customerId),
      transactionDate: entryData.date || new Date().toISOString().split('T')[0],
      transactionType: entryData.type || (credit > 0 ? "Payment" : "Debit"),
      remark: entryData.description,
      accountNo: entryData.accountNo || "ERP Ledger A/C",
      debitAmount: debit,
      creditAmount: credit,
      balance: newBalance
    };
    
    transactions.push(newEntry);
    setStorageItem("transactions", transactions);
    return newEntry;
  }
};
