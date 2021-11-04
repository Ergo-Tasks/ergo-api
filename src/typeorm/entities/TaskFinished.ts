import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Task } from "./Task";

@Entity()
export class TaskFinished extends BaseEntity{
  
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column()
  completionTimestamp!: number
  
  @ManyToOne(() => Task, task => task.taskFinished)
  task?: Task[];

}
