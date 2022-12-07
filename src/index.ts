import { Faker, faker } from '@faker-js/faker';
import * as mswData from '@mswjs/data';
import {
  FactoryAPI,
  Limit,
  ModelDefinition,
  ModelDictionary,
  Value,
} from '@mswjs/data/lib/glossary';
import { DefaultBodyType, MockedRequest, RestHandler } from 'msw';

import { modelListGenerator } from './list';
import { FakerData, MockDatabaseData, MockDatabaseDataOptions } from './types/faker';

export { setupWorker as MockServerInit, rest } from 'msw';

class MockServer {
  database: FactoryAPI<ModelDictionary> | undefined;

  static getFakeData<TModule extends keyof Faker>(data: FakerData<TModule>) {
    const { language, module, method } = data;
    if (language && faker.locale !== language) faker.setLocale(language);
    try {
      /** @TODO Needs better typings */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return () => (faker[module as keyof Faker] as any)?.[method]?.() ?? '';
    } catch (e) {
      console.warn('Faker instance is not valid.');
      return '';
    }
  }

  private checkDatabase() {
    if (!this.database)
      throw new Error('No database instance created. Init database with createDB function.');
  }

  createDB(model: ModelDictionary) {
    this.database = mswData.factory(model);
    return this;
  }

  createDataSet(dbParser: MockDatabaseData, options?: MockDatabaseDataOptions) {
    try {
      this.checkDatabase();
    } catch (e) {
      if (e instanceof Error) console.warn(e.message);
      return this;
    }

    const repetitions = options?.repeat ?? 1;
    const autoIncrementIds = options?.autoIncrement ?? true;

    for (const model of Object.keys(dbParser)) {
      let index = 1;
      for (let i = 0; i < repetitions; i++) {
        if (!dbParser[model]) break;
        for (const rows of dbParser[model]) {
          const value: Partial<Value<Limit<ModelDefinition>, ModelDictionary>> = {};
          for (const [key, data] of Object.entries(rows)) {
            if (data && typeof data === 'object') {
              const d = data as FakerData<keyof Faker>;
              if (d.language && faker.locale !== d.language) faker.setLocale(d.language);
              const { module, method } = d;
              /** @TODO Needs better typings */
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value[key] = (faker[module] as any)?.[method]?.() ?? '';
            } else if (data && typeof data === 'function') value[key] = data();
            else value[key] = data;
          }

          if (!value.id && autoIncrementIds) value.id = repetitions > 1 ? i + 1 : index;

          if (!this.database?.[model]) break;
          this.database[model].create({ ...value });

          index += 1;
        }
      }
    }
    return this;
  }

  createHandlers() {
    try {
      this.checkDatabase();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const db = this.database!;
      const handler: RestHandler<MockedRequest<DefaultBodyType>>[] = [];
      Object.keys(db).forEach((model) => {
        if (!db[model]) return;

        const handlers = db[model].toHandlers('rest');

        const handlersWithoutList = handlers.filter(
          (h) => !(h.info.path === `/${model}` && h.info.method === 'GET')
        );

        const list = modelListGenerator(model, db);

        handler.push(...handlersWithoutList, list);
      });

      return handler;
    } catch (e) {
      if (e instanceof Error) console.warn(e.message);
      return [];
    }
  }
}

export { faker, MockServer };

export default mswData;
