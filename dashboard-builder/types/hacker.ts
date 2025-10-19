export interface Hacker {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar: string;
    totalEarnings: number;
    participationCount: number;
    winRate: number;
    skills: string[];
    location: string;
    joinDate: string;
    lastActive: string;
    reputation: number;
    hackathonsWon: number;
    totalPrizeMoney: number;
    favoriteCategories: string[];
    socialLinks: {
        github: string;
        twitter: string;
        linkedin: string;
    };
    walletAddress: string;
}
