"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import DeleteItems from "@/components/DeleteItems";
import UnpublishItems from "@/components/UnpublishItems";
import List from "./List";
import Grid from "./Grid";
import { HackathonConcluded } from "@/types/hackathon";
import { useSelection } from "@/hooks/useSelection";

import { useHackathons } from "@/hooks/useApiData";

const views = [
    { id: 1, name: "grid" },
    { id: 2, name: "list" },
];

const ConcludedPage = () => {
    const [search, setSearch] = useState("");
    const [view, setView] = useState(views[1]);

    // Fetch hackathons data from API
    const { data: hackathons, loading, error } = useHackathons();

    // Filter for concluded hackathons
    const concludedHackathons = hackathons.filter(hackathon => hackathon.status === 'concluded');

    const {
        selectedRows,
        selectAll,
        handleRowSelect,
        handleSelectAll,
        handleDeselect,
    } = useSelection<HackathonConcluded>(concludedHackathons);

    return (
        <Layout title="Concluded">
            <div className="card">
                {selectedRows.length === 0 ? (
                    <div className="flex items-center">
                        <div className="pl-5 text-h6 max-lg:pl-3 max-md:mr-auto">
                            Hackathons
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
                        <UnpublishItems
                            items={selectedRows}
                            onClick={() => {}}
                            isLargeButton
                        />
                    </div>
                )}

                <div className="p-1 pt-3 max-lg:px-0">
                    {view.id === 1 ? (
                        <Grid
                            selectedRows={selectedRows}
                            onRowSelect={handleRowSelect}
                            items={concludedHackathons}
                        />
                    ) : (
                        <List
                            selectedRows={selectedRows}
                            onRowSelect={handleRowSelect}
                            items={concludedHackathons}
                            selectAll={selectAll}
                            onSelectAll={handleSelectAll}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ConcludedPage;
