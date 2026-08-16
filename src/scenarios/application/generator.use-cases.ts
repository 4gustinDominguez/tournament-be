import { FixtureUseCases } from "../../fixtures/application/fixture.use-cases";
import { MatchUseCases } from "../../matches/application/match.use-cases";
import { PlaceUseCases } from "../../places/application/place.use-cases";
import { PlayerUseCases } from "../../players/application/player.use-cases";
import { RefereeUseCases } from "../../referees/application/referee.use-cases";
import { TeamUseCases } from "../../teams/application/team.use-cases";
import { TournamentUseCases } from "../../tournaments/application/tournament.use-cases";
import { Tournament } from "../../tournaments/domain/tournament";

export interface GenerationParams {
	tournamentName: string;
	startDate: Date;
	endDate: Date;
	teamsCount: number;
	playersPerTeam: number;
	placesCount: number;
	refereesCount: number;
	mode?: "random" | "guided";
}

export class GeneratorUseCases {
	constructor(
		private readonly tournamentUseCases: TournamentUseCases,
		private readonly teamUseCases: TeamUseCases,
		private readonly playerUseCases: PlayerUseCases,
		private readonly placeUseCases: PlaceUseCases,
		private readonly refereeUseCases: RefereeUseCases,
		private readonly fixtureUseCases: FixtureUseCases,
		private readonly matchUseCases: MatchUseCases,
	) {}

	async generate(
		params: GenerationParams,
		ownerId: string,
		ownerRole: string,
	): Promise<Tournament> {
		console.log("Starting tournament generation with mode:", params.mode ?? "random", params);

		// 1. Create Tournament
		const tournament = await this.tournamentUseCases.createTournament(
			params.tournamentName,
			params.startDate,
			params.endDate,
			ownerId,
		);
		console.log("Tournament created:", tournament.id);

		// 2. Create Teams
		const teamIds: string[] = [];
		for (let i = 0; i < params.teamsCount; i++) {
			const teamName = params.mode === "guided" ? `Team ${i + 1}` : this.getTeamName();
			console.log(`Creating team ${i + 1}/${params.teamsCount}: ${teamName}`);
			const team = await this.teamUseCases.createTeam(
				teamName,
				[],
				tournament.id,
				ownerId,
				ownerRole,
			);

			if (team) {
				teamIds.push(team.id);

				if (params.mode !== "guided") {
					// Create Players for this team (random mode only)
					for (let j = 0; j < params.playersPerTeam; j++) {
						await this.playerUseCases.createPlayer(
							`${this.getRandomFirstName()} ${this.getRandomLastName()} (${Math.random().toString(16).substring(2, 5).toUpperCase()})`,
							`Jugador ${j + 1}`,
							team.id,
							this.getRandomPosition(),
						);
					}
					console.log(`  Team ${team.name} created with ${params.playersPerTeam} players`);
				}
			}
		}
		console.log(`${teamIds.length} teams created`);

		// 3. Create Places (random mode only)
		const places: { id: string }[] = [];
		if (params.mode !== "guided") {
			for (let i = 0; i < params.placesCount; i++) {
				const place = await this.placeUseCases.createPlace(
					`Estadio ${this.getPlaceName()}`,
					tournament.id,
					ownerId,
					ownerRole,
					`Ubicación ${i + 1}`,
					5000 + i * 1000,
				);
				places.push(place);
			}
			console.log(`${places.length} places created`);

			// 4. Create Referees
			for (let i = 0; i < params.refereesCount; i++) {
				await this.refereeUseCases.createReferee(
					`${this.getRandomFirstName()} ${this.getRandomLastName()} (${Math.random().toString(16).substring(2, 5).toUpperCase()})`,
					[tournament.id],
					ownerId,
					ownerRole,
				);
			}
			console.log(`${params.refereesCount} referees created`);
		}

		// 5. Generate Fixtures (random mode only)
		if (params.mode !== "guided") {
			console.log("Generating fixtures...");
			await this.fixtureUseCases.generateRoundRobin(tournament.id, ownerId, ownerRole);
			console.log("Fixtures generated");

			// 6. Smart Assignment: Assign Places and Referees to matches
			console.log("Assigning places and referees to matches...");
			const matches = await this.matchUseCases.getMatchesByTournament(tournament.id);
			const referees = await this.refereeUseCases.getRefereesByTournament(tournament.id);
			for (let i = 0; i < matches.length; i++) {
				const match = matches[i];
				const assignedPlace = places.length > 0 ? places[i % places.length] : undefined;
				const assignedReferee = referees.length > 0 ? referees[i % referees.length] : undefined;

				if (assignedPlace || assignedReferee) {
					await this.matchUseCases.updateMatch(
						match.id,
						ownerId,
						ownerRole,
						undefined,
						undefined,
						undefined,
						assignedPlace?.id,
						assignedReferee?.id,
					);
				}
			}
			console.log("Assignments complete");
		}

		return tournament;
	}

	private getTeamName(): string {
		const prefixes = ["Real", "Atlético", "Sporting", "Deportivo", "FC", "CF", "Unión", "Racing"];
		const cities = [
			"Madrid",
			"Barcelona",
			"Valencia",
			"Sevilla",
			"Bilbao",
			"Málaga",
			"Zaragoza",
			"Gijón",
			"Vigo",
			"A Coruña",
			"Palma",
		];
		const animals = ["Leones", "Tigres", "Águilas", "Lobos", "Halcones", "Dragones", "Rayos"];

		const useAnimal = Math.random() > 0.5;
		if (useAnimal) {
			return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
		}

		return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${cities[Math.floor(Math.random() * cities.length)]}`;
	}

	private getPlaceName(): string {
		const names = [
			"Santiago Bernabéu",
			"Camp Nou",
			"Metropolitano",
			"Mestalla",
			"Sánchez-Pizjuán",
			"San Mamés",
			"La Rosaleda",
			"La Romareda",
			"El Molinón",
			"Balaídos",
			"Riazor",
			"Son Moix",
		];

		return names[Math.floor(Math.random() * names.length)];
	}

	private getRandomFirstName(): string {
		const names = [
			"Juan",
			"José",
			"Luis",
			"Carlos",
			"Manuel",
			"Javier",
			"David",
			"Andrés",
			"Sergio",
			"Diego",
			"Mateo",
			"Leonardo",
			"Adrián",
			"Iker",
			"Lucas",
		];

		return names[Math.floor(Math.random() * names.length)];
	}

	private getRandomLastName(): string {
		const lastNames = [
			"García",
			"Rodríguez",
			"González",
			"Fernández",
			"López",
			"Martínez",
			"Sánchez",
			"Pérez",
			"Gómez",
			"Martín",
			"Jiménez",
			"Ruiz",
			"Hernández",
			"Díaz",
			"Moreno",
		];

		return lastNames[Math.floor(Math.random() * lastNames.length)];
	}

	private getRandomPosition(): string {
		const positions = [
			"Portero",
			"Defensa Central",
			"Lateral Izquierdo",
			"Lateral Derecho",
			"Mediocentro",
			"Extremo",
			"Delantero Centro",
		];

		return positions[Math.floor(Math.random() * positions.length)];
	}
}
