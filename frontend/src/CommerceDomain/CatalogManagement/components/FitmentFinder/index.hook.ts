import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { catalogService } from "../../service/catalog.service";

/** Drives the Make → Model → Year cascading selects. Usable standalone (fitment-finder page)
 * or embedded (home page widget) — the `embedded` caller just navigates on submit either way. */
export function useFitmentFinder() {
  const navigate = useNavigate();
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogService
      .fitmentOptions()
      .then((res) => setMakes(res.data.makes ?? []))
      .catch(() => setMakes([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!make) {
      setModels([]);
      setModel("");
      return;
    }
    catalogService
      .fitmentOptions(make)
      .then((res) => setModels(res.data.models ?? []))
      .catch(() => setModels([]));
  }, [make]);

  useEffect(() => {
    if (!make || !model) {
      setYears([]);
      setYear("");
      return;
    }
    catalogService
      .fitmentOptions(make, model)
      .then((res) => setYears(res.data.years ?? []))
      .catch(() => setYears([]));
  }, [make, model]);

  const canSubmit = Boolean(make && model && year);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    navigate(`/fitment-finder?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`);
  };

  return {
    makes,
    models,
    years,
    make,
    setMake,
    model,
    setModel,
    year,
    setYear,
    loading,
    canSubmit,
    handleSubmit
  };
}
