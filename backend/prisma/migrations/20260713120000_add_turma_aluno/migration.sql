-- CreateTable
CREATE TABLE "Turma" (
    "id"        TEXT NOT NULL,
    "nome"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id"      TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "nome"    TEXT NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "PlayerResult" ADD COLUMN "turmaId" TEXT;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey"
    FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_turmaId_fkey"
    FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Aluno_turmaId_idx" ON "Aluno"("turmaId");

-- CreateIndex
CREATE INDEX "PlayerResult_turmaId_idx" ON "PlayerResult"("turmaId");
