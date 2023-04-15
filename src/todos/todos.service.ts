import { Injectable } from '@nestjs/common';
import { EntityRepository, FilterQuery, QueryOrder, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/sqlite';

import { Todo } from './entities/todo.entity';
import { CreateTodoDto, UpdateTodoDto, QueryParams } from './dto';

const TODOS_SORT_ORDER = { orderBy: { createdAt: QueryOrder.DESC } };

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

  async findAll(queryParams: QueryParams): Promise<Record<string, Todo[]>> {
    const todo = queryParams.q ? { todo: { $like: `%${queryParams.q}%` } } : {};
    const results = await Promise.all([
      this.findIncompleted(todo),
      this.findCompleted(todo)
    ]);

    return {
      completed: results[1],
      incompleted: results[0]
    };
  }

  async findOne(id: number): Promise<Todo> {
    return await this.todosRepository.findOneOrFail({ id });
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todosRepository.findOneOrFail(id);
    // NOTE: a hack, transform pipe, did not work for some reason
    const completed = updateTodoDto.completed as unknown as string === 'true'
    wrap(todo).assign({ ...updateTodoDto, completed });
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

  async getLatestTimestamp(): Promise<Record<string, string | null>> {
    const query = this.em.createQueryBuilder(Todo)
      .select('updated_at')
      .orderBy({ 'updated_at': QueryOrder.DESC })
      .limit(1);

    const todo = await query.execute('get', true);
    const latestTimestamp = todo ? todo.updatedAt.toISOString() : null
    return { latestTimestamp };
  }

  private findIncompleted(todoFilterQuery: FilterQuery<Todo>): Promise<Todo[]> {
    return this.todosRepository.find(todoFilterQuery, TODOS_SORT_ORDER);
  }

  private findCompleted(todoFilterQuery: FilterQuery<Todo>): Promise<Todo[]> {
    const pagination = { limit: 10, ...TODOS_SORT_ORDER };
    return this.todosRepository.find(todoFilterQuery, pagination);
  }
}
