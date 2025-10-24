// Base navigation items (always visible)
export const baseNavigation = [
    {
        title: "Explore Page",
        icon: "grid",
        href: "/explore",
    },
    {
        title: "Hackathons",
        icon: "product-think",
        list: [
            {
                title: "Active",
                href: "/hackathons/active",
                counter: 2,
            },
            {
                title: "Concluded",
                href: "/hackathons/concluded",
            },
            {
                title: "Scheduled",
                href: "/hackathons/scheduled",
                counter: 8,
            },
        ],
    },
    {
        title: "Participants",
        icon: "profile",
        list: [
            {
                title: "Hackers",
                href: "/participants/hackers",
            },
            {
                title: "Sponsors",
                href: "/participants/sponsors",
            },
            {
                title: "Judges",
                href: "/participants/judges",
            },
        ],
    },
    {
        title: "Organizations",
        icon: "wallet",
        list: [
            {
                title: "ETHGlobal",
                href: "/organizations/ethglobal",
            },
            {
                title: "Token2049",
                href: "/organizations/token2049",
            },
        ],
    },
];

// Judge-only navigation items
export const judgeNavigation = [
    {
        title: "Judging Panel",
        icon: "dashboard",
        href: "/judging",
    },
];

// Function to get navigation based on judge status
export const getNavigation = (isJudge: boolean) => {
    return isJudge ? [...baseNavigation, ...judgeNavigation] : baseNavigation;
};

// Default navigation (for backward compatibility)
export const navigation = baseNavigation;

export const navigationUser = [
    {
        title: "Hackathon",
        icon: "bag",
        href: "/org",
    },
    {
        title: "Settings",
        icon: "edit-profile",
        href: "/settings",
    },
    {
        title: "Explore Page",
        icon: "grid",
        href: "/explore",
    },
];
