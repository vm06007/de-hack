import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import TableHackathonCell from "@/components/TableHackathonCell";
import Icon from "@/components/Icon";
import DeleteItems from "@/components/DeleteItems";
import ScheduleHackathon from "@/components/ScheduleHackathon";
import { HackathonDraft } from "@/types/hackathon";

const tableHead = ["Hackathon", "Prize Pool", "Last edited"];

type ListProps = {
    items: HackathonDraft[];
    selectedRows: number[];
    onRowSelect: (id: number) => void;
    selectAll: boolean;
    onSelectAll: () => void;
};

const List = ({
    selectedRows,
    onRowSelect,
    selectAll,
    onSelectAll,
    items,
}: ListProps) => {
    return (
        <Table
            selectAll={selectAll}
            onSelectAll={onSelectAll}
            cellsThead={tableHead.map((head) => (
                <th key={head}>{head}</th>
            ))}
        >
            {items.map((item) => (
                <TableRow
                    selectedRows={selectedRows.includes(item.id)}
                    onRowSelect={() => onRowSelect(item.id)}
                    key={item.id}
                >
                    <TableHackathonCell
                        title={item.title}
                        details={item.details}
                        image={item.image}
                    >
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
                            reSchedule
                        />
                    </TableHackathonCell>
                    <td className="min-w-40 max-lg:min-w-auto max-md:hidden">
                        <div
                            className={`label ${
                                item.price === 0
                                    ? "label-gray text-t-primary"
                                    : "label-green"
                            }`}
                        >
                            ${item.price}
                        </div>
                    </td>
                    <td className="text-t-secondary max-md:hidden">
                        {item.date}
                    </td>
                </TableRow>
            ))}
        </Table>
    );
};

export default List;
