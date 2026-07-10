import React, { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaFileContract,
  FaFileSignature,
  FaUserCheck
} from "react-icons/fa";
import FormsApplied from "./FormsApplied";
import RecruitmentTablePage from "./InterviewDetails";
import JobPosting from "./JobPosting";
import OfferLetterManagement from "./Offerletter";
import ShortlistedCandidates from "./ShortlistedCandidate";

import { usePermission } from "../../../hooks/usePermission";

const JobTabs = ({ basePath = "/superadmin/hrms" }) => {
  const { hasAccess } = usePermission();
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    {
      id: "job-posting",
      permission: "hrms.job.posting",
      label: "Job Posting",
      icon: <FaBriefcase />,
      description: "Manage and create new job openings",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "form-applied",
      permission: "hrms.job.applied",
      label: "Form Applied",
      icon: <FaFileSignature />,
      description: "Review submitted job applications",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "shortlisted",
      permission: "hrms.job.shortlisted",
      label: "Shortlisted Candidates",
      icon: <FaUserCheck />,
      description: "Manage candidates moved to the shortlist",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "interview",
      permission: "hrms.job.interview",
      label: "Interview",
      icon: <FaCalendarAlt />,
      description: "Schedule and track interview stages",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "offer-letter",
      permission: "hrms.job.offer",
      label: "Offer Letter",
      icon: <FaFileContract />,
      description: "Generate and manage candidate offer letters",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const filteredTabs = tabs.filter((tab) => hasAccess(tab.permission));

  const [activeTab, setActiveTab] = useState(() => {
    return filteredTabs[0]?.id || "job-posting";
  });

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const activeTabData = filteredTabs.find((tab) => tab.id === activeTab) || filteredTabs[0];

  return (
    <div className="w-full bg-linear-to-br from-gray-50 to-blue-50/30">

      <div className="w-full mb-6">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-1.5 gap-4 border border-gray-200 shadow-sm inline-flex flex-wrap">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center justify-center
                  px-6 py-2 rounded-xl font-semibold transition-all
                  duration-500 ease-out transform hover:scale-[1.02]
                  hover:shadow-md min-w-35 group
                  ${
                    activeTab === tab.id
                      ? `text-white bg-linear-to-r ${tab.color} shadow-lg scale-[1.02]`
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <span
                  className={`
                    text-lg transition-colors duration-300
                    ${activeTab === tab.id ? "text-white" : tab.iconColor}
                  `}
                >
                  {tab.icon}
                </span>

                <span className="ml-2 text-sm font-semibold whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="w-full bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm ">

        <div className="border-b border-gray-200 bg-gray-50/50">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTabData?.label}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {activeTabData?.description}
              </p>
            </div>
          </div>
        </div>


        <div className="w-full p-2 sm:p-3">
          <div
            className={`transition-opacity duration-300 ${isLoading ? "opacity-30" : "opacity-100"}`}
          >
            {activeTab === "job-posting" && <JobPosting />}
            {activeTab === "form-applied" && (
              <FormsApplied basePath={basePath} />
            )}
            {activeTab === "shortlisted" && <ShortlistedCandidates />}
            {activeTab === "interview" && <RecruitmentTablePage />}
            {activeTab === "offer-letter" && <OfferLetterManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTabs;
