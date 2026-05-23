import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const matches = await prisma.match.findMany({
    orderBy: { kickoffAt: "asc" },
    include: {
      predictions: {
        where: { userId: session.user.id },
        select: {
          homeScore: true,
          awayScore: true,
          winnerOnPens: true,
          pointsAwarded: true,
        },
      },
    },
  });

  return NextResponse.json(matches);
}
