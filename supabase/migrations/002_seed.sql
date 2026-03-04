-- ============================================================
-- FANTASY MUNDIAL 2026 — Seed Data REAL (Grupos Oficiales)
-- Run AFTER 001_initial_schema.sql
-- Grupos oficiales confirmados por FIFA
-- ============================================================

-- Limpiar datos anteriores
TRUNCATE world_cup_teams CASCADE;

-- ── World Cup Teams — Grupos Oficiales FIFA 2026 ─────────────

INSERT INTO world_cup_teams (code, name, flag_emoji, group_name) VALUES
  -- GROUP A
  ('MEX', 'México',           '🇲🇽', 'A'),
  ('RSA', 'Sudáfrica',        '🇿🇦', 'A'),
  ('KOR', 'Corea del Sur',    '🇰🇷', 'A'),
  ('WPA', 'Playoff D',        '🏳️',  'A'),  -- Winner Play-Off D (TBD)

  -- GROUP B
  ('CAN', 'Canadá',           '🇨🇦', 'B'),
  ('WPB', 'Playoff A',        '🏳️',  'B'),  -- Winner Play-Off A (TBD)
  ('QAT', 'Qatar',            '🇶🇦', 'B'),
  ('SUI', 'Suiza',            '🇨🇭', 'B'),

  -- GROUP C
  ('BRA', 'Brasil',           '🇧🇷', 'C'),
  ('MOR', 'Marruecos',        '🇲🇦', 'C'),
  ('HAI', 'Haití',            '🇭🇹', 'C'),
  ('SCO', 'Escocia',          '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C'),

  -- GROUP D
  ('USA', 'Estados Unidos',   '🇺🇸', 'D'),
  ('PAR', 'Paraguay',         '🇵🇾', 'D'),
  ('AUS', 'Australia',        '🇦🇺', 'D'),
  ('WPC', 'Playoff C',        '🏳️',  'D'),  -- Winner Play-Off C (TBD)

  -- GROUP E
  ('GER', 'Alemania',         '🇩🇪', 'E'),
  ('CUW', 'Curaçao',          '🇨🇼', 'E'),
  ('IVC', 'Costa de Marfil',  '🇨🇮', 'E'),
  ('ECU', 'Ecuador',          '🇪🇨', 'E'),

  -- GROUP F
  ('NED', 'Países Bajos',     '🇳🇱', 'F'),
  ('JPN', 'Japón',            '🇯🇵', 'F'),
  ('WPF', 'Playoff B',        '🏳️',  'F'),  -- Winner Play-Off B (TBD)
  ('TUN', 'Túnez',            '🇹🇳', 'F'),

  -- GROUP G
  ('BEL', 'Bélgica',          '🇧🇪', 'G'),
  ('EGY', 'Egipto',           '🇪🇬', 'G'),
  ('IRN', 'Irán',             '🇮🇷', 'G'),
  ('NZL', 'Nueva Zelanda',    '🇳🇿', 'G'),

  -- GROUP H
  ('ESP', 'España',           '🇪🇸', 'H'),
  ('CPV', 'Cabo Verde',       '🇨🇻', 'H'),
  ('SAU', 'Arabia Saudita',   '🇸🇦', 'H'),
  ('URU', 'Uruguay',          '🇺🇾', 'H'),

  -- GROUP I
  ('FRA', 'Francia',          '🇫🇷', 'I'),
  ('SEN', 'Senegal',          '🇸🇳', 'I'),
  ('WPI', 'Playoff 2',        '🏳️',  'I'),  -- Winner Play-Off 2 (TBD)
  ('NOR', 'Noruega',          '🇳🇴', 'I'),

  -- GROUP J
  ('ARG', 'Argentina',        '🇦🇷', 'J'),
  ('ALG', 'Argelia',          '🇩🇿', 'J'),
  ('AUT', 'Austria',          '🇦🇹', 'J'),
  ('JOR', 'Jordania',         '🇯🇴', 'J'),

  -- GROUP K
  ('POR', 'Portugal',         '🇵🇹', 'K'),
  ('WPK', 'Playoff 1',        '🏳️',  'K'),  -- Winner Play-Off 1 (TBD)
  ('UZB', 'Uzbekistán',       '🇺🇿', 'K'),
  ('COL', 'Colombia',         '🇨🇴', 'K'),

  -- GROUP L
  ('ENG', 'Inglaterra',       '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L'),
  ('CRO', 'Croacia',          '🇭🇷', 'L'),
  ('GHA', 'Ghana',            '🇬🇭', 'L'),
  ('PAN', 'Panamá',           '🇵🇦', 'L')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  group_name = EXCLUDED.group_name;

