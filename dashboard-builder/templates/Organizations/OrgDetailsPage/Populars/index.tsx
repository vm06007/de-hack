import Button from "@/components/Button";
import ShopItem from "@/components/ShopItem";

import { useHackathons } from "@/hooks/useHackathons";

const Populars = ({}) => {
    const { data: hackathons, loading, error } = useHackathons();

    if (loading) {
        return <div className="text-center py-8">Loading popular hackathons...</div>;
    }

    if (error) {
        return <div className="text-center py-8">Error loading hackathons: {error}</div>;
    }

    // Filter for specific hackathons (24, 25, 26) - the most recent ones
    const targetHackathons = [17, 18, 19];
    const filteredHackathons = Array.isArray(hackathons)
        ? hackathons.filter(hackathon => targetHackathons.includes(hackathon.id))
        : [];

    // If we don't have the target hackathons, fall back to the first 3 available
    const displayHackathons = filteredHackathons.length >= 3
        ? filteredHackathons
        : (Array.isArray(hackathons) ? hackathons.slice(0, 3) : []);

    // Debug logging
    console.log('Populars - Available hackathons:', hackathons?.length);
    console.log('Populars - Target hackathons found:', filteredHackathons.length);
    console.log('Populars - Display hackathons:', displayHackathons.map(h => ({ id: h.id, title: h.title, image: h.logoUrl || h.image })));

    return (
        <div className="">
            <div className="flex justify-between items-center">
                <div className="text-h4 max-md:text-h5">You may also like other hackathons</div>
            </div>
            <div className="flex flex-wrap mt-2 -mx-3 max-md:flex-nowrap max-md:mt-4 max-md:-mx-4 max-md:overflow-auto max-md:before:shrink-0 max-md:before:w-4 max-md:after:shrink-0 max-md:after:w-4">
                {displayHackathons.map((hackathon) => (
                    <ShopItem
                        className="w-[calc(33.333%-1.5rem)] mt-6 mx-3 max-lg:w-[calc(50%-1.5rem)] max-lg:nth-3:hidden max-md:shrink-0 max-md:w-79 max-md:m-0 max-md:mr-3 max-md:nth-3:flex max-md:last:mr-0"
                        value={{
                            id: hackathon.id,
                            name: hackathon.title || hackathon.name,
                            title: hackathon.title,
                            image: hackathon.logoUrl || hackathon.image || "/default/banner.jpg",
                            startDate: hackathon.startDate,
                            endDate: hackathon.endDate,
                            price: hackathon.totalPrizePool ? parseFloat(hackathon.totalPrizePool) : undefined,
                            rating: hackathon.rating,
                            category: hackathon.category
                        }}
                        key={hackathon.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default Populars;
