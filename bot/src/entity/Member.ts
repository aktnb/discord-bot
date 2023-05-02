import { Entity, ManyToOne, PrimaryColumn } from "typeorm"
import { PrivateChannel } from "./PrivateChannel";

@Entity()
export class Member {
  @PrimaryColumn()
  userId!: string;

  @ManyToOne(() => PrivateChannel, privateChannel => privateChannel.members, {nullable: true, onDelete: 'SET NULL'})
  privateChannel?: PrivateChannel | null = null;
}
