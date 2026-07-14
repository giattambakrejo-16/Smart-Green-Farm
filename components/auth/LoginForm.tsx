"use client";

import { useState } from "react";
import {
    AlertCircle,
    Eye,
    EyeOff,
    Loader2,
    LockKeyhole,
    Mail,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) return;

        setLoading(true);
        setErrorMessage("");

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                setErrorMessage(
                    error.message === "Invalid login credentials"
                        ? "Email atau password tidak valid."
                        : error.message
                );
                return;
            }

            if (!data.session) {
                setErrorMessage("Session login tidak berhasil dibuat.");
                return;
            }

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                setErrorMessage("Session belum tersimpan. Silakan coba kembali.");
                return;
            }

            window.location.replace("/");
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Terjadi kesalahan. Silakan coba kembali.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold text-slate-300 sm:text-sm"
                >
                    Email
                </label>

                <div className="relative">
                    <Mail
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="nama@email.com"
                        autoComplete="email"
                        inputMode="email"
                        required
                        disabled={loading}
                        className="min-h-13 w-full rounded-2xl border border-white/10 bg-white/[0.055] py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:font-medium placeholder:text-slate-600 focus:border-teal-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14 sm:pl-12"
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-bold text-slate-300 sm:text-sm"
                >
                    Password
                </label>

                <div className="relative">
                    <LockKeyhole
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Masukkan password"
                        autoComplete="current-password"
                        required
                        minLength={6}
                        disabled={loading}
                        className="min-h-13 w-full rounded-2xl border border-white/10 bg-white/[0.055] py-3 pl-11 pr-12 text-sm font-semibold text-white outline-none transition placeholder:font-medium placeholder:text-slate-600 focus:border-teal-400 focus:bg-white/[0.08] focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14 sm:pl-12 sm:pr-14"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        disabled={loading}
                        aria-label={
                            showPassword
                                ? "Sembunyikan password"
                                : "Tampilkan password"
                        }
                        className="absolute right-2.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50 sm:right-3 sm:h-10 sm:w-10"
                    >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
            </div>

            {errorMessage && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />

                    <p className="text-xs font-semibold leading-5 sm:text-sm">
                        {errorMessage}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14"
            >
                {loading && <Loader2 size={18} className="animate-spin" />}

                {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
        </form>
    );
}