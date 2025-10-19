import { useState, useEffect } from "react";
import Tooltip from "@/components/Tooltip";
import Image from "@/components/Image";
import { apiClient } from "@/lib/api";

type CompatibilityProps = {
    classItemName?: string;
};

const Compatibility = ({ classItemName }: CompatibilityProps) => {
    const [activeIds, setActiveIds] = useState<number[]>([]);
    const [compatibility, setCompatibility] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompatibility = async () => {
            try {
                const data = await apiClient.get('/compatibility');
                setCompatibility(data);
            } catch (error) {
                console.error('Failed to fetch compatibility data:', error);
                // Fallback data in case API fails
                setCompatibility([
                    { id: 1, browser: "Chrome", version: "90+", supported: true, notes: "Fully supported", image: "/images/browsers/chrome.svg", title: "Chrome" },
                    { id: 2, browser: "Firefox", version: "88+", supported: true, notes: "Fully supported", image: "/images/browsers/firefox.svg", title: "Firefox" },
                    { id: 3, browser: "Safari", version: "14+", supported: true, notes: "Fully supported", image: "/images/browsers/safari.svg", title: "Safari" },
                    { id: 4, browser: "Edge", version: "90+", supported: true, notes: "Fully supported", image: "/images/browsers/edge.svg", title: "Edge" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCompatibility();
    }, []);

    const handleClick = (id: number) => {
        setActiveIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    if (loading) {
        return <div>Loading compatibility data...</div>;
    }

    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="text-button">Invite Judges</div>
                <Tooltip
                    className="ml-1.5"
                    content="Maximum 100 characters. No HTML or emoji allowed"
                />
            </div>
            <div className="flex flex-wrap -mt-3 -mx-1.5">
                {compatibility.map((item) => (
                    <div
                        className={`flex items-center h-12 mt-3 mx-1.5 gap-2 border border-s-stroke2 rounded-full px-2.5 text-button transition-colors cursor-pointer hover:border-s-highlight ${
                            activeIds.includes(item.id) ? "!border-s-focus" : ""
                        } ${classItemName || ""}`}
                        onClick={() => handleClick(item.id)}
                        key={item.id}
                    >
                        <div className="dark:bg-shade-05 rounded">
                            <Image
                                className="size-6 opacity-100"
                                src={item.image}
                                width={24}
                                height={24}
                                alt={item.title}
                            />
                        </div>
                        <div className="truncate">{item.title}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Compatibility;
