// TypeScript interfaces for form validation
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

// ASCII Password validation function matching Laravel backend
export const validateAsciiPassword = (password: string): string | null => {
  if (password.length < 12) {
    return 'Das Passwort muss mindestens 12 Zeichen lang sein';
  }
  if (password.length > 64) {
    return 'Das Passwort darf maximal 64 Zeichen lang sein';
  }
  if (!/^[A-Za-z0-9]+$/.test(password)) {
    return 'Das Passwort darf nur Buchstaben (A-Z, a-z) und Zahlen (0-9) enthalten';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Das Passwort muss mindestens einen Großbuchstaben enthalten';
  }
  if (!/[0-9]/.test(password)) {
    return 'Das Passwort muss mindestens eine Zahl enthalten';
  }
  return null;
};

// Complete form validation
export const validateRegisterForm = (data: RegisterFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Der Name ist erforderlich';
  } else if (data.name.length > 255) {
    errors.name = 'Der Name darf maximal 255 Zeichen haben';
  }

  // Email validation
  if (!data.email.trim()) {
    errors.email = 'Die E-Mail-Adresse ist erforderlich';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
  } else if (data.email.length > 255) {
    errors.email = 'Die E-Mail-Adresse darf maximal 255 Zeichen haben';
  }

  // Password validation
  const passwordError = validateAsciiPassword(data.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  // Password confirmation validation
  if (!data.password_confirmation.trim()) {
    errors.password_confirmation = 'Die Passwort-Bestätigung ist erforderlich';
  } else if (data.password !== data.password_confirmation) {
    errors.password_confirmation = 'Die Passwort-Bestätigung stimmt nicht überein';
  }

  return errors;
};
