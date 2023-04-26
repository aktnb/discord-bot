import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Member } from "./Member";

@Entity()
export class PrivateChannel {
  @PrimaryColumn()
  voiceChannelId!: string;

  @Column()
  roleId!: string;

  @Column()
  textChannelId!: string;

  @OneToMany(() => Member, member => member.privateChannel)
  members!: Member[];
}
