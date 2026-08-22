import Link from "next/link";
import type { RoutineTemplateWithExercises } from "@/lib/types";
import { applyTemplateToWorkout, saveWorkoutAsTemplate } from "@/app/(app)/templates/actions";
import { getDictionary } from "@/i18n/server";
import { exerciseName } from "@/lib/exercise-display";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type WorkoutTemplatesProps = {
  workoutId: string;
  templates: RoutineTemplateWithExercises[];
  /** Solo se ofrece "Guardar como plantilla" si ya hay algo que guardar. */
  canSave: boolean;
};

/**
 * Bloque para aplicar una plantilla al entrenamiento del día (añade sus
 * ejercicios al final, sin tocar lo que ya hubiera) y, si el entrenamiento ya
 * tiene ejercicios, para guardarlo como una plantilla nueva. Sin estado de
 * cliente — server component, igual que `ExercisePicker` es el único con
 * interactividad real.
 */
export async function WorkoutTemplates({ workoutId, templates, canSave }: WorkoutTemplatesProps) {
  const { locale, t } = await getDictionary();

  return (
    <Card className="flex flex-col gap-3 rounded-lg">
      <h3 className="text-label text-chalk-dim">{t("workoutTemplates.heading")}</h3>

      {templates.length === 0 ? (
        <p className="text-sm text-chalk-dim">
          {t("workoutTemplates.empty")}{" "}
          <Link href="/templates" className="text-chalk underline underline-offset-2">
            {t("workoutTemplates.manageLink")}
          </Link>
        </p>
      ) : (
        <form action={applyTemplateToWorkout}>
          <input type="hidden" name="workoutId" value={workoutId} />
          <div className="flex flex-col overflow-hidden rounded-sm border border-iron">
            {templates.map((template) => {
              const items = [...template.routine_template_exercises].sort(
                (a, b) => a.position - b.position,
              );
              return (
                <button
                  key={template.id}
                  type="submit"
                  name="templateId"
                  value={template.id}
                  className="flex w-full cursor-pointer items-center gap-3 border-b border-iron px-3 py-2.5 text-left transition-colors duration-fast ease-brand last:border-b-0 hover:bg-surface-raised active:bg-surface-raised"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-chalk">{template.name}</span>
                    <span className="block truncate text-xs text-chalk-dim">
                      {items.map((item) => exerciseName(item.exercise, locale)).join(" · ")}
                    </span>
                  </span>
                  <span className="text-label shrink-0 text-chalk-dim">
                    {items.length === 1
                      ? t("templates.exerciseCountOne")
                      : t("templates.exerciseCount", { count: items.length })}
                  </span>
                </button>
              );
            })}
          </div>
        </form>
      )}

      {canSave && (
        <details className="text-sm">
          <summary className="cursor-pointer text-chalk-dim hover:text-chalk">
            {t("workoutTemplates.saveAsTemplate")}
          </summary>
          <form action={saveWorkoutAsTemplate} className="mt-3 flex gap-2">
            <input type="hidden" name="workoutId" value={workoutId} />
            <Input
              type="text"
              name="name"
              placeholder={t("templates.namePlaceholder")}
              required
              maxLength={60}
              className="min-w-0 flex-1"
            />
            <Button type="submit" variant="secondary" size="sm" className="shrink-0">
              {t("workoutTemplates.saveButton")}
            </Button>
          </form>
        </details>
      )}
    </Card>
  );
}
