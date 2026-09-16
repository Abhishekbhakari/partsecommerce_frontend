import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadService, filenameFromUploadUrl } from "@/Common/lib/uploadService";

interface UseImageUploaderArgs {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

/** Drag-drop/file-picker multi-image uploader backed by `POST /admin/uploads/image` — used by
 * both the admin product form (multi-image, reorder/primary) and the banner form (single image),
 * per docs/PHASE2_ADDENDUM.md §1/§5. */
export function useImageUploader({ images, onChange, maxImages = 8 }: UseImageUploaderArgs) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`You can add up to ${maxImages} image${maxImages === 1 ? "" : "s"}.`);
      return;
    }
    setUploading(true);
    try {
      const toUpload = list.slice(0, remaining);
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const res = await uploadService.uploadImage(file);
        uploaded.push(res.data.url);
      }
      onChange([...images, ...uploaded]);
      if (list.length > toUpload.length) {
        toast.warning(`Only ${toUpload.length} of ${list.length} images were added (max ${maxImages}).`);
      }
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Image upload failed.";
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  };

  const removeAt = (index: number) => {
    const url = images[index];
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    const filename = filenameFromUploadUrl(url);
    if (filename) uploadService.removeImage(filename).catch(() => {});
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [chosen] = next.splice(index, 1);
    next.unshift(chosen);
    onChange(next);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return { uploading, dragActive, inputRef, setDragActive, uploadFiles, handleDrop, removeAt, setPrimary, move };
}
