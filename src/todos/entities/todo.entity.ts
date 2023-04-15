import { DateType, Entity, Index, PrimaryKey, Property, DateTimeType } from '@mikro-orm/core';

@Entity({ tableName: 'todos' })
export class Todo {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  @Index()
  todo!: string;

  @Property({ nullable: false })
  completed = false;

  @Property({ nullable: false, hidden: true })
  createdAt: Date = new Date();

  @Property({ nullable: false, hidden: true, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(todo: string) {
    this.todo = todo;
  }
}
