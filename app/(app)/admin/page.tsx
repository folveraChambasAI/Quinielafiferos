"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { STAGE_LABELS } from "@/lib/scoring";

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
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  hasPaid: boolean;
  isAdmin: boolean;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"matches" | "results" | "users">("matches");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user.isAdmin) router.push("/dashboard");
  }, [session, status, router]);

  if (status === "loading" || !session?.user.isAdmin) {
    return <p className="font-mono text-sm">Cargando...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">ADMIN</h1>
        <p className="font-mono text-xs mt-2 opacity-60">Panel de control de la quiniela.</p>
      </div>

      <div className="flex gap-2 border-b-2 border-ink overflow-x-auto">
        <button
          onClick={() => setTab("matches")}
          className={`font-display text-sm px-4 py-2 -mb-[2px] border-b-4 whitespace-nowrap ${
            tab === "matches" ? "border-signal" : "border-transparent"
          }`}
        >
          PARTIDOS
        </button>
        <button
          onClick={() => setTab("results")}
          className={`font-display text-sm px-4 py-2 -mb-[2px] border-b-4 whitespace-nowrap ${
            tab === "results" ? "border-signal" : "border-transparent"
          }`}
        >
          RESULTADOS
        </button>
        <button
          onClick={() => setTab("users")}
          className={`font-display text-sm px-4 py-2 -mb-[2px] border-b-4 whitespace-nowrap ${
            tab === "users" ? "border-signal" : "border-transparent"
          }`}
        >
          USUARIOS
        </button>
      </div>

      {tab === "matches" && <MatchesAdmin />}
      {tab === "results" && <ResultsAdmin />}
      {tab === "users" && <UsersAdmin />}
    </div>
  );
}

