// src/utils/exportErrorMessages.ts
export interface ExportErrorMessage {
  title: string;
  description: string;
  action: string;
}

export const EXPORT_ERROR_MESSAGES: Record<string, ExportErrorMessage> = {
  'NETWORK_ERROR': {
    title: 'Verbindungsfehler',
    description: 'Die Anwendung konnte keine Verbindung zum Server herstellen.',
    action: 'Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
  },
  'VALIDATION_ERROR': {
    title: 'Export-Konfiguration ungültig',
    description: 'Die von Ihnen gewählten Export-Einstellungen sind fehlerhaft.',
    action: 'Bitte überprüfen Sie die Felder im Export-Dialog und korrigieren Sie die Fehler.'
  },
  'PERMISSION_DENIED': {
    title: 'Zugriff verweigert',
    description: 'Sie haben nicht die erforderlichen Berechtigungen für diesen Export.',
    action: 'Bitte kontaktieren Sie Ihren Administrator, um die Berechtigungen zu überprüfen.'
  },
  'STORAGE_ERROR': {
    title: 'Speicherfehler',
    description: 'Es gab ein Problem beim Speichern der Exportdatei.',
    action: 'Bitte versuchen Sie es erneut. Wenn das Problem weiterhin besteht, kontaktieren Sie den Support.'
  },
  'TIMEOUT': {
    title: 'Export abgebrochen (Zeitüberschreitung)',
    description: 'Der Exportvorgang hat zu lange gedauert und wurde abgebrochen.',
    action: 'Dies kann bei sehr großen Datenmengen passieren. Versuchen Sie, weniger Daten zu exportieren oder kontaktieren Sie den Support.'
  },
  'MISSING_FIELDS': {
    title: 'Fehlende Daten',
    description: 'Es wurden keine Daten zum Exportieren gefunden.',
    action: 'Bitte überprüfen Sie Ihre Filtereinstellungen oder wählen Sie einen anderen Datentyp.'
  },
  'INVALID_FORMAT': {
    title: 'Ungültiges Format',
    description: 'Das gewählte Exportformat wird nicht unterstützt.',
    action: 'Bitte wählen Sie ein anderes Format (CSV, JSON oder PDF).'
  },
  'BATCH_FAILED': {
    title: 'Verarbeitungsfehler',
    description: 'Bei der Verarbeitung der Daten ist ein Fehler aufgetreten.',
    action: 'Bitte versuchen Sie es mit einer kleineren Datenmenge oder kontaktieren Sie den Support.'
  },
  'CONVERSION_FAILED': {
    title: 'Konvertierungsfehler',
    description: 'Die Daten konnten nicht in das gewünschte Format konvertiert werden.',
    action: 'Bitte versuchen Sie ein anderes Format oder kontaktieren Sie den Support.'
  },
  'UPLOAD_FAILED': {
    title: 'Upload fehlgeschlagen',
    description: 'Die Exportdatei konnte nicht gespeichert werden.',
    action: 'Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
  },
  'SIZE_EXCEEDED': {
    title: 'Dateigröße überschritten',
    description: 'Die Exportdatei ist zu groß.',
    action: 'Bitte versuchen Sie, weniger Daten zu exportieren oder wählen Sie ein kompakteres Format.'
  },
  'DATABASE_ERROR': {
    title: 'Datenbankfehler',
    description: 'Es gab ein Problem beim Zugriff auf die Datenbank.',
    action: 'Bitte versuchen Sie es später erneut. Wenn das Problem weiterhin besteht, kontaktieren Sie den Support.'
  },
  'UNKNOWN_ERROR': {
    title: 'Unbekannter Fehler',
    description: 'Ein unerwarteter Fehler ist aufgetreten.',
    action: 'Bitte versuchen Sie es später erneut. Wenn das Problem weiterhin besteht, kontaktieren Sie den Support.'
  }
};

export function getExportErrorMessage(errorCode: string): ExportErrorMessage {
  // Try to match the exact error code first
  if (EXPORT_ERROR_MESSAGES[errorCode]) {
    return EXPORT_ERROR_MESSAGES[errorCode];
  }
  
  // If no exact match, try to find a partial match
  for (const code in EXPORT_ERROR_MESSAGES) {
    if (errorCode.includes(code)) {
      return EXPORT_ERROR_MESSAGES[code];
    }
  }
  
  // Default to unknown error
  return EXPORT_ERROR_MESSAGES['UNKNOWN_ERROR'];
}