-- CreateTable
CREATE TABLE "credential" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "graduationDate" TEXT NOT NULL,
    "studentId" TEXT,
    "vcCID" TEXT NOT NULL,
    "pdfCID" TEXT,
    "attestationUID" TEXT NOT NULL,
    "attestationTxHash" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revocationReason" TEXT,
    "issuerDID" TEXT NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credential_vcCID_key" ON "credential"("vcCID");

-- CreateIndex
CREATE UNIQUE INDEX "credential_attestationUID_key" ON "credential"("attestationUID");

-- CreateIndex
CREATE INDEX "credential_attestationUID_idx" ON "credential"("attestationUID");

-- CreateIndex
CREATE INDEX "credential_vcCID_idx" ON "credential"("vcCID");

-- CreateIndex
CREATE INDEX "credential_studentName_idx" ON "credential"("studentName");

-- AddForeignKey
ALTER TABLE "credential" ADD CONSTRAINT "credential_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
