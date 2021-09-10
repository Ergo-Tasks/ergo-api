import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Task } from "./Task";

@Entity()
export class TaskCompletion extends BaseEntity{
  
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({type: 'date'})
  completionDate!: string

  @Column({type: 'timestamptz'})
  completionTime!: Date
  
  @ManyToOne(() => Task, task => task.taskCompletion)
  task?: Task[];

}