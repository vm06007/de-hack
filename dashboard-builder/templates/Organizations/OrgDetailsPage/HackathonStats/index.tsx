import Card from "@/components/Card";
import Icon from "@/components/Icon";

type HackathonStatsProps = {
    hackathon?: any;
};

const HackathonStats = ({ hackathon }: HackathonStatsProps) => {
    // Calculate days left until hackathon ends
    const calculateDaysLeft = () => {
        if (!hackathon?.endDate) return "0";
        
        const endDate = new Date(hackathon.endDate);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Debug: log the calculation
        console.log('Days left calculation:', {
            endDate: hackathon.endDate,
            endDateObj: endDate,
            today: today,
            diffTime: diffTime,
            diffDays: diffDays
        });
        
        // If hackathon has ended, show 0
        if (diffDays <= 0) return "0";
        
        return diffDays.toString();
    };

    const stats = [
        {
            id: 1,
            title: "Participants",
            value: "0",
            icon: "profile",
            color: "text-blue-500",
        },
        {
            id: 2,
            title: "Projects",
            value: "0",
            icon: "cube",
            color: "text-green-500",
        },
        {
            id: 3,
            title: "Days Left",
            value: calculateDaysLeft(),
            icon: "clock",
            color: "text-orange-500",
        },
        {
            id: 4,
            title: "Applications",
            value: "0",
            icon: "envelope",
            color: "text-purple-500",
        },
    ];
    return (
        <Card title="Hackathon Stats">
            <div className="p-5 max-lg:p-3">
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.id}
                            className="text-center p-3 rounded-2xl bg-b-surface1"
                        >
                            <div className={`flex justify-center items-center w-8 h-8 mb-2 mx-auto rounded-full bg-b-surface2`}>
                                <Icon
                                    className={`fill-t-primary ${stat.color}`}
                                    name={stat.icon}
                                />
                            </div>
                            <div className="text-h6 font-medium">{stat.value}</div>
                            <div className="text-caption text-t-secondary">
                                {stat.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default HackathonStats;
