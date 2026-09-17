/** JWT payload shared by customer and admin access/refresh tokens. */
export interface TokenPayload {
    userId: number;
    role: string;
    type: 'customer' | 'admin' | 'seller';
    email?: string;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface PaginationResult {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
