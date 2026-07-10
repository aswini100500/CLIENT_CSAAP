
export const TABS = [
  { id: "basic", label: "Basic Information" },
  { id: "address", label: "Address" },
  { id: "personal", label: "Personal Details" },
  { id: "education", label: "Education Details" },
  { id: "experience", label: "Experience Details" },
  { id: "documents", label: "Document Upload" },
  { id: "leave", label: "Assign Leave" },
];


export const BASIC_INFO_FIELDS = [
  {
    label: "Name",
    name: "name",
    required: true,
    placeholder: "e.g. Rahul Sharma",
  },
  {
    label: "Aadhar No",
    name: "aadharNo",
    placeholder: "e.g. 1234 5678 9012",
  },
  {
    label: "Registered Emp Id",
    name: "registered_emp_id",
    placeholder: "e.g. COO032",
  },
  { label: "PAN No", name: "panNo", placeholder: "e.g. ABCDE1234F" },
  {
    label: "Phone",
    name: "phone",
    required: true,
    placeholder: "e.g. 9876543210",
  },
  {
    label: "Gender",
    name: "gender",
    required: true,
    type: "select",
    options: ["Male", "Female", "Other"],
  },
  {
    label: "Email",
    name: "email",
    required: true,
    placeholder: "e.g. rahul.sharma@example.com",
  },
  {
    label: "Password",
    name: "password",
    required: true,
    placeholder: "Enter password",
  },
  { label: "Salary", name: "salary", placeholder: "e.g. 50000" },
  {
    label: "Blood Group",
    name: "bloodGroup",
    type: "select",
    options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    placeholder: "e.g. O+",
  },
  {
    label: "EPFO ID",
    name: "epfoId",
    placeholder: "e.g. MHBAN00000640000000123",
  },
  {
    label: "Office Email",
    name: "officeEmail",
    placeholder: "e.g. rahul.s@company.com",
  },
  {
    label: "OT Allowed",
    name: "ot_allowed",
    type: "checkbox",
  },


  {
    label: "Employee Status",
    name: "employeeStatus",
    type: "select",
    options: ["Probation", "Permanent", "Part time"],
  },
  {
    label: "Employee Shift",
    name: "employeeShift",
    type: "select",
    required: true,
    options: ["Morning", "Afternoon", "Night", "General"],
  },
  {
    label: "Shift Start Time",
    name: "shiftStart",
    type: "time",
    required: true,
    placeholder: "Set shift start time",
  },
  {
    label: "Shift End Time",
    name: "shiftEnd",
    type: "time",
    required: true,
    placeholder: "Set shift end time",
  },
 
  {
    label: "Department",
    name: "department",
    type: "select",
    options: [],
    placeholder: "Select Department",
  },
    {
    label: "Designation",
    name: "postApplied",
    type: "select",
    options: [],
    placeholder: "Select Designation",
  },
   {
    label: "Probation Period",
    name: "probation_period",
    placeholder: "1 month",
  },
];


export const BANK_DETAILS_FIELDS = [
  {
    label: "Bank Name",
    name: "bankname",
    placeholder: "e.g. State Bank of India",
  },
  {
    label: "Account Number",
    name: "accountnumber",
    placeholder: "e.g. 123456789012",
  },
  {
    label: "IFSC Code",
    name: "ifsc_code",
    placeholder: "e.g. SBIN0001234",
  },
  {
    label: "Branch",
    name: "branch",
    placeholder: "e.g. Bhubaneswar Main",
  },
  {
    label: "Mode of Payment",
    name: "mode_of_payment",
    type: "select",
    options: ["Bank Transfer", "Cash", "Cheque", "UPI"],
  },
];


