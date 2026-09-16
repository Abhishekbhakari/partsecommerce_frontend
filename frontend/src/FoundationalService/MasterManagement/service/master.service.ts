import api from "@/Common/lib/api";
import type { Category, Brand, Coupon, Review, Banner } from "@/Common/types/entities";

/**
 * ASSUMPTION (see frontend/STATUS.md): docs/API_CONTRACT.md only documents public GET
 * /categories and GET /brands — there's no listed admin create/update/delete for either. We
 * mirror the REST shape of the documented /admin/products endpoints (`/admin/categories`,
 * `/admin/brands`) as the most likely backend shape; flag for Backend to confirm/adjust.
 */
export const masterService = {
  listCategories: () => api.get<Category[]>("/categories"),
  createCategory: (data: Partial<Category>) => api.post<Category>("/admin/categories", data),
  updateCategory: (id: number, data: Partial<Category>) => api.patch<Category>(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete<{ success: boolean }>(`/admin/categories/${id}`),

  listBrands: () => api.get<Brand[]>("/brands"),
  createBrand: (data: Partial<Brand>) => api.post<Brand>("/admin/brands", data),
  updateBrand: (id: number, data: Partial<Brand>) => api.patch<Brand>(`/admin/brands/${id}`, data),
  deleteBrand: (id: number) => api.delete<{ success: boolean }>(`/admin/brands/${id}`),

  listCoupons: () => api.get<Coupon[]>("/admin/coupons"),
  createCoupon: (data: Partial<Coupon>) => api.post<Coupon>("/admin/coupons", data),
  updateCoupon: (id: number, data: Partial<Coupon>) => api.patch<Coupon>(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: number) => api.delete<{ success: boolean }>(`/admin/coupons/${id}`),

  listPendingReviews: () => api.get<{ items: Review[]; total: number }>("/admin/reviews", { params: { status: "pending" } }),
  moderateReview: (id: number, status: "approved" | "rejected") => api.patch<Review>(`/admin/reviews/${id}`, { status }),

  listBanners: () => api.get<Banner[]>("/admin/banners"),
  createBanner: (data: Partial<Banner>) => api.post<Banner>("/admin/banners", data),
  updateBanner: (id: number, data: Partial<Banner>) => api.patch<Banner>(`/admin/banners/${id}`, data),
  deleteBanner: (id: number) => api.delete<{ success: boolean }>(`/admin/banners/${id}`)
};
