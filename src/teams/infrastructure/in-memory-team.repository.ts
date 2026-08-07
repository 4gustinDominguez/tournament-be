import { Team } from "../domain/team";
import { TeamRepository } from "../domain/team.repository";

export class InMemoryTeamRepository implements TeamRepository {
	private teams: Team[] = [];

	async getAll(): Promise<Team[]> {
		return this.teams;
	}

	async save(team: Team): Promise<void> {
		const index = this.teams.findIndex((t) => t.id === team.id);
		if (index === -1) {
			this.teams.push(team);
		} else {
			this.teams[index] = team;
		}
	}

	async findById(id: string): Promise<Team | null> {
		return this.teams.find((t) => t.id === id) ?? null;
	}

	async deleteById(id: string): Promise<void> {
		this.teams = this.teams.filter((t) => t.id !== id);
	}
}
