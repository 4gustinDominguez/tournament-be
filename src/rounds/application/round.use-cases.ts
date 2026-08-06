import { Round } from "../domain/round";
import { RoundRepository } from "../domain/round.repository";
import { v4 as uuid } from "uuid";
import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";

export class RoundUseCases {
    constructor(
        private readonly roundRepository: RoundRepository,
        private readonly tournamentUseCases?: TournamentUseCases
    ) { }

    async createRound(
        tournamentId: string,
        name: string,
        requesterId: string,
        requesterRole: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<Round> {
        if (this.tournamentUseCases) {
            await this.tournamentUseCases.verifyTournamentOwnership(tournamentId, requesterId, requesterRole);
        }
        const newRound: Round = {
            id: uuid(),
            tournamentId,
            name,
            startDate,
            endDate
        };

        return this.roundRepository.createRound(newRound);
    }

    async getRoundsByTournament(tournamentId: string): Promise<Round[]> {
        return this.roundRepository.getRoundsByTournament(tournamentId);
    }
}
