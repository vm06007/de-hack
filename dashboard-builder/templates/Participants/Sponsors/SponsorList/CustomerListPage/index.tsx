"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import DeleteItems from "@/components/DeleteItems";
import Dropdown from "@/components/Dropdown";
import List from "./List";
import { Sponsor } from "@/types/sponsor";
import { useSelection } from "@/hooks/useSelection";
import { useSponsors } from "@/src/hooks/useSponsors";

const views = [
    { id: 1, name: "All Sponsors" },
    { id: 2, name: "Top Contributors" },
    { id: 3, name: "Most Active" },
];

const SponsorListPage = () => {
    const [search, setSearch] = useState("");
    const [view, setView] = useState(views[0]);
    const { data: sponsors, loading, error } = useSponsors();
    const {
        selectedRows,
        selectAll,
        handleRowSelect,
        handleSelectAll,
        handleDeselect,
    } = useSelection<Sponsor>(sponsors);

    if (loading) {
        return <Layout title="Sponsor List"><div className="card"><div>Loading sponsors...</div></div></Layout>;
    }

    if (error) {
        return <Layout title="Sponsor List"><div className="card"><div>Error loading sponsors: {error}</div></div></Layout>;
    }

    return (
        <Layout title="Sponsor List">
            <div className="card">
                {selectedRows.length === 0 ? (
                    <div className="flex items-center min-h-12">
                        <div className="pl-5 text-h6 max-lg:pl-3 max-md:mr-auto">
                            Sponsors
                        </div>
                        <input
                            type="text"
                            className="w-70 ml-6 mr-auto max-md:hidden px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or company"
                        />
                        {search === "" && (
                            <>
                                <Tabs
                                    className="max-md:hidden"
                                    items={views}
                                    value={view}
                                    setValue={setView}
                                />
                                <Dropdown
                                    className="hidden max-md:block"
                                    items={views}
                                    value={view}
                                    setValue={setView}
                                />
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center">
                        <div className="mr-6 pl-5 text-h6">
                            {selectedRows.length} sponsor
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
                {search !== "" ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No sponsors found</p>
                    </div>
                ) : (
                    <div className="p-1 pt-3 max-lg:px-0">
                        <List
                            selectedRows={selectedRows}
                            onRowSelect={handleRowSelect}
                            items={sponsors}
                            selectAll={selectAll}
                            onSelectAll={handleSelectAll}
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SponsorListPage;
