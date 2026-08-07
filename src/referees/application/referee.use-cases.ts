import { v4 as uuid } from "uuid";

import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";
import { Referee } from "../domain/referee";
import { RefereeRepository } from "../domain/referee.repository";

export class RefereeUseCases {
	constructor(
		private readonly refereeRepository: RefereeRepository,
		private readonly tournamentUseCases?: TournamentUseCases,
	) {}

	async createReferee(
		name: string,
		tournamentIds: string[],
		requesterId: string,
		requesterRole: string,
		userId?: string,
	): Promise<Referee> {
		if (this.tournamentUseCases && tournamentIds.length > 0) {
			// Check ownership of ALL tournaments
			for (const tournamentId of tournamentIds) {
				await this.tournamentUseCases.verifyTournamentOwnership(
					tournamentId,
					requesterId,
					requesterRole,
				);
			}
		}
		const referee: Referee = {
			id: uuid(),
			name,
			tournamentIds,
			userId,
		};
		await this.refereeRepository.save(referee);

		return referee;
	}

	async getRefereesByTournament(tournamentId: string): Promise<Referee[]> {
		return this.refereeRepository.findByTournamentId(tournamentId);
	}

	async getAllReferees(): Promise<Referee[]> {
		return this.refereeRepository.findAll();
	}

	async getRefereeByUserId(userId: string): Promise<Referee | null> {
		return this.refereeRepository.findByUserId(userId);
	}

	async updateReferee(
		id: string,
		name: string,
		tournamentIds: string[],
		requesterId: string,
		requesterRole: string,
		userId?: string,
	): Promise<Referee> {
		const referee = await this.refereeRepository.findById(id);
		if (!referee) {
			throw new Error("Referee not found");
		}

		if (this.tournamentUseCases) {
			// 1. Check ownership of newly added tournaments
			const addedTournaments = tournamentIds.filter((tid) => !referee.tournamentIds.includes(tid));
			for (const tid of addedTournaments) {
				await this.tournamentUseCases.verifyTournamentOwnership(tid, requesterId, requesterRole);
			}

			// 2. Check ownership of removed tournaments
			const removedTournaments = referee.tournamentIds.filter(
				(tid) => !tournamentIds.includes(tid),
			);
			for (const tid of removedTournaments) {
				await this.tournamentUseCases.verifyTournamentOwnership(tid, requesterId, requesterRole);
			}

			// 3. If other fields changed, verify profile management permission
			if (name !== referee.name || userId !== referee.userId) {
				// To edit profile, user must own at least one of the referee's tournaments (old or new)
				let hasPermission = false;
				if (requesterRole === "SUPER_ADMIN") {
					hasPermission = true;
				} else {
					const allRelevantTournaments = Array.from(
						new Set([...referee.tournamentIds, ...tournamentIds]),
					);
					for (const tid of allRelevantTournaments) {
						try {
							await this.tournamentUseCases.verifyTournamentOwnership(
								tid,
								requesterId,
								requesterRole,
							);
							hasPermission = true;
							break;
						} catch (_e) {
							// Continue to check other tournaments
						}
					}
				}
				if (!hasPermission) {
					throw new Error(
						"Unauthorized: You do not have permission to edit this referee's profile",
					);
				}
			}
		}
		referee.name = name;
		referee.tournamentIds = tournamentIds;
		referee.userId = userId;
		await this.refereeRepository.save(referee);

		return referee;
	}

	async deleteReferee(id: string, requesterId: string, requesterRole: string): Promise<void> {
		const referee = await this.refereeRepository.findById(id);
		if (!referee) {
			throw new Error("Referee not found");
		}

		if (this.tournamentUseCases && referee.tournamentIds.length > 0) {
			// To delete a referee, user must own ALL tournaments they are currently in
			for (const tournamentId of referee.tournamentIds) {
				await this.tournamentUseCases.verifyTournamentOwnership(
					tournamentId,
					requesterId,
					requesterRole,
				);
			}
		}

		await this.refereeRepository.deleteById(id);
	}
}
