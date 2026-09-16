import api from "@/Common/lib/api";
import type { Category, Brand, Product } from "@/Common/types/entities";
import type {
  ProductListQuery,
  ProductListResponse,
  AutocompleteResponse,
  SearchResponse,
  FitmentOptionsResponse,
  FitmentLookupResponse
} from "../types/catalog.types";

/** All calls per docs/API_CONTRACT.md "Products / Catalog / Search / Fitment". One function
 * per endpoint, thin wrapper over the shared axios client — no business logic here. */
export const catalogService = {
  getCategories: (parentId?: number) => api.get<Category[]>("/categories", { params: { parentId } }),

  getBrands: (search?: string) => api.get<Brand[]>("/brands", { params: { search } }),

  getProducts: (query: ProductListQuery) => api.get<ProductListResponse>("/products", { params: query }),

  getProductBySlug: (slug: string) => api.get<Product>(`/products/${slug}`),

  autocomplete: (q: string) => api.get<AutocompleteResponse>("/search/autocomplete", { params: { q } }),

  search: (q: string, page = 1, pageSize = 20) => api.get<SearchResponse>("/search", { params: { q, page, pageSize } }),

  fitmentLookup: (make: string, model: string, year: number) =>
    api.get<FitmentLookupResponse>("/fitment/lookup", { params: { make, model, year } }),

  fitmentOptions: (make?: string, model?: string) => api.get<FitmentOptionsResponse>("/fitment/options", { params: { make, model } }),

  getReviews: (productId: number, page = 1, pageSize = 10) =>
    api.get(`/products/${productId}/reviews`, { params: { page, pageSize } }),

  submitReview: (productId: number, data: { rating: number; comment: string }) =>
    api.post(`/products/${productId}/reviews`, data)
};
