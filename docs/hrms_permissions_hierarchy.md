# HRMS Module Permissions - UI Hierarchy Directory

This document organizes the HRMS module permission keys into a visual hierarchy that reflects the layout of the user interface (sidebars, submenus, pages, tabs, modals, and actions). 

Every permission key maps to an actual active element, route, or action in the front-end application. Non-existent views (e.g., biometric devices, system configuration layouts) have been completely removed.

---

## 1. Global Module Gating
* 🚪 **Main Access Namespace**: `hrms.*`
* 📱 **Employee Self-Service Access**: `hrms.self_service.*`

---

## 2. Employee Self-Service Workspace (`hrms.self_service.*`)

The sidebar links visible to standard employees.

### 📂 Sidebar: Dashboard
* 🖥️ **Personal Dashboard** — View stats (Total Tasks, Present Days, Messages, Service Requests), Team Attendance tracker, and Holiday calendar widget.
  * *Layout Gate:* `hrms.self_service.dashboard`

---

### 👤 Profile (Header Menu)
* 💼 **My Profile Details** — View personal profile, job designation details, and emergency contacts.
  * *Access:* `hrms.self_service.profile`

---

### 📂 Sidebar: Task
* 📋 **Assigned Tasks & Checklist Board** — View and update tasks assigned to the employee.
  * *Layout Gate:* `hrms.self_service.tasks`
  * 🗂️ **Tab: My Task**
    * ⚡ **Actions:**
      * Start / Update / Complete task status: `hrms.self_service.tasks.update`
  * 🗂️ **Tab: Assign Task** (Visible for managers / team leads only)
    * ⚡ **Actions:**
      * Create and assign task: `hrms.self_service.tasks.assign`
  * 🗂️ **Tab: To Do List**
    * Personal checklist items (unrestricted/local action).

---

### 📂 Sidebar: Attendance
* 🗓️ **Attendance History & Punching** — Daily check-in/out and leaves history.
  * *Layout Gate:* `hrms.self_service.attendance` (or `hrms.self_service.timesheet`, `hrms.self_service.leave`)
  * 🗂️ **Tab: Attendance** — View daily punch cards grid.
  * 🗂️ **Tab: Add Attendance**
    * ⚡ **Actions:**
      * Punch check-in / check-out / submit mispunch request: `hrms.self_service.attendance.add`
  * 🗂️ **Tab: Timesheet**
    * *Access Tab:* `hrms.self_service.timesheet`
    * ⚡ **Actions:**
      * Submit / Log daily work hours: `hrms.self_service.timesheet.log`
  * 🗂️ **Tab: Leave**
    * *Access Tab:* `hrms.self_service.leave`
    * ⚡ **Actions:**
      * Apply for leave: `hrms.self_service.leave.apply`

---

### 📂 Sidebar: Work Report
* 📊 **Work Reports Console** — Logs of daily timesheets and monthly summaries.
  * *Layout Gate:* `hrms.self_service.work_report`
  * 🗂️ **Tab: Daily Reports**
    * ⚡ **Actions:**
      * Submit daily report (timesheet log): `hrms.self_service.work_report.submit`
  * 🗂️ **Tab: Monthly Work Reports**
    * ⚡ **Actions:**
      * Submit monthly work report: `hrms.self_service.work_report.submit_monthly`

---

### 📂 Sidebar: Complain
* ⚠️ **Complaint Box** — Submit grievance reports.
  * *Layout Gate:* `hrms.self_service.complain`
  * ⚡ **Actions:**
    * Raise New Complaint / Suggestion: `hrms.self_service.complain.raise`

---

### 📂 Sidebar: Message
* 💬 **Corporate Message Inbox** — View personal or group message alerts from Admin/HR.
  * *Layout Gate:* `hrms.self_service.message`

---

### 📂 Sidebar: Payslip & HR documents
* 📂 **My Document Vault** — Access payslips, qualification documents, and upload credentials.
  * *Layout Gate:* `hrms.self_service.documents`
  * ⚡ **Actions:**
    * Upload qualification/KYC files: `hrms.self_service.documents.upload`

---

### 📂 Sidebar: Calendar & Events
* 📅 **Holiday Schedule** — View upcoming holidays list and calendar events.
  * *Layout Gate:* `hrms.self_service.calendar`

---

