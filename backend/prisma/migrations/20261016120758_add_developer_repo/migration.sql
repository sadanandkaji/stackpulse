-- CreateTable
CREATE TABLE "Developer" (
    "id" SERIAL NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT NOT NULL,
    "bio" TEXT,
    "followers" INTEGER NOT NULL,
    "publicRepos" INTEGER NOT NULL,
    "totalStars" INTEGER NOT NULL DEFAULT 0,
    "languageBreakdown" JSONB,
    "commitActivity" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repo" (
    "id" SERIAL NOT NULL,
    "developerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "primaryLanguage" TEXT,
    "pushedAt" TIMESTAMP(3),
    "isFork" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Developer_githubUsername_key" ON "Developer"("githubUsername");

-- CreateIndex
CREATE INDEX "Repo_developerId_stars_idx" ON "Repo"("developerId", "stars");

-- CreateIndex
CREATE UNIQUE INDEX "Repo_developerId_name_key" ON "Repo"("developerId", "name");

-- AddForeignKey
ALTER TABLE "Repo" ADD CONSTRAINT "Repo_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
