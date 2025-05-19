-- Insert test teams
INSERT INTO teams (name, category, season) VALUES
  ('FC Adler U19', 'U19', '2023/24'),
  ('FC Adler Erste', 'Senioren', '2023/24'),
  ('FC Adler U17', 'U17', '2023/24')
ON CONFLICT DO NOTHING;

-- Insert test players
INSERT INTO players (first_name, last_name, position, skills) VALUES
  ('Lion', 'Kritikos', 'Innenverteidiger', '[
    {"name": "Ballkontrolle", "value": 10, "category": "technical"},
    {"name": "Schusstechnik", "value": 10, "category": "technical"},
    {"name": "Kopfballspiel", "value": 10, "category": "technical"},
    {"name": "Freistöße", "value": 10, "category": "technical"},
    {"name": "Eckbälle", "value": 10, "category": "technical"},
    {"name": "Taktische Intelligenz", "value": 10, "category": "mental"},
    {"name": "Schnelligkeit", "value": 10, "category": "physical"},
    {"name": "Ausdauer", "value": 10, "category": "physical"},
    {"name": "Kraft", "value": 10, "category": "physical"},
    {"name": "Mentale Stärke", "value": 10, "category": "mental"},
    {"name": "Teamfähigkeit", "value": 10, "category": "social"},
    {"name": "Kommunikation", "value": 10, "category": "social"}
  ]'),
  ('Emil', 'Hillesheim', 'Innenverteidiger', '[
    {"name": "Ballkontrolle", "value": 10, "category": "technical"},
    {"name": "Schusstechnik", "value": 10, "category": "technical"},
    {"name": "Kopfballspiel", "value": 10, "category": "technical"},
    {"name": "Freistöße", "value": 10, "category": "technical"},
    {"name": "Eckbälle", "value": 10, "category": "technical"},
    {"name": "Taktische Intelligenz", "value": 10, "category": "mental"},
    {"name": "Schnelligkeit", "value": 10, "category": "physical"},
    {"name": "Ausdauer", "value": 10, "category": "physical"},
    {"name": "Kraft", "value": 10, "category": "physical"},
    {"name": "Mentale Stärke", "value": 10, "category": "mental"},
    {"name": "Teamfähigkeit", "value": 10, "category": "social"},
    {"name": "Kommunikation", "value": 10, "category": "social"}
  ]'),
  ('Can', 'Cina', 'Sturm', '[
    {"name": "Ballkontrolle", "value": 10, "category": "technical"},
    {"name": "Schusstechnik", "value": 10, "category": "technical"},
    {"name": "Kopfballspiel", "value": 10, "category": "technical"},
    {"name": "Freistöße", "value": 10, "category": "technical"},
    {"name": "Eckbälle", "value": 10, "category": "technical"},
    {"name": "Taktische Intelligenz", "value": 10, "category": "mental"},
    {"name": "Schnelligkeit", "value": 10, "category": "physical"},
    {"name": "Ausdauer", "value": 10, "category": "physical"},
    {"name": "Kraft", "value": 10, "category": "physical"},
    {"name": "Mentale Stärke", "value": 10, "category": "mental"},
    {"name": "Teamfähigkeit", "value": 10, "category": "social"},
    {"name": "Kommunikation", "value": 10, "category": "social"}
  ]')
ON CONFLICT DO NOTHING;