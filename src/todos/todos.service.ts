import { Injectable } from '@nestjs/common';
import { EntityRepository, QueryOrder, wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';

import { Todo } from './entities/todo.entity';
import { CreateTodoDto, UpdateTodoDto, QueryParams } from './dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: EntityRepository<Todo>,
    private readonly em: EntityManager
  ) { }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = new Todo(createTodoDto.todo);
    await this.todosRepository.persistAndFlush(todo);
    return todo;
  }

  async findAll(queryParams: QueryParams): Promise<Todo[]> {
    const pagination = queryParams.completed ? { limit: 10 } : {};
    const todo = queryParams.q ? { todo: { $like: `%${queryParams.q}%` } } : {};
    return await this.todosRepository.find(todo, pagination);
  }

  async findOne(id: number): Promise<Todo> {
    const todo = this.todosRepository.getReference(id);
    return await this.todosRepository.findOneOrFail(todo);
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todosRepository.findOneOrFail(id);
    const completed = updateTodoDto.completed as unknown as string === 'true'
    wrap(todo).assign({ ...updateTodoDto, completed });
    await this.todosRepository.flush();
    return todo;
  }

  async remove(id: number) {
    return await this.todosRepository.nativeDelete({ id });
  }

  async removeAll() {
    return await this.todosRepository.nativeDelete({});
  }

  async getLatestTimestamp(): Promise<Date> {
    const query = this.em.createQueryBuilder(Todo)
      .select('updated_at')
      .where({ id: { $gt: 0 } })
      .orderBy({ 'updated_at': QueryOrder.DESC})
      .limit(1);

    const todo = await query.execute('get', true);
    return todo.updatedAt
  }
}
