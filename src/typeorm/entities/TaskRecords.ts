import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Task } from "./Task";

@Entity()
export class TaskRecords extends BaseEntity{
  
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column()
  completionTime!: number

  @Column()
  completion!: boolean
  
  @ManyToOne(() => Task, task => task.taskRecords)
  task?: Task[];

}
