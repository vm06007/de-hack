"use client";

import {
    EthereumProvider,
    NexusSDK,
    OnAllowanceHookData,
    OnIntentHookData,
} from "@avail-project/nexus-core";
import React, {
    createContext,
    useContext,
    ReactNode,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
    SetStateAction,
    Dispatch,
} from "react";
import { useAccount } from "wagmi";

interface NexusContextType {
    nexusSdk: NexusSDK | undefined;
    isInitialized: boolean;
    allowanceModal: OnAllowanceHookData | null;
    setAllowanceModal: Dispatch<SetStateAction<OnAllowanceHookData | null>>;
    intentModal: OnIntentHookData | null;
    setIntentModal: Dispatch<SetStateAction<OnIntentHookData | null>>;
    cleanupSDK: () => void;
    initializeSDK: () => Promise<void>;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

interface NexusProviderProps {
    children: ReactNode;
    isConnected: boolean;
}

export const NexusProvider: React.FC<NexusProviderProps> = ({
    children,
    isConnected,
}) => {
    const [nexusSdk, setNexusSdk] = useState<NexusSDK | undefined>(undefined);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [allowanceModal, setAllowanceModal] =
        useState<OnAllowanceHookData | null>(null);
    const [intentModal, setIntentModal] = useState<OnIntentHookData | null>(null);
    const isInitializingRef = useRef<boolean>(false);

    const { connector } = useAccount();

    const initializeSDK = useCallback(async () => {
        if (isConnected && !nexusSdk && !isInitializingRef.current && connector) {
            try {
                isInitializingRef.current = true;
                console.log("Initializing Nexus SDK...");
                
                // Get the EIP-1193 provider from the connector
                const isTestnet = process.env.NEXT_PUBLIC_ENABLE_TESTNET === "true";
                const provider = (await connector.getProvider()) as EthereumProvider;

                if (!provider) {
                    throw new Error("No EIP-1193 provider available");
                }

                const sdk = new NexusSDK({
                    network: isTestnet ? "testnet" : "mainnet",
                    debug: false, // Disable debug to reduce console spam
                });

                await sdk.initialize(provider);
                setNexusSdk(sdk);

                console.log("Nexus SDK initialized successfully");
                console.log("Supported chains", sdk.utils.getSupportedChains());
                console.log("Provider info:", {
                    isConnected: provider.isConnected?.() || 'unknown',
                    chainId: provider.chainId || 'unknown',
                    accounts: provider.selectedAddress || 'unknown'
                });
                setIsInitialized(true);

                sdk.setOnAllowanceHook(async (data: OnAllowanceHookData) => {
                    console.log("Allowance hook triggered:", data);
                    setAllowanceModal(data);
                });

                sdk.setOnIntentHook((data: OnIntentHookData) => {
                    console.log("Intent hook triggered:", data);
                    setIntentModal(data);
                });
            } catch (error) {
                console.error("Failed to initialize NexusSDK:", error);
                setIsInitialized(false);
            } finally {
                isInitializingRef.current = false;
            }
        }
    }, [isConnected, nexusSdk, connector]);

    const cleanupSDK = useCallback(() => {
        if (nexusSdk) {
            console.log("Cleaning up Nexus SDK...");
            nexusSdk.deinit();
            setNexusSdk(undefined);
            setIsInitialized(false);
            setAllowanceModal(null);
            setIntentModal(null);
        }
    }, [nexusSdk]);

    useEffect(() => {
        if (!isConnected) {
            cleanupSDK();
        }
        // Don't auto-initialize to prevent signature spam
        // User must explicitly call initializeSDK()
    }, [isConnected, cleanupSDK]);

    const contextValue: NexusContextType = useMemo(
        () => ({
            nexusSdk,
            isInitialized,
            allowanceModal,
            setAllowanceModal,
            intentModal,
            setIntentModal,
            cleanupSDK,
            initializeSDK,
        }),
        [nexusSdk, isInitialized, allowanceModal, intentModal, cleanupSDK, initializeSDK],
    );

    return (
        <NexusContext.Provider value={contextValue}>
            {children}
        </NexusContext.Provider>
    );
};

export const useNexus = () => {
    const context = useContext(NexusContext);
    if (context === undefined) {
        throw new Error("useNexus must be used within a NexusProvider");
    }
    return context;
};
