import client from './client';

const API_PREFIX = '/api/tenant';

const operationApi = {
    // Categories
    getCategories: () => client.get(`${API_PREFIX}/categories`),

    // Products
    getProducts: () => client.get(`${API_PREFIX}/products`),
    getProductsByCategory: (categoryId) => client.get(`${API_PREFIX}/products/category/${categoryId}`),

    // Suppliers
    getSuppliers: () => client.get(`${API_PREFIX}/supplier`),
    getSupplier: (id) => client.get(`${API_PREFIX}/supplier/${id}`),
    createSupplier: (data) => client.post(`${API_PREFIX}/supplier`, data),
    updateSupplier: (id, data) => client.put(`${API_PREFIX}/supplier/${id}`, data),
    deleteSupplier: (id) => client.delete(`${API_PREFIX}/supplier/${id}`),

    // Contractors
    getContractors: () => client.get(`${API_PREFIX}/contractors`),
    getContractor: (id) => client.get(`${API_PREFIX}/contractors/${id}`),
    createContractor: (data) => client.post(`${API_PREFIX}/contractors`, data),
    updateContractor: (id, data) => client.put(`${API_PREFIX}/contractors/${id}`, data),
    deleteContractor: (id) => client.delete(`${API_PREFIX}/contractors/${id}`),
    searchContractors: (query) => client.get(`${API_PREFIX}/contractors/search?name=${query}`),

    // Projects (Cross-category)
    getApartments: () => client.get(`${API_PREFIX}/apartments`),
    getCommercials: () => client.get(`${API_PREFIX}/commercials`),
    getPlottings: () => client.get(`${API_PREFIX}/plottings`),
    getDuplexes: () => client.get(`${API_PREFIX}/duplexes`),
    getTriplexes: () => client.get(`${API_PREFIX}/triplexes`),
    getCustomProjects: () => client.get(`${API_PREFIX}/custom-projects`),

    // Vendors
    getVendors: () => client.get(`${API_PREFIX}/vendors`),
    getVendor: (id) => client.get(`${API_PREFIX}/vendors/${id}`),
    createVendor: (data) => client.post(`${API_PREFIX}/vendors/create`, data),
    updateVendor: (id, data) => client.put(`${API_PREFIX}/vendors/${id}`, data),
    updateVendorManpower: (id, data) => client.put(`${API_PREFIX}/vendors/${id}/manpower`, data),
    updateVendorMachines: (id, data) => client.put(`${API_PREFIX}/vendors/${id}/machines`, data),
    updateVendorWorkHistory: (id, data) => client.put(`${API_PREFIX}/vendors/${id}/work-history`, data),
    deleteVendor: (id) => client.delete(`${API_PREFIX}/vendors/${id}`),

    // Tenders
    getTenders: () => client.get(`${API_PREFIX}/tenders`),
    getTender: (id) => client.get(`${API_PREFIX}/tenders/${id}`),
    createTender: (data) => client.post(`${API_PREFIX}/tenders/create`, data),
    updateTender: (id, data) => client.put(`${API_PREFIX}/tenders/${id}`, data),
    deleteTender: (id) => client.delete(`${API_PREFIX}/tenders/${id}`),

    // Equipments
    getEquipments: () => client.get(`${API_PREFIX}/equipments`),
    getEquipment: (id) => client.get(`${API_PREFIX}/equipments/${id}`),
    createEquipment: (data) => client.post(`${API_PREFIX}/equipments/create`, data),
    updateEquipment: (id, data) => client.put(`${API_PREFIX}/equipments/${id}`, data),
    deleteEquipment: (id) => client.delete(`${API_PREFIX}/equipments/${id}`),

    // Operators
    getOperators: () => client.get(`${API_PREFIX}/operators`),
    getOperator: (id) => client.get(`${API_PREFIX}/operators/${id}`),
    createOperator: (data) => client.post(`${API_PREFIX}/operators/create`, data),
    updateOperator: (id, data) => client.put(`${API_PREFIX}/operators/${id}`, data),
    deleteOperator: (id) => client.delete(`${API_PREFIX}/operators/${id}`),

    // Drivers
    getDrivers: () => client.get(`${API_PREFIX}/drivers`),
    getDriver: (id) => client.get(`${API_PREFIX}/drivers/${id}`),
    createDriver: (data) => client.post(`${API_PREFIX}/drivers/create`, data),
    updateDriver: (id, data) => client.put(`${API_PREFIX}/drivers/${id}`, data),
    deleteDriver: (id) => client.delete(`${API_PREFIX}/drivers/${id}`),

    // Vehicles
    getVehicles: () => client.get(`${API_PREFIX}/vehicles`),
    getVehicle: (id) => client.get(`${API_PREFIX}/vehicles/${id}`),
    createVehicle: (data) => client.post(`${API_PREFIX}/vehicles/create`, data),
    updateVehicle: (id, data) => client.put(`${API_PREFIX}/vehicles/${id}`, data),
    deleteVehicle: (id) => client.delete(`${API_PREFIX}/vehicles/${id}`),

    // Hindering Records
    getHinderingRecords: () => client.get(`${API_PREFIX}/hindering-records`),
    getHinderingRecord: (id) => client.get(`${API_PREFIX}/hindering-records/${id}`),
    createHinderingRecord: (data) => client.post(`${API_PREFIX}/hindering-records/create`, data),
    updateHinderingRecord: (id, data) => client.put(`${API_PREFIX}/hindering-records/${id}`, data),
    deleteHinderingRecord: (id) => client.delete(`${API_PREFIX}/hindering-records/${id}`),
    updateHinderingRecordStatus: (id, status) => client.patch(`${API_PREFIX}/hindering-records/${id}/status`, { status }),


    // Labour Rates
    getLabourRates: () => client.get(`${API_PREFIX}/labour-rates`),
    getLabourRate: (id) => client.get(`${API_PREFIX}/labour-rates/${id}`),
    createLabourRate: (data) => client.post(`${API_PREFIX}/labour-rates/save`, data),
    updateLabourRate: (id, data) => client.put(`${API_PREFIX}/labour-rates/labour/${id}`, data),
    deleteLabourRate: (id) => client.delete(`${API_PREFIX}/labour-rates/labour/${id}`),
    updateLabourFacility: (id, data) => client.put(`${API_PREFIX}/labour-rates/facility/${id}`, data),
    deleteLabourFacility: (id) => client.delete(`${API_PREFIX}/labour-rates/facility/${id}`),


    // Project Budgets
    getProjectBudgets: () => client.get(`${API_PREFIX}/project-budgets`),
    getProjectBudget: (id) => client.get(`${API_PREFIX}/project-budgets/${id}`),
    createProjectBudget: (data) => client.post(`${API_PREFIX}/project-budgets/create`, data),
    updateProjectBudget: (id, data) => client.put(`${API_PREFIX}/project-budgets/${id}`, data),
    deleteProjectBudget: (id) => client.delete(`${API_PREFIX}/project-budgets/${id}`),

    // Bill Inwards
    getBillInwards: () => client.get(`${API_PREFIX}/bill-inwards`),
    getBillInward: (id) => client.get(`${API_PREFIX}/bill-inwards/${id}`),
    createBillInward: (data) => client.post(`${API_PREFIX}/bill-inwards/create`, data),
    updateBillInward: (id, data) => client.put(`${API_PREFIX}/bill-inwards/${id}`, data),
    deleteBillInward: (id) => client.delete(`${API_PREFIX}/bill-inwards/${id}`),

    // Contractor Compliances
    getContractorCompliances: () => client.get(`${API_PREFIX}/contractor-compliances`),
    getContractorCompliance: (id) => client.get(`${API_PREFIX}/contractor-compliances/${id}`),
    createContractorCompliance: (data) => client.post(`${API_PREFIX}/contractor-compliances`, data),
    updateContractorCompliance: (id, data) => client.put(`${API_PREFIX}/contractor-compliances/${id}`, data),
    deleteContractorCompliance: (id) => client.delete(`${API_PREFIX}/contractor-compliances/${id}`),
    createContractorComplianceItem: (complianceId, data) => client.post(`${API_PREFIX}/contractor-compliances/${complianceId}/items`, data),
    updateContractorComplianceItemStatus: (complianceId, itemId, data) => client.patch(`${API_PREFIX}/contractor-compliances/${complianceId}/items/${itemId}/status`, data),

    // Tender Work Orders
    getTenderWorkOrders: () => client.get(`${API_PREFIX}/tenders/work-order/all`),
    createTenderWorkOrder: (data) => client.post(`${API_PREFIX}/tenders/work-order/create`, data),
    updateTenderWorkOrder: (id, data) => client.put(`${API_PREFIX}/tenders/work-order/${id}`, data),
    deleteTenderWorkOrder: (id) => client.delete(`${API_PREFIX}/tenders/work-order/${id}`),
    getTenderApplicants: (tenderId) => client.get(`${API_PREFIX}/tenders/${tenderId}/applicants`),

    // Indents
    getIndentMasterData: () => client.get(`${API_PREFIX}/indents/master-data`),
    saveIndentEntry: (data) => client.post(`${API_PREFIX}/indents/save`, data),
    getIndentHistory: (params) => client.get(`${API_PREFIX}/indents/history`, { params }),
    updateIndentStatus: (id, status) => client.put(`${API_PREFIX}/indents/status/${id}`, { status }),
    updateIndent: (id, data) => client.put(`${API_PREFIX}/indents/${id}`, data),
    deleteIndent: (id) => client.delete(`${API_PREFIX}/indents/${id}`),
    // Indent Categories and Products
    createCategory: (data) => client.post(`${API_PREFIX}/categories`, data),
    createProduct: (data) => client.post(`${API_PREFIX}/products`, data),

    // Work Diary
    getProjectSetups: () => client.get(`${API_PREFIX}/work-diary/project-setup`),
    getProjectSetup: (id) => client.get(`${API_PREFIX}/work-diary/project-setup/${id}`),
    createProjectSetup: (data) => client.post(`${API_PREFIX}/work-diary/project-setup`, data),
    updateProjectSetup: (id, data) => client.put(`${API_PREFIX}/work-diary/project-setup/${id}`, data),
    deleteProjectSetup: (id) => client.delete(`${API_PREFIX}/work-diary/project-setup/${id}`),

    getLabourDetails: () => client.get(`${API_PREFIX}/work-diary/labour-details`),
    getLabourDetail: (id) => client.get(`${API_PREFIX}/work-diary/labour-details/${id}`),
    createLabourDetails: (data) => client.post(`${API_PREFIX}/work-diary/labour-details`, data),
    updateLabourDetails: (id, data) => client.put(`${API_PREFIX}/work-diary/labour-details/${id}`, data),
    deleteLabourDetails: (id) => client.delete(`${API_PREFIX}/work-diary/labour-details/${id}`),

    getToolsPlants: () => client.get(`${API_PREFIX}/work-diary/tools-plants`),
    getToolsPlant: (id) => client.get(`${API_PREFIX}/work-diary/tools-plants/${id}`),
    createToolsPlants: (data) => client.post(`${API_PREFIX}/work-diary/tools-plants`, data),
    updateToolsPlants: (id, data) => client.put(`${API_PREFIX}/work-diary/tools-plants/${id}`, data),
    deleteToolsPlants: (id) => client.delete(`${API_PREFIX}/work-diary/tools-plants/${id}`),

    getStagePassings: () => client.get(`${API_PREFIX}/work-diary/stage-passings`),
    getStagePassing: (id) => client.get(`${API_PREFIX}/work-diary/stage-passings/${id}`),
    createStagePassing: (data) => client.post(`${API_PREFIX}/work-diary/stage-passings`, data),
    updateStagePassing: (id, data) => client.put(`${API_PREFIX}/work-diary/stage-passings/${id}`, data),
    deleteStagePassing: (id) => client.delete(`${API_PREFIX}/work-diary/stage-passings/${id}`),

    getDailyReports: () => client.get(`${API_PREFIX}/work-diary/daily-reports`),
    getDailyReport: (id) => client.get(`${API_PREFIX}/work-diary/daily-reports/${id}`),
    createDailyReport: (data) => client.post(`${API_PREFIX}/work-diary/daily-reports`, data),
    updateDailyReport: (id, data) => client.put(`${API_PREFIX}/work-diary/daily-reports/${id}`, data),
    deleteDailyReport: (id) => client.delete(`${API_PREFIX}/work-diary/daily-reports/${id}`),

    // Raw Materials
    getRawMaterials: () => client.get(`${API_PREFIX}/work-diary/raw-materials`),
    createRawMaterial: (data) => client.post(`${API_PREFIX}/work-diary/raw-materials`, data),
    updateRawMaterial: (id, data) => client.put(`${API_PREFIX}/work-diary/raw-materials/${id}`, data),
    deleteRawMaterial: (id) => client.delete(`${API_PREFIX}/work-diary/raw-materials/${id}`),

//Bill of Quantities
    getBOQItems: () => client.get(`${API_PREFIX}/document-managements`),
    createBOQItem: (data) => client.post(`${API_PREFIX}/document-managements`, data),
    updateBOQItem: (id, data) => client.put(`${API_PREFIX}/document-managements/${id}`, data),
    deleteBOQItem: (id) => client.delete(`${API_PREFIX}/document-managements/${id}`),
    updateDocument: (id, data) => client.put(`${API_PREFIX}/document-managements/${id}/items`, data),
    addApproval: (id, data) => client.post(`${API_PREFIX}/document-managements/${id}/approve`, data),
    uploadAttachment: (id, data) => client.post(`${API_PREFIX}/document-managements/${id}/attachments`, data),
    deleteAttachment: (documentId, attachmentId) => client.delete(`${API_PREFIX}/tenant/document-managements/${documentId}/attachments/${attachmentId}`),
};


export default operationApi;
