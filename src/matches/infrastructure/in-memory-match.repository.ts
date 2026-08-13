import { Match, MatchResult } from "../domain/match";
import { MatchRepository } from "../domain/match.repository";

export class InMemoryMatchRepository implements MatchRepository {
	private matches: Match[] = [];

	async createMatch(match: Match): Promise<Match> {
		this.matches.push(match);

		return match;
	}

	async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
		return this.matches.filter((match) => match.tournamentId === tournamentId);
	}

	async getMatchesByReferee(refereeId: string): Promise<Match[]> {
		return this.matches.filter((match) => match.refereeId === refereeId);
	}

	async getMatchesByTeamIds(teamIds: string[]): Promise<Match[]> {
		return this.matches.filter(
			(match) => teamIds.includes(match.teamAId) || teamIds.includes(match.teamBId),
		);
	}

	async getMatchById(id: string): Promise<Match | null> {
		return this.matches.find((match) => match.id === id) ?? null;
	}

	async addResultToMatch(id: string, result: MatchResult): Promise<Match | null> {
		const match = this.matches.find((m) => m.id === id);
		if (!match) {
			return null;
		}
		match.result = result;

		return match;
	}

	async updateMatch(match: Match): Promise<void> {
		const index = this.matches.findIndex((m) => m.id === match.id);
		if (index !== -1) {
			this.matches[index] = match;
		}
	}

	async deleteMatch(id: string): Promise<void> {
		this.matches = this.matches.filter((m) => m.id !== id);
	}
}
