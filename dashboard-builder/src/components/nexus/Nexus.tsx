import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnifiedBalance from "./UnifiedBalance";
import { cn } from "@/lib/utils";

const Nexus = ({ isTestnet }: { isTestnet: boolean }) => {
    console.log("isTestnet", isTestnet);
    return (
        <Card className="bg-foreground !shadow-[var(--ck-modal-box-shadow)] !rounded-[var(--ck-connectbutton-border-radius)] border-none mx-auto w-[95%] max-w-xl">
            <CardHeader className="flex flex-col w-full items-center">
                <CardTitle className="text-xl">Nexus Integration</CardTitle>
                <CardDescription className="text-center">
                    Seamlessly manage your cross-chain assets and execute DeFi operations.
                    Connect your wallet to experience the Nexus Effect.
                </CardDescription>
                {isTestnet && (
                    <CardDescription className="text-xs text-center">
                        You are on Devnet.
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="px-1 md:px-6">
                <Tabs defaultValue="unified-balance">
                    <TabsList
                        className={cn(
                            "grid w-full shadow-[var(--ck-primary-button-box-shadow)]",
                            isTestnet ? "grid-cols-1" : "grid-cols-1"
                        )}
                    >
                        <TabsTrigger
                            value="unified-balance"
                            className="data-[state=active]:border-secondary/50 px-2"
                        >
                            Unified Balance
                        </TabsTrigger>
                        {/* Additional tabs can be added here for Bridge, Transfer, etc. */}
                    </TabsList>
                    <TabsContent value="unified-balance">
                        <UnifiedBalance />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default Nexus;
