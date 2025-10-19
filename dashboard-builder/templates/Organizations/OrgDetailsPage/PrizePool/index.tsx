import Card from "@/components/Card";
import Icon from "@/components/Icon";
import { NumericFormat } from "react-number-format";

const PrizePool = () => {
    const totalPrize = 500000;
    const ethPrice = 2500; // ETH price in USD
    const ethAmount = totalPrize / ethPrice;

    return (
        <Card title="Prize Pool">
            <div className="p-5 max-lg:p-3">
                <div className="flex items-center justify-center w-16 h-16 mb-4 mx-auto rounded-full bg-b-surface1">
                    <Icon
                        className="fill-t-primary"
                        name="usd-circle"
                    />
                </div>
                <div className="text-center">
                    <NumericFormat
                        className="block mb-2 text-h3 max-lg:text-h4"
                        value={totalPrize}
                        thousandSeparator=","
                        decimalScale={0}
                        displayType="text"
                        prefix="$"
                    />
                    <div className="text-body-2 text-t-secondary">
                        {ethAmount.toFixed(2)} ETH
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-s-stroke2">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-caption text-t-secondary">1st Place</div>
                        <NumericFormat
                            className="text-body-2"
                            value={totalPrize * 0.5}
                            thousandSeparator=","
                            decimalScale={0}
                            displayType="text"
                            prefix="$"
                        />
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-caption text-t-secondary">2nd Place</div>
                        <NumericFormat
                            className="text-body-2"
                            value={totalPrize * 0.3}
                            thousandSeparator=","
                            decimalScale={0}
                            displayType="text"
                            prefix="$"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-caption text-t-secondary">3rd Place</div>
                        <NumericFormat
                            className="text-body-2"
                            value={totalPrize * 0.2}
                            thousandSeparator=","
                            decimalScale={0}
                            displayType="text"
                            prefix="$"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PrizePool;
