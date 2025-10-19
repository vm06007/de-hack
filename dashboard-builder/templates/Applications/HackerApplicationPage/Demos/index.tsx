import Card from "@/components/Card";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const Demos = () => {
    return (
        <Card title="Additional Resources">
            <div className="p-5 max-lg:p-3">
                <div className="flex flex-col gap-3">
                    <Button className="w-full" isStroke>
                        <Icon name="link" />
                        Add Demo Video
                    </Button>
                    <Button className="w-full" isStroke>
                        <Icon name="link" />
                        Add Project Links
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default Demos;
