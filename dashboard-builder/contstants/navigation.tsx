export const navigation = [
    {
        title: "Dashboard",
        icon: "dashboard",
        href: "/",
    },
    {
        title: "Hackathons",
        icon: "product-think",
        list: [
            {
                title: "Overview",
                href: "/products",
            },
            {
                title: "Active",
                href: "/products/drafts",
                counter: 2,
            },
            {
                title: "Concluded",
                href: "/products/released",
            },
            {
                title: "Scheduled",
                href: "/products/scheduled",
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
    {
        title: "Income",
        icon: "income",
        list: [
            {
                title: "Earning",
                href: "/income/earning",
            },
            {
                title: "Refunds",
                href: "/income/refunds",
                counter: 3,
            },
            {
                title: "Payouts",
                href: "/income/payouts",
            },
            {
                title: "Statements",
                href: "/income/statements",
            },
        ],
    },
    {
        title: "Explore Creators",
        icon: "grid",
        href: "/explore-creators",
    },
];

export const navigationUser = [
    {
        title: "My hackathon",
        icon: "bag",
        href: "/shop",
    },
    {
        title: "Edit profile",
        icon: "edit-profile",
        href: "/settings",
    },
    {
        title: "Analytics",
        icon: "chart",
        href: "/hackers",
    },
    {
        title: "Affiliate center",
        icon: "chain-think",
        href: "/affiliate-center",
    },
    {
        title: "Explore organizers",
        icon: "grid",
        href: "/explore-creators",
    },
    {
        title: "Upgrade to Pro",
        icon: "star-fill",
        href: "/upgrade-to-pro",
    },
];
