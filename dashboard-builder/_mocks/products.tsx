export const bestMatch = [
    {
        id: 1,
        title: "DeFi Protocol Template",
        category: "DeFi",
        price: 299,
        image: "/images/products/1.png"
    },
    {
        id: 2,
        title: "NFT Marketplace Kit",
        category: "NFT",
        price: 199,
        image: "/images/products/2.png"
    },
    {
        id: 3,
        title: "Web3 Dashboard Template",
        category: "Infrastructure",
        price: 399,
        image: "/images/products/3.png"
    }
];

export const popularHackathons = [
    {
        id: 1,
        title: "ETHGlobal Hackathon",
        category: "DeFi",
        participants: 1200,
        prize: 50000,
        image: "/images/products/1.png",
        status: "active"
    },
    {
        id: 2,
        title: "Polygon Build-a-thon",
        category: "Scaling",
        participants: 800,
        prize: 30000,
        image: "/images/products/2.png",
        status: "active"
    },
    {
        id: 3,
        title: "Chainlink Hackathon",
        category: "Oracle",
        participants: 600,
        prize: 25000,
        image: "/images/products/3.png",
        status: "upcoming"
    }
];

export const draftsHackathons = [
    {
        id: 1,
        title: "DeFi Protocol Template",
        category: "DeFi",
        status: "draft",
        participants: 0,
        prize: 0,
        image: "/images/products/1.png"
    },
    {
        id: 2,
        title: "NFT Marketplace Kit",
        category: "NFT",
        status: "draft",
        participants: 0,
        prize: 0,
        image: "/images/products/2.png"
    }
];

export const concludedHackathons = [
    {
        id: 1,
        title: "Web3 Dashboard Template",
        details: "A comprehensive dashboard for Web3 applications with real-time analytics",
        active: true,
        price: 399,
        sales: {
            value: 12500,
            percentage: 15.2
        },
        rating: {
            value: 4.8,
            counter: 127
        },
        views: {
            value: 2847,
            percentage: 22.1
        },
        image: "/images/products/3.png"
    },
    {
        id: 2,
        title: "DeFi Protocol Template",
        details: "Complete DeFi protocol with smart contracts and frontend",
        active: true,
        price: 299,
        sales: {
            value: 8750,
            percentage: 8.5
        },
        rating: {
            value: 4.6,
            counter: 89
        },
        views: {
            value: 1923,
            percentage: 18.7
        },
        image: "/images/products/1.png"
    },
    {
        id: 3,
        title: "NFT Marketplace Kit",
        details: "Full-stack NFT marketplace with minting and trading features",
        active: false,
        price: 199,
        sales: {
            value: 4200,
            percentage: 5.1
        },
        rating: {
            value: 4.3,
            counter: 64
        },
        views: {
            value: 1456,
            percentage: 12.3
        },
        image: "/images/products/2.png"
    }
];

export const overview = [
    {
        id: 1,
        title: "Total Revenue",
        icon: "chart",
        tooltip: "Total revenue generated from all hackathons",
        counter: "125,430",
        percentage: 12.5,
        dataChart: [
            { name: "Jan", amt: 10000 },
            { name: "Feb", amt: 12000 },
            { name: "Mar", amt: 15000 },
            { name: "Apr", amt: 18000 },
            { name: "May", amt: 22000 },
            { name: "Jun", amt: 25000 }
        ]
    },
    {
        id: 2,
        title: "Active Hackathons",
        icon: "hackathon",
        tooltip: "Number of currently active hackathons",
        counter: "8",
        percentage: 8.2,
        dataChart: [
            { name: "Jan", amt: 3 },
            { name: "Feb", amt: 4 },
            { name: "Mar", amt: 5 },
            { name: "Apr", amt: 6 },
            { name: "May", amt: 7 },
            { name: "Jun", amt: 8 }
        ]
    },
    {
        id: 3,
        title: "Participants",
        icon: "users",
        tooltip: "Total number of participants across all hackathons",
        counter: "2,847",
        percentage: 15.3,
        dataChart: [
            { name: "Jan", amt: 1200 },
            { name: "Feb", amt: 1400 },
            { name: "Mar", amt: 1600 },
            { name: "Apr", amt: 1800 },
            { name: "May", amt: 2200 },
            { name: "Jun", amt: 2847 }
        ]
    },
    {
        id: 4,
        title: "Prize Pool",
        icon: "prize",
        tooltip: "Total prize money available across all hackathons",
        counter: "$450,000",
        percentage: 22.1,
        dataChart: [
            { name: "Jan", amt: 50000 },
            { name: "Feb", amt: 75000 },
            { name: "Mar", amt: 100000 },
            { name: "Apr", amt: 150000 },
            { name: "May", amt: 200000 },
            { name: "Jun", amt: 450000 }
        ]
    }
];

