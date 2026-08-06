import { Place } from "./place.entity";

export interface PlaceRepository {
    save(place: Place): Promise<void>;
    findAll(): Promise<Place[]>;
    findById(id: string): Promise<Place | null>;
    deleteById(id: string): Promise<void>;
}
