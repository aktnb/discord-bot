import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "db",
  username: "discord",
  password: "postgres",
  port: 5432,
  synchronize: false,
  database: "discord",
  entities: [__dirname + "/entity/**/*{.ts,.js}"],
  migrations: [__dirname + "/migration/**/*{.ts,.js}"]
});