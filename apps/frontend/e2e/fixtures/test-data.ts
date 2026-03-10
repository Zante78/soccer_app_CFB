/**
 * Seed-Daten-Konstanten (must match seed.sql)
 */

export const TEST_ADMIN = {
  email: "admin@cfb-niehl.de",
  password: "Test1234!",
  fullName: "Max Mustermann",
  role: "Super Admin",
} as const;

export const TEST_USERS = {
  passwart: {
    email: "passwart@cfb-niehl.de",
    fullName: "Anna Schmidt",
    role: "Passwart",
  },
  trainer: {
    email: "trainer-a19@cfb-niehl.de",
    fullName: "Thomas Müller",
    role: "Trainer",
  },
} as const;

export const SEED_REGISTRATIONS = {
  completed: {
    id: "10000000-0000-0000-0000-000000000001",
    playerName: "Max Spieler",
    team: "A-Junioren U19",
    status: "COMPLETED",
  },
  readyForBot: {
    id: "10000000-0000-0000-0000-000000000002",
    playerName: "Thomas Wechsler",
    team: "1. Herren Senioren",
    status: "READY_FOR_BOT",
  },
  draft: {
    id: "10000000-0000-0000-0000-000000000003",
    playerName: "Jonas Junior",
    team: "E-Junioren U11",
    status: "DRAFT",
  },
} as const;

export const SEED_TEAMS = [
  "A-Junioren U19",
  "B-Junioren U17",
  "1. Herren Senioren",
  "E-Junioren U11",
] as const;

/** Empty storageState for unauthenticated tests */
export const UNAUTHENTICATED_STATE = { cookies: [], origins: [] };
