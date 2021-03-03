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
        body?: {
            [key: string]: string
        },
        headers?: {
            [key: string]: string
        },
        autoUpdate: boolean,
        updateInterval?: number,
        dataProcessor?: any
    },
    data?: any
};