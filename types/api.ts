// frontend/types/api.ts

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  error: string | Record<string, string[]>;
  code?: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}