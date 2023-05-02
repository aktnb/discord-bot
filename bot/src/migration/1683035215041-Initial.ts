import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1683035215041 implements MigrationInterface {
    name = 'Initial1683035215041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "private_channel" ("voiceChannelId" character varying NOT NULL, "roleId" character varying, "textChannelId" character varying, CONSTRAINT "PK_800361ee81151fd1157be46646b" PRIMARY KEY ("voiceChannelId"))`);
        await queryRunner.query(`CREATE TABLE "member" ("userId" character varying NOT NULL, "privateChannelVoiceChannelId" character varying, CONSTRAINT "PK_08897b166dee565859b7fb2fcc8" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "FK_8dab14238f44a7de035cdba802a" FOREIGN KEY ("privateChannelVoiceChannelId") REFERENCES "private_channel"("voiceChannelId") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "FK_8dab14238f44a7de035cdba802a"`);
        await queryRunner.query(`DROP TABLE "member"`);
        await queryRunner.query(`DROP TABLE "private_channel"`);
    }

}
