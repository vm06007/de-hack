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
                href: "/hackathons",
            },
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
    {
        title: "Explore Page",
        icon: "grid",
        href: "/explore-page",
    },
];

export const navigationUser = [
    {
        title: "My hackathon",
        icon: "bag",
        href: "/org",
    },
    {
        title: "Edit profile",
        icon: "edit-profile",
        href: "/settings",
    },
    {
        title: "Affiliate center",
        icon: "chain-think",
        href: "/affiliate-center",
    },
    {
        title: "Explore organizers",
        icon: "grid",
        href: "/explore-page",
    },
];
