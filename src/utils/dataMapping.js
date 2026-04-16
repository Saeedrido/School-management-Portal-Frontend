/**
 * Data Mapping Utilities
 * Maps frontend data structures to backend DTOs
 */

// Gender Enum Mapping
// NOTE: backend expects 1 = Male, 2 = Female (no zero value allowed).
export const GENDER_ENUM = {
  Male: 1,
  Female: 2,
};

export const genderToEnum = (gender) => {
  // backend expects 1 = Male, 2 = Female.  Never return 0, and
  // allow callers to pass either the label or the numeric value.

  // if a numeric value is provided (string or number), validate it first
  const num = parseInt(gender, 10);
  if (!isNaN(num) && Object.values(GENDER_ENUM).includes(num)) {
    return num; // already correct enum value
  }

  // empty / falsy values should not be translated to 0
  if (!gender) return null;

  // try exact key lookup, then case-insensitive match
  if (GENDER_ENUM[gender] !== undefined) return GENDER_ENUM[gender];
  const found = Object.keys(GENDER_ENUM).find(
    g => g.toLowerCase() === String(gender).toLowerCase()
  );
  return found ? GENDER_ENUM[found] : null;
};

export const enumToGender = (enumValue) => {
  // If it's already a string (like "Male" or "Female"), return it as-is
  if (typeof enumValue === 'string' && (enumValue === 'Male' || enumValue === 'Female')) {
    return enumValue;
  }
  // Handle string numeric values ("1" or "2")
  if (typeof enumValue === 'string') {
    const num = parseInt(enumValue, 10);
    if (!isNaN(num) && (num === 1 || num === 2)) {
      return num === 1 ? 'Male' : 'Female';
    }
  }
  // Handle numeric values (1 or 2)
  if (enumValue === 1 || enumValue === 2) {
    return enumValue === 1 ? 'Male' : 'Female';
  }
  // convert numeric enum back into string label; default to empty string if nothing matches
  const key = Object.keys(GENDER_ENUM).find(key => GENDER_ENUM[key] === enumValue);
  return key || '';
};

// Role Type Enum Mapping
export const ROLE_TYPE_ENUM = {
  Admin: 1,
  Teacher: 2,
  Student: 3,
  Parent: 4,
};

export const roleToEnum = (role) => {
  return ROLE_TYPE_ENUM[role] ?? 3;
};

export const enumToRole = (enumValue) => {
  return Object.keys(ROLE_TYPE_ENUM).find(key => ROLE_TYPE_ENUM[key] === enumValue) || 'Student';
};

// Exam Type Enum Mapping (must match backend ExamType enum)
export const EXAM_TYPE_ENUM = {
  ObjectiveOnly: 1,
  ObjectiveAndTheory: 2,
  ObjectiveAndTest: 3,
  ObjectiveTheoryAndTest: 4,
};

export const examTypeToEnum = (type) => {
  return EXAM_TYPE_ENUM[type] ?? 1; // Default to ObjectiveOnly (1)
};

export const enumToExamType = (enumValue) => {
  return Object.keys(EXAM_TYPE_ENUM).find(key => EXAM_TYPE_ENUM[key] === enumValue) || 'ObjectiveOnly';
};

// Get exam type configuration based on selected type
export const getExamTypeConfig = (examTypeValue) => {
  const config = {
    ObjectiveOnly: { hasObjective: true, hasTheory: false, hasTest: false, objectiveMax: 100, theoryMax: 0, testMax: 0, scoringDescription: 'Objective = 100 marks' },
    ObjectiveAndTheory: { hasObjective: true, hasTheory: true, hasTest: false, objectiveMax: 50, theoryMax: 50, testMax: 0, scoringDescription: 'Objective + Theory = 100 marks (flexible)' },
    ObjectiveAndTest: { hasObjective: true, hasTheory: false, hasTest: true, objectiveMax: 50, theoryMax: 0, testMax: 50, scoringDescription: 'Objective + Test = 100 marks (flexible)' },
    ObjectiveTheoryAndTest: { hasObjective: true, hasTheory: true, hasTest: true, objectiveMax: 30, theoryMax: 30, testMax: 40, scoringDescription: 'Objective + Theory = 60, Test = 40 marks' },
  };
  return config[examTypeValue] || config.ObjectiveOnly;
};

