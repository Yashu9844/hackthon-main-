-- Create temporal_commitment table
CREATE TABLE IF NOT EXISTS "temporal_commitment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "credentialId" TEXT NOT NULL,
    "epoch" INTEGER NOT NULL,
    "commitment" TEXT NOT NULL,
    "revealedSecret" TEXT,
    "revealDeadline" TIMESTAMP(3) NOT NULL,
    "revealed" BOOLEAN NOT NULL DEFAULT false,
    "revealedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "temporal_commitment_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "credential"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique index on credentialId and epoch
CREATE UNIQUE INDEX IF NOT EXISTS "temporal_commitment_credentialId_epoch_key" ON "temporal_commitment"("credentialId", "epoch");

-- Create index on revealDeadline and revealed
CREATE INDEX IF NOT EXISTS "temporal_commitment_revealDeadline_revealed_idx" ON "temporal_commitment"("revealDeadline", "revealed");

-- Create index on credentialId
CREATE INDEX IF NOT EXISTS "temporal_commitment_credentialId_idx" ON "temporal_commitment"("credentialId");

-- Create temporal_reveal_event table
CREATE TABLE IF NOT EXISTS "temporal_reveal_event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commitmentId" TEXT NOT NULL,
    "revealedSecret" TEXT NOT NULL,
    "revealedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txHash" TEXT
);

-- Create index on commitmentId
CREATE INDEX IF NOT EXISTS "temporal_reveal_event_commitmentId_idx" ON "temporal_reveal_event"("commitmentId");
