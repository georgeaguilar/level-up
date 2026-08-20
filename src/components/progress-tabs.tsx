import Link from "next/link";
import { getDictionary } from "@/i18n/server";
import { progressHref, type ProgressParams, type ProgressTab } from "@/lib/progress-params";

const TABS: { key: ProgressTab; labelKey: "analytics.tab.summary" | "analytics.tab.byExercise" }[] = [
  { key: "resumen", labelKey: "analytics.tab.summary" },
  { key: "ejercicio", labelKey: "analytics.tab.byExercise" },
];

/** Pestañas de /progress: Resumen (dashboard) y Por ejercicio (gráfica individual). */
export async function ProgressTabs({ params }: { params: ProgressParams }) {
  const { t } = await getDictionary();

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = params.tab === tab.key;
        return (
          <Link
            key={tab.key}
            href={progressHref(params, { tab: tab.key })}
            aria-current={isActive ? "page" : undefined}
            className={`border px-3 py-1 text-xs font-medium tracking-wide uppercase transition-colors ${
              isActive
                ? "border-chalk bg-chalk text-floor"
                : "border-iron text-chalk-dim hover:border-iron-bright"
            }`}
          >
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
