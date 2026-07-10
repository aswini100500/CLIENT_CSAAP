import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Building2,
  ClipboardList,
  FileText,
  Save,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import ProjectOverview from "./ProjectOverview";
import operationApi from "../../../../api/operation";
import Swal from "sweetalert2";

const MainInfo = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    documentSubject: "",
    documentDate: new Date().toISOString().split("T")[0],
    attachment: null,
    roadArea: "",
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commonFacilities, setCommonFacilities] = useState([
    { id: 1, name: "", cost: "" },
  ]);
  const [constructionAreas, setConstructionAreas] = useState([]);
  const [saleableAreas, setSaleableAreas] = useState([]);
  const [landAreas, setLandAreas] = useState([]);
  const [submitted, setSubmitted] = useState(false);

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
  const calculateTotals = (areas) =>
    areas.reduce(
      (acc, area) => ({
        superBuiltupArea:
          acc.superBuiltupArea + (parseFloat(area.superBuiltupArea) || 0),
        superBuiltupBudget:
          acc.superBuiltupBudget + (parseFloat(area.superBuiltupBudget) || 0),
        builtupArea: acc.builtupArea + (parseFloat(area.builtupArea) || 0),
        builtupBudget:
          acc.builtupBudget + (parseFloat(area.builtupBudget) || 0),
        carpetArea: acc.carpetArea + (parseFloat(area.carpetArea) || 0),
        carpetBudget: acc.carpetBudget + (parseFloat(area.carpetBudget) || 0),
        financialArea:
          acc.financialArea + (parseFloat(area.financialArea) || 0),
      }),
      {
        superBuiltupArea: 0,
        superBuiltupBudget: 0,
        builtupArea: 0,
        builtupBudget: 0,
        carpetArea: 0,
        carpetBudget: 0,
        financialArea: 0,
      },
    );

  const constructionTotals = calculateTotals(constructionAreas);
  const saleableTotals = calculateTotals(saleableAreas);
  const totalConstructionBudget =
    constructionTotals.superBuiltupBudget +
    constructionTotals.builtupBudget +
    constructionTotals.carpetBudget;
  const totalSaleableBudget =
    saleableTotals.superBuiltupBudget +
    saleableTotals.builtupBudget +
    saleableTotals.carpetBudget;
  const profit = totalConstructionBudget - totalSaleableBudget;
  const profitRatio = totalConstructionBudget
    ? (profit / totalConstructionBudget) * 100
    : 0;
  const totalLandAreaCost = landAreas.reduce(
    (acc, a) =>
      acc +
      (parseFloat(a.landAreaCost) || 0) +
      (parseFloat(a.landDevelopmentCost) || 0) +
      (parseFloat(a.approvalCost) || 0),
    0,
  );

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleFacilityChange = (id, value) => {
    setCommonFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: value } : f)),
    );
  };

  const handleFacilityBudgetChange = (id, value) => {
    setCommonFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, cost: value } : f)),
    );
  };

  const addFacility = () => {
    setCommonFacilities((prev) => [
      ...prev,
      { id: Date.now(), name: "", cost: "" },
    ]);
  };

  const removeFacility = (id) => {
    setCommonFacilities((prev) => prev.filter((f) => f.id !== id));
  };

  const addConstructionArea = () => {
    const newArea = {
      id: Date.now(),
      financialYear: "",
      financialArea: "",
      superBuiltupArea: "",
      superBuiltupBudget: "",
      builtupArea: "",
      builtupBudget: "",
      carpetArea: "",
      carpetBudget: "",
    };
    setConstructionAreas((prev) => [...prev, newArea]);
  };

  const addSaleableArea = () => {
    const newArea = {
      id: Date.now(),
      financialYear: "",
      financialArea: "",
      superBuiltupArea: "",
      superBuiltupBudget: "",
      builtupArea: "",
      builtupBudget: "",
      carpetArea: "",
      carpetBudget: "",
    };
    setSaleableAreas((prev) => [...prev, newArea]);
  };

  const addConstructionAreaAtPosition = (index) => {
    const newArea = {
      id: Date.now(),
      financialYear: "",
      financialArea: "",
      superBuiltupArea: "",
      superBuiltupBudget: "",
      builtupArea: "",
      builtupBudget: "",
      carpetArea: "",
      carpetBudget: "",
    };
    setConstructionAreas((prev) => {
      const newAreas = [...prev];
      newAreas.splice(index + 1, 0, newArea);
      return newAreas;
    });
  };

  const addSaleableAreaAtPosition = (index) => {
    const newArea = {
      id: Date.now(),
      financialYear: "",
      financialArea: "",
      superBuiltupArea: "",
      superBuiltupBudget: "",
      builtupArea: "",
      builtupBudget: "",
      carpetArea: "",
      carpetBudget: "",
    };
    setSaleableAreas((prev) => {
      const newAreas = [...prev];
      newAreas.splice(index + 1, 0, newArea);
      return newAreas;
    });
  };

  const updateConstructionArea = (id, field, value) => {
    setConstructionAreas((prev) =>
      prev.map((area) => (area.id === id ? { ...area, [field]: value } : area)),
    );
  };

  const updateSaleableArea = (id, field, value) => {
    setSaleableAreas((prev) =>
      prev.map((area) => (area.id === id ? { ...area, [field]: value } : area)),
    );
  };

  const removeConstructionArea = (id) => {
    setConstructionAreas((prev) => prev.filter((area) => area.id !== id));
  };

  const removeSaleableArea = (id) => {
    setSaleableAreas((prev) => prev.filter((area) => area.id !== id));
  };

  const addLandArea = (insertIndex = landAreas.length) => {
    const newArea = {
      id: Date.now(),
      description: "",
      landAreaCost: "",
      landDevelopmentCost: "",
      approvalCost: "",
    };

    setLandAreas((prev) => {
      const newList = [...prev];
      newList.splice(insertIndex, 0, newArea);
      return newList;
    });
  };

  const updateLandArea = (id, field, value) => {
    setLandAreas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );
  };

  const removeLandArea = (id) => {
    setLandAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      selected_budget: formData.projectName,
      document_subject: formData.documentSubject,
      document_date: formData.documentDate,
      road_area: formData.roadArea,
      attachment: formData.attachment,
      common_facilities: commonFacilities.map((f) => ({
        name: f.name,
        cost: f.cost,
      })),
      construction_areas: constructionAreas.map((area) => ({
        financial_year: area.financialYear,
        super_builtup_area: area.superBuiltupArea,
        super_builtup_budget: area.superBuiltupBudget,
        builtup_area: area.builtupArea,
        builtup_budget: area.builtupBudget,
        carpet_area: area.carpetArea,
        carpet_budget: area.carpetBudget,
      })),
      saleable_areas: saleableAreas.map((area) => ({
        financial_year: area.financialYear,
        super_builtup_area: area.superBuiltupArea,
        super_builtup_budget: area.superBuiltupBudget,
        builtup_area: area.builtupArea,
        builtup_budget: area.builtupBudget,
        carpet_area: area.carpetArea,
        carpet_budget: area.carpetBudget,
      })),
      land_areas: landAreas.map((la) => ({
        description: la.description,
        land_area_cost: la.landAreaCost,
        land_development_cost: la.landDevelopmentCost,
        approval_cost: la.approvalCost,
      })),
      totals: {
        construction: {
          super_builtup_area: constructionTotals.superBuiltupArea,
          super_builtup_budget: constructionTotals.superBuiltupBudget,
          builtup_area: constructionTotals.builtupArea,
          builtup_budget: constructionTotals.builtupBudget,
          carpet_area: constructionTotals.carpetArea,
          carpet_budget: constructionTotals.carpetBudget,
        },
        saleable: {
          super_builtup_area: saleableTotals.superBuiltupArea,
          super_builtup_budget: saleableTotals.superBuiltupBudget,
          builtup_area: saleableTotals.builtupArea,
          builtup_budget: saleableTotals.builtupBudget,
          carpet_area: saleableTotals.carpetArea,
          carpet_budget: saleableTotals.carpetBudget,
        },
        profit,
        total_land_area_cost: totalLandAreaCost,
      },
    };

    try {
      setLoading(true);
      await operationApi.createProjectBudget(payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Project budget submitted successfully!",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting project budget:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Failed to submit project budget.",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Project Budget Details", 14, 20);

    const selectedProject = projects.find(
      (p) => p.name === formData.projectName,
    );
    const projectType = selectedProject ? selectedProject.type : "N/A";

    doc.setFontSize(12);
    doc.text(`Project: ${formData.projectName || "Not selected"}`, 14, 30);
    doc.text(`Project Type: ${projectType}`, 14, 37);
    doc.text(`Document Subject: ${formData.documentSubject}`, 14, 44);
    doc.text(`Document Date: ${formData.documentDate}`, 14, 51);

    let yOffset = 58;

    if (constructionAreas.length) {
      doc.text("Construction Areas:", 14, yOffset);
      yOffset += 7;
      constructionAreas.forEach((area, index) => {
        doc.text(
          `${index + 1}. Year: ${area.financialYear}, Super Built-up Area: ${area.superBuiltupArea}, Super Built-up Budget: ₹${area.superBuiltupBudget}, Built-up Area: ${area.builtupArea}, Built-up Budget: ₹${area.builtupBudget}, Carpet Area: ${area.carpetArea}, Carpet Budget: ₹${area.carpetBudget}`,
          14,
          yOffset,
        );
        yOffset += 7;
      });
    }

    if (landAreas.length) {
      yOffset += 5;
      doc.text("Land Areas:", 14, yOffset);
      yOffset += 7;
      landAreas.forEach((la, idx) => {
        doc.text(
          `${idx + 1}. ${la.description || "Land"}: Area Cost: ₹${la.landAreaCost || 0}, Development: ₹${la.landDevelopmentCost || 0}, Approval: ₹${la.approvalCost || 0}`,
          14,
          yOffset,
        );
        yOffset += 7;
      });
      yOffset += 5;
      doc.text(`Total Land Area Cost: ₹${totalLandAreaCost}`, 14, yOffset);
    }

    if (saleableAreas.length) {
      yOffset += 5;
      doc.text("Saleable Areas:", 14, yOffset);
      yOffset += 7;
      saleableAreas.forEach((area, index) => {
        doc.text(
          `${index + 1}. Year: ${area.financialYear}, Financial Area: ${area.financialArea}, Super Built-up Area: ${area.superBuiltupArea}, Super Built-up Budget: ₹${area.superBuiltupBudget}, Built-up Area: ${area.builtupArea}, Built-up Budget: ₹${area.builtupBudget}, Carpet Area: ${area.carpetArea}, Carpet Budget: ₹${area.carpetBudget}`,
          14,
          yOffset,
        );
        yOffset += 7;
      });
    }

    if (commonFacilities.length) {
      yOffset += 5;
      doc.text("Common Facilities:", 14, yOffset);
      yOffset += 7;
      commonFacilities.forEach((f, index) => {
        doc.text(`${index + 1}. ${f.name}`, 14, yOffset);
        yOffset += 7;
      });
    }

    yOffset += 5;
    doc.text(`Profit: ₹${profit}`, 14, yOffset);

    doc.save("project-budget.pdf");
  };

  const financialYears = [
    "2023–2024",
    "2024–2025",
    "2025–2026",
    "2026–2027",
    "2027–2028",
  ];

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-900 shadow-lg rounded-2xl">
        <ProjectOverview
          formData={formData}
          landAreas={landAreas}
          commonFacilities={commonFacilities}
          constructionAreas={constructionAreas}
          saleableAreas={saleableAreas}
          constructionTotals={constructionTotals}
          saleableTotals={saleableTotals}
          totalLandAreaCost={totalLandAreaCost}
          profit={profit}
          profitRatio={profitRatio}
          onEdit={() => setSubmitted(false)}
          onDownloadPDF={downloadPDF}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-900 shadow-lg rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="text-blue-600 w-6 h-6" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Project Budget Details
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
            Project Name *
          </label>
          <select
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-gray-100"
            disabled={loading}
          >
            <option value="">-- Select Project --</option>
            {loading ? (
              <option value="" disabled>
                Loading projects...
              </option>
            ) : (
              projects.map((project) => (
                <option
                  key={`${project.type}-${project.id || project._id}`}
                  value={project.name}
                >
                  {project.name}
                </option>
              ))
            )}
          </select>
          {loading && (
            <p className="mt-1 text-sm text-gray-500">Loading projects...</p>
          )}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Document Subject
            </label>
            <input
              type="text"
              name="documentSubject"
              value={formData.documentSubject}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
              placeholder="Enter document subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Document Date
            </label>
            <input
              type="date"
              name="documentDate"
              value={formData.documentDate}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Attachment
            </label>
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
              <Building2 className="w-5 h-5 text-green-600" />
              Land Area Details
            </h3>
            <button
              type="button"
              onClick={addLandArea}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition shadow-md"
            >
              <Plus size={18} /> Add Land Area
            </button>
          </div>

          {landAreas.length > 0 && (
            <div className="space-y-4">
              {landAreas.map((la, index) => (
                <div
                  key={la.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      {la.description || `Land Area ${index + 1}`}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addLandArea(index + 1)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                        title="Add below"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLandArea(la.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={la.description}
                        onChange={(e) =>
                          updateLandArea(la.id, "description", e.target.value)
                        }
                        placeholder="Description (e.g. Plot A)"
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Land Area Cost
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={la.landAreaCost}
                            onChange={(e) =>
                              updateLandArea(
                                la.id,
                                "landAreaCost",
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Development Cost
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={la.landDevelopmentCost}
                            onChange={(e) =>
                              updateLandArea(
                                la.id,
                                "landDevelopmentCost",
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Approval Cost
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={la.approvalCost}
                            onChange={(e) =>
                              updateLandArea(
                                la.id,
                                "approvalCost",
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Cost:
                      </span>
                      <span className="text-lg font-semibold text-green-600">
                        ₹
                        {Number(la.landAreaCost || 0) +
                          Number(la.landDevelopmentCost || 0) +
                          Number(la.approvalCost || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {landAreas.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No land areas added yet
              </p>
              <button
                type="button"
                onClick={addLandArea}
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition mx-auto"
              >
                <Plus size={18} /> Add Your First Land Area
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
              <Building2 className="w-5 h-5 text-blue-600" /> Construction Area
              Details
            </h3>
            <button
              type="button"
              onClick={addConstructionArea}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Add Construction Area
            </button>
          </div>

          {constructionAreas.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Financial Year
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Super Built-up Area (sqft)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Super Built-up Budget (₹)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Built-up Area (sqft)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Built-up Budget (₹)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Carpet Area (sqft)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Carpet Budget (₹)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {constructionAreas.map((area, index) => (
                    <tr key={area.id}>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <select
                          value={area.financialYear}
                          onChange={(e) =>
                            updateConstructionArea(
                              area.id,
                              "financialYear",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        >
                          <option value="">--Select Year--</option>
                          {financialYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.superBuiltupArea}
                          onChange={(e) =>
                            updateConstructionArea(
                              area.id,
                              "superBuiltupArea",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.superBuiltupBudget}
                          onChange={(e) =>
                            updateConstructionArea(
                              area.id,
                              "superBuiltupBudget",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.builtupArea}
                          onChange={(e) =>
                            updateConstructionArea(
                              area.id,
                              "builtupArea",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.builtupBudget}
                          onChange={(e) =>
                            updateConstructionArea(
                              area.id,
                              "builtupBudget",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.carpetArea}
                          onChange={(e) =>
                            updateConstructionArea(
                              area.id,
                              "carpetArea",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.carpetBudget}
                          onChange={(e) =>
                            updateConstructionArea(
                              area.id,
                              "carpetBudget",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => addConstructionAreaAtPosition(index)}
                            className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                            title="Add row below"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeConstructionArea(area.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            title="Remove row"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
                    <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                      Totals
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {constructionTotals.superBuiltupArea}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {constructionTotals.superBuiltupBudget}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {constructionTotals.builtupArea}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {constructionTotals.builtupBudget}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {constructionTotals.carpetArea}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {constructionTotals.carpetBudget}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="flex  items-center gap-2 text-lg font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-100">
              <FileText className="w-5 h-5 text-blue-600" /> Common Facilities
            </h3>
            <button
              type="button"
              onClick={addFacility}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Add Facility
            </button>
          </div>

          <div className="space-y-3">
            {commonFacilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 p-2 rounded-lg"
              >
                <input
                  type="text"
                  value={facility.name}
                  onChange={(e) =>
                    handleFacilityChange(facility.id, e.target.value)
                  }
                  placeholder="Enter facility name"
                  className="flex-1 p-3 border-none bg-transparent dark:text-gray-100"
                />
                <div className="w-40 flex items-center">
                  <span className="text-sm text-gray-600 mr-2">₹</span>
                  <input
                    type="number"
                    value={facility.cost}
                    onChange={(e) =>
                      handleFacilityBudgetChange(facility.id, e.target.value)
                    }
                    placeholder="Budget"
                    className="w-full p-2 border border-gray-200 rounded bg-white dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFacility(facility.id)}
                  className="text-red-500 hover:text-red-700 transition ml-2"
                  title="Remove facility"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
              <Building2 className="w-5 h-5 text-green-600" /> Saleable Area
              Details
            </h3>
            <button
              type="button"
              onClick={addSaleableArea}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
            >
              <Plus size={18} /> Add Saleable Area
            </button>
          </div>

          {saleableAreas.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Financial Year
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Super Built-up Area (sqft)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Super Built-up Budget (₹)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Built-up Area (sqft)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Built-up Budget (₹)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Carpet Area (sqft)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Carpet Budget (₹)
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 p-2">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {saleableAreas.map((area, index) => (
                    <tr key={area.id}>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <select
                          value={area.financialYear}
                          onChange={(e) =>
                            updateSaleableArea(
                              area.id,
                              "financialYear",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        >
                          <option value="">--Select Year--</option>
                          {financialYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.superBuiltupArea}
                          onChange={(e) =>
                            updateSaleableArea(
                              area.id,
                              "superBuiltupArea",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.superBuiltupBudget}
                          onChange={(e) =>
                            updateSaleableArea(
                              area.id,
                              "superBuiltupBudget",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.builtupArea}
                          onChange={(e) =>
                            updateSaleableArea(
                              area.id,
                              "builtupArea",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.builtupBudget}
                          onChange={(e) =>
                            updateSaleableArea(
                              area.id,
                              "builtupBudget",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.carpetArea}
                          onChange={(e) =>
                            updateSaleableArea(
                              area.id,
                              "carpetArea",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <input
                          type="number"
                          value={area.carpetBudget}
                          onChange={(e) =>
                            updateSaleableArea(
                              area.id,
                              "carpetBudget",
                              e.target.value,
                            )
                          }
                          className="w-full p-1 border-none bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 p-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => addSaleableAreaAtPosition(index)}
                            className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                            title="Add row below"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSaleableArea(area.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            title="Remove row"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
                    <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                      Totals
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {saleableTotals.superBuiltupArea}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {saleableTotals.superBuiltupBudget}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {saleableTotals.builtupArea}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {saleableTotals.builtupBudget}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {saleableTotals.carpetArea}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2">
                      {saleableTotals.carpetBudget}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-right text-lg font-semibold">
          Profit: ₹{profit}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Save size={18} /> Submit
          </button>
          <button
            type="button"
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </form>
    </div>
  );
};

export default MainInfo;
