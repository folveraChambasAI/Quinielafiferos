import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Lock time = first match kickoff
async function getLockTime(): Promise<Date | null> {
  const first = await prisma.match.findFirst({
    orderBy: { kickoffAt: "asc" },
    select: { kickoffAt: true },
  });
  return first?.kickoffAt ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const prediction = await prisma.specialPrediction.findUnique({
    where: { userId: session.user.id },
  });
  const lockTime = await getLockTime();
  return NextResponse.json({ prediction, lockTime });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { champion, runnerUp, thirdPlace, topScorer, bestPlayer, revelationTeam } = body;

    const lockTime = await getLockTime();
    if (lockTime && new Date() >= lockTime) {
      return NextResponse.json(
        { error: "Las predicciones especiales están bloqueadas (ya inició el torneo)" },
        { status: 403 }
      );
    }

    const prediction = await prisma.specialPrediction.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        champion: champion || null,
        runnerUp: runnerUp || null,
        thirdPlace: thirdPlace || null,
        topScorer: topScorer || null,
        bestPlayer: bestPlayer || null,
        revelationTeam: revelationTeam || null,
      },
      update: {
        champion: champion || null,
        runnerUp: runnerUp || null,
        thirdPlace: thirdPlace || null,
        topScorer: topScorer || null,
        bestPlayer: bestPlayer || null,
        revelationTeam: revelationTeam || null,
      },
    });

    return NextResponse.json(prediction);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
