export interface Request {
    url: string,
    method: string,
    body?: {
        [key: string]: string
    },
    headers?: {
        [key: string]: string
    }
}

export interface CachedAPI {
    request: Request,
    autoUpdate: boolean,
    updateInterval?: number,
    dataProcessor?: any
    data?: any
};

export interface Cache {
    [key: string]: CachedAPI
}
