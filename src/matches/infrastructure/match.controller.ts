import { Request, Response } from "express";
import { MatchUseCases } from "../application/match.use-cases";
import {
  createMatchSchema,
  updateMatchSchema,
  addResultSchema,
  addMatchIncidentSchema,
} from "../domain/match.validator";
import { ZodError } from "zod";

export class MatchController {
  constructor(private readonly matchUseCases: MatchUseCases) { }

  async createMatch(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { roundId } = req.params;
      const matchData = createMatchSchema.parse(req.body);

      const newMatch = await this.matchUseCases.createMatch(
        roundId,
        matchData.teamAId,
        matchData.teamBId,
        new Date(matchData.date),
        user.id,
        user.role,
        matchData.placeId,
        matchData.refereeId,
        matchData.status,
      );

      res.status(201).json(newMatch);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error });
      } else if (error.message.includes("Unauthorized")) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }

  async getMatchesByTournament(req: Request, res: Response): Promise<void> {
    try {
      const { tournamentId } = req.params;
      const matches =
        await this.matchUseCases.getMatchesByTournament(tournamentId);
      res.json(matches);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getMatchesByReferee(req: Request, res: Response): Promise<void> {
    try {
      const { refereeId } = req.params;
      const matches = await this.matchUseCases.getMatchesByReferee(refereeId);
      res.json(matches);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getMatchById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const match = await this.matchUseCases.getMatchById(id);

      if (match) {
        res.json(match);
      } else {
        res.status(404).json({ message: "Match not found" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async addResultToMatch(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const result = addResultSchema.parse(req.body);
      const updatedMatch = await this.matchUseCases.addResultToMatch(
        id,
        result,
        user.id,
        user.role,
      );

      if (updatedMatch) {
        res.json(updatedMatch);
      } else {
        res.status(404).json({ message: "Match not found" });
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error });
      } else if (error.message.includes("Unauthorized")) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }

  async updateMatch(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const parsed = updateMatchSchema.parse(req.body);
      const {
        teamAId,
        teamBId,
        date,
        placeId,
        refereeId,
        status,
        result,
        incidents,
        notes,
      } = parsed;

      const updatedMatch = await this.matchUseCases.updateMatch(
        id,
        user.id,
        user.role,
        teamAId,
        teamBId,
        date ? new Date(date) : undefined,
        placeId,
        refereeId,
        status,
        result,
        incidents as any,
        notes,
      );

      console.log(
        "DEBUG: updateMatch updatedMatch result:",
        JSON.stringify(updatedMatch.result),
      );
      res.json({ ...updatedMatch, _debug: { result } });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error });
      } else if (error.message.includes("Unauthorized")) {
        res.status(403).json({ message: error.message });
      } else if (error.message === "Match not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }

  async addMatchIncident(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const incidentData = addMatchIncidentSchema.parse(req.body);

      const updatedMatch = await this.matchUseCases.addIncident(
        id,
        incidentData,
        user.id,
        user.role
      );

      res.json(updatedMatch);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error });
      } else if (error.message.includes("Unauthorized")) {
        res.status(403).json({ message: error.message });
      } else if (error.message === "Match not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }

  async deleteMatchIncident(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id, incidentId } = req.params;

      const updatedMatch = await this.matchUseCases.deleteIncident(
        id,
        incidentId,
        user.id,
        user.role
      );

      res.json(updatedMatch);
    } catch (error: any) {
      if (error.message.includes("Unauthorized")) {
        res.status(403).json({ message: error.message });
      } else if (error.message === "Match not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
  async deleteMatch(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      await this.matchUseCases.deleteMatch(id, user.id, user.role);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes("Unauthorized")) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
}
