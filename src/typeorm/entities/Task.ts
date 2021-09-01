import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Tag } from "./Tag";
import { User } from "./User"

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

  @Column({ type: 'date' })
  date!: string;
  
  @Column({ type: 'timestamptz' })
  timestamp!: Date;
  
  @ManyToOne((type) => User, user => user.tasks) user?: User;
  @ManyToMany((type) => Tag) @JoinTable() tags?: Tag[]; 

}