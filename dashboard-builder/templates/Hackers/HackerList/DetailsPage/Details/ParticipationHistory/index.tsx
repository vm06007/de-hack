import { NumericFormat } from "react-number-format";
import Image from "@/components/Image";

const hackathonHistory = [
    {
        id: 1,
        title: "DeFi Innovation Challenge",
        category: "DeFi",
        image: "/images/hackathons/1.png",
        prize: 15000,
        position: "1st Place",
        date: "2024-01-15",
        status: "Won"
    },
    {
        id: 2,
        title: "Web3 Gaming Hackathon",
        category: "Gaming",
        image: "/images/hackathons/2.png",
        prize: 0,
        position: "Participant",
        date: "2024-01-10",
        status: "Participated"
    },
    {
        id: 3,
        title: "NFT Art Competition",
        category: "NFT",
        image: "/images/hackathons/3.png",
        prize: 8500,
        position: "2nd Place",
        date: "2024-01-05",
        status: "Won"
    },
    {
        id: 4,
        title: "ZK Privacy Challenge",
        category: "Privacy",
        image: "/images/hackathons/4.png",
        prize: 25000,
        position: "1st Place",
        date: "2023-12-28",
        status: "Won"
    },
];

const ParticipationHistory = ({}) => (
    <div>
        <div className="text-h5 max-lg:text-h6 max-md:mb-3">
            Hackathon History
        </div>
        <table className="w-full">
            <thead>
                <tr className="[&_th]:h-17 [&_th]:pl-6 [&_th:first-child]:pl-0 [&_th]:align-middle [&_th]:text-left [&_th]:text-caption [&_th]:font-normal [&_th]:text-t-tertiary/80 max-md:[&_th]:h-8">
                    <th>Hackathon</th>
                    <th className="max-md:hidden">Prize</th>
                    <th className="max-lg:hidden">Position</th>
                    <th className="max-lg:hidden">Date</th>
                </tr>
            </thead>
            <tbody>
                {hackathonHistory.map((hackathon) => (
                    <tr
                        className="[&_td]:py-4 [&_td]:pl-6 [&_td:first-child]:pl-0 [&_td]:border-t [&_td]:border-s-subtle [&_td]:align-middle [&_td]:text-body-2"
                        key={hackathon.id}
                    >
                        <td className="!text-0">
                            <div className="inline-flex items-center gap-6 max-lg:gap-4">
                                <Image
                                    className="size-16 rounded-xl opacity-100"
                                    src={hackathon.image}
                                    width={64}
                                    height={64}
                                    alt={hackathon.title}
                                />
                                <div className="grow">
                                    <div className="text-sub-title-1">
                                        {hackathon.title}
                                    </div>
                                    <div className="text-body-2 text-t-secondary/80 max-md:hidden">
                                        {hackathon.category}
                                    </div>
                                    <NumericFormat
                                        className="hidden text-body-2 opacity-80 max-md:inline"
                                        value={hackathon.prize}
                                        thousandSeparator=","
                                        fixedDecimalScale
                                        decimalScale={2}
                                        displayType="text"
                                        prefix="$"
                                    />
                                </div>
                            </div>
                        </td>
                        <td className="max-md:hidden">
                            {hackathon.prize > 0 ? (
                                <NumericFormat
                                    value={hackathon.prize}
                                    thousandSeparator=","
                                    fixedDecimalScale
                                    decimalScale={2}
                                    displayType="text"
                                    prefix="$"
                                />
                            ) : (
                                <span className="text-n-4">-</span>
                            )}
                        </td>
                        <td className="max-lg:hidden">
                            <span className={`px-2 py-1 rounded-full text-caption-2 ${
                                hackathon.status === 'Won' 
                                    ? 'bg-green-1/10 text-green-1' 
                                    : 'bg-n-3 text-n-4'
                            }`}>
                                {hackathon.position}
                            </span>
                        </td>
                        <td className="max-lg:hidden">{hackathon.date}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default ParticipationHistory;
