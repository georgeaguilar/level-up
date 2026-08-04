import Link from "next/link";
import { getRecentWorkouts } from "@/lib/dal";
import { goToTodayWorkout } from "@/app/(app)/workouts/actions";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function DashboardPage() {
  const workouts = await getRecentWorkouts();

  return (
    <div className="flex flex-col gap-8">
      <form action={goToTodayWorkout}>
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-950 px-4 py-4 text-lg font-semibold text-white dark:bg-white dark:text-black"
        >
          Entrenar hoy
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Últimos entrenamientos
        </h2>

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
      </section>
    </div>
  );
}
