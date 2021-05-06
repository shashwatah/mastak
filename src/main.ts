import fetch from "node-fetch";

import { Cache, CachedAPI, Errors } from "./types/main.interfaces";

export default class Mastak {
    private cache: Cache;
    // private errors: Errors;

    constructor() {
        this.cache = {};
        // this.errors = {
        //     "BadRequest": "The request you input returned an error: _err_",
        //     "BadProcessor": "The response processor is not working correctly, error: _err_"
        // };
    }

    set(key: string, api: CachedAPI): Promise<string | CachedAPI> {
        return new Promise(async (resolve, reject) => {
            if(!(key in this.cache)) {
                await fetch(api.request.url, {
                    method: api.request.method,
                    ...(("body" in api.request) && {body: JSON.stringify(api.request.body)}),
                    ...(("headers" in api.request) && {headers: api.request.headers})
                }).then(response => this.checkResponseStatus(response))
                .then(response => response.json())
                .then(resJSON => {
                    console.log(resJSON);
                    if(api.resProcessor) {
                        let processedData;
                        try {
                            processedData = api.resProcessor(resJSON);
                        } catch (error) {
                            let err = new Error();
                            err.name = "BadProcessor";
                            err.message = `There's something wrong with the response processor, err: ${error}`;
                            throw err;
                        }
                        
                        return(processedData);
                    } else {
                        return resJSON;
                    }
                })
                .then(finalData => {
                    this.cache[key] = api;
                    this.cache[key].value = finalData;  
                }).catch(err => {
                    reject(err.message);
                });
            } else {
                reject("Error: Key already exists");
            }

            resolve(this.cache[key]);
        })
    }

    get(key: string): Promise<string | CachedAPI> {
        return new Promise((resolve, reject) => {
            if(key in this.cache) {
                resolve(this.cache[key]);
            } else {
                reject("Data not found");
            }
        });
    }

    checkResponseStatus(res: any): any {
        if(res.ok) {
            return res;
        } else {
            let error = new Error();
            error.name = "BadRequest";
            error.message = `There's something wrong with the request you entered, error: ${res.statusText}`;
            throw error;
        }
    }

    // setMulti(): any {}
    // getMulti(): any {}
    // delete(): any {}
    // deleteMulti(): any {}
    // deleteAll(): any {}
    // update(): any {}
    // has(): any {}
    // returnKeys(): any {}
    // take(): any {}

    // updateData(): any {}
    // checkValues(): any {}
    // expire(): any {}
    // generateError(): any {}
    
}