import fetch, { Response } from "node-fetch";

import {
  StandardDataset,
  Errors,
  Options,
  OptionsInternal,
  Request,
  CacheInput,
  CacheUnit,
  Cache,
} from "./types/main.interfaces";

export default class Mastak {
  private cache: Cache;
  private options: OptionsInternal;

  constructor(options?: Options) {
    this.cache = {};
    this.options = Object.assign(
      {
        stdTTL: 0,
        autoUpdate: true,
        updateInterval: 3600, // 1 hour in seconds
        checkPeriod: 300, // 5 mins in seconds
      },
      options
    );

    this.checkData();
  }

  // @type Primary Function
  // @desc Set a value in cache after making the request specified
  set(key: string, api: CacheInput): Promise<CacheUnit> {
    return new Promise(async (resolve, reject) => {
      if (!(key in this.cache)) {
        let data;
        try {
          data = await this._processRequest(api.request, api.resProcessor);

          let now = Date.now();
          this.cache[key] = Object.assign(
            {
              setTime: now,
              lastUpdate: now,
              value: data,
            },
            api
          );

          resolve(this.cache[key]);
        } catch (err) {
          return reject(err);
        }
      } else {
        return reject(this._generateError("BadKey", "Key already exists"));
      }
    });
  }

  // @type Primary Function
  // @desc Get the current value stored for an API
  get(key: string): any {
    if (key in this.cache) {
      return this.cache[key].value;
    } else {
      throw this._generateError("BadKey", "Key does not exist");
    }
  }

  // @type Primary Function
  // @desc Delete a cached API based on the key entered
  delete(key: string): boolean {
    if (key in this.cache) {
      delete this.cache[key];
      return true; // Might change this later on
    } else {
      throw this._generateError("BadKey", "Key does not exist");
    }
  }

  // @type Primary Function
  // @desc Update a cached API
  update(key: string, api: CacheInput, updateNow: boolean): Promise<CacheUnit> {
    return new Promise(async (resolve, reject) => {
      if (key in this.cache) {
        Object.assign(this.cache[key], api);

        if (updateNow) {
          let data = await this._processRequest(api.request, api.resProcessor);
          this.cache[key] = Object.assign(this.cache[key], api);
          this.cache[key].value = data;
          this.cache[key].lastUpdate = Date.now();
        }

        resolve(this.cache[key]);
      } else {
        return reject(this._generateError("BadKey", "Key does not exist"));
      }
    });
  }

  // @type Secondary Function
  // @desc Set multiple values in cache
  // As of now this works perfectly fine but the code needs a refactor
  setMulti(keys: Array<string>, apis: Array<CacheInput>): Promise<Array<CacheUnit>> {
    return new Promise(async (resolve, reject) => {
      if (keys.length !== apis.length) {
        return reject(
          this._generateError("BadInput", "Array lengths don't match")
        );
      }

      for (const key of keys) {
        if (key in this.cache) {
          return reject(
            this._generateError(
              "BadKey",
              `Key "${key}" already exists in the cache`
            )
          );
        }
      }

      let processedAPIs: Array<CacheUnit> = [];
      for (const i in keys) {
        let data: any;
        try {
          data = await this._processRequest(
            apis[i].request,
            apis[i].resProcessor
          );

          let now = Date.now();
          processedAPIs[i] = Object.assign(
            {
              setTime: now,
              lastUpdate: now,
              value: data,
            },
            apis[i]
          );
        } catch (err) {
          return reject(err);
        }
      }

      for (const i in keys) {
        this.cache[keys[i]] = processedAPIs[i];
      }

      resolve(processedAPIs);
    });
  }

  // @type Secondary Function
  // @desc Return current values for multiple keys
  getMulti(keys: Array<string>): StandardDataset {
    let data: StandardDataset = {};

    for (const key of keys) {
      if (key in this.cache) {
        data[key] = this.cache[key].value;
      } else {
        throw this._generateError("BadKey", `Key "${key}" does not exist`);
      }
    }

    return data;
  }

