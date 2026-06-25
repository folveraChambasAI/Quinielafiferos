// Predicciones de FOC — Jornada 3 (24 jun 2026)
//
// Carga / actualiza las predicciones del usuario "FOC" para estos partidos.
//
// Mapeo (homeTeam vs awayTeam según el calendario sembrado en seed.mjs):
//   #51  Suiza vs Canadá ................. Canadá 1 - 1 Suiza  → 1-1
//   #52  Bosnia y Herzegovina vs Qatar ... Bosnia 2 - 1 Qatar  → 2-1
//   #53  Escocia vs Brasil ............... Brasil 3 - 0 Escocia → 0-3
//   #54  Marruecos vs Haití .............. Marruecos 3 - 0 Haití → 3-0
//
// Uso: node scripts/seed-admin-predictions.mjs
// Re-ejecutable: usa upsert, no duplica predicciones.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// [matchNumber, homeScore, awayScore]  (home/away según seed.mjs)
const PREDICTIONS = [
  [51, 1, 1], // Suiza 1 - 1 Canadá
  [52, 2, 1], // Bosnia 2 - 1 Qatar
  [53, 0, 3], // Escocia 0 - 3 Brasil
  [54, 3, 0], // Marruecos 3 - 0 Haití
];

// Usuario objetivo: se busca por nombre "FOC" (case-insensitive).
const TARGET_NAME = "FOC";

async function main() {
  const user = await prisma.user.findFirst({
    where: { name: { equals: TARGET_NAME, mode: "insensitive" } },
  });

  if (!user) {
    console.error(`✗ No se encontró el usuario "${TARGET_NAME}".`);
    process.exit(1);
  }

  console.log(`🌱 Cargando ${PREDICTIONS.length} predicciones para: ${user.name} <${user.email}>`);
  let created = 0, updated = 0;

  for (const [num, homeScore, awayScore] of PREDICTIONS) {
    const match = await prisma.match.findUnique({ where: { matchNumber: num } });
    if (!match) {
      console.warn(`  ⚠ Partido #${num} no existe. Corre scripts/seed.mjs primero. Se omite.`);
      continue;
    }

    const existing = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId: user.id, matchId: match.id } },
    });

    await prisma.prediction.upsert({
      where: { userId_matchId: { userId: user.id, matchId: match.id } },
      create: { userId: user.id, matchId: match.id, homeScore, awayScore },
      update: { homeScore, awayScore },
    });

    console.log(`  ✓ #${num} ${match.homeTeam} ${homeScore} - ${awayScore} ${match.awayTeam}`);
    if (existing) updated++;
    else created++;
  }

  console.log("");
  console.log(`✓ ${created} predicciones creadas, ${updated} actualizadas.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
