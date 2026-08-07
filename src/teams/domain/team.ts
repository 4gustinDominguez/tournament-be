import { Player } from "../../players/domain/player";

export interface Team {
	id: string;
	name: string;
	playerIds: string[];
	logo?: string;
	tournaments: string[];
	player?: Player[];
	placeId?: string;
	coach?: string;
	crestUrl?: string;
	kitColor?: string;
}
