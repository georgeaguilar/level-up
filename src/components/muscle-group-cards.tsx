import { DeltaBadge } from "@/components/delta-badge";
import { getDictionary } from "@/i18n/server";
import { formatNumber } from "@/i18n/format";
import type { MuscleGroupStat } from "@/lib/types";

type MuscleGroupCardsProps = {
  groups: MuscleGroupStat[];
};

/** Una card por grupo muscular: volumen, fuerza y frecuencia, cada uno con
 * su delta vs. el periodo anterior. */
export async function MuscleGroupCards({ groups }: MuscleGroupCardsProps) {
  const { locale, t } = await getDictionary();

  if (groups.length === 0) {
    return <p className="text-sm text-chalk-dim">{t("analytics.muscle.empty")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.group} className="flex flex-col gap-2 border border-iron bg-surface p-3">
          <span className="font-display text-sm tracking-wide text-chalk uppercase">
            {t(`muscleGroup.${group.group}`)}
          </span>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-chalk-dim">{t("analytics.muscle.volume")}</dt>
              <dd className="flex items-center gap-2 font-mono text-chalk">
                {formatNumber(group.tonnageKg, locale)} {t("analytics.units.kg")}
                <DeltaBadge value={group.volumeDelta} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-chalk-dim">{t("analytics.muscle.strength")}</dt>
              <dd className="flex items-center gap-2 font-mono text-chalk">
                {group.bestE1rmKg !== null
                  ? `${formatNumber(group.bestE1rmKg, locale)} ${t("analytics.units.kg")}`
                  : "—"}
                <DeltaBadge value={group.strengthDelta} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-chalk-dim">{t("analytics.muscle.frequency")}</dt>
              <dd className="flex items-center gap-2 font-mono text-chalk">
                {t("analytics.units.perWeek", { count: group.sessionsPerWeek })}
                <DeltaBadge value={group.frequencyDelta} />
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
