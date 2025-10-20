import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Select from "@/components/Select";
import DateAndTime from "@/components/DateAndTime";

const durationOptions = [
    { id: 1, name: "24 hours" },
    { id: 2, name: "48 hours" },
    { id: 3, name: "72 hours" },
    { id: 4, name: "1 week" },
    { id: 5, name: "2 weeks" },
    { id: 6, name: "1 month" },
];

type Props = {
    startDate: Date;
    setStartDate: (date: Date) => void;
    startTime: Date;
    setStartTime: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
    endTime: Date;
    setEndTime: (date: Date) => void;
};

const HackathonTiming = ({ 
    startDate, setStartDate, 
    startTime, setStartTime, 
    endDate, setEndDate, 
    endTime, setEndTime 
}: Props) => {
    const [duration, setDuration] = useState(durationOptions[1]); // Default to 48 hours
    const [timezone, setTimezone] = useState("UTC");

    return (
        <Card title="Hackathon Timing">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="mb-4 text-button">Start Date & Time</div>
                        <DateAndTime
                            startDate={startDate}
                            setStartDate={setStartDate}
                            startTime={startTime}
                            setStartTime={setStartTime}
                        />
                    </div>
                    <div>
                        <div className="mb-4 text-button">End Date & Time</div>
                        <DateAndTime
                            startDate={endDate}
                            setStartDate={setEndDate}
                            startTime={endTime}
                            setStartTime={setEndTime}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default HackathonTiming;
