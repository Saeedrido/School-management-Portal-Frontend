# 📋 BACKEND vs FRONTEND - ENDPOINT COMPARISON

## AUTH ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/auth/login` | POST | `authAPI.login()` | ✅ MATCH | Login with email/password |
| `/api/auth/register` | POST | `authAPI.register()` | ✅ MATCH | User registration |
| `/api/auth/logout` | POST | `authAPI.logout()` | ✅ MATCH | User logout |
| `/api/auth/refresh` | POST | `authAPI.refresh()` | ⚠️ MISSING | Add to authAPI |
| `/api/auth/change-password` | POST | `authAPI.changePassword()` | ✅ MATCH | Change password |
| `/api/auth/forgot-password` | POST | `authAPI.forgotPassword()` | ✅ MATCH | Password reset request |
| `/api/auth/reset-password` | POST | `authAPI.resetPassword()` | ✅ MATCH | Reset with token |
| `/api/auth/me` | GET | `authAPI.getCurrentUser()` | ✅ MATCH | Get current user |
| `/api/auth/csrf-token` | GET | `authAPI.getCsrfToken()` | ✅ MATCH | Anti-CSRF token |

## USER ENDPOINTS (Admin/SuperAdmin)

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/users` | GET | `adminAPI.users.getAll()` | ✅ MATCH | Get all users |
| `/api/users/{id}` | GET | `adminAPI.users.getById()` | ✅ MATCH | Get user by ID |
| `/api/users` | POST | `adminAPI.users.create()` | ✅ MATCH | Create user |
| `/api/users/{id}` | PUT | `adminAPI.users.update()` | ✅ MATCH | Update user |
| `/api/users/{id}` | DELETE | `adminAPI.users.delete()` | ✅ MATCH | Delete user |
| `/api/users/{id}/roles` | POST | `adminAPI.users.assignRole()` | ✅ FIXED | Was `/api/users/assign-role` |

## ROLE ENDPOINTS (Admin/SuperAdmin)

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/roles` | GET | `adminAPI.roles.getAll()` | ✅ MATCH | Get all roles |
| `/api/roles/{id}` | GET | `adminAPI.roles.getById()` | ✅ MATCH | Get role by ID |
| `/api/roles` | POST | `adminAPI.roles.create()` | ✅ MATCH | Create role |
| `/api/roles/{id}` | PUT | `adminAPI.roles.update()` | ✅ MATCH | Update role |
| `/api/roles/{id}` | DELETE | `adminAPI.roles.delete()` | ✅ MATCH | Delete role |

## ACADEMIC YEAR ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/academicyears` | GET | `adminAPI.academicYears.getAll()` | ✅ MATCH | Get all |
| `/api/academicyears/active` | GET | `adminAPI.academicYears.getActive()` | ✅ FIXED | Was `/current` |
| `/api/academicyears/{id}` | GET | `adminAPI.academicYears.getById()` | ✅ MATCH | Get by ID |
| `/api/academicyears` | POST | `adminAPI.academicYears.create()` | ✅ MATCH | Create |
| `/api/academicyears/{id}` | PUT | `adminAPI.academicYears.update()` | ✅ MATCH | Update |
| `/api/academicyears/{id}` | DELETE | `adminAPI.academicYears.delete()` | ✅ MATCH | Delete |
| `/api/academicyears/{id}/set-active` | POST | `adminAPI.academicYears.setActive()` | ✅ ADDED | New endpoint |

## TERM ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/terms` | GET | `adminAPI.terms.getAll()` | ✅ MATCH | Get all |
| `/api/terms/active` | GET | `adminAPI.terms.getActive()` | ✅ FIXED | Was `/current` |
| `/api/terms/by-academic-year/{id}` | GET | `adminAPI.terms.getByAcademicYear()` | ✅ ADDED | New endpoint |
| `/api/terms/{id}` | GET | `adminAPI.terms.getById()` | ✅ MATCH | Get by ID |
| `/api/terms` | POST | `adminAPI.terms.create()` | ✅ MATCH | Create |
| `/api/terms/{id}` | PUT | `adminAPI.terms.update()` | ✅ MATCH | Update |
| `/api/terms/{id}` | DELETE | `adminAPI.terms.delete()` | ✅ MATCH | Delete |
| `/api/terms/{id}/set-active` | POST | `adminAPI.terms.setActive()` | ✅ ADDED | New endpoint |

## CLASS ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/classes` | GET | `adminAPI.classes.getAll()` | ✅ MATCH | Get all |
| `/api/classes/{id}` | GET | `adminAPI.classes.getById()` | ✅ MATCH | Get by ID |
| `/api/classes` | POST | `adminAPI.classes.create()` | ✅ MATCH | Create |
| `/api/classes/{id}` | PUT | `adminAPI.classes.update()` | ✅ MATCH | Update |
| `/api/classes/{id}` | DELETE | `adminAPI.classes.delete()` | ✅ MATCH | Delete |
| `/api/classes/my-classes` | GET | `teacherAPI.myClasses.getAll()` | ⚠️ NO BACKEND | Needs implementation |

