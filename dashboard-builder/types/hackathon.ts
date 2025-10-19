export interface HackathonMarket {
    id: number;
    title: string;
    image: string;
    details: string;
    active: boolean;
    price: number;
    sales: {
        value: number;
        percentage: number;
    };
    views: {
        value: string;
        percentage: number;
    };
    likes: {
        value: string;
        percentage: number;
    };
}

export interface HackathonStatistics {
    id: number;
    title: string;
    image: string;
    details: string;
    value: number;
    percentage: number;
    traffic: number;
    trafficSource: {
        title: string;
        value: number;
    }[];
}

export interface HackathonDraft {
    id: number;
    title: string;
    image: string;
    details: string;
    category: string;
    price: number;
    date: string;
}

export interface HackathonConcluded {
    id: number;
    title: string;
    image: string;
    details: string;
    active: boolean;
    price: number;
    sales: {
        value: number;
        percentage: number;
    };
    rating: {
        value: number;
        counter: number;
    };
    views: {
        value: number;
        percentage: number;
    };
}