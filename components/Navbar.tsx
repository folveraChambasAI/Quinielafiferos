"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const links = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/predictions", label: "Predicciones" },
    { href: "/leaderboard", label: "Tabla" },
  ];

  if (session.user.isAdmin) links.push({ href: "/admin", label: "Admin" });

  return (
    <>
      <div className="tape-stripe" />
      <nav className="border-b-2 border-ink bg-cream sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="font-display text-base sm:text-lg leading-none">
            <span className="trophy-shimmer">🏆</span> <span className="hidden sm:inline">POKEMACHOS</span> MX26
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-display text-[0.65rem] sm:text-xs px-2 sm:px-3 py-1.5 border-2 whitespace-nowrap ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-ink text-cream border-ink"
                    : "border-transparent hover:border-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="font-display text-[0.65rem] sm:text-xs px-2 sm:px-3 py-1.5 border-2 border-transparent hover:bg-signal hover:text-white hover:border-signal"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
