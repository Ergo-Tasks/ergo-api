import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Task } from "./Task";

//for task tests, to findOne user where relation: userRelations, an array of 'tasks'
export const userRelations = ['tasks'];

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

}
