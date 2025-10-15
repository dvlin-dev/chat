import en from './en'

const de = {
  // Titel und Menüs
  settings: 'Einstellungen',
  general: 'Allgemein',
  appearance: 'Erscheinungsbild',
  notifications: 'Benachrichtigungen',
  privacy: 'Datenschutz',
  security: 'Sicherheit',
  advanced: 'Erweitert',
  about: 'Über',
  version: 'Version',
  checkUpdate: 'Nach Updates suchen',
  reportBug: 'Fehler melden',
  feedback: 'Feedback',
  profile: 'Profil',
  preferences: 'Einstellungen',

  // Seitentitel und Beschreibungen
  profileDescription: 'Verwalten Sie Ihre persönlichen Informationen',
  securityDescription: 'Ändern Sie Ihr Passwort, um Ihr Konto zu sichern',
  preferencesDescription: 'Passen Sie Ihre Erfahrung an',
  verifyEmailTitle: 'E-Mail verifizieren',
  verifyEmailDescription: 'Geben Sie den an {email} gesendeten Bestätigungscode ein',

  // Profil
  username: 'Benutzername',
  email: 'E-Mail',
  emailCannotModify: 'E-Mail-Adresse kann nicht geändert werden',
  usernameSupports: 'Unterstützt Buchstaben, Zahlen, Unterstriche und Bindestriche',

  // Theme-Optionen
  theme: 'Theme',
  themeDescription: 'Wählen Sie Ihr bevorzugtes Interface-Theme',
  light: 'Hell',
  lightDescription: 'Helles Interface, geeignet für die Tagesnutzung',
  dark: 'Dunkel',
  darkDescription: 'Augenfreundliches dunkles Interface, geeignet für die Nachtnutzung',
  system: 'System folgen',
  systemDescription: 'Automatisches Umschalten, folgt den Systemeinstellungen',

  // Sprachoptionen
  language: 'Sprache',
  languageDescription: 'Interface-Anzeigesprache auswählen',
  english: 'Englisch',
  simplifiedChinese: 'Vereinfachtes Chinesisch',
  languageFeatureInDevelopment: 'Hinweis: Die Sprachumschaltfunktion ist in Entwicklung, erscheint bald',
  selectLanguage: 'Sprache auswählen',
  selectLanguageMessage: 'Wählen Sie Ihre bevorzugte Sprache',
  languageChangeNote: 'Die Interface-Sprache wird sofort nach der Auswahl geändert',

  // Sicherheitseinstellungen
  currentPassword: 'Aktuelles Passwort',
  newPassword: 'Neues Passwort',
  confirmPassword: 'Neues Passwort bestätigen',
  verificationCode: 'Bestätigungscode',
  sendVerificationCode: 'Bestätigungscode senden',
  sendCode: 'Code senden',
  resendCode: 'Erneut senden',
  resendTimer: 'Erneut senden ({seconds}s)',
  backToModify: 'Zurück zum Bearbeiten',
  confirmModify: 'Änderung bestätigen',
  enterNewEmail: 'Neue E-Mail eingeben',

  // Passwortstärke
  passwordStrengthWeak: 'Schwach',
  passwordStrengthMedium: 'Mittel',
  passwordStrengthStrong: 'Stark',
  passwordStrengthVeryStrong: 'Sehr stark',

  // Aktionsbuttons
  save: 'Speichern',
  saveChanges: 'Änderungen speichern',
  saving: 'Speichern...',
  applyChanges: 'Änderungen anwenden',
  loading: 'Laden...',

  // Passwortregeln und Hinweise
  passwordMinLength: 'Passwort muss mindestens {length} Zeichen lang sein',
  passwordStrengthTips: '• Passwortlänge mindestens 6 Zeichen\n• Empfohlen: Buchstaben, Zahlen und Sonderzeichen\n• Nächster Schritt sendet Bestätigungscode an Ihre E-Mail',
  verificationTips: '• Bestätigungscode ist 10 Minuten gültig\n• Falls Sie den Code nicht erhalten, prüfen Sie Ihren Spam-Ordner\n• Nach Passwort-Änderung müssen Sie sich erneut anmelden',

  // Benutzername-Validierung
  usernameMinLength: 'Benutzername muss mindestens {min} Zeichen lang sein (aktuell {current})',
  usernameOnlyAllowedChars: 'Benutzername kann nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten',
  usernamePlaceholder: 'Benutzername eingeben ({min}-{max} Zeichen)',

  // Passwort-Eingabehinweise
  enterCurrentPassword: 'Bitte geben Sie das aktuelle Passwort ein',
  enterNewPassword: 'Bitte geben Sie ein neues Passwort ein (mindestens 6 Zeichen)',
  confirmNewPassword: 'Bitte geben Sie das neue Passwort erneut ein',
  enterVerificationCode: 'Bitte geben Sie den 6-stelligen Bestätigungscode ein',

  // Erfolgs- und Fehlermeldungen
  profileUpdateSuccess: 'Profil erfolgreich aktualisiert',
  passwordChangeSuccess: 'Passwort erfolgreich geändert, bitte melden Sie sich erneut an',
  verificationCodeSent: 'Bestätigungscode an {email} gesendet',
  verificationCodeResent: 'Bestätigungscode erneut gesendet',

  // Fehlermeldungen sind in userTranslations und validationTranslations enthalten

  // Neue mobile Einstellungsoptionen
  changePassword: 'Passwort ändern',
  dataManagement: 'Datenverwaltung',

  // Ergänzende fehlende Schlüssel
  selectThemeMode: 'Theme-Modus auswählen',
  systemMode: 'System-Modus',
  lightMode: 'Hell-Modus',
  darkMode: 'Dunkel-Modus',
  databaseInfo: 'Datenbank-Info',
  storageType: 'Speichertyp',
  databaseSize: 'Datenbankgröße',
  bufferZone: 'Pufferzone',
  pendingWrites: '{{count}} ausstehende Schreibvorgänge',
  backToEdit: 'Zurück zum Bearbeiten',
  confirmChanges: 'Änderungen bestätigen',
  verificationCodeHints: '• Bestätigungscode ist 10 Minuten gültig\n• Falls Sie den Code nicht erhalten, prüfen Sie Ihren Spam-Ordner\n• Nach Passwort-Änderung müssen Sie sich erneut anmelden',
  passwordHints: '• Passwortlänge mindestens 6 Zeichen\n• Empfohlen: Buchstaben, Zahlen und Sonderzeichen\n• Nächster Schritt sendet Bestätigungscode an Ihre E-Mail',
  status: 'Status',
} as const satisfies Record<keyof typeof en, string>

export default de