  // @type Secondary Function
  // @desc Delete multiple apis from the cache
  deleteMulti(keys: Array<string>): boolean {
    for (const key of keys) {
      if (!(key in this.cache)) {
        throw this._generateError("BadKey", `Key ${key} does not exist`);
      }
    }

    for (const key of keys) {
      delete this.cache[key];
    }

    return true;
  }

  // @type Secondary Function
  // @desc Delete a cached API and return its value
  take(key: string): CacheUnit {
    if (key in this.cache) {
      let temp = this.cache[key];
      delete this.cache[key];
      return temp;
    } else {
      throw this._generateError("BadKey", `Key ${key} does not exist`);
    }
  }

  // @type Secondary Function
  // @desc Delete all the date in the cache
  flush(): boolean {
    this.cache = {};
    return true;
  }

  // @type Secondary Function
  // @desc Returns a boolean informing if the cache contains a specific key
  has(key: string): boolean {
    if (key in this.cache) {
      return true;
    } else {
      return false;
    }
  }

  // @type Secondary Function
  // @desc Returns all the keys in the cache
  keys(): Array<string> {
    const keys = Object.getOwnPropertyNames(this.cache);
    return keys;
  }

  // @type Core Function
  // @desc Check all the data for TTL and Auto-Update, regularly
  checkData(): void {
    for (const key in this.cache) {
      let now = Date.now();

      let ttlms = (this.cache[key].ttl || this.options.stdTTL) * 1000;
      if (ttlms > 0) {
        if (ttlms + this.cache[key].setTime < now) {
          console.log(
            `Deleting key '${key}'; setTime: ${this.cache[key].setTime}; ttl: ${
              this.cache[key].ttl || this.options.stdTTL
            }; timeNow: ${now}'`
          );
          delete this.cache[key];
          console.log(`Key '${key}'`);
          continue;
        }
      }

      let uims =
        (this.cache[key].updateInterval || this.options.updateInterval) * 1000;
      if (this.options.autoUpdate) {
        if (uims + this.cache[key].lastUpdate < now) {
          console.log(
            `Updating key '${key}'; lastUpdate: ${
              this.cache[key].lastUpdate
            }; updateInterval: ${
              this.cache[key].updateInterval || this.options.updateInterval
            }; timeNow: ${now}'`
          );
          this._processRequest(
            this.cache[key].request,
            this.cache[key].resProcessor
          )
            .then((data) => {
              this.cache[key].value = data;
              this.cache[key].lastUpdate = now;
              console.log(`Key '${key}' updated`);
            })
            .catch((err) => {
              console.log(
                `Skipping updation for key '${key}'; an error occured; msg: ${err.message}`
              );
            });
        }
      }
    }
    setTimeout(() => this.checkData(), this.options.checkPeriod * 1000);
  }

  // @type Internal Function
  // @desc Send the request and proecess the response
  _processRequest(request: Request, resProcessor?: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let response = await fetch(request.url, {
        method: request.method,
        ...("body" in request && {
          body: JSON.stringify(request.body),
        }),
        ...("headers" in request && { headers: request.headers }),
      });

      try {
        response = this._checkResponseStatus(response);
      } catch (err) {
        return reject(err);
      }

      let resJSON = await response.json();

      if (resProcessor) {
        let processedData;
        try {
          processedData = resProcessor(resJSON);
        } catch (error) {
          let err = this._generateError("BadProcessor", error);
          return reject(err);
        }
        resolve(processedData);
      } else {
        resolve(resJSON);
      }
    });
  }

  // @type Internal Funciton
  // @desc Check the response status to throw an error if a necessary
  _checkResponseStatus(res: Response): Response {
    if (res.ok) {
      return res;
    } else {
      throw this._generateError("BadRequest", res.statusText);
    }
  }

  // @type Internal Function
  // @desc Generate an error with message from an error template based
  // on the type provided
  _generateError(type: string, errorMessage: string): Error {
    const errors: Errors = {
      BadRequest: "There's something wrong with the request",
      BadProcessor: "There's something wrong with the response processor",
      BadKey: "There's something wrong with the key",
      BadInput: "There's something wrong with the input",
    };

    let error: Error = new Error();
    error.name = type;
    error.message = `ERROR: ${type}: ${errors[type]}; info: ${errorMessage}`;
    return error;
  }
}
