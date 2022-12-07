import { RestHandler } from 'msw';

import dbUtils, { MockServer } from '..';

const dataset = { table: [{ name: 'Test' }] };

describe('MockServerInit', () => {
  const table = {
    id: dbUtils.primaryKey(Number),
    name: String,
  };

  test('server constructor with empty database', () => {
    const server = new MockServer();
    expect(server).toHaveProperty('database');
    expect(server.database).toBeUndefined();
  });

  test('server constructor with database creation', () => {
    const server = new MockServer().createDB({ table });
    expect(server).toHaveProperty('database');
    expect(server.database).toBeDefined();
    expect(server.database).toHaveProperty('table');
  });

  test('server constructor with dataset population', () => {
    const server = new MockServer().createDB({ table }).createDataSet(dataset);
    expect(server).toHaveProperty('database');
    expect(server.database).toBeDefined();
    expect(server.database).toHaveProperty('table');
    expect(server.database?.table.count()).toBe(1);
    expect(server.database?.table.getAll()).toHaveLength(1);
    expect(server.database?.table.getAll()).toContainEqual(
      expect.objectContaining({
        id: 1,
        name: 'Test',
      })
    );
  });

  test('server constructor getting handlers', () => {
    const server = new MockServer().createDB({ table }).createDataSet(dataset);
    expect(server).toHaveProperty('database');
    expect(server.database).toBeDefined();
    expect(server.database).toHaveProperty('table');
    expect(server.database?.table.count()).toBe(1);
    expect(server.database?.table.getAll()).toHaveLength(1);
    expect(server.database?.table.getAll()).toContainEqual(
      expect.objectContaining({
        id: 1,
        name: 'Test',
      })
    );
    const handlers = server.createHandlers();
    expect(handlers).toBeInstanceOf(Array);
    expect(handlers.every((element) => element instanceof RestHandler)).toBe(true);
  });
});

describe('MockServerInitErrors', () => {
  test('server constructor throwing error if database is empty and createDataset is invoked', () => {
    const warn = jest.spyOn(globalThis.console, 'warn');
    const server = new MockServer();
    server.createDataSet(dataset);
    expect(warn).toHaveBeenCalled();
    expect(warn).toBeCalledTimes(1);
    expect(warn).toBeCalledWith(
      'No database instance created. Init database with createDB function.'
    );
  });

  test('server constructor throwing error if database is empty and handler method is invoked', () => {
    const warn = jest.spyOn(globalThis.console, 'warn');
    const server = new MockServer();
    server.createHandlers();
    expect(warn).toHaveBeenCalled();
    expect(warn).toBeCalledTimes(1);
    expect(warn).toBeCalledWith(
      'No database instance created. Init database with createDB function.'
    );
  });
});
