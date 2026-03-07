import React, { createContext, useContext, useState } from 'react';

// Create the Mock Data Context
const MockDataContext = createContext();

// Mock Classes Data
export const mockClasses = [
  { id: 1, name: 'JSS 1A', students: 32 },
  { id: 2, name: 'JSS 1B', students: 28 },
  { id: 3, name: 'JSS 2A', students: 30 },
  { id: 4, name: 'JSS 2B', students: 25 },
  { id: 5, name: 'SS 1A', students: 22 },
  { id: 6, name: 'SS 1B', students: 20 },
  { id: 7, name: 'SS 2A', students: 18 },
  { id: 8, name: 'SS 2B', students: 25 },
  { id: 9, name: 'JSS 3A', students: 35 },
  { id: 10, name: 'SS 3A', students: 15 },
];

// Initial Mock Students Data
const initialStudents = [
  {
    id: 1,
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '2009-05-15',
    gender: 'Female',
    address: '123 Main Street, Lagos',
    phoneNumber: '+234 801 234 5678',
    parentName: 'John Smith',
    parentPhone: '+234 802 345 6789',
    parentEmail: 'john.smith@example.com',
    classId: '1',
    className: 'JSS 1A',
    studentId: 'STU2024001',
    enrollmentDate: '2024-01-10',
    photo: null,
  },
  {
    id: 2,
    firstName: 'Michael',
    lastName: 'Johnson',
    dateOfBirth: '2008-08-22',
    gender: 'Male',
    address: '456 Oak Avenue, Abuja',
    phoneNumber: '+234 803 456 7890',
    parentName: 'Sarah Johnson',
    parentPhone: '+234 804 567 8901',
    parentEmail: 'sarah.johnson@example.com',
    classId: '2',
    className: 'JSS 2B',
    studentId: 'STU2024002',
    enrollmentDate: '2024-01-12',
    photo: null,
  },
  {
    id: 3,
    firstName: 'Emeka',
    lastName: 'Okafor',
    dateOfBirth: '2007-03-10',
    gender: 'Male',
    address: '789 Palm Road, Port Harcourt',
    phoneNumber: '+234 805 678 9012',
    parentName: 'Chief Okafor',
    parentPhone: '+234 806 789 0123',
    parentEmail: 'okafor.chief@example.com',
    classId: '5',
    className: 'SS 1A',
    studentId: 'STU2024003',
    enrollmentDate: '2024-01-15',
    photo: null,
  },
  {
    id: 4,
    firstName: 'Fatima',
    lastName: 'Yussuf',
    dateOfBirth: '2009-11-28',
    gender: 'Female',
    address: '321 Peace Street, Kano',
    phoneNumber: '+234 807 890 1234',
    parentName: 'Alhaji Yussuf',
    parentPhone: '+234 808 901 2345',
    parentEmail: 'yussuf.alhaji@example.com',
    classId: '3',
    className: 'JSS 2A',
    studentId: 'STU2024004',
    enrollmentDate: '2024-02-01',
    photo: null,
  },
  {
    id: 5,
    firstName: 'Ibrahim',
    lastName: 'Mohammed',
    dateOfBirth: '2007-07-08',
    gender: 'Male',
    address: '654 Market Road, Kaduna',
    phoneNumber: '+234 809 012 3456',
    parentName: 'Mohammed Mohammed',
    parentPhone: '+234 810 123 4567',
    parentEmail: 'mohammed.family@example.com',
    classId: '6',
    className: 'SS 1B',
    studentId: 'STU2024005',
    enrollmentDate: '2024-02-05',
    photo: null,
  },
];

// Mock Subjects Data
export const mockSubjects = [
  { id: 1, name: 'Mathematics', code: 'MATH' },
  { id: 2, name: 'English', code: 'ENG' },
  { id: 3, name: 'Physics', code: 'PHY' },
  { id: 4, name: 'Chemistry', code: 'CHEM' },
  { id: 5, name: 'Biology', code: 'BIO' },
  { id: 6, name: 'Economics', code: 'ECON' },
  { id: 7, name: 'Geography', code: 'GEO' },
  { id: 8, name: 'History', code: 'HIST' },
];

