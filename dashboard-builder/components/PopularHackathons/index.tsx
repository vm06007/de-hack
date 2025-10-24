import { useState } from "react";
import Card from "@/components/Card";
import Hackathon from "@/components/Hackathon";
import Button from "@/components/Button";

interface PopularHackathonsProps {
    title: string;
    items: {
        id: number;
        title: string;
        image: string;
        prize: number;
        status: string;
    }[];
    allItems?: {
        id: number;
        title: string;
        image: string;
        prize: number;
        status: string;
    }[];
}

const PopularHackathons = ({ title, items, allItems }: PopularHackathonsProps) => {
    const [showMore, setShowMore] = useState(false);

    const handleLoadMore = () => {
        setShowMore(!showMore);
    };

    const displayItems = showMore && allItems ? allItems : items;

    return (
        <Card classHead="!pl-3" title={title}>
            <div className="flex flex-col gap-1">
                {displayItems.map((hackathon) => (
                    <Hackathon value={hackathon} key={hackathon.id} />
                ))}
            </div>
            <div className="pt-6 px-3 pb-3">
                <Button 
                    className="w-full" 
                    onClick={handleLoadMore}
                    isStroke
                >
                    {showMore ? "Show less" : "Load more"}
                </Button>
            </div>
        </Card>
    );
};

export default PopularHackathons;
