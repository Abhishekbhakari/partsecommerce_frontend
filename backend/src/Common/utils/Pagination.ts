import { Request } from 'express';
import type { PaginationResult } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const buildPagination = (
    count: number,
    page: number,
    pageSize: number
): PaginationResult => ({
    total: count,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(count / pageSize))
});

/** Parses `?page` and `?pageSize` per docs/API_CONTRACT.md conventions (1-indexed, default 20, max 100). */
export const parsePagination = (
    req: Request
): { page: number; pageSize: number; offset: number; limit: number } => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || DEFAULT_PAGE);
    const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGE_SIZE)
    );
    return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
};
