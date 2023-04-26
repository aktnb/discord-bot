import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm"
import { PrivateChannel } from "./PrivateChannel";

@Entity()
export class Member {
  @PrimaryColumn()
  userId!: string;

  @Column()
  name!: string;

  @ManyToOne(() => PrivateChannel, privateChannel => privateChannel.members)
  privateChannel!: PrivateChannel;
}
