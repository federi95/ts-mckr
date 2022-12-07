
# ts-mckr

> A small library to fast create typed mock servers.

It wraps [msw](https://github.com/mswjs/msw), so you can refer to the documentation [here](https://mswjs.io/docs/).\
You can use this library to test your React (or other framework) components without the need of a backend server.
## Features 
- Built-in Typescript support
- Works with all javascript frameworks

## Installation
```bash
Soon available!
```

## Usage

###  Create Handlers for the mock server
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
###  Start Mock server
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
|               |   type  | default | required |
|:-------------:|:-------:|:-------:|:--------:|
|     repeat    |  number |    1    |     ❌    |
| autoIncrement | boolean |   true  |     ❌    |