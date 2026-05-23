import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      hasPaid: true,
      predictions: {
        select: { pointsAwarded: true },
        where: { pointsAwarded: { not: null } },
      },
      specialPredictions: {
        select: { pointsAwarded: true },
      },
    },
  });

  const leaderboard = users
    .map((u) => {
      const matchPoints = u.predictions.reduce((sum, p) => sum + (p.pointsAwarded ?? 0), 0);
      const exactCount = u.predictions.filter((p) => (p.pointsAwarded ?? 0) >= 5).length;
      const specialPoints = u.specialPredictions?.pointsAwarded ?? 0;
      return {
        id: u.id,
        name: u.name,
        hasPaid: u.hasPaid,
        matchPoints,
        specialPoints,
        totalPoints: matchPoints + specialPoints,
        exactCount,
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.exactCount - a.exactCount;
    });

  return NextResponse.json(leaderboard);
}
