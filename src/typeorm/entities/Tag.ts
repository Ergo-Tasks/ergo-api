import { Column, Entity, BaseEntity } from "typeorm";

@Entity()
export class Tag extends BaseEntity{

  @Column("uuid")
  id?: string;

  @Column()
  tagName!: string;

  @Column()
  tagColor!: string;

}