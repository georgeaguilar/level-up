import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  CardioProgressPoint,
  DashboardData,
  DashboardRange,
  Delta,
  Exercise,
  ExerciseKind,
  ExerciseProgressPoint,
  MuscleGroup,
  MuscleGroupStat,
  PeriodDeltas,
  PeriodTotals,
  PersonalRecord,
  WeeklyPoint,
  WeightUnit,
  WorkoutWithExercises,
} from "@/lib/types";

/**
 * Verifica la sesión y devuelve el usuario autenticado, o redirige a /login.
 * `src/proxy.ts` ya hace una comprobación optimista, pero la autorización
 * real de cada lectura/escritura vive aquí (patrón DAL recomendado por Next.js).
 * Envuelto en `cache()` para no repetir la llamada dentro del mismo render.
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { userId: user.id, email: user.email ?? null };
});

export const getProfile = cache(async () => {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", userId)
    .single();

  return data;
});

const EXERCISE_COLUMNS =
  "id, user_id, name, name_en, slug, kind, muscle_group, equipment, grip, mechanic, is_unilateral";

/**
 * Catálogo completo (global + propio). Sin filtro de servidor: con ~250
 * ejercicios se trae todo y se filtra en cliente (ver `ExercisePicker`),
 * que es lo que permite búsqueda y chips instantáneos sin ida y vuelta.
 */
export async function getExercises(): Promise<Exercise[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select(EXERCISE_COLUMNS)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Ejercicios distintos que el usuario ha registrado alguna vez en algún
 * entrenamiento. La usa `/progress`: con el catálogo completo (~250) de
 * `getExercises()` el selector de esa página sería inservible y casi
 * ningún ejercicio tendría series/tiempos que graficar.
 */
export async function getLoggedExercises(): Promise<Exercise[]> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_exercises")
    .select(`exercise:exercises!inner ( ${EXERCISE_COLUMNS} ), workouts!inner ( user_id )`)
    .eq("workouts.user_id", userId);

  if (error) throw error;

  // Igual que en `getExerciseProgress`: sin tipos generados de Supabase el
  // cliente infiere mal la relación many-to-one, hay que forzar el tipo.
  const rows = data as unknown as Array<{ exercise: Exercise }>;
  const byId = new Map(rows.map((row) => [row.exercise.id, row.exercise]));

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRecentWorkouts(limit = 10) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("id, date, notes")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getWorkout(
  workoutId: string,
): Promise<WorkoutWithExercises | null> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select(
      `
      id, user_id, date, notes, started_at, ended_at,
      workout_exercises (
        id, workout_id, exercise_id, position, duration_seconds,
        exercise:exercises ( ${EXERCISE_COLUMNS} ),
        sets:exercise_sets ( id, workout_exercise_id, set_number, reps, weight, unit, rir )
      )
    `,
    )
    .eq("id", workoutId)
    .order("position", { referencedTable: "workout_exercises", ascending: true })
    .order("set_number", {
      referencedTable: "workout_exercises.exercise_sets",
      ascending: true,
    })
    .maybeSingle();

  if (error) throw error;
  return data as WorkoutWithExercises | null;
}

export async function getWorkoutByDate(date: string) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Progresión de un ejercicio de pesas: por cada sesión, peso máximo,
 * volumen total (reps x peso) y 1RM estimado (fórmula de Epley).
 * Las series en `lb` se convierten a `kg` para poder graficar en una sola unidad.
 */
