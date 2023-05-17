import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUnique1684330578153 implements MigrationInterface {
    name = 'ChangeUnique1684330578153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "response" ADD CONSTRAINT "UQ_fbad5ca1e62356daf6845fd4f6f" UNIQUE ("key", "guildId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "response" DROP CONSTRAINT "UQ_fbad5ca1e62356daf6845fd4f6f"`);
    }

}
