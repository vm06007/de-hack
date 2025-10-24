import { useState, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { getWalletClient } from 'wagmi/actions';
import { parseEther, parseUnits, encodeFunctionData } from 'viem';
import toast from 'react-hot-toast';
import { getTokenDecimals } from '@/constants/tokenAddresses';
import { detectWalletCapabilities, getTransactionStrategy, WalletCapabilities } from '../lib/walletCapabilities';
import { config } from '../lib/wagmi';

// ERC20 Token ABI for approval transactions
const ERC20_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "spender", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Hackathon contract ABI - both becomeSponsor and becomeSponsorWithToken functions
const HACKATHON_ABI = [
    {
        "inputs": [],
        "name": "becomeSponsor",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_tokenAmount",
                "type": "uint256"
            }
        ],
        "name": "becomeSponsorWithToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sponsor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "contribution",
                "type": "uint256"
            }
        ],
        "name": "SponsorAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sponsor",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
            }
        ],
        "name": "TokenSponsorAdded",
        "type": "event"
    }
] as const;

export interface BecomeSponsorResult {
    hash: `0x${string}`;
    sponsor?: string;
    contribution?: string;
}

export const useBecomeSponsor = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [walletCapabilities, setWalletCapabilities] = useState<WalletCapabilities | null>(null);
    const [transactionStrategy, setTransactionStrategy] = useState<'legacy' | 'batched' | 'smart-wallet'>('legacy');
    const callbackRef = useRef<((result: BecomeSponsorResult) => void) | null>(null);
    const contributionAmountRef = useRef<string>('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { address, isConnected } = useAccount();
    const { writeContract, data: contractWriteData, error, isPending } = useWriteContract();

    // Wait for transaction receipt
    const { data: txReceipt } = useWaitForTransactionReceipt({
        hash: contractWriteData,
    });

    // Track batched transaction status using EIP-5792
    const [bundleId, setBundleId] = useState<string | null>(null);
    const [bundleStatus, setBundleStatus] = useState<string | null>(null);

    // Update txHash when contractWriteData changes
    useEffect(() => {
        if (contractWriteData && contractWriteData !== txHash) {
            console.log("Sponsor contract write data received:", contractWriteData);
            setTxHash(contractWriteData);
            toast.loading("Transaction submitted, waiting for confirmation...", { id: "become-sponsor" });
        }
    }, [contractWriteData, txHash]);

    // Cleanup function to reset state
    const resetState = () => {
        setIsLoading(false);
        callbackRef.current = null;
        setTxHash(undefined);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Handle writeContract errors (including user rejection)
    useEffect(() => {
        if (error) {
            console.error("WriteContract error:", error);
            toast.dismiss("become-sponsor");

            // Check if it's a user rejection
            if (error.message?.includes("User rejected") ||
                error.message?.includes("User denied") ||
                error.message?.includes("rejected") ||
                error.message?.includes("denied")) {
                toast.error("Transaction cancelled by user");
            } else {
                toast.error(`Transaction failed: ${error.message}`);
            }

            // Reset loading state
            resetState();
        }
    }, [error]);

    // Handle receipt when it arrives
    useEffect(() => {
        console.log("Sponsor useEffect triggered:", {
            txReceipt: !!txReceipt,
            txHash: txHash,
            hasCallback: !!callbackRef.current,
            receiptStatus: txReceipt?.status
        });

        if (txReceipt && txHash && callbackRef.current) {
            console.log("Processing sponsor transaction receipt...", txReceipt);

            if (txReceipt.status === 'success') {
                toast.success("Successfully became a sponsor!", { id: "become-sponsor" });

                // Create the result object with known data (no event parsing needed)
                const result: BecomeSponsorResult = {
                    hash: txHash,
                    sponsor: address, // We know the sponsor is the connected wallet
                    contribution: contributionAmountRef.current // Store contribution amount in ref
                };

                console.log("Calling sponsor success callback...", result);
                callbackRef.current(result);
            } else {
                console.error("Transaction failed!");
                toast.error("Sponsorship transaction failed!", { id: "become-sponsor" });
            }

            // Clean up
            resetState();
        }
    }, [txReceipt, txHash, address]);

    // Detect wallet capabilities on mount
    useEffect(() => {
        const detectCapabilities = async () => {
            if (isConnected && address) {
                try {
                    const capabilities = await detectWalletCapabilities();
                    setWalletCapabilities(capabilities);
                    const strategy = getTransactionStrategy(capabilities);
                    setTransactionStrategy(strategy);
                    console.log('Wallet capabilities detected:', capabilities, 'Strategy:', strategy);
                } catch (error) {
                    console.warn('Failed to detect wallet capabilities:', error);
                }
            }
        };

        detectCapabilities();
    }, [isConnected, address]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Helper function to check token allowance
    const checkTokenAllowance = async (tokenAddress: string, spenderAddress: string): Promise<bigint> => {
        try {
            const { data: allowance } = useReadContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address as `0x${string}`, spenderAddress as `0x${string}`]
            });
            return allowance || BigInt(0);
        } catch (error) {
            console.warn('Error checking token allowance:', error);
            return BigInt(0);
        }
    };

    // Helper function to handle approval transaction for legacy wallets
    const handleApprovalTransaction = async (tokenAddress: string, amount: bigint): Promise<void> => {
        try {
            toast.loading("Approving token spending...", { id: "token-approval" });

            writeContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [contractAddress as `0x${string}`, amount]
            });

            // Wait for approval transaction to complete
            // This will be handled by the existing receipt handling logic
        } catch (error) {
            console.error('Error in approval transaction:', error);
            toast.error('Failed to approve token spending');
            throw error;
        }
    };

    // Helper function to handle batched transactions using EIP-5792 wallet_sendCalls
    const handleBatchedTransaction = async (
        contributionAmount: string,
        sponsorCurrency?: string,
        tokenAddress?: string
    ): Promise<void> => {
        try {
            toast.loading("Preparing batched transaction...", { id: "batched-transaction" });

            if (sponsorCurrency === 'ETH' || !sponsorCurrency) {
                // ETH sponsorship - single transaction
                const contributionInWei = parseEther(contributionAmount);
                writeContract({
                    address: contractAddress as `0x${string}`,
                    abi: HACKATHON_ABI,
                    functionName: "becomeSponsor",
                    value: contributionInWei
                });
            } else {
                // Token sponsorship - try different batching approaches
                if (!tokenAddress) {
                    throw new Error("Token address is required for token sponsorship");
                }

                const tokenDecimals = getTokenDecimals(sponsorCurrency || '');
                if (!tokenDecimals) {
                    throw new Error(`Token decimals not found for ${sponsorCurrency}`);
                }

                const tokenAmount = parseUnits(contributionAmount, tokenDecimals);

                console.log('Attempting batched transaction:', {
                    tokenAddress,
                    contractAddress,
                    tokenAmount: tokenAmount.toString(),
                    sponsorCurrency
                });

                // Try multiple approaches for batching
                await tryBatchedApproaches(tokenAddress, tokenAmount);
            }
        } catch (error) {
            console.error('Error in batched transaction:', error);
            toast.error('Failed to execute batched transaction');
            throw error;
        }
    };

    // Try different batching approaches
    const tryBatchedApproaches = async (tokenAddress: string, tokenAmount: bigint): Promise<void> => {
        try {
            // Approach 1: Try EIP-5792 wallet_sendCalls
            console.log('Attempting EIP-5792 approach...');
            await executeBatchedTransaction(tokenAddress, tokenAmount);
        } catch (eip5792Error) {
            console.log('EIP-5792 failed, trying alternative approach...');

            try {
                // Approach 2: Try using wallet's native batching if available
                await executeNativeBatching(tokenAddress, tokenAmount);
            } catch (nativeError) {
                console.log('Native batching failed, falling back to sequential...');

                // Approach 3: Fallback to sequential transactions
                await executeSequentialTransactions(tokenAddress, tokenAmount);
            }
        }
    };

    // Try native wallet batching (if wallet supports it)
    const executeNativeBatching = async (tokenAddress: string, tokenAmount: bigint): Promise<void> => {
        try {
            const walletClient = await getWalletClient(config);
            if (!walletClient) {
                throw new Error('Wallet client not available');
            }

            // Check if wallet has native batching methods
            if (typeof (walletClient as any).sendBatchTransactions === 'function') {
                console.log('Using wallet native batching...');

                const approvalTx = {
                    to: tokenAddress as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [contractAddress as `0x${string}`, tokenAmount]
                    })
                };

                const sponsorTx = {
                    to: contractAddress as `0x${string}`,
                    data: encodeFunctionData({
                        abi: HACKATHON_ABI,
                        functionName: 'becomeSponsorWithToken',
                        args: [tokenAddress as `0x${string}`, tokenAmount]
                    })
                };

                const result = await (walletClient as any).sendBatchTransactions([approvalTx, sponsorTx]);
                console.log('✅ Native batching result:', result);

                if (result.hash) {
                    setTxHash(result.hash);
                    toast.loading("Native batched transaction submitted...", { id: "become-sponsor" });
                }
            } else {
                throw new Error('Wallet does not support native batching');
            }
        } catch (error) {
            console.error('Native batching failed:', error);
            throw error;
        }
    };

    // Execute batched transaction using EIP-5792 wallet_sendCalls
    const executeBatchedTransaction = async (tokenAddress: string, tokenAmount: bigint): Promise<void> => {
        try {
            console.log('🚀 Executing batched transaction via EIP-5792...');

            // Check wallet connection before proceeding
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }

            const walletClient = await getWalletClient(config);
            if (!walletClient) {
                throw new Error('Wallet client not available');
            }

            console.log('🔗 Wallet connection status:', {
                isConnected,
                address,
                walletClient: !!walletClient,
                chainId: walletClient.chain?.id
            });

            // Get the provider directly (like the working example)
            const provider = walletClient as any;
            const chainId = `0x${walletClient.chain?.id?.toString(16) || '1'}`;

            // Check capabilities first (like the working example)
            console.log('Checking wallet capabilities...');
            const capabilities = await provider.request({
                method: 'wallet_getCapabilities',
                params: [address, [chainId]]
            });

            console.log('Capabilities response:', capabilities);

            // Check if atomic batching is supported (like the working example)
            const chainCapabilities = capabilities?.[chainId];
            const supportAtomic = chainCapabilities?.atomic;

            if (!supportAtomic) {
                console.log('Atomic batching not supported, falling back to sequential');
                throw new Error('Atomic batching not supported');
            }

            console.log('Atomic batching supported:', supportAtomic);

            // Prepare the batched calls (simplified like the working example)
            const calls = [
                {
                    to: tokenAddress as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [contractAddress as `0x${string}`, tokenAmount]
                    }),
                    value: "0x0"
                },
                {
                    to: contractAddress as `0x${string}`,
                    data: encodeFunctionData({
                        abi: HACKATHON_ABI,
                        functionName: 'becomeSponsorWithToken',
                        args: [tokenAddress as `0x${string}`, tokenAmount]
                    }),
                    value: "0x0"
                }
            ];

            console.log('Prepared batched calls:', calls);

            // Send the batched transaction (like the working example)
            console.log('Sending batched transaction...');
            const result = await provider.request({
                method: 'wallet_sendCalls',
                params: [{
                    version: '2.0.0',
                    chainId: chainId,
                    from: address,
                    atomicRequired: true,
                    calls: calls
                }]
            });

            console.log('✅ Batched transaction result:', result);

            if (result?.id) {
                setBundleId(result.id);
                // Set initial hash as batch ID (will be updated with actual transaction hash when confirmed)
                setTxHash(result.id as `0x${string}`);
                console.log('Batch ID received:', result.id);
                toast.loading("Batched transaction submitted, waiting for confirmation...", { id: "become-sponsor" });

                // Start tracking the batched transaction status
                trackBatchedTransactionStatus(result.id);
            } else {
                throw new Error('No batch ID returned from wallet_sendCalls');
            }

        } catch (error) {
            console.error('Batched transaction failed:', error);

            // Fallback to sequential transactions
            console.log('Batched transaction failed, falling back to sequential...');
            toast('Batched transaction failed. Using sequential transactions instead.');

            await executeSequentialTransactions(tokenAddress, tokenAmount);
        }
    };

    // Fallback to sequential transactions if EIP-5792 is not supported
    const executeSequentialTransactions = async (tokenAddress: string, tokenAmount: bigint): Promise<void> => {
        try {
            console.log('Executing sequential transactions as fallback...');

            // Check wallet connection before fallback
            if (!isConnected || !address) {
                throw new Error('Wallet not connected for sequential transactions');
            }

            console.log('Sequential transaction connection check:', {
                isConnected,
                address,
                contractAddress,
                tokenAddress
            });

            // First transaction: approve
            toast.loading("Approving token spending...", { id: "token-approval" });

            // Use a small delay to ensure wallet is ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            writeContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [contractAddress as `0x${string}`, tokenAmount]
            });

            // Note: The sponsor transaction will be triggered after approval completes
            // This is handled by the existing receipt handling logic

        } catch (error) {
            console.error('Sequential transaction fallback failed:', error);

            // Check if it's a connection error
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage?.includes('ConnectorNotConnected') ||
                errorMessage?.includes('not connected')) {
                toast.error('Wallet disconnected. Please reconnect and try again.');
                throw new Error('Wallet disconnected during sequential transaction');
            }

            throw error;
        }
    };

    // Track batched transaction status using EIP-5792 wallet_getCallsStatus
    const trackBatchedTransactionStatus = async (bundleId: string): Promise<void> => {
        try {
            const walletClient = await getWalletClient(config);
            if (!walletClient) return;

            const checkStatus = async () => {
                try {
                    const status = await (walletClient as any).request({
                        method: 'wallet_getCallsStatus',
                        params: [bundleId]
                    });

                    console.log('📊 MetaMask batched transaction status:', status);
                    setBundleStatus(status.status);

                    // Check if transaction is confirmed (status 200 like the working example)
                    if (status.status === 200) {
                        console.log('Batched transaction confirmed!');
                        console.log('Atomic execution:', status.atomic);
                        console.log('Full status response:', JSON.stringify(status, null, 2));

                        // Log all receipt details for debugging
                        if (status.receipts && status.receipts.length > 0) {
                            console.log('Receipt count:', status.receipts.length);
                            status.receipts.forEach((receipt: any, index: number) => {
                                console.log(`Receipt ${index}:`, {
                                    transactionHash: receipt.transactionHash,
                                    blockHash: receipt.blockHash,
                                    blockNumber: receipt.blockNumber,
                                    gasUsed: receipt.gasUsed,
                                    status: receipt.status,
                                    logs: receipt.logs?.length || 0,
                                    fullReceipt: receipt
                                });
                            });
                        } else {
                            console.log('No receipts found in status response');
                        }

                        // Extract the actual transaction hash from receipts
                        let transactionHash = bundleId as `0x${string}`; // Fallback to batch ID
                        if (status.receipts && status.receipts.length > 0) {
                            // For atomic transactions, there should be one receipt with the actual transaction hash
                            const receipt = status.receipts[0];
                            console.log('Processing first receipt:', receipt);

                            if (receipt.transactionHash) {
                                transactionHash = receipt.transactionHash as `0x${string}`;
                                console.log('Extracted transaction hash from receipt:', transactionHash);
                                console.log('Transaction hash length:', transactionHash.length);
                                console.log('Transaction hash format valid:', transactionHash.startsWith('0x') && transactionHash.length === 66);
                            } else {
                                console.log('No transactionHash found in first receipt');
                                console.log('Available receipt fields:', Object.keys(receipt));
                            }
                        } else {
                            console.log('No receipts available for hash extraction');
                        }

                        // Update the stored transaction hash
                        setTxHash(transactionHash);

                        toast.success("Batched transaction completed successfully!", { id: "become-sponsor" });

                        // Call success callback with the actual transaction hash
                        if (callbackRef.current) {
                            const result: BecomeSponsorResult = {
                                hash: transactionHash,
                                sponsor: address,
                                contribution: contributionAmountRef.current
                            };
                            callbackRef.current(result);
                        }

                        resetState();
                    } else {
                        // Continue polling if not confirmed yet (like the working example)
                        console.log('Transaction still pending, checking again...');
                        setTimeout(checkStatus, 1000); // Check every 1 second like the working example
                    }
                } catch (error) {
                    console.warn('Error checking batched transaction status:', error);
                    // Continue polling on error
                    setTimeout(checkStatus, 5000);
                }
            };

            // Start polling
            checkStatus();
        } catch (error) {
            console.error('Error setting up batched transaction tracking:', error);
        }
    };

    // Helper function to handle smart wallet transactions
    const handleSmartWalletTransaction = async (
        contributionAmount: string,
        sponsorCurrency?: string,
        tokenAddress?: string
    ): Promise<void> => {
        try {
            toast.loading("Enabling smart wallet and preparing transaction...", { id: "smart-wallet" });

            // This would involve enabling the smart wallet first
            // Then preparing the transaction with the smart wallet context
            console.log('Smart wallet transaction:', {
                contributionAmount,
                sponsorCurrency,
                tokenAddress,
                capabilities: walletCapabilities
            });

            // For now, fall back to standard transaction
            // In a real implementation, this would use smart wallet specific methods
            if (sponsorCurrency === 'ETH' || !sponsorCurrency) {
                const contributionInWei = parseEther(contributionAmount);
                writeContract({
                    address: contractAddress as `0x${string}`,
                    abi: HACKATHON_ABI,
                    functionName: "becomeSponsor",
                    value: contributionInWei
                });
            } else {
                if (!tokenAddress) {
                    throw new Error("Token address is required for token sponsorship");
                }

                const tokenDecimals = getTokenDecimals(sponsorCurrency || '');
                if (!tokenDecimals) {
                    throw new Error(`Token decimals not found for ${sponsorCurrency}`);
                }

                const tokenAmount = parseUnits(contributionAmount, tokenDecimals);

                writeContract({
                    address: contractAddress as `0x${string}`,
                    abi: HACKATHON_ABI,
                    functionName: "becomeSponsorWithToken",
                    args: [tokenAddress as `0x${string}`, tokenAmount]
                });
            }
        } catch (error) {
            console.error('Error in smart wallet transaction:', error);
            toast.error('Failed to execute smart wallet transaction');
            throw error;
        }
    };

    const becomeSponsor = async (
        contributionAmount: string,
        onSuccess?: (result: BecomeSponsorResult) => void,
        sponsorCurrency?: string,
        tokenAddress?: string
    ): Promise<BecomeSponsorResult> => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
            toast.error("Please enter a valid contribution amount");
            throw new Error("Invalid contribution amount");
        }

        try {
            // Check wallet connection first
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }

            // Prevent multiple simultaneous transactions
            if (isLoading) {
                toast.error("Transaction already in progress. Please wait.");
                throw new Error("Transaction already in progress");
            }

            setIsLoading(true);
            callbackRef.current = onSuccess || null;
            contributionAmountRef.current = contributionAmount; // Store for later use

            toast.loading("Submitting transaction...", { id: "become-sponsor" });

            // Ensure wallet is connected before proceeding
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }

            // Add a small delay to ensure wallet is ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Determine transaction strategy based on wallet capabilities
            console.log("Transaction strategy:", transactionStrategy);
            console.log("Wallet capabilities:", walletCapabilities);

            // Handle different transaction strategies
            if (transactionStrategy === 'batched') {
                await handleBatchedTransaction(contributionAmount, sponsorCurrency, tokenAddress);
            } else if (transactionStrategy === 'smart-wallet') {
                await handleSmartWalletTransaction(contributionAmount, sponsorCurrency, tokenAddress);
            } else {
                // Legacy transaction handling
                if (sponsorCurrency === 'ETH' || !sponsorCurrency) {
                    // ETH sponsorship - use the original becomeSponsor function
                    const contributionInWei = parseEther(contributionAmount);
                    console.log("Contribution in wei:", contributionInWei.toString());

                    console.log("About to call writeContract for becomeSponsor (ETH)...");

                    writeContract({
                        address: contractAddress as `0x${string}`,
                        abi: HACKATHON_ABI,
                        functionName: "becomeSponsor",
                        value: contributionInWei
                    });
                } else {
                    // Token sponsorship - check allowance first, then proceed
                    if (!tokenAddress) {
                        toast.error("Token address is required for token sponsorship");
                        throw new Error("Token address is required");
                    }

                    // Get token decimals for proper amount calculation
                    const tokenDecimals = getTokenDecimals(sponsorCurrency || '');
                    if (!tokenDecimals) {
                        toast.error(`Token decimals not found for ${sponsorCurrency}`);
                        throw new Error(`Token decimals not found for ${sponsorCurrency}`);
                    }

                    // Convert token amount using the correct decimals
                    const tokenAmount = parseUnits(contributionAmount, tokenDecimals);
                    console.log(`Token amount (${tokenDecimals} decimals):`, tokenAmount.toString());

                    // Check current allowance
                    const currentAllowance = await checkTokenAllowance(tokenAddress, contractAddress);
                    console.log("Current allowance:", currentAllowance.toString());
                    console.log("Required amount:", tokenAmount.toString());

                    if (currentAllowance < tokenAmount) {
                        console.log("Insufficient allowance, requesting approval...");
                        await handleApprovalTransaction(tokenAddress, tokenAmount);
                        // Note: The approval transaction will be handled by the existing receipt logic
                        // The sponsor transaction will need to be triggered after approval completes
                        return { hash: "0x" as `0x${string}` };
                    } else {
                        console.log("Sufficient allowance, proceeding with sponsor transaction...");
                        writeContract({
                            address: contractAddress as `0x${string}`,
                            abi: HACKATHON_ABI,
                            functionName: "becomeSponsorWithToken",
                            args: [tokenAddress as `0x${string}`, tokenAmount]
                        });
                    }
                }
            }

            console.log("writeContract called, waiting for user to confirm in wallet...");

            toast.loading("Please confirm transaction in your wallet...", { id: "become-sponsor" });

            // Set a timeout to handle cases where user doesn't respond
            timeoutRef.current = setTimeout(() => {
                console.log("Transaction timeout - user may have cancelled or not responded");
                toast.dismiss("become-sponsor");
                toast.error("Transaction timed out. Please try again.");
                resetState();
            }, 300000); // 5 minutes timeout

            // Return empty hash initially - the real hash will come from contractWriteData
            return { hash: "0x" as `0x${string}` };

        } catch (err: any) {
            console.error("Error becoming sponsor:", err);
            toast.error(`Failed to become sponsor: ${err.message || "Unknown error"}`, { id: "become-sponsor" });
            resetState();
            throw err;
        }
    };

    return {
        becomeSponsor,
        isLoading,
        error,
        walletCapabilities,
        transactionStrategy
    };
};