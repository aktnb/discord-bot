import { MigrationInterface, QueryRunner } from "typeorm";

export class Response1683468834815 implements MigrationInterface {
    name = 'Response1683468834815'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "response" ("id" SERIAL NOT NULL, "response" character varying NOT NULL, "key" character varying NOT NULL, "guildId" character varying, "authorUserId" character varying, CONSTRAINT "PK_f64544baf2b4dc48ba623ce768f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "response" ADD CONSTRAINT "FK_29eb0d1777dc420ed6a41ab90c9" FOREIGN KEY ("authorUserId") REFERENCES "member"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "response" DROP CONSTRAINT "FK_29eb0d1777dc420ed6a41ab90c9"`);
        await queryRunner.query(`DROP TABLE "response"`);
    }

}
