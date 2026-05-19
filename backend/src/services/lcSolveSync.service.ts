import { prisma } from "../prismac";
import { getRecentAcceptedLeetCodeSubmissions } from "./leetcode";

const LEETCODE_LIMIT = 100;

export async function syncLast30DaysLeetCodeSolves(
  userId: string,
  username: string,
  platformId: number
) {
  const cutoff = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const submissions = await getRecentAcceptedLeetCodeSubmissions(
    username,
    LEETCODE_LIMIT
  );

  const seen = new Set<string>();

  for (const s of submissions) {
    const solvedAtSeconds = Number(s.timestamp);
    if (!Number.isFinite(solvedAtSeconds) || solvedAtSeconds < cutoff) {
      continue;
    }

    if (seen.has(s.titleSlug)) continue;
    seen.add(s.titleSlug);

    await upsertLeetCodeSolve(userId, platformId, {
      title: s.title,
      titleSlug: s.titleSlug,
      solvedAt: new Date(solvedAtSeconds * 1000),
    });
  }
}

export async function syncLast24HoursLeetCodeSolves(
  userId: string,
  username: string,
  platformId: number
) {
  const cutoff = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
  const submissions = await getRecentAcceptedLeetCodeSubmissions(username, 50);

  const seen = new Set<string>();

  for (const s of submissions) {
    const solvedAtSeconds = Number(s.timestamp);
    if (!Number.isFinite(solvedAtSeconds) || solvedAtSeconds < cutoff) {
      continue;
    }

    if (seen.has(s.titleSlug)) continue;
    seen.add(s.titleSlug);

    await upsertLeetCodeSolve(userId, platformId, {
      title: s.title,
      titleSlug: s.titleSlug,
      solvedAt: new Date(solvedAtSeconds * 1000),
    });
  }
}

async function upsertLeetCodeSolve(
  userId: string,
  platformId: number,
  raw: { title: string; titleSlug: string; solvedAt: Date }
) {
  const problem = await prisma.problem.upsert({
    where: {
      platformId_externalId: {
        platformId,
        externalId: raw.titleSlug,
      },
    },
    create: {
      platformId,
      externalId: raw.titleSlug,
      title: raw.title,
      url: `https://leetcode.com/problems/${raw.titleSlug}/`,
    },
    update: {
      title: raw.title,
      url: `https://leetcode.com/problems/${raw.titleSlug}/`,
    },
  });

  await prisma.solve.upsert({
    where: {
      userId_problemId: { userId, problemId: problem.id },
    },
    create: {
      userId,
      problemId: problem.id,
      solvedAt: raw.solvedAt,
    },
    update: {},
  });
}
