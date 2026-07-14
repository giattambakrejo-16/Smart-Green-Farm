import {
  Activity,
  Leaf,
  ShieldCheck,
  Sprout,
  Waves,
} from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute -left-28 top-0 h-64 w-64 rounded-full bg-teal-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[110px]" />

      <div
        className="
          relative mx-auto grid min-h-[100dvh] w-full max-w-7xl
          items-center gap-10 px-4
          pb-[max(1.25rem,env(safe-area-inset-bottom))]
          pt-[max(1.25rem,env(safe-area-inset-top))]
          sm:px-6
          lg:grid-cols-[1.05fr_0.95fr] lg:px-12
        "
      >
        {/* Informasi desktop */}
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-gradient-to-br from-teal-500 to-emerald-500 shadow-2xl shadow-teal-500/25">
                <Sprout size={31} strokeWidth={2.4} />
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-400">
                  Smart Green Farm
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  GIAT 16 Universitas Negeri Semarang
                </p>
              </div>
            </div>

            <h1 className="text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">
              Monitoring pertanian
              <span className="block bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                dalam satu dashboard.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base font-medium leading-8 text-slate-400">
              Pantau Raised Bed dan Aquaponik secara real-time melalui sistem
              Smart Farming berbasis Internet of Things.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
              <FeatureCard
                icon={<Leaf size={20} />}
                title="Raised Bed"
                description="Monitoring kebun"
              />

              <FeatureCard
                icon={<Waves size={20} />}
                title="Aquaponik"
                description="Kualitas air"
              />

              <FeatureCard
                icon={<Activity size={20} />}
                title="Real-time"
                description="Data sensor langsung"
              />

              <FeatureCard
                icon={<ShieldCheck size={20} />}
                title="Secure Access"
                description="Supabase Auth"
              />
            </div>
          </div>
        </section>

        {/* Form login */}
        <section className="mx-auto flex w-full max-w-[380px] flex-col justify-center sm:max-w-md">
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

          <div className="w-full rounded-[26px] border border-white/10 bg-[#101827]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:rounded-[32px] sm:p-7">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Selamat Datang
              </h2>

              <p className="mx-auto mt-2 max-w-[270px] text-sm font-medium leading-5 text-slate-400 sm:leading-6">
                Masuk untuk mengakses dashboard Smart Green Farm.
              </p>
            </div>

            <LoginForm />
          </div>

          <footer className="mt-5 text-center text-[10px] font-semibold text-slate-600 sm:text-xs">
            © 2026 Smart Green Farm · GIAT 16 UNNES
          </footer>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.06]">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-teal-500/10 text-teal-400">
        {icon}
      </div>

      <p className="text-sm font-black text-white">{title}</p>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {description}
      </p>
    </div>
  );
}