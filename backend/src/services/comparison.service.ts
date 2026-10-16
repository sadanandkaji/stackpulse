import { HttpError } from "../lib/httpError";
import { prisma } from "../lib/prisma";
import { compareDevelopers } from "./compare.service";

async function findOwned(userId: number, id: number) {
  const comparison = await prisma.comparison.findFirst({ where: { id, userId } });
  if (!comparison) throw new HttpError(404, "Comparison not found");
  return comparison;
}

export async function listComparisons(userId: number) {
  const comparisons = await prisma.comparison.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return { comparisons };
}

/** Returns the saved comparison plus freshly computed results (served from the DB cache when possible). */
export async function getComparison(userId: number, id: number) {
  const comparison = await findOwned(userId, id);
  const result = await compareDevelopers(comparison.usernames.join(","));
  return { comparison, result };
}

export async function createComparison(userId: number, data: { name: string; usernames: string[] }) {
  const comparison = await prisma.comparison.create({
    data: { userId, name: data.name, usernames: data.usernames },
  });
  return { comparison };
}

export async function updateComparison(
  userId: number,
  id: number,
  data: { name?: string; usernames?: string[] }
) {
  await findOwned(userId, id);
  const comparison = await prisma.comparison.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.usernames !== undefined ? { usernames: data.usernames } : {}),
    },
  });
  return { comparison };
}

export async function deleteComparison(userId: number, id: number) {
  const { count } = await prisma.comparison.deleteMany({ where: { id, userId } });
  if (count === 0) throw new HttpError(404, "Comparison not found");
}