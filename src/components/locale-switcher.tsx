import { LOCALES, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
import type { Dictionary } from "@/i18n/dictionary";

/** Par de botones ES/EN que envían la cookie de idioma vía server action. */
export function LocaleSwitcher({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className="flex items-center gap-1 text-xs font-medium tracking-wide">
      {LOCALES.map((option) => (
        <form key={option} action={setLocale}>
          <input type="hidden" name="locale" value={option} />
          <button
            type="submit"
            disabled={option === locale}
            aria-current={option === locale ? "true" : undefined}
            className={`px-1.5 py-0.5 uppercase transition-colors ${
              option === locale
                ? "text-chalk"
                : "text-chalk-dim hover:text-chalk disabled:hover:text-chalk-dim"
            }`}
          >
            {dict.localeSwitcher[option]}
          </button>
        </form>
      ))}
    </div>
  );
}
