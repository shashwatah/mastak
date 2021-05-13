export interface ValueSet {
    [key: string]: any;
}

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

export interface InputAPI extends ValueSet{
  request: Request;
  resProcessor?: any;
  updateInterval?: number;
  ttl?: number;
}

export interface CachedAPI extends InputAPI {
  setTime?: number;
  value?: any;
}

export interface Cache {
  [key: string]: CachedAPI;
}

export interface Errors {
  [key: string]: string;
}

export interface Options {
    stdTTL?: number;
    autoUpdate?: boolean, 
    updateInterval?: number,
    checkPeriod?: number;
}

