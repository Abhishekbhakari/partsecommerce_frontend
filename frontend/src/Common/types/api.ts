/** Standard error shape per docs/API_CONTRACT.md "Errors" convention. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const anyErr = err as { response?: { data?: ApiError } };
  return anyErr?.response?.data?.error?.message || fallback;
}
