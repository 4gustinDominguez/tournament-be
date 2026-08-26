import { v4 as uuidv4 } from "uuid";

import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";
import { Place } from "../domain/place.entity";
import { PlaceRepository } from "../domain/place.repository";

export class PlaceUseCases {
	constructor(
		private readonly placeRepository: PlaceRepository,
		private readonly tournamentUseCases?: TournamentUseCases,
	) {}

	async createPlace(
		name: string,
		tournamentId: string,
		requesterId: string,
		requesterRole: string,
		location?: string,
		capacity?: number,
		latitude?: number,
		longitude?: number,
	): Promise<Place> {
		if (this.tournamentUseCases) {
			await this.tournamentUseCases.verifyTournamentOwnership(
				tournamentId,
				requesterId,
				requesterRole,
			);
		}
		const newPlace: Place = {
			id: uuidv4(),
			name,
			tournamentId,
			location,
			capacity,
			latitude,
			longitude,
		};
		await this.placeRepository.save(newPlace);

		return newPlace;
	}

	async updatePlace(
		id: string,
		requesterId: string,
		requesterRole: string,
		updates: {
			name?: string;
			location?: string;
			capacity?: number;
			latitude?: number;
			longitude?: number;
		},
	): Promise<Place> {
		const existing = await this.placeRepository.findById(id);
		if (!existing) {
			throw new Error("Place not found");
		}

		if (this.tournamentUseCases) {
			await this.tournamentUseCases.verifyTournamentOwnership(
				existing.tournamentId,
				requesterId,
				requesterRole,
			);
		}

		const updated: Place = {
			...existing,
			...Object.fromEntries(
				(Object.entries(updates) as [string, unknown][]).filter(([, v]) => v !== undefined),
			),
		};
		await this.placeRepository.save(updated);

		return updated;
	}

	async getAllPlaces(tournamentId?: string): Promise<Place[]> {
		const places = await this.placeRepository.findAll();
		if (tournamentId) {
			return places.filter((place) => place.tournamentId === tournamentId);
		}

		return places;
	}

	async deletePlace(id: string, requesterId: string, requesterRole: string): Promise<void> {
		const place = await this.placeRepository.findById(id);
		if (!place) {
			throw new Error("Place not found");
		}

		if (this.tournamentUseCases) {
			await this.tournamentUseCases.verifyTournamentOwnership(
				place.tournamentId,
				requesterId,
				requesterRole,
			);
		}

		await this.placeRepository.deleteById(id);
	}
}