### 🚀 Service Request (Accessed via Dashboard Card)
* 📦 **Asset & Travel Reimbursement Requests** — Track personal requests.
  * *Access:* `hrms.self_service.service_request`
  * ⚡ **Actions:**
    * Create travel, asset, or reimbursement request: `hrms.self_service.service_request.create`
    * Delete service request: `hrms.self_service.service_request.delete`

---
---

## 3. HRMS Admin & HR Management Portal (`hrms.*`)

Folder in the employee sidebar visible to Admin and HR roles.

### 📂 Sidebar -> HRMS Folder: Dashboard
* 🖥️ **HRMS Executive Dashboard** — View company headcount statistics, active employee metrics, and pending tasks.
  * *Layout Gate:* `hrms.dashboard`

---

### 📂 Sidebar -> HRMS Folder: Employee
* 👥 **Employee Directory & Lifecycle Panel** — Table of active, on-probation, notice period, and ex-employees.
  * *Layout Gate:* `hrms.employee`
  * 🗂️ **Tab: Total Employees**
  * 🗂️ **Tab: On Probation**
  * 🗂️ **Tab: Notice Period**
  * 🗂️ **Tab: Part Time**
  * 🗂️ **Tab: Ex Employees**
  
  * ⚡ **Top Action Buttons:**
    * Add Employee: `hrms.employee.create` (navigates to `/employee/hr/add-employee`)
    * Download CSV / Excel / PDF: `hrms.employee.export`
    
  * ⚡ **Row Actions (Table Actions):**
    * Edit Employee: `hrms.employee.edit` (navigates to `/employee/hr/edit-candidate`)
    * Delete Employee Record: `hrms.employee.delete`
    * Put Employee on Notice (Notice Modal): `hrms.employee.notice`
    * Resign Employee (Resignation Modal): `hrms.employee.resign`
    * Terminate Employee (Termination Modal): `hrms.employee.terminate`
    * View Employee Profile Details: `hrms.employee` (base namespace)
    
  * ⚡ **Document & Setup Actions:**
    * Generate ID Card: `hrms.employee.idcard` (navigates to `/employee/hr/download-idcard`)
    * Generate Visiting Card: `hrms.employee.visitingcard` (navigates to `/employee/hr/download-visitingcard`)
    * View Employee Documents Vault: `hrms.employee.documents` (navigates to `/employee/hr/view-document`)
    * View Terms & Conditions Setup: `hrms.employee.termcondition` (navigates to `/employee/hr/termcondition`)
    * Edit Terms & Conditions: `hrms.employee.termcondition.edit`
    * Assign Project to Employee: `hrms.employee.project.assign` (navigates to `/employee/hr/add-projects`)
    * Transfer Branch / Department: `hrms.employee.transfer` (navigates to `/employee/hr/transfer`)
    * Promotion Designation / Scale: `hrms.employee.promotion` (navigates to `/employee/hr/promotion`)

---

### 📂 Sidebar -> HRMS Folder: Attendance
* 📊 **Time & Attendance Tracking Dashboard** — Unified monitoring console.
  * *Layout Gate:* `hrms.attendance`
  * 🗂️ **Tab: Attendance**
    * Tracking matrix of presence logs.
  * 🗂️ **Tab: Attendance Review**
    * View check-in/out exceptions: `hrms.attendance.review`
  * 🗂️ **Tab: Attendance Request**
    * View, approve or reject employee mispunches: `hrms.attendance.requests`
    * Action: Approve / Reject Mispunch: `hrms.attendance.mispunch.approve`
  * 🗂️ **Tab: Daily Punch (QR Check-in)**
    * View QR-based check-in console: `hrms.attendance.mispunch`
  * 🗂️ **Tab: Employee Leave**
    * *Access Tab:* `hrms.attendance.leave`
    * ⚡ **Actions:**
      * Approve / Reject Leave Request: `hrms.attendance.leave.approve`
      * Configure Leave Policy & Quota: `hrms.attendance.leave.config`
      
  * ⚙️ **Sub-Reports Panel Links:**
    * Timewise Attendance Report: `hrms.attendance.timewise` (navigates to `/employee/hr/timewise-attendance`)
    * Monthly Late Coming Report: `hrms.attendance.reports.late` (navigates to `/employee/hr/late-coming-report`)
    * Early Going Report: `hrms.attendance.reports.early` (navigates to `/employee/hr/early-going-report`)
    * Overtime Logs: `hrms.attendance.overtime` (navigates to `/employee/hr/overtime`)

---

