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

## Assigning the initial Super Admin

Public registration accepts `TOURNAMENT_ADMIN`, `REFEREE`, and `PLAYER`. It rejects
`SUPER_ADMIN`; a role sent by the client is never sufficient to grant system-wide access.

To promote the initial platform owner, first create an account normally and verify its email.
Then run this query in the trusted database SQL editor, replacing the example address:

```sql
SELECT id, email, role, email_verified
FROM users
WHERE email = 'owner@example.com';

UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'owner@example.com'
  AND email_verified = true
RETURNING id, email, role;
```

Check that the update returns exactly one row with the expected account and role. If it returns
no rows, confirm that the address exists and its email is verified. After promotion, sign out and
sign in again so the new role is included in the JWT. Database access for this operation must
remain restricted to trusted operators; do not expose it through public registration.
