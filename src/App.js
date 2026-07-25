import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { MockDataProvider } from './context/MockDataContext';
import { NotificationProvider } from './context/NotificationContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Auth/Login';
import StudentLogin from './pages/Auth/StudentLogin';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';
import StudentDashboard from './pages/Students/StudentDashboard';
import IdCard from './pages/IdCard';
import StudentList from './pages/Students/StudentList';
import StudentForm from './pages/Students/StudentForm';
import AddStudentParent from './pages/Students/AddStudentParent';
import ClassList from './pages/Classes/ClassList';
import ClassForm from './pages/Classes/ClassForm';
import SubjectList from './pages/Subjects/SubjectList';
import SubjectForm from './pages/Subjects/SubjectForm';
import UserList from './pages/Users/UserList';
import UserForm from './pages/Users/UserForm';
import AcademicYearList from './pages/AcademicYears/AcademicYearList';
import AcademicYearForm from './pages/AcademicYears/AcademicYearForm';
import TermList from './pages/Terms/TermList';
import TermForm from './pages/Terms/TermForm';
import PromotionList from './pages/Promotions/PromotionList';
import PromotionCriteria from './pages/Promotions/PromotionCriteria';
import CumulativeResult from './pages/Promotions/CumulativeResult';
import ReportCardList from './pages/ReportCards/ReportCardList';
import ExamList from './pages/Exams/ExamList';
import ExamForm from './pages/Exams/ExamForm';
import TakeExam from './pages/Exams/TakeExam';
import QuestionBuilder from './pages/Exams/QuestionBuilder';
import ResultList from './pages/Results/ResultList';
import StudentResult from './pages/Results/StudentResult';
import ParentStudentResult from './pages/Results/ParentStudentResult';
import GradeTheory from './pages/Results/GradeTheory';
import ManualScoreEntry from './pages/Results/ManualScoreEntry';
import ResultSheetPage from './pages/Results/ResultSheetPage';
import ParentList from './pages/Parents/ParentList';
import ParentForm from './pages/Parents/ParentForm';
import MyChildren from './pages/Parents/MyChildren';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';
import TeacherSchedule from './pages/Teachers/TeacherSchedule';
import TeacherTopStudents from './pages/Teachers/TeacherTopStudents';
import TeacherAssignments from './pages/Teachers/TeacherAssignments';
import TeacherComments from './pages/Teachers/TeacherComments';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ParentDashboard from './pages/Dashboard/ParentDashboard';
import SystemStatus from './pages/Admin/SystemStatus';
import TeacherRemarks from './pages/Admin/TeacherRemarks';
import HeadmasterComments from './pages/Admin/HeadmasterComments';
import Settings from './pages/Settings';
import GradeManagement from './pages/Grades/GradeManagement';
import StudentProfile from './pages/Students/StudentProfile';
import StudentDetail from './pages/Students/StudentDetail';
import LandingPage from './pages/landingPage';
import PaymentPage from './pages/PaymentPage';
import Gallery from './pages/Gallery';
import EntranceExamList from './pages/EntranceExams/EntranceExamList';
import EntranceExamForm from './pages/EntranceExams/EntranceExamForm';
import EntranceExamDetail from './pages/EntranceExams/EntranceExamDetail';
import EntranceExamQuestions from './pages/EntranceExams/EntranceExamQuestions';
import EntranceCandidateRegister from './pages/EntranceExams/EntranceCandidateRegister';
import EntranceCandidateList from './pages/EntranceExams/EntranceCandidateList';
import EntranceCandidateResult from './pages/EntranceExams/EntranceCandidateResult';
import EntranceExamTake from './pages/EntranceExams/EntranceExamTake';
import AdminSettings from './pages/Admin/AdminSettings';

