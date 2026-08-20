import { getDictionary } from "@/i18n/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = await getDictionary();

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-12">
      <div className="enter my-auto w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <span className="font-display text-4xl tracking-wide">
            LEVEL <span className="text-plate-red">UP</span>
          </span>
          <LocaleSwitcher locale={locale} dict={dict} />
        </div>
        <div className="rounded-lg border border-iron bg-surface p-6 shadow-elev-3">{children}</div>
      </div>
    </div>
  );
}
