"use client";
import { useNexus } from "@/provider/NexusProvider";
import React, { useEffect, useState, useCallback } from "react";
import { DollarSign, Loader2, AlertTriangle, CheckCircle, Wallet } from "lucide-react";
import { CHAIN_METADATA, UserAsset } from "@avail-project/nexus-core";

interface CompactUnifiedBalanceProps {
    requiredEthAmount: number;
}

const CompactUnifiedBalance = ({ requiredEthAmount }: CompactUnifiedBalanceProps) => {
    const { nexusSdk, isInitialized, initializeSDK } = useNexus();
    const [balance, setBalance] = useState<UserAsset[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);

    const fetchUnifiedBalance = useCallback(async () => {
        if (!nexusSdk || !isInitialized) {
            console.log("CompactUnifiedBalance: SDK not ready:", { nexusSdk: !!nexusSdk, isInitialized });
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            console.log("CompactUnifiedBalance: Fetching unified balance...");
            const unifiedBalance = await nexusSdk.getUnifiedBalances();
            console.log("CompactUnifiedBalance: Raw balance data:", unifiedBalance);
            setBalance(unifiedBalance);
        } catch (error: unknown) {
            console.error("CompactUnifiedBalance: Unable to fetch balance", error);
            setError(
                error instanceof Error ? error.message : "Failed to fetch balance",
            );
        } finally {
            setIsLoading(false);
        }
    }, [nexusSdk, isInitialized]);

    const handleInitializeAndFetch = useCallback(async () => {
        if (!hasInitialized) {
            setHasInitialized(true);
            console.log("CompactUnifiedBalance: Starting SDK initialization...");
            await initializeSDK();
            console.log("CompactUnifiedBalance: SDK initialization completed");
            // Wait longer for initialization to complete
            setTimeout(() => {
                console.log("CompactUnifiedBalance: Attempting to fetch balance after delay...");
                fetchUnifiedBalance();
            }, 2000);
        }
    }, [hasInitialized, initializeSDK, fetchUnifiedBalance]);

    // Auto-fetch balance when SDK is initialized (like the main page)
    useEffect(() => {
        if (isInitialized && hasInitialized) {
            fetchUnifiedBalance();
        }
    }, [isInitialized, hasInitialized, fetchUnifiedBalance]);

    // Calculate total ETH balance across all chains
    const totalEthBalance = React.useMemo(() => {
        if (!balance) {
            console.log("CompactUnifiedBalance: No balance data for ETH calculation");
            return 0;
        }
        
        const ethTokens = balance.filter(token => token.symbol === 'ETH');
        console.log("CompactUnifiedBalance: ETH tokens found:", ethTokens);
        
        const total = ethTokens.reduce((total, token) => {
            const tokenBalance = parseFloat(token.balance);
            console.log(`CompactUnifiedBalance: ETH token balance: ${token.symbol} = ${tokenBalance}`);
            return total + tokenBalance;
        }, 0);
        
        console.log("CompactUnifiedBalance: Total ETH balance:", total);
        return total;
    }, [balance]);

    // Calculate total USD value
    const totalUsdValue = React.useMemo(() => {
        if (!balance) {
            console.log("CompactUnifiedBalance: No balance data for USD calculation");
            return 0;
        }
        
        const total = balance.reduce((total, token) => {
            return total + token.balanceInFiat;
        }, 0);
        
        console.log("CompactUnifiedBalance: Total USD value:", total);
        return total;
    }, [balance]);

    const hasSufficientFunds = totalEthBalance >= requiredEthAmount;
    const shortfall = requiredEthAmount - totalEthBalance;

    if (error) {
        return (
            <div className="p-4 bg-gray-900 border border-red-500 rounded-2xl">
                <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Unable to load balance</span>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-2xl">
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                    <span className="text-sm text-gray-400">Loading balance...</span>
                </div>
            </div>
        );
    }

    // Show initialization button if not initialized
    if (!hasInitialized && !isLoading) {
        return (
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-2xl">
                <div className="text-center">
                    <div className="text-sm font-medium text-white mb-2">
                        Check Your Balance
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                        Initialize Nexus to see your cross-chain balance and verify sufficient funds
                    </div>
                    <button
                        onClick={handleInitializeAndFetch}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        <Wallet className="w-3 h-3" />
                        Load Balance
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Total Balance Summary */}
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white">Your Balance</div>
                    <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-300" />
                        <span className="text-sm font-semibold text-white">
                            ${totalUsdValue.toFixed(2)}
                        </span>
                    </div>
                </div>
                
                <div className="text-lg font-bold text-white">
                    {totalEthBalance.toFixed(6)} ETH
                </div>
            </div>

            {/* Fund Sufficiency Check */}
            <div className={`p-4 rounded-2xl border ${
                hasSufficientFunds 
                    ? 'bg-green-900/20 border-green-500' 
                    : 'bg-yellow-900/20 border-yellow-500'
            }`}>
                <div className="flex items-center gap-2 mb-2">
                    {hasSufficientFunds ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className={`text-sm font-medium ${
                        hasSufficientFunds ? 'text-green-300' : 'text-yellow-300'
                    }`}>
                        {hasSufficientFunds ? 'Sufficient Funds' : 'Insufficient Funds'}
                    </span>
                </div>
                
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Required:</span>
                        <span className="font-medium text-white">{requiredEthAmount.toFixed(6)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Available:</span>
                        <span className="font-medium text-white">{totalEthBalance.toFixed(6)} ETH</span>
                    </div>
                    {!hasSufficientFunds && (
                        <div className="flex justify-between mt-1 pt-1 border-t border-yellow-500/30">
                            <span className="text-yellow-300 font-medium">Shortfall:</span>
                            <span className="text-yellow-300 font-bold">{shortfall.toFixed(6)} ETH</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chain Breakdown (Compact) */}
            {balance && balance.length > 0 && (
                <div className="p-4 bg-gray-900 border border-gray-700 rounded-2xl">
                    <div className="text-sm font-medium text-white mb-2">Balance by Chain</div>
                    <div className="space-y-2">
                        {balance
                            .filter(token => parseFloat(token.balance) > 0)
                            .slice(0, 3) // Show only top 3 tokens
                            .map((token) => (
                                <div key={token.symbol} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-medium text-white">{token.symbol}</div>
                                        <div className="text-xs text-gray-400">
                                            ${token.balanceInFiat.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-white">
                                        {parseFloat(token.balance).toFixed(4)}
                                    </div>
                                </div>
                            ))}
                        {balance.filter(token => parseFloat(token.balance) > 0).length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                                +{balance.filter(token => parseFloat(token.balance) > 0).length - 3} more tokens
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompactUnifiedBalance;
