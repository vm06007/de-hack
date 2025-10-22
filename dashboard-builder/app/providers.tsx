"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { config } from '@/src/lib/wagmi';

const Providers = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 10, // 10 minutes
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider
                    theme="midnight"
                    mode="dark"
                    options={{
                        initialChainId: 0,
                        embedGoogleFonts: true,
                    }}
                >
                    <ThemeProvider defaultTheme="dark" disableTransitionOnChange>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#1a1a1a',
                                    color: '#ffffff',
                                    border: '1px solid #333333',
                                },
                            }}
                        />
                    </ThemeProvider>
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default Providers;