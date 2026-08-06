import { Referee } from "./referee";

export interface RefereeRepository {
    save(referee: Referee): Promise<void>;
    findById(id: string): Promise<Referee | null>;
    findByTournamentId(tournamentId: string): Promise<Referee[]>;
    findByUserId(userId: string): Promise<Referee | null>;
    findAll(): Promise<Referee[]>;
    deleteById(id: string): Promise<void>;
}
