# Admin Backend Analysis Complete

## Overview
This document provides a complete analysis of all Admin-related backend endpoints for the school management system.

---

## STEP 1: Backend Endpoint Analysis

### **A. Class-Subject Assignment (Core Admin Feature)**

#### **Controller:** `ClassSubjectsController`
**Route:** `/api/ClassSubjects`

| HTTP Method | Endpoint | Description | Auth Required |
|-------------|----------|-------------|---------------|
| GET | `/api/ClassSubjects` | Get all class-subject assignments | Admin, Teacher, Student |
| GET | `/api/ClassSubjects/{id}` | Get specific class-subject assignment | All |
| GET | `/api/ClassSubjects/class/{classId}` | Get subjects for a specific class | All |
| GET | `/api/ClassSubjects/my-assignments` | Get current teacher's assignments | Admin, Teacher |
| POST | `/api/ClassSubjects` | **Create class-subject assignment** | All authenticated |
| PUT | `/api/ClassSubjects/{id}` | Update assignment | All authenticated |
| DELETE | `/api/ClassSubjects/{id}` | Delete assignment | All authenticated |

#### **Request DTO: AssignClassSubjectDto**
```csharp
public class AssignClassSubjectDto
{
    public Guid ClassId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid TermId { get; set; }
    public Guid? TeacherId { get; set; }  // Optional - for assigning teacher
}
```

#### **Response DTO: ClassSubjectDto**
```csharp
public class ClassSubjectDto
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid TermId { get; set; }
    public Guid? TeacherId { get; set; }
    public ClassDto? Class { get; set; }
    public SubjectDto? Subject { get; set; }
    public TermDto? Term { get; set; }
    public UserDto? Teacher { get; set; }
}
```

---

### **B. Classes Management**

#### **Controller:** `ClassesController`
**Route:** `/api/Classes`

| HTTP Method | Endpoint | Description | Auth Required |
|-------------|----------|-------------|---------------|
| GET | `/api/Classes` | Get all classes | Admin, Teacher, Student |
| GET | `/api/Classes/{id}` | Get specific class | All |
| POST | `/api/Classes` | Create new class | All authenticated |
| PUT | `/api/Classes/{id}` | Update class | All authenticated |
| DELETE | `/api/Classes/{id}` | Delete class | All authenticated |

#### **Request DTO: CreateClassDto**
```csharp
public class CreateClassDto
{
    public string Name { get; set; }
    public string? DisplayName { get; set; }
    public SchoolLevel SchoolLevel { get; set; }
    public int? ClassOrder { get; set; }
}
```

#### **Response DTO: ClassDto**
```csharp
public class ClassDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? DisplayName { get; set; }
    public SchoolLevel SchoolLevel { get; set; }
    public int? ClassOrder { get; set; }
}
```

---

### **C. Subjects Management**

#### **Controller:** `SubjectsController`
**Route:** `/api/Subjects`

| HTTP Method | Endpoint | Description | Auth Required |
|-------------|----------|-------------|---------------|
| GET | `/api/Subjects` | Get all subjects | All |
| GET | `/api/Subjects/{id}` | Get specific subject | All |
| POST | `/api/Subjects` | Create subject | All authenticated |
| PUT | `/api/Subjects/{id}` | Update subject | All authenticated |
| DELETE | `/api/Subjects/{id}` | Delete subject | All authenticated |

#### **Request DTO: CreateSubjectDto**
```csharp
public class CreateSubjectDto
{
    public string Name { get; set; }
    public string Code { get; set; }
    public string? Description { get; set; }
    public SchoolLevel SchoolLevel { get; set; }
    public int? SubjectOrder { get; set; }
}
```

---

### **D. Users (Teachers) Management**

#### **Controller:** `UsersController`
**Route:** `/api/Users`

| HTTP Method | Endpoint | Description | Auth Required |
|-------------|----------|-------------|---------------|
| GET | `/api/Users` | Get all users (paginated) | **SuperAdmin, Admin** |
| GET | `/api/Users/{id}` | Get specific user | All |
| POST | `/api/Users` | Create new user | **SuperAdmin, Admin** |
| PUT | `/api/Users/{id}` | Update user | **SuperAdmin, Admin** |
| DELETE | `/api/Users/{id}` | Delete user | **SuperAdmin, Admin** |
| POST | `/api/Users/{id}/roles` | Assign roles to user | **SuperAdmin, Admin** |

---

### **E. Terms Management**

