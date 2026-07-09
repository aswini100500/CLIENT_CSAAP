import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  User,
  MapPin,
  Info,
  GraduationCap,
  Briefcase,
  FileText,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";

const TAB_ICONS = {
  basic: User,
  address: MapPin,
  personal: Info,
  education: GraduationCap,
  experience: Briefcase,
  documents: FileText,
  leave: Calendar,
};

import AddressTab from "./AddressTab";
import BasicInfoTab from "./BasicInfoTab";
import DocumentsTab from "./DocumentsTab";
import EducationTab from "./EducationTab";
import ExperienceTab from "./ExperienceTab";
import LeaveAssignmentTab from "./LeaveAssignmentTab";
import PersonalDetailsTab from "./PersonalDetailsTab";
import SalaryBreakdownConfigModal from "./SalaryBreakdownConfigModal";
import { TABS } from "./constants";
import useEmployeeForm from "./useEmployeeForm";
import React from "react";

const 
EmployeeForm = ({ mode = "create", basePath = "/hrms" }) => {
  const {
    // State
    activeTab,
    setActiveTab,
    showPassword,
    setShowPassword,
    isSubmitting,
    isConfirmingEmployee,
    isInitialLoading,
    sameAsPermanent,
    formData,
    educationList,
    experienceList,
    uploadedFiles,
    uploadProgress,
    isUploading,
    otherComponents,
    salaryToggles,
    salaryPolicy,
    isSalaryPolicyLoading,
    isSalaryPolicySaving,
    showSalaryPolicyModal,
    autoCalculate,
    setAutoCalculate,
    readOnlyFields,
    setReadOnlyFields,
    setShowSalaryPolicyModal,
    saveSalaryPolicy,

    leaveData,
    handleLeaveChange,
    // Handlers
    handleInputChange,
    handleFileInput,
    removeUploadedFile,
    handleSameAsPermanent,
    getSalaryWarnings,
    getSalaryErrors,
    handleToggle,
    handleConfirmEmployee,
    handleSubmit,

    // Education
    addEducation,
    removeEducation,
    updateEducation,

    // Experience
    addExperience,
    removeExperience,
    updateExperience,

    // Other components
    addOtherComponent,
    updateOtherComponent,
    removeOtherComponent,

    // Wizard
    currentTabIndex,
    goNext,
    goPrev,

    // Session
    isSessionExpired,
    navigate,
    salaryEffectiveDateExists,
    projectsList,
    departmentsList,
    designationsList,
  } = useEmployeeForm({ mode, basePath });

  const isEditMode = mode === "edit";

  const [contentVisible, setContentVisible] = React.useState(false);

  React.useEffect(() => {
    const revealTimer = setTimeout(() => {
      setContentVisible(true);
    }, 40);

    return () => clearTimeout(revealTimer);
  }, []);

  if (isSessionExpired) {
    Swal.fire("Session Expired", "Please login again", "warning");
    navigate("/login");
    return;
  }

  return (
    <div
      className={`crm-module-root app-shell min-h-screen p-4 py-8 transition-all duration-400 ease-out ${
        contentVisible
          ? "opacity-100 blur-0 translate-y-0"
          : "opacity-0 blur-sm translate-y-2"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative mb-4 pb-2 text-center min-h-16 flex flex-col justify-center">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-full border border-(--border-soft) bg-white px-3 py-1.5 text-[13px] font-bold text-(--text-soft) hover:text-(--brand) hover:border-(--brand) hover:shadow-sm transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
              title="Back"
            >
              <ChevronLeft size={15} className="stroke-[2.5]" />
              <span>Back</span>
            </button>
          </div>

          <div className="mx-auto max-w-md md:max-w-2xl px-20">
            <h1 className="app-title text-2xl font-extrabold text-(--text-strong) tracking-tight">
              {isEditMode ? "Edit Employee" : "Add New Employee"}
            </h1>
            <p className="app-subtitle text-xs text-(--text-faint) mt-1 mx-auto">
              {isEditMode ? "Update employee profile records, settings and leave configurations" : "Create a new employee profile in the system database"}
            </p>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
            <div className="shrink-0 rounded-full bg-(--brand-soft) px-3 py-1 text-[11px] font-bold text-(--brand) border border-(--border-strong) shadow-sm">
              Step {currentTabIndex + 1} of {TABS.length}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-(--border-soft) pb-3">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = TAB_ICONS[tab.id] || User;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-bold tracking-[-0.02em] transition-all duration-200 ${
                    isActive
                      ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                      : "border-(--border-soft) bg-white/88 text-(--text-body) hover:border-(--border-strong) hover:bg-white hover:text-(--brand)"
                  }`}
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(135deg, var(--brand), #00c853)",
                        }
                      : undefined
                  }
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "border border-white/10 bg-white/16 text-white"
                        : "bg-(--bg-subtle) text-(--text-soft)"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isInitialLoading ? (
          <div className="app-panel border border-(--border-soft) p-10 text-center text-(--text-soft) flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin size-8 text-(--brand)" />
            <span className="font-semibold text-sm">Loading employee details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Render Active Tab Content */}
            <div className="mb-6">
              {activeTab === "basic" && (
                <BasicInfoTab
                  formData={formData}
                  isEditMode={isEditMode}
                  handleInputChange={handleInputChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  otherComponents={otherComponents}
                  addOtherComponent={addOtherComponent}
                  updateOtherComponent={updateOtherComponent}
                  removeOtherComponent={removeOtherComponent}
                  getSalaryWarnings={getSalaryWarnings}
                  getSalaryErrors={getSalaryErrors}
                  salaryToggles={salaryToggles}
                  salaryPolicy={salaryPolicy}
                  isSalaryPolicyLoading={isSalaryPolicyLoading}
                  onOpenSalaryPolicyConfig={() =>
                    setShowSalaryPolicyModal(true)
                  }
                  handleToggle={handleToggle}
                  autoCalculate={autoCalculate}
                  setAutoCalculate={setAutoCalculate}
                  readOnlyFields={readOnlyFields}
                  setReadOnlyFields={setReadOnlyFields}
                  salaryEffectiveDateExists={salaryEffectiveDateExists}
                  projectsList={projectsList}
                  departmentsList={departmentsList}
                  designationsList={designationsList}
                />
              )}
              {activeTab === "address" && (
                <AddressTab
                  formData={formData}
                  handleInputChange={handleInputChange}
                  sameAsPermanent={sameAsPermanent}
                  handleSameAsPermanent={handleSameAsPermanent}
                />
              )}
              {activeTab === "personal" && (
                <PersonalDetailsTab
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              )}
              {activeTab === "education" && (
                <EducationTab
                  educationList={educationList}
                  addEducation={addEducation}
                  removeEducation={removeEducation}
                  updateEducation={updateEducation}
                />
              )}
              {activeTab === "experience" && (
                <ExperienceTab
                  experienceList={experienceList}
                  addExperience={addExperience}
                  removeExperience={removeExperience}
                  updateExperience={updateExperience}
                />
              )}
              {activeTab === "documents" && (
                <DocumentsTab
                  uploadedFiles={uploadedFiles}
                  uploadProgress={uploadProgress}
                  isUploading={isUploading}
                  handleFileInput={handleFileInput}
                  removeUploadedFile={removeUploadedFile}
                />
              )}

              {activeTab === "leave" && (
                <LeaveAssignmentTab
                  formData={leaveData}
                  handleInputChange={handleLeaveChange}
                />
              )}
            </div>

            {showSalaryPolicyModal && (
              <SalaryBreakdownConfigModal
                policy={salaryPolicy}
                saving={isSalaryPolicySaving}
                onSave={saveSalaryPolicy}
                onCancel={() => setShowSalaryPolicyModal(false)}
              />
            )}

            {/* Wizard Navigation + Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-(--border-soft)">
              {/* Left side – Previous */}
              <div>
                {currentTabIndex > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goPrev();
                    }}
                    className="app-btn-secondary flex items-center gap-2 px-6 py-2"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                )}
              </div>

              {/* Right side – Cancel / Next / Save */}
              <div className="flex gap-3">
                {isEditMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleConfirmEmployee}
                      className="app-btn-primary bg-linear-to-r from-emerald-600 to-green-600 text-white flex items-center gap-2 px-6 py-2 active:scale-[0.98]"
                      disabled={isConfirmingEmployee || isSubmitting}
                    >
                      {isConfirmingEmployee ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Confirm Employee
                        </>
                      )}
                    </button>

                    <button
                      key="btn-done"
                      type="submit"
                      className="app-btn-primary flex items-center gap-2 px-6 py-2 active:scale-[0.98]"
                      disabled={
                        isUploading ||
                        isSubmitting ||
                        getSalaryErrors().length > 0
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Done
                        </>
                      )}
                    </button>

                    <button
                      key="btn-next"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        goNext();
                      }}
                      className="app-btn-secondary text-(--brand) border-(--border-strong) flex items-center gap-2 px-6 py-2 active:scale-[0.98]"
                      disabled={currentTabIndex >= TABS.length - 1}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="app-btn-secondary px-6 py-2"
                      onClick={() => navigate(`${basePath}/joined-employee`)}
                    >
                      Cancel
                    </button>

                    {activeTab !== "leave" ? (
                      <button
                        key="btn-next"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          goNext();
                        }}
                        className="app-btn-primary flex items-center gap-2 px-6 py-2 active:scale-[0.98]"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        key="btn-save"
                        type="submit"
                        className="app-btn-primary flex items-center gap-2 px-6 py-2 active:scale-[0.98]"
                        disabled={
                          isUploading ||
                          isSubmitting ||
                          getSalaryErrors().length > 0
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            {isUploading
                              ? "Uploading..."
                              : isEditMode
                                ? "Update Employee"
                                : "Save Employee"}
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;
