import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { Todo } from './entities/todo.entity';

@Module({
  controllers: [TodosController],
  imports: [MikroOrmModule.forFeature({ entities: [Todo] })],
  providers: [TodosService]
})
export class TodosModule {}
