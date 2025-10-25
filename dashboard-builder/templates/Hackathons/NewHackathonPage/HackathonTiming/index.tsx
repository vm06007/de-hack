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

    // Auto-adjust end date/time when start date/time changes or when end date/time is manually changed
    useEffect(() => {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());

        const endDateTime = new Date(endDate);
        endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());

        // Check if dates are the same day
        const isSameDay = startDate.toDateString() === endDate.toDateString();

        // If start date/time is after or equal to end date/time (invalid state)
        if (startDateTime >= endDateTime) {
            if (isSameDay) {
                // Same day: adjust end time to be after start time
                const newEndTime = new Date(startTime);
                newEndTime.setHours(startTime.getHours() + 1); // Add 1 hour to start time
                setEndTime(newEndTime);
            } else {
                // Different days: adjust end date to be after start date
                const newEndDate = new Date(startDateTime);
                newEndDate.setDate(newEndDate.getDate() + 1); // Minimum 1 day gap

                // Update end date but keep the same time
                const newEndTime = new Date(newEndDate);
                newEndTime.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());

                setEndDate(newEndDate);
                setEndTime(newEndTime);
            }
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
