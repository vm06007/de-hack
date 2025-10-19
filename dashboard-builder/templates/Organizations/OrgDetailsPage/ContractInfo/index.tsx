import Card from "@/components/Card";
import Icon from "@/components/Icon";

const ContractInfo = () => {
    const contractAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
    const etherscanUrl = `https://etherscan.io/address/${contractAddress}`;

    return (
        <Card title="Smart Contract">
            <div className="p-5 max-lg:p-3">
                <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-xl border border-s-stroke2">
                    <div className="flex items-center">
                        <div className="flex justify-center items-center w-8 h-8 mr-3 rounded-full bg-b-surface2">
                            <Icon className="fill-t-primary" name="wallet" />
                        </div>
                        <div>
                            <div className="text-sub-title-1 text-t-primary">Contract Address</div>
                            <div className="text-caption text-t-secondary">View on Etherscan</div>
                        </div>
                    </div>
                    <a 
                        href={etherscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-h5 font-medium text-t-primary hover:text-t-blue font-mono"
                    >
                        {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                    </a>
                </div>
            </div>
        </Card>
    );
};

export default ContractInfo;
