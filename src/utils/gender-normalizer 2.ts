/**
 * Normalizes gender values to standardized format
 * Converts variations like "man", "woman" to "male", "female"
 */
export function normalizeGender(gender: string | null | undefined): string | null {
  if (!gender || typeof gender !== 'string') {
    return null;
  }

  const normalized = gender.toLowerCase().trim();

  // Map common variations to standard values
  const genderMap: Record<string, string> = {
    // Male variations
    'man': 'male',
    'male': 'male',
    'm': 'male',
    'boy': 'male',
    'gentleman': 'male',
    'men': 'male',
    
    // Female variations
    'woman': 'female',
    'female': 'female',
    'f': 'female',
    'girl': 'female',
    'lady': 'female',
    'women': 'female',
    
    // Other common variations
    'other': 'other',
    'non-binary': 'other',
    'prefer not to say': 'other',
    'unknown': 'other',
    'not specified': 'other',
    'decline to state': 'other',
    'unspecified': 'other',
  };

  return genderMap[normalized] || null;
}

/**
 * Validates if a gender value is one of the accepted standard values
 */
export function isValidGender(gender: string | null | undefined): boolean {
  if (!gender) return true; // null/undefined is valid (optional field)
  
  const validGenders = ['male', 'female', 'other'];
  return validGenders.includes(gender.toLowerCase());
}

/**
 * Gets all valid gender options for dropdowns/selects
 */
export function getGenderOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];
}
