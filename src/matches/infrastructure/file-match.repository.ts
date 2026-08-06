import { Match, MatchResult } from "../domain/match";
import { MatchRepository } from "../domain/match.repository";
import * as fs from "fs/promises";
import * as path from "path";

export class FileMatchRepository implements MatchRepository {
  private readonly dbPath = path.join(__dirname, "../../../data/matches.json");

  private async readDb(): Promise<Match[]> {
    try {
      const data = await fs.readFile(this.dbPath, "utf-8");
      return JSON.parse(data) as Match[];
    } catch (error: any) {
      // If the file doesn't exist, return an empty array
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  private async writeDb(matches: Match[]): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(matches, null, 2));
  }

  async createMatch(match: Match): Promise<Match> {
    const matches = await this.readDb();
    matches.push(match);
    await this.writeDb(matches);
    return match;
  }

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    const matches = await this.readDb();
    return matches.filter((match) => match.tournamentId === tournamentId);
  }

  async getMatchesByReferee(refereeId: string): Promise<Match[]> {
    const matches = await this.readDb();
    return matches.filter((match) => match.refereeId === refereeId);
  }

  async getMatchById(id: string): Promise<Match | null> {
    const matches = await this.readDb();
    return matches.find((match) => match.id === id) || null;
  }

  async addResultToMatch(id: string, result: MatchResult): Promise<Match | null> {
    const matches = await this.readDb();
    const matchIndex = matches.findIndex((match) => match.id === id);
    if (matchIndex === -1) {
      return null;
    }
    matches[matchIndex].result = result;
    await this.writeDb(matches);
    return matches[matchIndex];
  }

  async updateMatch(match: Match): Promise<void> {
    const matches = await this.readDb();
    const index = matches.findIndex((m) => m.id === match.id);
    if (index !== -1) {
      matches[index] = match;
      await this.writeDb(matches);
    }
  }

  async deleteMatch(id: string): Promise<void> {
    const matches = await this.readDb();
    const filteredMatches = matches.filter((m) => m.id !== id);
    await this.writeDb(filteredMatches);
  }
}
