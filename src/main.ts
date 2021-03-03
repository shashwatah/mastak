import fetch from "node-fetch";

import { CachedAPI } from "./types/main.interfaces";

export default class Mastak {
    private cache: Array<CachedAPI>;

    constructor() {
        this.cache = [];
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