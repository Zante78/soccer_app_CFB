import { Module } from '../core/types';

export const EXPORT_MODULE: Module = {
  id: 'export',
  name: 'Export',
  description: 'Export von Spieler- und Teamdaten',
  dependencies: ['player-profile', 'statistics', 'evaluation-matrix', 'medical'],
  relations: [
    {
      sourceModule: 'export',
      targetModule: 'player-profile',
      type: 'oneToMany',
      description: 'Export von Spielerprofilen'
    },
    {
      sourceModule: 'export',
      targetModule: 'statistics',
      type: 'oneToMany',
      description: 'Export von Statistiken'
    }
  ]
};