import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends BaseEntity{

  @PrimaryGeneratedColumn("uuid")
  id?: string;

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

}