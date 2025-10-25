"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
// import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import DeleteItems from "@/components/DeleteItems";
// import Dropdown from "@/components/Dropdown";
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

    // Use API hooks instead of mock data
    const { data: allUsers, loading: allUsersLoading, error: allUsersError } = useUsers();

    // For now, use all users for top hackers (you can implement proper top hackers logic later)
    const topHackers = allUsers?.slice(0, 10) || [];
    const topHackersLoading = allUsersLoading;
    const topHackersError = allUsersError;

    // Determine which data to use based on view
    const getCurrentData = () => {
        switch (view.id) {
            case 1: // All Hackers
                return {
                    data: allUsers,
                    loading: allUsersLoading,
                    error: allUsersError,
                };
            case 2: // Top Earners
                return {
                    data: topHackers,
                    loading: topHackersLoading,
                    error: topHackersError,
                };
            case 3: // Most Active
                return {
                    data: allUsers, // You might want to create a separate API endpoint for most active
                    loading: allUsersLoading,
                    error: allUsersError,
                };
            default:
                return {
                    data: allUsers,
                    loading: allUsersLoading,
                    error: allUsersError,
                };
        }
    };

    const { data: hackers, loading, error } = getCurrentData();

    const {
        selectedRows,
        selectAll,
        handleRowSelect,
        handleSelectAll,
        handleDeselect,
    } = useSelection<Hacker>(hackers || []);


    if (loading) {
        return (
            <Layout title="Hacker List">
                <div className="card">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading hackers...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Hacker List">
            <div className="card">
                {selectedRows.length === 0 ? (
                    <div className="flex items-center min-h-12">
                        <div className="pl-5 text-h6 max-lg:pl-3 max-md:mr-auto">
                            Hackers
                        </div>
                        <input
                            style={{ visibility: 'hidden' }}
                            type="text"
                            className="w-70 ml-6 mr-auto max-md:hidden px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or username"
                        />
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

                <div className="p-1 pt-3 max-lg:px-0">
                    <List
                        selectedRows={selectedRows}
                        onRowSelect={handleRowSelect}
                        items={hackers || []}
                        selectAll={selectAll}
                        onSelectAll={handleSelectAll}
                    />

                </div>
            </div>
        </Layout>
    );
};

export default HackerListPage;
