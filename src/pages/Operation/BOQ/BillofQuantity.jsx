import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileText,
  Users,
  Search,
  Loader2,
  Save,
  X,
  Crown,
  UserCheck,
  UserPlus,
  Paperclip,
  Download,
  Eye,
} from "lucide-react";
import operationApi from "../../../api/operation";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const Bill = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [subletting, setSubletting] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedContractor, setExpandedContractor] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contractors, setContractors] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const [apts, comms, plots, dup, tri, custom] = await Promise.all([
          operationApi.getApartments(),
          operationApi.getCommercials(),
          operationApi.getPlottings(),
          operationApi.getDuplexes(),
          operationApi.getTriplexes(),
          operationApi.getCustomProjects(),
        ]);

        const allProjects = [
          ...(apts.data.data || []),
          ...(comms.data.data || []),
          ...(plots.data.data || []),
          ...(dup.data.data || []),
          ...(tri.data.data || []),
          ...(custom.data.data || []),
        ].map((p) => ({
          id: p.id,
          name: p.project_name || p.name,
        }));

        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching BOQ projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const demoSublettingNames = [
    "Land scaled",
    "Tree cutting",
    "Earth work",
    "Concrete",
    "Brick Work",
    "Stone masonary",
    "Wood Work",
    "Hardware",
    " Plumbing",
    "Roof treatment",
    "Floring specification",
    "Glazing",
    "Landscape Development",
    "Marble Flooring",
    "Road and draining",
    "Fire extinguisher",
    "Painting Work",
    "Quarry Tile Work",
    "Rain water harvesting",
    "Elctrical",
    "Lift and other mechanicals",
    "Ventilation System",
    "Ciling and Wall Lining",
    "Demolation & Dismanting",
    "Stand By Generate and allied Services",
  ];

  const [demoItems, setDemoItems] = useState(
    demoSublettingNames.map((name, idx) => ({
      id: idx + 1,
      contractors: [],
      name,
      fields: [
        {
          label: "Benchmark Price",
          key: "benchmarkPrice",
          value: "",
          unit: "",
        },
        { label: "Quoted Price", key: "quotedPrice", value: "", unit: "" },
        { label: "Final Price", key: "finalPrice", value: "", unit: "" },
        { label: "Quantity", key: "quantity", value: "", unit: "unit" },
        { label: "File", key: "file", value: "", unit: "", file: null },
      ],
      saved: false,
      editing: false,
    })),
  );

  const handleFileUpload = (itemId, fieldIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      setDemoItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const newFields = [...item.fields];
            newFields[fieldIndex] = {
              ...newFields[fieldIndex],
              value: file.name,
              file: file,
            };
            return { ...item, fields: newFields };
          }
          return item;
        }),
      );

      Swal.fire(
        "Success!",
        `File "${file.name}" has been uploaded.`,
        "success",
      );
    }
  };

  const removeFile = (itemId, fieldIndex) => {
    setDemoItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newFields = [...item.fields];
          newFields[fieldIndex] = {
            ...newFields[fieldIndex],
            value: "",
            file: null,
          };
          return { ...item, fields: newFields };
        }
        return item;
      }),
    );
  };

  const handleFileAction = (itemId, fieldIndex) => {
    const item = demoItems.find((item) => item.id === itemId);
    if (item) {
      const field = item.fields[fieldIndex];
      if (field.file) {
        const fileUrl = URL.createObjectURL(field.file);

        if (
          field.file.type.includes("image") ||
          field.file.type.includes("pdf")
        ) {
          window.open(fileUrl, "_blank");
        } else {
          const link = document.createElement("a");
          link.href = fileUrl;
          link.download = field.file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
      }
    }
  };

  const openContractorSelection = async (itemId, contractorIndex = 0) => {
    if (!projectName) {
      Swal.fire(
        "Info",
        "Please select a project first to view contractors.",
        "info",
      );
      return;
    }

    const availableContractors = [
      ...principalContractors,
      ...normalContractors,
    ];

    if (availableContractors.length === 0) {
      Swal.fire(
        "Info",
        "No contractors available for the selected project.",
        "info",
      );
      return;
    }

    const { value: selectedContractorId } = await Swal.fire({
      title: "Select Contractor",
      width: "500px",
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 mb-4">Choose a contractor for this work item:</p>
          <select id="contractor-select" class="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">-- Select Contractor --</option>
            ${
              principalContractors.length > 0
                ? `
              <optgroup label="Principal Contractors" class="text-blue-600 font-semibold">
                ${principalContractors.map((c) => `<option value="${c.id}" class="text-blue-700">${c.name}</option>`).join("")}
              </optgroup>
            `
                : ""
            }
            ${
              normalContractors.length > 0
                ? `
              <optgroup label="Sub-Contractors" class="text-gray-600">
                ${normalContractors.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
              </optgroup>
            `
                : ""
            }
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Select",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-lg shadow-lg",
        confirmButton: "bg-blue-600 text-white px-4 py-2 rounded text-sm",
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded text-sm",
      },
      preConfirm: () => {
        const select = document.getElementById("contractor-select");
        return select.value;
      },
    });

    if (selectedContractorId) {
      const selectedContractor = availableContractors.find(
        (c) => c.id.toString() === selectedContractorId,
      );
      if (selectedContractor) {
        setDemoItems((prev) =>
          prev.map((item) => {
            if (item.id === itemId) {
              const newContractors = [...item.contractors];
              newContractors[contractorIndex] = selectedContractor.name;
              return { ...item, contractors: newContractors };
            }
            return item;
          }),
        );
      }
    }
  };

  const handleDemoFieldChange = (itemId, fieldType, value, index = 0) => {
    setDemoItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (fieldType === "field") {
            const newFields = [...item.fields];
            newFields[index] = { ...newFields[index], value };
            return { ...item, fields: newFields };
          } else if (fieldType === "unit") {
            const newFields = [...item.fields];
            newFields[index] = { ...newFields[index], unit: value };
            return { ...item, fields: newFields };
          }
        }
        return item;
      }),
    );
  };

  const addContractor = (itemId) => {
    setDemoItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, contractors: [...item.contractors, ""] }
          : item,
      ),
    );
  };

  const removeContractor = (itemId, contractorIndex) => {
    setDemoItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              contractors: item.contractors.filter(
                (_, idx) => idx !== contractorIndex,
              ),
            }
          : item,
      ),
    );
  };

  const addCustomField = (itemId) => {
    const newField = {
      label: `Custom Field ${Math.floor(Math.random() * 1000)}`,
      key: `custom_${Date.now()}`,
      value: "",
      unit: "unit",
    };

    setDemoItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, fields: [...item.fields, newField] }
          : item,
      ),
    );
  };

  const removeField = (itemId, fieldIndex) => {
    setDemoItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              fields: item.fields.filter((_, idx) => idx !== fieldIndex),
            }
          : item,
      ),
    );
  };

  useEffect(() => {
    setLoading(true);
    operationApi
      .getContractors()
      .then((res) => {
        const list = res.data?.contractors || [];
        setContractors(list.map((c) => ({ ...c, type: c.type || "normal" })));
        setEmployers(list.map((c) => ({ ...c, type: c.type || "normal" })));
      })
      .catch((err) => {
        console.error("failed to load contractors", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!projectName) {
      setEmployers(contractors);
    } else {
      let filtered = contractors.filter((c) => c.project_name === projectName);
      if (filtered.length === 0) {
        filtered = contractors;
      }
      setEmployers(filtered);
    }
    setSelectedEmployer("");
    setSubletting([]);
  }, [projectName, contractors]);

  const fetchBOQItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await operationApi.getBOQItems();
      console.debug("getBOQItems response:", res?.data ?? res);
      const items = res.data?.data || res.data || [];

      const selectedContractorObj = contractors.find(
        (c) => c.id.toString() === selectedEmployer.toString(),
      );
      const selectedContractorName = selectedContractorObj
        ? selectedContractorObj.name
        : "";

      const filtered = items.filter((item) => {
        const itemProjName =
          item.project_name || item.projectName || item.project;
        const itemContractor =
          item.contractor_name || item.contractorName || item.contractor;

        const matchProject =
          !projectName ||
          (itemProjName &&
            itemProjName.toString().toLowerCase() ===
              projectName.toString().toLowerCase());
        const matchContractor =
          !selectedContractorName ||
          (itemContractor &&
            itemContractor.toString().toLowerCase() ===
              selectedContractorName.toString().toLowerCase());

        return matchProject && matchContractor;
      });

      const mapped = filtered.map((item) => {
        let fields = item.fields || item.items || [];
        if (fields.length === 0) {
          fields = [
            {
              label: "Benchmark Price",
              key: "benchmarkPrice",
              value: item.benchmark_price || item.benchmarkPrice || 0,
              unit: item.unit || "",
            },
            {
              label: "Quoted Price",
              key: "quotedPrice",
              value: item.quoted_price || item.quotedPrice || 0,
              unit: item.unit || "",
            },
            {
              label: "Final Price",
              key: "finalPrice",
              value: item.final_price || item.finalPrice || 0,
              unit: item.unit || "",
            },
            {
              label: "Quantity",
              key: "quantity",
              value: item.quantity || 0,
              unit: item.unit || "unit",
            },
          ];
        }

        const attachments = item.attachments || [];

        return {
          id: item.id || item._id,
          contractor: item.contractor || selectedContractorName,
          name: item.name || item.title || "BOQ Item",
          category: item.category || "General",
          description: item.description || "",
          fields: fields,
          editing: false,
          status:
            item.status === "approved" ||
            item.status === "rejected" ||
            item.status === "pending"
              ? item.status
              : "pending",
          attachments: attachments,
        };
      });

      setSubletting(mapped);
    } catch (error) {
      console.error("Error fetching BOQ items:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployer, projectName, contractors]);

  useEffect(() => {
    fetchBOQItems();
  }, [fetchBOQItems]);

  const filteredSubletting = subletting.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const groupedByContractor = filteredSubletting.reduce((acc, item) => {
    if (!acc[item.contractor]) acc[item.contractor] = [];
    acc[item.contractor].push(item);
    return acc;
  }, {});

  const toggleContractor = (contractor) => {
    setExpandedContractor(
      expandedContractor === contractor ? null : contractor,
    );
  };

  const toggleItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const toggleDemoItemEdit = (id) => {
    setDemoItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, editing: !item.editing } : item,
      ),
    );
  };

  const handleFieldChange = (itemId, fieldKey, value) => {
    setSubletting((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              fields: item.fields.map((f) =>
                f.key === fieldKey ? { ...f, value: Number(value) } : f,
              ),
            }
          : item,
      ),
    );
  };

  const deleteSublettingItem = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await operationApi.deleteBOQItem(id);
        Swal.fire("Deleted!", "Subletting item has been deleted.", "success");
        if (expandedItem === id) setExpandedItem(null);
        await fetchBOQItems();
      } catch (error) {
        console.error("Error deleting BOQ item:", error);
        Swal.fire("Error", "Failed to delete item from the server.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const addNewSublettingItem = async () => {
    const availableContractors = [
      ...principalContractors,
      ...normalContractors,
    ];
    const contractorOptions = availableContractors
      .map((c) => `<option value="${c.name}">${c.name}</option>`)
      .join("");

    const { value: formValues } = await Swal.fire({
      width: "500px",
      title: "Add Custom BOQ Item",
      html: `
        <div style="display: flex; flex-direction: column; gap: 8px;" class="text-left">
          <label class="text-xs font-semibold text-gray-600">Contractor Name *</label>
          <select id="swal-contractor" class="swal2-input style-select" style="margin: 0; width: 100%; height: 38px; font-size: 14px; border-radius: 6px;">
            <option value="">-- Select Contractor --</option>
            ${contractorOptions}
          </select>
          
          <label class="text-xs font-semibold text-gray-600 mt-2">Work Item Name *</label>
          <input id="swal-name" class="swal2-input" placeholder="Work Item Name" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
          
          <label class="text-xs font-semibold text-gray-600 mt-2">Category</label>
          <input id="swal-category" class="swal2-input" placeholder="Category" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
          
          <label class="text-xs font-semibold text-gray-600 mt-2">Description</label>
          <input id="swal-description" class="swal2-input" placeholder="Description" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
          
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label class="text-xs font-semibold text-gray-600">Benchmark Price</label>
              <input id="swal-benchmark" class="swal2-input" placeholder="0" type="number" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Quoted Price</label>
              <input id="swal-quoted" class="swal2-input" placeholder="0" type="number" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-2 mt-2">
            <div class="col-span-2">
              <label class="text-xs font-semibold text-gray-600">Final Price</label>
              <input id="swal-final" class="swal2-input" placeholder="0" type="number" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Unit</label>
              <input id="swal-unit" class="swal2-input" placeholder="e.g. m³, kg" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
            </div>
          </div>
          
          <label class="text-xs font-semibold text-gray-600 mt-2">Quantity</label>
          <input id="swal-quantity" class="swal2-input" placeholder="0" type="number" style="margin: 0; width: 100%; height: 36px; font-size: 14px; border-radius: 6px;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-lg shadow-lg",
        confirmButton:
          "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm",
        cancelButton:
          "bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm",
      },
      preConfirm: () => {
        const contractor = document.getElementById("swal-contractor").value;
        const name = document.getElementById("swal-name").value;
        if (!contractor) {
          Swal.showValidationMessage("Contractor is required");
          return false;
        }
        if (!name) {
          Swal.showValidationMessage("Work item name is required");
          return false;
        }
        return {
          contractor,
          name,
          category: document.getElementById("swal-category").value,
          description: document.getElementById("swal-description").value,
          benchmark: document.getElementById("swal-benchmark").value,
          quoted: document.getElementById("swal-quoted").value,
          final: document.getElementById("swal-final").value,
          quantity: document.getElementById("swal-quantity").value,
          unit: document.getElementById("swal-unit").value,
        };
      },
    });

    if (!formValues) return;

    try {
      setLoading(true);
      const postData = {
        project_name: projectName || "Unassigned Project",
        project_id: projects.find((p) => p.name === projectName)?.id || null,
        project_type:
          projects.find((p) => p.name === projectName)?.type || "null",
        employee_id:
          contractors.find((c) => c.name === formValues.contractor)?.id || null,
        contractor: formValues.contractor,
        name: formValues.name,
        category: formValues.category || "General",
        description: formValues.description || "",
        status: "pending",
        item: [
          {
            label: "Benchmark Price",
            key: "benchmarkPrice",
            value: Number(formValues.benchmark) || 0,
            unit: "",
          },
          {
            label: "Quoted Price",
            key: "quotedPrice",
            value: Number(formValues.quoted) || 0,
            unit: "",
          },
          {
            label: "Final Price",
            key: "finalPrice",
            value: Number(formValues.final) || 0,
            unit: "",
          },
          {
            label: "Quantity",
            key: "quantity",
            value: Number(formValues.quantity) || 0,
            unit: formValues.unit || "unit",
          },
        ],
      };

      await operationApi.createBOQItem(postData);
      Swal.fire("Added!", "Custom BOQ item created on server.", "success");
      await fetchBOQItems();
    } catch (error) {
      console.error("Error creating custom BOQ item:", error);
      Swal.fire(
        "Error",
        "Failed to create custom BOQ item on server.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveDemoItem = async (item) => {
    try {
      setLoading(true);
      const activeContractors = item.contractors.filter((c) => c.trim());
      if (activeContractors.length === 0) {
        Swal.fire(
          "Warning",
          "Please select at least one contractor.",
          "warning",
        );
        return;
      }

      for (const contractorName of activeContractors) {
        const payloadFields = item.fields.map((field) => ({
          label: field.label,
          key: field.key,
          value: Number(field.value) || 0,
          unit: field.unit || "",
        }));

        const postData = {
          project_name: projectName || "Unassigned Project",
          contractor: contractorName,
          name: item.name,
          category: "General",
          description: "",
          status: "pending",
          item: payloadFields,
        };

        const createRes = await operationApi.createBOQItem(postData);
        const newBOQItem = createRes.data?.data || createRes.data;
        const newId = newBOQItem?.id || newBOQItem?._id;

        const fileField = item.fields.find((f) => f.key === "file");
        if (fileField && fileField.file && newId) {
          const formData = new FormData();
          formData.append("file", fileField.file);
          await operationApi.uploadAttachment(newId, formData);
        }
      }

      Swal.fire(
        "Saved!",
        `${item.name} has been assigned and saved on the server.`,
        "success",
      );

      setDemoItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, editing: false, saved: true } : i,
        ),
      );

      await fetchBOQItems();
    } catch (error) {
      console.error("Error saving BOQ item:", error);
      Swal.fire("Error", "Failed to save BOQ item to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItemChanges = async (item) => {
    try {
      setLoading(true);
      const updatedFields = item.fields.map((f) => ({
        label: f.label,
        key: f.key,
        value: Number(f.value) || 0,
        unit: f.unit || "",
      }));

      await operationApi.updateDocument(item.id, updatedFields);

      await operationApi.updateBOQItem(item.id, {
        name: item.name,
        category: item.category,
        description: item.description,
        item: updatedFields,
        status:
          item.status === "approved" ||
          item.status === "rejected" ||
          item.status === "pending"
            ? item.status
            : "pending",
      });

      Swal.fire("Success", "BOQ Item pricing updated successfully.", "success");
      await fetchBOQItems();
    } catch (error) {
      console.error("Error saving BOQ changes:", error);
      Swal.fire("Error", "Failed to save changes to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentApproverId = () => {
    if (!user) return null;
    const id =
      user.user_id || user.id || user.userId || user.uid || user.employee_id;
    return Number(id) || null;
  };

  const handleApproveItem = async (item) => {
    const approverId = getCurrentApproverId();
    if (!approverId) {
      Swal.fire(
        "Error",
        "Unable to determine current approver ID for approval.",
        "error",
      );
      return;
    }

    try {
      setLoading(true);
      await operationApi.addApproval(item.id, {
        approved_by: approverId,
        timestamp: new Date().toISOString(),
      });
      await operationApi.updateBOQItem(item.id, {
        ...item,
        status: "approved",
      });

      Swal.fire(
        "Approved!",
        "This BOQ Item has been successfully approved.",
        "success",
      );
      await fetchBOQItems();
    } catch (error) {
      console.error("Error approving BOQ item:", error);
      Swal.fire("Error", "Failed to approve BOQ item.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadItemAttachment = async (itemId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      await operationApi.uploadAttachment(itemId, formData);
      Swal.fire(
        "Success",
        `File "${file.name}" uploaded successfully.`,
        "success",
      );
      await fetchBOQItems();
    } catch (error) {
      console.error("Error uploading attachment:", error);
      Swal.fire("Error", "Failed to upload attachment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItemAttachment = async (itemId, attachmentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Remove this attachment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await operationApi.deleteAttachment(itemId, attachmentId);
        Swal.fire("Deleted!", "Attachment has been removed.", "success");
        await fetchBOQItems();
      } catch (error) {
        console.error("Error deleting attachment:", error);
        Swal.fire("Error", "Failed to delete attachment.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewAttachment = (attachment) => {
    const url =
      attachment.url ||
      attachment.file_url ||
      attachment.fileUrl ||
      attachment.filePath ||
      attachment.path;
    if (url) {
      window.open(url, "_blank");
      return;
    }

    Swal.fire(
      "Unable to open attachment",
      "The attachment does not have a valid URL.",
      "warning",
    );
  };

  const calculateTotal = (item) => {
    const fields = item.fields || item.item || [];
    const final = fields.find((f) => f.key === "finalPrice")?.value || 0;
    const qty = fields.find((f) => f.key === "quantity")?.value || 0;
    return final * qty;
  };

  const calculateSavings = (item) => {
    const fields = item.fields || item.item || [];
    const benchmark =
      fields.find((f) => f.key === "benchmarkPrice")?.value || 0;
    const final = fields.find((f) => f.key === "finalPrice")?.value || 0;
    const qty = fields.find((f) => f.key === "quantity")?.value || 0;
    return (benchmark - final) * qty;
  };

  const principalContractors = employers.filter(
    (emp) => emp.type === "principal",
  );
  const normalContractors = employers.filter((emp) => emp.type === "normal");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <select
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Contractors
              </label>
              <select
                value={selectedEmployer}
                onChange={(e) => setSelectedEmployer(e.target.value)}

                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select Contractor --</option>

                {principalContractors.length > 0 && (
                  <optgroup
                    label="Principal Contractors"
                    className="text-blue-600 font-semibold"
                  >
                    {principalContractors.map((e) => (
                      <option key={e.id} value={e.id} className="text-blue-700">
                        {e.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {normalContractors.length > 0 && (
                  <optgroup label="Sub-Contractors" className="text-gray-600">
                    {normalContractors.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              Loading project data...
            </span>
          </div>
        )}

        {!loading && (selectedEmployer || subletting.length > 0) && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={addNewSublettingItem}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
                  >
                    <Plus size={20} />
                    Add Custom Item
                  </button>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {subletting.length} assigned items •{" "}
                    {Object.keys(groupedByContractor).length} contractors
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search items or contractors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {Object.keys(groupedByContractor).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Assigned Subletting Items
                </h3>

                {Object.keys(groupedByContractor).map((contractor) => (
                  <div
                    key={contractor}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {contractor}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {groupedByContractor[contractor].length} items • ₹
                            {groupedByContractor[contractor]
                              .reduce(
                                (sum, item) => sum + calculateTotal(item),
                                0,
                              )
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleContractor(contractor)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                      >
                        {expandedContractor === contractor ? (
                          <ChevronUp className="text-gray-500" />
                        ) : (
                          <ChevronDown className="text-gray-500" />
                        )}
                      </button>
                    </div>

                    {expandedContractor === contractor && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        {groupedByContractor[contractor].map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-gray-100 dark:border-gray-600 last:border-b-0 p-6"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium text-gray-800 dark:text-white text-lg">
                                    {item.name}
                                  </h4>
                                  {item.status === "approved" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                      <UserCheck size={12} /> Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                      Active
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    deleteSublettingItem(item.id, item.name)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={() => toggleItem(item.id)}
                                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                >
                                  {expandedItem === item.id ? (
                                    <ChevronUp className="text-gray-500" />
                                  ) : (
                                    <ChevronDown className="text-gray-500" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {expandedItem === item.id && (
                              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-6">
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    Pricing & Quantities
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {item.fields.map((field) => (
                                      <div key={field.key}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {field.label}
                                        </label>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            value={field.value}
                                            onChange={(e) =>
                                              handleFieldChange(
                                                item.id,
                                                field.key,
                                                e.target.value,
                                              )
                                            }
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                          {(field.key === "quantity" ||
                                            field.key.startsWith(
                                              "custom_",
                                            )) && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                              {field.unit}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Attachments & Documents
                                    </h5>
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors duration-150">
                                      <Paperclip size={12} />
                                      Upload Document
                                      <input
                                        type="file"
                                        onChange={(e) =>
                                          handleUploadItemAttachment(item.id, e)
                                        }
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                      />
                                    </label>
                                  </div>

                                  {item.attachments &&
                                  item.attachments.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                      {item.attachments.map((att) => (
                                        <div
                                          key={att.id || att._id}
                                          className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        >
                                          <div className="flex items-center gap-2 truncate flex-1">
                                            <Paperclip className="h-4 w-4 text-blue-500 shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                                              {att.name ||
                                                att.file_name ||
                                                att.fileName ||
                                                "Document"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 ml-2">
                                            <button
                                              onClick={() =>
                                                handleViewAttachment(att)
                                              }
                                              title="View document"
                                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-750 text-blue-600 dark:text-blue-400 rounded"
                                            >
                                              <Eye size={14} />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteItemAttachment(
                                                  item.id,
                                                  att.id || att._id,
                                                )
                                              }
                                              title="Remove attachment"
                                              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded"
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      No attachments uploaded yet.
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 dark:border-gray-600 gap-4">
                                  <div className="text-sm">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                      Total: ₹
                                      {calculateTotal(item).toLocaleString()}
                                    </span>
                                    {calculateSavings(item) > 0 && (
                                      <span className="ml-4 text-green-600">
                                        Savings: ₹
                                        {calculateSavings(
                                          item,
                                        ).toLocaleString()}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    {item.status !== "approved" && (
                                      <button
                                        onClick={() => handleApproveItem(item)}
                                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                      >
                                        <UserCheck size={16} /> Approve Item
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        handleSaveItemChanges(item)
                                      }
                                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                      <Save size={16} /> Save Changes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Subletting Items ({demoItems.length})
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {demoItems.filter((item) => item.saved).length} saved
                </div>
              </div>

              <div className="space-y-4">
                {demoItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                        <span className="font-medium text-gray-800 dark:text-white">
                          {item.name}
                        </span>
                        {item.saved && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                            Saved
                          </span>
                        )}
                      </div>

                      {!item.editing ? (
                        <button
                          onClick={() => toggleDemoItemEdit(item.id)}
                          disabled={item.saved}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm"
                        >
                          <Plus size={14} />
                          {item.saved ? "Saved" : "Assign"}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleDemoItemEdit(item.id)}
                          className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {item.editing && (
                      <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Contractors
                            </label>
                            <button
                              onClick={() => addContractor(item.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                            >
                              <Plus size={12} />
                              Add Contractor
                            </button>
                          </div>

                          {item.contractors.map(
                            (contractor, contractorIndex) => (
                              <div
                                key={contractorIndex}
                                className="flex items-center gap-2"
                              >
                                <div className="flex-1">
                                  {contractor ? (
                                    <div className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                      <span className="text-green-700 dark:text-green-300 font-medium">
                                        {contractor}
                                      </span>
                                      <button
                                        onClick={() =>
                                          removeContractor(
                                            item.id,
                                            contractorIndex,
                                          )
                                        }
                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        openContractorSelection(
                                          item.id,
                                          contractorIndex,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-gray-600 dark:text-gray-300 flex items-center gap-2 justify-center"
                                    >
                                      <UserPlus size={14} />
                                      Select Contractor
                                    </button>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Pricing & Quantities
                            </label>
                            <button
                              onClick={() => addCustomField(item.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                            >
                              <Plus size={12} />
                              Add Field
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {item.fields.map((field, fieldIndex) => (
                              <div
                                key={fieldIndex}
                                className="flex items-end gap-2"
                              >
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    {field.label}
                                  </label>
                                  <div className="flex gap-2">
                                    {field.key === "file" ? (
                                      <div className="flex-1">
                                        {field.value ? (
                                          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                              <Paperclip className="h-4 w-4 text-blue-600" />
                                              <span className="text-sm text-blue-700 dark:text-blue-300 truncate max-w-37.5">
                                                {field.value}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() =>
                                                  handleFileAction(
                                                    item.id,
                                                    fieldIndex,
                                                  )
                                                }
                                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                              >
                                                <Eye size={14} />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  removeFile(
                                                    item.id,
                                                    fieldIndex,
                                                  )
                                                }
                                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                              >
                                                <X size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-gray-600 dark:text-gray-300 cursor-pointer">
                                            <Paperclip className="h-4 w-4" />
                                            <span className="text-sm">
                                              Upload File
                                            </span>
                                            <input
                                              type="file"
                                              onChange={(e) =>
                                                handleFileUpload(
                                                  item.id,
                                                  fieldIndex,
                                                  e,
                                                )
                                              }
                                              className="hidden"
                                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                            />
                                          </label>
                                        )}
                                      </div>
                                    ) : (
                                      <>
                                        <input
                                          type={
                                            field.key.includes("Price")
                                              ? "number"
                                              : "text"
                                          }
                                          placeholder="0"
                                          value={field.value}
                                          onChange={(e) =>
                                            handleDemoFieldChange(
                                              item.id,
                                              "field",
                                              e.target.value,
                                              fieldIndex,
                                            )
                                          }
                                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {(field.key === "quantity" ||
                                          field.key.startsWith("custom_")) && (
                                          <select
                                            value={field.unit}
                                            onChange={(e) =>
                                              handleDemoFieldChange(
                                                item.id,
                                                "unit",
                                                e.target.value,
                                                fieldIndex,
                                              )
                                            }
                                            className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                          >
                                            <option value="unit">unit</option>
                                            <option value="m²">m²</option>
                                            <option value="m³">m³</option>
                                            <option value="kg">kg</option>
                                            <option value="m">m</option>
                                            <option value="set">set</option>
                                          </select>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                                {fieldIndex >= 5 && field.key !== "file" && (
                                  <button
                                    onClick={() =>
                                      removeField(item.id, fieldIndex)
                                    }
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded mb-1"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => saveDemoItem(item)}
                            disabled={
                              item.contractors.length === 0 ||
                              item.contractors.every((c) => !c.trim())
                            }
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                          >
                            <Save size={16} />
                            Save Item
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bill;
