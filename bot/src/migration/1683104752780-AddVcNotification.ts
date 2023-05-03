import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVcNotification1683104752780 implements MigrationInterface {
    name = 'AddVcNotification1683104752780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "vc_notification" (
                "id" SERIAL NOT NULL,
                "voiceChannelId" character varying NOT NULL,
                "always" boolean NOT NULL,
                "all" boolean NOT NULL,
                "self" boolean NOT NULL,
                "afterJoin" boolean NOT NULL,
                "memberUserId" character varying,
                CONSTRAINT "UQ_467af850af8e2ca5d357edfd840" UNIQUE ("memberUserId", "voiceChannelId"),
                CONSTRAINT "PK_3eb9d1286d778bb1e06914c5295" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "vc_notification"
            ADD CONSTRAINT "FK_f5fef802fe2db628c849dadf734" FOREIGN KEY ("memberUserId") REFERENCES "member"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "vc_notification" DROP CONSTRAINT "FK_f5fef802fe2db628c849dadf734"
        `);
        await queryRunner.query(`
            DROP TABLE "vc_notification"
        `);
    }

}
