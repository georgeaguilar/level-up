import type { CSSProperties } from "react";
import Link from "next/link";
import { getRoutineTemplates } from "@/lib/dal";
import { createTemplate } from "@/app/(app)/templates/actions";
import { getDictionary } from "@/i18n/server";
import { exerciseName } from "@/lib/exercise-display";
import { Card, cardClasses } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export default async function TemplatesPage() {
  const [templates, { locale, t }] = await Promise.all([getRoutineTemplates(), getDictionary()]);

  return (
    <div className="enter flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide">{t("templates.title")}</h1>

      <Card className="flex flex-col gap-2">
        <h2 className="text-label text-chalk-dim">{t("templates.newHeading")}</h2>
        <form action={createTemplate} className="flex gap-2">
          <Input
            type="text"
            name="name"
            placeholder={t("templates.namePlaceholder")}
            required
            maxLength={60}
            className="min-w-0 flex-1"
          />
          <Button type="submit" size="sm" className="shrink-0">
            {t("templates.create")}
          </Button>
        </form>
      </Card>

      {templates.length === 0 ? (
        <p className="text-sm text-chalk-dim">{t("templates.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {templates.map((template, index) => {
            const items = [...template.routine_template_exercises].sort(
              (a, b) => a.position - b.position,
            );
            return (
              <li
                key={template.id}
                className="stagger-item"
                style={{ "--stagger-index": index } as CSSProperties}
              >
                <Link
                  href={`/templates/${template.id}`}
                  className={cn(cardClasses({ variant: "interactive", padding: "md" }), "block")}
                >
                  <span className="block truncate text-chalk">{template.name}</span>
                  <span className="block truncate text-xs text-chalk-dim">
                    {items.length === 0
                      ? t("templates.noExercises")
                      : items.map((item) => exerciseName(item.exercise, locale)).join(" · ")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