function MatchesAdmin() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [form, setForm] = useState({
    matchNumber: "",
    stage: "group",
    group: "",
    homeTeam: "",
    awayTeam: "",
    kickoffAt: "",
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/matches");
    setMatches(await r.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        matchNumber: parseInt(form.matchNumber),
      }),
    });
    if (res.ok) {
      setForm({
        matchNumber: "",
        stage: "group",
        group: "",
        homeTeam: "",
        awayTeam: "",
        kickoffAt: "",
      });
      load();
    } else {
      const e = await res.json();
      alert(e.error);
    }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm("¿Eliminar partido?")) return;
    await fetch(`/api/admin/matches?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="ticket-card p-5">
        <h3 className="font-display text-base mb-4">+ Nuevo partido</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="# partido (1-104)"
            value={form.matchNumber}
            onChange={(e) => setForm({ ...form, matchNumber: e.target.value })}
            className="input-field"
          />
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
            className="input-field"
          >
            {Object.entries(STAGE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            placeholder="Grupo (A-L, vacío si KO)"
            value={form.group}
            onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
            className="input-field"
          />
          <input
            type="datetime-local"
            value={form.kickoffAt}
            onChange={(e) => setForm({ ...form, kickoffAt: e.target.value })}
            className="input-field"
          />
          <input
            placeholder="Equipo local"
            value={form.homeTeam}
            onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
            className="input-field"
          />
          <input
            placeholder="Equipo visitante"
            value={form.awayTeam}
            onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
            className="input-field"
          />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary mt-4">
          {saving ? "Guardando..." : "Guardar partido"}
        </button>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest opacity-60">
          Click un partido para editarlo
        </p>
        {matches.map((m) => (
          <div key={m.id} className="ticket-card p-3 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                // Format datetime-local input (YYYY-MM-DDTHH:mm)
                const d = new Date(m.kickoffAt);
                const pad = (n: number) => String(n).padStart(2, "0");
                const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                setForm({
                  matchNumber: String(m.matchNumber),
                  stage: m.stage,
                  group: m.group ?? "",
                  homeTeam: m.homeTeam,
                  awayTeam: m.awayTeam,
                  kickoffAt: local,
                });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-left min-w-0 flex-1"
            >
              <p className="font-mono text-[0.65rem] opacity-60">
                #{m.matchNumber} ·{" "}
                {m.group ? `Grupo ${m.group}` : STAGE_LABELS[m.stage as keyof typeof STAGE_LABELS]}
              </p>
              <p className="font-display text-sm truncate">
                {m.homeTeam} vs {m.awayTeam}
              </p>
              <p className="font-mono text-[0.65rem] opacity-60">
                {new Date(m.kickoffAt).toLocaleString("es-MX")}
              </p>
            </button>
            <button onClick={() => del(m.id)} className="font-mono text-xs text-signal">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsAdmin() {
  const [matches, setMatches] = useState<Match[]>([]);

  async function load() {
    const r = await fetch("/api/matches");
    setMatches(await r.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(matchId: string, h: number, a: number, pens?: string | null) {
    const res = await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore: h, awayScore: a, winnerOnPens: pens }),
    });
    if (!res.ok) {
      const e = await res.json();
      alert(e.error);
      return;
    }
    const data = await res.json();
    alert(`✓ Resultado guardado. ${data.predictionsScored} predicciones calificadas.`);
    load();
  }

  return (
    <div className="space-y-2">
      {matches.map((m) => (
        <ResultRow key={m.id} match={m} onSubmit={submit} />
      ))}
    </div>
  );
}

function ResultRow({
  match,
  onSubmit,
}: {
  match: Match;
  onSubmit: (id: string, h: number, a: number, pens?: string | null) => void;
}) {
  const [home, setHome] = useState(match.homeScore?.toString() ?? "");
  const [away, setAway] = useState(match.awayScore?.toString() ?? "");
  const [pens, setPens] = useState<string | null>(match.winnerOnPens);

  const isKO = match.stage !== "group";
  const isDraw = home !== "" && away !== "" && parseInt(home) === parseInt(away);
  const needsPens = isKO && isDraw;

  return (
    <div className="ticket-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[0.65rem] opacity-60">
          #{match.matchNumber} ·{" "}
          {match.group ? `Grupo ${match.group}` : STAGE_LABELS[match.stage as keyof typeof STAGE_LABELS]}
          {match.isFinalized && <span className="ml-2 text-grass">✓ Finalizado</span>}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-display text-sm flex-1">{match.homeTeam}</span>
        <input
          type="number"
          min={0}
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="score-input"
        />
        <span className="font-display text-lg opacity-40">:</span>
        <input
          type="number"
          min={0}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="score-input"
        />
        <span className="font-display text-sm flex-1 text-right">{match.awayTeam}</span>
      </div>
      {needsPens && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setPens(match.homeTeam)}
            className={`btn-ghost flex-1 ${pens === match.homeTeam ? "bg-ink text-cream" : ""}`}
          >
            Pen: {match.homeTeam}
          </button>
          <button
            onClick={() => setPens(match.awayTeam)}
            className={`btn-ghost flex-1 ${pens === match.awayTeam ? "bg-ink text-cream" : ""}`}
          >
            Pen: {match.awayTeam}
          </button>
        </div>
      )}
      <button
        onClick={() => onSubmit(match.id, parseInt(home), parseInt(away), needsPens ? pens : null)}
        disabled={!home || !away}
        className="btn-primary mt-3"
      >
        Guardar y calificar
      </button>
    </div>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);

  async function load() {
    const r = await fetch("/api/admin/users");
    setUsers(await r.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function togglePaid(userId: string, hasPaid: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, hasPaid }),
    });
    load();
  }

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="ticket-card p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-sm truncate">
              {u.name} {u.isAdmin && <span className="font-mono text-xs">[admin]</span>}
            </p>
            <p className="font-mono text-xs opacity-60 truncate">{u.email}</p>
          </div>
          <button
            onClick={() => togglePaid(u.id, !u.hasPaid)}
            className={`btn-ghost ${u.hasPaid ? "bg-grass text-white border-grass" : ""}`}
          >
            {u.hasPaid ? "✓ Pagado" : "Sin pagar"}
          </button>
        </div>
      ))}
    </div>
  );
}
