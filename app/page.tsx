import { Sprout } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute -left-28 top-10 h-64 w-64 rounded-full bg-teal-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[110px]" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">
        <header className="mb-5 flex items-center justify-center gap-3 sm:mb-6">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/20 sm:h-12 sm:w-12">
            <Sprout size={23} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-black sm:text-base">
              Smart Green Farm
            </h1>

            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500 sm:text-xs">
              Taman Kebun Pancasila
            </p>
          </div>
        </header>

        <section className="w-full rounded-[28px] border border-white/10 bg-[#101827]/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:rounded-[32px] sm:p-7">
          <div className="mb-6">

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Selamat Datang
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
              Masuk untuk membuka dashboard Smart Green Farm.
            </p>
          </div>

          <LoginForm />
        </section>

        <footer className="mt-5 text-center text-[10px] font-semibold text-slate-600 sm:text-[11px]">
          © 2026 Smart Green Farm · GIAT 16 UNNES
        </footer>
      </div>
    </main>
  );
}