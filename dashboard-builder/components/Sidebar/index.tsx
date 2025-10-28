import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { RemoveScroll } from "react-remove-scroll";
import NavLink from "@/components/NavLink";
import Button from "@/components/Button";
import Dropdown from "./Dropdown";
import { useIsJudge } from "@/hooks/useIsJudge";

import { getNavigation } from "@/contstants/navigation";

type SidebarProps = {
    visibleSidebar?: boolean;
    hideSidebar?: boolean;
    onCloseSidebar?: () => void;
};

const Sidebar = ({
    visibleSidebar,
    hideSidebar,
    onCloseSidebar,
}: SidebarProps) => {
    const { isJudge, isLoading } = useIsJudge();
    const [isClient, setIsClient] = useState(false);
    
    // Ensure client-side rendering to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Use default navigation during SSR to prevent hydration mismatch
    const navigation = isClient ? getNavigation(isJudge) : getNavigation(false);

    return (
        <div
            className={`fixed top-0 left-0 bottom-0 flex flex-col w-85 p-5 bg-b-surface1 transition-transform duration-300 max-4xl:w-70 max-3xl:w-60 max-xl:w-74 max-md:p-3 ${
                visibleSidebar
                    ? `${
                        hideSidebar
                            ? "z-40 translate-x-0"
                            : "max-xl:z-40 max-xl:translate-x-0"
                    }`
                    : `${
                        hideSidebar
                            ? "z-40 -translate-x-full"
                            : "max-xl:z-40 max-xl:-translate-x-full"
                    }`
            }`}
        >
            <Logo className="mb-5" />
            <Button
                className={`group absolute top-5 right-5 max-md:top-3 max-md:right-3 ${
                    hideSidebar ? "flex" : "!hidden max-xl:!flex"
                }`}
                icon="close"
                onClick={onCloseSidebar}
                isCircle
                isWhite
            />
            <RemoveScroll
                className="flex flex-col gap-1 grow overflow-auto -mx-5 px-5 scrollbar scrollbar-thumb-t-tertiary/50 scrollbar-track-b-surface2 max-md:-mx-3 max-md:px-3"
                enabled={visibleSidebar}
            >
                {navigation.map((item) =>
                    item.href ? (
                        <NavLink key={`${item.title}-${isJudge}`} value={item} />
                    ) : (
                        <Dropdown key={`${item.title}-${isJudge}`} value={item} />
                    )
                )}
            </RemoveScroll>
            <div className="mt-auto pt-6 max-md:pt-4">
                {/* <Button className="mb-3" icon="chat-think" isWhite isCircle /> */}
            </div>
        </div>
    );
};

export default Sidebar;
