import type { Product, ProductSummary, Category, Brand } from "@/Common/types/entities";

export interface ProductListQuery {
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
  q?: string;
}

export interface ProductListResponse {
  items: ProductSummary[];
  total: number;
  page: number;
}

export interface AutocompleteResponse {
  suggestions: string[];
  products: ProductSummary[];
}

export interface SearchResponse {
  items: Product[];
  total: number;
}

/** `POST /admin/products/import` response shape, per
 * backend/.../CatalogManagement/api/products/bulkImportExport.controller.ts. */
export interface BulkImportResult {
  jobId: string;
  status: string;
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
}

export interface FitmentOptionsResponse {
  makes: string[];
  models: string[];
  years: number[];
}

export interface FitmentLookupResponse {
  items: ProductSummary[];
  total: number;
}

export type { Product, ProductSummary, Category, Brand };
