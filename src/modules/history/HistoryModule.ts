import { Module } from '../core/types';

export const HISTORY_MODULE: Module = {
  id: 'history',
  name: 'Verlauf',
  description: 'Verlaufsdarstellung von Bewertungen und Statistiken',
  dependencies: ['player-profile', 'evaluation-matrix', 'statistics'],
  relations: [
    {
      sourceModule: 'history',
      targetModule: 'player-profile',
      type: 'oneToMany',
      description: 'Verlauf pro Spieler'
    },
    {
      sourceModule: 'history',
      targetModule: 'evaluation-matrix',
      type: 'oneToMany',
      description: 'Verlauf der Bewertungen'
    }
  ]
};