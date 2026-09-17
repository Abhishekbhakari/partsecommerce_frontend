import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminSellerService } from "../../service/adminSeller.service";
import { getErrorMessage } from "@/Common/types/api";
import type { Seller, SellerPayout } from "@/Common/types/entities";

export function useAdminSellerList() {
  const [items, setItems] = useState<Seller[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Seller | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [commissionValue, setCommissionValue] = useState("");
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutStart, setPayoutStart] = useState("");
  const [payoutEnd, setPayoutEnd] = useState("");
  const [lastPayout, setLastPayout] = useState<SellerPayout | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    adminSellerService
      .list({ status: status || undefined, page: 1, pageSize: 50 })
      .then((res) => {
        setItems(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const approve = async (seller: Seller) => {
    setBusy(true);
    try {
      await adminSellerService.approve(seller.id);
      toast.success(`${seller.businessName} approved`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't approve this seller."));
    } finally {
      setBusy(false);
    }
  };

  const openReject = (seller: Seller) => {
    setSelected(seller);
    setRejectReason("");
    setRejectOpen(true);
  };

  const submitReject = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await adminSellerService.reject(selected.id, rejectReason);
      toast.success(`${selected.businessName} rejected`);
      setRejectOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't reject this seller."));
    } finally {
      setBusy(false);
    }
  };

  const suspend = async (seller: Seller) => {
    if (!confirm(`Suspend ${seller.businessName}? They will no longer be able to log in.`)) return;
    setBusy(true);
    try {
      await adminSellerService.suspend(seller.id);
      toast.success(`${seller.businessName} suspended`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't suspend this seller."));
    } finally {
      setBusy(false);
    }
  };

  const openCommission = (seller: Seller) => {
    setSelected(seller);
    setCommissionValue(seller.commissionRateOverride != null ? String(seller.commissionRateOverride) : "");
    setCommissionOpen(true);
  };

  const submitCommission = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const value = commissionValue.trim() === "" ? null : Number(commissionValue);
      await adminSellerService.setCommission(selected.id, value);
      toast.success("Commission rate updated");
      setCommissionOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update commission rate."));
    } finally {
      setBusy(false);
    }
  };

  const openPayout = (seller: Seller) => {
    setSelected(seller);
    setPayoutStart("");
    setPayoutEnd("");
    setLastPayout(null);
    setPayoutOpen(true);
  };

  const submitPayout = async () => {
    if (!selected || !payoutStart || !payoutEnd) return;
    setBusy(true);
    try {
      const res = await adminSellerService.generatePayout(selected.id, payoutStart, payoutEnd);
      setLastPayout(res.data);
      toast.success("Payout generated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't generate payout."));
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    if (!lastPayout) return;
    setBusy(true);
    try {
      const res = await adminSellerService.markPayoutPaid(lastPayout.id);
      setLastPayout(res.data);
      toast.success("Payout marked as paid");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't mark payout as paid."));
    } finally {
      setBusy(false);
    }
  };

  return {
    items,
    total,
    status,
    setStatus,
    loading,
    busy,
    approve,
    suspend,
    selected,
    rejectOpen,
    setRejectOpen,
    rejectReason,
    setRejectReason,
    openReject,
    submitReject,
    commissionOpen,
    setCommissionOpen,
    commissionValue,
    setCommissionValue,
    openCommission,
    submitCommission,
    payoutOpen,
    setPayoutOpen,
    payoutStart,
    setPayoutStart,
    payoutEnd,
    setPayoutEnd,
    lastPayout,
    openPayout,
    submitPayout,
    markPaid
  };
}
