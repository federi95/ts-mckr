# ts-mckr

> A small library to fast create typed mock servers.

## Purpose

You can use this library to test your React (or other framework) components without the need of a backend server.
It wraps [msw](https://github.com/mswjs/msw), so you can refer to the documentation [here](https://mswjs.io/docs/).\

[FakerJS](https://github.com/faker-js/faker) is used under the hood to provide data generation, full documentation [here](https://fakerjs.dev/).

## Features

- Small and lightweight
- Built-in Typescript support
- Works with all javascript frameworks
- Create a full queryable database with:
  - generated fake data (thanks to FakerJS)
  - your data (json, text, and so on...)

## Installation

```bash
npm install -s msw ts-mckr
or
yarn add msw ts-mckr
or
pnpm install msw ts-mckr
```

## Usage

### Initialize mswjs

As said [here](#purpose) this library is essentially a msw wrap, so to work the Service Worker needs to be create.
To do so, just run:

```bash
npx msw init ./public --save
or
pnpx msw init ./public --save
```

### Create Handlers for the mock server

```ts
// Import
import dbUtils, { MockServer, MockServerInit } from 'ts-mckr';

// Import static data
import quotes from './quotes.json';

// Database creation
const mockDb = {
  quotes: {
    id: dbUtils.primaryKey(Number),
    quote: String,
    author: String,
  },
  users: {
    id: dbUtils.primaryKey(Number),
    name: String,
  },
};

const handlers = new MockServer()
  // Database init
  .createDB(mockDb)
  // Dataset injection, using fake data
  .createDataSet(
    {
      users: [
        {
          name: MockServer.getFakeData({ module: 'name', method: 'fullName', language: 'it' }),
          birthDate: MockServer.getFakeData({ module: 'date', method: 'birthdate' }),

          /* or with object declaration (not recommended)
                        👇 we need this to get faker methods, if you have better solution, please create a pull request.
            name: <FakerData<'name'>>{ module: 'name', method: 'fullName', language: 'it' },
            birthDate: <FakerData<'date'>>{ module: 'date', method: 'birthdate' },
          */
        },
      ],
    },
    // Dataset options
    { repeat: 40 }
  )
  // Dataset injection, using json data (static)
  .createDataSet({ quotes })
  // Get handlers (get, post, ecc...)
  .createHandlers();

// Create worker
const worker = MockServerInit(...handlers);
```

### Start Mock server

```ts
// Use worker previously init
await worker.start({ onUnhandledRequest: 'bypass' });
```

### Example using axios

```ts
interface DummyUsers {
  id: number;
  name: string;
  birthDate: string;
}

// Create api endpoint, params will contains filter and pagination data
const listUsers = (params?: object) =>
  axiosInstance.get<unknown, ViewData<DummyUsers>>('/users', {
    params: { ...params, delay: 250 },
  });
```

## Options (optional)

|               |  type   | default | required |
| :-----------: | :-----: | :-----: | :------: |
|    repeat     | number  |    1    |    ❌    |
| autoIncrement | boolean |  true   |    ❌    |
