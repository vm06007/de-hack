import Card from "@/components/Card";
import Button from "@/components/Button";

const CTA = () => {
    return (
        <Card title="Submit Application">
            <div className="p-5 max-lg:p-3">
                <Button className="w-full" isBlack>
                    Submit Hacker Application
                </Button>
            </div>
        </Card>
    );
};

export default CTA;
