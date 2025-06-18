"use client";

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi/config';
import { Toaster } from '@/components/ui/sonner';


const queryClient = new QueryClient()

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster 
          theme="dark" 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
            },
          }}
        />
      </QueryClientProvider>
    </WagmiProvider>
  )
}