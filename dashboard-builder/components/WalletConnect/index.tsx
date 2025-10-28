"use client";

import { ConnectKitButton } from "connectkit";

type WalletConnectProps = {
    className?: string;
};

const WalletConnect = ({ className }: WalletConnectProps) => {
    return (
        <ConnectKitButton.Custom>
            {({ isConnected, show, address, truncatedAddress }) => (
                <button
                    onClick={show}
                    className={`${className} inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-lg`}
                >
                    {isConnected ? (
                        <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-mono text-xs">{truncatedAddress}</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Connect Wallet
                        </>
                    )}
                </button>
            )}
        </ConnectKitButton.Custom>
    );
};

export default WalletConnect;