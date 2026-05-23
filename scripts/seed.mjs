// Calendario oficial Mundial 2026 — Fase de grupos (72 partidos)
// Fuente: FIFA / KickoffAdventures (verificado 22 mayo 2026)
// Sorteo: 5 diciembre 2025 en Washington DC
//
// IMPORTANTE — HORAS:
// Todos los partidos están a las 12:00 CDMX como placeholder.
// El admin puede ajustar la hora exacta de cada partido desde /admin
// cuando lo necesite. Lo que importa para la quiniela es la FECHA
// (para saber cuándo cierran las predicciones).
//
// NOTAS:
// - Repechajes UEFA (mar 2026): Bosnia, Suecia, Turquía, Chequia clasificaron.
// - Repechajes Intercontinentales (mar 2026): RD del Congo (Path 1) e Irak (Path 2).
// - Grupo G: Irán está oficialmente inscrito al 22 mayo 2026, pero
//   su participación es incierta por el conflicto US-Irán.
//   Si FIFA confirma reemplazo, edita los partidos desde /admin.
// - Las eliminatorias (Round of 32 en adelante) se agregan desde
//   /admin cuando se definan los cruces (a partir del 28 jun 2026).
//
// Uso: node scripts/seed.mjs
// Re-ejecutable: usa upsert, no duplica partidos.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// [matchNumber, group, homeTeam, awayTeam, "YYYY-MM-DD"]
const FIXTURES = [
  // ───────────── JORNADA 1 ─────────────

  // Jueves 11 junio
  [1,  "A", "México",                  "Sudáfrica",                "2026-06-11"],
  [2,  "A", "Corea del Sur",           "Chequia","2026-06-11"],

  // Viernes 12 junio
  [3,  "B", "Canadá",                  "Bosnia y Herzegovina","2026-06-12"],
  [4,  "D", "Estados Unidos",          "Paraguay",                 "2026-06-12"],

  // Sábado 13 junio
  [5,  "D", "Australia",               "Turquía","2026-06-13"],
  [6,  "B", "Qatar",                   "Suiza",                    "2026-06-13"],
  [7,  "C", "Brasil",                  "Marruecos",                "2026-06-13"],
  [8,  "C", "Haití",                   "Escocia",                  "2026-06-13"],

  // Domingo 14 junio
  [9,  "E", "Alemania",                "Curazao",                  "2026-06-14"],
  [10, "F", "Países Bajos",            "Japón",                    "2026-06-14"],
  [11, "E", "Costa de Marfil",         "Ecuador",                  "2026-06-14"],
  [12, "F", "Suecia","Túnez",                   "2026-06-14"],

  // Lunes 15 junio
  [13, "H", "España",                  "Cabo Verde",               "2026-06-15"],
  [14, "G", "Bélgica",                 "Egipto",                   "2026-06-15"],
  [15, "H", "Arabia Saudita",          "Uruguay",                  "2026-06-15"],
  [16, "G", "Irán",                    "Nueva Zelanda",            "2026-06-15"],

  // Martes 16 junio
  [17, "I", "Francia",                 "Senegal",                  "2026-06-16"],
  [18, "I", "Irak", "Noruega",             "2026-06-16"],
  [19, "J", "Argentina",               "Argelia",                  "2026-06-16"],
  [20, "J", "Austria",                 "Jordania",                 "2026-06-16"],

  // Miércoles 17 junio
  [21, "K", "Portugal",                "RD del Congo","2026-06-17"],
  [22, "L", "Inglaterra",              "Croacia",                  "2026-06-17"],
  [23, "L", "Ghana",                   "Panamá",                   "2026-06-17"],
  [24, "K", "Uzbekistán",              "Colombia",                 "2026-06-17"],

  // ───────────── JORNADA 2 ─────────────

  // Jueves 18 junio
  [25, "A", "Chequia","Sudáfrica",               "2026-06-18"],
  [26, "B", "Suiza",                   "Bosnia y Herzegovina","2026-06-18"],
  [27, "B", "Canadá",                  "Qatar",                    "2026-06-18"],
  [28, "A", "México",                  "Corea del Sur",            "2026-06-18"],

  // Viernes 19 junio
  [29, "D", "Estados Unidos",          "Australia",                "2026-06-19"],
  [30, "C", "Escocia",                 "Marruecos",                "2026-06-19"],
  [31, "C", "Brasil",                  "Haití",                    "2026-06-19"],
  [32, "D", "Turquía","Paraguay",                "2026-06-19"],

  // Sábado 20 junio
  [33, "F", "Países Bajos",            "Suecia","2026-06-20"],
  [34, "E", "Alemania",                "Costa de Marfil",          "2026-06-20"],
  [35, "E", "Ecuador",                 "Curazao",                  "2026-06-20"],
  [36, "F", "Túnez",                   "Japón",                    "2026-06-20"],

  // Domingo 21 junio
  [37, "H", "España",                  "Arabia Saudita",           "2026-06-21"],
  [38, "G", "Bélgica",                 "Irán",                     "2026-06-21"],
  [39, "H", "Uruguay",                 "Cabo Verde",               "2026-06-21"],
  [40, "G", "Nueva Zelanda",           "Egipto",                   "2026-06-21"],

  // Lunes 22 junio
  [41, "J", "Argentina",               "Austria",                  "2026-06-22"],
  [42, "I", "Francia",                 "Irak","2026-06-22"],
  [43, "I", "Noruega",                 "Senegal",                  "2026-06-22"],
  [44, "J", "Jordania",                "Argelia",                  "2026-06-22"],

  // Martes 23 junio
  [45, "K", "Portugal",                "Uzbekistán",               "2026-06-23"],
  [46, "L", "Inglaterra",              "Ghana",                    "2026-06-23"],
  [47, "L", "Panamá",                  "Croacia",                  "2026-06-23"],
  [48, "K", "Colombia",                "RD del Congo","2026-06-23"],

  // ───────────── JORNADA 3 (simultáneos) ─────────────

  // Miércoles 24 junio — Grupos A, B, C
  [49, "A", "Chequia","México",                  "2026-06-24"],
  [50, "A", "Sudáfrica",               "Corea del Sur",            "2026-06-24"],
  [51, "B", "Suiza",                   "Canadá",                   "2026-06-24"],
  [52, "B", "Bosnia y Herzegovina","Qatar",                   "2026-06-24"],
  [53, "C", "Escocia",                 "Brasil",                   "2026-06-24"],
  [54, "C", "Marruecos",               "Haití",                    "2026-06-24"],

  // Jueves 25 junio — Grupos D, E, F
  [55, "D", "Turquía","Estados Unidos",          "2026-06-25"],
  [56, "D", "Paraguay",                "Australia",                "2026-06-25"],
  [57, "E", "Ecuador",                 "Alemania",                 "2026-06-25"],
  [58, "E", "Curazao",                 "Costa de Marfil",          "2026-06-25"],
  [59, "F", "Japón",                   "Suecia","2026-06-25"],
  [60, "F", "Túnez",                   "Países Bajos",             "2026-06-25"],

  // Viernes 26 junio — Grupos G, H, I
  [61, "G", "Egipto",                  "Irán",                     "2026-06-26"],
  [62, "G", "Nueva Zelanda",           "Bélgica",                  "2026-06-26"],
  [63, "H", "Cabo Verde",              "Arabia Saudita",           "2026-06-26"],
  [64, "H", "Uruguay",                 "España",                   "2026-06-26"],
  [65, "I", "Noruega",                 "Francia",                  "2026-06-26"],
  [66, "I", "Senegal",                 "Irak","2026-06-26"],

  // Sábado 27 junio — Grupos J, K, L
  [67, "J", "Argelia",                 "Austria",                  "2026-06-27"],
  [68, "J", "Jordania",                "Argentina",                "2026-06-27"],
  [69, "K", "Colombia",                "Portugal",                 "2026-06-27"],
  [70, "K", "RD del Congo","Uzbekistán",           "2026-06-27"],
  [71, "L", "Panamá",                  "Inglaterra",               "2026-06-27"],
  [72, "L", "Croacia",                 "Ghana",                    "2026-06-27"],
];

