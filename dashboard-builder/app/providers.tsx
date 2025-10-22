"use client";

import { ThemeProvider } from "next-themes";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Ethereum } from "@thirdweb-dev/chains";
import { Toaster } from 'react-hot-toast'

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThirdwebProvider
            activeChain={Ethereum}
            clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "0131a6065b759468d5787b85c9ee69a3"}
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
    );
};

export default Providers;
