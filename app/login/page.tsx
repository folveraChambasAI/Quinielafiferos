"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setErr("Credenciales incorrectas");
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-grain flex flex-col">
      {/* Hero with blurred group photo */}
      <div className="relative overflow-hidden border-b-2 border-ink">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: "url('/pokemachos.jpg')",
            filter: "blur(14px) saturate(0.9)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.55) 50%, rgba(245,241,232,0.95) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="tape-stripe absolute top-0 left-0 right-0" />
        <div className="relative text-center pt-12 pb-10 px-6">
          <div className="font-display text-4xl mb-2">
            <span className="trophy-shimmer">🏆</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight text-cream drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
            POKEMACHOS
          </h1>
          <p className="font-mono text-sm mt-2 tracking-wider text-cream/90">
            Y EL MOJADO · MX26
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md -mt-4">

        <div className="ticket-card p-6 sm:p-8">
          <h2 className="font-display text-lg mb-1">ENTRAR A LA QUINIELA</h2>
          <p className="font-mono text-[0.65rem] opacity-60 mb-6 uppercase tracking-wider">
            Solo Pokemachos no morosos
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider block mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
            {err && (
              <div className="font-mono text-xs text-signal border-2 border-signal p-2">{err}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="text-center mt-6 font-mono text-sm">
            ¿Primera vez?{" "}
            <Link href="/register" className="underline font-bold">
              Apúntate
            </Link>
          </p>
        </div>

        <p className="text-center font-mono text-[0.65rem] opacity-50 mt-6 px-4">
          Hecho con cariño para los Pokemachos · No se aceptan morosos · Pago en pesos, no en FIFA points.
        </p>
      </div>
      </div>
    </div>
  );
}
