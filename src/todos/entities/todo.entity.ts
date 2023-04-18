import { BeforeCreate, Entity, EventArgs, Index, PrimaryKey, Property } from '@mikro-orm/core';

const TODOS_LIMIT = 50;

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

  @BeforeCreate()
  async beforeCreate(args: EventArgs<Todo>) {
    const currentCount = await args.em.count(Todo);

    return currentCount >= TODOS_LIMIT
      ? Promise.reject('Limit of todos is reached')
      : Promise.resolve()
  }
}
