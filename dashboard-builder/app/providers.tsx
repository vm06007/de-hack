"use client";

import { ThemeProvider } from "next-themes";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Ethereum } from "@thirdweb-dev/chains";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThirdwebProvider
            activeChain={Ethereum}
            clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id"}
        >
            <ThemeProvider disableTransitionOnChange>{children}</ThemeProvider>
        </ThirdwebProvider>
    );
};

export default Providers;
