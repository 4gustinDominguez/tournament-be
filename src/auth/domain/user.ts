export enum UserRole {
	SUPER_ADMIN = "SUPER_ADMIN",
	TOURNAMENT_ADMIN = "TOURNAMENT_ADMIN",
	REFEREE = "REFEREE",
	PLAYER = "PLAYER",
}

export type UserPlan = "free" | "premium";

export interface User {
	id: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	firstName: string;
	lastName: string;
	plan: UserPlan;
	ownedTournaments: string[];
	resetToken?: string;
	resetTokenExpiry?: number;
	verificationToken?: string;
	emailVerified?: boolean;
}
