export interface Tournament {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
	location: string;
	teamIds: string[];
	ownerId?: string; // ID of the user who owns this tournament
}
