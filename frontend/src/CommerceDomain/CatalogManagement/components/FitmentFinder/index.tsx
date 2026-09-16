import { Search } from "lucide-react";
import { Select } from "@/Common/components/ui/select";
import { Button } from "@/Common/components/ui/button";
import { useFitmentFinder } from "./index.hook";
import { cn } from "@/Common/lib/utils";

/** Make → Model → Year cascading fitment widget. Embeddable on the home page, or as the header
 * of the standalone /fitment-finder page (see pages/FitmentFinder). */
export default function FitmentFinder({ variant = "card" }: { variant?: "card" | "inline" }) {
  const { makes, models, years, make, setMake, model, setModel, year, setYear, loading, canSubmit, handleSubmit } =
    useFitmentFinder();

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        variant === "card" && "rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6",
        "flex flex-col gap-3 sm:flex-row sm:items-end"
      )}
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Make</label>
        <Select
          placeholder={loading ? "Loading…" : "Select make"}
          value={make}
          onChange={(e) => setMake(e.target.value)}
          disabled={loading}
          options={makes.map((m) => ({ label: m, value: m }))}
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model</label>
        <Select
          placeholder="Select model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={!make}
          options={models.map((m) => ({ label: m, value: m }))}
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Year</label>
        <Select
          placeholder="Select year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={!model}
          options={years.map((y) => ({ label: String(y), value: String(y) }))}
        />
      </div>
      <Button type="submit" disabled={!canSubmit} className="sm:w-auto">
        <Search className="h-4 w-4" />
        Find Parts
      </Button>
    </form>
  );
}
