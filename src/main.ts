import fetch from "node-fetch";

import { CachedAPI } from "./types/main.interfaces";

export default class Mastak {
    private cache: Array<CachedAPI>;

    constructor() {
        this.cache = [];
    }
}