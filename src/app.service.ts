import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MikroORM } from '@mikro-orm/core';

import config from './mikro-orm.config'

@Injectable()
export class AppService {
  getHello(): string {
    return 'It works!';
  }

  // TODO switch to prod
  // @Cron('0 * * * *') // PROD
  @Cron('* 23 * * *') // DEV
  async handleCron() {
    const orm = await MikroORM.init(config);
    await orm.getSchemaGenerator().refreshDatabase()
    await orm.close(true);
  }
}
