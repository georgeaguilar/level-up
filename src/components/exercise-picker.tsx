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
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentedButton, SegmentedGroup } from "@/components/ui/segmented";

type ExercisePickerProps = {
  workoutId: string;
  exercises: Exercise[];
};

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
    <Card className="flex flex-col gap-3 rounded-lg">
      <h3 className="text-label text-chalk-dim">{t("exercisePicker.heading")}</h3>

      <form action={addExerciseToWorkout} className="flex flex-col gap-3">
        <input type="hidden" name="workoutId" value={workoutId} />

        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            // Enter no debe enviar el form sin un exerciseId elegido.
            if (event.key === "Enter") event.preventDefault();
          }}
          placeholder={t("exercisePicker.searchPlaceholder")}
        />

        {availableMuscleGroups.length > 0 && (
          <SegmentedGroup className="gap-1.5">
            <SegmentedButton active={muscleGroup === null} onClick={() => setMuscleGroup(null)}>
              {t("exercisePicker.allMuscles")}
            </SegmentedButton>
            {availableMuscleGroups.map((mg) => (
              <SegmentedButton
                key={mg}
                active={muscleGroup === mg}
                onClick={() => setMuscleGroup((current) => (current === mg ? null : mg))}
              >
                {t(`muscleGroup.${mg}`)}
              </SegmentedButton>
            ))}
          </SegmentedGroup>
        )}

        {availableEquipment.length > 0 && (
          <SegmentedGroup className="gap-1.5">
            <SegmentedButton active={equipment === null} onClick={() => setEquipment(null)}>
              {t("exercisePicker.allEquipment")}
            </SegmentedButton>
            {availableEquipment.map((eq) => (
              <SegmentedButton
                key={eq}
                active={equipment === eq}
                onClick={() => setEquipment((current) => (current === eq ? null : eq))}
              >
                {t(`equipment.${eq}`)}
              </SegmentedButton>
            ))}
          </SegmentedGroup>
        )}

        <div className="flex max-h-64 flex-col overflow-y-auto rounded-sm border border-iron">
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-chalk-dim">{t("exercisePicker.noResults")}</p>
          ) : (
            filtered.map((exercise) => (
              <button
                key={exercise.id}
                type="submit"
                name="exerciseId"
                value={exercise.id}
                className="flex w-full cursor-pointer items-center gap-3 border-b border-iron px-3 py-2.5 text-left transition-colors duration-fast ease-brand last:border-b-0 hover:bg-surface-raised active:bg-surface-raised"
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
          <Input type="text" name="name" placeholder={t("exercisePicker.namePlaceholder")} required maxLength={80} />
          <div className="flex gap-2">
            <Select name="kind" defaultValue="strength" className="min-w-0 flex-1">
              <option value="strength">{t("exerciseKind.strength")}</option>
              <option value="cardio">{t("exerciseKind.cardio")}</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Select name="muscleGroup" defaultValue="" className="min-w-0 flex-1">
              <option value="">{t("exercisePicker.muscleGroupOptional")}</option>
              {MUSCLE_GROUPS.map((mg) => (
                <option key={mg} value={mg}>
                  {t(`muscleGroup.${mg}`)}
                </option>
              ))}
            </Select>
            <Select name="equipment" defaultValue="" className="min-w-0 flex-1">
              <option value="">{t("exercisePicker.equipmentOptional")}</option>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq} value={eq}>
                  {t(`equipment.${eq}`)}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="secondary" size="sm" className="shrink-0">
            {t("exercisePicker.createAndAdd")}
          </Button>
        </form>
      </details>
    </Card>
  );
}
