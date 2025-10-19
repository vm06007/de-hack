"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
    import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import DeleteItems from "@/components/DeleteItems";
import Dropdown from "@/components/Dropdown";
import List from "./List";
import { Hacker } from "@/types/hacker";
import { useSelection } from "@/hooks/useSelection";

import { useUsers } from "@/src/hooks/useUsers";

const views = [
    { id: 1, name: "All Hackers" },
    { id: 2, name: "Top Earners" },
    { id: 3, name: "Most Active" },
];

const HackerListPage = () => {
    const [search, setSearch] = useState("");
    const [view, setView] = useState(views[0]);
    const { data: hackers, loading, error } = useUsers();

    const {
        selectedRows,
        selectAll,
        handleRowSelect,
        handleSelectAll,
        handleDeselect,
    } = useSelection<Hacker>(hackers || []);

    return (
        <Layout title="Hacker List">
            <div className="card">
                {selectedRows.length === 0 ? (
                    <div className="flex items-center min-h-12">
                        <div className="pl-5 text-h6 max-lg:pl-3 max-md:mr-auto">
                            Hackers
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <div className="mr-6 pl-5 text-h6">
                            {selectedRows.length} hacker
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
                    </div>
                )}
                {loading ? (
                    <div className="p-5 text-center">Loading hackers...</div>
                ) : error ? (
                    <div className="p-5 text-center text-red-500">Error loading hackers: {error}</div>
                ) : search !== "" ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No hackers found</p>
                    </div>
                ) : (
                    <div className="p-1 pt-3 max-lg:px-0">
                        <List
                            selectedRows={selectedRows}
                            onRowSelect={handleRowSelect}
                            items={hackers || []}
                            selectAll={selectAll}
                            onSelectAll={handleSelectAll}
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HackerListPage;
