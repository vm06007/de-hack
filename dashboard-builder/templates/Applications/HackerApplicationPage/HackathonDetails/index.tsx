import Card from "@/components/Card";
import Icon from "@/components/Icon";

const HackathonDetails = () => {
    return (
        <Card title="Hackathon Details">
            <div className="p-5 max-lg:p-3">
                <div className="flex flex-col gap-4">
                    {/* Required Stake */}
                    <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-xl border border-s-stroke2">
                        <div className="flex items-center">
                            <div className="flex justify-center items-center w-8 h-8 mr-3 rounded-full bg-b-surface2">
                                <Icon className="fill-t-primary" name="wallet" />
                            </div>
                            <div>
                                <div className="text-sub-title-1 text-t-primary">Required Stake</div>
                                <div className="text-caption text-t-secondary">Required to participate</div>
                            </div>
                        </div>
                        <div className="text-h5 font-medium text-t-primary">0.01 ETH</div>
                    </div>

                    {/* Stake Return Policy */}
                    <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-xl border border-s-stroke2">
                        <div className="flex items-center">
                            <div className="flex justify-center items-center w-8 h-8 mr-3 rounded-full bg-b-surface2">
                                <Icon className="fill-t-primary" name="check-circle-fill" />
                            </div>
                            <div>
                                <div className="text-sub-title-1 text-t-primary">Stake Return</div>
                                <div className="text-caption text-t-secondary">Automatic upon submission</div>
                            </div>
                        </div>
                        <div className="text-h5 font-medium text-t-primary">Auto</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default HackathonDetails;
