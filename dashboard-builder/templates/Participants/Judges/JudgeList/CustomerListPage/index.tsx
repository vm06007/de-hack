"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
// import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import DeleteItems from "@/components/DeleteItems";
// import Dropdown from "@/components/Dropdown";
import List from "./List";
import { Judge } from "@/types/judge";
import { useSelection } from "@/hooks/useSelection";

import { useJudges } from "@/src/hooks/useApiData";

const JudgeListPage = () => {
    const [search, setSearch] = useState("");
    const { data: judges, loading, error } = useJudges();
    const {
        selectedRows,
        selectAll,
        handleRowSelect,
        handleSelectAll,
        handleDeselect,
    } = useSelection<Judge>(judges);

    return (
        <Layout title="Judge List">
            <div className="card">
                {selectedRows.length === 0 ? (
                    <div className="flex items-center min-h-12">
                        <div className="pl-5 text-h6 max-lg:pl-3 max-md:mr-auto">
                            Judges
                        </div>
                        <input
                            type="text"
                            style={{ visibility: 'hidden' }}
                            className="w-70 ml-6 mr-auto max-md:hidden px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or expertise"
                        />
                    </div>
                ) : (
                    <div className="flex items-center">
                        <div className="mr-6 pl-5 text-h6">
                            {selectedRows.length} judge
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
                        <p className="text-gray-500">No judges found</p>
                    </div>
                ) : (
                    <div className="p-1 pt-3 max-lg:px-0">
                        <List
                            selectedRows={selectedRows}
                            onRowSelect={handleRowSelect}
                            items={judges}
                            selectAll={selectAll}
                            onSelectAll={handleSelectAll}
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default JudgeListPage;
