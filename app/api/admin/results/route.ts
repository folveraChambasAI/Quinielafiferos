import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMatchPoints } from "@/lib/scoring";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { matchId, homeScore, awayScore, winnerOnPens } = await req.json();

    if (
      typeof matchId !== "string" ||
      typeof homeScore !== "number" ||
      typeof awayScore !== "number"
    ) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

    const isKO = match.stage !== "group";
    let pensWinner: string | null = null;
    if (isKO && homeScore === awayScore) {
      if (winnerOnPens !== match.homeTeam && winnerOnPens !== match.awayTeam) {
        return NextResponse.json(
          { error: "En empates de eliminatorias debes elegir quién gana en penales" },
          { status: 400 }
        );
      }
      pensWinner = winnerOnPens;
    }

    // Update match
    await prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, winnerOnPens: pensWinner, isFinalized: true },
    });

    // Recalculate all predictions for this match
    const predictions = await prisma.prediction.findMany({ where: { matchId } });
    for (const pred of predictions) {
      const points = calculateMatchPoints(
        {
          homeScore: pred.homeScore,
          awayScore: pred.awayScore,
          winnerOnPens: pred.winnerOnPens,
        },
        { homeScore, awayScore, winnerOnPens: pensWinner, stage: match.stage }
      );
      await prisma.prediction.update({
        where: { id: pred.id },
        data: { pointsAwarded: points },
      });
    }

    return NextResponse.json({ ok: true, predictionsScored: predictions.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
