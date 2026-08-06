import { Router } from 'express';
import { RoundController } from './round.controller';
import { RoundUseCases } from '../application/round.use-cases';
import { repositories } from '../../shared/infrastructure/repository.factory';
import { isAuthenticated, hasRole } from '../../auth/infrastructure/auth.middleware';
import { UserRole } from '../../auth/domain/user';
import { tournamentUseCases } from '../../tournaments/infrastructure/tournament.routes';

const router = Router();

// Repositories
const roundRepository = repositories.round;

// Use Cases
const roundUseCases = new RoundUseCases(roundRepository, tournamentUseCases);

// Controller
const roundController = new RoundController(roundUseCases);

// Routes
router.post('/tournaments/:tournamentId/rounds', isAuthenticated, hasRole([UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN]), roundController.createRound.bind(roundController));
router.get('/tournaments/:tournamentId/rounds', roundController.getRoundsByTournament.bind(roundController));

export default router;
