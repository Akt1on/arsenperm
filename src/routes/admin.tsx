import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminOverview } from "./-_admin.overview";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AdminShell>
      {path === "/admin" ? <AdminOverview /> : <Outlet />}
    </AdminShell>
  );
}
