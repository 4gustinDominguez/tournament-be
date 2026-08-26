export class Place {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly tournamentId: string,
		public readonly location?: string,
		public readonly capacity?: number,
		public readonly latitude?: number,
		public readonly longitude?: number,
	) {}
}
