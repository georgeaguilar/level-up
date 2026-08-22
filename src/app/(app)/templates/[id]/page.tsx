import { notFound } from "next/navigation";
import { getExercises, getRoutineTemplate } from "@/lib/dal";
import {
  deleteTemplate,
  moveTemplateExercise,
  removeTemplateExercise,
  renameTemplate,
} from "@/app/(app)/templates/actions";
import { ExercisePicker } from "@/components/exercise-picker";
import { EquipmentIcon } from "@/components/equipment-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDictionary } from "@/i18n/server";
import { exerciseName } from "@/lib/exercise-display";

export default async function TemplatePage(props: PageProps<"/templates/[id]">) {
  const { id } = await props.params;

  const [template, exercises, { locale, t }] = await Promise.all([
    getRoutineTemplate(id),
    getExercises(),
    getDictionary(),
  ]);

  if (!template) {
    notFound();
  }

  const items = [...template.routine_template_exercises].sort((a, b) => a.position - b.position);

  return (
    <div className="enter flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="min-w-0 flex-1 font-display text-2xl tracking-wide break-words">
          {template.name}
        </h1>
        <form action={deleteTemplate} className="shrink-0">
          <input type="hidden" name="templateId" value={template.id} />
          <Button type="submit" variant="danger">
            {t("templates.delete")}
          </Button>
        </form>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-chalk-dim hover:text-chalk">
          {t("templates.rename")}
        </summary>
        <form action={renameTemplate} className="mt-2 flex gap-2">
          <input type="hidden" name="templateId" value={template.id} />
          <Input
            type="text"
            name="name"
            defaultValue={template.name}
            required
            maxLength={60}
            className="min-w-0 flex-1"
          />
          <Button type="submit" size="sm" variant="secondary" className="shrink-0">
            {t("templates.save")}
          </Button>
        </form>
      </details>

      {items.length === 0 ? (
        <p className="text-sm text-chalk-dim">{t("templates.noExercises")}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-sm border border-iron bg-surface-raised px-3 py-2 text-sm shadow-elev-1"
            >
              <span className="font-mono text-xs text-chalk-dim">{index + 1}</span>
              <EquipmentIcon
                equipment={item.exercise.equipment}
                className={
                  item.exercise.kind === "strength"
                    ? "shrink-0 text-plate-red"
                    : "shrink-0 text-plate-blue"
                }
              />
              <span className="min-w-0 flex-1 truncate text-chalk">
                {exerciseName(item.exercise, locale)}
              </span>
              <form action={moveTemplateExercise} className="flex shrink-0">
                <input type="hidden" name="templateExerciseId" value={item.id} />
                <Button
                  type="submit"
                  name="direction"
                  value="up"
                  variant="ghost"
                  aria-label={t("templates.moveUp")}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  type="submit"
                  name="direction"
                  value="down"
                  variant="ghost"
                  aria-label={t("templates.moveDown")}
                  disabled={index === items.length - 1}
                >
                  ↓
                </Button>
              </form>
              <form action={removeTemplateExercise} className="shrink-0">
                <input type="hidden" name="templateExerciseId" value={item.id} />
                <Button type="submit" variant="danger" aria-label={t("templates.remove")}>
                  ✕
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <ExercisePicker exercises={exercises} target={{ kind: "template", templateId: template.id }} />
    </div>
  );
}
