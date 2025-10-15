import en from './en'

const de = {
  newConversation: 'Neues Gespräch',
  deleteConversation: 'Gespräch löschen',
  clearHistory: 'Verlauf löschen',
  sendMessage: 'Nachricht senden',
  regenerate: 'Regenerieren',
  copy: 'Kopieren',
  copySuccess: 'In Zwischenablage kopiert',
  typing: 'Tippt...',
  thinking: 'Denkt nach...',
  messagePlaceholder: 'Nachricht eingeben...',
  attachFile: 'Datei anhängen',
  referenceNote: 'Notiz referenzieren',
  history: 'Verlauf',
  noHistory: 'Kein Gesprächsverlauf',
  webSearch: 'Web-Suche',
  // Fehlermeldungen
  sendFailed: 'Senden der Nachricht fehlgeschlagen',
  networkError: 'Netzwerkfehler, bitte überprüfen Sie Ihre Verbindung',
  serverError: 'Serverfehler, bitte versuchen Sie es später erneut',
  quotaExceeded: 'Kontingent überschritten',
  // Erfolgsmeldungen
  conversationDeleted: 'Gespräch gelöscht',
  conversationRenamed: 'Gespräch umbenannt',
  historyCleared: 'Verlauf gelöscht',
  messageDeleted: 'Nachricht gelöscht',
  renameFailed: 'Umbenennung fehlgeschlagen, bitte versuchen Sie es erneut',
  deleteFailed: 'Löschen fehlgeschlagen, bitte versuchen Sie es erneut',
  // Benutzeroberfläche und Dialoge
  renameConversationTitle: 'Gespräch umbenennen',
  deleteConfirmTitle: 'Löschbestätigung',
  deleteConfirmDescription: 'Diese Aktion kann nicht rückgängig gemacht werden. Sind Sie sicher, dass Sie dieses Gespräch löschen möchten?',
  deleteConfirmWithTitle: 'Sind Sie sicher, dass Sie das Gespräch "{{title}}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
  titleLabel: 'Titel',
  newTitlePlaceholder: 'Neuen Gesprächstitel eingeben',
  // Fehlergrenze
  chatErrorTitle: 'Chat hat ein Problem festgestellt',
  chatErrorDescription: 'Entschuldigung, die Chat-Komponente hat einen Fehler festgestellt. Sie können die folgenden Aktionen versuchen, um zu wiederherstellen.',
  reloadChat: 'Chat neu laden',
  backToChatList: 'Zurück zur Chat-Liste',
  chatSeoDescription: 'Chat mit dem KI-Assistenten',

  // Ergänzende fehlende Schlüssel
  voiceTranscriptionFailed: 'Sprachtranskription fehlgeschlagen',
  voiceTranscriptionError: 'Sprachtranskription fehlgeschlagen, bitte versuchen Sie es erneut',
  conversation: 'Gespräch',
  askAnything: 'Fragen Sie alles',
  speak: 'Sprechen',
  search: 'Suchen',
  tasks: 'Aufgaben',
  companions: 'Assistenten',
  conversations: 'Gespräche',
  // Suchergebnis-bezogen
  searchResults: 'Suchergebnisse',
  searchResultsCount: '{{count}} Ergebnisse',
  noSearchResults: 'Keine Suchergebnisse',
  tryOtherKeywords: 'Bitte versuchen Sie andere Suchbegriffe',
  searchFailed: 'Suche fehlgeschlagen',
  searching: 'Suchen',
  searched: 'Gesucht',
  networkConnectionError: 'Netzwerkverbindungsfehler',
  searchingDots: 'Suchen...',
  cannotOpenLink: 'Kann diesen Link nicht öffnen',
  openLinkError: 'Beim Öffnen des Links ist ein Fehler aufgetreten',
  // Empty states
  emptyNewConversation: 'Neue Unterhaltung starten',
  noMessages: 'Noch keine Nachrichten',
} as const satisfies Record<keyof typeof en, string>

export default de