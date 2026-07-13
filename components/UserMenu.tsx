"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  LogOut,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  dark: boolean;
};

export default function UserMenu({ dark }: Props) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? "");
    }

    loadUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    setLoading(true);

    try {
      await supabase.auth.signOut();

      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Buka menu profil"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-2xl p-1.5 pr-2 transition ${
          dark
            ? "hover:bg-white/10"
            : "hover:bg-slate-100"
        }`}
      >
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-black text-white shadow-lg shadow-teal-500/20">
          {initial}
        </div>

        <ChevronDown
          size={15}
          className={`hidden transition-transform sm:block ${
            open ? "rotate-180" : ""
          } ${dark ? "text-slate-400" : "text-slate-500"}`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-14 z-[100] w-64 overflow-hidden rounded-[22px] border p-2 shadow-2xl backdrop-blur-xl ${
            dark
              ? "border-white/10 bg-[#0b1220]/95 text-white"
              : "border-slate-200 bg-white/95 text-slate-950"
          }`}
        >
          <div
            className={`rounded-2xl p-4 ${
              dark ? "bg-white/[0.05]" : "bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-500/10 text-teal-400">
                <UserRound size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black">Akun Pengguna</p>

                <p
                  className={`mt-1 truncate text-xs font-semibold ${
                    dark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {email || "Memuat akun..."}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogOut size={18} />
            )}

            {loading ? "Keluar..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}