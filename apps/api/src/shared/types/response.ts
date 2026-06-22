export interface Meta {
  limit: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
}

export interface PaginatedResponse<T> {
  data: T;
  meta?: Meta;
}
