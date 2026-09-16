import api from "./api";

/** `POST /admin/uploads/image` (multipart field `file`) → `{ url, filename }`, per
 * docs/PHASE2_ADDENDUM.md §1. Reused for both product images and banner images — the frontend
 * uploads first, gets a URL back, then includes that URL in the product/banner payload. */
export interface UploadedImage {
  url: string;
  filename: string;
}

export const uploadService = {
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<UploadedImage>("/admin/uploads/image", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  removeImage: (filename: string) => api.delete<{ success: boolean }>(`/admin/uploads/image/${filename}`)
};

/** Extracts the storage filename back out of a URL previously returned by `uploadImage`, so a
 * "remove" action can call `DELETE /admin/uploads/image/:filename` — best-effort only (removal is
 * best-effort server-side too), never blocks the UI if it can't be parsed (e.g. an externally
 * supplied URL from before this feature existed). */
export function filenameFromUploadUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname;
    return path.split("/").pop() || null;
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1] || null;
  }
}
