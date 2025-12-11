

export interface IBackendRes<T> {
  statusCode: number | string;
  message: string;
  error?: string | string[];
  data?: T;
}

export interface Role {
  id: number;
  name: string;
}
