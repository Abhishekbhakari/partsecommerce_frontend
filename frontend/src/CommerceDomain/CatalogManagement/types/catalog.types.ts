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
