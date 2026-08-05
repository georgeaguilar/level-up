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
    <div className="enter flex flex-col gap-10">
      <form action={goToTodayWorkout}>
        <button
          type="submit"
          className="w-full border-2 border-plate-red bg-plate-red px-4 py-5 font-display text-3xl tracking-wide text-chalk transition-[transform,background-color] active:scale-[0.99] active:bg-plate-red-dim"
        >
          ENTRENAR HOY
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm tracking-[0.2em] text-chalk-dim">
          ÚLTIMOS ENTRENAMIENTOS
        </h2>

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
      </section>
    </div>
  );
}
