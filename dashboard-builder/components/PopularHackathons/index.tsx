import Card from "@/components/Card";
import Product from "@/components/Product";
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
                {items.map((product) => (
                    <Product value={product} key={product.id} />
                ))}
            </div>
            <div className="pt-6 px-3 pb-3">
                <Button className="w-full" href="/products" as="link" isStroke>
                    All hackathons
                </Button>
            </div>
        </Card>
    );
};

export default PopularHackathons;
