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

class Mastak {
  private cache: Cache;
  private options: OptionsInternal;

  constructor(options?: Options) {
    this.cache = {};
    this.options = Object.assign(
      {
        stdTTL: 0,
        autoUpdate: true,
        updateInterval: 3600, // 1 hour in seconds
        checkPeriod: 600, // 10 mins in seconds
      },
      options
    );

    this.checkData();
  }

  // @type Primary Function
  // @desc Set an API or CacheUnit in the cache with the key provided
  // @ret  Returns a promise that resolves with the entire CacheUnit stored against a key or rejects an error
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
        return reject(
          this._generateError("BadKey", `Key '${key}' already exists`)
        );
      }
    });
  }

  // @type Primary Function
  // @desc Get the currently stored value for an API with the key
  // @ret  Returns the "value" for the CacheUnit or throws a BadKey error
  get(key: string): any {
    if (key in this.cache) {
      return this.cache[key].value;
    } else {
      throw this._generateError("BadKey", `Key '${key}' does not exist`);
    }
  }

  // @type Primary Function
  // @desc Delete a CacheUnit with the key
  // @ret  Returns boolean - true if successful or throws a BadKey error
  delete(key: string): boolean {
    if (key in this.cache) {
      delete this.cache[key];
      return true; // Might change this later on
    } else {
      throw this._generateError("BadKey", `Key '${key}' does not exist`);
    }
  }

  // @type Primary Function
  // @desc Update the data of a CacheUnit and updated its value if needed
  // @ret  Returns a promise that resolves with the updated CacheUnit or rejects an error
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
        return reject(
          this._generateError("BadKey", `Key '${key}' does not exist`)
        );
      }
    });
  }

  // @type Secondary Function
  // @desc Set multiple APIs or CacheUnits in the cache with arrays of keys and CacheInputs
  // @ret  Returns a promise that resolves with an array of proccessed CacheUnits or rejects an error
  setMulti(
    keys: Array<string>,
    apis: Array<CacheInput>
  ): Promise<Array<CacheUnit>> {
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
              `Key '${key}' already exists in the cache`
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
  // @desc Get current value of multiple CacheUnits with an array of keys
  // @ret  Returns an array of values or throws a BadKey error
  getMulti(keys: Array<string>): StandardDataset {
    let data: StandardDataset = {};

    for (const key of keys) {
      if (key in this.cache) {
        data[key] = this.cache[key].value;
      } else {
        throw this._generateError("BadKey", `Key '${key}' does not exist`);
      }
    }

    return data;
  }

  // @type Secondary Function
  // @desc Delete multiple CacheUnits with an array of keys
  // @ret  Returns boolean - true if successful or throws a BadKey error
  deleteMulti(keys: Array<string>): boolean {
    for (const key of keys) {
      if (!(key in this.cache)) {
        throw this._generateError("BadKey", `Key '${key}' does not exist`);
      }
    }

    for (const key of keys) {
      delete this.cache[key];
    }

    return true;
  }

  // @type Secondary Function
  // @desc Delete a CacheUnit and return its value
  // @ret  Returns the deleted CacheUnit or throws a BadKey error
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
  // @desc Delete all the data in the cache
  // @ret  Returns boolean - true
  flush(): boolean {
    this.cache = {};
    return true;
  }

  // @type Secondary Function
  // @desc Checks if the cache contains a key or not
  // @ret  Returns boolean - true or false
  has(key: string): boolean {
    if (key in this.cache) {
      return true;
    } else {
      return false;
    }
  }

  // @type Secondary Function
  // @desc Get all the keys currently stored in the cache
  // @ret  Returns an array of strings(keys)
  keys(): Array<string> {
    const keys = Object.getOwnPropertyNames(this.cache);
    return keys;
  }

  // @type Core Function
  // @desc A function set on a regular setTimeout loop to check all the data for TTL and autoUpdate
  // @ret  If a condition is met, logs the data in the console and continues with the loop, doesn't return anything
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
  // @ret  Returns a promise that resolves with the processed response or rejects an error
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
  // @ret  Returns the response as is or throws a BadRequest error
  _checkResponseStatus(res: Response): Response {
    if (res.ok) {
      return res;
    } else {
      throw this._generateError("BadRequest", res.statusText);
    }
  }

  // @type Internal Function
  // @desc Generate an error with message from an error template based on the type provided
  // @ret  Returns the formed error
  _generateError(type: string, errorMessage: string): Error {
    const errors: Errors = {
      BadRequest: "There's something wrong with the request",
      BadProcessor: "There's something wrong with the response processor",
      BadKey: "There's something wrong with the key",
      BadInput: "There's something wrong with the input",
    };

    let error: Error = new Error();
    error.name = type;
    error.message = `ERROR: ${type}: ${errors[type]}; msg: ${errorMessage}`;
    return error;
  }
}

export = Mastak;