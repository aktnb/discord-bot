import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNewsTable1684504548219 implements MigrationInterface {
    name = 'CreateNewsTable1684504548219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "news" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying, "urlToImg" character varying, "source" character varying NOT NULL, "published_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_824cf2fe42ed976967662627063" UNIQUE ("url"), CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "news"`);
    }

}
