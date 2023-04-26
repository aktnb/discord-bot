import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1682532164104 implements MigrationInterface {
    name = 'InitialSchema1682532164104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "member" ("userId" character varying NOT NULL, "name" character varying NOT NULL, "privateChannelVoiceChannelId" character varying, CONSTRAINT "PK_08897b166dee565859b7fb2fcc8" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "private_channel" ("voiceChannelId" character varying NOT NULL, "roleId" character varying NOT NULL, "textChannelId" character varying NOT NULL, CONSTRAINT "PK_800361ee81151fd1157be46646b" PRIMARY KEY ("voiceChannelId"))`);
        await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "FK_8dab14238f44a7de035cdba802a" FOREIGN KEY ("privateChannelVoiceChannelId") REFERENCES "private_channel"("voiceChannelId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "FK_8dab14238f44a7de035cdba802a"`);
        await queryRunner.query(`DROP TABLE "private_channel"`);
        await queryRunner.query(`DROP TABLE "member"`);
    }

}
