"use client";

import { useEffect, useState } from "react";
import { STAGE_LABELS, isPredictionOpen } from "@/lib/scoring";

interface Match {
  id: string;
  matchNumber: number;
  stage: string;
  group: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  homeScore: number | null;
  awayScore: number | null;
  winnerOnPens: string | null;
  isFinalized: boolean;
  predictions: {
    homeScore: number;
    awayScore: number;
    winnerOnPens: string | null;
    pointsAwarded: number | null;
  }[];
}

export default function PredictionsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"matches" | "special">("matches");

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => {
        setMatches(d);
        setLoading(false);
      });
  }, []);

  async function savePrediction(
    matchId: string,
    homeScore: number,
    awayScore: number,
    winnerOnPens?: string | null
  ) {
    setSavingId(matchId);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore, awayScore, winnerOnPens }),
    });
    if (res.ok) {
      setMatches((ms) =>
        ms.map((m) =>
          m.id === matchId
            ? {
                ...m,
                predictions: [
                  { homeScore, awayScore, winnerOnPens: winnerOnPens ?? null, pointsAwarded: null },
                ],
              }
            : m
        )
      );
    } else {
      const data = await res.json();
      alert(data.error || "Error al guardar");
    }
    setSavingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">PREDICCIONES</h1>
        <p className="font-mono text-xs mt-2 opacity-60">
          Cierre: 1 hora antes de cada partido.
        </p>
      </div>

      <div className="flex gap-2 border-b-2 border-ink">
        <button
          onClick={() => setTab("matches")}
          className={`font-display text-sm px-4 py-2 -mb-[2px] border-b-4 ${
            tab === "matches" ? "border-signal" : "border-transparent"
          }`}
        >
          PARTIDOS
        </button>
        <button
          onClick={() => setTab("special")}
          className={`font-display text-sm px-4 py-2 -mb-[2px] border-b-4 ${
            tab === "special" ? "border-signal" : "border-transparent"
          }`}
        >
          ESPECIALES
        </button>
      </div>

      {tab === "matches" ? (
        loading ? (
          <p className="font-mono text-sm">Cargando partidos...</p>
        ) : matches.length === 0 ? (
          <div className="ticket-card p-8 text-center">
            <p className="font-display text-lg">⏳ Aún no hay partidos</p>
            <p className="font-mono text-xs mt-2 opacity-60">
              El admin debe cargar el calendario.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                onSave={savePrediction}
                isSaving={savingId === m.id}
              />
            ))}
          </div>
        )
      ) : (
        <SpecialPredictions />
      )}

      <section id="reglas" className="ticket-card p-6 mt-12">
        <h2 className="font-display text-xl mb-4">📜 REGLAS</h2>
        <div className="space-y-3 font-body text-sm">
          <p><strong>Fase de grupos:</strong> 5 pts marcador exacto, 3 pts resultado correcto.</p>
          <p><strong>Eliminatorias:</strong> 10 pts marcador exacto, 6 pts quién avanza (incluye penales).</p>
          <p><strong>Especiales:</strong> Campeón 25, Subcampeón 15, Tercer lugar 10, Goleador 15, Mejor jugador 10, Revelación 10.</p>
          <p><strong>Deadline:</strong> 1 hora antes del silbatazo de cada partido. Tardío = 0 pts.</p>
          <p><strong>Premios:</strong> 1° lugar 60% · 2° lugar 25% · 3° lugar 15%</p>
          <p><strong>Desempate:</strong> Más marcadores exactos. Si sigue empatado, se reparte.</p>
        </div>
      </section>
    </div>
  );
}

