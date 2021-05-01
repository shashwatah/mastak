import fetch from "node-fetch";

import { Cache, CachedAPI } from "./types/main.interfaces";

export default class Mastak {
    private cache: Cache;

    constructor() {
        this.cache = {};
    }

    set(key: string, api: CachedAPI): Promise<string | CachedAPI> {
        return new Promise(async (resolve, reject) => {
            if(!(key in this.cache)) {
                await fetch(api.request.url, {
                    method: api.request.method,
                    ...(("body" in api.request) && {body: JSON.stringify(api.request.body)}),
                    ...(("headers" in api.request) && {headers: api.request.headers})
                }).then(res => res.json())
                .then(json => {
                    if(api.dataProcessor) {
                        return(api.dataProcessor(json));
                    } else {
                        return(json);
                    }
                })
                .then(processedData => {
                    this.cache[key] = api;
                    this.cache[key].data = processedData;  
                });
            } else {
                reject("Error");
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

    setMulti(): any {}
    getMulti(): any {}
    delete(): any {}
    deleteMulti(): any {}
    deleteAll(): any {}
    update(): any {}
    has(): any {}
    returnKeys(): any {}
    take(): any {}
}