import { Team } from "./team";

export interface TeamRepository {
  getAll(): Promise<Team[]>;
  save(team: Team): Promise<void>;
  findById(id: string): Promise<Team | null>;
  deleteById(id: string): Promise<void>;
}
