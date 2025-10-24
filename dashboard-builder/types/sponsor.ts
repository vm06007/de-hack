export interface Sponsor {
    id: number;
    name: string;
    company: string;
    email: string;
    logo: string;
    tier: string;
    totalContributions: number;
    hackathonsSponsored: number;
    successRate: number;
    categories: string[];
    location: string;
    joinDate: string;
    lastActive: string;
    reputation: number;
    totalPrizeMoney: number;
    favoriteCategories: string[];
    socialLinks: {
        website: string;
        twitter: string;
        linkedin: string;
    };
    companyWebsite: string;
}
