import { useState } from "react";
import Link from "next/link";
import { NumericFormat } from "react-number-format";
import Table from "@/components/Table";
import TableRow from "@/components/TableRow";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Percentage from "@/components/Percentage";
import Button from "@/components/Button";
import { Judge } from "@/types/judge";

const tableHead = [
    "Judge",
    "Company",
    "Experience (Years)",
    "Hackathons Judged",
    "Rating",
    "Expertise",
];

type ListProps = {
    items: Judge[];
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
    const [activeRow, setActiveRow] = useState<number | null>(null);
    return (
        <>
            <Table
                selectAll={selectAll}
                onSelectAll={onSelectAll}
                cellsThead={tableHead.map((head) => (
                    <th
                        className="max-2xl:nth-3:hidden max-lg:nth-6:hidden max-lg:nth-7:hidden"
                        key={head}
                    >
                        {head}
                    </th>
                ))}
            >
                {items.map((item) => (
                    <TableRow
                        selectedRows={selectedRows.includes(item.id)}
                        onRowSelect={() => onRowSelect(item.id)}
                        key={item.id}
                        onClick={() => setActiveRow(item.id)}
                    >
                        <td>
                            <div className="inline-flex items-center max-md:flex max-md:items-start">
                                <div className="relative z-2 shrink-0">
                                    <Image
                                        className="size-16 rounded-full opacity-100 object-cover"
                                        src={item.avatar}
                                        width={64}
                                        height={64}
                                        alt=""
                                    />
                                </div>
                                <div className="max-w-64 ml-5 max-md:ml-4 max-md:grow max-md:max-w-full">
                                    <div className="pt-0.5 text-sub-title-1 max-md:mb-0.5 max-md:pt-0">
                                        {item.name}
                                    </div>
                                    <div className="relative">
                                        <div
                                            className={`absolute top-0 left-0 text-body-2 text-t-secondary/80 transition-all group-hover:invisible group-hover:opacity-0 max-md:static ${
                                                activeRow === item.id
                                                    ? "max-lg:invisible max-lg:opacity-0"
                                                    : ""
                                            }`}
                                        >
                                            {item.company}
                                            <div className="hidden items-center gap-3 mt-1 text-t-primary max-md:flex">
                                                <div className="w-20 text-caption text-t-tertiary/80">
                                                    Judged
                                                </div>
                                                {item.hackathonsJudged}
                                            </div>
                                            <div className="hidden items-center gap-3 mt-0.5 text-t-primary max-md:flex">
                                                <div className="w-20 text-caption text-t-tertiary/80">
                                                    Experience
                                                </div>
                                                {item.experienceYears} years
                                                <div className="flex items-center gap-1">
                                                    <Icon name="star" className="w-3 h-3 fill-yellow-400" />
                                                    {item.rating}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={`flex flex-wrap gap-2 mt-0.5 -ml-1 invisible opacity-0 transition-all group-hover:visible group-hover:opacity-100 max-md:-mr-1 max-md:absolute max-md:top-0 max-md:left-0 max-md:right-0 max-md:flex-col max-md:gap-0.5 ${
                                                activeRow === item.id
                                                    ? "max-lg:visible max-lg:opacity-100"
                                                    : ""
                                            }`}
                                        >
                                            <button className="action">
                                                <Icon name="chat" />
                                                Message
                                            </button>
                                            <Link
                                                className="action"
                                                href="/participants/judges/judge-list/details"
                                            >
                                                <Icon name="arrow-up-right" />
                                                Detail
                                            </Link>
                                            <button className="action">
                                                <Icon name="star" />
                                                Follow
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="max-2xl:hidden">{item.company}</td>
                        <td className="max-md:hidden">
                            <div className="inline-flex items-center gap-2 max-lg:gap-0">
                                {item.experienceYears} years
                            </div>
                        </td>
                        <td className="max-md:hidden">{item.hackathonsJudged}</td>
                        <td className="max-lg:hidden">
                            <div className="flex items-center gap-1">
                                <Icon name="star" className="w-3 h-3 fill-yellow-400" />
                                {item.rating}
                            </div>
                        </td>
                        <td className="max-lg:hidden">
                            <div className="flex flex-wrap gap-1">
                                {item.expertise.slice(0, 2).map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-caption-2 bg-n-3 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {item.expertise.length > 2 && (
                                    <span className="px-2 py-1 text-caption-2 bg-n-3 rounded-full">
                                        +{item.expertise.length - 2}
                                    </span>
                                )}
                            </div>
                        </td>
                    </TableRow>
                ))}
            </Table>
            <div className="flex justify-center gap-1 pt-1 pb-4 max-md:pt-3 max-md:pb-1">
                <Button
                    className="rotate-180"
                    icon="arrow"
                    isCircle
                    isStroke
                    disabled
                />
                <Button icon="arrow" isCircle isStroke />
            </div>
        </>
    );
};

export default List;
