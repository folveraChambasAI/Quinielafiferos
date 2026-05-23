import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) return null;
  return session;
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { matchNumber, stage, group, homeTeam, awayTeam, kickoffAt } = body;

    if (!matchNumber || !stage || !homeTeam || !awayTeam || !kickoffAt) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const match = await prisma.match.upsert({
      where: { matchNumber },
      create: {
        matchNumber,
        stage,
        group: group || null,
        homeTeam,
        awayTeam,
        kickoffAt: new Date(kickoffAt),
      },
      update: {
        stage,
        group: group || null,
        homeTeam,
        awayTeam,
        kickoffAt: new Date(kickoffAt),
      },
    });

    return NextResponse.json(match);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  await prisma.match.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
