<h1 align="center">
  <br>
  <a href="#"><img src="https://github.com/Araekiel/mastak/blob/master/assets/logo/mastak.png" alt="Mastak" width="200"></a>
  <br>
  Mastak    
  <br>
</h1>

<h4 align="center">
An <a href="https://www.npmjs.com/">npm</a> module for in-memory automated API caching.
<br/>
Built with <a href="https://www.typescriptlang.org/">TypeScript</a>.
</h4>

<p align="center">
  <a><img alt="MIT License" src="https://img.shields.io/apm/l/atomic-design-ui.svg?"></a>
  <a><img alt="Github Release" src="https://img.shields.io/badge/release-v1.1.2-blue"></a>
  <a href="http://makeapullrequest.com">
    <img alt="PRs Welcome"src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat">
  </a>
</p>

<p align="center">
  <a href="#about">About</a> •
  <a href="#installation">Installation</a> •
  <a href="#initialization">Initialization</a> •
  <a href="#types">Types</a> •
  <a href="#usage">Usage</a> •
  <a href="#contribution">Contribution</a> •
  <a href="#authors">Authors</a> •
  <a href="#license">License</a>
</p>

## About

An <a href="https://www.npmjs.com/">npm</a> module to automate the regular processing and caching of responses from APIs. With a caching mechanism inspired by [node-cache](https://www.npmjs.com/package/node-cache), this module has all the standard interface methods to interact with the in-memory cache.<br>
Mastak makes requests using [node-fetch](https://www.npmjs.com/package/node-fetch) and processes the response based on the `resProcessor()` function provided by the user. Each key gets a `timeout(ttl)` and an `updateInterval`(if `autoUpdate` is _true_).

## Installation

```bash
$ npm install mastak --save
```

## Initialization

```js
const Mastak = require("mastak");
const cache = new Mastak();
```

> To import the module in TypeScript, _esModuleInterop_ needs to be set to true in your _tsconfig.json_.

### Options

- `stdTTL`: _(default: `0`)_ - the standard timeout(in seconds) for each element of the cache, `0` = infinite.
- `autoUpdate`: _(default: `true`)_ - boolean flag that states if each element in the cache has to be regularly updated or not.
- `updateInterval`: _(default: `3600(1 hr in secs)`)_ - the standard interval(in seconds) at which each element in the cache has to be updated.
- `checkPeriod`: _(default: `600(10 min in secs)`)_ - the regular interval(in seconds) at which the internal _checkData()_ method will check each element for timeout and autoUpdate.

#### Example

```js
const Mastak = require("mastak");
const cache = new Mastak({
  stdTTL: 1800,
  updateInterval: 7200,
});
```

## Types

There are 3 types/interfaces that a user has to take into account when using Mastak, i.e. `Request`, `CacheInput` & `CacheUnit`.<br>
`Request` & `CacheInput` define the format of input that is expected from the user while `CacheUnit` defines the format in which an API and its value is stored within the cache.

### Request

`Request` defines the data needed to form a valid request that can be sent using `node-fetch`.

```ts
interface Request {
  url: string; // url for the api
  method: string; // http method to be used
  body?: {
    [key: string]: any; // body for the request
  };
  headers?: {
    [key: string]: string; // headers
  };
}
```

### CacheInput

`CacheInput` defines all the data that needs to be input to set or update an API.

```ts
interface CacheInput {
  request: Request;
  resProcessor?: any; // a function that processes the response recieved
  updateInterval?: number; // the interval over which the API needs to be updated
  ttl?: number; // the timeout for the API
}
```

### CacheUnit

`CacheUnit` defines the format in which an API is stored in the cache. It extends `CacheInput` i.e. it inherits all its properties.

```ts
interface CacheUnit extends CacheInput {
  setTime: number; // the time at which this API/CacheUnit was set
  lastUpdate: number; // the time at which the value was last updated
  value: any; // the processed response from the API
}
```

> ? - field is not required.

Take a look at [src/types/main.interfaces.ts](https://github.com/Araekiel/mastak/blob/master/src/types/main.interfaces.ts) to see all the defined interfaces.

## Usage

### set()

Set an API or `CacheUnit` in the cache with the key provided.<br>Returns a promise that resolves with the entire `CacheUnit` stored against a key or rejects an error.

```js
Mastak.set((key: string), (api: CacheInput));
```

#### Example

```js
const request = {
  url: "https://jsonplaceholder.typicode.com/posts",
  method: "POST",
  body: {
    title: "foo",
    body: "bar",
    userId: 1,
  },
  headers: {
    "Content-type": "application/json; charset=UTF-8",
  },
};

const api = {
  request: request,
  ttl: 1800,
};

const foo = async () => {
  try {
    let response = await cache.set("JSONPlaceholder", api);
    console.log("set()", response);
  } catch (err) {
    console.warn(err.message);
  }
};

foo();
```

#### Output

```js
set() { setTime: 1621113414640,
lastUpdate: 1621113414640,
value: { title: 'foo', body: 'bar', userId: 1, id: 101 },
request:
{ url: 'https://jsonplaceholder.typicode.com/posts',
method: 'POST',
body: { title: 'foo', body: 'bar', userId: 1 },
headers: { 'Content-type': 'application/json; charset=UTF-8' } } }
```

<hr>

### get()

Get the currently stored value for an API with the key.<br>Returns the "value" for the `CacheUnit` or throws a `BadKey` error.

```js
Mastak.get((key: string));
```

#### Example

```js
try {
  let response = await cache.get("JSONPlaceholder");
  console.log("get()", response);
} catch (err) {
  console.warn(err.message);
}
```

#### Output

```js
get() { title: 'foo', body: 'bar', userId: 1, id: 101 }
```

<hr>

### update()

Update the data of a `CacheUnit` and update its value if `updateNow` argument is _true_.<br>
Returns a promise that resolves with the updated `CacheUnit` or rejects an error.

```js
Mastak.update((key: string), (api: CacheInput), (updateNow: boolean));
```

#### Example

```js
const request2 = {
  url: "https://jsonplaceholder.typicode.com/posts/2",
  method: "PATCH",
  body: {
    title: "foo",
  },
};

const resProcessor2 = (data) => {
  return data.userId;
};

const api2 = {
  request: request2,
  resProcessor: resProcessor2,
};

const foo = async () => {
  try {
    response = await cache.update("JSONPlaceholder", api2, true);
    console.log("update()", response);
  } catch (err) {
    console.warn(err.message);
  }
};

foo();
```

#### Output

```js
update() { setTime: 1621113648549,
lastUpdate: 1621113649233,
value: 1,
request:
{ url: 'https://jsonplaceholder.typicode.com/posts/2',
    method: 'PATCH',
    body: { title: 'foo' } },
resProcessor: [Function: something2] }
```

<hr>

### delete()

Delete a `CacheUnit` with the key.<br>
Returns _boolean_ - _true_ if successful or throws a `BadKey` error

```js
Mastak.delete((key: string));
```

#### Example

```js
try {
  let response = await cache.delete("JSONPlaceholder");
  console.log("delete()", response);
} catch (err) {
  console.warn(err.message);
}
```

#### Output

```js
delete() true
```

<hr>

### setMulti()

Set multiple APIs or `CacheUnit`s in the cache with arrays of keys and `CacheInput`s.<br>
Returns a promise that resolves with an array of proccessed `CacheUnit`s or rejects an error.

```js
Mastak.setMulti((keys: Array<string>), (apis: Array<CacheInput>));
```

#### Example

```js
const request = {
  url: "https://jsonplaceholder.typicode.com/posts",
  method: "POST",
  body: {
    title: "foo",
    body: "bar",
    userId: 1,
  },
  headers: {
    "Content-type": "application/json; charset=UTF-8",
  },
};

const request2 = {
  url: "https://jsonplaceholder.typicode.com/posts/2",
  method: "PATCH",
  body: {
    title: "foo",
  },
};

const resProcessor2 = (data) => {
  return data.userId;
};

const api: CacheInput = {
  request: request,
  ttl: 1800,
};

const api2 = {
  request: request2,
  resProcessor: resProcessor2,
};

const foo = async () => {
  try {
    let response = await cache.setMulti(
      ["JSONPlaceholder", "JSONPlaceholder2"],
      [api, api2]
    );
    console.log("setMulti()", response);
  } catch (err) {
    console.warn(err.message);
  }
};

foo();
```

#### Output

```js
setMulti()[
  ({
    setTime: 1621113734595,
    lastUpdate: 1621113734595,
    value: { title: "foo", body: "bar", userId: 1, id: 101 },
    request: {
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "POST",
      body: [Object],
      headers: [Object],
    },
  },
  {
    setTime: 1621113735169,
    lastUpdate: 1621113735169,
    value: 1,
    request: {
      url: "https://jsonplaceholder.typicode.com/posts/2",
      method: "PATCH",
      body: [Object],
    },
    resProcessor: [(Function: something2)],
  })
];
```

<hr>

### getMulti()

Get current value of multiple `CacheUnit`s with an array of keys.<br>
Returns an array of values or throws a `BadKey` error.

```js
Mastak.getMulti((keys: Array<string>));
```

#### Example

```js
try {
  let response = cache.getMulti(["JSONPlaceholder", "JSONPlaceholder2"]);
  console.log("getMulti()", response);
} catch (err) {
  console.warn(err.message);
}
```

#### Output

```js
getMulti() { JSONPlaceholder: { title: 'foo', body: 'bar', userId: 1, id: 101 },
  JSONPlaceholder2: 1 }
```

<hr>

### has()

Checks if the cache contains a key or not.<br>
Returns _boolean_ - _true_ or _false_

```js
Mastak.has((key: string));
```

#### Example

```js
let response = cache.has("JSONPlaceholder");
console.log("has()", response);
```

#### Output

```js
has() true
```

<hr>

### keys()

Get all the keys currently stored in the cache.<br>
Returns an array of _strings(keys)_.

```js
Mastak.keys();
```

#### Example

```js
let response = cache.keys();
console.log("keys()", response);
```

#### Output

```js
keys()[("JSONPlaceholder", "JSONPlaceholder2")];
```

<hr>

### deleteMulti()

Delete multiple `CacheUnit`s with an array of keys.<br>
Returns _boolean_ - _true_ if successful or throws a `BadKey` error.

```js
Mastak.deleteMulti((keys: Array<string>));
```

#### Example

```js
try {
  let response = cache.deleteMulti(["JSONPlaceholder", "JSONPlaceholder2"]);
  console.log("deleteMulti()", response);
} catch (err) {
  console.warn(err.message);
}
```

#### Output

```js
deleteMulti() true
```

<hr>

### take()

Delete a `CacheUnit` and return its value.<br>
Returns the deleted `CacheUnit` or throws a `BadKey` error.

```js
Mastak.take((key: string));
```

#### Example

```js
try {
  let response = cache.take("JSONPlaceholder");
  console.log("take()", response);
} catch (err) {
  console.warn(err.message);
}
```

#### Output

```js
take() { setTime: 1621113915875,
lastUpdate: 1621113915875,
value: { title: 'foo', body: 'bar', userId: 1, id: 101 },
request:
{ url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'POST',
    body: { title: 'foo', body: 'bar', userId: 1 },
    headers: { 'Content-type': 'application/json; charset=UTF-8' } } }
```

<hr>

### flush()

Delete all the data in the cache.<br>
Returns _boolean_ - _true_.

```js
Mastak.flush();
```

#### Example

```js
let response = cache.flush();
console.log("flush()", response);
```

#### Output

```js
flush() true
```

<hr>

## Contribution

Fork the repository and open a pull request to contribute.
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Authors

- [Araekiel](https://www.github.com/Araekiel)

## License

MIT License

Copyright (c) 2021 Kumar Shashwat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
