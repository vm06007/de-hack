"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Search from "@/components/Search";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import DeleteItems from "@/components/DeleteItems";
import NoFound from "@/components/NoFound";
import Dropdown from "@/components/Dropdown";
import List from "./List";
import { Hacker } from "@/types/hacker";
import { useSelection } from "@/hooks/useSelection";
import { useUsers, useTopHackers } from "@/src/hooks/useUsers";

const views = [
    { id: 1, name: "All Hackers" },
    { id: 2, name: "Top Earners" },
    { id: 3, name: "Most Active" },
];

const HackerListPage = () => {
    const [search, setSearch] = useState("");
    const [view, setView] = useState(views[0]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // Use API hooks instead of mock data
    const { users: allUsers, loading: allUsersLoading, error: allUsersError, pagination } = useUsers({
        role: 'hacker',
        page,
        limit,
        search: search || undefined,
    });

    const { hackers: topHackers, loading: topHackersLoading, error: topHackersError } = useTopHackers(10);

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

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== "") {
                setPage(1); // Reset to first page when searching
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

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

    if (error) {
        return (
            <Layout title="Hacker List">
                <div className="card">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">Error loading hackers: {error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Retry
                            </Button>
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
                        <Search
                            className="w-70 ml-6 mr-auto max-md:hidden"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or username"
                            isGray
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
                {search !== "" && (!hackers || hackers.length === 0) ? (
                    <NoFound title="No hackers found" />
                ) : (
                    <div className="p-1 pt-3 max-lg:px-0">
                        <List
                            selectedRows={selectedRows}
                            onRowSelect={handleRowSelect}
                            items={hackers || []}
                            selectAll={selectAll}
                            onSelectAll={handleSelectAll}
                        />
                        
                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex items-center justify-center mt-6 space-x-2">
                                <Button
                                    isStroke
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-500">
                                    Page {page} of {pagination.pages}
                                </span>
                                <Button
                                    isStroke
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= pagination.pages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HackerListPage;