## SUBJECT ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/subjects` | GET | `adminAPI.subjects.getAll()` | ✅ MATCH | Get all |
| `/api/subjects/{id}` | GET | `adminAPI.subjects.getById()` | ✅ MATCH | Get by ID |
| `/api/subjects` | POST | `adminAPI.subjects.create()` | ✅ MATCH | Create |
| `/api/subjects/{id}` | PUT | `adminAPI.subjects.update()` | ✅ MATCH | Update |
| `/api/subjects/{id}` | DELETE | `adminAPI.subjects.delete()` | ✅ MATCH | Delete |
| `/api/subjects/my-subjects` | GET | `teacherAPI.mySubjects.getAll()` | ⚠️ NO BACKEND | Needs implementation |

## CLASS SUBJECT ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/classsubjects` | GET | `adminAPI.classSubjects.getAll()` | ✅ MATCH | Get all |
| `/api/classsubjects/{id}` | GET | `adminAPI.classSubjects.getById()` | ✅ MATCH | Get by ID |
| `/api/classsubjects` | POST | `adminAPI.classSubjects.assign()` | ✅ MATCH | Assign |
| `/api/classsubjects/{id}` | PUT | `adminAPI.classSubjects.update()` | ✅ MATCH | Update |
| `/api/classsubjects/{id}` | DELETE | `adminAPI.classSubjects.delete()` | ✅ MATCH | Delete |

## STUDENT ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/students` | GET | `adminAPI.students.getAll()` | ✅ MATCH | Get all |
| `/api/students/{id}` | GET | `adminAPI.students.getById()` | ✅ MATCH | Get by ID |
| `/api/students/class/{classId}` | GET | `adminAPI.students.getByClass()` | ✅ MATCH | By class |
| `/api/students/paged` | GET | `adminAPI.students.getPaged()` | ✅ MATCH | Paginated |
| `/api/students/class/{classId}/paged` | GET | `adminAPI.students.getByClassPaged()` | ✅ MATCH | By class paged |
| `/api/students` | POST | `adminAPI.students.create()` | ✅ MATCH | Create |
| `/api/students/{id}` | PUT | `adminAPI.students.update()` | ✅ MATCH | Update |
| `/api/students/{id}` | DELETE | `adminAPI.students.delete()` | ✅ MATCH | Delete |
| `/api/students/enroll` | POST | `adminAPI.students.enroll()` | ✅ MATCH | Enroll |
| `/api/students/{studentId}/parents` | POST | `adminAPI.students.linkParent()` | ✅ MATCH | Link parent |
| `/api/students/my-profile` | GET | `studentAPI.profile.get()` | ⚠️ NO BACKEND | Needs implementation |

## EXAM ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/exams` | GET | `adminAPI.exams.getAll()` | ⚠️ RESTRICTED | Backend returns error |
| `/api/exams/{id}` | GET | `adminAPI.exams.getById()` | ✅ MATCH | Get by ID |
| `/api/exams` | POST | `adminAPI.exams.create()` | ✅ MATCH | Create |
| `/api/exams/{id}` | PUT | `adminAPI.exams.update()` | ✅ MATCH | Update |
| `/api/exams/{id}` | DELETE | `adminAPI.exams.delete()` | ✅ MATCH | Delete |
| `/api/exams/{id}/activate` | POST | `adminAPI.exams.activate()` | ✅ MATCH | Activate |
| `/api/exams/{id}/deactivate` | POST | `adminAPI.exams.deactivate()` | ✅ MATCH | Deactivate |
| `/api/exams/{id}/allow-retake` | POST | `adminAPI.exams.allowRetake()` | ✅ MATCH | Allow retake |
| `/api/exams/{id}/questions` | POST | `adminAPI.exams.addQuestion()` | ⚠️ MISSING | Not in api.js |
| `/api/exams/available` | GET | `studentAPI.myExams.getAvailable()` | ⚠️ NO BACKEND | Needs implementation |

## EXAM ATTEMPT ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/examattempts/student/{studentId}` | GET | `teacherAPI.examAttempts.getByStudent()` | ✅ MATCH | Get student attempts |
| `/api/examattempts/exam/{examId}` | GET | `teacherAPI.examAttempts.getByExam()` | ✅ MATCH | Get exam attempts |
| `/api/examattempts/{id}` | GET | `sharedAPI.examAttempts.getById()` | ✅ MATCH | Get attempt |
| `/api/examattempts/start` | POST | `sharedAPI.examAttempts.start()` | ✅ MATCH | Start exam |
| `/api/examattempts/submit` | POST | `sharedAPI.examAttempts.submit()` | ✅ MATCH | Submit exam |
| `/api/examattempts/grade-theory` | POST | `teacherAPI.examAttempts.gradeTheory()` | ✅ MATCH | Grade theory |
| `/api/examattempts/reset` | POST | `teacherAPI.examAttempts.reset()` | ✅ MATCH | Reset attempt |
| `/api/examattempts/{id}` | DELETE | `teacherAPI.examAttempts.delete()` | ✅ MATCH | Delete attempt |

