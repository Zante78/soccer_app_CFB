import { Player } from '../../types/player';
import { Team } from '../../types/core/team';
import { GameStatistics } from '../../types/statistics';
import { Injury } from '../../types/core/medical';

export interface ModuleRelation {
  sourceModule: string;
  targetModule: string;
  type: 'oneToOne' | 'oneToMany' | 'manyToMany';
  description: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  relations: ModuleRelation[];
}

export const CORE_MODULES: Module[] = [
  {
    id: 'player-profile',
    name: 'Spielerprofil',
    description: 'Verwaltung der Spielerinformationen',
    dependencies: [],
    relations: [
      {
        sourceModule: 'player-profile',
        targetModule: 'evaluation-matrix',
        type: 'oneToMany',
        description: 'Ein Spieler hat mehrere Bewertungen'
      },
      {
        sourceModule: 'player-profile',
        targetModule: 'statistics',
        type: 'oneToMany',
        description: 'Ein Spieler hat mehrere Statistiken'
      }
    ]
  },
  {
    id: 'evaluation-matrix',
    name: 'Bewertungsmatrix',
    description: 'System zur Bewertung von Spielerfähigkeiten',
    dependencies: ['player-profile'],
    relations: [
      {
        sourceModule: 'evaluation-matrix',
        targetModule: 'history',
        type: 'oneToMany',
        description: 'Bewertungen werden im Verlauf gespeichert'
      }
    ]
  },
  {
    id: 'statistics',
    name: 'Statistiken',
    description: 'Erfassung und Analyse von Spielerstatistiken',
    dependencies: ['player-profile'],
    relations: [
      {
        sourceModule: 'statistics',
        targetModule: 'history',
        type: 'oneToMany',
        description: 'Statistiken werden im Verlauf gespeichert'
      }
    ]
  }
];