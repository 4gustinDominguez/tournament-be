import { MatchRepository } from "../../matches/domain/match.repository";
import { TeamRepository } from "../../teams/domain/team.repository";
import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";

export interface DashboardStats {
	tournaments: number;
	teams: number;
	players: number;
	matches: number;
}

export class DashboardUseCases {
	constructor(
		private readonly tournamentUseCases: TournamentUseCases,
		private readonly teamRepository: TeamRepository,
		private readonly matchRepository: MatchRepository,
	) {}

	async getStats(userId: string): Promise<DashboardStats> {
		const tournaments = await this.tournamentUseCases.getTournamentsByOwner(userId);
		const tournamentIds = tournaments.map((t) => t.id);

		const allTeams = await this.teamRepository.getAll();
		const teams =
			tournamentIds.length > 0
				? allTeams.filter((team) => team.tournaments.some((tid) => tournamentIds.includes(tid)))
				: [];

		const players = teams.reduce((total, team) => total + team.playerIds.length, 0);

		const matchesByTournament = await Promise.all(
			tournamentIds.map((tid) => this.matchRepository.getMatchesByTournament(tid)),
		);
		const matches = matchesByTournament.reduce((total, matches) => total + matches.length, 0);

		return {
			tournaments: tournaments.length,
			teams: teams.length,
			players,
			matches,
		};
	}
}
