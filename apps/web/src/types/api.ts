export interface ResponseMeta {
  limit: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
}

export interface Response<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface ErrorDetail {
  errCode: string;
  field: string;
  message: string;
  description?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: ErrorDetail[];
}
