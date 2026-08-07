import { Place } from "../domain/place.entity";
import { PlaceRepository } from "../domain/place.repository";

export class InMemoryPlaceRepository implements PlaceRepository {
	private places: Place[] = [];

	async save(place: Place): Promise<void> {
		const index = this.places.findIndex((p) => p.id === place.id);
		if (index === -1) {
			this.places.push(place);
		} else {
			this.places[index] = place;
		}
	}

	async findAll(): Promise<Place[]> {
		return this.places;
	}

	async findById(id: string): Promise<Place | null> {
		return this.places.find((p) => p.id === id) ?? null;
	}

	async deleteById(id: string): Promise<void> {
		this.places = this.places.filter((p) => p.id !== id);
	}
}
