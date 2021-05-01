import fetch from "node-fetch";

import { Cache, CachedAPI, Request } from "./types/main.interfaces";

export default class Mastak {
    private cache: Cache;

    constructor() {
        this.cache = {};
    }

    set(key: string, api: CachedAPI): Promise<string> {
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
    
            resolve("Success");
            console.log(this.cache);
        })
    }

    setMulti(): any {}
    get(): any {}
    getMulti(): any {}
    delete(): any {}
    deleteMulti(): any {}
    deleteAll(): any {}
    update(): any {}
    has(): any {}
    returnKeys(): any {}
    take(): any {}
}