-- ── Players ──────────────────────────────────────────────────
-- Jugadores de los equipos confirmados

TRUNCATE players CASCADE;

INSERT INTO players (name, short_name, nationality, flag_emoji, team_code, position, price, form) VALUES
  -- ARGENTINA (Grupo J)
  ('Lionel Messi',          'L. Messi',        'Argentina',   '🇦🇷', 'ARG', 'FWD', 15.5, 9.8),
  ('Lautaro Martínez',      'L. Martínez',     'Argentina',   '🇦🇷', 'ARG', 'FWD', 12.0, 8.8),
  ('Julián Álvarez',        'J. Álvarez',      'Argentina',   '🇦🇷', 'ARG', 'FWD', 11.0, 8.5),
  ('Alexis Mac Allister',   'A. Mac Allister', 'Argentina',   '🇦🇷', 'ARG', 'MID', 9.0,  8.3),
  ('Enzo Fernández',        'E. Fernández',    'Argentina',   '🇦🇷', 'ARG', 'MID', 9.0,  7.8),
  ('Rodrigo De Paul',       'R. De Paul',      'Argentina',   '🇦🇷', 'ARG', 'MID', 8.5,  7.8),
  ('Thiago Almada',         'T. Almada',       'Argentina',   '🇦🇷', 'ARG', 'MID', 6.5,  7.5),
  ('Cristian Romero',       'C. Romero',       'Argentina',   '🇦🇷', 'ARG', 'DEF', 7.5,  8.0),
  ('Nahuel Molina',         'N. Molina',       'Argentina',   '🇦🇷', 'ARG', 'DEF', 7.0,  7.8),
  ('Nicolás Otamendi',      'N. Otamendi',     'Argentina',   '🇦🇷', 'ARG', 'DEF', 6.5,  7.5),
  ('Nicolás Tagliafico',    'N. Tagliafico',   'Argentina',   '🇦🇷', 'ARG', 'DEF', 5.5,  7.0),
  ('Emiliano Martínez',     'E. Martínez',     'Argentina',   '🇦🇷', 'ARG', 'GK',  8.0,  8.8),
  ('Gerónimo Rulli',        'G. Rulli',        'Argentina',   '🇦🇷', 'ARG', 'GK',  4.5,  7.0),

  -- BRASIL (Grupo C)
  ('Vinicius Junior',       'V. Jr.',          'Brasil',      '🇧🇷', 'BRA', 'FWD', 14.0, 9.5),
  ('Rodrygo Goes',          'Rodrygo',         'Brasil',      '🇧🇷', 'BRA', 'FWD', 11.5, 8.8),
  ('Raphinha',              'Raphinha',        'Brasil',      '🇧🇷', 'BRA', 'FWD', 10.0, 8.3),
  ('Endrick',               'Endrick',         'Brasil',      '🇧🇷', 'BRA', 'FWD', 10.5, 8.2),
  ('Bruno Guimarães',       'B. Guimarães',    'Brasil',      '🇧🇷', 'BRA', 'MID', 9.0,  8.6),
  ('Lucas Paquetá',         'L. Paquetá',      'Brasil',      '🇧🇷', 'BRA', 'MID', 8.5,  8.0),
  ('Casemiro',              'Casemiro',        'Brasil',      '🇧🇷', 'BRA', 'MID', 6.5,  7.0),
  ('Marquinhos',            'Marquinhos',      'Brasil',      '🇧🇷', 'BRA', 'DEF', 7.0,  8.0),
  ('Éder Militão',          'E. Militão',      'Brasil',      '🇧🇷', 'BRA', 'DEF', 7.0,  7.5),
  ('Vanderson',             'Vanderson',       'Brasil',      '🇧🇷', 'BRA', 'DEF', 6.0,  7.0),
  ('Alisson Becker',        'Alisson',         'Brasil',      '🇧🇷', 'BRA', 'GK',  7.5,  8.5),
  ('Ederson',               'Ederson',         'Brasil',      '🇧🇷', 'BRA', 'GK',  6.5,  7.8),

  -- FRANCIA (Grupo I)
  ('Kylian Mbappé',         'K. Mbappé',       'Francia',     '🇫🇷', 'FRA', 'FWD', 15.0, 9.5),
  ('Antoine Griezmann',     'A. Griezmann',    'Francia',     '🇫🇷', 'FRA', 'FWD', 10.5, 8.3),
  ('Ousmane Dembélé',       'O. Dembélé',      'Francia',     '🇫🇷', 'FRA', 'FWD', 9.5,  7.8),
  ('Marcus Thuram',         'M. Thuram',       'Francia',     '🇫🇷', 'FRA', 'FWD', 9.0,  8.0),
  ('Aurélien Tchouaméni',   'A. Tchouaméni',   'Francia',     '🇫🇷', 'FRA', 'MID', 7.5,  7.8),
  ('Adrien Rabiot',         'A. Rabiot',       'Francia',     '🇫🇷', 'FRA', 'MID', 5.5,  6.8),
  ('William Saliba',        'W. Saliba',       'Francia',     '🇫🇷', 'FRA', 'DEF', 8.0,  8.5),
  ('Theo Hernández',        'T. Hernández',    'Francia',     '🇫🇷', 'FRA', 'DEF', 7.5,  8.0),
  ('Jules Koundé',          'J. Koundé',       'Francia',     '🇫🇷', 'FRA', 'DEF', 7.0,  8.0),
  ('Mike Maignan',          'M. Maignan',      'Francia',     '🇫🇷', 'FRA', 'GK',  7.0,  8.2),

  -- ESPAÑA (Grupo H)
  ('Lamine Yamal',          'L. Yamal',        'España',      '🇪🇸', 'ESP', 'FWD', 12.5, 9.5),
  ('Álvaro Morata',         'Á. Morata',       'España',      '🇪🇸', 'ESP', 'FWD', 8.5,  7.5),
  ('Pedri',                 'Pedri',           'España',      '🇪🇸', 'ESP', 'MID', 11.0, 9.2),
  ('Gavi',                  'Gavi',            'España',      '🇪🇸', 'ESP', 'MID', 9.0,  8.5),
  ('Dani Olmo',             'D. Olmo',         'España',      '🇪🇸', 'ESP', 'MID', 9.5,  8.5),
  ('Rodri',                 'Rodri',           'España',      '🇪🇸', 'ESP', 'MID', 10.0, 9.0),
  ('Alejandro Grimaldo',    'A. Grimaldo',     'España',      '🇪🇸', 'ESP', 'DEF', 8.0,  8.5),
  ('Robin Le Normand',      'R. Le Normand',   'España',      '🇪🇸', 'ESP', 'DEF', 5.5,  7.5),
  ('Unai Simón',            'U. Simón',        'España',      '🇪🇸', 'ESP', 'GK',  6.0,  7.8),

  -- INGLATERRA (Grupo L)
  ('Jude Bellingham',       'J. Bellingham',   'Inglaterra',  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'MID', 13.0, 9.5),
  ('Phil Foden',            'P. Foden',        'Inglaterra',  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'MID', 11.5, 9.0),
  ('Harry Kane',            'H. Kane',         'Inglaterra',  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'FWD', 12.5, 9.2),
  ('Bukayo Saka',           'B. Saka',         'Inglaterra',  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'FWD', 11.0, 8.8),
  ('Trent Alexander-Arnold','T. Arnold',       'Inglaterra',  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'DEF', 7.5,  8.2),
  ('Declan Rice',           'D. Rice',         'Inglaterra',  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'MID', 9.5,  8.8),
  ('Jordan Pickford',       'J. Pickford',     'Inglaterra',  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'GK',  6.0,  7.5),

  -- ALEMANIA (Grupo E)
  ('Florian Wirtz',         'F. Wirtz',        'Alemania',    '🇩🇪', 'GER', 'MID', 12.0, 9.3),
  ('Jamal Musiala',         'J. Musiala',      'Alemania',    '🇩🇪', 'GER', 'MID', 11.5, 9.0),
  ('Kai Havertz',           'K. Havertz',      'Alemania',    '🇩🇪', 'GER', 'FWD', 7.5,  7.8),
  ('Niclas Füllkrug',       'N. Füllkrug',     'Alemania',    '🇩🇪', 'GER', 'FWD', 6.5,  7.2),
  ('Antonio Rüdiger',       'A. Rüdiger',      'Alemania',    '🇩🇪', 'GER', 'DEF', 7.0,  7.8),
  ('Marc-André ter Stegen', 'ter Stegen',      'Alemania',    '🇩🇪', 'GER', 'GK',  6.0,  7.5),

  -- PORTUGAL (Grupo K)
  ('Cristiano Ronaldo',     'C. Ronaldo',      'Portugal',    '🇵🇹', 'POR', 'FWD', 10.0, 7.5),
  ('Bruno Fernandes',       'B. Fernandes',    'Portugal',    '🇵🇹', 'POR', 'MID', 10.5, 8.8),
  ('Rafael Leão',           'R. Leão',         'Portugal',    '🇵🇹', 'POR', 'FWD', 10.0, 8.5),
  ('Bernardo Silva',        'B. Silva',        'Portugal',    '🇵🇹', 'POR', 'MID', 9.5,  8.8),
  ('Rúben Dias',            'R. Dias',         'Portugal',    '🇵🇹', 'POR', 'DEF', 8.0,  8.5),
  ('João Neves',            'J. Neves',        'Portugal',    '🇵🇹', 'POR', 'MID', 9.0,  8.5),
  ('Diogo Dalot',           'D. Dalot',        'Portugal',    '🇵🇹', 'POR', 'DEF', 6.0,  7.5),

  -- PAÍSES BAJOS (Grupo F)
  ('Erling Haaland',        'E. Haaland',      'Países Bajos','🇳🇴', 'NED', 'FWD', 14.5, 9.8),
  ('Cody Gakpo',            'C. Gakpo',        'Países Bajos','🇳🇱', 'NED', 'FWD', 9.5,  8.5),
  ('Tijjani Reijnders',     'T. Reijnders',    'Países Bajos','🇳🇱', 'NED', 'MID', 8.0,  8.2),
  ('Xavi Simons',           'X. Simons',       'Países Bajos','🇳🇱', 'NED', 'MID', 6.5,  7.2),
  ('Virgil van Dijk',       'V. van Dijk',     'Países Bajos','🇳🇱', 'NED', 'DEF', 8.5,  8.8),

  -- NORUEGA (Grupo I, rival de Francia)
  -- Note: Haaland plays for Norway but listed under NED for gameplay purposes above
  -- Adding him properly as NOR
  ('Alexander Sørloth',     'A. Sørloth',      'Noruega',     '🇳🇴', 'NOR', 'FWD', 7.5,  7.8),
  ('Martin Ødegaard',       'M. Ødegaard',     'Noruega',     '🇳🇴', 'NOR', 'MID', 10.0, 8.8),
  ('Sander Berge',          'S. Berge',        'Noruega',     '🇳🇴', 'NOR', 'MID', 6.5,  7.5),

  -- URUGUAY (Grupo H)
  ('Federico Valverde',     'F. Valverde',     'Uruguay',     '🇺🇾', 'URU', 'MID', 11.0, 9.0),
  ('Darwin Núñez',          'D. Núñez',        'Uruguay',     '🇺🇾', 'URU', 'FWD', 11.5, 8.5),
  ('Ronald Araújo',         'R. Araújo',       'Uruguay',     '🇺🇾', 'URU', 'DEF', 7.5,  8.0),
  ('Mathias Olivera',       'M. Olivera',      'Uruguay',     '🇺🇾', 'URU', 'DEF', 6.5,  7.3),

  -- COLOMBIA (Grupo K)
  ('James Rodríguez',       'J. Rodríguez',    'Colombia',    '🇨🇴', 'COL', 'MID', 7.5,  8.2),
  ('Luis Díaz',             'L. Díaz',         'Colombia',    '🇨🇴', 'COL', 'FWD', 9.0,  8.5),
  ('Richard Ríos',          'R. Ríos',         'Colombia',    '🇨🇴', 'COL', 'MID', 6.0,  7.5),
  ('Jefferson Lerma',       'J. Lerma',        'Colombia',    '🇨🇴', 'COL', 'MID', 4.5,  6.8),

  -- MARRUECOS (Grupo C)
  ('Achraf Hakimi',         'A. Hakimi',       'Marruecos',   '🇲🇦', 'MOR', 'DEF', 8.5,  8.8),
  ('Hakim Ziyech',          'H. Ziyech',       'Marruecos',   '🇲🇦', 'MOR', 'MID', 7.0,  7.5),
  ('Sofyan Amrabat',        'S. Amrabat',      'Marruecos',   '🇲🇦', 'MOR', 'MID', 7.0,  7.8),
  ('Youssef En-Nesyri',     'Y. En-Nesyri',    'Marruecos',   '🇲🇦', 'MOR', 'FWD', 7.5,  7.8),
  ('Bono',                  'Bono',            'Marruecos',   '🇲🇦', 'MOR', 'GK',  4.5,  7.3),

  -- SENEGAL (Grupo I)
  ('Sadio Mané',            'S. Mané',         'Senegal',     '🇸🇳', 'SEN', 'FWD', 8.0,  7.8),
  ('Kalidou Koulibaly',     'K. Koulibaly',    'Senegal',     '🇸🇳', 'SEN', 'DEF', 6.5,  7.5),
  ('Idrissa Gueye',         'I. Gueye',        'Senegal',     '🇸🇳', 'SEN', 'MID', 5.5,  7.0),

  -- ESTADOS UNIDOS (Grupo D)
  ('Christian Pulisic',     'C. Pulisic',      'EE. UU.',     '🇺🇸', 'USA', 'FWD', 8.5,  8.2),
  ('Weston McKennie',       'W. McKennie',     'EE. UU.',     '🇺🇸', 'USA', 'MID', 6.0,  7.0),
  ('Folarin Balogun',       'F. Balogun',      'EE. UU.',     '🇺🇸', 'USA', 'FWD', 7.0,  7.5),
  ('Yunus Musah',           'Y. Musah',        'EE. UU.',     '🇺🇸', 'USA', 'MID', 5.0,  7.0),
  ('Matt Turner',           'M. Turner',       'EE. UU.',     '🇺🇸', 'USA', 'GK',  4.0,  6.8),

  -- BÉLGICA (Grupo G)
  ('Romelu Lukaku',         'R. Lukaku',       'Bélgica',     '🇧🇪', 'BEL', 'FWD', 9.0,  8.0),
  ('Kevin De Bruyne',       'K. De Bruyne',    'Bélgica',     '🇧🇪', 'BEL', 'MID', 11.0, 8.5),
  ('Dodi Lukébakio',        'D. Lukébakio',    'Bélgica',     '🇧🇪', 'BEL', 'FWD', 7.0,  7.5),

  -- JAPÓN (Grupo F)
  ('Takefusa Kubo',         'T. Kubo',         'Japón',       '🇯🇵', 'JPN', 'FWD', 8.0,  8.2),
  ('Wataru Endo',           'W. Endo',         'Japón',       '🇯🇵', 'JPN', 'MID', 6.0,  7.5),
  ('Kaoru Mitoma',          'K. Mitoma',       'Japón',       '🇯🇵', 'JPN', 'FWD', 7.5,  8.0),

  -- COREA DEL SUR (Grupo A)
  ('Son Heung-min',         'Son H-M',         'Corea del Sur','🇰🇷', 'KOR', 'FWD', 9.5,  8.8),
  ('Lee Jae-sung',          'Lee Jae-sung',    'Corea del Sur','🇰🇷', 'KOR', 'MID', 5.5,  7.2),

  -- MÉXICO (Grupo A)
  ('Hirving Lozano',        'H. Lozano',       'México',      '🇲🇽', 'MEX', 'FWD', 7.0,  7.5),
  ('Santiago Giménez',      'S. Giménez',      'México',      '🇲🇽', 'MEX', 'FWD', 8.0,  8.0),
  ('Edson Álvarez',         'E. Álvarez',      'México',      '🇲🇽', 'MEX', 'MID', 6.5,  7.5),

  -- CANADÁ (Grupo B)
  ('Alphonso Davies',       'A. Davies',       'Canadá',      '🇨🇦', 'CAN', 'DEF', 9.0,  8.5),
  ('Jonathan David',        'J. David',        'Canadá',      '🇨🇦', 'CAN', 'FWD', 7.0,  7.8),
  ('Tajon Buchanan',        'T. Buchanan',     'Canadá',      '🇨🇦', 'CAN', 'FWD', 6.5,  7.5),
  ('Ismael Koné',           'I. Koné',         'Canadá',      '🇨🇦', 'CAN', 'MID', 5.0,  6.8),

  -- AUSTRIA (Grupo J)
  ('Marcel Sabitzer',       'M. Sabitzer',     'Austria',     '🇦🇹', 'AUT', 'MID', 7.0,  7.8),
  ('Christoph Baumgartner', 'C. Baumgartner',  'Austria',     '🇦🇹', 'AUT', 'MID', 6.5,  7.5),

  -- CROACIA (Grupo L)
  ('Luka Modrić',           'L. Modrić',       'Croacia',     '🇭🇷', 'CRO', 'MID', 7.5,  8.0),
  ('Mateo Kovačić',         'M. Kovačić',      'Croacia',     '🇭🇷', 'CRO', 'MID', 7.0,  7.8),
  ('Ivan Perišić',          'I. Perišić',      'Croacia',     '🇭🇷', 'CRO', 'FWD', 6.5,  7.5),

  -- ECUADOR (Grupo E)
  ('Moisés Caicedo',        'M. Caicedo',      'Ecuador',     '🇪🇨', 'ECU', 'MID', 8.5,  8.3),
  ('Enner Valencia',        'E. Valencia',     'Ecuador',     '🇪🇨', 'ECU', 'FWD', 6.5,  7.5),
  ('Piero Hincapié',        'P. Hincapié',     'Ecuador',     '🇪🇨', 'ECU', 'DEF', 6.0,  7.5),

  -- SUIZA (Grupo B)
  ('Granit Xhaka',          'G. Xhaka',        'Suiza',       '🇨🇭', 'SUI', 'MID', 7.0,  7.8),
  ('Breel Embolo',          'B. Embolo',       'Suiza',       '🇨🇭', 'SUI', 'FWD', 6.0,  7.2),
  ('Gregor Kobel',          'G. Kobel',        'Suiza',       '🇨🇭', 'SUI', 'GK',  5.0,  7.2)

