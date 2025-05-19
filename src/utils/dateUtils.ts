export function formatDate(date: string | Date | null): string {
  if (!date) return 'Unbekanntes Datum';
  
  try {
    return new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return 'Ungültiges Datum';
  }
}