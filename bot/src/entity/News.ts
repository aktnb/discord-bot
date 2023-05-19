import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['url'])
export class News {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  url!: string;

  @Column()
  title!: string;

  @Column({ nullable: true, default: null, type: 'varchar' })
  description?: string | null = null;

  @Column({ nullable: true, default: null, type: 'varchar'})
  urlToImg?: string | null = null;

  @Column()
  source!: string;

  @Column()
  published_at!: Date;
}