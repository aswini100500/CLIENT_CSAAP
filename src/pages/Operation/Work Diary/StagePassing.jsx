import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import operationApi from "../../../api/operation";

const StagePassing = ({ projectSetup }) => {  
  const [stages, setStages] = useState([
    { id: 1, name: "Site Preparation", completed: false, remark: "", subStages: [] },
    { id: 2, name: "Foundation Work", completed: false, remark: "", subStages: [] },
    { id: 3, name: "Structural Framework", completed: false, remark: "", subStages: [] },
    { id: 4, name: "Wall Construction", completed: false, remark: "", subStages: [] },
    { id: 5, name: "Roofing", completed: false, remark: "", subStages: [] },
    { id: 6, name: "Electrical & Plumbing", completed: false, remark: "", subStages: [] },
    { id: 7, name: "Finishing Work", completed: false, remark: "", subStages: [] },
  ]);

  const [remarks, setRemarks] = useState({});
  const [newStage, setNewStage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectSetup) {
      fetchStagePassings();
    }
  }, [projectSetup]);

  const fetchStagePassings = async () => {
    try {
      setLoading(true);
      const res = await operationApi.getStagePassings();
      const details = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const existingData = details.filter(d => d.project_setup_id === projectSetup.id);
      

      let projectStages = projectSetup.stages || [];
      if (typeof projectStages === 'string') {
        try { projectStages = JSON.parse(projectStages); } catch (e) { projectStages = []; }
      }


      if (projectStages.length === 0) {



      } else {

        const mappedStages = projectStages.map((ps, index) => {
          const savedRecord = existingData.find(d => d.stage_name === ps.name);
          

          let subStages = ps.sub_stages || ps.subStages || [];
          if (savedRecord) {
             let savedSubs = savedRecord.sub_stages;
             if (typeof savedSubs === 'string') {
                try { savedSubs = JSON.parse(savedSubs); } catch (e) { savedSubs = []; }
             }
             if (savedSubs && savedSubs.length > 0) {
                subStages = savedSubs;
             }
          }

          return {
            id: ps.id || `ps-${index}`,
            name: ps.name,
            completed: savedRecord ? !!savedRecord.completed : false,
            remark: savedRecord ? savedRecord.remark : "",
            subStages: subStages.map((ss, sIndex) => ({
                id: ss.id || `ss-${index}-${sIndex}`,
                name: ss.name,
                completed: ss.completed || false,
                remark: ss.remark || ""
            }))
          };
        });
        setStages(mappedStages);
      }
    } catch (error) {
      console.error("Error fetching stage passings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (stageId, updatedStage) => {
    if (!projectSetup) return;
    try {
        const submissionData = {
            project_setup_id: projectSetup.id,
            stage_name: updatedStage.name,
            completed: updatedStage.completed ? 1 : 0,
            remark: updatedStage.remark,
            sub_stages: JSON.stringify(updatedStage.subStages)
        };

        const res = await operationApi.getStagePassings();
        const details = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const existing = details.find(d => d.project_setup_id === projectSetup.id && d.stage_name === updatedStage.name);

        if (existing) {
            await operationApi.updateStagePassing(existing.id, submissionData);
        } else {
            await operationApi.createStagePassing(submissionData);
        }
    } catch (error) {
        console.error("Error saving stage passing:", error);
        Swal.fire("Error", "Failed to save stage progress.", "error");
    }
  };


  const addSubStage = (stageId) => {
    Swal.fire({
      title: "Add Sub-Stage",
      input: "text",
      inputPlaceholder: "Enter sub-stage name",
      showCancelButton: true,
      confirmButtonText: "Add",
    }).then((result) => {
      if (result.isConfirmed && result.value.trim()) {
        const updated = stages.map((stage) => {
          if (stage.id === stageId) {
            const newSub = {
                id: Date.now(),
                name: result.value.trim(),
                completed: false,
                remark: "",
            };
            const newStage = { ...stage, subStages: [...stage.subStages, newSub] };
            handleSave(stage.id, newStage);
            return newStage;
          }
          return stage;
        });
        setStages(updated);
        Swal.fire("Added!", "Sub-Stage added successfully.", "success");
      }
    });
  };


  const completeSubStage = (stageId, subId) => {
    const remark = remarks[subId]?.trim();
    if (!remark) {
      return Swal.fire("Remark Required", "Please enter a remark first.", "warning");
    }

    const updated = stages.map((stage) => {
      if (stage.id === stageId) {
        const newStage = {
            ...stage,
            subStages: stage.subStages.map((sub) =>
              sub.id === subId ? { ...sub, completed: true, remark } : sub
            ),
        };
        handleSave(stage.id, newStage);
        return newStage;
      }
      return stage;
    });
    setStages(updated);
    setRemarks({ ...remarks, [subId]: "" });
    Swal.fire("Completed!", "Sub-Stage marked as completed.", "success");
  };


  const editSubStageRemark = (stageId, subId, currentRemark) => {
    Swal.fire({
      title: "Edit Remark",
      input: "text",
      inputValue: currentRemark,
      showCancelButton: true,
      confirmButtonText: "Save",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = stages.map((stage) => {
          if (stage.id === stageId) {
            const newStage = {
                ...stage,
                subStages: stage.subStages.map((sub) =>
                  sub.id === subId ? { ...sub, remark: result.value } : sub
                ),
            };
            handleSave(stage.id, newStage);
            return newStage;
          }
          return stage;
        });
        setStages(updated);
        Swal.fire("Updated!", "Remark updated successfully.", "success");
      }
    });
  };


  const completeStage = (stageId) => {
    const remark = remarks[stageId]?.trim();
    if (!remark) {
      return Swal.fire("Remark Required", "Please enter a remark before completing.", "warning");
    }

    const updated = stages.map((stage) => {
        if (stage.id === stageId) {
            const newStage = { ...stage, completed: true, remark };
            handleSave(stage.id, newStage);
            return newStage;
        }
        return stage;
    });
    setStages(updated);
    setRemarks({ ...remarks, [stageId]: "" });
    Swal.fire("Completed!", "Stage marked as completed.", "success");
  };


  const editStageRemark = (stageId, currentRemark) => {
    Swal.fire({
      title: "Edit Remark",
      input: "text",
      inputValue: currentRemark,
      showCancelButton: true,
      confirmButtonText: "Save",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = stages.map((stage) => {
            if (stage.id === stageId) {
                const newStage = { ...stage, remark: result.value };
                handleSave(stage.id, newStage);
                return newStage;
            }
            return stage;
        });
        setStages(updated);
        Swal.fire("Updated!", "Remark updated successfully.", "success");
      }
    });
  };

  return (
    <div className="w-[90%] mx-auto mt-2">
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="mt-3 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Add another main stage"
            value={newStage}
            onChange={(e) => setNewStage(e.target.value)}
            className="border border-gray-300 rounded p-2 flex-1 focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              const name = (newStage || "").trim();
              if (!name) return Swal.fire("Oops!", "Please enter a stage name.", "warning");
              const newStageObj = { id: Date.now(), name, completed: false, remark: "", subStages: [] };
              setStages((prev) => [...prev, newStageObj]);
              setNewStage("");
              Swal.fire("Added!", `${name} added to stages.`, "success");
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Stage
          </button>
        </div>
      </div>

      <ul className="space-y-4">
        {stages.map((stage) => (
          <li key={stage.id} className="bg-white shadow-md rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-700">{stage.name}</h3>

              {!stage.completed ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Remark..."
                    value={remarks[stage.id] || ""}
                    onChange={(e) => setRemarks({ ...remarks, [stage.id]: e.target.value })}
                    className="border w-[40vh] border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => completeStage(stage.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Complete
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-green-600 font-medium">✅ Completed</span>
                  <button
                    onClick={() => editStageRemark(stage.id, stage.remark)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    ✏️ Edit
                  </button>
                </div>
              )}
            </div>

            {stage.completed && (
              <p className="mt-2 text-gray-600 text-sm">
                <strong>Remark:</strong> {stage.remark}
              </p>
            )}


            <div className="mt-4 ml-4 border-l-2 pl-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Sub-Stages</h4>
                <button
                  onClick={() => addSubStage(stage.id)}
                  className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  + Add Sub-Stage
                </button>
              </div>

              {stage.subStages.length === 0 && (
                <p className="text-gray-400 text-sm">No sub-stages added yet.</p>
              )}

              {stage.subStages.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 bg-gray-50 p-2 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-700">{sub.name}</p>
                    {sub.completed && (
                      <p className="text-gray-600 text-sm">
                        <strong>Remark:</strong> {sub.remark}
                      </p>
                    )}
                  </div>

                  {!sub.completed ? (
                    <div className="flex gap-2 items-center mt-2 md:mt-0">
                      <input
                        type="text"
                        placeholder="Enter remark..."
                        value={remarks[sub.id] || ""}
                        onChange={(e) => setRemarks({ ...remarks, [sub.id]: e.target.value })}
                        className="border border-gray-300 p-1 rounded focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        onClick={() => completeSubStage(stage.id, sub.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Complete
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-sm font-medium">✅ Completed</span>
                      <button
                        onClick={() => editSubStageRemark(stage.id, sub.id, sub.remark)}
                        className="text-blue-600 text-xs font-medium hover:underline"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StagePassing;


















































































































































































































































































                    













































































































