#### **Controller:** `TermsController`
**Route:** `/api/Terms`

| HTTP Method | Endpoint | Description | Auth Required |
|-------------|----------|-------------|---------------|
| GET | `/api/Terms` | Get all terms | All |
| GET | `/api/Terms/active` | Get active term | All |
| GET | `/api/Terms/by-academic-year/{academicYearId}` | Get terms by academic year | All |
| POST | `/api/Terms` | Create term | All authenticated |
| PUT | `/api/Terms/{id}` | Update term | All authenticated |
| DELETE | `/api/Terms/{id}` | Delete term | All authenticated |

---

## STEP 2: Seeded Data Structure

### **Classes Seeding (DataSeeder.cs)**

**Total Seeded Classes:** 12 classes

#### **Primary School (6 classes)**
1. Primary 1 (Primary School 1)
2. Primary 2 (Primary School 2)
3. Primary 3 (Primary School 3)
4. Primary 4 (Primary School 4)
5. Primary 5 (Primary School 5)
6. Primary 6 (Primary School 6)

#### **Junior Secondary School (3 classes)**
1. JSS 1 (Junior Secondary School 1)
2. JSS 2 (Junior Secondary School 2)
3. JSS 3 (Junior Secondary School 3)

#### **Senior Secondary School (3 classes)**
1. SS 1 (Senior Secondary School 1)
2. SS 2 (Senior Secondary School 2)
3. SS 3 (Senior Secondary School 3)

**Key Points:**
- Classes are pre-seeded in the database
- Admin should NOT manually create classes unless needed
- Each class has `SchoolLevel` property
- Each class has `ClassOrder` for sorting

---

### **Subjects Seeding (DataSeeder.cs)**

**Total Seeded Subjects:** 63 subjects

#### **Primary School Subjects (16 subjects)**
1. English Language (ENG)
2. Mathematics (MTH)
3. Basic Science (BSC)
4. Social Studies (SST)
5. Civil Education (CIV)
6. Computer Studies (CMP)
7. Home Economics (HEC)
8. Agricultural Science (AGR)
9. Physical and Health Education (PHE)
10. Creative Arts (CRT)
11. Christian Religious Studies (CRS)
12. Islamic Religious Studies (IRS)
13. French (FRN)
14. Yoruba (YOR)
15. Igbo (IGB)
16. Hausa (HAU)

#### **Junior Secondary School Subjects (18 subjects)**
1. English Language (ENG)
2. Mathematics (MTH)
3. Basic Science (BSC)
4. Basic Technology (BTE)
5. Social Studies (SST)
6. Civic Education (CIV)
7. Computer Studies (CMP)
8. Home Economics (HEC)
9. Agricultural Science (AGR)
10. Physical and Health Education (PHE)
11. Business Studies (BST)
12. Christian Religious Studies (CRS)
13. Islamic Religious Studies (IRS)
14. French (FRN)
15. Yoruba (YOR)
16. Igbo (IGB)
17. Hausa (HAU)
18. Cultural and Creative Arts (CCA)

#### **Senior Secondary School Subjects (26 subjects)**
1. English Language (ENG)
2. Mathematics (MTH)
3. Physics (PHY)
4. Chemistry (CHM)
5. Biology (BIO)
6. Economics (ECO)
7. Civic Education (CIV)
8. Computer Studies (CMP)
9. Agricultural Science (AGR)
10. Further Mathematics (FMT)
11. Geography (GEO)
12. Literature in English (LIT)
13. Christian Religious Studies (CRS)
14. Islamic Religious Studies (IRS)
15. French (FRN)
16. Yoruba (YOR)
17. Igbo (IGB)
18. Hausa (HAU)
19. Government (GOV)
20. History (HST)
21. Financial Accounting (ACC)
22. Book Keeping (BKP)
23. Commerce (COM)
24. Marketing (MKT)
25. Insurance (INS)
26. Data Processing (DTP)

**Key Points:**
- Subjects are organized by `SchoolLevel`
- Each subject has a `Code`
- Each subject has `SubjectOrder` for sorting
- **IMPORTANT:** Subjects are NOT pre-assigned to classes
- Admin must create Class-Subject assignments to link subjects to classes

---

### **Default Admin User**

**Email:** admin@school.com
**Password:** Admin@123
**Role:** Admin

---

## STEP 3: Admin Teacher Assignment Flow

### **The Assignment Process**

