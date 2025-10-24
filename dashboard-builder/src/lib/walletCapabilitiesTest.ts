// Test file for wallet capability detection
// This can be used to test the detection logic

import { detectWalletCapabilities } from './walletCapabilities';

export const testWalletCapabilities = async () => {
    console.log('Testing wallet capability detection...');

    try {
        const capabilities = await detectWalletCapabilities();
        console.log('Detected capabilities:', capabilities);

        return capabilities;
    } catch (error) {
        console.error('Error testing wallet capabilities:', error);
        return null;
    }
};

// Manual override for testing specific wallet types
export const simulateWalletCapabilities = (walletName: string) => {
    const name = walletName.toLowerCase();

    const isKnownSmartWallet =
        name.includes('argent') ||
        name.includes('safe') ||
        name.includes('zerion') ||
        name.includes('sequence') ||
        name.includes('rainbow') ||
        name.includes('coinbase') ||
        name.includes('metamask') ||
        name.includes('walletconnect');

    const supportsBatching =
        name.includes('argent') ||
        name.includes('safe') ||
        name.includes('sequence') ||
        name.includes('rainbow') ||
        name.includes('coinbase') ||
        name.includes('metamask');

    const supportsEIP7702 =
        name.includes('argent') ||
        name.includes('safe') ||
        name.includes('sequence') ||
        name.includes('rainbow');

    return {
        supportsEIP7702,
        supportsBatching,
        supportsSmartWallets: isKnownSmartWallet,
        walletName: walletName
    };
};
