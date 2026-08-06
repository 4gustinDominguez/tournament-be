import { Place } from "../domain/place.entity";
import { PlaceRepository } from "../domain/place.repository";
import { v4 as uuidv4 } from "uuid";
import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";

export class PlaceUseCases {
    constructor(
        private readonly placeRepository: PlaceRepository,
        private readonly tournamentUseCases?: TournamentUseCases
    ) { }

    async createPlace(name: string, tournamentId: string, requesterId: string, requesterRole: string, location?: string, capacity?: number): Promise<Place> {
        if (this.tournamentUseCases) {
            await this.tournamentUseCases.verifyTournamentOwnership(tournamentId, requesterId, requesterRole);
        }
        const newPlace: Place = {
            id: uuidv4(),
            name,
            tournamentId,
            location,
            capacity,
        };
        await this.placeRepository.save(newPlace);
        return newPlace;
    }

    async getAllPlaces(tournamentId?: string): Promise<Place[]> {
        const places = await this.placeRepository.findAll();
        if (tournamentId) {
            return places.filter(place => place.tournamentId === tournamentId);
        }
        return places;
    }
}
