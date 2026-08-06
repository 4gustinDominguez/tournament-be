import { MatchUseCases } from "../../matches/application/match.use-cases";
import { RoundUseCases } from "../../rounds/application/round.use-cases";
import { TournamentRepository } from "../../tournaments/domain/tournament.repository";

export class FixtureUseCases {
  constructor(
    private readonly tournamentRepository: TournamentRepository,
    private readonly roundUseCases: RoundUseCases,
    private readonly matchUseCases: MatchUseCases,
  ) { }

  async generateRoundRobin(tournamentId: string, requesterId: string, requesterRole: string): Promise<void> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const teamIds = [...tournament.teamIds];
    if (teamIds.length < 2) {
      throw new Error("At least 2 teams are required to generate a fixture");
    }

    // If odd number of teams, add a dummy team for "BYE"
    const hasBye = teamIds.length % 2 !== 0;
    if (hasBye) {
      teamIds.push("BYE");
    }

    const numTeams = teamIds.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    const startDate = new Date(tournament.startDate);

    for (let roundIdx = 0; roundIdx < numRounds; roundIdx++) {
      const roundName = `Jornada ${roundIdx + 1}`;
      const roundDate = new Date(startDate);
      roundDate.setDate(startDate.getDate() + roundIdx * 7); // 1 week interval

      const round = await this.roundUseCases.createRound(
        tournamentId,
        roundName,
        requesterId,
        requesterRole,
        roundDate,
      );

      for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
        const homeIdx = (roundIdx + matchIdx) % (numTeams - 1);
        let awayIdx = (numTeams - 1 - matchIdx + roundIdx) % (numTeams - 1);

        if (matchIdx === 0) {
          awayIdx = numTeams - 1;
        }

        const teamAId = teamIds[homeIdx];
        const teamBId = teamIds[awayIdx];

        // Skip match if it involves the BYE team
        if (teamAId === "BYE" || teamBId === "BYE") {
          continue;
        }

        // Alternate home/away for the fixed team (last one) to balance
        if (matchIdx === 0 && roundIdx % 2 === 1) {
          await this.matchUseCases.createMatch(
            round.id,
            teamBId,
            teamAId,
            roundDate,
            requesterId,
            requesterRole,
          );
        } else {
          await this.matchUseCases.createMatch(
            round.id,
            teamAId,
            teamBId,
            roundDate,
            requesterId,
            requesterRole,
          );
        }
      }
    }
  }
}
