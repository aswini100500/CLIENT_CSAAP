import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../../hooks/useAuth";
import { calculateTotalYearlyLeave, COUNTRY_CODES, TABS } from "./constants";
import {
  DEFAULT_SALARY_BREAKDOWN_POLICY,
  deriveSalaryToggles,
  normalizeSalaryBreakdownPolicy,
  recalculateSalaryBreakdown,
} from "./salaryBreakdownUtils";

const SINGLE_FILE_FIELDS = [
  "cv",
  "experienceCertificate",
  "relievingLetter",
  "photo",
  "profilePhoto",
  "aadhar",
  "pan",
];

const MULTI_FILE_FIELDS = [
  "educationalCertificates",
  "termandconditionCertificates",
];

const cloneFormData = (source) => {
  const cloned = new FormData();
  for (const [key, value] of source.entries()) {
    cloned.append(key, value);
  }
  return cloned;
};

const parsePhone = (fullPhone, countryCodes) => {
  if (!fullPhone) return { phoneCode: "+91", phone: "" };
  const cleanedPhone = String(fullPhone).trim();

  // Try to find if it starts with any of the country dial codes
  // Sort country codes by dial code length descending to match longer dial codes first (e.g. +971 before +9)
  const sortedCodes = [...countryCodes].sort((a, b) => b.dial_code.length - a.dial_code.length);
  for (const c of sortedCodes) {
    if (cleanedPhone.startsWith(c.dial_code)) {
      let rawPhone = cleanedPhone.substring(c.dial_code.length).trim();
      // Remove leading hyphens or spaces if present
      if (rawPhone.startsWith("-")) {
        rawPhone = rawPhone.substring(1).trim();
      }
      return { phoneCode: c.dial_code, phone: rawPhone };
    }
  }

  // If no match is found, check if it starts with "+" anyway and try to split by space
  if (cleanedPhone.startsWith("+")) {
    const parts = cleanedPhone.split(/\s+/);
    if (parts.length > 1) {
      const parsedCode = parts[0];
      const parsedPhone = parts.slice(1).join(" ");
      return { phoneCode: parsedCode, phone: parsedPhone };
    }
  }

  // Fallback: entire phone is raw phone, default phoneCode to +91
  return { phoneCode: "+91", phone: cleanedPhone };
};

const formatTimeWithSeconds = (time) => {
  if (!time) return null;
  const parts = time.split(":");
  if (parts.length === 2) {
    return `${time}:00`;
  }
  return time;
};

const normalizeList = (value, fallback) => {
  if (Array.isArray(value)) return value.length > 0 ? value : fallback;

  if (typeof value === "string" && value.trim()) {
    let current = value;

    for (let i = 0; i < 10; i += 1) {
      try {
        const parsed = JSON.parse(current);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed : fallback;
        }
        if (typeof parsed === "string" && parsed.trim()) {
          current = parsed;
          continue;
        }
        break;
      } catch (error) {
        console.warn("Failed to parse list value", error);
        break;
      }
    }
  }

  return fallback;
};

const normalizeFileList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Stored employee documents are comma-separated filenames in older rows.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const toExistingFileObject = (value) => {
  if (!value) return null;
  if (typeof value === "object" && (value.actualFile || value.name)) {
    return { ...value, existing: true };
  }

  const rawValue = String(value).trim();
  if (!rawValue) return null;

  return {
    name: rawValue.split("/").pop()?.split("\\").pop() || rawValue,
    preview: rawValue,
    existing: true,
  };
};

