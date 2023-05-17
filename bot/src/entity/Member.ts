import { Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm"
import { PrivateChannel } from "./PrivateChannel";
import { VcNotification } from "./VcNotification";
import { Response } from "./Response";

@Entity()
export class Member {
  @PrimaryColumn()
  userId!: string;

  @ManyToOne(() => PrivateChannel, privateChannel => privateChannel.members, {nullable: true, onDelete: 'SET NULL'})
  privateChannel?: PrivateChannel | null = null;

  @OneToMany(() => VcNotification, notification => notification.member)
  notifications?: VcNotification[];

  @OneToMany(() => Response, responses => responses.author)
  responses?: Response[];
}
