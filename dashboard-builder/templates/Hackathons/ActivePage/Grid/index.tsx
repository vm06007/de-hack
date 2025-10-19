import GridHackathon from "@/components/GridHackathon";
import Icon from "@/components/Icon";
import DeleteItems from "@/components/DeleteItems";
import ScheduleHackathon from "@/components/ScheduleHackathon";
import { HackathonDraft } from "@/types/hackathon";

type GridProps = {
    items: HackathonDraft[];
    selectedRows: number[];
    onRowSelect: (id: number) => void;
};

const Grid = ({ selectedRows, onRowSelect, items }: GridProps) => {
    return (
        <div className="flex flex-wrap max-md:-mt-3">
            {items.map((item) => (
                <GridHackathon
                    title={item.title}
                    image={item.image}
                    price={item.price}
                    selectedRows={selectedRows.includes(item.id)}
                    onRowSelect={() => onRowSelect(item.id)}
                    key={item.id}
                    actions={
                        <>
                            <button className="action">
                                <Icon name="edit" />
                                Edit
                            </button>
                            <DeleteItems onDelete={() => {}} />
                            <ScheduleHackathon
                                title={item.title}
                                details={item.category}
                                image={item.image}
                                price={item.price}
                            />
                        </>
                    }
                >
                    <div className="flex items-center gap-2 text-caption text-t-secondary/80">
                        <Icon className="fill-t-secondary" name="clock" />
                        {item.date}
                    </div>
                </GridHackathon>
            ))}
        </div>
    );
};

export default Grid;
