import axios from "axios";
import { ArrowBigLeft } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";

const Input = ({
  label,
  name,
  type = "text",
  section,
  required = false,
  value,
  onChange,
}) => (
  <div>
    <label
      htmlFor={`${section}-${name}`}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={`${section}-${name}`}
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required={required}
    />
  </div>
);

const Textarea = ({
  label,
  name,
  section,
  rows = 3,
  required = false,
  value,
  onChange,
}) => (
  <div>
    <label
      htmlFor={`${section}-${name}`}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={`${section}-${name}`}
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={rows}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required={required}
    />
  </div>
);

const RecruitmentProcess = () => {
  const { has } = usePermission();
  const [formData, setFormData] = useState({
    candidateInfo: { candidateName: "" },
    jobInfo: {
      jobTitle: "",
      payGrade: "",
      reportingPerson: "",
      shiftTiming: "",
      department: "",
      location: "",
    },
    jobSummary: {
      jobPurpose: "",
      jobImportance: "",
      jobSignificance: "",
      jobValue: "",
      jobContribution: "",
    },
    challenges: { deadline: "", punctuality: "", quality: "", accuracy: "" },
    hierarchy: { hierarchy: "" },
    qualification: { education: "", experience: "", overallQualification: "" },
    workingConditions: {
      skills: "",
      knowledge: "",
      startTime: "",
      endTime: "",
      workingHours: "",
      lunch: "",
      teaBreaks: "",
      travelHours: "",
    },
    responsibilities: { role: "", topGoals: "", communication: "" },
    competencies: { knowledge: "", skill: "", attitude: "" },
    promotionHiring: {
      promotionType: "",
      talentProgress: "",
      interviewerFocus: "",
      hiringType: "",
    },
    culturalFit: {
      culturalMisfit: "",
      situationQuestion: "",
      workCulture: "",
      boss: "",
      environment: "",
      dreamJob: "",
      comfortLevel: "",
      teamIntegration: "",
      collaboration: "",
      democratic: "",
      singleIsolative: "",
      directive: "",
      authoritative: "",
      potentialGrowth: "",
    },
    evaluation: { performance: "", scoreSheet: "", markSheet: "" },
    background: {
      reference: "",
      awards: "",
      rewards: "",
      promotions: "",
      careerGap: "",
      jobHopper: "",
      stayedLong: "",
    },
    softSkills: {
      communication: "",
      flexibility: "",
      leadership: "",
      motivation: "",
      patience: "",
      persuasion: "",
      problemSolving: "",
      teamWork: "",
      decisionMaking: "",
      criticalThinking: "",
      timeManagement: "",
      listening: "",
      publicSpeaking: "",
      communicationVisual: "",
      creativeThinking: "",
      willingness: "",
      adaptability: "",
      honesty: "",
    },
    hardSkills: { functional: "", technical: "", finance: "" },
    backgroundCheck: {
      rehireStatus: "",
      bankAccount: "",
      form16: "",
      teleVerification: "",
    },
    orientation: {
      welcome: "",
      policies: "",
      hr: "",
      accounts: "",
      leaves: "",
      salary: "",
      allowances: "",
      lunchTimes: "",
      teaBreakTimes: "",
      overtime: "",
      expectation: "",
      roleGoal: "",
      documentation: "",
      joiningLetter: "",
      qualificationProofs: "",
      agreement: "",
    },
    final: { finalConclusion: "", interviewerSignature: "", interviewDate: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleChange = useCallback((e, section) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!has("hrms.job.interview.schedule")) {
      alert(
        "Access Denied: You do not have permission to submit interview reports.",
      );
      return;
    }

    if (!formData.candidateInfo.candidateName || !formData.jobInfo.jobTitle) {
      alert("Please fill in Candidate Name and Job Title.");
      return;
    }
    if (formData.final.interviewDate) {
      const interviewDate = new Date(formData.final.interviewDate);
      if (interviewDate > new Date()) {
        alert("Interview date cannot be in the future.");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/recruitments/`,
        formData,
      );
      alert("Recruitment form submitted successfully!");
      navigate(`/interview-detail/${id}`);
    } catch (err) {
      setError("Failed to save form data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-8">
        <ArrowBigLeft
          size={20}
          onClick={() => navigate(`/interview-detail/${id}`)}
        />
        <h1 className="text-3xl font-bold text-center text-blue-700">
          {id ? "Edit Recruitment Form" : "Recruitment Process & Mark Sheet"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Candidate Information
            </h2>
            <Input
              label="Candidate Name"
              name="candidateName"
              section="candidateInfo"
              value={formData.candidateInfo.candidateName}
              onChange={(e) => handleChange(e, "candidateInfo")}
              required
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                name="jobTitle"
                section="jobInfo"
                value={formData.jobInfo.jobTitle}
                onChange={(e) => handleChange(e, "jobInfo")}
                required
              />
              <Input
                label="Pay Grade"
                name="payGrade"
                section="jobInfo"
                value={formData.jobInfo.payGrade}
                onChange={(e) => handleChange(e, "jobInfo")}
              />
              <Input
                label="Reporting Person"
                name="reportingPerson"
                section="jobInfo"
                value={formData.jobInfo.reportingPerson}
                onChange={(e) => handleChange(e, "jobInfo")}
              />
              <Input
                label="Shift Timing"
                name="shiftTiming"
                section="jobInfo"
                value={formData.jobInfo.shiftTiming}
                onChange={(e) => handleChange(e, "jobInfo")}
              />
              <Input
                label="Department"
                name="department"
                section="jobInfo"
                value={formData.jobInfo.department}
                onChange={(e) => handleChange(e, "jobInfo")}
              />
              <Input
                label="Location"
                name="location"
                section="jobInfo"
                value={formData.jobInfo.location}
                onChange={(e) => handleChange(e, "jobInfo")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Job Summary</h2>
            <Textarea
              label="Purpose"
              name="jobPurpose"
              section="jobSummary"
              value={formData.jobSummary.jobPurpose}
              onChange={(e) => handleChange(e, "jobSummary")}
            />
            <Textarea
              label="Importance"
              name="jobImportance"
              section="jobSummary"
              value={formData.jobSummary.jobImportance}
              onChange={(e) => handleChange(e, "jobSummary")}
            />
            <Textarea
              label="Significance"
              name="jobSignificance"
              section="jobSummary"
              value={formData.jobSummary.jobSignificance}
              onChange={(e) => handleChange(e, "jobSummary")}
            />
            <Textarea
              label="Value"
              name="jobValue"
              section="jobSummary"
              value={formData.jobSummary.jobValue}
              onChange={(e) => handleChange(e, "jobSummary")}
            />
            <Textarea
              label="Contribution"
              name="jobContribution"
              section="jobSummary"
              value={formData.jobSummary.jobContribution}
              onChange={(e) => handleChange(e, "jobSummary")}
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Job Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Deadline"
                name="deadline"
                section="challenges"
                value={formData.challenges.deadline}
                onChange={(e) => handleChange(e, "challenges")}
              />
              <Input
                label="Punctuality"
                name="punctuality"
                section="challenges"
                value={formData.challenges.punctuality}
                onChange={(e) => handleChange(e, "challenges")}
              />
              <Input
                label="Quality"
                name="quality"
                section="challenges"
                value={formData.challenges.quality}
                onChange={(e) => handleChange(e, "challenges")}
              />
              <Input
                label="Accuracy"
                name="accuracy"
                section="challenges"
                value={formData.challenges.accuracy}
                onChange={(e) => handleChange(e, "challenges")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Hierarchy</h2>
            <Textarea
              label="Reporting / Hierarchy Structure"
              name="hierarchy"
              section="hierarchy"
              value={formData.hierarchy.hierarchy}
              onChange={(e) => handleChange(e, "hierarchy")}
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Qualification</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Education"
                name="education"
                section="qualification"
                value={formData.qualification.education}
                onChange={(e) => handleChange(e, "qualification")}
              />
              <Input
                label="Experience"
                name="experience"
                section="qualification"
                value={formData.qualification.experience}
                onChange={(e) => handleChange(e, "qualification")}
              />
              <Input
                label="Overall Qualification"
                name="overallQualification"
                section="qualification"
                value={formData.qualification.overallQualification}
                onChange={(e) => handleChange(e, "qualification")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Working Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Skills"
                name="skills"
                section="workingConditions"
                value={formData.workingConditions.skills}
                onChange={(e) => handleChange(e, "workingConditions")}
              />
              <Input
                label="Knowledge"
                name="knowledge"
                section="workingConditions"
                value={formData.workingConditions.knowledge}
                onChange={(e) => handleChange(e, "workingConditions")}
              />
              <Input
                label="Start Time"
                name="startTime"
                section="workingConditions"
                value={formData.workingConditions.startTime}
                onChange={(e) => handleChange(e, "workingConditions")}
              />
              <Input
                label="End Time"
                name="endTime"
                section="workingConditions"
                value={formData.workingConditions.endTime}
                onChange={(e) => handleChange(e, "workingConditions")}
              />
              <Input
                label="Working Hours"
                name="workingHours"
                section="workingConditions"
                value={formData.workingConditions.workingHours}
                onChange={(e) => handleChange(e, "workingConditions")}
              />
              <Input
                label="Lunch Break"
                name="lunch"
                section="workingConditions"
                value={formData.workingConditions.lunch}
                onChange={(e) => handleChange(e, "workingConditions")}
              />
              <Input
                label="Tea Breaks"
                name="teaBreaks"
                section="workingConditions"
                value={formData.workingConditions.teaBreaks}
                onChange={(e) => handleChange(e, "workingConditions")}
              />
              <Input
                label="Travel Hours"
                name="travelHours"
                section="workingConditions"
                value={formData.workingConditions.travelHours}
                onChange={(e) => handleChange(e, "workingConditions")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Responsibilities</h2>
            <Textarea
              label="Role"
              name="role"
              section="responsibilities"
              value={formData.responsibilities.role}
              onChange={(e) => handleChange(e, "responsibilities")}
            />
            <Textarea
              label="Top Goals"
              name="topGoals"
              section="responsibilities"
              value={formData.responsibilities.topGoals}
              onChange={(e) => handleChange(e, "responsibilities")}
            />
            <Textarea
              label="Communication & Reporting"
              name="communication"
              section="responsibilities"
              value={formData.responsibilities.communication}
              onChange={(e) => handleChange(e, "responsibilities")}
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Competencies</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Knowledge"
                name="knowledge"
                section="competencies"
                value={formData.competencies.knowledge}
                onChange={(e) => handleChange(e, "competencies")}
              />
              <Input
                label="Skill"
                name="skill"
                section="competencies"
                value={formData.competencies.skill}
                onChange={(e) => handleChange(e, "competencies")}
              />
              <Input
                label="Attitude"
                name="attitude"
                section="competencies"
                value={formData.competencies.attitude}
                onChange={(e) => handleChange(e, "competencies")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Promotion & Hiring</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Promotion Type"
                name="promotionType"
                section="promotionHiring"
                value={formData.promotionHiring.promotionType}
                onChange={(e) => handleChange(e, "promotionHiring")}
              />
              <Input
                label="Talent Progress"
                name="talentProgress"
                section="promotionHiring"
                value={formData.promotionHiring.talentProgress}
                onChange={(e) => handleChange(e, "promotionHiring")}
              />
              <Input
                label="Interviewer Focus"
                name="interviewerFocus"
                section="promotionHiring"
                value={formData.promotionHiring.interviewerFocus}
                onChange={(e) => handleChange(e, "promotionHiring")}
              />
              <Input
                label="Hiring Type"
                name="hiringType"
                section="promotionHiring"
                value={formData.promotionHiring.hiringType}
                onChange={(e) => handleChange(e, "promotionHiring")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Cultural Fit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Cultural Misfit"
                name="culturalMisfit"
                section="culturalFit"
                value={formData.culturalFit.culturalMisfit}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Situation-Based Question"
                name="situationQuestion"
                section="culturalFit"
                value={formData.culturalFit.situationQuestion}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Work Culture"
                name="workCulture"
                section="culturalFit"
                value={formData.culturalFit.workCulture}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Boss Expectation"
                name="boss"
                section="culturalFit"
                value={formData.culturalFit.boss}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Work Environment"
                name="environment"
                section="culturalFit"
                value={formData.culturalFit.environment}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Dream Job"
                name="dreamJob"
                section="culturalFit"
                value={formData.culturalFit.dreamJob}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Comfort Level"
                name="comfortLevel"
                section="culturalFit"
                value={formData.culturalFit.comfortLevel}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Team Integration"
                name="teamIntegration"
                section="culturalFit"
                value={formData.culturalFit.teamIntegration}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Collaboration"
                name="collaboration"
                section="culturalFit"
                value={formData.culturalFit.collaboration}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Democratic"
                name="democratic"
                section="culturalFit"
                value={formData.culturalFit.democratic}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Single/Isolative"
                name="singleIsolative"
                section="culturalFit"
                value={formData.culturalFit.singleIsolative}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Directive"
                name="directive"
                section="culturalFit"
                value={formData.culturalFit.directive}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Authoritative"
                name="authoritative"
                section="culturalFit"
                value={formData.culturalFit.authoritative}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
              <Textarea
                label="Potential Growth"
                name="potentialGrowth"
                section="culturalFit"
                value={formData.culturalFit.potentialGrowth}
                onChange={(e) => handleChange(e, "culturalFit")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Evaluation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Performance"
                name="performance"
                section="evaluation"
                value={formData.evaluation.performance}
                onChange={(e) => handleChange(e, "evaluation")}
              />
              <Input
                label="Score Sheet"
                name="scoreSheet"
                section="evaluation"
                value={formData.evaluation.scoreSheet}
                onChange={(e) => handleChange(e, "evaluation")}
              />
              <Input
                label="Mark Sheet"
                name="markSheet"
                section="evaluation"
                value={formData.evaluation.markSheet}
                onChange={(e) => handleChange(e, "evaluation")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Background & History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Reference"
                name="reference"
                section="background"
                value={formData.background.reference}
                onChange={(e) => handleChange(e, "background")}
              />
              <Input
                label="Awards"
                name="awards"
                section="background"
                value={formData.background.awards}
                onChange={(e) => handleChange(e, "background")}
              />
              <Input
                label="Rewards"
                name="rewards"
                section="background"
                value={formData.background.rewards}
                onChange={(e) => handleChange(e, "background")}
              />
              <Input
                label="Promotions"
                name="promotions"
                section="background"
                value={formData.background.promotions}
                onChange={(e) => handleChange(e, "background")}
              />
              <Input
                label="Career Gap"
                name="careerGap"
                section="background"
                value={formData.background.careerGap}
                onChange={(e) => handleChange(e, "background")}
              />
              <Input
                label="Job Hopper"
                name="jobHopper"
                section="background"
                value={formData.background.jobHopper}
                onChange={(e) => handleChange(e, "background")}
              />
              <Input
                label="Stayed Long"
                name="stayedLong"
                section="background"
                value={formData.background.stayedLong}
                onChange={(e) => handleChange(e, "background")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Soft Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Communication"
                name="communication"
                section="softSkills"
                value={formData.softSkills.communication}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Flexibility"
                name="flexibility"
                section="softSkills"
                value={formData.softSkills.flexibility}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Leadership"
                name="leadership"
                section="softSkills"
                value={formData.softSkills.leadership}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Motivation"
                name="motivation"
                section="softSkills"
                value={formData.softSkills.motivation}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Patience"
                name="patience"
                section="softSkills"
                value={formData.softSkills.patience}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Persuasion"
                name="persuasion"
                section="softSkills"
                value={formData.softSkills.persuasion}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Problem Solving"
                name="problemSolving"
                section="softSkills"
                value={formData.softSkills.problemSolving}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Team Work"
                name="teamWork"
                section="softSkills"
                value={formData.softSkills.teamWork}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Decision Making"
                name="decisionMaking"
                section="softSkills"
                value={formData.softSkills.decisionMaking}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Critical Thinking"
                name="criticalThinking"
                section="softSkills"
                value={formData.softSkills.criticalThinking}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Time Management"
                name="timeManagement"
                section="softSkills"
                value={formData.softSkills.timeManagement}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Listening"
                name="listening"
                section="softSkills"
                value={formData.softSkills.listening}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Public Speaking"
                name="publicSpeaking"
                section="softSkills"
                value={formData.softSkills.publicSpeaking}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Visual Communication"
                name="communicationVisual"
                section="softSkills"
                value={formData.softSkills.communicationVisual}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Creative Thinking"
                name="creativeThinking"
                section="softSkills"
                value={formData.softSkills.creativeThinking}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Willingness to Learn"
                name="willingness"
                section="softSkills"
                value={formData.softSkills.willingness}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Adaptability"
                name="adaptability"
                section="softSkills"
                value={formData.softSkills.adaptability}
                onChange={(e) => handleChange(e, "softSkills")}
              />
              <Input
                label="Honesty"
                name="honesty"
                section="softSkills"
                value={formData.softSkills.honesty}
                onChange={(e) => handleChange(e, "softSkills")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Hard Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Functional"
                name="functional"
                section="hardSkills"
                value={formData.hardSkills.functional}
                onChange={(e) => handleChange(e, "hardSkills")}
              />
              <Input
                label="Technical"
                name="technical"
                section="hardSkills"
                value={formData.hardSkills.technical}
                onChange={(e) => handleChange(e, "hardSkills")}
              />
              <Input
                label="Finance"
                name="finance"
                section="hardSkills"
                value={formData.hardSkills.finance}
                onChange={(e) => handleChange(e, "hardSkills")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Background Check</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Rehire Status"
                name="rehireStatus"
                section="backgroundCheck"
                value={formData.backgroundCheck.rehireStatus}
                onChange={(e) => handleChange(e, "backgroundCheck")}
              />
              <Input
                label="Bank Account"
                name="bankAccount"
                section="backgroundCheck"
                value={formData.backgroundCheck.bankAccount}
                onChange={(e) => handleChange(e, "backgroundCheck")}
              />
              <Input
                label="Form 16"
                name="form16"
                section="backgroundCheck"
                value={formData.backgroundCheck.form16}
                onChange={(e) => handleChange(e, "backgroundCheck")}
              />
              <Input
                label="Tele Verification"
                name="teleVerification"
                section="backgroundCheck"
                value={formData.backgroundCheck.teleVerification}
                onChange={(e) => handleChange(e, "backgroundCheck")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Orientation / Induction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Welcome"
                name="welcome"
                section="orientation"
                value={formData.orientation.welcome}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Policies"
                name="policies"
                section="orientation"
                value={formData.orientation.policies}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="HR"
                name="hr"
                section="orientation"
                value={formData.orientation.hr}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Accounts"
                name="accounts"
                section="orientation"
                value={formData.orientation.accounts}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Leaves"
                name="leaves"
                section="orientation"
                value={formData.orientation.leaves}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Salary"
                name="salary"
                section="orientation"
                value={formData.orientation.salary}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Allowances"
                name="allowances"
                section="orientation"
                value={formData.orientation.allowances}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Lunch Times"
                name="lunchTimes"
                section="orientation"
                value={formData.orientation.lunchTimes}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Tea Break Times"
                name="teaBreakTimes"
                section="orientation"
                value={formData.orientation.teaBreakTimes}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Overtime"
                name="overtime"
                section="orientation"
                value={formData.orientation.overtime}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Expectation"
                name="expectation"
                section="orientation"
                value={formData.orientation.expectation}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Role & Goal"
                name="roleGoal"
                section="orientation"
                value={formData.orientation.roleGoal}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Documentation"
                name="documentation"
                section="orientation"
                value={formData.orientation.documentation}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Joining Letter"
                name="joiningLetter"
                section="orientation"
                value={formData.orientation.joiningLetter}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Qualification Proofs"
                name="qualificationProofs"
                section="orientation"
                value={formData.orientation.qualificationProofs}
                onChange={(e) => handleChange(e, "orientation")}
              />
              <Input
                label="Agreement"
                name="agreement"
                section="orientation"
                value={formData.orientation.agreement}
                onChange={(e) => handleChange(e, "orientation")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Final Conclusion</h2>
            <Textarea
              label="Final Conclusion & Remarks"
              name="finalConclusion"
              section="final"
              rows={4}
              value={formData.final.finalConclusion}
              onChange={(e) => handleChange(e, "final")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Interviewer Signature"
                name="interviewerSignature"
                section="final"
                value={formData.final.interviewerSignature}
                onChange={(e) => handleChange(e, "final")}
              />
              <Input
                label="Interview Date"
                name="interviewDate"
                section="final"
                type="date"
                value={formData.final.interviewDate}
                onChange={(e) => handleChange(e, "final")}
              />
            </div>
          </section>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={
                id ? "Update recruitment form" : "Submit recruitment form"
              }
              disabled={loading || !has("hrms.job.interview.schedule")}
            >
              {id ? "Update Form" : "Submit Form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitmentProcess;