export async function getExerciseProgress(
  exerciseId: string,
): Promise<ExerciseProgressPoint[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_exercises")
    .select(
      `
      workouts!inner ( date ),
      exercise_sets ( reps, weight, unit )
    `,
    )
    .eq("exercise_id", exerciseId)
    .order("date", { referencedTable: "workouts", ascending: true });

  if (error) throw error;

  // Sin tipos generados de Supabase, el cliente infiere la relación
  // `workouts` (many-to-one vía !inner) como array; en realidad es un objeto.
  const rows = data as unknown as Array<{
    workouts: { date: string };
    exercise_sets: { reps: number; weight: number; unit: "kg" | "lb" }[];
  }>;

  const byDate = new Map<
    string,
    { maxWeightKg: number; volumeKg: number; estimated1RmKg: number }
  >();

  for (const row of rows) {
    const date = row.workouts.date;
    const existing =
      byDate.get(date) ?? { maxWeightKg: 0, volumeKg: 0, estimated1RmKg: 0 };

    for (const set of row.exercise_sets) {
      const weightKg = set.unit === "lb" ? set.weight * 0.453592 : set.weight;
      const epley1Rm = weightKg * (1 + set.reps / 30); // fórmula de Epley
      existing.maxWeightKg = Math.max(existing.maxWeightKg, weightKg);
      existing.volumeKg += weightKg * set.reps;
      existing.estimated1RmKg = Math.max(existing.estimated1RmKg, epley1Rm);
    }

    byDate.set(date, existing);
  }

  return Array.from(byDate.entries())
    .map(([date, { maxWeightKg, volumeKg, estimated1RmKg }]) => ({
      date,
      maxWeightKg: Math.round(maxWeightKg * 100) / 100,
      volumeKg: Math.round(volumeKg * 100) / 100,
      estimated1RmKg: Math.round(estimated1RmKg * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getCardioProgress(
  exerciseId: string,
): Promise<CardioProgressPoint[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_exercises")
    .select(
      `
      duration_seconds,
      workouts!inner ( date )
    `,
    )
    .eq("exercise_id", exerciseId)
    .not("duration_seconds", "is", null)
    .order("date", { referencedTable: "workouts", ascending: true });

  if (error) throw error;

  const rows = data as unknown as Array<{
    duration_seconds: number | null;
    workouts: { date: string };
  }>;

  return rows
    .filter((row): row is typeof row & { duration_seconds: number } => row.duration_seconds !== null)
    .map((row) => ({ date: row.workouts.date, durationSeconds: row.duration_seconds }));
}

// ---------------------------------------------------------------------------
// Dashboard de analítica (/progress, pestaña "Resumen")
// ---------------------------------------------------------------------------

const LB_TO_KG = 0.453592; // igual que en getExerciseProgress/getCardioProgress
const round2 = (value: number) => Math.round(value * 100) / 100;
const weightToKg = (weight: number, unit: WeightUnit) => (unit === "lb" ? weight * LB_TO_KG : weight);
const epley = (kg: number, reps: number) => kg * (1 + reps / 30); // fórmula de Epley

/**
 * Fecha local del servidor en formato YYYY-MM-DD. Mismo cálculo que
 * `todayIsoDate()` en `workouts/actions.ts` — no se comparte porque uno vive
 * en el DAL y el otro en Server Actions.
 */
function todayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

function isoToUtcDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** `iso` desplazada `days` días (negativo = hacia atrás). Aritmética en UTC
 * puro para que el cálculo de semanas no dependa de zona horaria/DST. */
function shiftDays(iso: string, days: number): string {
  const date = isoToUtcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Lunes de la semana que contiene `iso`. */
function weekStart(iso: string): string {
  const date = isoToUtcDate(iso);
  const day = date.getUTCDay(); // 0 = domingo
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return shiftDays(iso, diffToMonday);
}

/**
 * % de cambio de `previous` a `current`. `null` si algún lado no tiene dato
 * o si `previous` es 0 (no hay base con qué comparar) — nunca se devuelve
 * `0%` ni `Infinity` por una división entre cero.
 */
function deltaOf(current: number | null, previous: number | null): Delta {
  if (current === null || previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

type DashboardSetRow = {
  workout_id: string;
  exercise_id: string;
  workouts: { id: string; date: string };
  exercise: {
    id: string;
    name: string;
    name_en: string | null;
    kind: ExerciseKind;
    muscle_group: MuscleGroup | null;
  };
  sets: { reps: number; weight: number; unit: WeightUnit; rir: number | null; set_number: number }[];
};

type DashboardWorkoutRow = {
  id: string;
  date: string;
  started_at: string | null;
  ended_at: string | null;
};

/**
 * Totales de un periodo: tonelaje, series, reps, frecuencia, RIR y duración
 * de sesión. La frecuencia solo cuenta workouts con al menos un ejercicio
 * (presentes en `rows`), para que un "Entrenar hoy" creado y abandonado sin
 * agregar nada no la infle.
 */
function computeTotals(
  rows: DashboardSetRow[],
  workouts: DashboardWorkoutRow[],
  weeksInPeriod: number,
): PeriodTotals {
  const activeWorkoutIds = new Set(rows.map((r) => r.workout_id));

  let tonnageKg = 0;
  let sets = 0;
  let reps = 0;
  let rirSum = 0;
  let rirCount = 0;

  for (const row of rows) {
    for (const set of row.sets) {
      const kg = weightToKg(set.weight, set.unit);
      tonnageKg += kg * set.reps;
      sets += 1;
      reps += set.reps;
      if (set.rir !== null) {
        rirSum += set.rir;
        rirCount += 1;
      }
    }
  }

  const activeDates = new Set(workouts.filter((w) => activeWorkoutIds.has(w.id)).map((w) => w.date));
  const timedWorkouts = workouts.filter(
    (w) => activeWorkoutIds.has(w.id) && w.started_at && w.ended_at,
  );
  const sessionMinutes = timedWorkouts.map(
    (w) => (new Date(w.ended_at!).getTime() - new Date(w.started_at!).getTime()) / 60_000,
  );

  return {
    tonnageKg: round2(tonnageKg),
    sets,
    reps,
    workouts: activeWorkoutIds.size,
    avgRepsPerSet: sets > 0 ? round2(reps / sets) : 0,
    avgRir: rirCount > 0 ? round2(rirSum / rirCount) : null,
    rirCoverage: sets > 0 ? round2(rirCount / sets) : 0,
    avgSessionMinutes:
      sessionMinutes.length > 0
        ? Math.round(sessionMinutes.reduce((sum, m) => sum + m, 0) / sessionMinutes.length)
        : null,
    timedSessions: timedWorkouts.length,
    workoutsPerWeek: round2(activeWorkoutIds.size / weeksInPeriod),
    weeksTrained: new Set([...activeDates].map(weekStart)).size,
  };
}

type GroupAgg = { sets: number; tonnageKg: number; workoutIds: Set<string> };
type ExerciseAgg = { muscleGroup: MuscleGroup; tonnageKg: number; bestE1rmKg: number };

/**
 * Agrupa las series por grupo muscular y por ejercicio. Los ejercicios de
 * cardio (sin series, solo `duration_seconds`) solo suman a `workoutIds` del
 * grupo — cuentan para frecuencia, no para tonelaje ni fuerza.
 */
function aggregateByMuscleGroup(rows: DashboardSetRow[]) {
  const byGroup = new Map<MuscleGroup, GroupAgg>();
  const byExercise = new Map<string, ExerciseAgg>();

  for (const row of rows) {
    const group = row.exercise.muscle_group;
    if (!group) continue;

    const groupEntry = byGroup.get(group) ?? { sets: 0, tonnageKg: 0, workoutIds: new Set<string>() };
    groupEntry.workoutIds.add(row.workout_id);
    byGroup.set(group, groupEntry);

    if (row.sets.length === 0) continue;

    const exEntry = byExercise.get(row.exercise_id) ?? {
      muscleGroup: group,
      tonnageKg: 0,
      bestE1rmKg: 0,
    };

    for (const set of row.sets) {
      const kg = weightToKg(set.weight, set.unit);
      const tonnage = kg * set.reps;
      groupEntry.sets += 1;
      groupEntry.tonnageKg += tonnage;
      exEntry.tonnageKg += tonnage;
      exEntry.bestE1rmKg = Math.max(exEntry.bestE1rmKg, epley(kg, set.reps));
    }

    byExercise.set(row.exercise_id, exEntry);
  }

  return { byGroup, byExercise };
}

/**
 * Dashboard de analítica: totales del periodo actual y el anterior (mismo
 * largo), desglose por grupo muscular, récords personales y serie semanal.
 * Tres queries: series de la ventana + workouts de la ventana en paralelo,
 * y el historial previo (baseline de PRs) que depende de qué se entrenó en
 * el periodo actual. Sin RPC: ver la nota de diseño en el plan — los
 * volúmenes de datos de un tracker personal no lo justifican todavía.
 */
export async function getDashboard(range: DashboardRange = 12): Promise<DashboardData> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const periodEnd = todayIso();
  const periodStart = shiftDays(weekStart(periodEnd), -7 * (range - 1));
  const previousEnd = shiftDays(periodStart, -1);
  const previousStart = shiftDays(periodStart, -7 * range);

  // Q1 + Q2 en paralelo: series de toda la ventana (actual + anterior) y los
  // workouts de esa misma ventana (para frecuencia y duración de sesión).
  const [setsResult, workoutsResult] = await Promise.all([
    supabase
      .from("workout_exercises")
      .select(
        `
        workout_id, exercise_id,
        workouts!inner ( id, date, user_id ),
        exercise:exercises!inner ( id, name, name_en, kind, muscle_group ),
        sets:exercise_sets ( reps, weight, unit, rir, set_number )
      `,
      )
      .eq("workouts.user_id", userId)
      .gte("workouts.date", previousStart)
      .lte("workouts.date", periodEnd),
    supabase
      .from("workouts")
      .select("id, date, started_at, ended_at")
      .eq("user_id", userId)
      .gte("date", previousStart)
      .lte("date", periodEnd),
  ]);

  if (setsResult.error) throw setsResult.error;
  if (workoutsResult.error) throw workoutsResult.error;

  // Sin tipos generados de Supabase, el cliente infiere `workouts` y
  // `exercise` (many-to-one vía !inner) como arrays; en realidad son
  // objetos. Mismo cast que en getExerciseProgress/getLoggedExercises.
  const rows = setsResult.data as unknown as DashboardSetRow[];
  const workouts = workoutsResult.data as DashboardWorkoutRow[];

  const currentRows = rows.filter((r) => r.workouts.date >= periodStart);
  const previousRows = rows.filter((r) => r.workouts.date < periodStart);
  const currentWorkouts = workouts.filter((w) => w.date >= periodStart);
  const previousWorkouts = workouts.filter((w) => w.date < periodStart);

  const current = computeTotals(currentRows, currentWorkouts, range);
  const previous = computeTotals(previousRows, previousWorkouts, range);

  const deltas: PeriodDeltas = {
    tonnageKg: deltaOf(current.tonnageKg, previous.tonnageKg),
    sets: deltaOf(current.sets, previous.sets),
    reps: deltaOf(current.reps, previous.reps),
    workouts: deltaOf(current.workouts, previous.workouts),
    avgRepsPerSet: deltaOf(current.avgRepsPerSet, previous.avgRepsPerSet),
    avgRir: deltaOf(current.avgRir, previous.avgRir),
    avgSessionMinutes: deltaOf(current.avgSessionMinutes, previous.avgSessionMinutes),
    workoutsPerWeek: deltaOf(current.workoutsPerWeek, previous.workoutsPerWeek),
  };

  // -------------------------------------------------------------------
  // Desglose por grupo muscular
  // -------------------------------------------------------------------
  const currentAgg = aggregateByMuscleGroup(currentRows);
  const previousAgg = aggregateByMuscleGroup(previousRows);
  const allGroups = new Set<MuscleGroup>([...currentAgg.byGroup.keys(), ...previousAgg.byGroup.keys()]);

  const muscleGroups: MuscleGroupStat[] = [];
  for (const group of allGroups) {
    const cur = currentAgg.byGroup.get(group);
    const prev = previousAgg.byGroup.get(group);
    const curSets = cur?.sets ?? 0;
    const curSessions = cur?.workoutIds.size ?? 0;
    const prevSets = prev?.sets ?? 0;
    const prevSessions = prev?.workoutIds.size ?? 0;

    // Sin ninguna actividad (ni series ni sesiones) en ningún periodo: no
    // vale la pena mostrar la card. El cardio se conserva aunque no tenga
    // series propias, porque sus sesiones sí cuentan para frecuencia.
    if (curSets === 0 && curSessions === 0 && prevSets === 0 && prevSessions === 0) continue;

    const curTonnage = cur?.tonnageKg ?? 0;
    const prevTonnage = prev?.tonnageKg ?? 0;

    let bestE1rmKg: number | null = null;
    for (const agg of currentAgg.byExercise.values()) {
      if (agg.muscleGroup !== group) continue;
      bestE1rmKg = bestE1rmKg === null ? agg.bestE1rmKg : Math.max(bestE1rmKg, agg.bestE1rmKg);
    }

    // Delta de fuerza: media ponderada por tonelaje de los deltas de e1RM
    // por ejercicio, solo entre ejercicios presentes en ambos periodos. Un
    // simple "máximo actual vs máximo anterior" oscilaría según qué
    // ejercicio tocó hacer, no según si el usuario se hizo más fuerte.
    let weightedDeltaSum = 0;
    let weightTotal = 0;
    for (const [exerciseId, curExAgg] of currentAgg.byExercise) {
      if (curExAgg.muscleGroup !== group) continue;
      const prevExAgg = previousAgg.byExercise.get(exerciseId);
      if (!prevExAgg || prevExAgg.bestE1rmKg === 0) continue;
      const exerciseDelta = ((curExAgg.bestE1rmKg - prevExAgg.bestE1rmKg) / prevExAgg.bestE1rmKg) * 100;
      weightedDeltaSum += exerciseDelta * curExAgg.tonnageKg;
      weightTotal += curExAgg.tonnageKg;
    }
    const strengthDelta: Delta =
      weightTotal > 0 ? Math.round((weightedDeltaSum / weightTotal) * 10) / 10 : null;

    muscleGroups.push({
      group,
      sets: curSets,
      tonnageKg: round2(curTonnage),
      sessions: curSessions,
      sessionsPerWeek: round2(curSessions / range),
      bestE1rmKg: bestE1rmKg === null ? null : round2(bestE1rmKg),
      volumeDelta: deltaOf(curTonnage, prevTonnage),
      strengthDelta,
      frequencyDelta: deltaOf(curSessions, prevSessions),
    });
  }
  muscleGroups.sort((a, b) => b.tonnageKg - a.tonnageKg);

  // -------------------------------------------------------------------
  // Récords personales: series del periodo actual que superan todo lo
  // registrado antes. El baseline (Q3) solo pide el historial de los
  // ejercicios de fuerza realmente entrenados en el periodo actual — no
  // todo el catálogo — y se omite por completo si no hubo ninguno.
  // -------------------------------------------------------------------
  const currentExerciseIds = [
    ...new Set(currentRows.filter((r) => r.exercise.kind === "strength").map((r) => r.exercise_id)),
  ];

  const baseline = new Map<string, { e1rmKg: number; weightKg: number }>();
  if (currentExerciseIds.length > 0) {
    const { data: baselineData, error: baselineError } = await supabase
      .from("workout_exercises")
      .select(
        `
        exercise_id,
        workouts!inner ( date, user_id ),
        exercise_sets ( reps, weight, unit )
      `,
      )
      .eq("workouts.user_id", userId)
      .in("exercise_id", currentExerciseIds)
      .lt("workouts.date", periodStart);

    if (baselineError) throw baselineError;

    const baselineRows = baselineData as unknown as Array<{
      exercise_id: string;
      exercise_sets: { reps: number; weight: number; unit: WeightUnit }[];
    }>;

    for (const row of baselineRows) {
      for (const set of row.exercise_sets) {
        const kg = weightToKg(set.weight, set.unit);
        const e1rm = epley(kg, set.reps);
        const entry = baseline.get(row.exercise_id) ?? { e1rmKg: 0, weightKg: 0 };
        entry.e1rmKg = Math.max(entry.e1rmKg, e1rm);
        entry.weightKg = Math.max(entry.weightKg, kg);
        baseline.set(row.exercise_id, entry);
      }
    }
  }

  // Series del periodo actual en orden cronológico: compiten entre sí, no
  // solo contra el historial previo — un PR de la sesión 3 no debe quedar
  // oculto por el de la sesión 1. `previousE1rmKg` queda como la marca real
  // justo antes del PR, no como el máximo de todo el historial.
  const flatCurrentSets = currentRows
    .filter((r) => r.exercise.kind === "strength")
    .flatMap((row) =>
      row.sets.map((set) => ({
        exerciseId: row.exercise_id,
        name: row.exercise.name,
        nameEn: row.exercise.name_en,
        muscleGroup: row.exercise.muscle_group,
        date: row.workouts.date,
        reps: set.reps,
        weightKg: weightToKg(set.weight, set.unit),
        setNumber: set.set_number,
      })),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.setNumber - b.setNumber);

  const prEvents = new Map<string, PersonalRecord>();
  for (const set of flatCurrentSets) {
    const e1rmKg = epley(set.weightKg, set.reps);
    const prev = baseline.get(set.exerciseId);
    const isE1rmPr = !prev || e1rmKg > prev.e1rmKg;
    const isWeightPr = !prev || set.weightKg > prev.weightKg;

    if (isE1rmPr || isWeightPr) {
      prEvents.set(set.exerciseId, {
        exerciseId: set.exerciseId,
        name: set.name,
        nameEn: set.nameEn,
        muscleGroup: set.muscleGroup,
        date: set.date,
        reps: set.reps,
        weightKg: round2(set.weightKg),
        e1rmKg: round2(e1rmKg),
        previousE1rmKg: prev ? round2(prev.e1rmKg) : null,
        kind: isE1rmPr && isWeightPr ? "both" : isE1rmPr ? "e1rm" : "weight",
      });
    }

    baseline.set(set.exerciseId, {
      e1rmKg: Math.max(prev?.e1rmKg ?? 0, e1rmKg),
      weightKg: Math.max(prev?.weightKg ?? 0, set.weightKg),
    });
  }

  const records = Array.from(prEvents.values()).sort((a, b) => b.date.localeCompare(a.date));

  // -------------------------------------------------------------------
  // Serie semanal: buckets alineados a lunes, `range` semanas exactas —
  // las semanas sin actividad quedan en cero, no se omiten.
  // -------------------------------------------------------------------
  const weeklyMap = new Map<string, { tonnageKg: number; sets: number; workoutIds: Set<string> }>();
  for (let i = 0; i < range; i++) {
    weeklyMap.set(shiftDays(periodStart, i * 7), { tonnageKg: 0, sets: 0, workoutIds: new Set() });
  }
  for (const row of currentRows) {
    const bucket = weeklyMap.get(weekStart(row.workouts.date));
    if (!bucket) continue;
    bucket.workoutIds.add(row.workout_id);
    for (const set of row.sets) {
      bucket.tonnageKg += weightToKg(set.weight, set.unit) * set.reps;
      bucket.sets += 1;
    }
  }
  const weekly: WeeklyPoint[] = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStartDate, bucket]) => ({
      weekStart: weekStartDate,
      tonnageKg: round2(bucket.tonnageKg),
      sets: bucket.sets,
      workouts: bucket.workoutIds.size,
    }));

  return {
    range,
    periodStart,
    periodEnd,
    previousStart,
    previousEnd,
    current,
    previous,
    deltas,
    muscleGroups,
    records,
    weekly,
    hasData: current.workouts > 0,
  };
}
