"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren, useState } from "react";

export function QueryClientProviderWrapper({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: true,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
