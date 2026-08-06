import { Round } from "../domain/round";
import { RoundRepository } from "../domain/round.repository";
import { MatchRepository } from "../../matches/domain/match.repository";
import { v4 as uuid } from "uuid";
import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";

export class RoundUseCases {
    constructor(
        private readonly roundRepository: RoundRepository,
        private readonly tournamentUseCases?: TournamentUseCases,
        private readonly matchRepository?: MatchRepository
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

    async deleteRound(id: string, requesterId: string, requesterRole: string): Promise<void> {
        const round = await this.roundRepository.getRoundById(id);
        if (!round) {
            throw new Error("Round not found");
        }

        if (this.tournamentUseCases) {
            await this.tournamentUseCases.verifyTournamentOwnership(round.tournamentId, requesterId, requesterRole);
        }

        if (this.matchRepository) {
            const matches = await this.matchRepository.getMatchesByTournament(round.tournamentId);
            const hasMatches = matches.some((match) => match.roundId === id);
            if (hasMatches) {
                throw new Error("Cannot delete round with existing matches");
            }
        }

        await this.roundRepository.deleteRound(id);
    }
}
