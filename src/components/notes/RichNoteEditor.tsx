import React, { useState } from 'react';
import { Bold, Italic, List, Link } from 'lucide-react';

interface RichNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichNoteEditor({ value, onChange, placeholder }: RichNoteEditorProps) {
  const [selectedFormat, setSelectedFormat] = useState<string[]>([]);

  const handleFormat = (format: string) => {
    const textarea = document.getElementById('rich-editor') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = value;
    switch (format) {
      case 'bold': {
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        break;
      }
      case 'italic': {
        newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
        break;
      }
      case 'list': {
        newText = value.substring(0, start) + `\n- ${selectedText}` + value.substring(end);
        break;
      }
      case 'link': {
        const url = prompt('URL eingeben:', 'https://');
        if (url) {
          newText = value.substring(0, start) + `[${selectedText}](${url})` + value.substring(end);
        }
        break;
      }
      default: {
        return;
      }
    }

    onChange(newText);
    setSelectedFormat(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className={`p-1 rounded hover:bg-gray-200 ${
            selectedFormat.includes('bold') ? 'bg-gray-200' : ''
          }`}
          title="Fett"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className={`p-1 rounded hover:bg-gray-200 ${
            selectedFormat.includes('italic') ? 'bg-gray-200' : ''
          }`}
          title="Kursiv"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('list')}
          className={`p-1 rounded hover:bg-gray-200 ${
            selectedFormat.includes('list') ? 'bg-gray-200' : ''
          }`}
          title="Liste"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('link')}
          className={`p-1 rounded hover:bg-gray-200 ${
            selectedFormat.includes('link') ? 'bg-gray-200' : ''
          }`}
          title="Link"
        >
          <Link className="w-4 h-4" />
        </button>
      </div>
      <textarea
        id="rich-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}