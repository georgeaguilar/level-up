"use client";

import { useMemo, useState } from "react";
import type { Equipment, Exercise, MuscleGroup } from "@/lib/types";
import { addExerciseToWorkout, createCustomExercise } from "@/app/(app)/workouts/actions";
import { useI18n } from "@/i18n/client";
import {
  EQUIPMENT_OPTIONS,
  MUSCLE_GROUPS,
  exerciseName,
  matchesQuery,
  sortExercises,
} from "@/lib/exercise-display";
import { EquipmentIcon } from "@/components/equipment-icon";

type ExercisePickerProps = {
  workoutId: string;
  exercises: Exercise[];
};

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-2.5 py-1 text-xs font-medium tracking-wide uppercase transition-colors ${
        active
          ? "border-chalk bg-chalk text-floor"
          : "border-iron text-chalk-dim hover:border-iron-bright"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Selector de ejercicio del catálogo (global + propios): busca por nombre en
 * ambos idiomas y filtra por grupo muscular/equipo. Client component — con
 * ~250 ejercicios un <select> nativo con dos <optgroup> deja de ser usable.
 */
export function ExercisePicker({ workoutId, exercises }: ExercisePickerProps) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);

  const sorted = useMemo(() => sortExercises(exercises, locale), [exercises, locale]);

  const availableMuscleGroups = useMemo(
    () => MUSCLE_GROUPS.filter((mg) => exercises.some((e) => e.muscle_group === mg)),
    [exercises],
  );
  const availableEquipment = useMemo(
    () => EQUIPMENT_OPTIONS.filter((eq) => exercises.some((e) => e.equipment === eq)),
    [exercises],
  );

  const filtered = sorted.filter((exercise) => {
    if (muscleGroup && exercise.muscle_group !== muscleGroup) return false;
    if (equipment && exercise.equipment !== equipment) return false;
    return matchesQuery(exercise, query);
  });

  return (
    <div className="flex flex-col gap-3 border border-iron bg-surface p-4">
      <h3 className="font-display text-sm tracking-[0.2em] text-chalk-dim uppercase">
        {t("exercisePicker.heading")}
      </h3>

      <form action={addExerciseToWorkout} className="flex flex-col gap-3">
        <input type="hidden" name="workoutId" value={workoutId} />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            // Enter no debe enviar el form sin un exerciseId elegido.
            if (event.key === "Enter") event.preventDefault();
          }}
          placeholder={t("exercisePicker.searchPlaceholder")}
          className="border border-iron bg-floor px-3 py-2 text-base text-chalk placeholder:text-chalk-dim"
        />

        {availableMuscleGroups.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={muscleGroup === null}
              label={t("exercisePicker.allMuscles")}
              onClick={() => setMuscleGroup(null)}
            />
            {availableMuscleGroups.map((mg) => (
              <FilterChip
                key={mg}
                active={muscleGroup === mg}
                label={t(`muscleGroup.${mg}`)}
                onClick={() => setMuscleGroup((current) => (current === mg ? null : mg))}
              />
            ))}
          </div>
        )}

        {availableEquipment.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={equipment === null}
              label={t("exercisePicker.allEquipment")}
              onClick={() => setEquipment(null)}
            />
            {availableEquipment.map((eq) => (
              <FilterChip
                key={eq}
                active={equipment === eq}
                label={t(`equipment.${eq}`)}
                onClick={() => setEquipment((current) => (current === eq ? null : eq))}
              />
            ))}
          </div>
        )}

        <div className="flex max-h-64 flex-col overflow-y-auto border border-iron">
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-chalk-dim">{t("exercisePicker.noResults")}</p>
          ) : (
            filtered.map((exercise) => (
              <button
                key={exercise.id}
                type="submit"
                name="exerciseId"
                value={exercise.id}
                className="flex w-full items-center gap-3 border-b border-iron px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-floor active:bg-floor"
              >
                <EquipmentIcon
                  equipment={exercise.equipment}
                  className={`shrink-0 ${exercise.kind === "strength" ? "text-plate-red" : "text-plate-blue"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-chalk">
                    {exerciseName(exercise, locale)}
                  </span>
                  <span className="block truncate text-xs text-chalk-dim">
                    {[
                      exercise.muscle_group ? t(`muscleGroup.${exercise.muscle_group}`) : null,
                      exercise.equipment ? t(`equipment.${exercise.equipment}`) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </form>

      <details className="text-sm">
        <summary className="cursor-pointer text-chalk-dim hover:text-chalk">
          {t("exercisePicker.notInList")}
        </summary>
        <form action={createCustomExercise} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="workoutId" value={workoutId} />
          <input
            type="text"
            name="name"
            placeholder={t("exercisePicker.namePlaceholder")}
            required
            maxLength={80}
            className="border border-iron bg-floor px-3 py-2 text-base text-chalk placeholder:text-chalk-dim"
          />
          <div className="flex gap-2">
            <select
              name="kind"
              defaultValue="strength"
              className="min-w-0 flex-1 border border-iron bg-floor px-3 py-2 text-base text-chalk"
            >
              <option value="strength">{t("exerciseKind.strength")}</option>
              <option value="cardio">{t("exerciseKind.cardio")}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              name="muscleGroup"
              defaultValue=""
              className="min-w-0 flex-1 border border-iron bg-floor px-3 py-2 text-base text-chalk"
            >
              <option value="">{t("exercisePicker.muscleGroupOptional")}</option>
              {MUSCLE_GROUPS.map((mg) => (
                <option key={mg} value={mg}>
                  {t(`muscleGroup.${mg}`)}
                </option>
              ))}
            </select>
            <select
              name="equipment"
              defaultValue=""
              className="min-w-0 flex-1 border border-iron bg-floor px-3 py-2 text-base text-chalk"
            >
              <option value="">{t("exercisePicker.equipmentOptional")}</option>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq} value={eq}>
                  {t(`equipment.${eq}`)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="shrink-0 border border-iron-bright px-4 py-2 text-sm font-medium text-chalk hover:border-chalk-dim"
          >
            {t("exercisePicker.createAndAdd")}
          </button>
        </form>
      </details>
    </div>
  );
}
