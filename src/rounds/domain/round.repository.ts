import { Round } from "./round";

export interface RoundRepository {
    createRound(round: Round): Promise<Round>;
    getRoundsByTournament(tournamentId: string): Promise<Round[]>;
    getRoundById(id: string): Promise<Round | null>;
}
