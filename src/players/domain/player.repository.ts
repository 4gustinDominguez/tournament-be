import { Player } from "./player";

export interface PlayerRepository {
	getAll(): Promise<Player[]>;
	save(player: Player): Promise<void>;
	findById(id: string): Promise<Player | null>;
	update(player: Player): Promise<void>;
	delete(id: string): Promise<void>;
}
