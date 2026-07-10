import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Trash2, Calendar } from "lucide-react";
import operationApi from "../../../api/operation";

const DailyWorkReport = ({ projectSetup }) => {
  const [report, setReport] = useState({
    date: "",
    unit: "",
    work: "",
    stage: "",
    status: "Completed",
  });

  const [workList, setWorkList] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const getDynamicUnits = () => {
    let projectUnits = projectSetup?.units_data || [];
    if (typeof projectUnits === "string") {
      try {
        projectUnits = JSON.parse(projectUnits);
      } catch (e) {
        projectUnits = [];
      }
    }
    return projectUnits.map((u) => u.name || u.id);
  };

  const getDynamicStages = () => {
    let projectStages = projectSetup?.stages || [];
    if (typeof projectStages === "string") {
      try {
        projectStages = JSON.parse(projectStages);
      } catch (e) {
        projectStages = [];
      }
    }
    return projectStages.map((s) => s.name);
  };

  const UNITS = getDynamicUnits();
  const STAGES = getDynamicStages();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setReport((prev) => ({ ...prev, date: today }));

    if (projectSetup) {
      fetchDailyReports();
    }
  }, [projectSetup]);

  const fetchDailyReports = async () => {
    try {
      setIsLoading(true);
      const res = await operationApi.getDailyReports();
      const reports = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const existingData = reports.filter(
        (d) => d.project_setup_id === projectSetup.id,
      );
      if (existingData.length > 0) {
        setSavedReports(existingData);
      }
    } catch (error) {
      console.error("Error fetching daily reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport({ ...report, [name]: value });
  };

  const handleAddWork = () => {
    if (!report.work || !report.stage) {
      return Swal.fire("Warning", "Please fill in all fields.", "warning");
    }

    const workItem = {
      ...report,
      id: Date.now(),
    };

    setWorkList((prev) => [...prev, workItem]);
    setReport((prev) => ({
      ...prev,
      work: "",
      stage: "",
      status: "Completed",
    }));
  };

  const handleSaveReport = async () => {
    if (workList.length === 0) {
      return Swal.fire("Warning", "No entries to save.", "warning");
    }

    try {
      setIsLoading(true);
      const submissionData = {
        project_setup_id: projectSetup.id,
        report_date: report.date,
        work_items: JSON.stringify(
          workList.map((item) => ({
            task: `${item.stage}: ${item.work}`,
            progress: item.status === "Completed" ? "100%" : "In Progress",
          })),
        ),
        summary: "Daily work summary",
      };
      await operationApi.createDailyReport(submissionData);

      setSavedReports((prev) => [
        { ...submissionData, id: Date.now() },
        ...prev,
      ]);
      setWorkList([]);
      Swal.fire("Success", "Report saved successfully.", "success");
      fetchDailyReports();
    } catch (error) {
      console.error("Error saving report:", error);
      Swal.fire("Error", "Failed to save report.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                New Work Entry
              </h2>

              <div className="space-y-6">
                <div>
                  <label className=" mb-2 font-medium text-gray-700 flex items-center gap-2">
                    <Calendar size={16} /> Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={report.date}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Stage
                  </label>
                  <select
                    name="stage"
                    value={report.stage}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  >
                    <option value="">-- Select Stage --</option>
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Work Description
                  </label>
                  <textarea
                    name="work"
                    value={report.work}
                    onChange={handleChange}
                    rows="3"
                    className="border border-gray-300 rounded-lg p-3 w-full resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <label className="block font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={report.status}
                      onChange={handleChange}
                      className="border ml-2 border-gray-300 rounded-lg p-2 flex-1"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Carrying Forward">Carrying Forward</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddWork}
                    className="bg-blue-600 text-white p-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Add Work
                  </button>
                </div>

                {workList.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Work Entries ({workList.length})
                    </h4>
                    <div className="space-y-3">
                      {workList.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start p-3 bg-white border rounded-lg"
                        >
                          <div>
                            {item.status}
                            <p className="text-sm text-gray-600">{item.work}</p>
                          </div>
                          <button
                            onClick={() =>
                              setWorkList(
                                workList.filter((_, i) => i !== index),
                              )
                            }
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleSaveReport}
                      className="mt-4 bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 mx-auto block"
                    >
                      Save Daily Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Saved Reports ({savedReports.length})
              </h3>
              <div className="space-y-4">
                {savedReports.map((r) => (
                  <div key={r.id} className="border p-3 rounded-lg">
                    <span className="font-medium">{r.report_date}</span>
                    <p className="text-xs text-gray-500">
                      {r.summary || r.remarks}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyWorkReport;