export const productActivity = [
    {
        date: "2024-01-01",
        views: 120,
        participants: 15,
        revenue: 2500
    },
    {
        date: "2024-01-02",
        views: 180,
        participants: 22,
        revenue: 3200
    },
    {
        date: "2024-01-03",
        views: 95,
        participants: 12,
        revenue: 1800
    }
];

export const productsPurchaseHistory = [
    {
        id: 1,
        title: "DeFi Protocol Template",
        price: 299,
        date: "2024-01-15",
        status: "completed"
    },
    {
        id: 2,
        title: "NFT Marketplace Kit",
        price: 199,
        date: "2024-01-10",
        status: "completed"
    }
];

export const products = [
    {
        id: 1,
        title: "Web3 Dashboard Template",
        image: "/images/products/3.png",
        details: "A comprehensive dashboard for Web3 applications with real-time analytics",
        active: true,
        price: 399,
        sales: {
            value: 12500,
            percentage: 15.2
        },
        views: {
            value: "2.8k",
            percentage: 22.1
        },
        likes: {
            value: "1.2k",
            percentage: 18.5
        }
    },
    {
        id: 2,
        title: "DeFi Protocol Template",
        image: "/images/products/1.png",
        details: "Complete DeFi protocol with smart contracts and frontend",
        active: true,
        price: 299,
        sales: {
            value: 8750,
            percentage: 8.5
        },
        views: {
            value: "1.9k",
            percentage: 18.7
        },
        likes: {
            value: "890",
            percentage: 14.2
        }
    },
    {
        id: 3,
        title: "NFT Marketplace Kit",
        image: "/images/products/2.png",
        details: "Full-stack NFT marketplace with minting and trading features",
        active: false,
        price: 199,
        sales: {
            value: 4200,
            percentage: 5.1
        },
        views: {
            value: "1.4k",
            percentage: 12.3
        },
        likes: {
            value: "640",
            percentage: 9.8
        }
    }
];

export const productsTrafficSources = [
    {
        id: 1,
        title: "Web3 Dashboard Template",
        image: "/images/products/3.png",
        details: "A comprehensive dashboard for Web3 applications with real-time analytics",
        value: 2847,
        percentage: 22.1,
        traffic: 1250,
        trafficSource: [
            { title: "Direct", value: 45 },
            { title: "Search", value: 30 },
            { title: "Social", value: 25 }
        ]
    },
    {
        id: 2,
        title: "DeFi Protocol Template",
        image: "/images/products/1.png",
        details: "Complete DeFi protocol with smart contracts and frontend",
        value: 1923,
        percentage: 18.7,
        traffic: 890,
        trafficSource: [
            { title: "Direct", value: 40 },
            { title: "Search", value: 35 },
            { title: "Social", value: 25 }
        ]
    }
];

export const productsViewers = [
    {
        id: 1,
        title: "Web3 Dashboard Template",
        image: "/images/products/3.png",
        details: "A comprehensive dashboard for Web3 applications with real-time analytics",
        value: 2847,
        percentage: 22.1,
        traffic: 1250,
        trafficSource: [
            { title: "Direct", value: 45 },
            { title: "Search", value: 30 },
            { title: "Social", value: 25 }
        ]
    },
    {
        id: 2,
        title: "DeFi Protocol Template",
        image: "/images/products/1.png",
        details: "Complete DeFi protocol with smart contracts and frontend",
        value: 1923,
        percentage: 18.7,
        traffic: 890,
        trafficSource: [
            { title: "Direct", value: 40 },
            { title: "Search", value: 35 },
            { title: "Social", value: 25 }
        ]
    }
];

export const productsShare = [
    {
        id: 1,
        title: "Web3 Dashboard Template",
        shares: 45,
        likes: 120,
        comments: 23
    },
    {
        id: 2,
        title: "DeFi Protocol Template",
        shares: 32,
        likes: 89,
        comments: 15
    }
];