function HomeRoute() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!isAuthenticated) return <LandingPage />;
  if (user?.role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
  if (user?.role === 'Teacher') return <Navigate to="/teacher-dashboard" replace />;
  if (user?.role === 'Student') return <Navigate to="/student-dashboard" replace />;
  if (user?.role === 'Parent') return <Navigate to="/parent-dashboard" replace />;
  return <LandingPage />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (isAuthenticated) {
    if (user?.role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
    if (user?.role === 'Teacher') return <Navigate to="/teacher-dashboard" replace />;
    if (user?.role === 'Student') return <Navigate to="/student-dashboard" replace />;
    if (user?.role === 'Parent') return <Navigate to="/parent-dashboard" replace />;
  }
  return children;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading, hasRole } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !hasRole(allowedRoles)) {
    if (user?.role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
    if (user?.role === 'Teacher') return <Navigate to="/teacher-dashboard" replace />;
    if (user?.role === 'Student') return <Navigate to="/student-dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

function RoleBasedDashboardRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
  if (user?.role === 'Teacher') return <Navigate to="/teacher-dashboard" replace />;
  if (user?.role === 'Student') return <Navigate to="/student-dashboard" replace />;
  if (user?.role === 'Parent') return <Navigate to="/parent-dashboard" replace />;
  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/payment" element={<PaymentPage />} />

      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/student-login" element={<PublicRoute><StudentLogin /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Dashboard Routes */}
      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="system-status" element={<SystemStatus />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/add-student-parent" element={<AddStudentParent />} />
        <Route path="students/:id/edit" element={<StudentForm />} />
        <Route path="students/:studentId/grade" element={<GradeTheory />} />
        <Route path="students/:id/detail" element={<StudentDetail />} />
        <Route path="classes" element={<ClassList />} />
        <Route path="classes/new" element={<ClassForm />} />
        <Route path="classes/:id/edit" element={<ClassForm />} />
        <Route path="subjects" element={<SubjectList />} />
        <Route path="subjects/new" element={<SubjectForm />} />
        <Route path="subjects/:id/edit" element={<SubjectForm />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/new" element={<UserForm />} />
        <Route path="users/:id/edit" element={<UserForm />} />
        <Route path="academic-years" element={<AcademicYearList />} />
        <Route path="academic-years/new" element={<AcademicYearForm />} />
        <Route path="academic-years/:id/edit" element={<AcademicYearForm />} />
        <Route path="terms" element={<TermList />} />
        <Route path="terms/new" element={<TermForm />} />
        <Route path="terms/:id/edit" element={<TermForm />} />
        <Route path="promotions" element={<PromotionList />} />
        <Route path="cumulative-result/:studentId" element={<CumulativeResult />} />
        <Route path="promotion-criteria" element={<PromotionCriteria />} />
        <Route path="report-cards" element={<ReportCardList />} />
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/new" element={<ExamForm />} />
        <Route path="exams/:id/edit" element={<ExamForm />} />
        <Route path="exams/:examId/questions" element={<QuestionBuilder />} />
        <Route path="exams/:examId/grade" element={<GradeTheory />} />
        <Route path="exams/:examId/test-score" element={<GradeTheory />} />
        <Route path="results" element={<ResultList />} />
        <Route path="results/student/:studentId" element={<StudentResult />} />
        <Route path="manual-score" element={<ManualScoreEntry />} />
        <Route path="teacher-assignments" element={<TeacherAssignments />} />
        <Route path="grade-management" element={<GradeManagement />} />
        <Route path="report-cards" element={<ReportCardList />} />
        <Route path="parents" element={<ParentList />} />
        <Route path="parents/new" element={<ParentForm />} />
        <Route path="parents/:id/edit" element={<ParentForm />} />
        <Route path="student-profiles" element={<StudentProfile />} />
        <Route path="students/:studentId/profile" element={<StudentProfile />} />
        <Route path="entrance-exams" element={<EntranceExamList />} />
        <Route path="entrance-exams/create" element={<EntranceExamForm />} />
        <Route path="entrance-exams/:id" element={<EntranceExamDetail />} />
        <Route path="entrance-exams/:id/questions" element={<EntranceExamQuestions />} />
        <Route path="entrance-candidates" element={<EntranceCandidateList />} />
        <Route path="entrance-candidates/register" element={<EntranceCandidateRegister />} />
        <Route path="entrance-candidates/:id" element={<EntranceCandidateResult />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Teacher Dashboard Routes */}
      <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={['Teacher']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="top-students" element={<TeacherTopStudents />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/:id/edit" element={<StudentForm />} />
        <Route path="students/:studentId/grade" element={<GradeTheory />} />
        <Route path="students/:id/detail" element={<StudentDetail />} />
        <Route path="classes" element={<ClassList />} />
        <Route path="subjects" element={<SubjectList />} />
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/new" element={<ExamForm />} />
        <Route path="exams/:id/edit" element={<ExamForm />} />
        <Route path="exams/:examId/questions" element={<QuestionBuilder />} />
        <Route path="exams/:examId/grade" element={<GradeTheory />} />
        <Route path="exams/:examId/test-score" element={<GradeTheory />} />
        <Route path="results" element={<ResultList />} />
        <Route path="results/student/:studentId" element={<StudentResult />} />
        <Route path="manual-score" element={<ManualScoreEntry />} />
        <Route path="report-cards" element={<ReportCardList />} />
        <Route path="parents" element={<ParentList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="student-comments" element={<TeacherComments />} />
      </Route>

      {/* Legacy redirects */}
      <Route path="/dashboard" element={<RoleBasedDashboardRedirect />} />
      <Route path="/dashboard/students" element={<ProtectedRoute><Navigate to="/admin-dashboard/students" replace /></ProtectedRoute>} />
      <Route path="/dashboard/classes" element={<ProtectedRoute><Navigate to="/admin-dashboard/classes" replace /></ProtectedRoute>} />
      <Route path="/dashboard/subjects" element={<ProtectedRoute><Navigate to="/admin-dashboard/subjects" replace /></ProtectedRoute>} />
      <Route path="/dashboard/users" element={<ProtectedRoute><Navigate to="/admin-dashboard/users" replace /></ProtectedRoute>} />
      <Route path="/dashboard/exams" element={<ProtectedRoute><Navigate to="/admin-dashboard/exams" replace /></ProtectedRoute>} />
      <Route path="/dashboard/results" element={<ProtectedRoute><Navigate to="/admin-dashboard/results" replace /></ProtectedRoute>} />
      <Route path="/dashboard/academic-years" element={<ProtectedRoute><Navigate to="/admin-dashboard/academic-years" replace /></ProtectedRoute>} />
      <Route path="/dashboard/terms" element={<ProtectedRoute><Navigate to="/admin-dashboard/terms" replace /></ProtectedRoute>} />
      <Route path="/dashboard/promotions" element={<ProtectedRoute><Navigate to="/admin-dashboard/promotions" replace /></ProtectedRoute>} />
      <Route path="/dashboard/report-cards" element={<ProtectedRoute><Navigate to="/admin-dashboard/report-cards" replace /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><Navigate to="/admin-dashboard/settings" replace /></ProtectedRoute>} />
      <Route path="/dashboard/teacher-assignments" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout><TeacherAssignments /></DashboardLayout></ProtectedRoute>} />

      {/* Entrance Exam Route - No Auth Required (token-based) */}
      <Route path="/entrance-exam/take" element={<EntranceExamTake />} />

      {/* Student Exam Route - Standalone Page */}
      <Route path="/student/exam/:examId" element={<ProtectedRoute allowedRoles={['Student']}><TakeExam /></ProtectedRoute>} />

      {/* Student Exam Routes - With Dashboard Layout */}
      <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['Student']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ExamList />} />
        <Route path=":examId/take" element={<TakeExam />} />
      </Route>

      {/* Student Dashboard Route */}
      <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />

      {/* Parent Dashboard Route */}
      <Route path="/parent-dashboard" element={<ProtectedRoute allowedRoles={['Parent']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ParentDashboard />} />
        <Route path="children" element={<MyChildren />} />
        <Route path="results/:studentId" element={<ParentStudentResult />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ID Card Route */}
      <Route path="/my-id-card" element={<ProtectedRoute allowedRoles={['Teacher', 'Student']}><IdCard /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <MockDataProvider>
          <NotificationProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
          </NotificationProvider>
        </MockDataProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
