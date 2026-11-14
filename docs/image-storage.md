# Image Storage — Decision Log

## Status: ✅ IMPLEMENTED (2026-08-08) — Cloudinary in use

---

## Options Considered

| Option | Cost | Pros | Cons |
|---|---|---|---|
| External URLs only | Free | Simple | Links break, no control, 3rd party dependency |
| S3/R2/Cloudflare | Free tier varies | Full control, scalable | More infra work (presigned URLs, cleanup) |
| Cloudinary ⭐ | **Free tier**: 25GB storage + 25GB bandwidth/mo | Very easy integration, CDN, auto-optimization (WebP/AVIF), transformations via URL | Vendor lock-in, limits on free tier at scale |
| Supabase Storage | Free: 1GB storage + 2GB bandwidth/mo | Simple | Very limited for MVP |
| Local server storage | Free | Simple | Hard to scale, no CDN, space management |
| Hybrid (URL + upload) | Varies | Maximum flexibility | More UI/complexity |

---

## Decision

**Cloudinary** (free tier) for the MVP.

Rationale:
- Zero cost for MVP (25GB storage + 25GB bandwidth).
- Unsigned upload preset (`ml_tournament`) — no backend proxy, no API key exposure.
- CDN + automatic optimization (WebP/AVIF).
- Transformations via URL.
- 3 asset types: **team crests** (predefined SVGs), **player photos** and **referee photos** (user upload).

---

## Implementation (2026-08-08)

### Stack
- **Cloudinary free tier**, upload preset `ml_tournament` (unsigned).
- **`cloudinary` SDK** in this backend; `next/image` in the frontend.
- **`ImageStoragePort`** (domain interface, `src/shared/domain/`) + **`CloudinaryImageStorageAdapter`** (infrastructure). Ready for a swap to S3/R2 in the future.
- **3 asset kinds** managed in the DB:
  - Teams: `crestUrl` is a **crest ID** (string, e.g. `"shield"`, `"star"`). 10 predefined SVGs in the frontend repo (`public/crests/`). No uploads.
  - Players: `photoUrl` absolute Cloudinary URL uploaded by the tournament admin.
  - Referees: `photoUrl` absolute Cloudinary URL uploaded by the **referee themselves** (self-service, `/manage/referee`).

### Frontend (separate repo)
- **`PhotoUpload`** (`src/components/`):
  - `<input type="file" capture="environment">` (mobile-first).
  - Validation: 5MB max, JPG/PNG/WebP.
  - `deferUpload` prop: when `true` it only keeps the local `File` and shows a preview; the parent component calls `uploadImage(file, folder)` on confirm (avoids orphan uploads to Cloudinary if the user cancels).
- **`CrestPicker`** (`src/components/`): grid of 10 predefined SVGs. Replaced the free-text input that validated as URL.
- **`TeamCrest`** (`src/components/`): receives a crest ID and renders the matching SVG; falls back to the team initial when there is no crest.
- **`imageService.uploadImage(file, folder)`** (`src/services/`): POST to Cloudinary's unsigned endpoint with `formData` + `upload_preset`.

### Backend
- **`ImageStoragePort`** (`src/shared/domain/image-storage.port.ts`): `upload(file): Promise<{ url }>`.
- **`CloudinaryImageStorageAdapter`** (`src/shared/infrastructure/`): uses `cloudinary.uploader.upload_stream`; folder per type (`teams/`, `players/`, `referees/`).
- **`postgres-player.repository.ts`** and **`postgres-referee.repository.ts`**: added `photo_url` columns via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for idempotency.
- **Validators**: `photoUrl` now accepts `null` in `updatePlayerSchema`, `updateRefereeSchema`, etc. (controller converts `null → undefined`).

### Referee self-service
- `POST /referees` only persists `name` + `tournamentIds` (no `photoUrl`).
- The authenticated referee uploads their photo from `/manage/referee` with an explicit Save (no autosave) to avoid orphan uploads.
- `PUT /referees/:id` now allows role `REFEREE` (previously only `SUPER_ADMIN` and `TOURNAMENT_ADMIN`); the use case detects self-update via `referee.userId === requesterId` and skips tournament ownership checks.

### Configuration
- **`.env.example`** includes `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (all three are only needed for signed uploads; with an unsigned preset the cloud name is enough).
- **Deployment config** passes the 3 vars to the API service.
- **Frontend `next.config.mjs`** includes `res.cloudinary.com` in `images.remotePatterns` so `next/image` can serve the photos.

### i18n
- Keys `Referee.photo`, `RefereeSection.*`, `Referees.editReferee` in `en.json` and `es.json`.

### Verified
- `pnpm build` + `pnpm test` + `pnpm lint` green in both repos.
- Manual smoke test: referee photo upload works end-to-end; the image appears on `/manage/referee` and on `RefereeSection` cards.

---

## Future tasks (out of current scope)

- [x] Configure automatic cleanup of old images on entity update → no; for now replaced images stay in Cloudinary (not blocking for the MVP).
- [ ] Add place/location image upload (`photoUrl` column in the `places` table is not used yet).
- [ ] Add `User.avatarUrl` (mentioned in the type table, not implemented).
- [ ] Migrate to signed uploads (required for programmatic `delete` from the backend).

---

## Image Types

| Entity | Field | Source | Status |
|---|---|---|---|
| Team | `crestUrl` (ID) | Predefined SVGs (10) | ✅ |
| Player | `photoUrl` (URL) | Cloudinary upload (admin) | ✅ |
| Referee | `photoUrl` (URL) | Cloudinary upload (self-service) | ✅ |
| Place | `photoUrl` (URL) | — | ❌ not implemented |
| User | `avatarUrl` (URL) | — | ❌ not implemented |

---

## Technical Notes

- **Upload flow**: client → Cloudinary (unsigned preset) → URL stored in DB.
- **Direct unsigned uploads** require no backend authentication; the moderation/abuse concern lives in Cloudinary (preset config).
- **Transformation URL pattern**: `https://res.cloudinary.com/{cloud}/image/upload/w_200,h_200,c_fill/{public_id}` (unused so far; `next/image` covers the current needs).
- **Fallback**: `TeamCrest` draws the name initial when there is no crestId.
- **DB**: the `photo_url` columns are nullable; `kit_colors` persists as `[]` when not sent (fix from 2026-08-11).
