import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'

type WalletConnectProps = {
    className?: string;
};

const WalletConnect = ({ className }: WalletConnectProps) => {
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()
    const { address, isConnected } = useAccount()

    if (isConnected) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-sm text-gray-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                    onClick={() => disconnect()}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <div className={`flex gap-2 ${className}`}>
            <button
                onClick={() => connect({ connector: injected() })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                style={{
                    backgroundColor: "#1a1a1a",
                    color: "#ffffff",
                    border: "1px solid #333333",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: "500",
                }}
            >
                Connect Wallet
            </button>
            <button
                onClick={() => connect({ connector: metaMask() })}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                style={{
                    backgroundColor: "#1a1a1a",
                    color: "#ffffff",
                    border: "1px solid #333333",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: "500",
                }}
            >
                MetaMask
            </button>
        </div>
    );
};

export default WalletConnect;
