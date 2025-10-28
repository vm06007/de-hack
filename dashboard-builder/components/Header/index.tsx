import { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
// import Icon from "@/components/Icon";
// import User from "./User";
// import Notifications from "./Notifications";
// import Messages from "./Messages";
import WalletConnect from "@/components/WalletConnect";

type HeaderProps = {
    className?: string;
    title?: string;
    newProduct?: boolean;
    hideSidebar?: boolean;
    onDeploy?: () => void;
    onToggleSidebar?: () => void;
    isLoading?: boolean;
};

const Header = ({
    className,
    title,
    newProduct,
    hideSidebar,
    onDeploy,
    onToggleSidebar,
    isLoading,
}: HeaderProps) => {
    const [hasOverflowHidden, setHasOverflowHidden] = useState(false);

    const isHideCreateButton = false
        // pathname.includes("/hackers/hacker-list/") ||
        // pathname.includes("/notifications");

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "style") {
                    const htmlElement = document.documentElement;
                    const isOverflowHidden =
                        window.getComputedStyle(htmlElement).overflow ===
                        "hidden";
                    setHasOverflowHidden(isOverflowHidden);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["style"],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <header
            className={`fixed top-0 right-0 z-20 bg-b-surface1 max-lg:!right-0 ${
                hasOverflowHidden
                    ? "right-[calc(0px+var(--scrollbar-width))]"
                    : ""
            } ${
                hideSidebar
                    ? "left-0"
                    : "left-85 max-4xl:left-70 max-3xl:left-60 max-xl:left-0"
            } ${className || ""}`}
        >
            <div
                className={`flex items-center justify-between w-full h-22 max-md:h-18 ${
                    hideSidebar ? "center max-w-full" : "center-with-sidebar"
                } ${
                    newProduct
                        ? "max-md:flex-wrap max-md:!h-auto max-md:p-3"
                        : ""
                }`}
            >
                <div
                    className={`mr-3 gap-3 max-md:mr-auto ${
                        hideSidebar ? "flex" : "hidden max-xl:flex"
                    }`}
                >
                    <Logo />
                    <Button
                        className="flex-col gap-[4.5px] shrink-0 before:w-4.5 before:h-[1.5px] before:rounded-full before:bg-t-secondary before:transition-colors after:w-4.5 after:h-[1.5px] after:rounded-full after:bg-t-secondary after:transition-colors hover:before:bg-t-primary hover:after:bg-t-primary"
                        onClick={onToggleSidebar}
                        isCircle
                        isWhite
                    />
                </div>
                {title && (
                    <div className="mr-auto text-h4 max-lg:text-h5 max-md:hidden">
                        {title}
                    </div>
                )}
                <div
                    className={`flex items-center gap-3 ml-auto ${
                        newProduct ? "hidden max-md:flex" : ""
                    }`}
                >
                    {!newProduct && (
                        <>
                            {!isHideCreateButton && (
                                <Button
                                    className="max-md:hidden"
                                    isBlack
                                    href="/hackathons/new"
                                    as="link"
                                >
                                    Create Hackathon
                                </Button>
                            )}
                            <WalletConnect />
                        </>
                    )}
                    {/*<Notifications />
                    <Messages />*/}
                    {/*<User />*/}
                </div>
                {newProduct && (
                    <div className="flex items-center gap-3 max-md:gap-0 max-md:w-[calc(100%+0.75rem)] max-md:mt-3 max-md:-mx-1.5">
                        <Button
                            className="min-w-36 max-md:w-full max-md:mx-1.5"
                            isBlack
                            onClick={onDeploy}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deploying..." : "Deploy Now"}
                        </Button>
                        <WalletConnect />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
