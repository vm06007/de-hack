import Card from "@/components/Card";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const UploadFiles = () => {
    return (
        <Card title="Supporting Documents">
            <div className="p-5 max-lg:p-3">
                <div className="flex flex-col gap-3">
                    <Button className="w-full" isStroke>
                        <Icon name="upload" />
                        Upload Company Logo
                    </Button>
                    <Button className="w-full" isStroke>
                        <Icon name="upload" />
                        Upload Marketing Materials
                    </Button>
                    <Button className="w-full" isStroke>
                        <Icon name="upload" />
                        Upload Company Profile
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default UploadFiles;
