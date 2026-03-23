import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { MockDataProvider } from './context/MockDataContext';
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
import ParentList from './pages/Parents/ParentList';
import ParentForm from './pages/Parents/ParentForm';
import MyChildren from './pages/Parents/MyChildren';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';
import TeacherSchedule from './pages/Teachers/TeacherSchedule';
import TeacherTopStudents from './pages/Teachers/TeacherTopStudents';
import TeacherAssignments from './pages/Teachers/TeacherAssignments';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ParentDashboard from './pages/Dashboard/ParentDashboard';
import SystemStatus from './pages/Admin/SystemStatus';
import TeacherRemarks from './pages/Admin/TeacherRemarks';
import HeadmasterComments from './pages/Admin/HeadmasterComments';
import Settings from './pages/Settings';
import GradeManagement from './pages/Grades/GradeManagement';
import StudentProfile from './pages/Students/StudentProfile';
import LandingPage from './pages/landingPage';
import PaymentPage from './pages/PaymentPage';
import Gallery from './pages/Gallery';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole, loading, tokenValidated, user } = useAuth();

  console.log('🔒 ProtectedRoute - isAuthenticated:', isAuthenticated, 'tokenValidated:', tokenValidated, 'user:', user, 'allowedRoles:', allowedRoles);

  if (loading) {
    console.log('🔒 ProtectedRoute - Loading...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !tokenValidated) {
    console.log('🔒 ProtectedRoute - Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    console.log('🔒 ProtectedRoute - Role not allowed, redirecting to /dashboard. user.role:', user?.role);
    return <Navigate to="/dashboard" />;
  }

  console.log('🔒 ProtectedRoute - Allowing access');
  return children;
};

// Role-Based Dashboard Redirect Component
const RoleBasedDashboardRedirect = () => {
  const { user, loading, tokenValidated } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !tokenValidated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else if (user.role === 'Teacher') {
    return <Navigate to="/teacher-dashboard" replace />;
  } else if (user.role === 'Student') {
    return <Navigate to="/student-dashboard" replace />;
  } else if (user.role === 'Parent') {
    return <Navigate to="/parent-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { loading, user, isAuthenticated } = useAuth();

  console.log('🔓 PublicRoute - isAuthenticated:', isAuthenticated, 'user:', user);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    console.log('🔓 PublicRoute - Already authenticated, redirecting...');
    if (user.role === 'Student') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (user.role === 'Teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (user.role === 'Admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'Parent') {
      return <Navigate to="/parent-dashboard" replace />;
    }
  }

  return children;
};

// Home Route Component
const HomeRoute = () => {
  const { isAuthenticated, user, loading, tokenValidated } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated && tokenValidated && user) {
    if (user.role === 'Admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'Teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (user.role === 'Student') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (user.role === 'Parent') {
      return <Navigate to="/parent-dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <LandingPage />;
};

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
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Admin Dashboard Routes */}
      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="system-status" element={<SystemStatus />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/add-student-parent" element={<AddStudentParent />} />
        <Route path="students/:id/edit" element={<StudentForm />} />
        <Route path="students/:studentId/grade" element={<GradeTheory />} />
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
        <Route path="results" element={<ResultList />} />
        <Route path="results/student/:studentId" element={<StudentResult />} />
        <Route path="parents" element={<ParentList />} />
        <Route path="parents/new" element={<ParentForm />} />
        <Route path="parents/:id/edit" element={<ParentForm />} />
        <Route path="settings" element={<Settings />} />
        <Route path="grade-management" element={<GradeManagement />} />
        <Route path="student-profiles" element={<StudentProfile />} />
        <Route path="teacher-assignments" element={<TeacherAssignments />} />
        <Route path="teacher-remarks" element={<TeacherRemarks />} />
        <Route path="headmaster-comments" element={<HeadmasterComments />} />
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
        <Route path="classes" element={<ClassList />} />
        <Route path="subjects" element={<SubjectList />} />
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/new" element={<ExamForm />} />
        <Route path="exams/:id/edit" element={<ExamForm />} />
        <Route path="exams/:examId/questions" element={<QuestionBuilder />} />
        <Route path="exams/:examId/grade" element={<GradeTheory />} />
        <Route path="results" element={<ResultList />} />
        <Route path="results/student/:studentId" element={<StudentResult />} />
        <Route path="report-cards" element={<ReportCardList />} />
        <Route path="parents" element={<ParentList />} />
        <Route path="settings" element={<Settings />} />
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
          <Router>
            <AppRoutes />
          </Router>
        </MockDataProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
