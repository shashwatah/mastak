import fetch, { Response } from "node-fetch";

import { Cache, CachedAPI, Errors } from "./types/main.interfaces";

export default class Mastak {
  private cache: Cache;
  private errors: Errors;

  constructor() {
    this.cache = {};
    this.errors = {
      BadRequest:
        "There's something wrong with the request; Error Message: _err_",
      BadProcessor:
        "There's something wrong with the response processor; Error Message: _err_"
    };
  }
  
  // @type Core Function
  // @desc Set a value in cache after making the request specified
  set(key: string, api: CachedAPI): Promise<CachedAPI> {
    return new Promise(async (resolve, reject) => {
      if (!(key in this.cache)) {
        await fetch(api.request.url, {
          method: api.request.method,
          ...("body" in api.request && {
            body: JSON.stringify(api.request.body),
          }),
          ...("headers" in api.request && { headers: api.request.headers }),
        })
          .then((response) => this._checkResponseStatus(response))
          .then((response) => response.json())
          .then((resJSON) => {
            console.log(resJSON);
            if (api.resProcessor) {
              let processedData;
              try {
                processedData = api.resProcessor(resJSON);
              } catch (error) {
                let err = this._generateError("BadProcessor", error);
                throw err;
              }
              return processedData;
            } else {
              return resJSON;
            }
          })
          .then((finalData) => {
            this.cache[key] = api;
            this.cache[key].value = finalData;
          })
          .catch((err) => {
            reject(err.message);
          });
      } else {
        reject("Error: The Key entered already exists");
      }

      resolve(this.cache[key]);
    });
  }

  // @type Core Function
  // @desc Get the current value stored for an API
  get(key: string): Promise<CachedAPI> {
    return new Promise((resolve, reject) => {
      if (key in this.cache) {
        resolve(this.cache[key]);
      } else {
        reject("Error: Data does not exist");
      }
    });
  }

  // @type Core Function
  // @desc Delete a cached API based on the key entered
  delete(key: string): Promise<string> {
      return new Promise((resolve, reject) => {
        if(key in this.cache) {
            delete this.cache[key];
            resolve("API has been deleted from cache");
        } else {
            reject("Error: Key does not exist");
        }
      });
  }

  // @type Core Function
  // @desc Delete a cached API and return its value
  take(key: string): Promise<CachedAPI> {
      return new Promise((resolve, reject) => {
          if(key in this.cache) {
              let temp = this.cache[key];
              delete this.cache[key];
              resolve(temp);
          } else {
              reject("Error: Key does not exist");
          }
      })
  }


  // update(): any {}

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
    error.message = `Error: ${this.errors[type].replace("_err_", errorMessage)}`;
    return error;
  }

  // setMulti(): any {}
  // getMulti(): any {}
  // deleteMulti(): any {}
  // deleteAll(): any {}
  // has(): any {}
  // returnKeys(): any {}

  // updateData(): any {}
  // checkValues(): any {}
  // expire(): any {}
}
