import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Member } from "./Member";

@Entity()
@Unique(['member', 'voiceChannelId'])
export class VcNotification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Member, member => member.notifications)
  member!: Member;

  @Column()
  voiceChannelId!: string;

  @Column()
  always!: boolean;

  @Column()
  all!: boolean;
}