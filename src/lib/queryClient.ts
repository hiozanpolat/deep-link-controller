import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Local-first app: no aggressive refetching; React Query is wired for
      // future remote integrations (e.g. Universal Link verification APIs).
      retry: 1,
      staleTime: 60_000,
    },
  },
});
