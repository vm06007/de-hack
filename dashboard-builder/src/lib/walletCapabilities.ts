import { getAccount, getWalletClient } from 'wagmi/actions';
import { config } from './wagmi';

export interface WalletCapabilities {
    supportsEIP7702: boolean;
    supportsBatching: boolean;
    supportsSmartWallets: boolean;
    walletName?: string;
}

/**
 * Detects wallet capabilities using EIP-5792 wallet_getCapabilities method
 */
export const detectWalletCapabilities = async (): Promise<WalletCapabilities> => {
    try {
        const account = getAccount(config);
        const walletClient = await getWalletClient(config);

        if (!account.isConnected || !walletClient || !account.address) {
            return {
                supportsEIP7702: false,
                supportsBatching: false,
                supportsSmartWallets: false
            };
        }

        const walletName = walletClient.name?.toLowerCase() || '';
        const chainId = account.chainId || 1; // Default to mainnet if chainId is undefined

        console.log('Detecting wallet capabilities for:', {
            address: account.address,
            chainId,
            walletName
        });

        // Use EIP-5792 wallet_getCapabilities method
        const capabilities = await queryWalletCapabilities(account.address, chainId);

        console.log('Wallet capabilities response:', capabilities);

        const result = {
            supportsEIP7702: capabilities.supportsEIP7702,
            supportsBatching: capabilities.supportsBatching,
            supportsSmartWallets: capabilities.supportsSmartWallets,
            walletName
        };

        console.log('Final detection result:', result);

        // Log the transaction strategy for debugging
        const strategy = getTransactionStrategy(result);
        console.log('Transaction strategy:', strategy);

        return result;
    } catch (error) {
        console.warn('Error detecting wallet capabilities:', error);
        return {
            supportsEIP7702: false,
            supportsBatching: false,
            supportsSmartWallets: false
        };
    }
};

/**
 * Query wallet capabilities using EIP-5792 wallet_getCapabilities method
 */
const queryWalletCapabilities = async (address: string, chainId: number): Promise<{
    supportsEIP7702: boolean;
    supportsBatching: boolean;
    supportsSmartWallets: boolean;
}> => {
    try {
        const walletClient = await getWalletClient(config);

        if (!walletClient) {
            throw new Error('No wallet client available');
        }

        // Convert chainId to hex format
        const chainIdHex = `0x${chainId.toString(16)}`;

        console.log('Querying wallet capabilities with:', {
            address,
            chainId: chainIdHex
        });

        // Try to use the wallet_getCapabilities method as per EIP-5792
        try {
            const response = await (walletClient as any).request({
                method: 'wallet_getCapabilities',
                params: [address, [chainIdHex]]
            });

            console.log('Raw wallet capabilities response:', response);

            // Parse the response according to MetaMask EIP-5792 specification
            const chainCapabilities = response?.[chainIdHex];

            if (chainCapabilities) {
                // Check for atomic batch transactions (EIP-5792)
                const atomicCapability = chainCapabilities.atomic;
                const supportsBatching = atomicCapability?.status === 'supported' || atomicCapability?.status === 'ready';

                // MetaMask doesn't expose EIP-7702 through wallet_getCapabilities
                // It's handled internally when atomic is supported
                const supportsEIP7702 = supportsBatching; // If atomic is supported, EIP-7702 is available

                // Smart wallet support is indicated by atomic capability
                const supportsSmartWallets = supportsBatching;

                console.log('Parsed capabilities according to MetaMask spec:', {
                    chainId: chainIdHex,
                    atomic: atomicCapability,
                    supportsBatching,
                    supportsEIP7702,
                    supportsSmartWallets
                });

                return {
                    supportsEIP7702,
                    supportsBatching,
                    supportsSmartWallets
                };
            } else {
                // No capabilities returned - this is a legacy wallet
                console.log('No capabilities returned - treating as legacy wallet');
                return {
                    supportsEIP7702: false,
                    supportsBatching: false,
                    supportsSmartWallets: false
                };
            }
        } catch (capabilityError) {
            console.log('wallet_getCapabilities not supported, treating as legacy wallet');
            // This is a legacy wallet that doesn't support EIP-5792
            return {
                supportsEIP7702: false,
                supportsBatching: false,
                supportsSmartWallets: false
            };
        }

    } catch (error) {
        console.warn('Error querying wallet capabilities:', error);

        // If there's an error, treat as legacy wallet
        console.log('Error in capability detection - treating as legacy wallet');
        return {
            supportsEIP7702: false,
            supportsBatching: false,
            supportsSmartWallets: false
        };
    }
};

/**
 * Get the appropriate transaction strategy based on wallet capabilities
 */
export const getTransactionStrategy = (capabilities: WalletCapabilities): 'legacy' | 'batched' => {
    console.log('Determining transaction strategy:', {
        supportsEIP7702: capabilities.supportsEIP7702,
        supportsBatching: capabilities.supportsBatching,
        supportsSmartWallets: capabilities.supportsSmartWallets,
        walletName: capabilities.walletName
    });

    // If wallet supports atomic batching (EIP-5792), use batched strategy
    if (capabilities.supportsBatching) {
        console.log('Using batched strategy - wallet supports atomic batching');
        return 'batched';
    }

    // Default to legacy for all other cases (including wallets like Rabby)
    console.log('Using legacy strategy - wallet does not support advanced features');
    return 'legacy';
};
