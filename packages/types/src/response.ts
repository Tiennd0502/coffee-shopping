export interface Meta {
  limit: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
}

export interface ResponsSuccess<T> {
  data: T;
}

export interface PaginatedResponse<T> extends ResponsSuccess<T> {
  data: T;
  meta: Meta;
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
