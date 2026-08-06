import { Tournament } from "../domain/tournament";
import { TournamentRepository } from "../domain/tournament.repository";
import fs from "fs/promises";

const TOURNAMENTS_FILE_PATH = "./data/tournaments.json";

export class FileTournamentRepository implements TournamentRepository {
  async getAll(): Promise<Tournament[]> {
    try {
      const data = await fs.readFile(TOURNAMENTS_FILE_PATH, "utf-8");
      return JSON.parse(data) as Tournament[];
    } catch (error: any) {
      // If the file doesn't exist, return an empty array
      if (error && error?.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  async getTournamentsByOwner(ownerId: string): Promise<Tournament[]> {
    const tournaments = await this.getAll();
    return tournaments.filter((t) => t.ownerId === ownerId);
  }

  async save(tournament: Tournament): Promise<void> {
    const tournaments = await this.getAll();
    const index = tournaments.findIndex((t) => t.id === tournament.id);
    if (index === -1) {
      tournaments.push(tournament);
    } else {
      tournaments[index] = tournament;
    }
    await fs.writeFile(
      TOURNAMENTS_FILE_PATH,
      JSON.stringify(tournaments, null, 2)
    );
  }

  async findById(id: string): Promise<Tournament | null> {
    const tournaments = await this.getAll();
    const tournament = tournaments.find((t) => t.id === id);
    return tournament || null;
  }

  async update(tournament: Tournament): Promise<void> {
    const tournaments = await this.getAll();
    const index = tournaments.findIndex((t) => t.id === tournament.id);
    if (index !== -1) {
      tournaments[index] = tournament;
      await fs.writeFile(
        TOURNAMENTS_FILE_PATH,
        JSON.stringify(tournaments, null, 2)
      );
    }
  }

  async delete(id: string): Promise<void> {
    const tournaments = await this.getAll();
    const filteredTournaments = tournaments.filter((t) => t.id !== id);
    await fs.writeFile(
      TOURNAMENTS_FILE_PATH,
      JSON.stringify(filteredTournaments, null, 2)
    );
  }
}
