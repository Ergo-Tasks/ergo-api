import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Tag } from "./Tag";
import { User } from "./User"
import { TaskCompletion } from "./TaskCompletion";

export enum DaysOfTheWeek {
  SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
}

export interface IDate { 
  day: DaysOfTheWeek,
  time: number
}

@Entity()
export class Task extends BaseEntity{

  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column()
  taskName!: string;

  @Column()
  taskDescription!: string;

  @Column()
  isRecursive!: boolean;

  @Column({type: 'array' })
  recTaskDate?: IDate[];

  @Column({ type: 'date' })
  taskDate?: string;
  
  @Column({ type: 'timestamptz' })
  taskTimestamp?: Date;
  
  //first param sets the type of the entity being related to, second param sets where the relation is pointing to.
  @OneToMany(() => TaskCompletion, taskCompletion => taskCompletion.task)
  taskCompletion?: TaskCompletion[];

  @ManyToOne(() => User, user => user.tasks) 
  user!: User;

  @ManyToMany(() => Tag) 
  @JoinTable() 
  tags?: Tag[]; 


}