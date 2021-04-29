import fetch from "node-fetch";

import { Cache } from "./types/main.interfaces";

export default class Mastak {
    private cache: Cache;

    constructor() {
        this.cache = {};
    }

    set(): any {}
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