import { createFileRoute, redirect } from "@tanstack/react-router";

// The overview dashboard is now rendered directly in admin.tsx when path === "/admin"
// This file handles the /admin/ (trailing slash) variant — redirect to /admin
export const Route = createFileRoute("/admin/")({
  beforeLoad: () => { throw redirect({ to: "/admin" }); },
  component: () => null,
});
