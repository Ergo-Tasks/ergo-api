import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

import { User } from "./User";

@Entity()
export class Tag extends BaseEntity{

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column()
  tagName!: string;

  @Column()
  tagColor!: string;
  
  @ManyToOne(() => User, user => user.tags)
  user!: User;

}