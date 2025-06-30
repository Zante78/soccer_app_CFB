import { Player } from '../types/player';
import { Team } from '../types/core/team';
import { ValidationError, ErrorCodes } from './errorUtils';

/**
 * Parses a CSV string into an array of objects
 * @param csvString The CSV string to parse
 * @returns An array of objects with headers as keys
 */
export function parseCSV(csvString: string): Record<string, string>[] {
  try {
    // Split the CSV string into lines
    const lines = csvString.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new ValidationError('Die CSV-Datei ist leer', ErrorCodes.VALIDATION.MISSING_FIELDS);
    }

    // Extract headers from the first line
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Parse each line into an object
    const results: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle quoted values with commas inside
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue.trim());
      
      // Create an object from headers and values
      const obj: Record<string, string> = {};
      
      // Ensure we have enough values for all headers
      const minLength = Math.min(headers.length, values.length);
      
      for (let j = 0; j < minLength; j++) {
        // Remove quotes from values if present
        let value = values[j];
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        obj[headers[j]] = value;
      }
      
      results.push(obj);
    }
    
    return results;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      `Fehler beim Parsen der CSV-Datei: ${error instanceof Error ? error.message : String(error)}`,
      ErrorCodes.VALIDATION.INVALID_FORMAT
    );
  }
}

/**
 * Validates and converts CSV data to Player objects
 * @param csvData Parsed CSV data
 * @returns Array of Player objects
 */
export function validateAndConvertPlayerData(csvData: Record<string, string>[]): Omit<Player, 'id' | 'createdAt' | 'updatedAt'>[] {
  const requiredFields = ['vorname', 'nachname'];
  const players: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const errors: string[] = [];

  // Check if required fields exist in headers
  const headers = Object.keys(csvData[0] || {}).map(h => h.toLowerCase());
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Die CSV-Datei muss die Spalten "${missingFields.join(', ')}" enthalten`,
      ErrorCodes.VALIDATION.MISSING_FIELDS
    );
  }

  // Process each row
  csvData.forEach((row, index) => {
    try {
      const firstName = row['vorname'] || '';
      const lastName = row['nachname'] || '';
      
      if (!firstName || !lastName) {
        throw new Error(`Zeile ${index + 2}: Vorname und Nachname sind Pflichtfelder`);
      }
      
      // Parse date of birth if present
      let dateOfBirth: string | undefined = undefined;
      if (row['geburtsdatum']) {
        const date = new Date(row['geburtsdatum']);
        if (isNaN(date.getTime())) {
          throw new Error(`Zeile ${index + 2}: Ungültiges Datumsformat für Geburtsdatum`);
        }
        dateOfBirth = date.toISOString().split('T')[0];
      }
      
      // Create player object
      const player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'> = {
        firstName,
        lastName,
        position: row['position'] || undefined,
        dateOfBirth,
        email: row['email'] || undefined,
        phone: row['telefon'] || undefined,
        skills: []
      };
      
      players.push(player);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(
      `Fehler beim Validieren der Spielerdaten:\n${errors.join('\n')}`,
      ErrorCodes.VALIDATION.INVALID_FORMAT
    );
  }

  return players;
}

/**
 * Validates and converts CSV data to Team objects
 * @param csvData Parsed CSV data
 * @returns Array of Team objects
 */
export function validateAndConvertTeamData(csvData: Record<string, string>[]): Omit<Team, 'id' | 'createdAt' | 'updatedAt'>[] {
  const requiredFields = ['name', 'kategorie', 'saison'];
  const teams: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const errors: string[] = [];

  // Check if required fields exist in headers
  const headers = Object.keys(csvData[0] || {}).map(h => h.toLowerCase());
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Die CSV-Datei muss die Spalten "${missingFields.join(', ')}" enthalten`,
      ErrorCodes.VALIDATION.MISSING_FIELDS
    );
  }

  // Process each row
  csvData.forEach((row, index) => {
    try {
      const name = row['name'] || '';
      const category = row['kategorie'] || '';
      const season = row['saison'] || '';
      
      if (!name || !category || !season) {
        throw new Error(`Zeile ${index + 2}: Name, Kategorie und Saison sind Pflichtfelder`);
      }
      
      // Create team object
      const team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        category,
        season,
        colors: {
          primary: row['primärfarbe'] || '#000000',
          secondary: row['sekundärfarbe'] || '#ffffff'
        }
      };
      
      teams.push(team);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(
      `Fehler beim Validieren der Teamdaten:\n${errors.join('\n')}`,
      ErrorCodes.VALIDATION.INVALID_FORMAT
    );
  }

  return teams;
}