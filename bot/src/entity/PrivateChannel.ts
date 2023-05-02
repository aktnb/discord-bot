import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Member } from "./Member";

@Entity()
export class PrivateChannel {
  @PrimaryColumn()
  voiceChannelId!: string;

  @Column({nullable: true, default: null, type: 'varchar'})
  roleId?: string | null = null;

  @Column({nullable: true, default: null, type: 'varchar'})
  textChannelId?: string | null = null;

  @OneToMany(() => Member, member => member.privateChannel)
  members!: Member[];
}
