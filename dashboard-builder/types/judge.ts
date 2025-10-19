export interface Judge {
    id: number;
    name: string;
    company: string;
    email: string;
    avatar: string;
    experienceYears: number;
    hackathonsJudged: number;
    rating: number;
    expertise: string[];
    location: string;
    joinDate: string;
    lastActive: string;
    reputation: number;
    totalJudgments: number;
    favoriteCategories: string[];
    socialLinks: {
        website: string;
        twitter: string;
        linkedin: string;
    };
}
