/**
 * Abstrakte Basisklasse für Export-Formatierung
 */
export abstract class ExportFormatter {
  abstract format(data: any[]): Promise<Blob>;
  abstract getContentType(): string;
  abstract getFileExtension(): string;
}

export class CSVFormatter extends ExportFormatter {
  async format(data: any[]): Promise<Blob> {
    if (data.length === 0) return new Blob([''], { type: 'text/csv' });

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ];
    
    return new Blob([csvRows.join('\n')], { type: 'text/csv' });
  }

  getContentType(): string {
    return 'text/csv';
  }

  getFileExtension(): string {
    return 'csv';
  }
}

export class JSONFormatter extends ExportFormatter {
  async format(data: any[]): Promise<Blob> {
    return new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
  }

  getContentType(): string {
    return 'application/json';
  }

  getFileExtension(): string {
    return 'json';
  }
}