import Card from "@/components/Card";
import Icon from "@/components/Icon";

const stats = [
    {
        id: 1,
        title: "Participants",
        value: "1,247",
        icon: "users",
        color: "text-blue-500",
    },
    {
        id: 2,
        title: "Projects",
        value: "89",
        icon: "code",
        color: "text-green-500",
    },
    {
        id: 3,
        title: "Days Left",
        value: "15",
        icon: "calendar",
        color: "text-orange-500",
    },
    {
        id: 4,
        title: "Applications",
        value: "2,156",
        icon: "file",
        color: "text-purple-500",
    },
];

const HackathonStats = () => {
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
