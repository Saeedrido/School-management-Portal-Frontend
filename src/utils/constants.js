// School Level Enum mapping
// Backend uses: Primary = 1, JuniorSecondary = 2, SeniorSecondary = 3
// BUT backend serializes as STRING due to JsonStringEnumConverter!
export const SCHOOL_LEVELS = {
  Primary: 1,
  JuniorSecondary: 2,
  SeniorSecondary: 3,
};

export const SCHOOL_LEVEL_LABELS = {
  1: 'Primary',
  2: 'Junior Secondary',
  3: 'Senior Secondary',
  'Primary': 'Primary',
  'JuniorSecondary': 'Junior Secondary',
  'SeniorSecondary': 'Senior Secondary',
};

export const getSchoolLevelValue = (label) => {
  return SCHOOL_LEVELS[label] || 1;
};

export const getSchoolLevelLabel = (value) => {
  // Handle both numeric (1, 2, 3) and string ('Primary', 'JuniorSecondary', 'SeniorSecondary')
  if (typeof value === 'number') {
    return SCHOOL_LEVEL_LABELS[value] || 'Primary';
  }
  // If it's already a string label, return formatted version
  return SCHOOL_LEVEL_LABELS[value] || value || 'Primary';
};

export const getSchoolLevelKey = (value) => {
  // Convert to numeric value (1, 2, or 3) regardless of input format
  if (typeof value === 'number') return value;
  return SCHOOL_LEVELS[value] || 1;
};

export const SCHOOL_LEVEL_OPTIONS = [
  { value: 1, label: 'Primary' },
  { value: 2, label: 'Junior Secondary' },
  { value: 3, label: 'Senior Secondary' },
];
