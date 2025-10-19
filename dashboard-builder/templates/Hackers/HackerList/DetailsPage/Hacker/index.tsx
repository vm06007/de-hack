import Image from "@/components/Image";

type HackerType = {
    name: string;
    username: string;
    email: string;
    avatar: string;
    totalEarnings: number;
    participationCount: number;
};

type HackerProps = {
    value: HackerType;
    isActive: boolean;
    onClick: () => void;
};

const Hacker = ({ value, isActive, onClick }: HackerProps) => (
    <div
        className="group relative flex items-center p-3 cursor-pointer"
        onClick={onClick}
    >
        <div
            className={`box-hover ${isActive ? "visible opacity-100" : ""}`}
        ></div>
        <div className="relative z-2 shrink-0">
            <Image
                className="size-12 rounded-full opacity-100 object-cover"
                src={value.avatar}
                width={48}
                height={48}
                alt=""
            />
        </div>
        <div className="relative z-2 w-[calc(100%-3rem)] pl-5 max-lg:pl-4">
            <div className="truncate text-sub-title-1">{value.name}</div>
            <div className="truncate text-body-2 text-t-secondary/80">
                @{value.username}
            </div>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-caption-2 text-n-4">
                    ${value.totalEarnings.toLocaleString()}
                </span>
                <span className="text-caption-2 text-n-4">
                    • {value.participationCount} hackathons
                </span>
            </div>
        </div>
    </div>
);

export default Hacker;
