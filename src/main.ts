import fetch, { Response } from "node-fetch";

import {
  Cache,
  CachedAPI,
  Errors,
  Request,
  MultipleValues,
} from "./types/main.interfaces";

export default class Mastak {
  private cache: Cache;
  private errors: Errors;

  constructor() {
    this.cache = {};
    this.errors = {
      BadRequest: "There's something wrong with the request",
      BadProcessor: "There's something wrong with the response processor",
      BadKey: "There's something wrong with the key",
      BadInput: "There's something wrong with the input",
    };
  }

  // @type Primary Function
  // @desc Set a value in cache after making the request specified
  set(key: string, api: CachedAPI): Promise<CachedAPI> {
    return new Promise(async (resolve, reject) => {
      if (!(key in this.cache)) {
        let data;
        try {
          data = await this._processRequest(api.request, api.resProcessor);
          this.cache[key] = api;
          this.cache[key].value = data;
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
  get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (key in this.cache) {
        resolve(this.cache[key].value);
      } else {
        return reject(this._generateError("BadKey", "Key does not exist"));
      }
    });
  }

  // @type Primary Function
  // @desc Delete a cached API based on the key entered
  delete(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (key in this.cache) {
        delete this.cache[key];
        resolve(true); // Might change this later on
      } else {
        return reject(this._generateError("BadKey", "Key does not exist"));
      }
    });
  }

  // @type Primary Function
  // @desc Update a cached API
  update(key: string, api: CachedAPI, updateNow: boolean): Promise<CachedAPI> {
    return new Promise(async (resolve, reject) => {
      if (key in this.cache) {
        for (const property in api) {
          if (this.cache[key][property]) {
            this.cache[key][property] = api[property];
          }
        }

        if (updateNow) {
          let data = await this._processRequest(api.request, api.resProcessor);
          this.cache[key] = api;
          this.cache[key].value = data;
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
  setMulti(
    keys: Array<string>,
    apis: Array<CachedAPI>
  ): Promise<Array<CachedAPI>> {
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

      let processedAPIs: Array<CachedAPI> = [];
      for (const i in keys) {
        let data: any;
        try {
          data = await this._processRequest(
            apis[i].request,
            apis[i].resProcessor
          );
          processedAPIs[i] = apis[i];
          processedAPIs[i].value = data;
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
  getMulti(keys: Array<string>): Promise<MultipleValues> {
    return new Promise(async (resolve, reject) => {
      let data: MultipleValues = {};

      for (const key of keys) {
        if (key in this.cache) {
          data[key] = this.cache[key].value;
        } else {
          return reject(
            this._generateError("BadKey", `Key "${key}" does not exist`)
          );
        }
      }

      resolve(data);
    });
  }

  // @type Secondary Function
  // @desc Delete a cached API and return its value
  take(key: string): Promise<CachedAPI> {
    return new Promise((resolve, reject) => {
      if (key in this.cache) {
        let temp = this.cache[key];
        delete this.cache[key];
        resolve(temp);
      } else {
        reject("Error: Key does not exist");
      }
    });
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
    let error: Error = new Error();
    error.name = type;
    error.message = `ERROR: ${type}: ${this.errors[type]}; info: ${errorMessage}`;
    return error;
  }

  // deleteMulti(): any {}
  // flush(): any {}
  // has(): any {}
  // keys(): any {}

  // updateData(): any {}
  // checkValues(): any {}
  // expire(): any {}
}