const useEmployeeForm = ({
  mode = "create",
  basePath = "/hrms",
} = {}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmingEmployee, setIsConfirmingEmployee] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(mode === "edit");
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    aadharNo: "",
    panNo: "",
    gender: "",
    phone: "",
    phoneCode: "+91",
    email: "",
    officeEmail: "",
    ot_allowed: false,
    postApplied: "",
    storeAssign: "",
    employeeStatus: "",
    employeeShift: "",
    shiftStart: "",
    shiftEnd: "",
    password: "",
    salary: "",
    ctc: "",
    basic: "",
    hra: "",
    ta: "",
    da: "",
    special_allowance: "",
    variable_pay_annual: "",
    epf: "",
    epf_employer: "",
    esi: "",
    esi_employer: "",
    lwf: "",
    pt: "",

    tax_regime: "NEW",
    gross_anual: "",
    effective_from: new Date().toLocaleDateString('en-CA'),
    bloodGroup: "",
    epfoId: "",
    permanentAddress1: "",
    permanentAddress2: "",
    permanentCountry: "",
    permanentState: "",
    permanentDistrict: "",
    permanentZipCode: "",
    presentAddress1: "",
    presentAddress2: "",
    presentCountry: "",
    presentState: "",
    presentDistrict: "",
    presentZipCode: "",
    dob: "",
    maritalStatus: "",
    nationality: "",
    fatherName: "",
    fathers_identity: "",
    probation_period: "",
    department: "",
    bankname: "",
    accountnumber: "",
    ifsc_code: "",
    branch: "",
    mode_of_payment: "",
    registered_emp_id: "",
  });

  const [educationList, setEducationList] = useState([
    {
      id: 1,
      course: "",
      board: "",
      passingYear: "",
      institute: "",
      graduationType: "",
    },
  ]);

  const [experienceList, setExperienceList] = useState([
    {
      id: 1,
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);

  // ─── Leave Management States (add this RIGHT HERE, after formData) ───
  const [leaveData, setLeaveData] = useState({
    yearly_cl: "",
    yearly_el: "",
    yearly_ml: "",
    total_yearly_leave: "",
    monthly_cl: "",
    monthly_el: "",
    monthly_ml: "",
    monthly_carry_forward_cl: "",
    monthly_carry_forward_el: "",
    monthly_carry_forward_ml: "",
    yearly_carry_forward_cl: "",
    yearly_carry_forward_el: "",
    yearly_carry_forward_ml: "",
    allow_negative_balance: false,
    leave_accrual_start: "",
    leave_year_start: "",
    min_balance_required: "",
    enable_encashment: false,
    max_encashable_days: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    cv: null,
    experienceCertificate: null,
    relievingLetter: null,
    photo: null,
    aadhar: null,
    pan: null,
    profilePhoto: null,
    educationalCertificates: [],
    termandconditionCertificates: [],
  });

  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // ─── Other Components (dynamic JSON array) ───
  const [otherComponents, setOtherComponents] = useState([]);

  const addOtherComponent = () => {
    setOtherComponents((prev) => {
      const next = [
        ...prev,
        { name: "", amount: "", type: "earning", is_taxable: true },
      ];
      if (autoCalculate) {
        setFormData((prevData) => ({
          ...prevData,
          ...recalcFromCTC(prevData, salaryToggles, next),
        }));
      }
      return next;
    });
  };

  const updateOtherComponent = (index, field, value) => {
    setOtherComponents((prev) => {
      const next = prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      if (autoCalculate) {
        setFormData((prevData) => ({
          ...prevData,
          ...recalcFromCTC(prevData, salaryToggles, next),
        }));
      }
      return next;
    });
  };

  const removeOtherComponent = (index) => {
    setOtherComponents((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (autoCalculate) {
        setFormData((prevData) => ({
          ...prevData,
          ...recalcFromCTC(prevData, salaryToggles, next),
        }));
      }
      return next;
    });
  };

  // ─── Leave Change Handler (add this with other handlers) ───
  const handleLeaveChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setLeaveData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // Auto-calculate total yearly leave
      if (["yearly_cl", "yearly_el", "yearly_ml"].includes(name)) {
        const cl = name === "yearly_cl" ? newValue : prev.yearly_cl;
        const el = name === "yearly_el" ? newValue : prev.yearly_el;
        const ml = name === "yearly_ml" ? newValue : prev.yearly_ml;

        updated.total_yearly_leave = calculateTotalYearlyLeave(cl, el, ml);
      }

      return updated;
    });
  };

  // ─── Reset Leave Data (add this with other handlers) ───
  // Replace the resetLeaveData function with this version that has proper defaults:

  const resetLeaveData = () => {
    setLeaveData({
      yearly_cl: "",
      yearly_el: "",
      yearly_ml: "",
      total_yearly_leave: "",
      monthly_cl: "",
      monthly_el: "",
      monthly_ml: "",
      monthly_carry_forward_cl: "",
      monthly_carry_forward_el: "",
      monthly_carry_forward_ml: "",
      yearly_carry_forward_cl: "",
      yearly_carry_forward_el: "",
      yearly_carry_forward_ml: "",
      allow_negative_balance: false,
      leave_accrual_start: "",
      leave_year_start: "",
      min_balance_required: "",
      enable_encashment: false,
      max_encashable_days: "",
    });
  };

  // ─── Auto Calculate & Read Only ───
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [readOnlyFields, setReadOnlyFields] = useState(true);
  const [salaryPolicy, setSalaryPolicy] = useState(
    DEFAULT_SALARY_BREAKDOWN_POLICY,
  );
  const [isSalaryPolicyLoading, setIsSalaryPolicyLoading] = useState(false);
  const [isSalaryPolicySaving, setIsSalaryPolicySaving] = useState(false);
  const [showSalaryPolicyModal, setShowSalaryPolicyModal] = useState(false);

  // ─── Salary Toggles (optional components) ───
  const [salaryToggles, setSalaryToggles] = useState({
    hra: true,
    epf: true,
    esi: true,
    pt: false,
    lwf: false,
  });

  const [salaryEffectiveDateExists, setSalaryEffectiveDateExists] =
    useState(false);
  const salaryPolicyRef = useRef(salaryPolicy);

  // ─── Projects List ───
  const [projectsList, setProjectsList] = useState([]);



  // ─── Departments List ───
  const [departmentsList, setDepartmentsList] = useState([]);

  // ─── Designations List ───
  const [designationsList, setDesignationsList] = useState([]);

  useEffect(() => {
    salaryPolicyRef.current = salaryPolicy;
  }, [salaryPolicy]);

  const handleToggle = (field) => {
    setSalaryToggles((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      // Trigger full recalc with new toggles
      setFormData((prevData) => {
        const result = recalcFromCTC(
          prevData,
          next,
          otherComponents,
          salaryPolicy,
        );
        return { ...prevData, ...result };
      });
      return next;
    });
  };

  const { user } = useAuth();
  const role = user.role;
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const employeeId = useMemo(
    () => location.state?.applicationId || id || null,
    [id, location.state],
  );
  const hrmsToken = user.token;
  const csaapToken = user.csaapToken || user.token;
  const companyId =
    user?.company_id || user?.id;
  console.log("Company ID in useEmployeeForm:", companyId);

  // ─── Core salary recalculation (policy-driven) ───
  const recalcFromCTC = (
    data,
    toggles,
    otherComps = [],
    policy = salaryPolicy,
  ) => recalculateSalaryBreakdown(data, toggles, otherComps, policy);

  useEffect(() => {
    const fetchSalaryPolicy = async () => {
      const companySlug = user?.slug;
      if (!companyId || !companySlug) return;

      try {
        setIsSalaryPolicyLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/salary-breakdown-policies`,
          {
            params: { company_id: companyId, company_slug: companySlug },
          },
        );

        if (response.data?.success && response.data?.data) {
          const normalizedPolicy = normalizeSalaryBreakdownPolicy(
            response.data.data,
          );
          const nextToggles = deriveSalaryToggles(normalizedPolicy);

          setSalaryPolicy(normalizedPolicy);
          setSalaryToggles(nextToggles);
          setFormData((prevData) => {
            if (!prevData.ctc || !autoCalculate) return prevData;
            return {
              ...prevData,
              ...recalculateSalaryBreakdown(
                prevData,
                nextToggles,
                otherComponents,
                normalizedPolicy,
              ),
            };
          });
        }
      } catch (error) {
        console.error("Error fetching salary breakdown policy:", error);
      } finally {
        setIsSalaryPolicyLoading(false);
      }
    };

    fetchSalaryPolicy();
  }, [companyId, user?.slug]);

  useEffect(() => {
    if (mode !== "create") return;

    // In the useEffect for create mode, update the fetchLeavePolicyTemplate function:

    const fetchLeavePolicyTemplate = async () => {
      const companySlug = user?.slug;
      if (!companySlug) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/leavepolicy/${companySlug}`,
          { withCredentials: true },
        );

        if (response.data?.success && response.data?.data?.length > 0) {
          const leavePolicy = response.data.data[0];
          setLeaveData((prev) => ({
            ...prev,
            yearly_cl: leavePolicy.yearly_CL || "",
            yearly_el: leavePolicy.yearly_EL || "",
            yearly_ml: leavePolicy.yearly_ML || "",
            total_yearly_leave:
              leavePolicy.total_leaves ||
              calculateTotalYearlyLeave(
                leavePolicy.yearly_CL,
                leavePolicy.yearly_EL,
                leavePolicy.yearly_ML,
              ),
            monthly_cl: leavePolicy.monthly_CL || "",
            monthly_el: leavePolicy.monthly_EL || "",
            monthly_ml: leavePolicy.monthly_ML || "",
            monthly_carry_forward_cl: leavePolicy.max_monthly_cf_CL || "",
            monthly_carry_forward_el: leavePolicy.max_monthly_cf_EL || "",
            monthly_carry_forward_ml: leavePolicy.max_monthly_cf_ML || "",
            yearly_carry_forward_cl: leavePolicy.max_carry_forward_CL || "",
            yearly_carry_forward_el: leavePolicy.max_carry_forward_EL || "",
            yearly_carry_forward_ml: leavePolicy.max_carry_forward_ML || "",
            allow_negative_balance:
              leavePolicy.allow_negative_balance === 1 ||
              leavePolicy.allow_negative_balance === true,
            leave_accrual_start: leavePolicy.leave_accrual_start || "",
            leave_year_start: leavePolicy.leave_year_start || "",
            min_balance_required: leavePolicy.min_balance_required || "",
            enable_encashment:
              leavePolicy.enable_encashment === 1 ||
              leavePolicy.enable_encashment === true,
            max_encashable_days: leavePolicy.max_encashable_days || "",
          }));
        } else {
          // No template found - use defaults silently
          console.log("No leave policy template found, using defaults");
        }
      } catch (error) {
        // Silently handle missing template - just use defaults
        const status = error?.response?.status;
        const message = error?.response?.data?.message || "";

        if (status === 404 || message.toLowerCase().includes("not found")) {
          console.log("Leave policy template not found, using default values");
        } else {
          // Only log unexpected errors
          console.error("Error fetching leave policy template:", error);
        }
        // Keep default values, don't show Swal error
      }
    };
    fetchLeavePolicyTemplate();
  }, [mode, user?.slug]);

  // ─── Fetch Projects & Employees ───
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "https://api.cloudsat.in/api/superadmin/projects",
          {
            headers: { Authorization: `Bearer ${csaapToken || hrmsToken}` },
          },
        );
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data)) {
          const names = data.map((p) => p.name).filter(Boolean);
          setProjectsList([...new Set(names)]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };



    const fetchDepartmentsAndRoles = async () => {
      try {
        const response = await axios.get(
          "https://csaapnodeapi.csaap.com/api/tenant/departments/roles",
          {
            headers: { Authorization: `Bearer ${csaapToken || hrmsToken}` },
          },
        );
        if (response.data?.success && Array.isArray(response.data.data)) {
          const data = response.data.data;

          // Extract unique department names from department_name field
          const deptNames = [
            ...new Set(data.map((item) => item.department_name).filter(Boolean)),
          ];
          setDepartmentsList(deptNames);

          // Extract unique role objects with department name mapping
          const seen = new Set();
          const mappedDesignations = [];
          data.forEach((item) => {
            if (item.department_name && item.role_name) {
              const key = `${item.department_name}||${item.role_name}`;
              if (!seen.has(key)) {
                seen.add(key);
                mappedDesignations.push({
                  department: item.department_name,
                  designation: item.role_name,
                });
              }
            }
          });
          setDesignationsList(mappedDesignations);
        }
      } catch (error) {
        console.error("Error fetching departments and roles:", error);
      }
    };

    if (csaapToken || hrmsToken) {
      fetchProjects();
      fetchDepartmentsAndRoles();
    }
  }, [csaapToken, hrmsToken]);

  useEffect(() => {
    if (mode !== "edit") {
      setIsInitialLoading(false);
      return;
    }

    if (!employeeId) {
      setIsInitialLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        setIsInitialLoading(true);
        const employeeRes = await axios.get(
          `https://csaapnodeapi.csaap.com/api/tenant/hrms/get-employee/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${csaapToken || hrmsToken}` },
          },
        );

        const employee = employeeRes.data?.data || {};
        let salaryBreakdown = null;

        try {
          const salaryRes = await axios.get(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/salary-breakdown/employee/${employeeId}`,
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${hrmsToken}` },
            },
          );
          salaryBreakdown = salaryRes.data?.data || null;
        } catch (salaryError) {
          const message = salaryError?.response?.data?.message || "";
          if (message.toLowerCase() !== "salary breakdown not found") {
            console.error("Error fetching salary breakdown:", salaryError);
          }
        }

        const parsedPhone = parsePhone(employee.phone || "", COUNTRY_CODES);

        const nextFormData = {
          ...employee,
          ...(salaryBreakdown || {}),
          phone: parsedPhone.phone,
          phoneCode: parsedPhone.phoneCode,
          ot_allowed:
            employee.ot_allowed === 1 ||
            employee.ot_allowed === true ||
            employee.ot_allowed === "1",
          shiftStart: employee.shiftStart || employee.shift_start || "",
          shiftEnd: employee.shiftEnd || employee.shift_end || "",
          bloodGroup: employee.bloodGroup || employee.blood_group || "",
          epfoId: employee.epfoId || employee.epfo_id || "",
          maritalStatus:
            employee.maritalStatus || employee.marital_status || "",
          fathers_identity: employee.fathers_identity || "",
          dob: (employee.dob || "")?.split("T")[0],
          effective_from: (salaryBreakdown?.effective_from || new Date().toLocaleDateString('en-CA'))?.split(
            "T",
          )[0],
          probation_period: employee.probation_period || employee.provision_period || "",
          bankname: employee.bankname || employee.bankName || "",
          accountnumber: employee.accountnumber || employee.accountNumber || employee.accountNo || employee.account_no || "",
          ifsc_code: employee.ifsc_code || employee.ifscCode || employee.ifsc || "",
          branch: employee.branch || employee.branchName || "",
          mode_of_payment: employee.mode_of_payment || employee.modeOfPayment || "",
          registered_emp_id: employee.registered_emp_id || "",
        };
        delete nextFormData.education;
        delete nextFormData.experience;
        delete nextFormData.other_components;
        delete nextFormData.marriageDate;
        delete nextFormData.marriage_date;
        delete nextFormData.religion;
        delete nextFormData.caste;
        delete nextFormData.fatherOccupation;
        delete nextFormData.provision_period;

        setFormData((prevData) => ({
          ...prevData,
          ...nextFormData,
        }));
        setSalaryEffectiveDateExists(!!salaryBreakdown?.effective_from);
        setEducationList(
          normalizeList(employee.education, [
            {
              id: 1,
              course: "",
              board: "",
              passingYear: "",
              institute: "",
              graduationType: "",
            },
          ]).map((edu, idx) => ({
            id: edu.id || idx + 1,
            course: edu.course || edu.degree || "",
            board: edu.board || "",
            passingYear: edu.passingYear || edu.year || "",
            institute: edu.institute || "",
            graduationType: edu.graduationType || "",
          }))
        );
        setExperienceList(
          normalizeList(employee.experience, [
            {
              id: 1,
              jobTitle: "",
              company: "",
              startDate: "",
              endDate: "",
              description: "",
            },
          ]),
        );
        setOtherComponents(
          normalizeList(salaryBreakdown?.other_components, []),
        );
        setSalaryToggles(deriveSalaryToggles(salaryPolicyRef.current));

        setUploadedFiles((prev) => {
          const next = { ...prev };
          SINGLE_FILE_FIELDS.forEach((field) => {
            const value =
              field === "profilePhoto"
                ? employee.profilePhoto || employee.profile_photo
                : employee[field];
            next[field] = toExistingFileObject(value);
          });
          MULTI_FILE_FIELDS.forEach((field) => {
            next[field] = normalizeFileList(employee[field])
              .map((item) => toExistingFileObject(item))
              .filter(Boolean);
          });
          return next;
        });

        // In the useEffect that fetches employee data (mode === "edit"), replace the leave policy fetching section:

        if (user?.slug) {
          try {
            const leaveRes = await axios.get(
              `${import.meta.env.VITE_HRMS_BASE_URL}/api/leavepolicy/${user.slug}/${employeeId}`,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${hrmsToken}` },
              },
            );

            const leavePolicy = leaveRes?.data?.data;
            if (leavePolicy) {
              setLeaveData((prev) => ({
                ...prev,
                yearly_cl: leavePolicy.yearly_CL || "",
                yearly_el: leavePolicy.yearly_EL || "",
                yearly_ml: leavePolicy.yearly_ML || "",
                total_yearly_leave:
                  leavePolicy.total_leaves ||
                  calculateTotalYearlyLeave(
                    leavePolicy.yearly_CL,
                    leavePolicy.yearly_EL,
                    leavePolicy.yearly_ML,
                  ),
                monthly_cl: leavePolicy.monthly_CL || "",
                monthly_el: leavePolicy.monthly_EL || "",
                monthly_ml: leavePolicy.monthly_ML || "",
                monthly_carry_forward_cl: leavePolicy.max_monthly_cf_CL || "",
                monthly_carry_forward_el: leavePolicy.max_monthly_cf_EL || "",
                monthly_carry_forward_ml: leavePolicy.max_monthly_cf_ML || "",
                yearly_carry_forward_cl: leavePolicy.max_carry_forward_CL || "",
                yearly_carry_forward_el: leavePolicy.max_carry_forward_EL || "",
                yearly_carry_forward_ml: leavePolicy.max_carry_forward_ML || "",
                allow_negative_balance:
                  leavePolicy.allow_negative_balance === 1 ||
                  leavePolicy.allow_negative_balance === true,
                leave_accrual_start: leavePolicy.leave_accrual_start || "",
                leave_year_start: leavePolicy.leave_year_start || "",
                min_balance_required: leavePolicy.min_balance_required || "",
                enable_encashment:
                  leavePolicy.enable_encashment === 1 ||
                  leavePolicy.enable_encashment === true,
                max_encashable_days: leavePolicy.max_encashable_days || "",
              }));
            } else {
              // Fallback: keep default values (no error)
              console.log("No leave policy found, using defaults");
            }
          } catch (leaveError) {
            // Silently handle 404/not found - just use defaults without showing error
            const status = leaveError?.response?.status;
            const message = leaveError?.response?.data?.message || "";

            if (status === 404 || message.toLowerCase().includes("not found")) {
              // Leave policy not found - that's fine, we'll use defaults
              console.log("Leave policy not found for employee, using default values");
            } else {
              // Only log other unexpected errors
              console.error("Error fetching leave policy:", leaveError);
            }
            // Don't show Swal error for missing leave policy
          }
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        Swal.fire("Error", "Failed to load employee data", "error");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId, hrmsToken, mode, user?.slug]);

  const saveSalaryPolicy = async (nextPolicy) => {
    const companySlug = user?.slug;
    if (!companyId || !companySlug) return;

    try {
      setIsSalaryPolicySaving(true);
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/salary-breakdown-policies`,
        {
          ...nextPolicy,
          company_id: companyId,
          company_slug: companySlug,
        },
      );

      if (response.data?.success && response.data?.data) {
        const normalizedPolicy = normalizeSalaryBreakdownPolicy(
          response.data.data,
        );
        const nextToggles = deriveSalaryToggles(normalizedPolicy);

        setSalaryPolicy(normalizedPolicy);
        setSalaryToggles(nextToggles);
        if (autoCalculate) {
          setFormData((prevData) => ({
            ...prevData,
            ...recalculateSalaryBreakdown(
              prevData,
              nextToggles,
              otherComponents,
              normalizedPolicy,
            ),
          }));
        }
        setShowSalaryPolicyModal(false);
        Swal.fire("Success", "Salary breakdown policy updated!", "success");
      }
    } catch (error) {
      console.error("Error updating salary breakdown policy:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message ||
        "Failed to update salary breakdown policy",
        "error",
      );
    } finally {
      setIsSalaryPolicySaving(false);
    }
  };

  // ─── Input change handler (with CTC auto-calc) ───
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === "checkbox" ? checked : value;

    if ((name === "email" || name === "officeEmail") && typeof nextValue === "string") {
      nextValue = nextValue.toLowerCase();
    }

    if (name === "phone" && typeof nextValue === "string") {
      nextValue = nextValue.replace(/\D/g, ""); // strip non-digits
    }

    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: nextValue,
        postApplied: "", // Reset designation when department changes
      }));
      return;
    }

    if (name === "ctc" || name === "variable_pay_annual") {
      if (autoCalculate) {
        // Full recalc when CTC or Variable Pay changes
        setFormData((prev) => {
          const updated = { ...prev, [name]: nextValue };
          const derived = recalcFromCTC(
            updated,
            salaryToggles,
            otherComponents,
            salaryPolicy,
          );
          return { ...updated, ...derived };
        });
      } else {
        setFormData((prev) => ({ ...prev, [name]: nextValue }));
      }
      return;
    }

    // PT and LWF: manual entry, no recalc
    if (name === "pt" || name === "lwf") {
      setFormData((prev) => ({ ...prev, [name]: nextValue }));
      return;
    }

    // Non-salary field — just update as-is
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  // ─── File upload helpers ───
  const handleFileUpload = async (fileType, file) => {
    setIsUploading(true);
    setUploadProgress((prev) => ({ ...prev, [fileType]: 0 }));

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 80));
      setUploadProgress((prev) => ({ ...prev, [fileType]: i }));
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [fileType]: { preview: URL.createObjectURL(file), actualFile: file },
    }));

    Swal.fire("Success!", `${fileType} uploaded successfully!`, "success");

    setIsUploading(false);
    setUploadProgress((prev) => ({ ...prev, [fileType]: 0 }));
  };

  const handleMultiFileUpload = async (fileType, files) => {
    setIsUploading(true);

    const uploaded = Array.from(files).map((file) => ({
      preview: URL.createObjectURL(file),
      actualFile: file,
    }));

    setUploadedFiles((prev) => ({
      ...prev,
      [fileType]: [...prev[fileType], ...uploaded],
    }));

    setIsUploading(false);
    Swal.fire("Success!", `${fileType} uploaded successfully!`, "success");
  };

  const handleFileInput = (fileType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageTypes = ["photo", "profilePhoto"];
    const documentTypes = [
      "cv",
      "experienceCertificate",
      "relievingLetter",
      "aadhar",
      "pan",
    ];

    if (imageTypes.includes(fileType)) {
      if (!file.type.startsWith("image/")) {
        Swal.fire("Error", "Please upload an image file", "error");
        return;
      }
    }

    if (documentTypes.includes(fileType)) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire(
          "Error",
          "Please upload PDF, DOC, DOCX, JPEG or PNG only",
          "error",
        );
        return;
      }
    }

    if (MULTI_FILE_FIELDS.includes(fileType)) {
      handleMultiFileUpload(fileType, e.target.files);
    } else {
      handleFileUpload(fileType, file);
    }

    e.target.value = "";
  };

  const removeUploadedFile = (fileType, index = null) => {
    if (MULTI_FILE_FIELDS.includes(fileType) && index !== null) {
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: prev[fileType].filter((_, i) => i !== index),
      }));
    } else {
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: null,
      }));
    }
  };

  /* ─── Same-as-Permanent handler ─── */
  const handleSameAsPermanent = (checked) => {
    setSameAsPermanent(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        presentAddress1: prev.permanentAddress1,
        presentAddress2: prev.permanentAddress2,
        presentCountry: prev.permanentCountry,
        presentState: prev.permanentState,
        presentDistrict: prev.permanentDistrict,
        presentZipCode: prev.permanentZipCode,
      }));
    }
  };

  /* ─── Salary deviation warnings ─── */
  const getSalaryWarnings = () => {
    const warnings = [];
    const ctc = parseFloat(formData.ctc) || 0;
    const basic = parseFloat(formData.basic) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const epfEmployer = parseFloat(formData.epf_employer) || 0;
    const esiEmployer = parseFloat(formData.esi_employer) || 0;
    const variablePay = parseFloat(formData.variable_pay_annual) || 0;
    const special = parseFloat(formData.special_allowance) || 0;
    const grossAnnual = parseFloat(formData.gross_anual) || 0;

    if (ctc === 0) return [];
    const tolerance = parseFloat(salaryPolicy.rounding_tolerance) || 1;

    const totalOtherEarningsAnnual = otherComponents
      .filter((comp) => comp.type === "earning")
      .reduce((sum, comp) => sum + (parseFloat(comp.amount) || 0), 0);

    // ── CTC component sum check ──
    // CTC = Basic + HRA + Special + EPF_employer + ESI_employer + Variable + Other Earnings
    const ta = parseFloat(formData.ta) || 0;
    const da = parseFloat(formData.da) || 0;

    const componentSum =
      basic +
      hra +
      ta +
      da +
      special +
      epfEmployer +
      esiEmployer +
      variablePay +
      totalOtherEarningsAnnual;
    if (Math.abs(componentSum - ctc) > tolerance)
      warnings.push(
        `CTC components don't add up — sum is ₹${componentSum.toFixed(2)} vs CTC ₹${ctc.toFixed(2)} (gap: ₹${Math.abs(componentSum - ctc).toFixed(2)}). Allowed tolerance is ₹${tolerance.toFixed(2)}.`,
      );

    // ── Special Allowance negative check ──
    if (special < 0)
      warnings.push(
        `Employer costs exceed CTC — Special Allowance is negative (₹${special.toFixed(2)}). Reduce components or increase CTC.`,
      );

    // ── Gross Annual sanity check ──
    const expectedGrossAnnual =
      basic + hra + ta + da + special + totalOtherEarningsAnnual;
    if (
      grossAnnual > 0 &&
      Math.abs(grossAnnual - expectedGrossAnnual) > tolerance
    )
      warnings.push(
        `Gross Annual mismatch — expected ₹${expectedGrossAnnual.toFixed(2)}`,
      );

    return warnings;
  };

  /* ─── Salary hard errors (block submit) ─── */
  const getSalaryErrors = () => {
    const errors = [];
    const ctc = parseFloat(formData.ctc) || 0;
    if (ctc === 0) return [];

    const result = recalcFromCTC(
      formData,
      salaryToggles,
      otherComponents,
      salaryPolicy,
    );
    if (result._special_overflow > 0) {
      errors.push(
        `Other earnings exceed the available Special Allowance by ₹${result._special_overflow.toFixed(2)}. Decrease the earning amounts to fit within CTC, or raise the CTC.`,
      );
    }
    return errors;
  };

  const validateCurrentTab = () => {
    const formElement = document.querySelector("form");
    if (formElement) {
      const isValid = formElement.checkValidity();
      if (!isValid) {
        formElement.reportValidity();
        return false;
      }
    }
    return true;
  };

  const handleSetActiveTab = (tabId) => {
    const targetIndex = TABS.findIndex((t) => t.id === tabId);
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);

    if (targetIndex > currentIndex) {
      if (!validateCurrentTab()) {
        return;
      }
    }
    setActiveTab(tabId);
  };

  /* ─── Wizard helpers ─── */
  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const goNext = () => {
    if (currentTabIndex < TABS.length - 1) {
      if (!validateCurrentTab()) {
        return;
      }
      setActiveTab(TABS[currentTabIndex + 1].id);
    }
  };
  const goPrev = () => {
    if (currentTabIndex > 0) setActiveTab(TABS[currentTabIndex - 1].id);
  };

  const handleConfirmEmployee = async () => {
    if (!employeeId) {
      Swal.fire("Error", "Employee id is missing", "error");
      return;
    }

    try {
      setIsConfirmingEmployee(true);

      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/${employeeId}/accept`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${hrmsToken || csaapToken}`,
          },
        },
      );

      await axios.put(
        `https://csaapnodeapi.csaap.com/api/tenant/hrms/update-employee/${employeeId}`,
        { employeeStatus: "Permanent" },
        {
          headers: {
            Authorization: `Bearer ${csaapToken || hrmsToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      setFormData((prev) => ({
        ...prev,
        employeeStatus: "Permanent",
        status: "Accepted",
      }));

      Swal.fire("Success", "Employee confirmed successfully!", "success");
    } catch (error) {
      console.error("Error confirming employee:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to confirm employee",
        "error",
      );
    } finally {
      setIsConfirmingEmployee(false);
    }
  };

  /* ─── Education helpers ─── */
  const addEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        course: "",
        board: "",
        passingYear: "",
        institute: "",
        graduationType: "",
      },
    ]);
  };

  const removeEducation = (id) => {
    if (educationList.length > 1) {
      setEducationList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateEducation = (id, field, value) => {
    setEducationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  /* ─── Experience helpers ─── */
  const addExperience = () => {
    setExperienceList((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        jobTitle: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (id) => {
    if (experienceList.length > 1) {
      setExperienceList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateExperience = (id, field, value) => {
    setExperienceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  /* ─── Form submission ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: create flow still uses the wizard, edit flow can be saved from any tab.
    if (mode !== "edit" && activeTab !== "leave") {
      goNext();
      return;
    }

    const salaryErrors = getSalaryErrors();
    if (salaryErrors.length > 0) {
      Swal.fire("Salary Error", salaryErrors[0], "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const combinedPhone = formData.phoneCode
        ? `${formData.phoneCode} ${formData.phone}`.trim()
        : formData.phone;

      const csaapPayload = {
        company_id: companyId,
        company_slug: user?.slug,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: combinedPhone || null,
        ot_allowed: formData.ot_allowed ? 1 : 0,
        salary: formData.salary || null,
        epfo_id: formData.epfo_id || null,
        postApplied: formData.postApplied || null,
        designation: formData.postApplied || null,
        employeeShift: formData.employeeShift || null,
        officeEmail: formData.officeEmail || null,
        storeAssign: formData.storeAssign || null,
        fathers_identity: formData.fathers_identity || null,
        employeeStatus: formData.employeeStatus || null,
        shift_start: formatTimeWithSeconds(formData.shiftStart),
        shift_end: formatTimeWithSeconds(formData.shiftEnd),
        probation_period: formData.probation_period || "",
        department: formData.department || null,
        bankname: formData.bankname || null,
        accountnumber: formData.accountnumber || null,
        ifsc_code: formData.ifsc_code || null,
        branch: formData.branch || null,
        mode_of_payment: formData.mode_of_payment || null,
        registered_emp_id: formData.registered_emp_id || null,
      };

      const submitFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        // Skip fields that do not belong to the employees database table
        if (key === "ctc") return;
        if (key === "basic") return;
        if (key === "hra") return;
        if (key === "ta") return;
        if (key === "da") return;
        if (key === "special_allowance") return;
        if (key === "variable_pay_annual") return;
        if (key === "epf") return;
        if (key === "epf_employer") return;
        if (key === "esi") return;
        if (key === "esi_employer") return;
        if (key === "lwf") return;
        if (key === "pt") return;
        if (key === "tax_regime") return;
        if (key === "gross_anual") return;
        if (key === "effective_from") return;
        if (key === "effective_to") return;
        if (key === "_special_overflow") return;
        if (key === "id") return;
        if (key === "user_id") return;
        if (key === "role") return;
        if (key === "is_active") return;
        if (key === "account_created") return;
        if (key === "created_at") return;
        if (key === "updated_at") return;
        if (key === "maritalStatus") return;
        if (key === "fathers_identity") return;
        if (key === "fatherName") return;
        // Skip snake_case fields already handled by camelCase→snake_case mappings above
        if (key === "shift_start") return;
        if (key === "shift_end") return;
        if (key === "blood_group") return;
        if (key === "epfo_id") return;
        if (key === "designation") return; // appended explicitly after the loop
        if (key === "marital_status") return;

        if (
          value !== undefined &&
          value !== null &&
          ![
            "education",
            "experience",
            "other_components",
            "company_id",
            "company_slug",
            "slug",
            "employee_id",
            "employeeId",
            "ot_allowed",
            "cv",
            "experienceCertificate",
            "relievingLetter",
            "photo",
            "profilePhoto",
            "aadhar",
            "pan",
            "educationalCertificates",
            "termandconditionCertificates",
            "phone",
            "phoneCode",
          ].includes(key)
        ) {
          let val = value;
          let fieldName = key;

          if (key === "shiftStart") {
            val = formatTimeWithSeconds(value);
            fieldName = "shift_start";
          }

          if (key === "shiftEnd") {
            val = formatTimeWithSeconds(value);
            fieldName = "shift_end";
          }

          if (key === "bloodGroup") {
            fieldName = "blood_group";
          }

          if (key === "epfoId") {
            fieldName = "epfo_id";
          }

          const dateFields = [
            "dob",
            "joinDate",
            "resignDate",
            "effective_from",
            "effective_to",
            "startDate",
            "endDate",
          ];

          if (dateFields.includes(fieldName)) {
            if (!val || val === "") return; // skip empty dates — DB rejects '' for DATE columns
            if (typeof val === "string") val = val.split("T")[0];
          }

          submitFormData.append(fieldName, val);
        }
      });
      submitFormData.append("designation", formData.postApplied || "");
      submitFormData.append("ot_allowed", formData.ot_allowed ? "1" : "0");
      submitFormData.append("phone", combinedPhone);
      if (mode === "edit") {
        submitFormData.delete("effective_to");
      }
      const educationPayload = educationList.map((edu) => ({
        ...edu,
        degree: edu.course || "",
        year: edu.passingYear || "",
      }));
      submitFormData.append("education", JSON.stringify(educationPayload));
      // submitFormData.append(
      //   "other_components",
      //   JSON.stringify(otherComponents),
      // );
      submitFormData.append("experience", JSON.stringify(experienceList));
      if (mode !== "edit") {
        submitFormData.append("company_id", companyId);
        submitFormData.append("company_slug", user?.slug || "");
      }

      SINGLE_FILE_FIELDS.forEach((field) => {
        if (uploadedFiles[field]?.actualFile) {
          const keyName = field === "profilePhoto" ? "profile_photo" : field;
          submitFormData.append(keyName, uploadedFiles[field].actualFile);
        }
      });
      MULTI_FILE_FIELDS.forEach((field) => {
        uploadedFiles[field].forEach((fileObj) => {
          if (fileObj?.actualFile) {
            submitFormData.append(field, fileObj.actualFile);
          }
        });
      });

      // if (mode === "edit") {
      //   SINGLE_FILE_FIELDS.forEach((field) => {
      //     const fileObj = uploadedFiles[field];
      //     const keyName = field === "profilePhoto" ? "profile_photo" : field;
      //     submitFormData.append(
      //       `${keyName}_existing`,
      //       fileObj?.existing ? fileObj.preview || fileObj.name || "" : "",
      //     );
      //   });
      // 
      //   MULTI_FILE_FIELDS.forEach((field) => {
      //     const existingFiles = uploadedFiles[field]
      //       .filter((fileObj) => fileObj?.existing)
      //       .map((fileObj) => fileObj.preview || fileObj.name)
      //       .filter(Boolean);
      //     submitFormData.append(
      //       `${field}_existing`,
      //       JSON.stringify(existingFiles),
      //     );
      //   });
      // }

      const leavePolicyPayload = {
        employee_id: employeeId,
        company_slug: user?.slug || "",
        yearly_CL: Number(leaveData.yearly_cl) || 0,
        yearly_EL: Number(leaveData.yearly_el) || 0,
        yearly_ML: Number(leaveData.yearly_ml) || 0,
        monthly_CL: Number(leaveData.monthly_cl) || 0,
        monthly_EL: Number(leaveData.monthly_el) || 0,
        monthly_ML: Number(leaveData.monthly_ml) || 0,
        max_monthly_cf_CL: Number(leaveData.monthly_carry_forward_cl) || 0,
        max_monthly_cf_EL: Number(leaveData.monthly_carry_forward_el) || 0,
        max_monthly_cf_ML: Number(leaveData.monthly_carry_forward_ml) || 0,
        max_carry_forward_CL: Number(leaveData.yearly_carry_forward_cl) || 0,
        max_carry_forward_EL: Number(leaveData.yearly_carry_forward_el) || 0,
        max_carry_forward_ML: Number(leaveData.yearly_carry_forward_ml) || 0,
        allow_negative_balance: leaveData.allow_negative_balance ? 1 : 0,
        leave_accrual_start: leaveData.leave_accrual_start || null,
        leave_year_start: leaveData.leave_year_start || null,
        min_balance_required: Number(leaveData.min_balance_required) || 0,
        enable_encashment: leaveData.enable_encashment ? 1 : 0,
        max_encashable_days: Number(leaveData.max_encashable_days) || 0,
      };

      const salaryBreakdownPayload = {
        company_slug: user?.slug || "",
        ctc: Number(formData.ctc) || 0,
        basic: Number(formData.basic) || 0,
        hra: Number(formData.hra) || 0,
        ta: Number(formData.ta) || 0,
        da: Number(formData.da) || 0,
        special_allowance: Number(formData.special_allowance) || 0,
        variable_pay_annual: Number(formData.variable_pay_annual) || 0,
        epf: Number(formData.epf) || 0,
        epf_employer: Number(formData.epf_employer) || 0,
        esi: Number(formData.esi) || 0,
        esi_employer: Number(formData.esi_employer) || 0,
        lwf: Number(formData.lwf) || 0,
        pt: Number(formData.pt) || 0,
        other_components: otherComponents,
        tax_regime: formData.tax_regime || "NEW",
        effective_from: formData.effective_from || null,
        effective_to: formData.effective_to || null,
        gross_anual: Number(formData.gross_anual) || 0,
      };

      if (mode === "edit") {
        await axios.put(
          `https://csaapnodeapi.csaap.com/api/tenant/hrms/update-employee/${employeeId}`,
          submitFormData,
          {
            headers: {
              Authorization: `Bearer ${csaapToken || hrmsToken}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (user?.slug) {
          await axios.put(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/leavepolicy/${user.slug}/${employeeId}`,
            leavePolicyPayload,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${hrmsToken || csaapToken}`,
              },
            },
          );

          await axios.put(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/salary-breakdown/employee/${employeeId}`,
            salaryBreakdownPayload,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${hrmsToken || csaapToken}`,
              },
            },
          );
        }

        Swal.fire("Success", "Employee updated successfully!", "success");
        navigate(`${basePath}/joined-employee`);
        return;
      }

      const response = await axios.post(
        "https://csaapnodeapi.csaap.com/api/tenant/hrms/add-employee",
        submitFormData,
        {
          headers: {
            Authorization: `Bearer ${csaapToken || hrmsToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newEmployeeId = response.data?.employeeId;
      if (newEmployeeId) {
        leavePolicyPayload.employee_id = newEmployeeId;
        await axios.post(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/leavepolicy`,
          leavePolicyPayload,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${hrmsToken || csaapToken}`,
            },
          },
        );

        if (user?.slug) {
          await axios.put(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/salary-breakdown/employee/${newEmployeeId}`,
            salaryBreakdownPayload,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${hrmsToken || csaapToken}`,
              },
            },
          );
        }
      }

      Swal.fire("Success", "Employee added successfully!", "success");
      navigate(`${basePath}/joined-employee`);
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message ||
        (mode === "edit"
          ? "Employee update failed"
          : "Employee creation failed"),
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Session guard ─── */
  // const isSessionExpired = !csaapToken;
  const isSessionExpired = [
    "employee",
    "HR Manager",
    "team leader",
    "manager",
  ].includes(role)
    ? !user?.token
    : !csaapToken;
  return {
    // State
    activeTab,
    setActiveTab: handleSetActiveTab,
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

    // ADD LEAVE STATE HERE
    leaveData,
    handleLeaveChange,
    resetLeaveData,

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
    employeeId,
    mode,
    salaryEffectiveDateExists,
    projectsList,
    departmentsList,
    designationsList,
  };
};

export default useEmployeeForm;
