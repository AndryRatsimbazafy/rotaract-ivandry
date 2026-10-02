export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type Listed<T> = { data: T[] };

export type ApiErrorDetail = { field: string; message: string };

export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string;
  details?: ApiErrorDetail[];
};

export type Admin = { id: string; email: string; role: string };

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  admin: Admin;
};
