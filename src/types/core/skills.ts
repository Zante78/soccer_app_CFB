export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface Skill {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  weight: number;
  applicablePositions?: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'technical',
    name: 'Technische Fähigkeiten',
    description: 'Grundlegende und fortgeschrittene technische Fähigkeiten',
    weight: 1.0
  },
  {
    id: 'tactical',
    name: 'Taktische Fähigkeiten',
    description: 'Spielverständnis und taktisches Verhalten',
    weight: 1.0
  },
  {
    id: 'physical',
    name: 'Körperliche Fähigkeiten',
    description: 'Athletische und physische Eigenschaften',
    weight: 1.0
  },
  {
    id: 'mental',
    name: 'Mentale Fähigkeiten',
    description: 'Psychologische und mentale Aspekte',
    weight: 1.0
  },
  {
    id: 'social',
    name: 'Soziale Fähigkeiten',
    description: 'Teamverhalten und Kommunikation',
    weight: 0.8
  }
];

export const SKILLS: Skill[] = [
  // Technische Fähigkeiten
  {
    id: 'ball-control',
    categoryId: 'technical',
    name: 'Ballkontrolle',
    description: 'Fähigkeit zur Kontrolle und Verarbeitung des Balls',
    weight: 1.0
  },
  {
    id: 'ball-reception',
    categoryId: 'technical',
    name: 'Ballannahme',
    description: 'Qualität der ersten Ballberührung',
    weight: 1.0
  },
  {
    id: 'dribbling',
    categoryId: 'technical',
    name: 'Dribbling',
    description: 'Fähigkeit, den Ball am Fuß zu führen und Gegner zu umspielen',
    weight: 0.9
  },
  {
    id: 'short-passing',
    categoryId: 'technical',
    name: 'Kurzpassspiel',
    description: 'Präzision und Timing kurzer Pässe',
    weight: 1.0
  },
  {
    id: 'long-passing',
    categoryId: 'technical',
    name: 'Langpassspiel',
    description: 'Präzision und Timing langer Pässe',
    weight: 0.9
  },
  {
    id: 'free-kicks',
    categoryId: 'technical',
    name: 'Freistöße',
    description: 'Ausführung von Freistößen',
    weight: 0.7
  },
  {
    id: 'corners',
    categoryId: 'technical',
    name: 'Eckbälle',
    description: 'Ausführung von Eckbällen',
    weight: 0.7
  },
  {
    id: 'shooting-power',
    categoryId: 'technical',
    name: 'Schusskraft',
    description: 'Kraft und Wucht der Schüsse',
    weight: 0.9
  },
  {
    id: 'shooting-accuracy',
    categoryId: 'technical',
    name: 'Schusspräzision',
    description: 'Genauigkeit der Schüsse',
    weight: 1.0
  },
  {
    id: 'heading',
    categoryId: 'technical',
    name: 'Kopfballspiel',
    description: 'Technik und Timing im Kopfballspiel',
    weight: 0.8
  },

  // Körperliche Fähigkeiten
  {
    id: 'speed',
    categoryId: 'physical',
    name: 'Schnelligkeit',
    description: 'Sprint- und Antrittsschnelligkeit',
    weight: 1.0
  },
  {
    id: 'stamina',
    categoryId: 'physical',
    name: 'Ausdauer',
    description: 'Konditionelle Ausdauerfähigkeit',
    weight: 1.0
  },
  {
    id: 'strength',
    categoryId: 'physical',
    name: 'Kraft',
    description: 'Körperliche Stärke und Robustheit',
    weight: 0.9
  },
  {
    id: 'agility',
    categoryId: 'physical',
    name: 'Beweglichkeit',
    description: 'Beweglichkeit und Koordination',
    weight: 0.9
  },
  {
    id: 'jumping',
    categoryId: 'physical',
    name: 'Sprungkraft',
    description: 'Vertikale und horizontale Sprungkraft',
    weight: 0.8
  },

  // Taktische Fähigkeiten
  {
    id: 'positioning',
    categoryId: 'tactical',
    name: 'Positionsspiel',
    description: 'Räumliches Verständnis und Positionierung',
    weight: 1.0
  },
  {
    id: 'game-intelligence',
    categoryId: 'tactical',
    name: 'Spielverständnis',
    description: 'Taktisches Verständnis und Spielintelligenz',
    weight: 1.0
  },
  {
    id: 'anticipation',
    categoryId: 'tactical',
    name: 'Antizipation',
    description: 'Fähigkeit, Spielsituationen vorauszusehen',
    weight: 0.9
  },
  {
    id: 'defensive-positioning',
    categoryId: 'tactical',
    name: 'Defensivverhalten',
    description: 'Defensives Stellungsspiel und Zweikampfverhalten',
    weight: 1.0
  },
  {
    id: 'offensive-positioning',
    categoryId: 'tactical',
    name: 'Offensivverhalten',
    description: 'Offensives Stellungsspiel und Laufwege',
    weight: 1.0
  },

  // Mentale Fähigkeiten
  {
    id: 'concentration',
    categoryId: 'mental',
    name: 'Konzentration',
    description: 'Fokussierung und Aufmerksamkeit',
    weight: 1.0
  },
  {
    id: 'decision-making',
    categoryId: 'mental',
    name: 'Entscheidungsfindung',
    description: 'Qualität und Schnelligkeit von Entscheidungen',
    weight: 1.0
  },
  {
    id: 'pressure-handling',
    categoryId: 'mental',
    name: 'Umgang mit Druck',
    description: 'Leistung unter Druck und in wichtigen Spielen',
    weight: 0.9
  },
  {
    id: 'motivation',
    categoryId: 'mental',
    name: 'Motivation',
    description: 'Intrinsische Motivation und Leistungsbereitschaft',
    weight: 0.8
  },
  {
    id: 'confidence',
    categoryId: 'mental',
    name: 'Selbstvertrauen',
    description: 'Vertrauen in die eigenen Fähigkeiten',
    weight: 0.8
  },

  // Soziale Fähigkeiten
  {
    id: 'leadership',
    categoryId: 'social',
    name: 'Führungsqualitäten',
    description: 'Fähigkeit, das Team zu führen und zu motivieren',
    weight: 0.7
  },
  {
    id: 'communication',
    categoryId: 'social',
    name: 'Kommunikation',
    description: 'Verbale und non-verbale Kommunikation auf dem Platz',
    weight: 0.8
  },
  {
    id: 'teamwork',
    categoryId: 'social',
    name: 'Teamwork',
    description: 'Zusammenarbeit und Integration im Team',
    weight: 0.9
  },
  {
    id: 'fair-play',
    categoryId: 'social',
    name: 'Fair Play',
    description: 'Sportliches Verhalten und Respekt',
    weight: 0.7
  }
];

// Positionsspezifische Skills
export const GOALKEEPER_SKILLS: Skill[] = [
  {
    id: 'gk-handling',
    categoryId: 'technical',
    name: 'Fangtechnik',
    description: 'Sicherheit beim Fangen von Bällen',
    weight: 1.0,
    applicablePositions: ['goalkeeper']
  },
  {
    id: 'gk-reflexes',
    categoryId: 'physical',
    name: 'Reflexe',
    description: 'Reaktionsschnelligkeit und Reflexe',
    weight: 1.0,
    applicablePositions: ['goalkeeper']
  },
  {
    id: 'gk-positioning',
    categoryId: 'tactical',
    name: 'Torwart-Positionsspiel',
    description: 'Positionierung im und am Tor',
    weight: 1.0,
    applicablePositions: ['goalkeeper']
  },
  {
    id: 'gk-distribution',
    categoryId: 'technical',
    name: 'Abschläge und Abwürfe',
    description: 'Qualität der Spieleröffnung',
    weight: 0.9,
    applicablePositions: ['goalkeeper']
  }
];