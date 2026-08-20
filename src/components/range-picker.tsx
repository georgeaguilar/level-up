import { getDictionary } from "@/i18n/server";
import { DASHBOARD_RANGES, progressHref, type ProgressParams } from "@/lib/progress-params";
import { SegmentedGroup, SegmentedLink } from "@/components/ui/segmented";

const RANGE_LABEL_KEYS = {
  4: "analytics.range.w4",
  12: "analytics.range.w12",
  52: "analytics.range.w52",
} as const;

/** Selector 4/12/52 semanas del dashboard. Solo aparece en la pestaña Resumen. */
export async function RangePicker({ params }: { params: ProgressParams }) {
  const { t } = await getDictionary();

  return (
    <SegmentedGroup>
      {DASHBOARD_RANGES.map((range) => (
        <SegmentedLink key={range} href={progressHref(params, { range })} active={params.range === range}>
          {t(RANGE_LABEL_KEYS[range])}
        </SegmentedLink>
      ))}
    </SegmentedGroup>
  );
}
