import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Tag } from "./Tag";
import { User } from "./User"
import { TaskRecords } from "./TaskRecords";

export const taskRelations = ['taskRecords', 'tags'];

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

  @Column('simple-array', { nullable: true })
  recTaskDate?: IDate[];

  @Column({ nullable: true })
  taskDate?: number;
  
  //first param sets the type of the entity being related to, second param sets where the relation is pointing to.
  //switch to !:
  @OneToMany(() => TaskRecords, taskRecords => taskRecords.task)
  taskRecords?: TaskRecords[];

  @ManyToOne(() => User, user => user.tasks) 
  user!: User;

  @ManyToMany(() => Tag, {
    cascade: true,
    eager: true
  })
  @JoinTable()
  tags?: Tag[];
}
