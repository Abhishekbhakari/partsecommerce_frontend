import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Category, Brand } from "@/Common/types/entities";
import { masterService } from "../../service/master.service";
import { getErrorMessage } from "@/Common/types/api";

export function useCategoryBrandMaster() {
  const [tab, setTab] = useState<"categories" | "brands">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([masterService.listCategories(), masterService.listBrands()])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data ?? []);
        setBrands(brandRes.data ?? []);
      })
      .catch(() => {
        setCategories([]);
        setBrands([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    try {
      if (tab === "categories") {
        await masterService.createCategory({ name: name.trim(), slug });
        toast.success("Category created");
      } else {
        await masterService.createBrand({ name: name.trim(), slug });
        toast.success("Brand created");
      }
      setName("");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save — the admin master endpoints may not be live yet."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete this ${tab === "categories" ? "category" : "brand"}?`)) return;
    try {
      if (tab === "categories") {
        await masterService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        await masterService.deleteBrand(id);
        setBrands((prev) => prev.filter((b) => b.id !== id));
      }
      toast.success("Deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return { tab, setTab, categories, brands, loading, modalOpen, setModalOpen, name, setName, saving, handleCreate, handleDelete };
}
