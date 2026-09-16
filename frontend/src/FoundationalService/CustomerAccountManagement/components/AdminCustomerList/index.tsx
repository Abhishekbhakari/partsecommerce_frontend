import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminCustomerList } from "./index.hook";
import type { User } from "@/Common/types/entities";
import { Input } from "@/Common/components/ui/input";
import { Badge } from "@/Common/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/Common/components/ui/data-table";
import { Pagination } from "@/Common/components/ui/pagination";

export default function AdminCustomerList() {
  const { items, total, page, pageSize, setPage, search, setSearch, loading } = useAdminCustomerList();
  const navigate = useNavigate();

  const columns: DataTableColumn<User>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-semibold">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => u.email ?? "—" },
    { key: "phone", header: "Phone", render: (u) => u.phone ?? "—" },
    { key: "isVerified", header: "Verified", render: (u) => <Badge variant={u.isVerified ? "success" : "secondary"}>{u.isVerified ? "Yes" : "No"}</Badge> }
  ];

  return (
    <div>
      <h1 className="text-xl font-extrabold">Customers</h1>
      <p className="text-sm text-muted-foreground">{total} registered customers</p>

      <div className="relative mt-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, email, phone…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(u) => u.id}
          loading={loading}
          emptyMessage="No customers found."
          onRowClick={(u) => navigate(`/admin/customers/${u.id}`)}
        />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} className="mt-4" />
      </div>
    </div>
  );
}
