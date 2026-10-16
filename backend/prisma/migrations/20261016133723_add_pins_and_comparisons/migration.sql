-- CreateTable
CREATE TABLE "Pin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "repoId" INTEGER NOT NULL,
    "note" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "usernames" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pin_userId_idx" ON "Pin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pin_userId_repoId_key" ON "Pin"("userId", "repoId");

-- CreateIndex
CREATE INDEX "Comparison_userId_idx" ON "Comparison"("userId");

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
