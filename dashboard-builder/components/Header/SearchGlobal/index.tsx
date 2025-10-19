import { useState, useRef } from "react";
import { useClickAway } from "react-use";
import Search from "@/components/Search";
import Product from "@/components/Product";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import { useHackathons, useUsers } from "@/src/hooks/useApiData";

export const suggestions = [
    {
        id: 1,
        username: "Vitalik",
        position: "Hackathon Judge",
        avatar: "/images/avatars/2.png",
    },
    {
        id: 2,
        username: "Kartik",
        position: "Hackathon Organizer",
        avatar: "/images/avatars/1.png",
    },
];

type SearchGlobalProps = {
    className?: string;
    onClose?: () => void;
    visible?: boolean;
};

const SearchGlobal = ({ className, onClose, visible }: SearchGlobalProps) => {
    const [search, setSearch] = useState("");
    const visibleResult = search !== "";
    
    // Fetch data from API
    const { data: hackathons, loading: hackathonsLoading } = useHackathons();
    const { data: users, loading: usersLoading } = useUsers();

    const ref = useRef(null);
    useClickAway(ref, () => {
        setSearch("");
        onClose?.();
    });

    return (
        <>
            <div
                className={`relative max-lg:fixed max-lg:inset-5 max-lg:bottom-auto max-lg:z-100 max-md:inset-3 max-md:bottom-auto ${
                    visible
                        ? "max-lg:visible max-lg:opacity-100"
                        : "max-lg:transition-all max-lg:invisible max-lg:opacity-0"
                } ${className || ""}`}
                ref={ref}
            >
                <Search
                    className={`relative z-10 w-79 rounded-3xl overflow-hidden transition-shadow max-[1179px]:w-72 max-lg:w-full ${
                        visibleResult ? "z-100 shadow-depth" : ""
                    }`}
                    classInput="max-lg:pr-12"
                    classButton={`${
                        visible ? "max-lg:visible max-lg:opacity-100" : ""
                    }`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search anything..."
                    onClear={onClose}
                />
                <div
                    className={`absolute top-[calc(100%+0.625rem)] left-0 z-100 w-106.5 p-3 rounded-4xl bg-b-surface2 border-1 border-s-subtle shadow-dropdown transition-all max-[1179px]:w-99.5 max-lg:right-0 max-lg:w-auto ${
                        visibleResult
                            ? "visible opacity-100"
                            : "invisible opacity-0"
                    }`}
                >
                    <div className="mb-3">
                        <div className="p-3 text-body-2 text-t-secondary">
                            Hackathons
                        </div>
                        <div className="">
                            {hackathonsLoading ? (
                                <div className="p-3 text-center text-t-secondary">Loading hackathons...</div>
                            ) : (
                                hackathons.slice(0, 3).map((hackathon) => (
                                    <Product value={hackathon} key={hackathon.id} />
                                ))
                            )}
                        </div>
                    </div>
                    <div className="">
                        <div className="p-3 text-body-2 text-t-secondary">
                            Judges
                        </div>
                        <div className="">
                            {usersLoading ? (
                                <div className="p-3 text-center text-t-secondary">Loading users...</div>
                            ) : (
                                users.slice(0, 2).map((user) => (
                                    <div
                                        className="group relative flex items-center p-3 cursor-pointer"
                                        key={user.id}
                                    >
                                        <div className="box-hover"></div>
                                        <div className="relative z-2 shrink-0">
                                            <Image
                                                className="size-16 rounded-full opacity-100"
                                                src={user.avatar || "/images/avatars/1.png"}
                                                width={64}
                                                height={64}
                                                alt=""
                                            />
                                        </div>
                                        <div className="relative z-2 grow px-5 max-md:pl-3">
                                            <div className="text-sub-title-1">
                                                {user.name}
                                            </div>
                                            <div className="mt-1 text-caption text-t-secondary">
                                                {user.role || "Participant"}
                                            </div>
                                        </div>
                                        <div className="relative z-2 shrink-0 flex items-center justify-center w-12 h-12 rounded-full border border-s-stroke2 transition-colors group-hover:border-s-highlight">
                                            <Icon
                                                className="fill-t-secondary transition-colors group-hover:fill-t-primary"
                                                name="arrow"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`fixed inset-0 z-50 bg-b-surface1/70 transition-all max-lg:hidden ${
                    visibleResult
                        ? "visible opacity-100"
                        : "invisible opacity-0"
                } ${
                    visible
                        ? " max-lg:!block max-lg:visible max-lg:opacity-100"
                        : " max-lg:!block max-lg:invisible max-lg:opacity-0"
                }`}
                onClick={onClose}
            ></div>
        </>
    );
};

export default SearchGlobal;
