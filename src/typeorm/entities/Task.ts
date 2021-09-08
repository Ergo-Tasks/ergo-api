import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Tag } from "./Tag";
import { User } from "./User"

enum DaysOfTheWeek {    //export?
  SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
}

interface IDate {       //export?
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
  taskDate?: String;
  
  @Column({ type: 'timestamptz' })
  taskTimestamp?: Date;
  
  @ManyToOne((type) => User, user => user.tasks) 
  user!: User;

  @ManyToMany((type) => Tag) 
  @JoinTable() 
  tags?: Tag[]; 

}