function MatchRow({
  match,
  onSave,
  isSaving,
}: {
  match: Match;
  onSave: (id: string, h: number, a: number, p?: string | null) => void;
  isSaving: boolean;
}) {
  const existing = match.predictions[0];
  const [home, setHome] = useState<string>(existing ? String(existing.homeScore) : "");
  const [away, setAway] = useState<string>(existing ? String(existing.awayScore) : "");
  const [pens, setPens] = useState<string | null>(existing?.winnerOnPens ?? null);

  const open = isPredictionOpen(new Date(match.kickoffAt));
  const isKO = match.stage !== "group";
  const isDraw = home !== "" && away !== "" && parseInt(home) === parseInt(away);
  const needsPens = isKO && isDraw;

  function submit() {
    const h = parseInt(home);
    const a = parseInt(away);
    if (isNaN(h) || isNaN(a)) return;
    if (needsPens && !pens) {
      alert("Elige quién gana en penales");
      return;
    }
    onSave(match.id, h, a, needsPens ? pens : null);
  }

  return (
    <div className={`ticket-card p-4 ${!open ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="stage-badge">
          {match.group ? `Grupo ${match.group}` : STAGE_LABELS[match.stage as keyof typeof STAGE_LABELS]}
        </span>
        <span className="font-mono text-[0.65rem] opacity-60">
          {new Date(match.kickoffAt).toLocaleString("es-MX", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-display text-base sm:text-lg flex-1 min-w-0">{match.homeTeam}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={20}
            value={home}
            onChange={(e) => setHome(e.target.value)}
            disabled={!open}
            className="score-input"
          />
          <span className="font-display text-xl opacity-40">:</span>
          <input
            type="number"
            min={0}
            max={20}
            value={away}
            onChange={(e) => setAway(e.target.value)}
            disabled={!open}
            className="score-input"
          />
        </div>
        <span className="font-display text-base sm:text-lg flex-1 min-w-0 text-right">
          {match.awayTeam}
        </span>
      </div>

      {needsPens && (
        <div className="mt-3 pt-3 border-t border-ink/20">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider mb-2">
            Gana en penales:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPens(match.homeTeam)}
              disabled={!open}
              className={`btn-ghost flex-1 ${pens === match.homeTeam ? "bg-ink text-cream" : ""}`}
            >
              {match.homeTeam}
            </button>
            <button
              onClick={() => setPens(match.awayTeam)}
              disabled={!open}
              className={`btn-ghost flex-1 ${pens === match.awayTeam ? "bg-ink text-cream" : ""}`}
            >
              {match.awayTeam}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        {open ? (
          <button onClick={submit} disabled={isSaving || !home || !away} className="btn-primary">
            {isSaving ? "Guardando..." : existing ? "Actualizar" : "Guardar"}
          </button>
        ) : (
          <span className="font-mono text-xs text-signal">🔒 Cerrado</span>
        )}

        {match.isFinalized && (
          <div className="font-mono text-xs text-right">
            <p className="opacity-60">Resultado real:</p>
            <p className="font-display text-base">
              {match.homeScore} : {match.awayScore}
              {match.winnerOnPens && (
                <span className="opacity-60 text-xs"> (pen: {match.winnerOnPens})</span>
              )}
            </p>
            {existing?.pointsAwarded != null && (
              <p className="font-display text-sm mt-1 text-grass">+{existing.pointsAwarded} pts</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const TEAMS_2026 = [
  "Argentina", "Brasil", "Francia", "Inglaterra", "España", "Alemania",
  "Portugal", "Países Bajos", "México", "Estados Unidos", "Canadá", "Uruguay",
  "Croacia", "Italia", "Bélgica", "Marruecos", "Japón", "Corea del Sur",
  "Senegal", "Colombia", "Ecuador", "Suiza", "Dinamarca", "Australia",
];

function SpecialPredictions() {
  const [data, setData] = useState({
    champion: "",
    runnerUp: "",
    thirdPlace: "",
    topScorer: "",
    bestPlayer: "",
    revelationTeam: "",
  });
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetch("/api/special-predictions")
      .then((r) => r.json())
      .then((d) => {
        if (d.prediction) {
          setData({
            champion: d.prediction.champion ?? "",
            runnerUp: d.prediction.runnerUp ?? "",
            thirdPlace: d.prediction.thirdPlace ?? "",
            topScorer: d.prediction.topScorer ?? "",
            bestPlayer: d.prediction.bestPlayer ?? "",
            revelationTeam: d.prediction.revelationTeam ?? "",
          });
        }
        if (d.lockTime && new Date(d.lockTime) <= new Date()) setLocked(true);
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    setSavedMsg("");
    const res = await fetch("/api/special-predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setSavedMsg("✓ Guardado");
    else {
      const e = await res.json();
      setSavedMsg("✗ " + (e.error ?? "Error"));
    }
    setSaving(false);
    setTimeout(() => setSavedMsg(""), 3000);
  }

  if (loading) return <p className="font-mono text-sm">Cargando...</p>;

  const fields: { key: keyof typeof data; label: string; points: number; type: "team" | "text" }[] = [
    { key: "champion", label: "🏆 Campeón", points: 25, type: "team" },
    { key: "runnerUp", label: "🥈 Subcampeón", points: 15, type: "team" },
    { key: "thirdPlace", label: "🥉 Tercer lugar", points: 10, type: "team" },
    { key: "topScorer", label: "⚽ Goleador del torneo", points: 15, type: "text" },
    { key: "bestPlayer", label: "🌟 Mejor jugador (Balón de Oro)", points: 10, type: "text" },
    { key: "revelationTeam", label: "💥 Selección revelación (a cuartos)", points: 10, type: "team" },
  ];

  return (
    <div className="space-y-4">
      {locked && (
        <div className="ticket-card p-4 bg-signal text-white">
          <p className="font-display text-sm">🔒 Predicciones especiales bloqueadas</p>
          <p className="font-mono text-xs mt-1">El torneo ya inició.</p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key} className="ticket-card p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-display text-sm">{f.label}</label>
              <span className="font-mono text-xs opacity-60">{f.points} pts</span>
            </div>
            {f.type === "team" ? (
              <select
                value={data[f.key]}
                onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                disabled={locked}
                className="input-field"
              >
                <option value="">— Selecciona —</option>
                {TEAMS_2026.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={data[f.key]}
                onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                disabled={locked}
                className="input-field"
                placeholder="Nombre del jugador"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving || locked} className="btn-primary">
          {saving ? "Guardando..." : "Guardar especiales"}
        </button>
        {savedMsg && <p className="font-mono text-sm">{savedMsg}</p>}
      </div>
    </div>
  );
}