// Mock Teacher Assignments - which teacher teaches which subject in which class
export const mockTeacherAssignments = [
  // Teacher ID 1 teaches Math in JSS 1A, JSS 2A and Physics in SS 1A
  { teacherId: '1', classId: 1, className: 'JSS 1A', subjectId: 1, subjectName: 'Mathematics' },
  { teacherId: '1', classId: 3, className: 'JSS 2A', subjectId: 1, subjectName: 'Mathematics' },
  { teacherId: '1', classId: 5, className: 'SS 1A', subjectId: 3, subjectName: 'Physics' },
  // Add more assignments as needed
];

// Provider Component
export const MockDataProvider = ({ children }) => {
  const [students, setStudents] = useState(initialStudents);
  const [classes, setClasses] = useState(mockClasses);
  const [subjects] = useState(mockSubjects);

  // Generate a unique student ID
  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const count = students.length + 1;
    return `STU${year}${String(count).padStart(3, '0')}`;
  };

  // Add a new student
  const addStudent = (studentData) => {
    const newStudent = {
      id: students.length + 1,
      ...studentData,
      studentId: generateStudentId(),
      enrollmentDate: new Date().toISOString().split('T')[0],
      className: classes.find(c => c.id === parseInt(studentData.classId))?.name || 'N/A',
    };
    setStudents([...students, newStudent]);
    return newStudent;
  };

  // Update an existing student
  const updateStudent = (id, studentData) => {
    const updatedStudents = students.map(student =>
      student.id === parseInt(id)
        ? {
            ...student,
            ...studentData,
            className: classes.find(c => c.id === parseInt(studentData.classId))?.name || student.className,
          }
        : student
    );
    setStudents(updatedStudents);
  };

  // Delete a student
  const deleteStudent = (id) => {
    setStudents(students.filter(student => student.id !== parseInt(id)));
  };

  // Get student by ID
  const getStudentById = (id) => {
    return students.find(student => student.id === parseInt(id));
  };

  // Get all students
  const getAllStudents = () => {
    return students;
  };

  // Get students by class
  const getStudentsByClass = (classId) => {
    return students.filter(student => student.classId === String(classId));
  };

  // Add a new class
  const addClass = (classData) => {
    const newClass = {
      id: classes.length + 1,
      ...classData,
      students: classData.students || 0,
    };
    setClasses([...classes, newClass]);
    return newClass;
  };

  // Delete a class
  const deleteClass = (classId) => {
    setClasses(classes.filter(c => c.id !== parseInt(classId)));
  };

  // Get teacher assignments (for filtering classes/subjects by teacher)
  const getTeacherAssignments = (teacherId) => {
    return mockTeacherAssignments.filter(a => a.teacherId === teacherId);
  };

  // Get classes assigned to a teacher
  const getTeacherClasses = (teacherId) => {
    const assignments = getTeacherAssignments(teacherId);
    const classIds = [...new Set(assignments.map(a => a.classId))];
    return mockClasses.filter(c => classIds.includes(c.id));
  };

  // Get subjects taught by a teacher
  const getTeacherSubjects = (teacherId) => {
    const assignments = getTeacherAssignments(teacherId);
    const subjectIds = [...new Set(assignments.map(a => a.subjectId))];
    return mockSubjects.filter(s => subjectIds.includes(s.id));
  };

  const value = {
    students,
    classes,
    subjects: mockSubjects,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    getAllStudents,
    getStudentsByClass,
    addClass,
    deleteClass,
    getTeacherAssignments,
    getTeacherClasses,
    getTeacherSubjects,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
};

// Custom hook to use the Mock Data Context
export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
};

export default MockDataContext;
