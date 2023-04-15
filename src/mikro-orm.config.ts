import { Options } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
  dbName: 'todos.db',
  type: 'sqlite',

  entitiesTs: ['./src/**/*.entity.*'],
  entities: ['./dist/**/*.entity.*'],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },

  forceUtcTimezone: true,
  metadataProvider: TsMorphMetadataProvider,

  debug: true,
};

export default config;
