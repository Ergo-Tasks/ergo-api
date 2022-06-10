import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from "typeorm";

import { Tag } from "./Tag";
import { Task } from "./Task";

export const userRelations = ['tasks', 'tasks.taskRecords', 'tasks.tags', 'tags'];

@Entity()
export class User extends BaseEntity{

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @CreateDateColumn()
  createdDate?: Date;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  userName!: string;

  @Column()
  password!: string;

  @Column({
    unique: true
  })
  email!: string;

  @OneToMany(() => Task, task => task.user)
  tasks!: Task[];

  @OneToMany(() => Tag, tag => tag.user, {
    cascade: true
  })
  tags?: Tag[];

}
