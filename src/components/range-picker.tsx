import Link from "next/link";
import { getDictionary } from "@/i18n/server";
import { DASHBOARD_RANGES, progressHref, type ProgressParams } from "@/lib/progress-params";

const RANGE_LABEL_KEYS = {
  4: "analytics.range.w4",
  12: "analytics.range.w12",
  52: "analytics.range.w52",
} as const;

/** Selector 4/12/52 semanas del dashboard. Solo aparece en la pestaña Resumen. */
export async function RangePicker({ params }: { params: ProgressParams }) {
  const { t } = await getDictionary();

  return (
    <div className="flex flex-wrap gap-2">
      {DASHBOARD_RANGES.map((range) => {
        const isActive = params.range === range;
        return (
          <Link
            key={range}
            href={progressHref(params, { range })}
            aria-current={isActive ? "page" : undefined}
            className={`border px-3 py-1 text-xs font-medium tracking-wide uppercase transition-colors ${
              isActive
                ? "border-chalk bg-chalk text-floor"
                : "border-iron text-chalk-dim hover:border-iron-bright"
            }`}
          >
            {t(RANGE_LABEL_KEYS[range])}
          </Link>
        );
      })}
    </div>
  );
}
