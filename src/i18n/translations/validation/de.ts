import en from './en'

const de = {
  required: 'Dieses Feld ist erforderlich',
  email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
  url: 'Bitte geben Sie eine gültige URL ein',
  number: 'Bitte geben Sie eine gültige Zahl ein',
  integer: 'Bitte geben Sie eine gültige Ganzzahl ein',
  min: 'Der Wert muss mindestens {{min}} betragen',
  max: 'Der Wert darf höchstens {{max}} betragen',
  minLength: 'Muss mindestens {{min}} Zeichen lang sein',
  maxLength: 'Darf höchstens {{max}} Zeichen lang sein',
  pattern: 'Ungültiges Format',
  unique: 'Dieser Wert existiert bereits',
  confirmed: 'Werte stimmen nicht überein',

  // Ergänzende fehlende Schlüssel
  emailRequired: 'E-Mail ist erforderlich',
  emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
  passwordMinLength: 'Passwort muss mindestens {{min}} Zeichen lang sein',
  passwordMismatch: 'Passwörter stimmen nicht überein',
  usernameMinLengthError: 'Benutzername muss mindestens {{min}} Zeichen lang sein (aktuell {{current}})',
} as const satisfies Record<keyof typeof en, string>

export default de