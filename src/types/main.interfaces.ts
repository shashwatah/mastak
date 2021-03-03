enum requestMethod {
    GET = 1,
    POST,
    PUT,
    DELETE
};

export interface CachedAPI {
    request: {
        url: string,
        method: string,
        params?: {
            [key: string]: string
        },
        body?: string,
        headers?: string,
        autoUpdate: boolean,
        updateInterval?: number,
        dataProcessor?: any
    },
    data?: any
};