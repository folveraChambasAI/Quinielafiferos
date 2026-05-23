"use client";

import { useEffect, useState } from "react";

interface Row {
  id: string;
  name: string;
  hasPaid: boolean;
  matchPoints: number;
  specialPoints: number;
  totalPoints: number;
  exactCount: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const PRIZE_PCT = [0.6, 0.25, 0.15];

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setRows(d);
        setLoading(false);
      });
  }, []);

  const paidCount = rows.filter((r) => r.hasPaid).length;
  const pot = paidCount * 500;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">TABLA</h1>
        <p className="font-mono text-xs mt-2 opacity-60">
          Quién va ganando y quién paga los tragos al final.
        </p>
      </div>

      <div className="ticket-card p-5 bg-ink text-cream">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest opacity-60">
          Bote acumulado
        </p>
        <p className="font-display text-4xl sm:text-5xl mt-1">
          ${pot.toLocaleString("es-MX")}
        </p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {MEDALS.map((m, i) => (
            <div key={i} className="border border-cream/30 p-2">
              <p className="text-xl">{m}</p>
              <p className="font-mono text-[0.6rem] uppercase tracking-wider opacity-60 mt-1">
                {PRIZE_PCT[i] * 100}%
              </p>
              <p className="font-display text-sm">
                ${(pot * PRIZE_PCT[i]).toLocaleString("es-MX")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="font-mono text-sm">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div
              key={r.id}
              className={`ticket-card p-4 flex items-center gap-4 ${
                i < 3 ? "border-signal" : ""
              }`}
            >
              <div className="w-10 text-center font-display text-2xl">
                {i < 3 ? MEDALS[i] : <span className="opacity-50">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-base truncate">{r.name}</p>
                <p className="font-mono text-[0.65rem] opacity-60 mt-0.5">
                  {r.matchPoints} partidos · {r.specialPoints} especiales · {r.exactCount}{" "}
                  exactos
                  {!r.hasPaid && <span className="text-signal"> · MOROSO</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl">{r.totalPoints}</p>
                <p className="font-mono text-[0.6rem] uppercase tracking-wider opacity-60">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
