


































































































































































































































import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, FileText, Search, User } from "lucide-react";
import { jsPDF } from "jspdf";
import operationApi from "../../../api/operation";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const CreateWorkOrder = () => {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    contractor_id: "",
    to: "",
    address: "",
    pin: "",
    projectName: "",
    contractorName: "",
    workOrderDate: new Date().toISOString().split("T")[0],
    workCompletionDate: "",
    description: "",
    terms: "",
    tender_id: "",
    subject: "",
    note: "",
    terms_accepted: false,
    payment_terms_accepted: false,
    applicant_id: "",
  });

  const [items, setItems] = useState([
    { description: "", unit: "", quantity: 0, rate: 0, amount: 0, gst: 0, gstAmount: 0 },
  ]);

  const [showContractorDropdown, setShowContractorDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contractors, setContractors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [tenderApplicants, setTenderApplicants] = useState([]);
  const [loading, setLoading] = useState(false);


  const getApplicantId = () => {
    try {
      const activeToken = token || localStorage.getItem('token');
      if (activeToken) {
        const decoded = JSON.parse(atob(activeToken.split('.')[1]));
        return decoded.id || decoded.userId;
      }
    } catch (error) {
      console.log(error);
      console.warn("Could not extract user ID from token");
    }
    return null;
  };

  useEffect(() => {
    fetchAllData();
  }, []);


  useEffect(() => {
    if (formData.tender_id) {
      fetchTenderApplicants(formData.tender_id);
    } else {
      setTenderApplicants([]);
      setFormData(prev => ({ ...prev, applicant_id: "" }));
    }
  }, [formData.tender_id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [contRes, tendRes, apts, comms, plots, dup, tri, custom] = await Promise.all([
        operationApi.getContractors(),
        operationApi.getTenders(),
        operationApi.getApartments(),
        operationApi.getCommercials(),
        operationApi.getPlottings(),
        operationApi.getDuplexes(),
        operationApi.getTriplexes(),
        operationApi.getCustomProjects()
      ]);

      setContractors(contRes.data.contractors || []);
      setTenders(tendRes.data.data || []);
      

      const allProjects = [
        ...(apts.data.data || []),
        ...(comms.data.data || []),
        ...(plots.data.data || []),
        ...(dup.data.data || []),
        ...(tri.data.data || []),
        ...(custom.data.data || [])
      ].map(p => ({
        id: p.id,
        name: p.project_name || p.name,
        type: p.project_type || p.type
      }));
      
      setProjects(allProjects);
    } catch (error) {
      console.error("Error fetching work order data:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchTenderApplicants = async (tenderId) => {
    try {
      setLoading(true);
      const response = await operationApi.getTenderApplicants(tenderId);
      setTenderApplicants(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tender applicants:", error);
      Swal.fire("Error", "Failed to fetch tender applicants", "error");
      setTenderApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContractorSelect = (contractor) => {
    setFormData({
      ...formData,
      contractor_id: contractor.id,
      to: contractor.name,
      address: contractor.address || "",
      pin: contractor.pin || "",
      contractorName: contractor.contact_person || contractor.name
    });
    setShowContractorDropdown(false);
    setSearchTerm("");
  };

  const filteredContractors = contractors.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    const qty = parseFloat(updatedItems[index].quantity) || 0;
    const rate = parseFloat(updatedItems[index].rate) || 0;
    const gstPct = parseFloat(updatedItems[index].gst) || 0;
    const base = qty * rate;
    updatedItems[index].amount = base;
    updatedItems[index].gstAmount = +(base * (gstPct / 100) || 0);
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", unit: "", quantity: 0, rate: 0, amount: 0, gst: 0, gstAmount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const baseTotal = items.reduce((acc, item) => acc + (item.amount || 0), 0);
  const gstTotal = items.reduce((acc, item) => acc + (item.gstAmount || 0), 0);
  const totalAmount = baseTotal + gstTotal;

  const handleSave = async () => {
    if (!formData.contractor_id) {
      Swal.fire("Error", "Please select a contractor first!", "error");
      return;
    }
    
    if (!formData.subject) {
      Swal.fire("Error", "Please enter a subject for the work order!", "error");
      return;
    }

    if (!formData.tender_id) {
      Swal.fire("Error", "Please select a tender!", "error");
      return;
    }

    if (!formData.applicant_id) {
      Swal.fire("Error", "Please select an applicant for this tender!", "error");
      return;
    }

    if (!formData.terms_accepted) {
      Swal.fire("Error", "Please accept the terms and conditions!", "error");
      return;
    }

    if (!formData.payment_terms_accepted) {
      Swal.fire("Error", "Please accept the payment terms!", "error");
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        applicant_id: formData.applicant_id,
        tender_id: parseInt(formData.tender_id),
        subject: formData.subject,
        project_id: formData.projectName ? projects.find(p => p.name === formData.projectName)?.id : null,
        contractor_id: parseInt(formData.contractor_id),
        project_type: projects.find(p => p.name === formData.projectName)?.type || "null",
        note: formData.note,
        completion_date: formData.workCompletionDate,
        terms_accepted: formData.terms_accepted,
        payment_terms_accepted: formData.payment_terms_accepted,
        items: items.map(item => ({
          description: item.description,
          unit: item.unit,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0
        }))
      };

      await operationApi.createTenderWorkOrder(payload);
      Swal.fire("Success", "Work Order Saved Successfully!", "success");

      setFormData(prev => ({
        ...prev,
        contractor_id: "",
        to: "",
        address: "",
        pin: "",
        projectName: "",
        contractorName: "",
        workOrderDate: new Date().toISOString().split("T")[0],
        workCompletionDate: "",
        description: "",
        terms: "",
        tender_id: "",
        subject: "",
        note: "",
        terms_accepted: false,
        payment_terms_accepted: false,
        applicant_id: ""
      }));
      setItems([{ description: "", unit: "", quantity: 0, rate: 0, amount: 0, gst: 0, gstAmount: 0 }]);
      setTenderApplicants([]);
    } catch (error) {
      console.error("Error saving work order:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to save work order", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!formData.contractor_id) {
      Swal.fire("Error", "Please select a contractor first!", "error");
      return;
    }

    const doc = new jsPDF();
    let y = 15;


    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("CONSTRUCTION WORK ORDER", 105, y, { align: "center" });
    y += 10;
    doc.setDrawColor(37, 99, 235);
    doc.line(20, y, 190, y);
    y += 15;


    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text("CONTRACTOR DETAILS:", 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');

    const selectedContractor = contractors.find(
      (c) => c.id === parseInt(formData.contractor_id)
    );

    doc.text(`Company: ${formData.to || "-"}`, 20, y);
    y += 6;
    doc.text(`Contact Person: ${formData.contractorName || "-"}`, 20, y);
    y += 6;
    doc.text(`Address: ${formData.address || "-"}`, 20, y);
    y += 6;
    doc.text(`Pin Code: ${formData.pin || "-"}`, 20, y);
    if (selectedContractor && selectedContractor.vendor_code) {
      y += 6;
      doc.text(`VendorCode : ${selectedContractor.vendor_code}`, 20, y);
    }
    y += 12;


    doc.setFont(undefined, 'bold');
    doc.text("WORK ORDER INFORMATION:", 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`Project: ${formData.projectName || "-"}`, 20, y);
    y += 6;
    doc.text(`Work Order Date: ${formData.workOrderDate || "-"}`, 20, y);
    y += 6;
    doc.text(`Work Completion Date: ${formData.workCompletionDate || "-"}`, 20, y);
    y += 6;
    doc.text(`Description: ${formData.description || "-"}`, 20, y);
    
    if (formData.tender_id) {
      const selectedTender = tenders.find(t => t.id === parseInt(formData.tender_id));
      if (selectedTender) {
        y += 6;
        doc.text(`Link Tender: ${selectedTender.tender_title || selectedTender.title}`, 20, y);
      }
    }

    if (formData.applicant_id) {
      const selectedApplicant = tenderApplicants.find(a => a.id === parseInt(formData.applicant_id));
      if (selectedApplicant) {
        y += 6;
        doc.text(`Applicant: ${selectedApplicant.name || selectedApplicant.applicant_name}`, 20, y);
      }
    }
    y += 12;


    doc.setFont(undefined, 'bold');
    doc.text("S.No", 20, y);
    doc.text("Description", 40, y);
    doc.text("Qty", 110, y);
    doc.text("Rate (₹)", 135, y);
    doc.text("Amount (₹)", 155, y);
    doc.text("GST (₹)", 175, y);
    y += 6;
    doc.line(20, y, 190, y);
    y += 6;


    doc.setFont(undefined, 'normal');
    items.forEach((item, index) => {
      doc.text(`${index + 1}`, 22, y);
      doc.text(`${item.description || "-"}`, 40, y);
      doc.text(`${item.quantity}`, 110, y);
      doc.text(`${item.rate}`, 135, y);
      doc.text(`₹${(item.amount || 0).toFixed(2)}`, 155, y);
      doc.text(`₹${(item.gstAmount || 0).toFixed(2)}`, 175, y);
      y += 8;
    });


    y += 4;
    doc.line(20, y, 190, y);
    y += 8;
    doc.text(`Base Total: ₹${baseTotal.toFixed(2)}`, 120, y);
    y += 6;
    doc.text(`GST Total: ₹${gstTotal.toFixed(2)}`, 120, y);
    y += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: ₹${totalAmount.toFixed(2)}`, 120, y);


    y += 15;
    doc.setFont(undefined, 'bold');
    doc.text("TERMS & CONDITIONS:", 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    const termsText = formData.terms || "Standard construction terms and conditions apply.";
    const splitText = doc.splitTextToSize(termsText, 170);
    doc.text(splitText, 20, y);


    y += splitText.length * 6 + 20;
    doc.setFont(undefined, 'bold');
    doc.text("Authorized Signature", 150, y);
    doc.line(140, y + 2, 190, y + 2);

    doc.save(`work-order-${formData.to.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Construction Work Order
      </h2>


      <div className="grid md:grid-cols-2 gap-4 mb-6">

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Contractor *
          </label>
          <div className="relative">
            <div className="flex items-center gap-2">
              <Search className="text-gray-400 absolute left-3" size={18} />
              <input
                type="text"
                placeholder="Search contractors by name or contact person..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowContractorDropdown(true);
                }}
                onFocus={() => setShowContractorDropdown(true)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            {showContractorDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredContractors.length > 0 ? (
                  filteredContractors.map((contractor) => (
                    <div
                      key={contractor.id}
                      onClick={() => handleContractorSelect(contractor)}
                      className="p-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                          <User className="text-blue-600 dark:text-blue-300" size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {contractor.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Contact: {contractor.contact_person || "N/A"} • {contractor.phone || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {contractor.address || "No address provided"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No contractors found
                  </div>
                )}
              </div>
            )}
          </div>


          {formData.contractor_id && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-300">
                    Selected Contractor
                  </h4>
                  <p className="text-green-700 dark:text-green-400">
                    {formData.to} {formData.contractorName ? `• ${formData.contractorName}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      contractor_id: "",
                      to: "",
                      address: "",
                      pin: "",
                      contractorName: ""
                    }));
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>


        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link to Tender *
          </label>
          <select
            name="tender_id"
            value={formData.tender_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          >
            <option value="">Select a tender</option>
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.item || `Tender #${t.id}`}
              </option>
            ))}
          </select>
        </div>


        {formData.tender_id && tenderApplicants.length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Applicant *
            </label>
            <select
              name="applicant_id"
              value={formData.applicant_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Select an applicant</option>
              {tenderApplicants.map((applicant) => (
                <option key={applicant.id} value={applicant.id}>
                  {applicant.name || applicant.applicant_name || `Applicant #${applicant.id}`}
                </option>
              ))}
            </select>
          </div>
        )}


        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Enter work order subject"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contact Person
          </label>
          <input
            type="text"
            name="contractorName"
            value={formData.contractorName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-500"
            readOnly
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pin Code
          </label>
          <input
            type="text"
            name="pin"
            value={formData.pin}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-500"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name *
          </label>
          <select
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Work Order Date
          </label>
          <input
            type="date"
            name="workOrderDate"
            value={formData.workOrderDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Work Completion Date
          </label>
          <input
            type="date"
            name="workCompletionDate"
            value={formData.workCompletionDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Work Description *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Masonry, Electrical, Plumbing"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
      </div>


      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100">
          Work Items
        </h3>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 items-end bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            >
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Enter item description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bags, Liters"
                  value={item.unit}
                  onChange={(e) =>
                    handleItemChange(index, "unit", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rate
                </label>
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  readOnly
                  value={item.amount}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-500 dark:border-gray-400"
                />
              </div>

              <div className="col-span-1 flex items-end justify-center">
                <button
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <Plus size={18} /> Add New Item
        </button>
      </div>


      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Note
        </label>
        <textarea
          name="note"
          rows={3}
          value={formData.note}
          onChange={handleInputChange}
          placeholder="e.g., Delivery to be made at Sector 5 Warehouse. Gate pass required."
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>


      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Terms & Conditions
        </label>
        <textarea
          name="terms"
          rows={4}
          value={formData.terms}
          onChange={handleInputChange}
          placeholder="Enter any additional terms and conditions"
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>


      <div className="mb-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="terms_accepted"
            name="terms_accepted"
            checked={formData.terms_accepted}
            onChange={handleInputChange}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="terms_accepted" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            I accept the Terms & Conditions *
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="payment_terms_accepted"
            name="payment_terms_accepted"
            checked={formData.payment_terms_accepted}
            onChange={handleInputChange}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="payment_terms_accepted" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            I accept the Payment Terms *
          </label>
        </div>
      </div>


      <div className="flex justify-end items-center mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Estimated Total: ₹{totalAmount.toFixed(2)}
        </span>
      </div>


      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={!formData.contractor_id || loading}
          className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Save size={18} /> {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={downloadPDF}
          disabled={!formData.contractor_id}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <FileText size={18} /> Download PDF
        </button>
      </div>
    </div>
  );
};

export default CreateWorkOrder;