**What Admin Does:**
1. Selects a Teacher (from list of users with Teacher role)
2. Selects a Class (from seeded classes)
3. Selects a Term (active term)
4. Selects one OR multiple Subjects (that belong to the selected class's school level)
5. Submits assignment via `/api/ClassSubjects`

**Backend Validation:**
- Class must exist
- Subject must exist
- Term must exist
- Teacher must exist (optional - can assign subject to class without teacher)

**Multiple Subject Assignment:**
- Backend accepts ONE ClassSubject per POST request
- To assign multiple subjects to same teacher/class:
  - Send multiple POST requests OR
  - Frontend needs to loop through selected subjects

---

## STEP 4: Data Relationships

### **Class → Subject Relationship**

```
Class (Primary 1)
  ├─ SchoolLevel: Primary (0)
  ├─ Subjects Available: All subjects with SchoolLevel = Primary
  └─ Valid Subjects: English, Mathematics, Basic Science, etc.

Class (JSS 1)
  ├─ SchoolLevel: JuniorSecondary (1)
  ├─ Subjects Available: All subjects with SchoolLevel = JuniorSecondary
  └─ Valid Subjects: English, Mathematics, Basic Science, Basic Technology, etc.

Class (SS 1)
  ├─ SchoolLevel: SeniorSecondary (2)
  ├─ Subjects Available: All subjects with SchoolLevel = SeniorSecondary
  └─ Valid Subjects: English, Mathematics, Physics, Chemistry, Biology, etc.
```

**CRITICAL:** When Admin selects a Class, the Subject dropdown must ONLY show subjects that have the SAME `SchoolLevel` as that class.

---

## Frontend Implementation Requirements

### **1. Get Classes for Dropdown**
```
GET /api/Classes
Response: Array of ClassDto
```

### **2. Get Subjects Filtered by Class SchoolLevel**
```
GET /api/Subjects
Response: Array of SubjectDto
Frontend Filter: Filter by subject.SchoolLevel === selectedClass.SchoolLevel
```

### **3. Get Teachers**
```
GET /api/Users?pageNumber=1&pageSize=100
Filter: users with Role = "Teacher"
```

### **4. Get Active Term**
```
GET /api/Terms/active
Response: TermDto
```

### **5. Create Class-Subject Assignment**
```
POST /api/ClassSubjects
Body: {
  classId: "guid",
  subjectId: "guid",
  termId: "guid",
  teacherId: "guid"  // optional
}
```

### **6. Get Existing Assignments**
```
GET /api/ClassSubjects/class/{classId}
Response: PagedResponse<ClassSubjectDto>
Shows which teachers are assigned to which subjects in a class
```

---

## Admin Frontend Pages to Update

### **Must Update:**
1. **AdminDashboard** - Remove mock data, show real stats
2. **UserList** - Filter to show only Teachers
3. **Create Assignment Page** (NEW) - Assign Teacher → Class → Subject(s)

### **Can Keep (with API integration):**
- ClassList - Already updated for Teacher side
- SubjectList - Needs to show SchoolLevel filtering
- StudentList - Already updated
- TermList - Already exists

### **Should Remove (if no backend):**
- Fee collection (no backend endpoint found)
- Attendance (no backend endpoint found)
- Schedule/Timetable (no backend endpoint found)
- Events (no backend endpoint found)

---

## Authorization Rules

| Feature | Admin | Teacher | Student | Parent |
|---------|-------|---------|---------|--------|
| Create Class-Subject Assignment | ✅ | ✅ | ❌ | ❌ |
| Update Assignment | ✅ | ✅ | ❌ | ❌ |
| Delete Assignment | ✅ | ✅ | ❌ | ❌ |
| View All Assignments | ✅ | Own only | ❌ | ❌ |
| Create User (Teacher) | ✅ | ❌ | ❌ | ❌ |
| Update User | ✅ | ❌ | Own only | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ |

---

## Summary

**Admin capabilities:**
1. ✅ Create/Manage Teachers (Users)
2. ✅ Create Class-Subject-Teacher assignments
3. ✅ View seeded classes (12 classes)
4. ✅ View seeded subjects (63 subjects)
5. ✅ Filter subjects by class school level
6. ✅ Assign multiple subjects to teachers

**Key constraints:**
- Classes are seeded (don't create unless needed)
- Subjects are seeded (don't create unless needed)
- Subjects MUST match class SchoolLevel
- Each ClassSubject assignment includes: Class, Subject, Term, optional Teacher

**Next:** Convert Admin frontend to use these real endpoints.
