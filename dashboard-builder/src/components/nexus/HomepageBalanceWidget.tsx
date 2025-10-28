"use client";
import { useNexus } from "@/provider/NexusProvider";
import React, { useEffect, useState, useCallback } from "react";
import { DollarSign, Loader2, Wallet } from "lucide-react";
import { UserAsset } from "@avail-project/nexus-core";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

const HomepageBalanceWidget = () => {
    const { nexusSdk, isInitialized, initializeSDK } = useNexus();
    const { isConnected } = useAccount();
    const [balance, setBalance] = useState<UserAsset[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);

    const fetchUnifiedBalance = useCallback(async () => {
        if (!nexusSdk || !isInitialized) return;

        try {
            setIsLoading(true);
            setError(null);
            const unifiedBalance = await nexusSdk.getUnifiedBalances();
            console.log("unifiedBalance", unifiedBalance);
            setBalance(unifiedBalance);
        } catch (error: unknown) {
            console.error("Unable to fetch balance", error);
            setError(
                error instanceof Error ? error.message : "Failed to fetch balance",
            );
        } finally {
            setIsLoading(false);
        }
    }, [nexusSdk, isInitialized]);

    const handleInitializeAndFetch = useCallback(async () => {
        if (!hasInitialized && isConnected) {
            setHasInitialized(true);
            await initializeSDK();
            // Wait a bit for initialization to complete, then fetch balance
            setTimeout(() => {
                fetchUnifiedBalance();
            }, 1000);
        }
    }, [hasInitialized, isConnected, initializeSDK, fetchUnifiedBalance]);

    // Only fetch balance if SDK is already initialized (not auto-initialize)
    useEffect(() => {
        if (isConnected && isInitialized && hasInitialized) {
            fetchUnifiedBalance();
        }
    }, [isConnected, isInitialized, hasInitialized, fetchUnifiedBalance]);

    // Calculate total USD value
    const totalUsdValue = React.useMemo(() => {
        if (!balance) return 0;

        return balance.reduce((total, token) => {
            return total + token.balanceInFiat;
        }, 0);
    }, [balance]);

    // Get top 3 tokens by value
    const topTokens = React.useMemo(() => {
        if (!balance) return [];

        return balance
            .filter(token => parseFloat(token.balance) > 0)
            .sort((a, b) => b.balanceInFiat - a.balanceInFiat)
            .slice(0, 3);
    }, [balance]);

    if (!isConnected) {
        return (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                        <Wallet className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Connect Your Wallet</h3>
                        <p className="text-sm text-gray-400">View your cross-chain balance and manage assets</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Connect your wallet to see your unified balance across Ethereum, Polygon, Base, and Arbitrum.
                </p>
                <ConnectKitButton.Custom>
                    {({ show }) => (
                        <button
                            onClick={show}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-lg"
                        >
                            <Wallet className="w-4 h-4" />
                            Connect Wallet
                        </button>
                    )}
                </ConnectKitButton.Custom>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 border border-red-500 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500">
                        <Wallet className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Unable to Load Balance</h3>
                        <p className="text-sm text-red-400">Please try refreshing the page</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Loading Balance...</h3>
                        <p className="text-sm text-gray-400">Fetching your cross-chain assets</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show initialization button if connected but not initialized
    if (isConnected && !hasInitialized && !isLoading) {
        return (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                        <Wallet className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">View Your Portfolio</h3>
                        <p className="text-sm text-gray-400">See your cross-chain balance and assets</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Click below to initialize Nexus and view your unified balance across Ethereum, Polygon, Base, and Arbitrum.
                </p>
                <button
                    onClick={handleInitializeAndFetch}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-lg"
                >
                    <Wallet className="w-4 h-4" />
                    Load My Balance
                </button>
            </div>
        );
    }


    return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                        <Wallet className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Your Portfolio</h3>
                        <p className="text-sm text-gray-400">Cross-chain balance</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-300" />
                        <span className="text-2xl font-bold text-white">
                            ${totalUsdValue.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">Total Value</p>
                </div>
            </div>

            {topTokens.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300 mb-2">Top Assets</p>
                    <div className="grid grid-cols-3 gap-3">
                        {topTokens.map((token) => (
                            <div key={token.symbol} className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
                                <div className="text-sm font-semibold text-white">
                                    {token.symbol}
                                </div>
                                <div className="text-xs text-gray-300">
                                    ${token.balanceInFiat.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {parseFloat(token.balance).toFixed(4)}
                                </div>
                            </div>
                        ))}
                    </div>
                    {balance && balance.filter(token => parseFloat(token.balance) > 0).length > 3 && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                            +{balance.filter(token => parseFloat(token.balance) > 0).length - 3} more assets
                        </p>
                    )}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                    Powered by <span className="font-semibold text-gray-400">Avail Nexus</span> •
                    Unified across Ethereum, Polygon, Base & Arbitrum
                </p>
            </div>
        </div>
    );
};

export default HomepageBalanceWidget;
