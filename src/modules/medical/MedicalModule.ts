import { Module } from '../core/types';

export const MEDICAL_MODULE: Module = {
  id: 'medical',
  name: 'Medizinische Verwaltung',
  description: 'Verwaltung von Verletzungen und medizinischen Untersuchungen',
  dependencies: ['player-profile'],
  relations: [
    {
      sourceModule: 'medical',
      targetModule: 'player-profile',
      type: 'oneToMany',
      description: 'Ein Spieler hat mehrere medizinische Einträge'
    },
    {
      sourceModule: 'medical',
      targetModule: 'history',
      type: 'oneToMany',
      description: 'Medizinische Einträge werden im Verlauf gespeichert'
    }
  ]
};