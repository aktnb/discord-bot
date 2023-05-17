import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Member } from "./Member";

@Entity()
@Unique(['key', 'guildId'])
export class Response {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  response!: string;

  @Column()
  key!: string;

  @ManyToOne(() => Member, author => author.responses)
  author!: Member;

  @Column({ nullable: true, default: null, type: 'varchar' })
  guildId?: string | null = null;
}
