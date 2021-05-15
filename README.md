<h1 align="center">
  <br>
  <a href="#"><img src="https://github.com/Araekiel/mastak/blob/master/assets/logo/mastak.png" alt="Mastak" width="200"></a>
  <br>
  Mastak    
  <br>
</h1>

<h4 align="center">
An npm module for in-memory automated API caching.
<br/>
Built with <a href="https://www.typescriptlang.org/">TypeScript</a> for <a href="https://nodejs.org/en/">Node.js</a>.
</h4>

<p align="center">
  <a><img alt="MIT License" src="https://img.shields.io/apm/l/atomic-design-ui.svg?"></a>
  <a><img alt="Github Release" src="https://img.shields.io/badge/release-v1.0.0-blue"></a>
  <a href="http://makeapullrequest.com">
    <img alt="PRs Welcome"src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat">
  </a>
</p>

<p align="center">
  <a href="#description">Description</a> •
  <a href="#installation">Installation</a> •
  <a href="#initialization">Initialization</a> •
</p>

## Description

An npm module to automate the regular processing and caching of responses from APIs. With a caching mechanism inspired by [node-cache](https://www.npmjs.com/package/node-cache), this module has all the standard interface methods to interact with the in-memory cache.<br>
Mastak makes requests using [node-fetch](https://www.npmjs.com/package/node-fetch) and processes the response based on the `resProcessor()` function provided by the user. Each key gets a `timeout(ttl)` and an `updateInterval`(if `autoUpdate` is true). 

## Installation

```bash
$ npm install mastak --save
```

## Initialization

```js
const Mastak = require("mastak");
const cache = new Mastak();
```
### Options

- `stdTTL`: *(default: `0`)* - the standard timeout(in seconds) for each element of the cache, `0` = infinite.
- `autoUpdate`: *(default: `true`)* - boolean flag that states if each element in the cache has to be regularly updated or not.
- `updateInterval`: *(default: `3600(1 hr in secs)`* - the standard interval(in seconds) over which each element in the cache has to be updated
- `checkPeriod`: *(default: `600(10 min in secs)`* - the regular interval(in seconds) over which the internal *checkData()* method will check each element for timeout and autoUpdate.

#### Example

```js
const Mastak = require("mastak");
const cache = new Mastak({
    stdTTL: 1800,
    updateInterval: 7200
});
```

## Types

There are 2 types/interfaces that a user has to take into account when using Mastak, i.e. `Request` & `CacheInput`

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

> ? - parameter is not required.

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

> ? -  parameter is not required. 

## Usage

### set(): 

Set an API or CacheUnit in the cache with the key provided.<br>Returns a promise that resolves with the entire CacheUnit stored against a key or rejects an error.

```ts
Mastak.set(key: string, api: CacheInput)
```

#### Example

```js
const request = {
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
    body: {
        title: 'foo',
        body: 'bar',
        userId: 1,
    },
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    }
}

const api: CacheInput = {
    request: request,
    ttl: 1800
};

const foo = async () => {
    try {
        response = await cache.set("JSONPlaceholder", api);
        console.log("set()", response);
    } catch(err) {
        console.warn(err.message);
    }
}
```

## Authors
- [Araekiel](https://www.github.com/Araekiel)
