import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPredictionOpen } from "@/lib/scoring";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { matchId, homeScore, awayScore, winnerOnPens } = await req.json();

    if (
      typeof matchId !== "string" ||
      typeof homeScore !== "number" ||
      typeof awayScore !== "number" ||
      homeScore < 0 ||
      awayScore < 0 ||
      homeScore > 20 ||
      awayScore > 20
    ) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

    if (!isPredictionOpen(match.kickoffAt)) {
      return NextResponse.json(
        { error: "Las predicciones cierran 1 hora antes del partido" },
        { status: 403 }
      );
    }

    // For knockouts on a draw, require winnerOnPens
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

    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: session.user.id,
          matchId,
        },
      },
      create: {
        userId: session.user.id,
        matchId,
        homeScore,
        awayScore,
        winnerOnPens: pensWinner,
      },
      update: {
        homeScore,
        awayScore,
        winnerOnPens: pensWinner,
      },
    });

    return NextResponse.json(prediction);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
