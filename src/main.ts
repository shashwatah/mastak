import fetch from "node-fetch";

import { Cache, CachedAPI } from "./types/main.interfaces";

export default class Mastak {
    private cache: Cache;

    constructor() {
        this.cache = {};
    }

    set(key: string, api: CachedAPI): string {
        if(!(key in this.cache)) {
            fetch(api.request.url, {
                method: api.request.method,
                body: JSON.stringify(api.request.body),
                headers: api.request.headers
            }).then(res => res.json())
            .then(json => api.dataProcessor(json))
            .then(processedData => {
                this.cache.key = api;
                this.cache.key.data = processedData;  
            });
        } else {
            return("Error");
        }

        return("Success");
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