export const SALARY_FIELDS = [
  {
    label: "CTC (Annual)",
    name: "ctc",
    type: "number",
    placeholder: "e.g. 600000",
  },
  {
    label: "Incentives/Variable Pay (Annual)",
    name: "variable_pay_annual",
    type: "number",
    placeholder: "e.g. 50000",
  },
  {
    label: "Basic",
    name: "basic",
    type: "number",
    placeholder: "e.g. 300000",
  },
  {
    label: "HRA",
    name: "hra",
    type: "number",
    placeholder: "e.g. 150000",
    toggle: "hra",
  },
  {
    label: "TA (Traveling Allowance)",
    name: "ta",
    type: "number",
    placeholder: "e.g. 30000",
    toggle: "ta",
  },
  {
    label: "DA (Dearness Allowance)",
    name: "da",
    type: "number",
    placeholder: "e.g. 30000",
    toggle: "da",
  },
  {
    label: "Special Allowance",
    name: "special_allowance",
    type: "number",
    placeholder: "e.g. 100000",
  },
  {
    label: "EPF (Employee)",
    name: "epf",
    type: "number",
    placeholder: "e.g. 21600",
    toggle: "epf",
  },
  {
    label: "EPF (Employer)",
    name: "epf_employer",
    type: "number",
    placeholder: "e.g. 21600",
    toggle: "epf",
  },
  {
    label: "ESI (Employee)",
    name: "esi",
    type: "number",
    placeholder: "e.g. 1000",
    toggle: "esi",
  },
  {
    label: "ESI (Employer)",
    name: "esi_employer",
    type: "number",
    placeholder: "e.g. 1000",
    toggle: "esi",
  },
  {
    label: "Gross (Annual)",
    name: "gross_anual",
    type: "number",
    placeholder: "e.g. 300000",
  },
  {
    label: "PT",
    name: "pt",
    type: "number",
    placeholder: "e.g. 2400",
    toggle: "pt",
  },
  {
    label: "LWF",
    name: "lwf",
    type: "number",
    placeholder: "e.g. 200",
    toggle: "lwf",
  },
  { label: "Effective From", name: "effective_from", type: "date" },
];


export const PERSONAL_DETAILS_FIELDS = [
  { label: "Date of Birth", name: "dob", type: "date" },
  {
    label: "Marital Status",
    name: "maritalStatus",
    options: ["Select Status", "Single", "Married"],
  },
  {
    label: "Nationality",
    name: "nationality",
    placeholder: "e.g. Indian",
  },
  {
    label: "Father's Name",
    name: "fatherName",
    placeholder: "e.g. Ramesh Sharma",
  },
  {
    label: "Father Aadhar",
    name: "fathers_identity",
    placeholder: "e.g. 1234 5678 9012",
  },
];


export const EDUCATION_FIELDS = [
  {
    name: "course",
    label: "Course",
    placeholder: "e.g. B.Tech in Computer Science",
  },
  {
    name: "board",
    label: "Board/University",
    placeholder: "e.g. CBSE / Mumbai University",
  },
  {
    name: "passingYear",
    label: "Passing Year",
    placeholder: "e.g. 2021",
  },
  {
    name: "institute",
    label: "Institute Name",
    placeholder: "e.g. IIT Bombay / VJTI",
  },
];


export const EXPERIENCE_FIELDS = [
  {
    name: "jobTitle",
    label: "Job Title",
    placeholder: "e.g. Senior Software Engineer",
  },
  {
    name: "company",
    label: "Company",
    placeholder: "e.g. Tata Consultancy Services",
  },
  { name: "startDate", label: "Start Date", type: "date" },
  { name: "endDate", label: "End Date", type: "date" },
];


export const FILE_UPLOAD_CONFIG = [
  {
    type: "cv",
    label: "CV/Resume",
    description: "Upload CV or Resume (PDF, DOC, DOCX)",
    accept: ".pdf,.doc,.docx",
  },
  {
    type: "experienceCertificate",
    label: "Experience Certificate",
    description: "Upload Experience Certificate",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  },
  {
    type: "relievingLetter",
    label: "Relieving Letter",
    description: "Upload Relieving Letter from previous employer",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  },
  {
    type: "photo",
    label: "Photograph",
    description: "Upload recent passport size photo",
    accept: "image/*",
  },
  {
    type: "profilePhoto",
    label: "Passport Size Photo",
    description: "Upload passport size photo of the employee",
    accept: "image/*",
  },
  {
    type: "aadhar",
    label: "Aadhar Card",
    description: "Upload Aadhar Card copy",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    type: "pan",
    label: "PAN Card",
    description: "Upload PAN Card copy",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    type: "educationalCertificates",
    label: "Educational Certificates",
    description: "Upload all educational certificates",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    multiple: true,
  },
  {
    type: "termandconditionCertificates",
    label: "Term and Condition Certificates",
    description: "Upload all term and condition certificates",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    multiple: true,
  },
];


