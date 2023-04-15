import { Migration } from '@mikro-orm/migrations';

export class Migration20230414230100 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `todos` (`id` integer not null primary key autoincrement, `todo` text not null, `completed` integer not null default false, `created_at` datetime not null, `updated_at` datetime not null);');
    this.addSql('create index `todos_todo_index` on `todos` (`todo`);');
  }

}
