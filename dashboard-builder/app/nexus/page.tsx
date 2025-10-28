import Nexus from "@/components/nexus/Nexus";
import { useAccount } from "wagmi";

export default function NexusPage() {
    const { isConnected } = useAccount();
    const isTestnet = process.env.NEXT_PUBLIC_ENABLE_TESTNET === "true";
    
    if (!isConnected) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                    <p className="text-muted-foreground">
                        Please connect your wallet to access Nexus features.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="w-full h-screen">
            <div className="w-full h-full flex flex-col gap-y-6 items-center justify-center">
                <Nexus isTestnet={isTestnet} />
            </div>
        </main>
    );
}
