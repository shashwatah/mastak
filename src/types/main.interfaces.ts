export interface StandardDataset {
  [key: string]: any;
}

export interface Errors {
  [key: string]: string;
}

export interface Options extends StandardDataset {
  stdTTL?: number;
  autoUpdate?: boolean;
  updateInterval?: number;
  checkPeriod?: number;
}

export interface OptionsInternal extends StandardDataset {
  stdTTL: number;
  autoUpdate: boolean;
  updateInterval: number;
  checkPeriod: number;
}

export interface Request extends StandardDataset {
  url: string;
  method: string;
  body?: {
    [key: string]: any;
  };
  headers?: {
    [key: string]: string;
  };
}

export interface CacheInput extends StandardDataset {
  request: Request;
  resProcessor?: any;
  updateInterval?: number;
  ttl?: number;
}

export interface CacheUnit extends CacheInput {
  setTime: number;
  lastUpdate: number;
  value: any;
}

export interface Cache {
  [key: string]: CacheUnit;
}
