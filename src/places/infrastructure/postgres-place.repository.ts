import { Pool } from "pg";

import { Place } from "../domain/place.entity";
import { PlaceRepository } from "../domain/place.repository";

export class PostgresPlaceRepository implements PlaceRepository {
	constructor(private readonly pool: Pool) {}

	async save(place: Place): Promise<void> {
		await this.pool.query(
			`INSERT INTO places (id, name, tournament_id, location, capacity, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         tournament_id = EXCLUDED.tournament_id,
         location = EXCLUDED.location,
         capacity = EXCLUDED.capacity,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude`,
			[
				place.id,
				place.name,
				place.tournamentId,
				place.location,
				place.capacity,
				place.latitude,
				place.longitude,
			],
		);
	}

	async findAll(): Promise<Place[]> {
		const { rows } = await this.pool.query("SELECT * FROM places");

		return rows.map(
			(r) =>
				new Place(r.id, r.name, r.tournament_id, r.location, r.capacity, r.latitude, r.longitude),
		);
	}

	async findById(id: string): Promise<Place | null> {
		const { rows } = await this.pool.query("SELECT * FROM places WHERE id = $1", [id]);

		return rows[0]
			? new Place(
					rows[0].id,
					rows[0].name,
					rows[0].tournament_id,
					rows[0].location,
					rows[0].capacity,
					rows[0].latitude,
					rows[0].longitude,
				)
			: null;
	}

	async deleteById(id: string): Promise<void> {
		await this.pool.query("DELETE FROM places WHERE id = $1", [id]);
	}
}
