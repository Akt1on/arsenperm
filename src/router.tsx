import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Accept the QueryClient from main.tsx so there is exactly ONE instance
// shared between RouterProvider context and QueryClientProvider
export const getRouter = (queryClient: QueryClient) =>
  createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
