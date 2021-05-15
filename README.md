<h1 align="center">
  <br>
  <!-- <a href="https://gitwiz.herokuapp.com"><img src="https://github.com/Araekiel/gitwiz/blob/master/src/public/images/png/icon.png" alt="GitWiz" width="200"></a> -->
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
  <a href="#usage">Usage</a> •
</p>

## Description

An npm module to automate the regular processing and caching of responses from APIs. With a caching mechanism inspired by [node-cache](https://www.npmjs.com/package/node-cache), this module has all the standard interface methods to interact with the in-memory cache.<br>
Mastak makes requests using [node-fetch](https://www.npmjs.com/package/node-fetch) and processes the response based on the resProcessor function provided by the user. Each key gets a timeout(ttl) and an updateInterval(if autoUpdate is true). 

## Installation

```bash
$ npm install mastak --save
```

## Usage

### Initialization

```js
const Mastak = require("mastak");
const cache = new Mastak();
```
### Options

- `stdTTL`: *(default: `0`)* - the standard timeout(in seconds) for each element of the cache, `0` = infinite.
- `autoUpdate`: *(default: `true`)* - boolean flag that states if each element in the cache has to be regularly updated or not.
- `updateInterval`: *(default: `3600(1 hr in secs)`* - the standard interval(in seconds) over which each element in the cache has to be updated
- `checkPeriod`: *(default: `600`(10 min in secs)* - the regular interval(in seconds) over which the internal *checkData()* method will check each element for timeout and autoUpdate.

#### Example

```js
const Mastak = require("mastak");
const cache = new Mastak({
    stdTTL: 1800,
    updateInterval: 7200
});
```


## Authors
- [Araekiel](https://www.github.com/Araekiel)
