import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { User } from "@/Common/types/entities";
import { adminCustomerService } from "../../service/customer.service";
import { Card, CardContent } from "@/Common/components/ui/card";
import { Spinner } from "@/Common/components/ui/spinner";
import { Breadcrumb } from "@/Common/components/ui/breadcrumb";

export default function AdminCustomerDetail() {
  const { id = "" } = useParams();
  const [customer, setCustomer] = useState<(User & { orders?: unknown[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminCustomerService
      .getById(id)
      .then((res) => setCustomer(res.data))
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!customer) return <p className="py-16 text-center text-sm text-muted-foreground">Customer not found.</p>;

  return (
    <div>
      <Breadcrumb items={[{ label: "Customers", to: "/admin/customers" }, { label: customer.name }]} />
      <h1 className="mt-3 text-xl font-extrabold">{customer.name}</h1>

      <Card className="mt-4">
        <CardContent className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Email</p>
            <p className="text-sm">{customer.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Phone</p>
            <p className="text-sm">{customer.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Auth Provider</p>
            <p className="text-sm capitalize">{customer.authProvider}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Verified</p>
            <p className="text-sm">{customer.isVerified ? "Yes" : "No"}</p>
          </div>
        </CardContent>
      </Card>

      <h2 className="mt-6 text-lg font-bold">Order History</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {customer.orders?.length ? `${customer.orders.length} order(s) on file.` : "No orders yet."}
      </p>
    </div>
  );
}
