import { Injectable } from '@nestjs/common';
import { EntityRepository, FilterQuery, QueryOrder, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/sqlite';

import { Todo } from './entities/todo.entity';
import { CreateTodoDto, UpdateTodoDto, QueryParams } from './dto';

type ListTodosResponse = {
  completed: Todo[],
  incompleted: Todo[],
  latestTimestamp: string
}

const TODOS_SORT_ORDER = { orderBy: { createdAt: QueryOrder.DESC } };
const COMPLETED_PAGINATION = { limit: 10, ...TODOS_SORT_ORDER };

@Injectable()
export class TodosService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Todo)
    private readonly todosRepository: EntityRepository<Todo>
  ) { }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = new Todo(createTodoDto.todo);
    await this.todosRepository.persistAndFlush(todo);
    return todo;
  }

  async findAll(queryParams: QueryParams): Promise<ListTodosResponse> {
    const filterQuery = queryParams.q ? { todo: { $like: `%${queryParams.q}%` } } : {};
    const results = await Promise.all([
      this.findIncompleted(filterQuery),
      this.findCompleted(filterQuery),
      this.getLatestTimestamp()
    ]);

    return {
      incompleted: results[0],
      completed: results[1],
      latestTimestamp: results[2]
    };
  }

  async findOne(id: number): Promise<Todo> {
    return await this.todosRepository.findOneOrFail({ id });
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todosRepository.findOneOrFail(id);
    wrap(todo).assign(updateTodoDto);
    await this.todosRepository.flush();
    return todo;
  }

  async remove(id: number) {
    const todo = await this.todosRepository.findOneOrFail(id);
    return await this.todosRepository.nativeDelete(todo);
  }

  async removeAll() {
    return await this.todosRepository.nativeDelete({});
  }

  async getLatestModified(): Promise<Record<string, string | null>> {
    const latestModified = await this.getLatestTimestamp();
    return { latestModified };
  }

  private async getLatestTimestamp(): Promise<string | null> {
    const query = this.em.createQueryBuilder(Todo)
      .select('updated_at')
      .orderBy({ 'updated_at': QueryOrder.DESC })
      .limit(1);

    const todo = await query.execute('get', true);
    return todo ? todo.updatedAt.toISOString() : null
  }

  private findIncompleted(todoFilterQuery: FilterQuery<Todo>): Promise<Todo[]> {
    const completedFilterQuery = this.getTodoFilterQuery(todoFilterQuery, false);
    return this.todosRepository.find(completedFilterQuery, TODOS_SORT_ORDER);
  }

  private findCompleted(todoFilterQuery: FilterQuery<Todo>): Promise<Todo[]> {
    const incompletedFilterQuery = this.getTodoFilterQuery(todoFilterQuery, true);
    return this.todosRepository.find(incompletedFilterQuery, COMPLETED_PAGINATION);
  }

  private getTodoFilterQuery(todoFilterQuery: FilterQuery<Todo>, completed: boolean) {
    return Object.assign({}, todoFilterQuery, { completed: { $eq: completed } });
  }
}
