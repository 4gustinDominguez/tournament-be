# Roles and Permissions

System roles and their capabilities. RBAC is implemented in the backend (`src/auth/infrastructure/auth.middleware.ts`).

## Roles

| Role | Scope | MVP status |
|------|-------|------------|
| `SUPER_ADMIN` | Manages every tournament, team, referee and venue in the system | ✅ Implemented |
| `TOURNAMENT_ADMIN` | Manages their own tournaments (owner) and everything attached to them | ✅ Implemented |
| `REFEREE` | Sees their assigned matches and reports results | ✅ Implemented |
| `TEAM_ADMIN` | Manages their team roster | 🚧 Future |
| `PLAYER` | Manages their own profile | 🚧 Future |

## Capabilities matrix

| Action | Super Admin | Tournament Admin | Referee | Team Admin* | Player* | Public |
|--------|-------------|------------------|---------|-------------|---------|--------|
| View tournament | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/edit tournament | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Register teams | ✅ | ✅ (own) | ❌ | ✅ (own team) | ❌ | ❌ |
| Create venues/referees | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Generate fixtures | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Assign venue/referee to match | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Report result | ✅ | ✅ (own) | ✅ (assigned) | ❌ | ❌ | ❌ |
| View standings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage roster | ✅ | ✅ (own) | ❌ | ✅ (own team) | ❌ | ❌ |

\* Future roles: the architecture must allow adding them without a redesign.

## Key rules for the MVP
1. **Ownership**: a `TOURNAMENT_ADMIN` only manages tournaments where they are `ownerId`.
2. **Referee**: can only modify matches where they are assigned as `refereeId`.
3. **Public**: read-only access to the tournament landing; never sees admin actions or dashboard links.
4. **Super Admin**: full access as system fallback/administration.
