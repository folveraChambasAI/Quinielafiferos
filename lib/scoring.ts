// Scoring rules for Quiniela Mundial 2026
// Group stage: exact = 5, result = 3
// Knockouts: exact = 10, advance correct = 6

export type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter"
  | "semi"
  | "third_place"
  | "final";

export const STAGE_LABELS: Record<MatchStage, string> = {
  group: "Fase de Grupos",
  round_of_32: "Dieciseisavos",
  round_of_16: "Octavos",
  quarter: "Cuartos de Final",
  semi: "Semifinal",
  third_place: "Tercer Lugar",
  final: "Final",
};

export function isKnockoutStage(stage: string): boolean {
  return stage !== "group";
}

interface PredictionInput {
  homeScore: number;
  awayScore: number;
  winnerOnPens?: string | null;
}

interface MatchResultInput {
  homeScore: number;
  awayScore: number;
  winnerOnPens?: string | null;
  stage: string;
}

export function calculateMatchPoints(
  prediction: PredictionInput,
  result: MatchResultInput
): number {
  const exactScore =
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore;

  // For knockout stages: 10 pts exact + correct advance, 6 pts correct advance only
  if (isKnockoutStage(result.stage)) {
    const predIsDraw = prediction.homeScore === prediction.awayScore;
    const resultIsDraw = result.homeScore === result.awayScore;

    // Determine who advanced in each (using a unified key)
    // For decisive results: "home" or "away" based on who won at 90'
    // For draws (KO): the pens winner team name (which is homeTeam or awayTeam)
    const predAdvanceKey = predIsDraw
      ? prediction.winnerOnPens ?? null
      : prediction.homeScore > prediction.awayScore
      ? "home"
      : "away";
    const realAdvanceKey = resultIsDraw
      ? result.winnerOnPens ?? null
      : result.homeScore > result.awayScore
      ? "home"
      : "away";

    const advanceMatches =
      predAdvanceKey !== null && predAdvanceKey === realAdvanceKey;

    if (exactScore && advanceMatches) return 10;
    if (advanceMatches) return 6;
    return 0;
  }

  // Group stage
  if (exactScore) return 5;

  const predResult =
    prediction.homeScore > prediction.awayScore
      ? "home"
      : prediction.homeScore < prediction.awayScore
      ? "away"
      : "draw";
  const realResult =
    result.homeScore > result.awayScore
      ? "home"
      : result.homeScore < result.awayScore
      ? "away"
      : "draw";

  if (predResult === realResult) return 3;
  return 0;
}

export const SPECIAL_POINTS = {
  champion: 25,
  runnerUp: 15,
  thirdPlace: 10,
  topScorer: 15,
  bestPlayer: 10,
  revelationTeam: 10,
} as const;

export function calculateSpecialPoints(
  prediction: {
    champion?: string | null;
    runnerUp?: string | null;
    thirdPlace?: string | null;
    topScorer?: string | null;
    bestPlayer?: string | null;
    revelationTeam?: string | null;
  },
  result: {
    champion?: string | null;
    runnerUp?: string | null;
    thirdPlace?: string | null;
    topScorer?: string | null;
    bestPlayer?: string | null;
    revelationTeam?: string | null;
  }
): number {
  let pts = 0;
  if (prediction.champion && result.champion && prediction.champion === result.champion)
    pts += SPECIAL_POINTS.champion;
  if (prediction.runnerUp && result.runnerUp && prediction.runnerUp === result.runnerUp)
    pts += SPECIAL_POINTS.runnerUp;
  if (
    prediction.thirdPlace &&
    result.thirdPlace &&
    prediction.thirdPlace === result.thirdPlace
  )
    pts += SPECIAL_POINTS.thirdPlace;
  if (prediction.topScorer && result.topScorer && prediction.topScorer === result.topScorer)
    pts += SPECIAL_POINTS.topScorer;
  if (
    prediction.bestPlayer &&
    result.bestPlayer &&
    prediction.bestPlayer === result.bestPlayer
  )
    pts += SPECIAL_POINTS.bestPlayer;
  if (
    prediction.revelationTeam &&
    result.revelationTeam &&
    prediction.revelationTeam === result.revelationTeam
  )
    pts += SPECIAL_POINTS.revelationTeam;
  return pts;
}

// Prediction deadline: 1 hour before kickoff
export function predictionLockTime(kickoffAt: Date): Date {
  return new Date(kickoffAt.getTime() - 60 * 60 * 1000);
}

export function isPredictionOpen(kickoffAt: Date): boolean {
  return new Date() < predictionLockTime(kickoffAt);
}
