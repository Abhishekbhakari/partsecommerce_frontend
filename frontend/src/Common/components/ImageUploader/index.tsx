import { UploadCloud, X, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useImageUploader } from "./index.hook";
import { cn } from "@/Common/lib/utils";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  /** When true (multi-image, e.g. product gallery) shows reorder/primary controls per thumbnail. */
  showPrimary?: boolean;
}

/** Real drag-drop/file-picker image uploader wired to `POST /admin/uploads/image` — replaces raw
 * image-URL text inputs in the admin product form and banner form, per
 * docs/PHASE2_ADDENDUM.md §5. Shows preview thumbnails; when `showPrimary` is set (product
 * gallery) also supports reorder and "set as primary" (first image = primary). */
export function ImageUploader({ images, onChange, maxImages = 8, showPrimary = false }: ImageUploaderProps) {
  const { uploading, dragActive, inputRef, setDragActive, uploadFiles, handleDrop, removeAt, setPrimary, move } = useImageUploader({
    images,
    onChange,
    maxImages
  });

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragActive ? "border-primary bg-primary-50" : "border-border bg-secondary/40",
          images.length >= maxImages && "pointer-events-none opacity-50"
        )}
      >
        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <UploadCloud className="h-6 w-6 text-muted-foreground" />}
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {uploading ? "Uploading…" : `Drag & drop images or click to browse (${images.length}/${maxImages})`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={maxImages > 1}
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={src + i} className="group relative overflow-hidden rounded-md border border-border">
              <img src={src} alt={`Image ${i + 1}`} className="h-24 w-full object-cover" />
              {showPrimary && i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  <Star className="h-2.5 w-2.5 fill-current" /> Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
              {showPrimary && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 px-1 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-0.5 text-white disabled:opacity-30" aria-label="Move left">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {i !== 0 && (
                    <button type="button" onClick={() => setPrimary(i)} className="text-[10px] font-semibold text-white underline">
                      Set primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="rounded p-0.5 text-white disabled:opacity-30"
                    aria-label="Move right"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
