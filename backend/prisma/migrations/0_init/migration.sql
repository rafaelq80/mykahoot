-- Migration: 0_init
-- Initial schema for QuizLive MVP

CREATE TABLE "Theme" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Quiz" (
    "id"      TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "title"   TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Question" (
    "id"           TEXT NOT NULL,
    "quizId"       TEXT NOT NULL,
    "text"         TEXT NOT NULL,
    "imageUrl"     TEXT,
    "options"      JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "timeLimitSec" INTEGER NOT NULL DEFAULT 20,
    "order"        INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameSession" (
    "id"       TEXT NOT NULL,
    "quizId"   TEXT NOT NULL,
    "status"   TEXT NOT NULL DEFAULT 'em_andamento',
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlayerResult" (
    "id"            TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "nickname"      TEXT NOT NULL,
    "avatar"        TEXT NOT NULL,
    "score"         INTEGER NOT NULL,
    "answers"       JSONB NOT NULL,

    CONSTRAINT "PlayerResult_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "Quiz"
    ADD CONSTRAINT "Quiz_themeId_fkey"
    FOREIGN KEY ("themeId") REFERENCES "Theme"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Question"
    ADD CONSTRAINT "Question_quizId_fkey"
    FOREIGN KEY ("quizId") REFERENCES "Quiz"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GameSession"
    ADD CONSTRAINT "GameSession_quizId_fkey"
    FOREIGN KEY ("quizId") REFERENCES "Quiz"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlayerResult"
    ADD CONSTRAINT "PlayerResult_gameSessionId_fkey"
    FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
