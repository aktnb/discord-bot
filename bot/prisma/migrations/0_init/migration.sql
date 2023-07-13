-- CreateTable
CREATE TABLE "member" (
    "userId" VARCHAR NOT NULL,
    "privateChannelVoiceChannelId" VARCHAR,

    CONSTRAINT "PK_08897b166dee565859b7fb2fcc8" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR,
    "urlToImg" VARCHAR,
    "source" VARCHAR NOT NULL,
    "published_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_channel" (
    "voiceChannelId" VARCHAR NOT NULL,
    "roleId" VARCHAR,
    "textChannelId" VARCHAR,

    CONSTRAINT "PK_800361ee81151fd1157be46646b" PRIMARY KEY ("voiceChannelId")
);

-- CreateTable
CREATE TABLE "response" (
    "id" SERIAL NOT NULL,
    "response" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "guildId" VARCHAR,
    "authorUserId" VARCHAR,

    CONSTRAINT "PK_f64544baf2b4dc48ba623ce768f" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vc_notification" (
    "id" SERIAL NOT NULL,
    "voiceChannelId" VARCHAR NOT NULL,
    "always" BOOLEAN NOT NULL,
    "all" BOOLEAN NOT NULL,
    "memberUserId" VARCHAR,

    CONSTRAINT "PK_3eb9d1286d778bb1e06914c5295" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UQ_824cf2fe42ed976967662627063" ON "news"("url");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_fbad5ca1e62356daf6845fd4f6f" ON "response"("key", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_467af850af8e2ca5d357edfd840" ON "vc_notification"("memberUserId", "voiceChannelId");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "FK_8dab14238f44a7de035cdba802a" FOREIGN KEY ("privateChannelVoiceChannelId") REFERENCES "private_channel"("voiceChannelId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "FK_29eb0d1777dc420ed6a41ab90c9" FOREIGN KEY ("authorUserId") REFERENCES "member"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vc_notification" ADD CONSTRAINT "FK_f5fef802fe2db628c849dadf734" FOREIGN KEY ("memberUserId") REFERENCES "member"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION;

