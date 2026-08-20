import { getDictionary } from "@/i18n/server";
import { formatNumber, formatWorkoutDate } from "@/i18n/format";
import type { PersonalRecord } from "@/lib/types";

const round1 = (value: number) => Math.round(value * 10) / 10;

type RecordListProps = {
  records: PersonalRecord[];
};

/** Récords personales del periodo: marca, fecha y ganancia sobre la mejor
 * marca previa (o "primera vez" si el ejercicio no tenía historial). */
export async function RecordList({ records }: RecordListProps) {
  const { locale, t } = await getDictionary();

  if (records.length === 0) {
    return <p className="text-sm text-chalk-dim">{t("analytics.records.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {records.map((record) => {
        const name = locale === "en" && record.nameEn ? record.nameEn : record.name;
        const gainKg =
          record.previousE1rmKg !== null ? round1(record.e1rmKg - record.previousE1rmKg) : null;

        return (
          <li
            key={record.exerciseId}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-sm border border-iron bg-surface-raised px-3 py-2 text-sm shadow-elev-1"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-chalk">{name}</span>
              <span className="text-xs text-chalk-dim">
                {formatWorkoutDate(record.date, locale, "short")}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-chalk">
              <span>
                {record.reps} × {formatNumber(record.weightKg, locale)} kg
              </span>
              {gainKg !== null ? (
                <span className="text-plate-gold">+{formatNumber(gainKg, locale)} kg</span>
              ) : (
                <span className="text-label rounded-full border border-plate-gold px-2 py-0.5 text-plate-gold">
                  {t("analytics.records.first")}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
