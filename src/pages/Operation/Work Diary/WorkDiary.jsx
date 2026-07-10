import React, { useState, useEffect } from "react";
import ProjectSetup from "./ProjectSetup";
import LabourDetails from "./LabourDetails";
import ToolsAndPlants from "./ToolsAndPlants";
import StagePassing from "./StagePassing";
import DailyWorkReport from "./DailyWorkReport";
import RawMaterial from "./RawMaterial";
import ProjectSetupSelector from "./ProjectSetupSelector";
import operationApi from "../../../api/operation";

const WorkDiary = () => {
  const [activeTab, setActiveTab] = useState("project");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectSetup, setProjectSetup] = useState(null);

  const [projectsList, setProjectsList] = useState([]);
  const [setupsList, setSetupsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const [setupsRes, apartments, commercials, plottings, duplexes, triplexes, custom] = await Promise.all([
        operationApi.getProjectSetups(),
        operationApi.getApartments(),
        operationApi.getCommercials(),
        operationApi.getPlottings(),
        operationApi.getDuplexes(),
        operationApi.getTriplexes(),
        operationApi.getCustomProjects()
      ]);

      const getArrayData = (res) => {
        if (!res || !res.data) return [];
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data.data)) return res.data.data;
        return [];
      };

      const allSetups = getArrayData(setupsRes);
      const allProjects = [
        ...getArrayData(apartments).map(p => ({ ...p, type: 'Apartment', uid: `Apartment-${p.id}` })),
        ...getArrayData(commercials).map(p => ({ ...p, type: 'Commercial', uid: `Commercial-${p.id}` })),
        ...getArrayData(plottings).map(p => ({ ...p, type: 'Plotting', uid: `Plotting-${p.id}` })),
        ...getArrayData(duplexes).map(p => ({ ...p, type: 'Duplex', uid: `Duplex-${p.id}` })),
        ...getArrayData(triplexes).map(p => ({ ...p, type: 'Triplex', uid: `Triplex-${p.id}` })),
        ...getArrayData(custom).map(p => ({ ...p, type: 'Custom', uid: `Custom-${p.id}` }))
      ];

      setSetupsList(allSetups);
      setProjectsList(allProjects);
    } catch (error) {
      console.error("Error fetching setups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const tabs = [
    { id: "project", label: "Project Setup" },
    { id: "labour", label: "Labour Details" },
    { id: "tools", label: "Tools & Plants" },
     { id: "workprogress", label: "Daily Work Report" },
    { id: "stages", label: "Stage Passing" },

  ];

  const handleProjectSelect = (proj, setup) => {
    setSelectedProject(proj);
    setProjectSetup(setup);
  };

  const handleSetupUpdated = (proj, setup) => {
    handleProjectSelect(proj, setup);
    fetchMasterData();
  };

  return (
    <div className="p-6 bg-gray-100  min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Work Diary Management</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
        <ProjectSetupSelector 
          currentSetup={projectSetup} 
          onSelect={handleProjectSelect} 
          projects={projectsList}
          setups={setupsList}
          loading={loading}
        />
        
        {selectedProject && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <span className="text-xs text-gray-500 uppercase font-bold">Project</span>
                <p className="font-semibold text-gray-800">{selectedProject.name || selectedProject.project_name}</p>
             </div>
             <div>
                <span className="text-xs text-gray-500 uppercase font-bold">Type</span>
                <p className="font-semibold text-gray-800">{projectSetup?.project_type}</p>
             </div>
             <div>
                <span className="text-xs text-gray-500 uppercase font-bold">Timeline</span>
                <p className="font-semibold text-gray-800">{projectSetup?.start_date} to {projectSetup?.end_date}</p>
             </div>
          </div>
        )}
      </div>

      <div className="flex mb-6 overflow-x-auto gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white font-semibold shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        {activeTab === "project" && (
          <ProjectSetup 
            onProjectSelect={handleSetupUpdated} 
            initialProject={selectedProject}
            initialSetup={projectSetup}
            projectsList={projectsList}
          />
        )}
        {activeTab === "labour" && <LabourDetails projectSetup={projectSetup} />}
        {activeTab === "tools" && <ToolsAndPlants projectSetup={projectSetup} />}
        {activeTab === "stages" && <StagePassing projectSetup={projectSetup} />}
        {activeTab === "workprogress" && <DailyWorkReport projectSetup={projectSetup} />}
        {activeTab === "rawmaterial" && <RawMaterial projectSetup={projectSetup} />}
      </div>
    </div>
  );
};

export default WorkDiary;
