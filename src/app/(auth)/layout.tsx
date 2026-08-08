export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-start justify-center px-4 py-12">
      <div className="enter my-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-4xl tracking-wide">
            LEVEL <span className="text-plate-red">UP</span>
          </span>
        </div>
        <div className="border border-iron bg-surface p-6">{children}</div>
      </div>
    </div>
  );
}
