import { useEffect } from "react";
import Card from "@/components/Card";
// import Field from "@/components/Field";
// import Select from "@/components/Select";
import DateAndTime from "@/components/DateAndTime";

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
    // const [duration, setDuration] = useState(durationOptions[1]); // Default to 48 hours
    // const [timezone, setTimezone] = useState("UTC");

    // Auto-adjust end date when start date changes
    useEffect(() => {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());

        const endDateTime = new Date(endDate);
        endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());

        // Calculate the gap between start and end dates
        const timeDiff = endDateTime.getTime() - startDateTime.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // If start date is now after end date, adjust end date to maintain the gap
        if (startDateTime >= endDateTime) {
            const newEndDate = new Date(startDateTime);
            newEndDate.setDate(newEndDate.getDate() + Math.max(daysDiff, 7)); // Minimum 7 days gap

            // Update end date but keep the same time
            const newEndTime = new Date(newEndDate);
            newEndTime.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());

            setEndDate(newEndDate);
            setEndTime(newEndTime);
        }
    }, [startDate, startTime, endDate, endTime, setEndDate, setEndTime]);

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
