/**
 * Skip Link für Keyboard Navigation
 * Ermöglicht das Überspringen von Navigation
 */
import React from 'react';

interface SkipLinkProps {
  targetId: string;
  children?: React.ReactNode;
}

export function SkipLink({ targetId, children = 'Zum Hauptinhalt springen' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600 focus:shadow-lg focus:rounded-lg"
    >
      {children}
    </a>
  );
}