import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TRASH_TALK } from "@/lib/group-config";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = (await getServerSession(authOptions))!;

  const [user, totalUsers, paidUsers, matchCount, nextMatch] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        predictions: { where: { pointsAwarded: { not: null } }, select: { pointsAwarded: true } },
        specialPredictions: { select: { pointsAwarded: true } },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { hasPaid: true } }),
    prisma.match.count(),
    prisma.match.findFirst({
      where: { kickoffAt: { gt: new Date() } },
      orderBy: { kickoffAt: "asc" },
    }),
  ]);

  const matchPoints = user?.predictions.reduce((s, p) => s + (p.pointsAwarded ?? 0), 0) ?? 0;
  const specialPoints = user?.specialPredictions?.pointsAwarded ?? 0;
  const totalPoints = matchPoints + specialPoints;
  const pot = paidUsers * 500;

  // Pick a random trash-talk line using user id + day so it changes daily but
  // stays stable for the day (no hydration mismatch)
  const dayKey = new Date().toISOString().slice(0, 10);
  const hash = (session.user.id + dayKey).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const trashLine = TRASH_TALK[hash % TRASH_TALK.length];

  return (
    <div className="space-y-8 stagger">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest opacity-60">
          Pokemacho del día
        </p>
        <h1 className="font-display text-3xl sm:text-5xl leading-tight mt-1">
          {user?.name?.split(" ")[0]}.
        </h1>
        <p className="font-body text-sm italic mt-2 opacity-70">"{trashLine}"</p>
        {!user?.hasPaid && (
          <div className="mt-4 ticket-card p-4 bg-signal text-white">
            <p className="font-mono text-xs uppercase tracking-wider">⚠ MOROSO DETECTADO</p>
            <p className="font-display text-sm mt-1">
              Paga los $500 al admin para entrar al bote. No se aceptan FIFA points.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ticket-card p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider opacity-60">Tus puntos</p>
          <p className="font-display text-3xl mt-1">{totalPoints}</p>
        </div>
        <div className="ticket-card p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider opacity-60">El bote</p>
          <p className="font-display text-3xl mt-1">${pot.toLocaleString("es-MX")}</p>
        </div>
        <div className="ticket-card p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider opacity-60">Pagados</p>
          <p className="font-display text-3xl mt-1">
            {paidUsers}<span className="text-base opacity-50">/{totalUsers}</span>
          </p>
        </div>
        <div className="ticket-card p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider opacity-60">Partidos</p>
          <p className="font-display text-3xl mt-1">{matchCount}</p>
        </div>
      </div>

      {nextMatch && (
        <div className="ticket-card p-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest opacity-60 mb-2">
            Próximo partido
          </p>
          <div className="flex items-center justify-between gap-4">
            <div className="font-display text-xl sm:text-2xl">
              {nextMatch.homeTeam} <span className="opacity-40">vs</span> {nextMatch.awayTeam}
            </div>
            <Link href="/predictions" className="btn-ghost shrink-0">
              Predecir →
            </Link>
          </div>
          <p className="font-mono text-xs mt-3 opacity-70">
            {new Date(nextMatch.kickoffAt).toLocaleString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/predictions" className="ticket-card p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform block">
          <p className="font-display text-base">⚽ Predicciones</p>
          <p className="font-mono text-xs mt-2 opacity-60">
            Marcadores y especiales del torneo
          </p>
        </Link>
        <Link href="/leaderboard" className="ticket-card p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform block">
          <p className="font-display text-base">📊 Tabla de posiciones</p>
          <p className="font-mono text-xs mt-2 opacity-60">Quién va ganando el bote</p>
        </Link>
        <Link href="/predictions#reglas" className="ticket-card p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform block">
          <p className="font-display text-base">📜 Reglas</p>
          <p className="font-mono text-xs mt-2 opacity-60">Reparto, deadlines, puntos</p>
        </Link>
      </div>
    </div>
  );
}
