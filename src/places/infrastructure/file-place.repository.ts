import fs from "fs/promises";
import path from "path";

import { Place } from "../domain/place.entity";
import { PlaceRepository } from "../domain/place.repository";

const PLACES_FILE_PATH = "./data/places.json";

export class FilePlaceRepository implements PlaceRepository {
	private async ensureDataFile() {
		try {
			await fs.access(PLACES_FILE_PATH);
		} catch {
			await fs.mkdir(path.dirname(PLACES_FILE_PATH), { recursive: true });
			await fs.writeFile(PLACES_FILE_PATH, "[]");
		}
	}

	async findAll(): Promise<Place[]> {
		await this.ensureDataFile();
		try {
			const data = await fs.readFile(PLACES_FILE_PATH, "utf-8");

			return JSON.parse(data) as Place[];
		} catch (error: any) {
			if (error && error?.code === "ENOENT") {
				return [];
			}
			throw error;
		}
	}

	async save(place: Place): Promise<void> {
		await this.ensureDataFile();
		const places = await this.findAll();
		const index = places.findIndex((p) => p.id === place.id);
		if (index === -1) {
			places.push(place);
		} else {
			places[index] = place;
		}
		await fs.writeFile(PLACES_FILE_PATH, JSON.stringify(places, null, 2));
	}

	async findById(id: string): Promise<Place | null> {
		const places = await this.findAll();
		const place = places.find((p) => p.id === id);

		return place ?? null;
	}

	async deleteById(id: string): Promise<void> {
		const places = await this.findAll();
		const filteredPlaces = places.filter((p) => p.id !== id);
		await fs.writeFile(PLACES_FILE_PATH, JSON.stringify(filteredPlaces, null, 2));
	}
}
