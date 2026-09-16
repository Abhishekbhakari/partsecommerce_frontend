import { Link } from "react-router-dom";
import { ArrowLeft, UploadCloud, FileText, CheckCircle2, XCircle, Download } from "lucide-react";
import { useBulkImportProducts } from "./index.hook";
import { Button } from "@/Common/components/ui/button";
import { Badge } from "@/Common/components/ui/badge";

/** Admin screen: bulk CSV product import, per docs/PHASE2_ADDENDUM.md §5. Expected columns
 * (per backend/.../bulkImportExport.controller.ts):
 * sku,title,categorySlug,brandSlug,partNumber,oemNumber,basePrice,gstRate,stock */
export default function BulkImportProducts() {
  const { file, dragActive, uploading, result, error, inputRef, setDragActive, pickFile, handleDrop, handleUpload, downloadFailedRowsCsv, reset } =
    useBulkImportProducts();

  return (
    <div>
      <Link to="/admin/products" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>
      <h1 className="text-xl font-extrabold">Bulk CSV Product Import</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upsert products by SKU. Required columns: <code className="rounded bg-muted px-1 py-0.5 text-xs">sku, title, categorySlug, brandSlug, basePrice</code>.
        Optional: <code className="rounded bg-muted px-1 py-0.5 text-xs">partNumber, oemNumber, gstRate, stock</code>.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`mt-5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
          dragActive ? "border-primary bg-primary-50" : "border-border bg-secondary/40"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Drag & drop a .csv file here, or</p>
        <Button variant="outline" className="mt-3" onClick={() => inputRef.current?.click()}>
          Choose File
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        {file && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" /> {file.name}
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Uploading…" : "Upload & Import"}
        </Button>
        {(file || result) && (
          <Button variant="ghost" onClick={reset}>
            Clear
          </Button>
        )}
      </div>

      {result && (
        <div className="mt-6 rounded-lg border border-border p-4">
          <h2 className="font-bold">Import Result</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Created: {result.created}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Updated: {result.updated}
            </Badge>
            <Badge variant={result.errors.length ? "destructive" : "outline"} className="gap-1">
              <XCircle className="h-3.5 w-3.5" /> Failed: {result.errors.length}
            </Badge>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Row Errors</h3>
                <Button variant="outline" size="sm" onClick={downloadFailedRowsCsv}>
                  <Download className="h-3.5 w-3.5" /> Download failed rows
                </Button>
              </div>
              <div className="max-h-72 overflow-auto rounded-md border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary text-secondary-foreground">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Row</th>
                      <th className="px-3 py-2 font-semibold">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2">{e.row}</td>
                        <td className="px-3 py-2 text-destructive">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
