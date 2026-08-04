-- Catálogo global de ejercicios (user_id = null, visible para todos).
-- Corre esto DESPUÉS de 0001_init.sql.

insert into public.exercises (name, kind, muscle_group) values
  ('Press de banca', 'strength', 'pecho'),
  ('Press inclinado con mancuernas', 'strength', 'pecho'),
  ('Sentadilla', 'strength', 'pierna'),
  ('Peso muerto', 'strength', 'espalda'),
  ('Press militar', 'strength', 'hombro'),
  ('Remo con barra', 'strength', 'espalda'),
  ('Dominadas', 'strength', 'espalda'),
  ('Curl de bíceps', 'strength', 'brazo'),
  ('Extensión de tríceps', 'strength', 'brazo'),
  ('Zancadas', 'strength', 'pierna'),
  ('Elevaciones laterales', 'strength', 'hombro'),
  ('Hip thrust', 'strength', 'pierna'),
  ('Correr', 'cardio', null),
  ('Bicicleta', 'cardio', null),
  ('Elíptica', 'cardio', null),
  ('Remo (cardio)', 'cardio', null),
  ('Cuerda', 'cardio', null)
on conflict do nothing;