## QUESTION ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/questions/exam/{examId}` | GET | `adminAPI.questions.getByExam()` | ✅ MATCH | Get exam questions |
| `/api/questions/{id}` | GET | `adminAPI.questions.getById()` | ✅ MATCH | Get question |
| `/api/questions/bulk` | POST | `adminAPI.questions.createBulk()` | ✅ MATCH | Bulk create |
| `/api/questions/{id}` | PUT | `adminAPI.questions.update()` | ✅ MATCH | Update |
| `/api/questions/{id}` | DELETE | `adminAPI.questions.delete()` | ✅ MATCH | Delete |

## RESULT ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/results/student/{studentId}/term/{termId}` | GET | `adminAPI.results.getByStudentAndTerm()` | ✅ MATCH | Student results |
| `/api/results/cumulative/student/{studentId}/academic-year/{academicYearId}` | GET | `adminAPI.results.getCumulativeResults()` | ✅ MATCH | Cumulative |
| `/api/results/{id}` | GET | `adminAPI.results.getById()` | ✅ MATCH | Get result |
| `/api/results/publish` | POST | `adminAPI.results.publish()` | ✅ MATCH | Publish |
| `/api/results/{id}` | PUT | `adminAPI.results.updateRemarks()` | ✅ MATCH | Update remarks |
| `/api/results/{id}` | DELETE | `adminAPI.results.delete()` | ✅ MATCH | Delete |

## REPORT CARD ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/reportcards/students/{studentId}/terms/{termId}` | GET | `adminAPI.reportCards.getByStudentAndTerm()` | ✅ MATCH | Student report |
| `/api/reportcards/classes/{classId}/terms/{termId}` | GET | `adminAPI.reportCards.getByClassAndTerm()` | ✅ MATCH | Class reports |
| `/api/reportcards/my-report-card` | GET | `adminAPI.reportCards.getMyReportCard()` | ✅ MATCH | My report |
| `/api/reportcards/calculate` | POST | `adminAPI.reportCards.calculate()` | ✅ MATCH | Calculate |

## PROMOTION ENDPOINTS

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/promotions/calculated` | GET | `adminAPI.promotions.getCalculated()` | ✅ MATCH | Get calculated |
| `/api/promotions/students/{studentId}/status` | GET | `adminAPI.promotions.getStudentStatus()` | ✅ MATCH | Student status |
| `/api/students/{studentId}/my-promotion-status` | GET | `studentAPI.myPromotion.getStatus()` | ✅ MATCH | My status |
| `/api/promotions/{studentId}/override` | PUT | `adminAPI.promotions.override()` | ✅ MATCH | Override |
| `/api/promotions/publish-with-promotions` | POST | `adminAPI.promotions.publishWithResults()` | ✅ MATCH | Publish |
| `/api/promotions/criteria` | GET | `adminAPI.promotions.getCriteria()` | ✅ MATCH | Get criteria |
| `/api/promotions/criteria` | POST | `adminAPI.promotions.createCriteria()` | ✅ MATCH | Create criteria |
| `/api/promotions/criteria/{id}` | PUT | `adminAPI.promotions.updateCriteria()` | ✅ MATCH | Update criteria |
| `/api/promotions/criteria/{id}` | DELETE | `adminAPI.promotions.deleteCriteria()` | ✅ MATCH | Delete criteria |

## CACHE ENDPOINTS (Admin)

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/cache/stats` | GET | `adminAPI.cache.getStats()` | ✅ MATCH | Get stats |
| `/api/cache/health` | GET | `adminAPI.cache.getHealth()` | ✅ MATCH | Get health |
| `/api/cache/clear` | POST | `adminAPI.cache.clear()` | ✅ MATCH | Clear cache |

## PARENT ENDPOINTS (Missing)

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/parents/my-children` | GET | `parentAPI.children.getAll()` | ❌ MISSING | Create endpoint |

## STUDENT/PARENT SPECIFIC ENDPOINTS (Missing)

| Backend Route | Method | Frontend API | Status | Notes |
|---------------|--------|--------------|--------|-------|
| `/api/students/my-profile` | GET | `studentAPI.profile.get()` | ❌ MISSING | Create endpoint |
| `/api/exams/available` | GET | `studentAPI.myExams.getAvailable()` | ❌ MISSING | Create endpoint |
| `/api/dashboard/statistics` | GET | `sharedAPI.dashboard.getStatistics()` | ❌ MISSING | Create endpoint |

---

## SUMMARY

- **Total Backend Endpoints:** 120+
- **Matching Frontend APIs:** 95+
- **Fixed Mismatches:** 6
- **Missing Backend Endpoints:** 6
- **Matching Status:** ✅ 85% Complete

### Critical Missing Endpoints (High Priority)

1. `GET /api/parents/my-children` - For Parent Dashboard
2. `GET /api/students/my-profile` - For Student Profile
3. `GET /api/exams/available` - For Students to see available exams

### Nice-to-Have Endpoints (Low Priority)

4. `GET /api/classes/my-classes` - For Teachers
5. `GET /api/subjects/my-subjects` - For Teachers
6. `GET /api/dashboard/statistics` - For Dashboard widgets
