import { ProgressTabs } from "@/components/progress-tabs";
import { SummaryTab } from "@/app/(app)/progress/summary-tab";
import { ByExerciseTab } from "@/app/(app)/progress/by-exercise-tab";
import { getDictionary } from "@/i18n/server";
import { parseProgressParams } from "@/lib/progress-params";

export default async function ProgressPage(props: PageProps<"/progress">) {
  const searchParams = await props.searchParams;
  const params = parseProgressParams(searchParams);
  const { t } = await getDictionary();

  return (
    <div data-page="wide" className="enter flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide">{t("progress.title")}</h1>
      <ProgressTabs params={params} />
      {/* Solo se renderiza (y hace fetch) la pestaña activa. */}
      {params.tab === "resumen" ? <SummaryTab params={params} /> : <ByExerciseTab params={params} />}
    </div>
  );
}
