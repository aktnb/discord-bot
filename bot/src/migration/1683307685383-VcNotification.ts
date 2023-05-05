import { MigrationInterface, QueryRunner } from "typeorm";

export class VcNotification1683307685383 implements MigrationInterface {
    name = 'VcNotification1683307685383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vc_notification" DROP COLUMN "self"`);
        await queryRunner.query(`ALTER TABLE "vc_notification" DROP COLUMN "afterJoin"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vc_notification" ADD "afterJoin" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vc_notification" ADD "self" boolean NOT NULL`);
    }

}
