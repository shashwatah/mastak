export interface Request {
  url: string;
  method: string;
  body?: {
    [key: string]: any;
  };
  headers?: {
    [key: string]: string;
  };
}

export interface CachedAPI {
  [key: string] : any;
  request: Request;
  updateInterval?: number;
  ttl?: number;
  resProcessor?: any;
  value?: any;
}

export interface Cache {
  [key: string]: CachedAPI;
}

export interface Errors {
  [key: string]: string;
}

export interface Options {}
