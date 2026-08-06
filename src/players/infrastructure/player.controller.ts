import { Request, Response } from "express";
import { PlayerUseCases } from "../application/player.use-cases";
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "../domain/player.validator";
import { ZodError } from "zod";

export class PlayerController {
  constructor(private readonly playerUseCases: PlayerUseCases) {}

  async getAllPlayers(req: Request, res: Response): Promise<void> {
    try {
      const players = await this.playerUseCases.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Error fetching players" });
    }
  }

  async createPlayer(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createPlayerSchema.parse(req.body);
      const {
        name,
        nickname,
        teamId,
        position,
        height,
        weight,
        photoUrl,
        socialMedia,
        statistics,
      } = validatedData;

      const newPlayer = await this.playerUseCases.createPlayer(
        name,
        nickname,
        teamId,
        position,
        height,
        weight,
        photoUrl,
        socialMedia,
        statistics,
      );
      res.status(201).json(newPlayer);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error });
      } else {
        res.status(500).json({ message: "Error creating player" });
      }
    }
  }

  async getPlayerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const player = await this.playerUseCases.getPlayerById(id);
      if (player) {
        res.json(player);
      } else {
        res.status(404).json({ message: "Player not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching player" });
    }
  }

  async updatePlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = updatePlayerSchema.parse(req.body);
      const updatedPlayer = await this.playerUseCases.updatePlayer(id, updates);
      res.json(updatedPlayer);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error });
      } else if (error.message === "Player not found") {
        res.status(404).json({ message: "Player not found" });
      } else {
        res.status(500).json({ message: "Error updating player" });
      }
    }
  }

  async deletePlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.playerUseCases.deletePlayer(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Player not found") {
        res.status(404).json({ message: "Player not found" });
      } else {
        res.status(500).json({ message: "Error deleting player" });
      }
    }
  }
}
