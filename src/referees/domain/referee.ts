export interface Referee {
	id: string;
	name: string;
	tournamentIds: string[];
	userId?: string; // Link to User account for future login
}