// Validate score based on exam type
export const validateScore = (examTypeValue, objectiveScore, theoryScore, testScore) => {
  const config = getExamTypeConfig(examTypeValue);
  const errors = [];
  
  if (config.hasObjective && (objectiveScore === null || objectiveScore === undefined || objectiveScore < 0)) {
    errors.push('Objective score is required');
  }
  if (config.hasObjective && objectiveScore > config.objectiveMax) {
    errors.push(`Objective score cannot exceed ${config.objectiveMax}`);
  }
  
  if (config.hasTheory && theoryScore !== null && theoryScore > config.theoryMax) {
    errors.push(`Theory score cannot exceed ${config.theoryMax}`);
  }
  
  if (config.hasTest && testScore !== null && testScore > config.testMax) {
    errors.push(`Test score cannot exceed ${config.testMax}`);
  }
  
  // Validate total based on exam type
  if (examTypeValue === 'ObjectiveOnly') {
    if (objectiveScore > 100) {
      errors.push('Objective score cannot exceed 100');
    }
  } else if (examTypeValue === 'ObjectiveAndTheory') {
    if ((objectiveScore || 0) + (theoryScore || 0) > 100) {
      errors.push('Objective + Theory cannot exceed 100');
    }
  } else if (examTypeValue === 'ObjectiveAndTest') {
    if ((objectiveScore || 0) + (testScore || 0) > 100) {
      errors.push('Objective + Test cannot exceed 100');
    }
  } else if (examTypeValue === 'ObjectiveTheoryAndTest') {
    if ((objectiveScore || 0) + (theoryScore || 0) > 60) {
      errors.push('Objective + Theory cannot exceed 60');
    }
    if ((testScore || 0) > 40) {
      errors.push('Test score cannot exceed 40');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Student Form Data Mapping

// Map to RegisterStudentDto - used with POST /api/students/register
export const mapStudentFormToRegisterStudentDto = (formData) => {
  const genderEnum = genderToEnum(formData.gender);

  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email || null,  // For sending login credentials
    gender: genderEnum,
    dateOfBirth: formData.dateOfBirth,
    phoneNumber: formData.phoneNumber || '',
    address: formData.address || '',
    city: formData.city || '',
    state: formData.state || '',
    country: formData.country || 'Nigeria',
    bloodGroup: formData.bloodGroup || '',
    genotype: formData.genotype || '',
    allergies: formData.allergies || '',
    medicalConditions: formData.medicalConditions || '',
    emergencyContactName: formData.emergencyContactName || '',
    emergencyContactPhone: formData.emergencyContactPhone || '',
    emergencyContactRelationship: formData.emergencyContactRelationship || 'Parent',
    previousSchool: formData.previousSchool || '',
    classId: formData.classId ? formData.classId : null,
    academicYearId: formData.academicYearId,
    termId: formData.termId || null,
  };
};

export const mapStudentFormToRegisterDto = (formData, password) => {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.com`,
    password: password,
    phoneNumber: formData.phoneNumber || '',
    role: 3, // Student
  };
};

export const mapStudentFormToProfileDto = (formData, userId, admissionNumber) => {
  const currentYear = new Date().getFullYear();
  const genderEnum = genderToEnum(formData.gender);

  // only include gender when it's a valid enum value; avoid sending null/0
  const dto = {
    userId: userId,
    studentNumber: `STU${currentYear}${String(userId).padStart(4, '0')}`,
    admissionNumber: admissionNumber || `ADM${currentYear}${String(userId).padStart(4, '0')}`,
    admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
    dateOfBirth: formData.dateOfBirth,
    address: formData.address || '',
    city: formData.city || '',
    state: formData.state || '',
    country: formData.country || 'Nigeria',
    bloodGroup: formData.bloodGroup || '',
    genotype: formData.genotype || '',
    allergies: formData.allergies || '',
    medicalConditions: formData.medicalConditions || '',
    emergencyContactName: formData.emergencyContactName || formData.parentName || '',
    emergencyContactPhone: formData.emergencyContactPhone || formData.parentPhone || '',
    emergencyContactRelationship: formData.emergencyContactRelationship || 'Parent',
    previousSchool: formData.previousSchool || '',
  };

  if (genderEnum != null) {
    dto.gender = genderEnum;
  }

  return dto;
};

export const mapStudentFormToEnrollDto = (studentProfileId, classId, academicYearId, termId) => {
  // Backend expects all four as GUIDs/IDs - preserve as provided (strings)
  // termId is required for the StudentClass entity
  const dto = {
    studentProfileId: studentProfileId, // GUID string from backend
    classId: classId, // GUID string
    academicYearId: academicYearId, // GUID string
    termId: termId, // GUID string - required by StudentClass foreign key
  };

  return dto;
};

// Exam Form Data Mapping
export const mapExamFormToCreateDto = (formData, classSubjectId, termId) => {
  // Combine date and time into ISO string for ExamDate
  const examDate = formData.startDate && formData.startTime
    ? `${formData.startDate}T${formData.startTime}:00`
    : new Date().toISOString();

  // Convert duration to minutes
  let durationMinutes = parseInt(formData.duration) || 60;
  if (formData.durationUnit === 'hours') {
    durationMinutes = durationMinutes * 60;
  }

  return {
    title: formData.title,
    description: formData.description || '',
    classSubjectId: classSubjectId,
    termId: termId,
    classId: formData.classId, // GUID - send as string, don't parse
    examType: examTypeToEnum(formData.type),
    examDate: examDate,
    durationMinutes: durationMinutes,
    totalMarks: parseInt(formData.totalMarks) || 100,
    objectiveMark: parseInt(formData.objectiveMark) || 100,
    theoryMark: parseInt(formData.theoryMark) || 0,
    testMark: parseInt(formData.testMark) || 0,
    passingMark: parseInt(formData.passingMarks) || 40,
    instructions: formData.instructions || '',
    allowRetake: formData.allowRetake || false,
    maxAttempts: formData.maxAttempts || 1,
  };
};

// Generate Student Number Helper
export const generateStudentNumber = (userId) => {
  const currentYear = new Date().getFullYear();
  return `STU${currentYear}${String(userId).padStart(4, '0')}`;
};

// Generate Admission Number Helper
export const generateAdmissionNumber = (userId) => {
  const currentYear = new Date().getFullYear();
  return `ADM${currentYear}${String(userId).padStart(4, '0')}`;
};

// Validate required student fields
export const validateStudentForm = (formData) => {
  const errors = {};

  if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
  if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  if (!formData.gender || formData.gender === 0) errors.gender = 'Gender is required';
  if (!formData.address?.trim()) errors.address = 'Address is required';
  if (!formData.city?.trim()) errors.city = 'City is required';
  if (!formData.state?.trim()) errors.state = 'State is required';
  if (!formData.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
  if (!formData.emergencyContactName?.trim()) errors.emergencyContactName = 'Emergency contact name is required';
  if (!formData.emergencyContactPhone?.trim()) errors.emergencyContactPhone = 'Emergency contact phone is required';
  
  // Enrollment fields
  if (!formData.classId) errors.classId = 'Class is required';
  if (!formData.academicYearId) errors.academicYearId = 'Academic year is required';
  if (!formData.termId) errors.termId = 'Term is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate required exam fields
export const validateExamForm = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) errors.title = 'Exam title is required';
  if (!formData.classId) errors.classId = 'Class is required';
  if (!formData.classSubjectId) errors.classSubjectId = 'Subject is required';
  if (!formData.startDate) errors.startDate = 'Start date is required';
  if (!formData.startTime) errors.startTime = 'Start time is required';
  if (!formData.duration || formData.duration <= 0) errors.duration = 'Duration must be greater than 0';
  if (!formData.totalMarks || formData.totalMarks <= 0) errors.totalMarks = 'Total marks must be greater than 0';
  if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
    errors.passingMarks = 'Passing marks must be between 0 and total marks';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
