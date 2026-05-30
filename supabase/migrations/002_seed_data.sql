-- ============================================================
-- Raquetboard — Seed inicial de alumnos y paquetes
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Paquetes ──────────────────────────────────────────────
-- Paquetes individuales
INSERT INTO paquetes (paquete_id, nombre, num_clases, precio, vigencia_dias) VALUES
  ('paq_ind_4_235',  'Individual 4 clases',  4, 235000, 60),
  ('paq_ind_4_225',  'Individual 4 clases',  4, 225000, 60),
  ('paq_ind_5_235',  'Individual 5 clases',  5, 235000, 60),
  ('paq_ind_6_315',  'Individual 6 clases',  6, 315000, 60),
  ('paq_ind_8_450',  'Individual 8 clases',  8, 450000, 90),
  ('paq_par_4_350',  'Pareja 4 clases',      4, 350000, 60),
  ('paq_par_5_350',  'Pareja 5 clases',      5, 350000, 60),
  ('paq_mix_8_530',  'Mixto 8 clases',       8, 530000, 90);

-- ── Alumnos ───────────────────────────────────────────────
INSERT INTO alumnos (alumno_id, nombre) VALUES
  ('alu_luis_olejua',   'Luis Enrique Olejua Primo'),
  ('alu_yaneth',        'Yaneth'),
  ('alu_ronald',        'Ronald'),
  ('alu_carlos_mtz',    'Carlos Martinez'),
  ('alu_joahn',         'Joahn'),
  ('alu_manuela',       'Manuela'),
  ('alu_mateo_lopez',   'Mateo Lopez'),
  ('alu_don_francisco', 'Don Francisco Arcila'),
  ('alu_dave',          'Dave'),
  ('alu_daniela',       'Daniela'),
  ('alu_anton',         'Antón'),
  ('alu_emiliano',      'Emiliano'),
  ('alu_jonathan',      'Jonathan'),
  ('alu_dederle',       'Dederle');

-- ── Inscripciones activas ─────────────────────────────────
-- La fecha de inicio es hoy; ajustala si las clases ya empezaron
INSERT INTO inscripciones (
  inscripcion_id, alumno_id, paquete_id,
  fecha_inicio, fecha_vencimiento,
  clases_usadas, clases_total, estado
) VALUES
  -- Luis Enrique: individual 8 clases $450k
  ('ins_luis',       'alu_luis_olejua',   'paq_ind_8_450',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 0, 8, 'activa'),

  -- Yaneth & Ronald: pareja 5 clases $350k (comparten inscripción → 1 clase = 1 sesión de pareja)
  ('ins_yaneth_ron', 'alu_yaneth',        'paq_par_5_350',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 5, 'activa'),

  -- Carlos Martinez: individual 4 clases $235k
  ('ins_carlos',     'alu_carlos_mtz',    'paq_ind_4_235',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 4, 'activa'),

  -- Joahn & Manuela: pareja 4 clases $350k
  ('ins_joahn_man',  'alu_joahn',         'paq_par_4_350',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 4, 'activa'),

  -- Mateo Lopez: individual 5 clases $235k
  ('ins_mateo',      'alu_mateo_lopez',   'paq_ind_5_235',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 5, 'activa'),

  -- Don Francisco: individual 4 clases $235k
  ('ins_francisco',  'alu_don_francisco', 'paq_ind_4_235',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 4, 'activa'),

  -- Dave & Daniela: mixto 8 clases $530k
  ('ins_dave_dan',   'alu_dave',          'paq_mix_8_530',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 0, 8, 'activa'),

  -- Antón: individual 6 clases $315k (Antón y Emiliano tienen clases juntos)
  ('ins_anton',      'alu_anton',         'paq_ind_6_315',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 6, 'activa'),

  -- Yaneth individual: 4 clases $225k
  ('ins_yaneth_ind', 'alu_yaneth',        'paq_ind_4_225',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 4, 'activa'),

  -- Ronald individual: 4 clases $225k
  ('ins_ronald_ind', 'alu_ronald',        'paq_ind_4_225',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 4, 'activa'),

  -- Jonathan: individual 4 clases $235k
  ('ins_jonathan',   'alu_jonathan',      'paq_ind_4_235',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 4, 'activa'),

  -- Dederle: individual 8 clases $450k
  ('ins_dederle',    'alu_dederle',       'paq_ind_8_450',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 0, 8, 'activa');

-- ── Notas ─────────────────────────────────────────────────
-- Yaneth y Ronald tienen DOS inscripciones cada uno:
--   1. La pareja (ins_yaneth_ron / se registra en ins_yaneth_ron para ambos)
--   2. Individual (ins_yaneth_ind, ins_ronald_ind)
--
-- Para las parejas (Yaneth & Ronald, Joahn & Manuela, Dave & Daniela):
--   La inscripción está a nombre del primer alumno.
--   Si querés que ambos aparezcan con las clases restantes,
--   crea una segunda inscripción para el compañero apuntando al mismo paquete.
--
-- Joahn & Manuela — inscripción secundaria para Manuela:
INSERT INTO inscripciones (
  inscripcion_id, alumno_id, paquete_id,
  fecha_inicio, fecha_vencimiento,
  clases_usadas, clases_total, estado
) VALUES
  ('ins_manuela',  'alu_manuela', 'paq_par_4_350',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 4, 'activa'),
  ('ins_daniela',  'alu_daniela', 'paq_mix_8_530',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 0, 8, 'activa'),
  ('ins_emiliano', 'alu_emiliano', 'paq_ind_6_315',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 0, 6, 'activa');
