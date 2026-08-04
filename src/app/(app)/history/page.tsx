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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Historial</h1>

      {workouts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Todavía no registras ningún entrenamiento.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {workouts.map((workout) => (
            <li key={workout.id}>
              <Link
                href={`/workouts/${workout.id}`}
                className="block rounded-md border border-zinc-200 px-4 py-3 capitalize hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
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
