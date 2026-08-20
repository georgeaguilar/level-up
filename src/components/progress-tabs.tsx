import { getDictionary } from "@/i18n/server";
import { progressHref, type ProgressParams, type ProgressTab } from "@/lib/progress-params";
import { SegmentedGroup, SegmentedLink } from "@/components/ui/segmented";

const TABS: { key: ProgressTab; labelKey: "analytics.tab.summary" | "analytics.tab.byExercise" }[] = [
  { key: "resumen", labelKey: "analytics.tab.summary" },
  { key: "ejercicio", labelKey: "analytics.tab.byExercise" },
];

/** Pestañas de /progress: Resumen (dashboard) y Por ejercicio (gráfica individual). */
export async function ProgressTabs({ params }: { params: ProgressParams }) {
  const { t } = await getDictionary();

  return (
    <SegmentedGroup>
      {TABS.map((tab) => (
        <SegmentedLink key={tab.key} href={progressHref(params, { tab: tab.key })} active={params.tab === tab.key}>
          {t(tab.labelKey)}
        </SegmentedLink>
      ))}
    </SegmentedGroup>
  );
}
