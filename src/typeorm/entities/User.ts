import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Task } from "./Task";

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

  @OneToMany((type) => Task, task => task.id) tasks?: Task[];

}