"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Select from "@/components/Select";
import Button from "@/components/Button";
import DeleteItems from "@/components/DeleteItems";
import Dropdown from "@/components/Dropdown";
import List from "./List";
import { HackathonDraft } from "@/types/hackathon";
import { useSelection } from "@/hooks/useSelection";

import { useHackathons } from "@/hooks/useApiData";

const timeCreateOptions = [
    { id: 1, name: "Newest first" },
    { id: 2, name: "Oldest first" },
    { id: 3, name: "A-Z" },
    { id: 4, name: "Z-A" },
];

const ScheduledPage = () => {
    const [search, setSearch] = useState("");
    const [timeCreate, setTimeCreate] = useState(timeCreateOptions[0]);

    // Fetch hackathons data from API
    const { data: hackathons, loading, error } = useHackathons();

    // Filter for scheduled/draft hackathons
    const scheduledHackathons = hackathons.filter(hackathon => hackathon.status === 'upcoming' || hackathon.status === 'draft');

    const {
        selectedRows,
        selectAll,
        handleRowSelect,
        handleSelectAll,
        handleDeselect,
    } = useSelection<HackathonDraft>(scheduledHackathons);

    return (
        <Layout title="Scheduled">
            <div className="card">
                {selectedRows.length === 0 ? (
                    <div className="flex items-center max-md:h-12">
                        <div className="pl-5 text-h6 max-md:mr-auto max-lg:pl-3">
                            {scheduledHackathons.length} scheduled hackathon
                            {scheduledHackathons.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <div className="mr-6 pl-5 text-h6">
                            {selectedRows.length} hackathon
                            {selectedRows.length !== 1 ? "s" : ""} selected
                        </div>
                        <Button
                            className="mr-auto"
                            isStroke
                            onClick={handleDeselect}
                        >
                            Deselect
                        </Button>
                        <DeleteItems
                            counter={selectedRows.length}
                            onDelete={() => {}}
                            isLargeButton
                        />
                        <Button className="ml-2" isBlack>
                            Reschedule
                        </Button>
                    </div>
                )}
                <div className="p-1 pt-3 max-lg:px-0">
                    <List
                        selectedRows={selectedRows}
                        onRowSelect={handleRowSelect}
                        items={scheduledHackathons}
                        selectAll={selectAll}
                        onSelectAll={handleSelectAll}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default ScheduledPage;
