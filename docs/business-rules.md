# Business Rules

Business rules of the system and their current state in the code. This document records domain decisions and the related technical debt so they are clear from the start and do not get lost.

## Agreed rules (MVP)

1. **A team can belong to several tournaments.**
2. **A player can belong to several teams, but only in different tournaments**
   (they cannot be in two teams of the same tournament).
3. **A referee can belong to several tournaments.**
4. **A manager (Tournament Admin) can manage several tournaments.**

### Rules deliberately NOT enforced (for now)

- No schedule conflict detection: a team can have matches at the same time or with overlapping dates. To be evaluated later.
- Rule 2 (player in two teams of the same tournament) is not actively validated.

## State in the code

| Rule | Model support | Detail |
|-------|---------------|--------|
| 1. Team in several tournaments | ✅ `team.tournaments: string[]` | `createTeam` forces `tournaments: [tournamentId]` (single tournament). `updateTeam`/`deleteTeam` only check ownership over `team.tournaments[0]` |
| 2. Player in several teams (different tournaments) | ⚠️ Ambiguous model | The player hangs from `team.playerIds` (no own `teamId`). `player.tournaments` is initialized to `[]` and **never populated** |
| 3. Referee in several tournaments | ✅ `referee.tournamentIds: string[]` | Supports multiple tournaments without issues |
| 4. Manager handles several tournaments | ✅ `tournament.ownerId` + `getTournamentsByOwner` | `user.ownedTournaments` is initialized to `[]` and **never synced** |

## Known consequences and debt

### 1. Derived rule not validated (player in two teams of the same tournament)
If rule 2 is accepted, a player **cannot be on two teams sharing a tournament**. Today `addPlayer` (`src/teams/application/team.use-cases.ts`) adds a player to any team without checking the intersection of tournaments between the player's teams and the target team.
**Future location of the validation**: `TeamUseCases.addPlayer` / `createPlayer`.
Requires walking `team.playerIds → team.tournaments` and rejecting on intersection.

### 2. Global roster per team (rules 1 + 2)
If a team belongs to several tournaments, its roster (`playerIds`) is shared across all of them. There is no per-tournament roster.
**Decision to confirm**: global roster (same in every league) or per-tournament roster? For the MVP the global one is assumed (simpler). A per-tournament roster would be a model change (e.g. `playerIdsByTournament` or a `TeamRoster` entity).

### 3. Ownership of shared entities
`updateTeam` and `deleteTeam` only check ownership over `team.tournaments[0]`. If a team shares tournaments with different managers, any of them could edit/delete it.
**Decision**: accepted for the MVP (single-admin/demo environments). Revisit when real cross-owner tournaments exist.

### 4. Dead data
- `player.tournaments` is never populated. It can be derived from `team.playerIds → team.tournaments`.
- `user.ownedTournaments` is never synced. The source of truth is `tournament.ownerId`.
**Action**: remove these fields or sync them when the domain is touched.

### 5. Player name uniqueness (collides with rule 2)
`createPlayer` rejects a player if another with the same name exists (`player.use-cases.ts`, error "Player already exists"). Problems it causes:
- Common names ("Juan Perez") would be rejected.
- For a player to be in several teams/tournaments the same player entity must be reused, not duplicated.
**Future action**: remove or relax name uniqueness (e.g. allow duplicates, or unique per `(name, team)`).

## How these rules are exercised on the happy path
- The MVP flow creates teams and players within a single tournament, so rules 1, 2 and 3 are not stressed on the happy path.
- Rule 4 (multi-tournament) is the most visible one: an admin must be able to create and list multiple tournaments (already verified: `getTournamentsByOwner`).
