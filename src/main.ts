import fetch from "node-fetch";

interface CacheData {
    requestData: {
        url: string,
        params: any,
        headers: string,
        updateInterval: number,
        dataPro: any
    },
    data: any
};

export default class Silo {
    private cache: Array<CacheData>;

    constructor() {
        this.cache = [];
    }
}