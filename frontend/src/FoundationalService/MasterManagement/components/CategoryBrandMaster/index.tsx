import { Plus, Trash2 } from "lucide-react";
import { useCategoryBrandMaster } from "./index.hook";
import { cn } from "@/Common/lib/utils";
import { Button } from "@/Common/components/ui/button";
import { Input } from "@/Common/components/ui/input";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Modal } from "@/Common/components/ui/modal";
import { Spinner } from "@/Common/components/ui/spinner";

export default function CategoryBrandMaster() {
  const { tab, setTab, categories, brands, loading, modalOpen, setModalOpen, name, setName, saving, handleCreate, handleDelete } =
    useCategoryBrandMaster();

  const rows = tab === "categories" ? categories : brands;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Categories &amp; Brands</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> New {tab === "categories" ? "Category" : "Brand"}
        </Button>
      </div>

      <div className="mt-4 grid w-fit grid-cols-2 gap-1 rounded-md bg-secondary p-1 text-sm font-semibold">
        <button
          className={cn("rounded-md px-4 py-2", tab === "categories" ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
          onClick={() => setTab("categories")}
        >
          Categories
        </button>
        <button
          className={cn("rounded-md px-4 py-2", tab === "brands" ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
          onClick={() => setTab("brands")}
        >
          Brands
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No {tab} yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <Card key={row.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.slug}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`New ${tab === "categories" ? "Category" : "Brand"}`}>
        <div className="space-y-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button className="w-full" loading={saving} onClick={handleCreate}>
            Create
          </Button>
        </div>
      </Modal>
    </div>
  );
}
