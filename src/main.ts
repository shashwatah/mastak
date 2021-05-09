import fetch, { Response } from "node-fetch";

import { Cache, CachedAPI, Errors, Request } from "./types/main.interfaces";

export default class Mastak {
  private cache: Cache;
  private errors: Errors;

  constructor() {
    this.cache = {};
    this.errors = {
      BadRequest:
        "There's something wrong with the request",
      BadProcessor:
        "There's something wrong with the response processor",
      BadKey: "There's something wrong with the key"
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
            } catch(err) {
                return reject(err);
            } 
        } else {
           return reject(this._generateError("BadKey", "Key already exists"));
        }
    });
  }

  // @type Primary Function
  // @desc Get the current value stored for an API
  get(key: string): Promise<CachedAPI> {
    return new Promise((resolve, reject) => {
      if (key in this.cache) {
        resolve(this.cache[key]);
      } else {
        return reject(this._generateError("BadKey", "Key does not exist"))
      }
    });
  }

  // @type Primary Function
  // @desc Delete a cached API based on the key entered
  delete(key: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        if(key in this.cache) {
            delete this.cache[key];
            resolve(true); // Might change this later on
        } else {
            return reject(this._generateError("BadKey", "Key does not exist"))
        }
      });
  }

  // @type Primary Function 
  // @desc Update a cached API 
  update(key: string, api: CachedAPI, updateNow: boolean): Promise<CachedAPI> {
    return new Promise((resolve, reject) => {
        if(key in this.cache) {
            for(const property in api) {
                if(this.cache[key][property]) {
                    this.cache[key][property] = api[property];
                } 
            }
            resolve(this.cache[key]);
        } else {
            reject("Error: Key does not exist")
        }
    })
  }

  // @type Secondary Function
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
            
        try{
            response = this._checkResponseStatus(response);
        } catch(err) {
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
