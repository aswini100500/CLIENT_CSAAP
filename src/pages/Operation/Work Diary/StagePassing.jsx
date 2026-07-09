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
      
      // Get stages from projectSetup
      let projectStages = projectSetup.stages || [];
      if (typeof projectStages === 'string') {
        try { projectStages = JSON.parse(projectStages); } catch (e) { projectStages = []; }
      }

      // If no stages in projectSetup, we can't really "pass" stages
      if (projectStages.length === 0) {
        // Fallback to defaults if user hasn't defined stages yet, 
        // but ideally they should define them in Project Setup.
        // setStages([...]); 
      } else {
        // Map projectStages to our internal state and overlay backend data
        const mappedStages = projectStages.map((ps, index) => {
          const savedRecord = existingData.find(d => d.stage_name === ps.name);
          
          // Handle sub-stages overlay
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

  // Add sub-stage
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

  // Complete sub-stage
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

  // Edit sub-stage remark
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

  // Complete stage
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

  // Edit stage remark
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

            {/* Sub-Stages */}
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





// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import { Plus, Trash2, Edit3, CheckCircle, Circle } from "lucide-react";

// const StagePassing = () => {
//   const [stages, setStages] = useState([]);
//   const [remarks, setRemarks] = useState({});
//   const [activeRemarkStage, setActiveRemarkStage] = useState(null);
//   const [newStageName, setNewStageName] = useState("");
//   const [isAddingStage, setIsAddingStage] = useState(false);

//   // Load stages from localStorage on component mount
//   useEffect(() => {
//     const savedStages = localStorage.getItem("workStages");
//     if (savedStages) {
//       setStages(JSON.parse(savedStages));
//     } else {
//       // Default stages if none exist
//       const defaultStages = [
//         { id: 1, name: "Site Preparation", completed: false, remark: "" },
//         { id: 2, name: "Foundation Work", completed: false, remark: "" },
//         { id: 3, name: "Structural Framework", completed: false, remark: "" },
//         { id: 4, name: "Wall Construction", completed: false, remark: "" },
//         { id: 5, name: "Roofing", completed: false, remark: "" },
//         { id: 6, name: "Electrical & Plumbing", completed: false, remark: "" },
//         { id: 7, name: "Finishing Work", completed: false, remark: "" },
//       ];
//       setStages(defaultStages);
//     }
//   }, []);

//   // Save stages to localStorage whenever they change
//   useEffect(() => {
//     if (stages.length > 0) {
//       localStorage.setItem("workStages", JSON.stringify(stages));
//     }
//   }, [stages]);

//   const handleRemarkChange = (index, value) => {
//     setRemarks({ ...remarks, [index]: value });
//   };

//   // Add new stage
//   const handleAddStage = () => {
//     if (!newStageName.trim()) {
//       Swal.fire("Oops!", "Please enter a stage name.", "warning");
//       return;
//     }

//     const newStage = {
//       id: Date.now(),
//       name: newStageName.trim(),
//       completed: false,
//       remark: ""
//     };

//     setStages(prev => [...prev, newStage]);
//     setNewStageName("");
//     setIsAddingStage(false);

//     Swal.fire("Added!", "New stage has been added.", "success");
//   };

//   // Delete stage
//   const handleDeleteStage = (stageId) => {
//     Swal.fire({
//       title: "Delete Stage?",
//       text: "This action cannot be undone.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#ef4444",
//       cancelButtonColor: "#6b7280",
//       confirmButtonText: "Yes, delete it!"
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setStages(prev => prev.filter(stage => stage.id !== stageId));
//         Swal.fire("Deleted!", "Stage has been removed.", "success");
//       }
//     });
//   };

//   // Edit stage name
//   const handleEditStage = (stageId, newName) => {
//     if (!newName.trim()) {
//       Swal.fire("Oops!", "Stage name cannot be empty.", "warning");
//       return;
//     }

//     setStages(prev => prev.map(stage => 
//       stage.id === stageId ? { ...stage, name: newName.trim() } : stage
//     ));

//     Swal.fire("Updated!", "Stage name has been updated.", "success");
//   };

//   // Mark stage as complete
//   const completeStage = (index) => {
//     if (index !== 0 && !stages[index - 1].completed) {
//       return Swal.fire({
//         icon: "warning",
//         title: "Previous Stage Required",
//         text: "Please complete the previous stage first!",
//         confirmButtonColor: "#3b82f6"
//       });
//     }

//     const remark = remarks[index]?.trim();
//     if (!remark) {
//       return Swal.fire({
//         icon: "warning",
//         title: "Remark Required",
//         text: "Please enter a remark before completing the stage.",
//         confirmButtonColor: "#3b82f6"
//       });
//     }

//     const updated = [...stages];
//     updated[index].completed = true;
//     updated[index].remark = remark;
//     setStages(updated);
//     setRemarks({ ...remarks, [index]: "" });
//     setActiveRemarkStage(null);

//     Swal.fire({
//       icon: "success",
//       title: "Stage Completed!",
//       text: `${updated[index].name} has been marked as completed.`,
//       timer: 2000,
//       showConfirmButton: false
//     });
//   };

//   // Save edited remark for completed stage
//   const saveEditedRemark = (index) => {
//     const newRemark = remarks[index]?.trim();
//     if (!newRemark) {
//       return Swal.fire({
//         icon: "warning",
//         title: "Empty Remark",
//         text: "Remark cannot be empty.",
//         confirmButtonColor: "#3b82f6"
//       });
//     }

//     const updated = [...stages];
//     updated[index].remark = newRemark;
//     setStages(updated);
//     setRemarks({ ...remarks, [index]: "" });
//     setActiveRemarkStage(null);

//     Swal.fire({
//       icon: "success",
//       title: "Remark Updated!",
//       text: "Stage remark has been updated successfully.",
//       timer: 1500,
//       showConfirmButton: false
//     });
//   };

//   // Reset all stages
//   const handleResetAll = () => {
//     Swal.fire({
//       title: "Reset All Stages?",
//       text: "This will mark all stages as incomplete and clear all remarks.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#ef4444",
//       cancelButtonColor: "#6b7280",
//       confirmButtonText: "Yes, reset all!"
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setStages(prev => prev.map(stage => ({
//           ...stage,
//           completed: false,
//           remark: ""
//         })));
//         setRemarks({});
//         setActiveRemarkStage(null);
//         Swal.fire("Reset!", "All stages have been reset.", "success");
//       }
//     });
//   };

//   const getCompletionPercentage = () => {
//     const completed = stages.filter(stage => stage.completed).length;
//     return stages.length > 0 ? Math.round((completed / stages.length) * 100) : 0;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Add Stage Section */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold text-gray-800">Manage Stages</h2>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setIsAddingStage(!isAddingStage)}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
//               >
//                 <Plus size={18} />
//                 Add Stage
//               </button>
//               <button
//                 onClick={handleResetAll}
//                 className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
//               >
//                 Reset All
//               </button>
//             </div>
//           </div>

//           {isAddingStage && (
//             <div className="flex gap-2 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <input
//                 type="text"
//                 placeholder="Enter new stage name..."
//                 value={newStageName}
//                 onChange={(e) => setNewStageName(e.target.value)}
//                 className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                 onKeyPress={(e) => e.key === 'Enter' && handleAddStage()}
//               />
//               <button
//                 onClick={handleAddStage}
//                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
//               >
//                 Add
//               </button>
//               <button
//                 onClick={() => setIsAddingStage(false)}
//                 className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}

//           {/* Stages List */}
//           <div className="space-y-4">
//             {stages.map((stage, index) => (
//               <div
//                 key={stage.id}
//                 className={`flex flex-col md:flex-row justify-between items-start p-4 rounded-lg border-2 transition-all ${
//                   stage.completed 
//                     ? 'border-green-200 bg-green-50' 
//                     : 'border-gray-200 bg-white hover:shadow-md'
//                 }`}
//               >
//                 <div className="flex items-start gap-3 flex-1 mb-3 md:mb-0">
//                   <div className="flex-shrink-0 mt-1">
//                     {stage.completed ? (
//                       <CheckCircle className="text-green-500" size={20} />
//                     ) : (
//                       <Circle className="text-gray-400" size={20} />
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className={`font-medium ${
//                         stage.completed ? 'text-green-700' : 'text-gray-800'
//                       }`}>
//                         {stage.name}
//                       </span>
//                       {stage.completed && (
//                         <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
//                           Completed
//                         </span>
//                       )}
//                     </div>
                    
//                     {/* Stage actions */}
//                     <div className="flex gap-2 mt-2">
//                       <button
//                         onClick={() => {
//                           const newName = prompt("Edit stage name:", stage.name);
//                           if (newName !== null) {
//                             handleEditStage(stage.id, newName);
//                           }
//                         }}
//                         className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
//                       >
//                         <Edit3 size={14} />
//                         Rename
//                       </button>
//                       <button
//                         onClick={() => handleDeleteStage(stage.id)}
//                         className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
//                       >
//                         <Trash2 size={14} />
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Remark Section */}
//                 <div className="w-full md:w-96">
//                   {!stage.completed ? (
//                     <>
//                       {activeRemarkStage === index ? (
//                         <div className="flex gap-2 items-start">
//                           <input
//                             type="text"
//                             placeholder="Enter completion remark..."
//                             value={remarks[index] || ""}
//                             onChange={(e) => handleRemarkChange(index, e.target.value)}
//                             className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                             onKeyPress={(e) => e.key === 'Enter' && completeStage(index)}
//                           />
//                           <button
//                             onClick={() => completeStage(index)}
//                             className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-1"
//                           >
//                             <CheckCircle size={16} />
//                             Complete
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => setActiveRemarkStage(index)}
//                           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all w-full md:w-auto"
//                         >
//                           Add Remark & Complete
//                         </button>
//                       )}
//                     </>
//                   ) : (
//                     <>
//                       {activeRemarkStage === index ? (
//                         <div className="flex gap-2 items-start">
//                           <input
//                             type="text"
//                             value={remarks[index] || stage.remark}
//                             onChange={(e) => handleRemarkChange(index, e.target.value)}
//                             className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                             onKeyPress={(e) => e.key === 'Enter' && saveEditedRemark(index)}
//                           />
//                           <button
//                             onClick={() => saveEditedRemark(index)}
//                             className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all"
//                           >
//                             Save
//                           </button>
//                         </div>
//                       ) : (
//                         <div className="flex gap-2 items-start">
//                           <div className="flex-1 bg-white p-2 rounded border border-gray-200">
//                             <p className="text-sm text-gray-700">{stage.remark}</p>
//                           </div>
//                           <button
//                             onClick={() => setActiveRemarkStage(index)}
//                             className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-all flex items-center gap-1"
//                           >
//                             <Edit3 size={14} />
//                             Edit
//                           </button>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {stages.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               <p>No stages added yet. Click "Add Stage" to get started.</p>
//             </div>
//           )}
//         </div>

//         {/* Completed Stages Summary */}
//         {stages.some((s) => s.completed) && (
//           <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
//               Completed Stages Summary
//             </h3>
//             <div className="overflow-x-auto">
//               <table className="min-w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100 text-gray-700">
//                     <th className="px-4 py-3 text-left text-sm font-medium border-b">Stage</th>
//                     <th className="px-4 py-3 text-left text-sm font-medium border-b">Remark</th>
//                     <th className="px-4 py-3 text-left text-sm font-medium border-b">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {stages
//                     .filter((s) => s.completed)
//                     .map((s) => (
//                       <tr key={s.id} className="hover:bg-gray-50 border-b">
//                         <td className="px-4 py-3 font-medium text-green-700">{s.name}</td>
//                         <td className="px-4 py-3 text-gray-600">{s.remark}</td>
//                         <td className="px-4 py-3">
//                           <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
//                             Completed
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StagePassing;