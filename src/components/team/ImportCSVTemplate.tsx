import React from 'react';
import { FileDown } from 'lucide-react';

interface ImportCSVTemplateProps {
  type: 'team' | 'player';
}

export function ImportCSVTemplate({ type }: ImportCSVTemplateProps) {
  const generateTeamCSV = () => {
    const headers = ['Name', 'Kategorie', 'Saison', 'Primärfarbe', 'Sekundärfarbe'];
    const exampleRow = ['FC Beispiel', 'U19', '2023/24', '#ff0000', '#ffffff'];
    
    const csv = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');
    
    downloadCSV(csv, 'teams_vorlage.csv');
  };
  
  const generatePlayerCSV = () => {
    const headers = ['Vorname', 'Nachname', 'Position', 'Geburtsdatum', 'Email', 'Telefon'];
    const exampleRow = ['Max', 'Mustermann', 'Torwart', '2000-01-01', 'max@example.com', '+49123456789'];
    
    const csv = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');
    
    downloadCSV(csv, 'spieler_vorlage.csv');
  };
  
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <button
      onClick={type === 'team' ? generateTeamCSV : generatePlayerCSV}
      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
    >
      <FileDown className="w-3 h-3" />
      <span>CSV-Vorlage herunterladen</span>
    </button>
  );
}