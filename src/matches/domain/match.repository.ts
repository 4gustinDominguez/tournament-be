import { Match, MatchResult } from "./match";

export interface MatchRepository {
  createMatch(match: Match): Promise<Match>;
  getMatchesByTournament(tournamentId: string): Promise<Match[]>;
  getMatchesByReferee(refereeId: string): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | null>;
  addResultToMatch(id: string, result: MatchResult): Promise<Match | null>;
  updateMatch(match: Match): Promise<void>;
  deleteMatch(id: string): Promise<void>;
}
