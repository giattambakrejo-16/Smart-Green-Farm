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
        <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
            <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-teal-500/15 blur-[110px]" />
            <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />
            <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

            <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
                <section className="hidden lg:block">
                    <div className="max-w-xl">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-gradient-to-br from-teal-500 to-emerald-500 shadow-2xl shadow-teal-500/25">
                                <Sprout size={31} strokeWidth={2.4} />
                            </div>

                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.22em] text-teal-400">
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
                                icon={<Leaf size={21} />}
                                title="Raised Bed"
                                description="Monitoring kebun"
                            />

                            <FeatureCard
                                icon={<Waves size={21} />}
                                title="Aquaponik"
                                description="Kualitas air"
                            />

                            <FeatureCard
                                icon={<Activity size={21} />}
                                title="Real-time"
                                description="Data sensor langsung"
                            />

                            <FeatureCard
                                icon={<ShieldCheck size={21} />}
                                title="Secure Access"
                                description="Supabase Auth"
                            />
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-md">
                    <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/20">
                            <Sprout size={25} />
                        </div>

                        <div>
                            <p className="font-black">Smart Green Farm</p>
                            <p className="text-xs font-semibold text-slate-500">
                                Taman Kebun Pancasila
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[#101827]/85 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-black tracking-tight">
                                Selamat Datang
                            </h2>

                            <p className="mx-auto mt-3 max-w-[280px] text-sm leading-6 text-slate-400">
                                Masuk untuk mengakses dashboard
                                <span className="block font-semibold text-slate-300">
                                    Smart Green Farm
                                </span>
                            </p>
                        </div>

                        <LoginForm />

                        <div className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                            <ShieldCheck size={14} />
                            <span>Login dilindungi Supabase Authentication</span>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs font-semibold text-slate-600">
                        © 2026 Smart Green Farm · GIAT 16 UNNES
                    </p>
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
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-teal-500/10 text-teal-400">
                {icon}
            </div>

            <p className="font-black text-white">{title}</p>

            <p className="mt-1 text-xs font-semibold text-slate-500">
                {description}
            </p>
        </div>
    );
}