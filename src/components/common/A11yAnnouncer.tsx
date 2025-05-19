import React, { useEffect, useState } from 'react';

interface A11yAnnouncerProps {
  message?: string;
  assertive?: boolean;
}

export function A11yAnnouncer({ message, assertive = false }: A11yAnnouncerProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    if (message) {
      // Clear previous announcement
      setAnnouncement('');
      
      // Set new announcement after a brief delay
      const timeout = setTimeout(() => {
        setAnnouncement(message);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [message]);

  if (!announcement) return null;

  return (
    <div
      role="status"
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}