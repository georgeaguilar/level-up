import Link from "next/link";
import { getRecentWorkouts } from "@/lib/dal";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const workouts = await getRecentWorkouts(200);

  return (
    <div className="enter flex flex-col gap-4">
      <h1 className="font-display text-2xl tracking-wide">Historial</h1>

      {workouts.length === 0 ? (
        <p className="text-sm text-chalk-dim">
          Todavía no registras ningún entrenamiento.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {workouts.map((workout) => (
            <li key={workout.id}>
              <Link
                href={`/workouts/${workout.id}`}
                className="block border border-iron bg-surface px-4 py-3 capitalize text-chalk transition-colors hover:border-plate-red"
              >
                {formatDate(workout.date)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
