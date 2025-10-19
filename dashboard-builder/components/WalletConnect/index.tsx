import { ConnectWallet } from "@thirdweb-dev/react";

type WalletConnectProps = {
    className?: string;
};

const WalletConnect = ({ className }: WalletConnectProps) => {
    return (
        <ConnectWallet
            theme="dark"
            btnTitle="Connect Wallet"
            modalTitle="Connect to DeHack"
            modalTitleIconUrl=""
            className={className}
            style={{
                backgroundColor: "#1a1a1a",
                color: "#ffffff",
                border: "1px solid #333333",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
            }}
        />
    );
};

export default WalletConnect;