export const LEAVE_ASSIGNMENT_FIELDS = [

  {
    section: "Yearly Leave Allocation",
    description: "Set annual leave quotas for the employee",
    fields: [
      {
        label: "Yearly Casual Leave (CL)",
        name: "yearly_cl",
        type: "number",
        min: 0,
        max: 365,
        placeholder: "e.g. 12",
        required: true,
        helpText: "Number of casual leaves per year",
      },
      {
        label: "Yearly Earned Leave (EL)",
        name: "yearly_el",
        type: "number",
        min: 0,
        max: 365,
        placeholder: "e.g. 18",
        required: true,
        helpText: "Number of earned leaves per year",
      },
      {
        label: "Yearly Medical Leave (ML)",
        name: "yearly_ml",
        type: "number",
        min: 0,
        max: 365,
        placeholder: "e.g. 10",
        required: false,
        helpText: "Number of Maternal leaves per year (Optional)",
      },
      {
        label: "Total Yearly Leave",
        name: "total_yearly_leave",
        type: "number",
        readOnly: true,
        placeholder: "Auto-calculated",
        helpText: "Sum of all yearly leaves (CL + EL + ML)",
      },
    ],
  },


  {
    section: "Monthly Leave Allocation",
    description: "Set monthly leave quotas for the employee",
    fields: [
      {
        label: "Monthly Casual Leave (CL)",
        name: "monthly_cl",
        type: "number",
        min: 0,
        max: 31,
        placeholder: "e.g. 1",
        step: "0.5",
        helpText: "Casual leaves per month",
      },
      {
        label: "Monthly Earned Leave (EL)",
        name: "monthly_el",
        type: "number",
        min: 0,
        max: 31,
        placeholder: "e.g. 1.5",
        step: "0.5",
        helpText: "Earned leaves per month",
      },
      {
        label: "Monthly Medical Leave (ML)",
        name: "monthly_ml",
        type: "number",
        min: 0,
        max: 31,
        placeholder: "e.g. 0.5",
        step: "0.5",
        helpText: "Maternal leaves per month (Optional)",
      },
    ],
  },


  {
    section: "Carry Forward Rules",
    description: "Configure monthly and yearly leave carry forward limits",
    fields: [

      {
        label: "Monthly Carry Forward - CL",
        name: "monthly_carry_forward_cl",
        type: "number",
        min: 0,
        max: 31,
        placeholder: "e.g. 1",
        helpText:
          "Maximum Casual Leave that can be carried forward to the next month",
      },
      {
        label: "Monthly Carry Forward - EL",
        name: "monthly_carry_forward_el",
        type: "number",
        min: 0,
        max: 31,
        placeholder: "e.g. 2",
        helpText:
          "Maximum Earned Leave that can be carried forward to the next month",
      },
      {
        label: "Monthly Carry Forward - ML",
        name: "monthly_carry_forward_ml",
        type: "number",
        min: 0,
        max: 31,
        placeholder: "e.g. 1",
        helpText:
          "Maximum Medical Leave that can be carried forward to the next month",
      },


      {
        label: "Yearly Carry Forward - CL",
        name: "yearly_carry_forward_cl",
        type: "number",
        min: 0,
        max: 365,
        placeholder: "e.g. 6",
        helpText:
          "Maximum Casual Leave that can be carried forward to the next year",
      },
      {
        label: "Yearly Carry Forward - EL",
        name: "yearly_carry_forward_el",
        type: "number",
        min: 0,
        max: 365,
        placeholder: "e.g. 15",
        helpText:
          "Maximum Earned Leave that can be carried forward to the next year",
      },
      {
        label: "Yearly Carry Forward - ML",
        name: "yearly_carry_forward_ml",
        type: "number",
        min: 0,
        max: 365,
        placeholder: "e.g. 5",
        helpText:
          "Maximum Medical Leave that can be carried forward to the next year",
      },
    ],
  },

  {
    section: "Policy Settings",
    description: "Advanced policy configurations",
    fields: [
      {
        label: "Allow Negative Balance",
        name: "allow_negative_balance",
        type: "checkbox",
        helpText:
          "Allow employees to submit leave requests even with zero balance",
      },
    ],
  },
];


export const calculateTotalYearlyLeave = (cl, el, ml = 0) => {
  return (parseInt(cl) || 0) + (parseInt(el) || 0) + (parseInt(ml) || 0);
};

export const COUNTRY_CODES = [
  { code: "IN", name: "India", dial_code: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial_code: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial_code: "+44", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", dial_code: "+971", flag: "🇦🇪" },
  { code: "CA", name: "Canada", dial_code: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dial_code: "+61", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", dial_code: "+65", flag: "🇸🇬" },
  { code: "DE", name: "Germany", dial_code: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial_code: "+33", flag: "🇫🇷" },
  { code: "SA", name: "Saudi Arabia", dial_code: "+966", flag: "🇸🇦" },
  { code: "NP", name: "Nepal", dial_code: "+977", flag: "🇳🇵" },
  { code: "BD", name: "Bangladesh", dial_code: "+880", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", dial_code: "+94", flag: "🇱🇰" },
  { code: "PK", name: "Pakistan", dial_code: "+92", flag: "🇵🇰" }
];
