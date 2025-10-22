"use client";

import { ThemeProvider } from "next-themes";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Ethereum } from "@thirdweb-dev/chains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { config } from '@/src/lib/wagmi';

const Providers = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 10, // 10 minutes
            },
        },
    }));

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ThirdwebProvider
                    activeChain={Ethereum}
                    clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
                    supportedChains={[Ethereum]}
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
                </ThirdwebProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default Providers;
