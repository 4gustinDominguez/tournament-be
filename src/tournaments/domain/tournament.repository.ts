import { Tournament } from "./tournament";

export interface TournamentRepository {
	getAll(): Promise<Tournament[]>;
	save(tournament: Tournament): Promise<void>;
	findById(id: string): Promise<Tournament | null>;
	update(tournament: Tournament): Promise<void>;
	delete(id: string): Promise<void>;
	getTournamentsByOwner(ownerId: string): Promise<Tournament[]>;
}
