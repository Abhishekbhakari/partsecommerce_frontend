import { useRef, useState } from "react";
import { toast } from "sonner";
import { adminProductService } from "../../service/adminProduct.service";
import type { BulkImportResult } from "../../types/catalog.types";

/** Drag-drop/file-picker CSV bulk import for admin products, posting to the existing
 * `POST /admin/products/import` endpoint (`adminProductService.importCsv`). Response shape per
 * `backend/.../bulkImportExport.controller.ts`: `{ jobId, status, created, updated, errors: [{row,message}] }`. */
export function useBulkImportProducts() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    setResult(null);
    setError(null);
    if (f && !f.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file.");
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await adminProductService.importCsv(file);
      setResult(res.data as BulkImportResult);
      toast.success("CSV import processed.");
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Import failed.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const downloadFailedRowsCsv = () => {
    if (!result?.errors?.length) return;
    const header = "row,message\n";
    const body = result.errors.map((e) => `${e.row},"${e.message.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return {
    file,
    dragActive,
    uploading,
    result,
    error,
    inputRef,
    setDragActive,
    pickFile,
    handleDrop,
    handleUpload,
    downloadFailedRowsCsv,
    reset
  };
}
