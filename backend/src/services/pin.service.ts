import { Prisma } from "../../generated/prisma/client";
import { HttpError } from "../lib/httpError";
import { prisma } from "../lib/prisma";

const include = { repo: { include: { developer: { select: { githubUsername: true, avatarUrl: true } } } } } as const;

type PinWithRepo = Prisma.PinGetPayload<{ include: typeof include }>;

function toDto(p: PinWithRepo) {
  return {
    id: p.id,
    note: p.note,
    tags: p.tags,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    repo: {
      id: p.repo.id,
      name: p.repo.name,
      description: p.repo.description,
      url: p.repo.url,
      stars: p.repo.stars,
      primaryLanguage: p.repo.primaryLanguage,
      pushedAt: p.repo.pushedAt,
      owner: p.repo.developer.githubUsername,
      ownerAvatarUrl: p.repo.developer.avatarUrl,
    },
  };
}

export async function listPins(userId: number, tag?: string) {
  const pins = await prisma.pin.findMany({
    where: { userId, ...(tag ? { tags: { has: tag.toLowerCase() } } : {}) },
    include,
    orderBy: { createdAt: "desc" },
  });
  return { pins: pins.map(toDto) };
}

export async function createPin(userId: number, data: { repoId: number; note?: string; tags?: string[] }) {
  const repo = await prisma.repo.findUnique({ where: { id: data.repoId } });
  if (!repo) throw new HttpError(404, "Repository not found");

  try {
    const pin = await prisma.pin.create({
      data: { userId, repoId: data.repoId, note: data.note || null, tags: data.tags ?? [] },
      include,
    });
    return { pin: toDto(pin) };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new HttpError(409, "Repository already pinned");
    }
    throw e;
  }
}

export async function updatePin(
  userId: number,
  id: number,
  data: { note?: string | null; tags?: string[] }
) {
  const existing = await prisma.pin.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(404, "Pin not found");

  const pin = await prisma.pin.update({
    where: { id },
    data: {
      ...(data.note !== undefined ? { note: data.note || null } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
    },
    include,
  });
  return { pin: toDto(pin) };
}

export async function deletePin(userId: number, id: number) {
  const { count } = await prisma.pin.deleteMany({ where: { id, userId } });
  if (count === 0) throw new HttpError(404, "Pin not found");
}