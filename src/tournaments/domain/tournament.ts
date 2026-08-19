export interface Tournament {
	id: string;
	name: string;
	slug?: string;
	startDate: Date;
	endDate: Date;
	location: string;
	teamIds: string[];
	ownerId?: string;
	matchDurationMinutes?: number;
}
