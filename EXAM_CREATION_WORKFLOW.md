# Exam Creation - Complete Behavior Specification

## 📋 Overview

This document describes the complete behavior for exam creation, ensuring Admin and Teacher roles work correctly with Class-Subject assignments.

---

## 🎯 Business Rules

### 1. Class-Subject Assignment Model

- **Subjects are pre-seeded** in the database (Primary, JSS, SS subjects)
- **Classes are created manually** by Admin
- **Admin assigns subjects + teachers to classes** via Teacher Assignment page
- This creates `ClassSubject` records with optional `TeacherId`

### 2. Exam Creation Rules

#### **Admin Creating Exam:**
- ✅ Can see ALL classes in dropdown
- ✅ When selecting a class → shows ONLY subjects assigned via Teacher Assignment page
- ✅ If class has no assigned subjects → dropdown shows "No subjects available for this class"
- ❌ Cannot create exam if subject not assigned to class

#### **Teacher Creating Exam:**
- ✅ Can see ONLY classes they're assigned to
- ✅ When selecting a class → shows ONLY subjects they're assigned to teach
- ❌ Cannot create exam for class/subject they're not assigned to

---

## 🔧 Implementation Details

### **Frontend: ExamForm.js**

#### **Class Selection:**
```javascript
// Admin: Fetch all classes
adminAPI.classes.getAll()

// Teacher: Fetch only their assigned classes
teacherAPI.myAssignments.getAll()
```

#### **Subject Selection (when class changes):**
```javascript
// Admin: Fetch ClassSubject assignments for this class
adminAPI.classSubjects.getByClass(classId, 1, 100)
// Returns ONLY subjects assigned via Teacher Assignment page

// Teacher: Fetch their assignments, filter by class
teacherAPI.myAssignments.getAll()
  .filter(a => a.classId === classId)
```

#### **Subject Dropdown Display:**
```javascript
classSubjects.length > 0 ? (
  // Show assigned subjects
  classSubjects.map((cs) => (
    <MenuItem value={cs.id}>
      {cs.subject?.name} ({cs.subject?.code})
    </MenuItem>
  ))
) : (
  // No subjects assigned
  <MenuItem>No subjects available for this class</MenuItem>
)
```

---

### **Backend: ExamService.cs**

#### **CreateExamAsync Validation:**

1. **Fetch ClassSubject entity:**
```csharp
var classSubject = await _unitOfWork.GetClassSubjectWithDetailsAsync(request.ClassSubjectId);
if (classSubject == null) {
    return ErrorResponse("Invalid class-subject assignment");
}
```

2. **Validate ClassSubject belongs to specified Class:**
```csharp
if (classSubject.ClassId != request.ClassId) {
    return ErrorResponse(
        "The selected subject does not belong to the selected class. " +
        "Please select a subject that is assigned to this class.");
}
```

3. **Authorization Check (Teachers only):**
```csharp
if (userRole.Equals("Teacher", StringComparison.OrdinalIgnoreCase))
{
    // Check if teacher has TeacherSubjectAssignment for this Class + Subject
    var assignments = await _unitOfWork.TeacherSubjectAssignments.FindAsync(tsa =>
        tsa.TeacherId == userId &&
        tsa.SubjectId == classSubject.SubjectId &&
        tsa.ClassId == request.ClassId &&
        tsa.IsActive == true);

    if (!assignments.Any()) {
        return ErrorResponse(
            "You are not authorized to create an exam for this class and subject combination. " +
            "You can only create exams for classes and subjects you are assigned to.");
    }
}
```

---

## 🧪 Testing Scenarios

### **Scenario 1: Admin creates exam for class with assigned subjects**
1. Admin selects Class → shows assigned subjects ✅
2. Admin selects subject → creates exam ✅

### **Scenario 2: Admin tries to create exam for class with NO assigned subjects**
1. Admin selects Class → dropdown shows "No subjects available" ✅
2. Cannot select any subject ❌

### **Scenario 3: Teacher creates exam for assigned class/subject**
1. Teacher selects Class → shows their assigned subjects ✅
2. Teacher selects subject → creates exam ✅

### **Scenario 4: Teacher tries to create exam for class they're NOT assigned to**
1. Class not in dropdown ✅
2. Cannot create exam ❌

### **Scenario 5: API bypass attempt (Postman)**
**Admin tries:**
- Class A + Subject from Class B → Error: "subject does not belong to class" ✅
- Non-existent ClassSubject → Error: "Invalid class-subject assignment" ✅

**Teacher tries:**
- Class/Subject they're not assigned to → Error: "not authorized to create exam" ✅

---

## 📊 Data Model

### **ClassSubject Table:**
```csharp
public class ClassSubject {
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }     // Link to Class
    public Guid SubjectId { get; set; }   // Link to Subject
    public Guid TermId { get; set; }      // Link to Term
    public Guid? TeacherId { get; set; }  // Assigned teacher (optional)
    ...
}
```

### **TeacherSubjectAssignment Table:**
```csharp
public class TeacherSubjectAssignment {
    public Guid Id { get; set; }
    public Guid TeacherId { get; set; }   // Teacher who teaches
    public Guid ClassId { get; set; }     // Which class
    public Guid SubjectId { get; set; }   // Which subject
    public bool IsActive { get; set; }    // Is assignment active
    ...
}
```

---

## 🔄 Complete Workflow

### **Step 1: Admin assigns subjects to class**
1. Go to `/dashboard/teacher-assignments`
2. Select a Class (e.g., "JSS 1")
3. Select Subjects (e.g., "Mathematics", "English")
4. Select a Teacher (optional)
5. Click "Create Assignment(s)"
6. → Creates `ClassSubject` record(s) with optional `TeacherId`

### **Step 2: Create exam**
**Admin:**
1. Go to `/dashboard/exams/new`
2. Select Class → shows ONLY assigned subjects ✅
3. Select Subject
4. Fill exam details
5. Create exam ✅

**Teacher:**
1. Go to `/dashboard/exams/new`
2. Select Class → shows ONLY their assigned subjects ✅
3. Select Subject
4. Fill exam details
5. Create exam ✅

---

## ✅ Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend: Admin class dropdown | ✅ Complete | Shows all classes |
| Frontend: Admin subject dropdown | ✅ Complete | Shows only assigned subjects |
| Frontend: Teacher class dropdown | ✅ Complete | Shows only assigned classes |
| Frontend: Teacher subject dropdown | ✅ Complete | Shows only their assigned subjects |
| Backend: Class-subject validation | ✅ Complete | Validates ClassSubject belongs to Class |
| Backend: Teacher authorization | ✅ Complete | Validates TeacherSubjectAssignment exists |
| DataSeeder: ClassSubject seeding | ✅ Removed | No longer creates automatic assignments |

---

## 🚀 Getting Started

### **1. Clear old data (if DataSeeder created ClassSubjects):**
```sql
DELETE FROM "TeacherSubjectAssignments";
DELETE FROM "ClassSubjects";
```

### **2. Restart backend server**

### **3. Assign subjects to classes:**
- Use Teacher Assignment page
- Select Class → Subjects → Teacher
- Create assignments

### **4. Create exams:**
- Admin and Teacher can now create exams following the rules above

---

## 📝 Important Notes

1. **Admin does NOT automatically see all subjects** - only subjects assigned via Teacher Assignment page
2. **Teacher does NOT automatically see all subjects** - only subjects they're assigned to teach
3. **ClassSubject must exist** before exam can be created (created via Teacher Assignment)
4. **Backend validates everything** - frontend filters are for UX only, security is server-side
