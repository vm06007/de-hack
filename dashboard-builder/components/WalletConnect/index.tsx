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
                    className={`${className} inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors`}
                >
                    {isConnected ? (
                        <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {truncatedAddress}
                        </>
                    ) : (
                        "Connect Wallet"
                    )}
                </button>
            )}
        </ConnectKitButton.Custom>
    );
};

export default WalletConnect;