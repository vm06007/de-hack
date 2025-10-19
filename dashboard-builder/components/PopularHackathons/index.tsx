import Card from "@/components/Card";
import Hackathon from "@/components/Hackathon";
import Button from "@/components/Button";

interface PopularHackathonsProps {
    title: string;
    items: {
        id: number;
        title: string;
        image: string;
        price: number;
        active: boolean;
    }[];
}

const PopularHackathons = ({ title, items }: PopularHackathonsProps) => {
    return (
        <Card classHead="!pl-3" title={title}>
            <div className="flex flex-col gap-1">
                {items.map((hackathon) => (
                    <Hackathon value={hackathon} key={hackathon.id} />
                ))}
            </div>
            <div className="pt-6 px-3 pb-3">
                <Button className="w-full" href="/hackathons" as="link" isStroke>
                    All hackathons
                </Button>
            </div>
        </Card>
    );
};

export default PopularHackathons;
