import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:64677';

// ============================================
// ERROR HANDLING UTILITY
// ============================================
/**
 * Extracts user-friendly error message from API response
 * Priority: errors[0] > message > default
 */
export const getErrorMessage = (error) => {
  // Handle axios error
  if (error?.response?.data) {
    const { data } = error.response;
    
    // Check for errors array first (most specific)
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0];
    }
    
    // Then check message
    if (data.message) {
      return data.message;
    }
  }
  
  // Handle network errors
  if (error?.message) {
    if (error.message.includes('Network Error')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
  }
  
  // Default fallback
  return 'Something went wrong. Please try again.';
};

/**
 * Checks if error response contains specific error keyword
 */
export const hasError = (error, keyword) => {
  if (error?.response?.data) {
    const { data } = error.response;
    const searchText = (data.errors?.[0] || data.message || '').toLowerCase();
    return searchText.includes(keyword.toLowerCase());
  }
  return false;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Get user role BEFORE clearing localStorage
      const savedUser = localStorage.getItem('user');
      let userRole = null;
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          userRole = parsed?.role;
        } catch (e) {}
      }
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
          if (response.data?.success) {
            const { token, user } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Redirect based on user role - students go to student-login, others to login
      if (userRole === 'Student') {
        window.location.href = '/student-login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// PUBLIC API (No authentication required)
// ============================================
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  studentLogin: (credentials) => api.post('/api/auth/student-login', credentials),
  register: (data) => api.post('/api/auth/register', data),
  checkEmail: (email) => api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`),
  logout: () => api.post('/api/auth/logout'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  getCurrentUser: () => api.get('/api/auth/me'),
  getCsrfToken: () => api.get('/api/auth/csrf-token'),
};

// ============================================
// ADMIN & SUPER ADMIN API
// ============================================
export const adminAPI = {
  users: {
    getAll: (page = 1, pageSize = 10) => api.get(`/api/users?pageNumber=${page}&pageSize=${pageSize}`),
    getById: (id) => api.get(`/api/users/${id}`),
    create: (data) => api.post('/api/users', data),
    update: (id, data) => api.put(`/api/users/${id}`, data),
    delete: (id) => api.delete(`/api/users/${id}`),
    assignRole: (id, data) => api.post(`/api/users/${id}/roles`, data),
  },
  roles: {
    getAll: () => api.get('/api/roles'),
    getById: (id) => api.get(`/api/roles/${id}`),
    create: (data) => api.post('/api/roles', data),
    update: (id, data) => api.put(`/api/roles/${id}`, data),
    delete: (id) => api.delete(`/api/roles/${id}`),
  },
  academicYears: {
    getAll: () => api.get('/api/academicyears'),
    getById: (id) => api.get(`/api/academicyears/${id}`),
    getActive: () => api.get('/api/academicyears/active'),
    create: (data) => api.post('/api/academicyears', data),
    update: (id, data) => api.put(`/api/academicyears/${id}`, data),
    delete: (id) => api.delete(`/api/academicyears/${id}`),
    setActive: (id) => api.post(`/api/academicyears/${id}/set-active`),
    triggerAutoEnrollment: (id) => api.post(`/api/academicyears/${id}/auto-enroll`),
    updateResumeDate: (id, data) => api.put(`/api/academicyears/${id}/resume-date`, data),
  },
  terms: {
    getAll: () => api.get('/api/terms'),
    getById: (id) => api.get(`/api/terms/${id}`),
    getActive: () => api.get('/api/terms/active'),
    getByAcademicYear: (academicYearId) => api.get(`/api/terms/by-academic-year/${academicYearId}`),
    create: (data) => api.post('/api/terms', data),
    update: (id, data) => api.put(`/api/terms/${id}`, data),
    delete: (id) => api.delete(`/api/terms/${id}`),
    setActive: (id) => api.post(`/api/terms/${id}/set-active`),
    updateResumeDate: (id, data) => api.put(`/api/terms/${id}/resume-date`, data),
  },
  classes: {
    getAll: () => api.get('/api/classes'),
    getById: (id) => api.get(`/api/classes/${id}`),
    create: (data) => api.post('/api/classes', data),
    update: (id, data) => api.put(`/api/classes/${id}`, data),
    delete: (id) => api.delete(`/api/classes/${id}`),
    bulkUploadStudents: (classId, formData) => api.post(`/api/classes/${classId}/students/bulk-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  },
  subjects: {
    getAll: () => api.get('/api/subjects'),
    getById: (id) => api.get(`/api/subjects/${id}`),
    create: (data) => api.post('/api/subjects', data),
    update: (id, data) => api.put(`/api/subjects/${id}`, data),
    delete: (id) => api.delete(`/api/subjects/${id}`),
  },
  classSubjects: {
    getAll: () => api.get('/api/classsubjects'),
    getById: (id) => api.get(`/api/classsubjects/${id}`),
    getByClass: (classId, page = 1, pageSize = 100) => api.get(`/api/classsubjects/class/${classId}?pageNumber=${page}&pageSize=${pageSize}`),
    getByTeacher: (teacherId, page = 1, pageSize = 50) => api.get(`/api/classsubjects/teacher/${teacherId}?pageNumber=${page}&pageSize=${pageSize}`),
    getMyAssignments: (page = 1, pageSize = 50) => api.get(`/api/classsubjects/my-assignments?pageNumber=${page}&pageSize=${pageSize}`),
    assign: (data) => api.post('/api/classsubjects', data),
    update: (id, data) => api.put(`/api/classsubjects/${id}`, data),
    delete: (id) => api.delete(`/api/classsubjects/${id}`),
  },
  students: {
    getAll: (page = 1, pageSize = 10) => api.get(`/api/students/paged?pageNumber=${page}&pageSize=${pageSize}`),
    getById: (id) => api.get(`/api/students/${id}`),
    getByClass: (classId) => api.get(`/api/students/class/${classId}`),
    getByClassPaged: (classId, page = 1, pageSize = 10, academicYearId = null) => {
      const params = new URLSearchParams();
      params.append('pageNumber', page);
      params.append('pageSize', pageSize);
      if (academicYearId) {
        params.append('academicYearId', academicYearId);
      }
      return api.get(`/api/students/class/${classId}/paged?${params.toString()}`);
    },
    getPaged: (page = 1, pageSize = 10) => api.get(`/api/students/paged?pageNumber=${page}&pageSize=${pageSize}`),
    create: (data) => api.post('/api/students', data),
    registerStudent: (data) => api.post('/api/students/register', data),
    registerWithParents: (data) => api.post('/api/students/register-with-parents', data),
    update: (id, data) => api.put(`/api/students/${id}`, data),
    delete: (id) => api.delete(`/api/students/${id}`),
    enroll: (data) => api.post('/api/students/enroll', data),
    linkParent: (studentId, data) => api.post(`/api/students/${studentId}/parents`, data),
    generateIdCard: (id) => api.get(`/api/students/${id}/id-card`),
  },
  exams: {
    getAll: () => api.get('/api/exams'),
    getById: (id) => api.get(`/api/exams/${id}`),
    getByClass: (classId, page = 1, pageSize = 20, teacherId = null) => api.get(`/api/exams/class/${classId}?pageNumber=${page}&pageSize=${pageSize}${teacherId ? `&teacherId=${teacherId}` : ''}`),
    getMyExams: (page = 1, pageSize = 20) => api.get(`/api/exams/all?pageNumber=${page}&pageSize=${pageSize}`),
    getSchedule: (teacherId) => api.get(`/api/exams/schedule${teacherId ? `?teacherId=${teacherId}` : ''}`),
    create: (data) => api.post('/api/exams', data),
    update: (id, data) => api.put(`/api/exams/${id}`, data),
    delete: (id) => api.delete(`/api/exams/${id}`),
    start: (id) => api.post(`/api/exams/${id}/start`),
    end: (id) => api.post(`/api/exams/${id}/end`),
    allowRetake: (id, data) => api.post(`/api/exams/${id}/allow-retake`, data),
  },
  questions: {
    getByExam: (examId) => api.get(`/api/questions/exam/${examId}`),
    getById: (id) => api.get(`/api/questions/${id}`),
    create: (examId, data) => api.post(`/api/exams/${examId}/questions`, data),
    upload: (examId, formData) => api.post(`/api/exams/${examId}/questions/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.put(`/api/questions/${id}`, data),
    delete: (id) => api.delete(`/api/questions/${id}`),
  },
  results: {
    getByStudentAndTerm: (studentId, termId, includeUnpublished = false) => api.get(`/api/results/student/${studentId}/term/${termId}?includeUnpublished=${includeUnpublished}`),
    getStudentResults: (studentId, page = 1, pageSize = 20) => api.get(`/api/results/student/${studentId}/paged?pageNumber=${page}&pageSize=${pageSize}`),
    getCumulative: (studentId, academicYearId) => api.get(`/api/results/cumulative/student/${studentId}/academic-year/${academicYearId}`),
    getCumulativeResults: (studentId, academicYearId) => api.get(`/api/results/cumulative/student/${studentId}/academic-year/${academicYearId}`),
    calculateCumulative: (academicYearId, classId) => api.post(`/api/results/cumulative/calculate?academicYearId=${academicYearId}${classId ? `&classId=${classId}` : ''}`),
    getById: (id) => api.get(`/api/results/${id}`),
    getStudentAvailableTerms: (studentId) => api.get(`/api/results/student/${studentId}/available-terms`),
    publish: (data) => api.post('/api/results/publish', data),
    updateRemarks: (id, data) => api.put(`/api/results/${id}`, data),
    updatePsychomotorAffective: (id, data) => api.put(`/api/results/${id}/psychomotor-affective`, data),
    delete: (id) => api.delete(`/api/results/${id}`),
    calculatePositions: (data) => api.post('/api/results/positions/calculate', data),
  },
  grades: {
    getAll: () => api.get('/api/grades'),
    getBySchoolLevel: (schoolLevel) => api.get(`/api/grades/school-level/${schoolLevel}`),
    getById: (id) => api.get(`/api/grades/${id}`),
    create: (data) => api.post('/api/grades', data),
    update: (id, data) => api.put(`/api/grades/${id}`, data),
    delete: (id) => api.delete(`/api/grades/${id}`),
    seedDefaults: () => api.post('/api/grades/seed-defaults'),
    updateBySchoolLevel: (data) => api.put('/api/grades/school-level', data),
  },
  reportCards: {
    getByStudentAndTerm: (studentId, termId) => api.get(`/api/reportcards/students/${studentId}/terms/${termId}`),
    getByClassAndTerm: (classId, termId) => api.get(`/api/reportcards/classes/${classId}/terms/${termId}`),
    getMyReportCard: (termId, studentId) => api.get(`/api/reportcards/my-report-card?termId=${termId}${studentId ? `&studentId=${studentId}` : ''}`),
    calculate: (data) => api.post('/api/reportcards/calculate', data),
  },
  promotions: {
    getCalculated: (academicYearId, classId, status, page = 1, pageSize = 20) =>
      api.get(`/api/promotions/calculated?academicYearId=${academicYearId}${classId ? `&classId=${classId}` : ''}${status ? `&statusFilter=${status}` : ''}&pageNumber=${page}&pageSize=${pageSize}`),
    calculate: (academicYearId, classId) => 
      api.post(`/api/promotions/calculate?academicYearId=${academicYearId}${classId ? `&classId=${classId}` : ''}`),
    getStudentStatus: (studentId, academicYearId) => api.get(`/api/promotions/students/${studentId}/status?academicYearId=${academicYearId}`),
    getMyStatus: (studentId, academicYearId) => api.get(`/api/students/${studentId}/my-promotion-status?academicYearId=${academicYearId}`),
    override: (studentId, academicYearId, data) => api.put(`/api/promotions/${studentId}/override?academicYearId=${academicYearId}`, data),
    publishWithResults: (data) => api.post('/api/promotions/publish-with-promotions', data),
    getCriteria: (academicYearId) => api.get(`/api/promotions/criteria?academicYearId=${academicYearId}`),
    createCriteria: (data) => api.post('/api/promotions/criteria', data),
    updateCriteria: (id, data) => api.put(`/api/promotions/criteria/${id}`, data),
    deleteCriteria: (id) => api.delete(`/api/promotions/criteria/${id}`),
  },
  cache: {
    clear: () => api.post('/api/cache/clear'),
    getStats: () => api.get('/api/cache/stats'),
    getHealth: () => api.get('/api/cache/health'),
  },
  parents: {
    getAll: (page = 1, pageSize = 10) => api.get(`/api/parents?pageNumber=${page}&PageSize=${pageSize}`),
    getById: (id) => api.get(`/api/parents/${id}`),
    create: (data) => api.post('/api/parents/register', data),
    update: (id, data) => api.put(`/api/parents/${id}`, data),
    delete: (id) => api.delete(`/api/parents/${id}`),
    linkStudent: (parentId, studentId, data) => {
      const params = data ? `?relationship=${data.relationship || ''}&isPrimaryContact=${data.isPrimaryContact || false}&canAccessResults=${data.canAccessResults !== false}` : '';
      return api.post(`/api/parents/${parentId}/link-student/${studentId}${params}`);
    },
    unlinkStudent: (parentId, studentId) => api.delete(`/api/parents/${parentId}/unlink-student/${studentId}`),
    createWithUser: (data) => api.post('/api/parents/register', data),
    createStudentAndParent: (data) => api.post('/api/parents/create-student-parent', data),
    getMyChildren: () => api.get('/api/parents/my-children'),
  },
  scores: {
    getStudentScores: (studentId, academicYearId) => api.get(`/api/scores/student/${studentId}?academicYearId=${academicYearId}`),
    manual: (data) => api.post('/api/scores/manual', data),
    bulkManual: (data) => api.post('/api/scores/bulk-manual', data),
  },
};

// ============================================
// TEACHER API
// ============================================
export const teacherAPI = {
  myAssignments: {
    getAll: (page = 1, pageSize = 20) => api.get(`/api/classsubjects/my-assignments?pageNumber=${page}&pageSize=${pageSize}`),
  },
  examAttempts: {
    getByExam: (examId, page = 1, pageSize = 20) => api.get(`/api/examattempts/exam/${examId}?pageNumber=${page}&pageSize=${pageSize}`),
    getByStudent: (studentId, page = 1, pageSize = 20) => api.get(`/api/examattempts/student/${studentId}?pageNumber=${page}&pageSize=${pageSize}`),
    getById: (id) => api.get(`/api/examattempts/${id}`),
    gradeTheory: (data) => api.post('/api/examattempts/grade-theory', data),
    reset: (data) => api.post('/api/examattempts/reset', data),
    delete: (id) => api.delete(`/api/examattempts/${id}`),
  },
  scores: {
    manual: (data) => api.post('/api/scores/manual', data),
    bulkManual: (data) => api.post('/api/scores/bulk-manual', data),
    getStudentScores: (studentId, academicYearId) => api.get(`/api/scores/student/${studentId}?academicYearId=${academicYearId}`),
  },
  ...adminAPI,
};

// ============================================
// STUDENT API
// ============================================
export const studentAPI = {
  profile: { get: () => api.get('/api/students/my-profile') },
  myExams: { getAvailable: () => api.get('/api/exams/available') },
  myAttempts: {
    getAll: (page = 1, pageSize = 20) => api.get(`/api/examattempts/student?pageNumber=${page}&pageSize=${pageSize}`),
    getById: (id) => api.get(`/api/examattempts/${id}`),
    start: (data) => api.post('/api/examattempts/start', data),
    submit: (data) => api.post('/api/examattempts/submit', data),
  },
  myResults: {
    getByTerm: (studentId, termId) => api.get(`/api/results/student/${studentId}/term/${termId}`),
    getCumulative: (studentId, academicYearId) => api.get(`/api/results/cumulative/student/${studentId}/academic-year/${academicYearId}`),
  },
  myReportCard: {
    getByTerm: (termId, studentId) => api.get(`/api/reportcards/my-report-card?termId=${termId}${studentId ? `&studentId=${studentId}` : ''}`),
  },
  myPromotion: {
    getStatus: (studentId, academicYearId) => api.get(`/api/students/${studentId}/my-promotion-status?academicYearId=${academicYearId}`),
  },
};

// ============================================
// PARENT API
// ============================================
export const parentAPI = {
  children: { getAll: () => api.get('/api/parents/my-children') },
  childResults: {
    getByTerm: (studentId, termId) => api.get(`/api/results/student/${studentId}/term/${termId}`),
    getCumulative: (studentId, academicYearId) => api.get(`/api/results/cumulative/student/${studentId}/academic-year/${academicYearId}`),
  },
  childReportCard: {
    getByTerm: (studentId, termId) => api.get(`/api/reportcards/students/${studentId}/terms/${termId}`),
  },
  childPromotion: {
    getStatus: (studentId, academicYearId) => api.get(`/api/students/${studentId}/my-promotion-status?academicYearId=${academicYearId}`),
  },
};

// ============================================
// COMMENTS API (Admin - for managing teacher remarks and headmaster comments)
// ============================================
export const commentsAPI = {
  // Teacher Remarks
  getTeacherRemarks: () => api.get('/api/comments/teacher-remarks'),
  getTeacherRemarksBySchoolLevel: (schoolLevel) => api.get(`/api/comments/teacher-remarks/school-level/${schoolLevel}`),
  getTeacherRemark: (id) => api.get(`/api/comments/teacher-remarks/${id}`),
  createTeacherRemark: (data) => api.post('/api/comments/teacher-remarks', data),
  updateTeacherRemark: (id, data) => api.put(`/api/comments/teacher-remarks/${id}`, data),
  deleteTeacherRemark: (id) => api.delete(`/api/comments/teacher-remarks/${id}`),
  reactivateTeacherRemark: (id) => api.put(`/api/comments/teacher-remarks/${id}/reactivate`),
  seedTeacherRemarks: () => api.post('/api/comments/teacher-remarks/seed-defaults'),
  batchUpdateTeacherRemarks: (data) => api.put('/api/comments/teacher-remarks/batch', data),
  
  // Headmaster Comments
  getHeadmasterComments: () => api.get('/api/comments/headmaster-comments'),
  getHeadmasterCommentsBySchoolLevel: (schoolLevel) => api.get(`/api/comments/headmaster-comments/school-level/${schoolLevel}`),
  getHeadmasterComment: (id) => api.get(`/api/comments/headmaster-comments/${id}`),
  createHeadmasterComment: (data) => api.post('/api/comments/headmaster-comments', data),
  updateHeadmasterComment: (id, data) => api.put(`/api/comments/headmaster-comments/${id}`, data),
  deleteHeadmasterComment: (id) => api.delete(`/api/comments/headmaster-comments/${id}`),
  reactivateHeadmasterComment: (id) => api.put(`/api/comments/headmaster-comments/${id}/reactivate`),
  seedHeadmasterComments: () => api.post('/api/comments/headmaster-comments/seed-defaults'),
  batchUpdateHeadmasterComments: (data) => api.put('/api/comments/headmaster-comments/batch', data),
  
  // Utility
  recalculateComments: () => api.post('/api/comments/recalculate-comments'),
};

// ============================================
// SHARED API
// ============================================
export const sharedAPI = {
  dashboard: { getStatistics: () => api.get('/api/dashboard/statistics') },
  examAttempts: {
    start: (data) => api.post('/api/examattempts/start', data),
    submit: (data) => api.post('/api/examattempts/submit', data),
    getByStudent: (studentId, page = 1, pageSize = 20) => api.get(`/api/examattempts/student/${studentId}?pageNumber=${page}&pageSize=${pageSize}`),
    getById: (id) => api.get(`/api/examattempts/${id}`),
    getByExamAndStudent: (examId, studentId) => api.get(`/api/examattempts/exam/${examId}`),
  },
  questions: { 
    // Use QuestionsController endpoint: GET /api/exam/{examId}
    getByExam: (examId) => api.get(`/api/questions/exam/${examId}`)
  },
};

// ============================================
// LEGACY EXPORTS
// ============================================
export const usersAPI = adminAPI.users;
export const rolesAPI = adminAPI.roles;
export const classesAPI = adminAPI.classes;
export const subjectsAPI = adminAPI.subjects;
export const classSubjectsAPI = adminAPI.classSubjects;
export const studentsAPI = adminAPI.students;
export const examsAPI = adminAPI.exams;
export const questionsAPI = adminAPI.questions;
export const attemptsAPI = sharedAPI.examAttempts;
export const resultsAPI = adminAPI.results;
export const academicYearsAPI = adminAPI.academicYears;
export const termsAPI = adminAPI.terms;
export const dashboardAPI = sharedAPI.dashboard;
export const reportCardsAPI = adminAPI.reportCards;
export const gradesAPI = adminAPI.grades;
export const promotionsAPI = adminAPI.promotions;

export default api;
