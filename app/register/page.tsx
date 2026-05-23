"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error ?? "Error al registrar");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-grain">
      {/* Hero with blurred group photo as background */}
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
          <h1 className="font-display text-3xl sm:text-5xl leading-tight text-cream drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
            POKEMACHOS
          </h1>
          <p className="font-mono text-sm mt-2 tracking-wider text-cream/90">
            QUINIELA MUNDIAL 2026
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 -mt-4 relative">
        <div className="ticket-card p-5 sm:p-7 mb-6 bg-ink text-cream">
          <p className="font-display text-base sm:text-lg leading-snug mb-3">
            12 COMPAS. UN BOTE. CERO MOROSOS.
          </p>
          <p className="font-body text-sm leading-relaxed opacity-90">
            Después de años de apuestas no pagadas, FIFA points malgastados, partidos
            de padel suspendidos y nombres de grupo cada vez más mamadores
            (Pokemachos y el 6 palos, los Topos, los Chapulines, el chapulín
            mantenido, los jotos padelebrios...), llegó el momento de la quiniela
            DEFINITIVA: <strong>el Mundial 2026 en casa</strong>.
          </p>
          <p className="font-body text-sm leading-relaxed opacity-90 mt-3">
            <strong>$500 de entrada.</strong> Pago al admin, ni un peso menos.
            Ojo Daniel: esto NO acepta IOUs, ni promesas, ni "el lunes te pago".
            Y Nievecito: no, no se aceptan FIFA points como entrada.
          </p>
        </div>

        <div className="ticket-card p-5 mb-6">
          <p className="font-display text-sm mb-3">⚽ LOS PARTICIPANTES</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-xs">
            <div>• Iván Huerta <span className="opacity-50">— ame, FIFA UT</span></div>
            <div>• Daniel "Moroso" <span className="opacity-50">— pumas</span></div>
            <div>• Limón <span className="opacity-50">— toluca</span></div>
            <div>• El Vocho <span className="opacity-50">— tigres</span></div>
            <div>• Nievecito <span className="opacity-50">— FIFA points</span></div>
            <div>• Mau <span className="opacity-50">— galactigres</span></div>
            <div>• Beto <span className="opacity-50">— tigres</span></div>
            <div>• Miguel Dar <span className="opacity-50">— tigres femenil</span></div>
            <div>• Foc <span className="opacity-50">— chivahalonike</span></div>
            <div>• Farid <span className="opacity-50">— anti-ame</span></div>
            <div>• Rigo <span className="opacity-50">— culpa de Layún</span></div>
            <div>• El Pope <span className="opacity-50">— culichis insta</span></div>
          </div>
        </div>

        <div className="ticket-card p-6 sm:p-8">
          <h2 className="font-display text-lg mb-1">REGISTRARSE</h2>
          <p className="font-mono text-[0.65rem] opacity-60 mb-6 uppercase tracking-wider">
            Usa tu nombre real — no "Nievecito" ni "Vochito"
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider block mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
                placeholder="Iván, Daniel, Limón..."
              />
            </div>
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
                Contraseña (mín 6)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
                minLength={6}
              />
            </div>
            {err && (
              <div className="font-mono text-xs text-signal border-2 border-signal p-2">{err}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Registrando..." : "Apuntarse al bote"}
            </button>
          </form>
          <p className="font-mono text-[0.65rem] text-center mt-4 opacity-60">
            Tu pago lo confirma el admin manualmente. No es válido hasta que pagues los $500.
          </p>
          <p className="text-center mt-6 font-mono text-sm">
            ¿Ya estás dentro?{" "}
            <Link href="/login" className="underline font-bold">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-center font-mono text-[0.65rem] opacity-50 mt-6 px-4">
          Hecho con cariño para los Pokemachos · No se aceptan morosos · Pago en pesos, no en FIFA points.
        </p>
      </div>
    </div>
  );
}