### 📂 Sidebar -> HRMS Folder: Task
* 📋 **Admin Tasks Board** — Create, track and edit work tickets assigned to employees.
  * *Layout Gate:* `hrms.tasks`
  * ⚡ **Actions:**
    * Assign / Create Task: `hrms.tasks.create`
    * Edit Task Details: `hrms.tasks.edit`
    * Delete Task: `hrms.tasks.delete`
    * View Archived Tasks: `hrms.tasks.archive`
    * Personal Checklist (ToDo List): `hrms.tasks.todo`

---

### 📂 Sidebar -> HRMS Folder: Report
* 📈 **Performance & Work Reports** — Advanced report aggregation views.
  * *Layout Gate:* `hrms.report`
  * 🗂️ **Tab: Daily Reports**
    * Review submitted daily employee reports: `hrms.report.daily`
  * 🗂️ **Tab: Monthly Work Reports**
    * Summary grids of monthly employee reports: `hrms.report.monthly`

---

### 📂 Sidebar -> HRMS Folder: Message
* 💬 **Corporate Communications Center** — Unified message, grievance and announcement management.
  * *Layout Gate:* `hrms.message`
  * 🗂️ **Tab: Messages**
    * ⚡ **Actions:**
      * Send Broadcast or Direct message to employee: `hrms.message.send`
  * 🗂️ **Tab: Complaints**
    * View company grievances: `hrms.message.complaints`
    * Resolve complaints: `hrms.message.complaints.resolve`
  * 🗂️ **Tab: Service Requests**
    * View asset / travel claims: `hrms.message.service_request`
    * Fulfill / Approve Service Request: `hrms.message.service_request.fulfill`
  * 🗂️ **Tab: Announcements**
    * View active announcements: `hrms.message.announcement`
    * Publish announcement: `hrms.message.announcement.create`

---

### 📂 Sidebar -> HRMS Folder: Job
* 💼 **Recruitment Management Hub** — Complete talent acquisition cycle management.
  * *Layout Gate:* `hrms.job`
  * 🗂️ **Tab: Job Posting**
    * View job openings: `hrms.job.posting`
    * ⚡ **Actions:**
      * Post New Vacancy: `hrms.job.posting.create`
      * Edit Vacancy Details: `hrms.job.posting.edit`
  * 🗂️ **Tab: Form Applied**
    * View vacancy applications: `hrms.job.applied`
  * 🗂️ **Tab: Shortlisted Candidates**
    * View shortlist: `hrms.job.shortlisted`
    * ⚡ **Actions:**
      * Shortlist / Reject candidate profile: `hrms.job.shortlisted.action`
  * 🗂️ **Tab: Interview**
    * View schedules: `hrms.job.interview`
    * ⚡ **Actions:**
      * Schedule interview round: `hrms.job.interview.schedule`
  * 🗂️ **Tab: Offer Letter**
    * View offer letters: `hrms.job.offer`
    * ⚡ **Actions:**
      * Generate Candidate Offer Letter: `hrms.job.offer.create`
      * Download Offer Letter PDF: `hrms.job.offer.download`
      
  * ⚡ **Candidate Onboarding Layout (`AcceptEmployees.jsx`):**
    * View onboarding candidates pending HR induction: `hrms.employee.onboarding` (navigates to `/employee/hr/accept-employee`)
    * Accept Candidate & Setup Profile: `hrms.employee.onboarding.setup`

---

### 📂 Sidebar -> HRMS Folder: Payroll
* 💼 **Salary Processing Console** — Calculate, edit, and approve employee payroll.
  * *Layout Gate:* `hrms.payroll`
  * ⚡ **Actions:**
    * Run & Process monthly salary: `hrms.payroll.process`
    * Modify payroll records / edit basic slab (PayrollEditModal): `hrms.payroll.edit`
    * Change company payroll configurations (PayrollConfigModal): `hrms.payroll.config`
    * Export Bank Transfer text, Excel sheet, or PDF reports: `hrms.payroll.download`

---

### 📂 Sidebar -> HRMS Folder: Calendar
* 📅 **Company Calendar Admin** — Holidays and meetings coordinator.
  * *Layout Gate:* `hrms.calendar`
  * 🗂️ **Tab: Holiday**
    * View holidays list: `hrms.calendar.holiday`
    * ⚡ **Actions:**
      * Define / Create Holiday: `hrms.calendar.holiday.create`
  * 🗂️ **Tab: Meeting**
    * ⚡ **Actions:**
      * Schedule team meeting: `hrms.calendar.meeting.create`
