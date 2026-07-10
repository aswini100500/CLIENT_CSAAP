import { Navigate, Route, Routes } from "react-router-dom";

import AddEmployee from "../../../submodules/hrms/components/EmployeeForm/Addemployee";
import AllReport from "../components/AllReport";
import AttendanceCloudsat from "../components/AttendanceCloudsat";
import CalendarTabs from "../components/CalendarTabs";
import Dashboard from "../components/Dashboard";
import Task from "../components/Employee Management/Task";
import JobTabs from "../components/JobTabs";
import JoinedEmployee from "../components/JoinedEmployee";
import MessageTabs from "../components/MessageTabs";
import PayrollPage from "../components/PayRoll/Payrollpage";
import TaskPage from "../Employee dashboard/pages/TaskPage";
import ToDoList from "../components/ToDoList/ToDoList";
import Announcement from "../components/Announcement";
import DailyReportsPage from "../components/DailyReport";
import ArchivedTasks from "../components/Employee Management/ArchivedTasks";
import AcceptedEmployees from "../components/AcceptEmployees";
import TerminateEmployeePage from "../components/TerminateEmployee";
import TransferPage from "../components/Transfer";
import IDCardMaker from "../components/Idcard";
import VisitingCardMaker from "../components/Visitingcard";
import ViewEmployeeDocuments from "../components/Documentview";
import ViewTermsConditions from "../components/Termcondition";
import TimewiseAttendance from "../components/TimewiseAttendance";
import EarlyGoingReport from "../components/EarlygoingReport";
import OverTime from "../components/OverTime";
import DesignationDetailsInsidePage from "../components/pages/Designationdetailsinsidepage";
import QRCodeGenerator from "../components/pages/Attendance2";
import EmployeeAttendance from "../components/pages/EmployeeAttendance";
import MonthlyLateComingReport from "../components/LateComingReport";
import LeaveReport from "../components/Leave";
import Payment from "../components/Payment";
import AdvancePayment from "../components/Addpayment";
import JobPosting from "../components/JobPosting";
import AddApplicant from "../components/AddApplicant";
import ViewJobApplication from "../components/Viewjobapplication";
import ShortlistedCandidates from "../components/ShortlistedCandidate";
import SelectedCandidate from "../components/SelectedCandidate";
import RecruitmentProcess from "../components/InterviewReport";
import RecruitmentTablePage from "../components/InterviewDetails";
import FormsApplied from "../components/FormsApplied";
import OfferLetterManagement from "../components/Offerletter";
import DownloadOfferLetter from "../components/Downloadofferletter";
import NoticeLetterPage from "../components/NoticeLetter";
import ExperienceCertificateManagement from "../components/Experiencecertificate";
import Reports from "../components/Reports";
import History from "../components/History";
import ComplaintsManagement from "../components/ComplaintsManagement";
import HolidaysList from "../components/Calender/Defineholiday";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="joined-employee" element={<JoinedEmployee />} />
      <Route path="attendance" element={<AttendanceCloudsat />} />
      <Route path="attendance-cloudsat" element={<AttendanceCloudsat />} />
      <Route path="tasks" element={<Task />} />
      <Route path="all-report" element={<AllReport />} />
      <Route path="job" element={<JobTabs />} />
      <Route path="payroll" element={<PayrollPage />} />
      <Route path="calendar" element={<CalendarTabs />} />
      <Route path="add-employee" element={<AddEmployee />} />
      <Route path="edit-candidate" element={<AddEmployee mode="edit" />} />

      <Route path="todo-list" element={<ToDoList />} />
      <Route path="announcement" element={<Announcement />} />
      <Route path="dailyReport" element={<DailyReportsPage />} />
      <Route path="archived-tasks" element={<ArchivedTasks />} />

      <Route
        path="accept-employee"
        element={<AcceptedEmployees />}
      />
      <Route
        path="terminate-employee"
        element={<TerminateEmployeePage />}
      />
      <Route path="transfer" element={<TransferPage />} />
      <Route
        path="promotion"
        element={<DesignationDetailsInsidePage />}
      />
      <Route path="download-idcard" element={<IDCardMaker />} />
      <Route
        path="download-visitingcard"
        element={<VisitingCardMaker />}
      />
      <Route
        path="view-document"
        element={<ViewEmployeeDocuments />}
      />
      <Route
        path="termcondition"
        element={<ViewTermsConditions />}
      />


      <Route path="attendance2" element={<QRCodeGenerator />} />
      <Route
        path="attendanceuser"
        element={<EmployeeAttendance />}
      />
      <Route
        path="timewise-attendance"
        element={<TimewiseAttendance />}
      />
      <Route
        path="late-coming-report"
        element={<MonthlyLateComingReport />}
      />
      <Route
        path="early-going-report"
        element={<EarlyGoingReport />}
      />
      <Route path="overtime" element={<OverTime />} />


      <Route path="leave-report" element={<LeaveReport />} />


      <Route path="payments" element={<Payment />} />
      <Route path="add-payment" element={<AdvancePayment />} />


      <Route path="job" element={<JobTabs basePath="/hrms" />} />
      <Route path="job-posting" element={<JobPosting />} />
      <Route
        path="add-applicant"
        element={<AddApplicant basePath="/hrms" />}
      />
      <Route
        path="view-application"
        element={<ViewJobApplication />}
      />
      <Route
        path="shortlisted-candidate"
        element={<ShortlistedCandidates />}
      />
      <Route
        path="selected-candidates"
        element={<SelectedCandidate />}
      />
      <Route
        path="interview-report"
        element={<RecruitmentProcess />}
      />
      <Route
        path="interview-detail"
        element={<RecruitmentTablePage />}
      />

      <Route
        path="formApplied"
        element={<FormsApplied basePath="/hrms" />}
      />


      <Route
        path="offer-letter"
        element={<OfferLetterManagement />}
      />
      <Route
        path="download-offerletter"
        element={<DownloadOfferLetter />}
      />
      <Route path="notice-letter" element={<NoticeLetterPage />} />
      <Route
        path="experience-certificate"
        element={<ExperienceCertificateManagement />}
      />


      <Route path="reports" element={<Reports />} />
                <Route path="history" element={<History />} />





      <Route
                path="hrms/complaints"
                element={<ComplaintsManagement />}
              />
              <Route
                path="hrms/calendar"
                element={<CalendarTabs />}
              />
              <Route path="hrms/holiday-list" element={<HolidaysList />} />





      <Route path="message" element={<MessageTabs />} />

      <Route path="/" element={<Navigate to="/hrms/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/hrms/dashboard" replace />} />
    </Routes>
  );
}