async function main() {
  console.log(`🌱 Cargando ${FIXTURES.length} partidos de fase de grupos...`);
  let created = 0, updated = 0;

  for (const [num, group, home, away, dateStr] of FIXTURES) {
    const existing = await prisma.match.findUnique({ where: { matchNumber: num } });
    // Set kickoff to 12:00 noon Mexico City time as placeholder
    const kickoffAt = new Date(`${dateStr}T12:00:00-06:00`);

    await prisma.match.upsert({
      where: { matchNumber: num },
      create: {
        matchNumber: num,
        stage: "group",
        group,
        homeTeam: home,
        awayTeam: away,
        kickoffAt,
      },
      update: {
        stage: "group",
        group,
        homeTeam: home,
        awayTeam: away,
        // No sobrescribimos kickoffAt en updates — para no pisar horas
        // que el admin haya ajustado manualmente. Si quieres resetearlo,
        // borra el partido y vuelve a correr el seed.
      },
    });
    if (existing) updated++;
    else created++;
  }

  console.log(`✓ ${created} partidos creados, ${updated} actualizados.`);
  console.log("");
  console.log("📌 Siguiente paso:");
  console.log("   Las horas están a las 12:00 CDMX como placeholder.");
  console.log("   Ajústalas desde /admin → Partidos antes del torneo,");
  console.log("   porque el cierre de predicciones es 1h antes de cada partido.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