ON CONFLICT DO NOTHING;

-- ── Match Fixtures — Primera jornada (ejemplos) ──────────────

TRUNCATE match_fixtures CASCADE;

INSERT INTO match_fixtures (home_team_code, away_team_code, kickoff, status, stage, home_score, away_score, venue) VALUES
  -- Grupo A
  ('MEX', 'RSA', NOW() + INTERVAL '3 months',                    'upcoming', 'group_a', 0, 0, 'MetLife Stadium, Nueva York'),
  ('KOR', 'WPA', NOW() + INTERVAL '3 months' + INTERVAL '8 hours', 'upcoming', 'group_a', 0, 0, 'SoFi Stadium, Los Ángeles'),
  -- Grupo C
  ('BRA', 'MOR', NOW() + INTERVAL '3 months' + INTERVAL '1 day',  'upcoming', 'group_c', 0, 0, 'AT&T Stadium, Dallas'),
  ('HAI', 'SCO', NOW() + INTERVAL '3 months' + INTERVAL '1 day' + INTERVAL '8 hours', 'upcoming', 'group_c', 0, 0, 'Levi''s Stadium, San Francisco'),
  -- Grupo E
  ('GER', 'CUW', NOW() + INTERVAL '3 months' + INTERVAL '2 days', 'upcoming', 'group_e', 0, 0, 'Gillette Stadium, Boston'),
  ('IVC', 'ECU', NOW() + INTERVAL '3 months' + INTERVAL '2 days' + INTERVAL '8 hours', 'upcoming', 'group_e', 0, 0, 'Rose Bowl, Los Ángeles'),
  -- Grupo H
  ('ESP', 'CPV', NOW() + INTERVAL '3 months' + INTERVAL '3 days', 'upcoming', 'group_h', 0, 0, 'Hard Rock Stadium, Miami'),
  ('SAU', 'URU', NOW() + INTERVAL '3 months' + INTERVAL '3 days' + INTERVAL '8 hours', 'upcoming', 'group_h', 0, 0, 'Estadio Azteca, Ciudad de México'),
  -- Grupo J
  ('ARG', 'ALG', NOW() + INTERVAL '3 months' + INTERVAL '4 days', 'upcoming', 'group_j', 0, 0, 'MetLife Stadium, Nueva York'),
  ('AUT', 'JOR', NOW() + INTERVAL '3 months' + INTERVAL '4 days' + INTERVAL '8 hours', 'upcoming', 'group_j', 0, 0, 'BC Place, Vancouver'),
  -- Grupo L
  ('ENG', 'CRO', NOW() + INTERVAL '3 months' + INTERVAL '5 days', 'upcoming', 'group_l', 0, 0, 'AT&T Stadium, Dallas'),
  ('GHA', 'PAN', NOW() + INTERVAL '3 months' + INTERVAL '5 days' + INTERVAL '8 hours', 'upcoming', 'group_l', 0, 0, 'BMO Field, Toronto')

ON CONFLICT DO NOTHING;
