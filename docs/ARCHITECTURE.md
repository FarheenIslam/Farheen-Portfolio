# System Architecture — Farheen Islam Badhon Portfolio

A dynamic, database-driven academic and creative portfolio with a multi-admin CMS, a
generated A4 PDF portfolio and CV, and a public site that never exposes draft content.

- **Frontend / backend:** Next.js 16 (App Router), JavaScript + JSX only, React 19
- **Database / auth / storage:** Supabase (PostgreSQL, Supabase Auth, Storage)
- **Styling:** Tailwind CSS + shadcn/ui conventions, Lucide + Simple/Font Awesome brand marks
- **Motion:** Framer Motion (respects `prefers-reduced-motion`)
- **Documents:** `pdf-lib` rendered server-side on demand (pure JS, Worker-compatible)
- **Hosting:** Freebuff Sites (OpenNext → Cloudflare Workers, `nodejs_compat`)

---

## 1. Final system architecture

```
                    ┌───────────────────────────────────────────────┐
                    │              Browser (public site)            │
                    │  Home · About · Projects · Research · Design  │
                    │  Certificates · Experience · Résumé · Contact │
                    └───────────────┬───────────────────────────────┘
                                    │ HTTPS (RSC payload + JSON)
                    ┌───────────────▼───────────────────────────────┐
                    │            Next.js on Vercel                  │
                    │                                               │
                    │  Server Components ── src/lib/data.js ──┐      │
                    │  Route handlers     /api/cv-pdf         │      │
                    │                     /api/portfolio-pdf  │      │
                    │                     /api/upload         │      │
                    │  Server Actions     src/app/actions/*   │      │
                    │                     src/app/admin/      │      │
                    │                       actions/*         │      │
                    │  middleware.js  (session refresh +      │      │
                    │                  admin route gate)      │      │
                    └───────────────┬─────────────────────────┼──────┘
                                    │ @supabase/ssr            │
                                    │ (anon key + user cookie) │
                    ┌───────────────▼─────────────────────────▼──────┐
                    │                  Supabase                      │
                    │  Auth (email + password, sessions)             │
                    │  PostgreSQL + Row Level Security               │
                    │     public.admins  ← authorization source      │
                    │     content tables + child image tables        │
                    │     contact_messages, admin_activity_logs      │
                    │  Storage: portfolio-images / portfolio-documents│
                    │           private-documents                    │
                    └────────────────────────────────────────────────┘
```

**Key decisions**

| Decision | Why |
| --- | --- |
| Admin rights stored in `public.admins`, never in JWT metadata | A normal Supabase account has zero privileges unless an active row maps to it. Revoking a row instantly removes access. |
| All privileged work through server code + RLS | Every page, Server Action and route handler re-checks the admin on the server; RLS enforces it again in PostgreSQL. Defence in depth. |
| Anon key only — no service-role key | The service-role key bypasses RLS. It is never required, never present in code or env, so it cannot leak from the frontend. |
| Content access layer (`src/lib/data.js`) | Components never touch Supabase directly. Public queries only return `is_published = true`, and the layer falls back to verified defaults when Supabase is not connected. |
| Config-driven CMS (`src/lib/resources.js`) | One entry per content type defines the table, form fields, validation and list columns. The generic form + actions provide CRUD, so adding a field is a one-line change. |
| PDFs generated on demand | No stale documents: the PDF always reflects the current published content. |
| No TypeScript | Requirement: `.js` / `.jsx` only, with `jsconfig.json` path aliases. |

---

## 2. Database ER diagram

```
auth.users (Supabase)
   │ 1
   │
   │ 0..1
public.admins ──────────────┐ invited_by (self-reference, ON DELETE SET NULL)
   │ id, user_id, email,     │
   │ full_name, is_active    └──────────────┐
   │                                          │
   │ 1                                        │
   ├──< public.admin_activity_logs (admin_id SET NULL)
   ├──< public.admin_invites (invited_by SET NULL)
   └──< public.media_assets (uploaded_by SET NULL)

public.profiles              (singleton identity row)
   id, full_name, headline, short_bio, long_bio, email, location,
   github_url, linkedin_url, avatar_url, resume_url, availability,
   interests[], research_interests[], learning_goals, career_goals

public.education             public.skills
   id, institution, degree,     id, name, category, level,
   department, location,        sort_order, is_published
   start_year, end_year,
   is_current, result,
   result_scale, description,
   sort_order, is_published

public.projects 1 ────< public.project_images
   id, slug UNIQUE, title,      id, project_id (CASCADE), url,
   tagline, summary,            caption, sort_order
   description, category,
   technologies[], github_url,  public.design_works 1 ────< public.design_work_images
   live_url, cover_image_url,      id, slug UNIQUE, title,     id, design_work_id (CASCADE),
   project_status, started_on,     short_description,          url, caption, sort_order
   is_featured, sort_order,        description, category,
   is_published                    tools[], objectives[],
                                   process[], cover_image_url,
public.publications                figma_url, source_url, live_url,
   id, title, authors[], venue,    created_on, is_featured,
   publication_year, doi,          sort_order, is_published
   abstract, keywords[], pdf_url,
   publication_url, poster_url,  public.experiences
   presentation_url,                id, role, organization, kind,
   publication_status,              start_date, end_date, is_current,
   is_featured, sort_order,         description, sort_order, is_published
   is_published
                                  public.activities
public.thesis                      id, title, event_date, location, role,
   id, title, research_area,       description, image_url,
   supervisor, description,        sort_order, is_published
   abstract, thesis_status,
   started_year, expected_year,   public.certificates
   document_url, sort_order,        id, title, issuer, issue_date,
   is_published                     category, description, file_url,
                                    verification_url, is_featured,
                                    sort_order, is_published
public.achievements
   id, title, issuer, achieved_on, public.site_settings
   category, description,            key PRIMARY KEY, value JSONB
   is_featured, sort_order,
   is_published                     public.contact_messages
                                     id, name, email, subject, message,
                                     is_read, is_archived, created_at
```

> Note: `achievements` and `projects`/`publications` are independent entities (no shared
> polymorphic table) so each can have its own fields and validation without JSON blobs.

---

## 3. Tables, relationships and behaviour

### Conventions

- `uuid` primary keys with `gen_random_uuid()`.
- `created_at` / `updated_at` timestamptz on every content table; `updated_at` maintained by a
  trigger.
- `sort_order` integer for editorial ordering; `is_published` boolean for draft/publish.
- `text[]` arrays for tags/technologies/keywords (no join tables needed for display-only lists).
- Child image tables (`project_images`, `design_work_images`) use `ON DELETE CASCADE`, so deleting
  a project or design removes its gallery rows. Foreign keys from `admins` references use
  `ON DELETE SET NULL` so logs survive administrator removal.

### Status fields

| Table | Field | Allowed values |
| --- | --- | --- |
| `projects` | `project_status` | `in_progress`, `completed`, `archived`, `NULL` (not specified) |
| `publications` | `publication_status` | `published`, `under_review`, `preprint`, `conference`, `journal` |
| `thesis` | `thesis_status` | `ongoing`, `under_review`, `submitted`, `defended`, `completed` |
| `skills` | `level` | `Beginner`, `Intermediate`, `Advanced` (text label, no fake percentages) |
| `skills` | `category` | `Programming`, `Database`, `Design Tools`, `Research Interests` |
| `certificates` | `category` | the eight requested certificate categories |
| `design_works` | `category` | `UI/UX Design`, `Graphic Design`, `Academic & Research Design`, `Other Creative Work` |

### Indexes and constraints

- `projects.slug`, `design_works.slug` — unique (public URLs).
- `admins.user_id` — unique, FK to `auth.users` (cascade on user deletion).
- `admins.email` — unique; expression index on `lower(email)`.
- `skills (lower(name), category)` — unique index prevents duplicates in a category.
- `project_images(project_id)`, `design_work_images(design_work_id)` — FK indexes.
- `admin_activity_logs(created_at desc)`, `contact_messages(created_at desc)` — listing indexes.
- `media_assets (bucket, path)` — unique.
- `pages`: no table; static routes are code.

### Protected invariant

A trigger (`protect_last_active_admin`) raises an exception if an `UPDATE` deactivates or a
`DELETE` removes the last active administrator — enforced in the database, not just the UI.

---

## 4. Row Level Security matrix

`public.is_admin()` is `SECURITY DEFINER` and checks `public.admins` for
`user_id = auth.uid() AND is_active`. Making it `SECURITY DEFINER` avoids recursive RLS on the
`admins` table.

| Table | anon (public) | authenticated admin |
| --- | --- | --- |
| `profiles`, `site_settings` | SELECT | full CRUD |
| `education`, `skills`, `projects`, `publications`, `thesis`, `certificates`, `achievements`, `design_works`, `experiences`, `activities` | SELECT where `is_published = true` | full CRUD (drafts included) |
| `project_images`, `design_work_images` | SELECT when parent is published | full CRUD |
| `contact_messages` | INSERT only (with validation) | SELECT / UPDATE / DELETE |
| `admin_activity_logs` | — | SELECT + INSERT (append-only; no update/delete policy) |
| `media_assets` | — | full CRUD |
| `admins`, `admin_invites` | — | SELECT for admins; writes for admins (trigger protects the last admin) |
| `storage.objects` (public buckets) | SELECT | INSERT / UPDATE / DELETE |
| `storage.objects` (`private-documents`) | — | SELECT (signed URLs) + writes |

RLS is enabled on **every** application table. No table is left with RLS disabled.

---

## 5. Supabase Storage architecture

| Bucket | Public | Limit | MIME types | Used for |
| --- | --- | --- | --- | --- |
| `portfolio-images` | yes | 5 MB | JPEG, PNG, WebP, GIF | profile photo, project covers, design covers, activity photos, certificate images |
| `portfolio-documents` | yes | 10 MB | PDF + images | published research PDFs, posters, slides, thesis files, uploaded CV |
| `private-documents` | no | 10 MB | PDF + images | restricted files; only administrators can read, via short-lived signed URLs |

- Object paths are `#{folder}/#{uuid}-#{slugified-name}.#{ext}` so filenames are never trusted and
  collisions are impossible.
- Validation happens twice: client-side `accept` hints are cosmetic; the server route
  (`/api/upload`) checks the authenticated admin, bucket whitelist, MIME type and byte size before
  uploading.
- Every upload writes a row to `media_assets` (bucket, path, URL, MIME, size, uploader) and an
  `upload` entry to the activity log.
- "Replace" is implemented as uploading a new object and updating the referencing URL; the old
  object can be deleted from the Media library.
- Deleting a file removes both the storage object and its metadata row.

---

## 6. Equal-admin security model

**Rule: every active row in `public.admins` has identical permissions.** There is no super admin,
no editor/admin split, no role column. `is_admin()` is a boolean, so no code path can grant partial
rights.

### Authorisation layers

1. **`middleware.js`** — refreshes the Supabase session cookie and redirects unauthenticated
   requests away from `/admin/*` (except `/admin/login` and `/admin/invite/*`).
2. **`(dashboard)/layout.js`** — server guard. Resolves `getCurrentAdmin()` from the session +
   `admins` row. A signed-in user with no admin row gets an explicit "no access" screen, and any
   pending invitation for their verified email is applied automatically.
3. **Every Server Action** — starts with `assertAdmin()`, which re-reads the session and the
   `admins` row. Frontend disabling of buttons is never the security boundary.
4. **Route handlers** (`/api/upload`) — same `getCurrentAdmin()` check before touching storage.
5. **Row Level Security** — final enforcement inside PostgreSQL for every read and write.

### Login flow

```
/admin/login → supabase.auth.signInWithPassword
             → RPC accept_pending_admin_invite()   (no-op unless a valid invite exists)
             → SELECT * FROM admins WHERE user_id = auth.uid() AND is_active
             → if found: log "login" + redirect /admin
             → if not: explain that the account is not authorised
```

### Invitation flow (no public registration)

```
Admin A → Admin → Administrators → invite colleague@example.org
        → INSERT admin_invites(email, token, expires_at = now + 7 days)
        → shares https://site/admin/invite/<token>

Colleague → opens link → RPC get_admin_invite(token) shows the invited email
          → sets a password → supabase.auth.signUp(email, password)
          → email confirmation (if enabled) → sign in
          → RPC accept_pending_admin_invite() validates:
                · auth.uid() exists
                · email matches an unexpired, unused invitation
                · inserts admins row with is_active = true
          → administrator access with equal permissions
```

A stranger who creates a Supabase account without an invitation gets **no** `admins` row, therefore
no dashboard access and no data access beyond public published content. The app never exposes a
public sign-up form; the only sign-up surface is the invitation link.

### Last-admin protection

`assertAdmin()` + `countActiveAdmins()` give a friendly error, and the
`protect_last_active_admin` trigger enforces the rule even for direct SQL through PostgREST.

### Activity logging

`logActivity()` writes `admin_id`, `admin_email`, `action`, `entity`, `entity_id`, `metadata`
and a timestamp for: login, create, update, delete, publish, unpublish, reorder, upload,
delete_file, invite_admin, activate/deactivate/remove admin, revoke_invite, message moderation and
settings changes. Logs are append-only for admins and never contain passwords, tokens or keys.

---

## 7. Request lifecycle (public content)

```
Request /projects
  → (public)/layout.js  → getProfile(), getSiteSettings()   [cached per request]
  → (public)/projects/page.js → getProjects()
      → src/lib/data.js
          → createClient()  (@supabase/ssr, cookies)
          → SELECT *, project_images(*) WHERE is_published = true ORDER BY sort_order
          → RLS narrows to published rows for anon
  → <ProjectCard/> renders
```

If Supabase is not configured (or a query fails), the data layer logs a warning and returns the
verified defaults from `src/lib/defaults.js`, so the site never crashes. As soon as Supabase is
connected, the database is the single source of truth.

---

## 8. Folder structure

```
.
├── middleware.js                     # session refresh + /admin gate
├── next.config.mjs                   # Supabase image domains, server action body limit
├── jsconfig.json                     # "@/..." → "src/..."
├── tailwind.config.js                # design tokens, navy palette, typography
├── postcss.config.mjs
├── .env.local.example
├── README.md
├── docs/
│   └── ARCHITECTURE.md               # this document
├── supabase/
│   ├── migrations/
│   │   ├── 0001_schema.sql           # tables, indexes, triggers, helpers
│   │   ├── 0002_rls.sql              # RLS policies + invite RPCs
│   │   └── 0003_storage.sql          # buckets, limits, storage policies
│   └── seed.sql                      # verified starter content
└── src/
    ├── app/
    │   ├── layout.js                 # fonts, metadata, theme provider, toasts
    │   ├── globals.css               # design tokens + utilities
    │   ├── not-found.jsx  error.jsx  sitemap.js  robots.js
    │   ├── actions/contact.js        # public contact server action
    │   ├── (public)/
    │   │   ├── layout.js             # header + footer + skip link
    │   │   ├── page.js               # home (all main sections)
    │   │   ├── about/page.js
    │   │   ├── projects/page.js  projects/[slug]/page.js
    │   │   ├── research/page.js
    │   │   ├── designs/page.js   designs/[slug]/page.js
    │   │   ├── certificates/page.js
    │   │   ├── experience/page.js
    │   │   ├── resume/page.js
    │   │   ├── contact/page.js
    │   │   └── loading.jsx
    │   ├── admin/
    │   │   ├── login/page.js                 # public (unguarded)
    │   │   ├── invite/[token]/page.js        # public (invite acceptance)
    │   │   ├── actions/                      # auth, content, admins, messages, settings, media
    │   │   └── (dashboard)/                  # guarded route group
    │   │       ├── layout.js                 # server guard + shell
    │   │       ├── page.js                   # dashboard overview
    │   │       ├── [resource]/page.js        # 11 CRUD pages via config
    │   │       ├── messages/  admins/  logs/  media/  settings/  cv/
    │   └── api/
    │       ├── upload/route.js               # admin-only file upload
    │       ├── cv-pdf/route.js
    │       └── portfolio-pdf/route.js
    ├── components/
    │   ├── ui/            # shadcn-style primitives (button, card, dialog, table…)
    │   ├── public/        # hero, cards, galleries, forms, timeline, filters
    │   ├── admin/         # shell, resource manager/form, messages, admins, media, logs
    │   ├── brand-icons.jsx  smart-image.jsx  reveal.jsx  theme-*.jsx
    ├── lib/
    │   ├── supabase/      # config, server client, browser client, middleware helper
    │   ├── data.js        # public content queries + fallback
    │   ├── defaults.js    # verified starter content
    │   ├── resources.js   # CMS resource definitions (tables + fields)
    │   ├── validation.js  # Zod schema generated from field definitions
    │   ├── auth.js        # getCurrentAdmin / requireAdmin / assertAdmin
    │   ├── activity.js    # activity log writer
    │   ├── pdf/           # pdf-lib layout toolkit + portfolio/CV renderers
    │   ├── site.js  utils.js
```

---

## 9. PDF architecture

- `/api/cv-pdf` and `/api/portfolio-pdf` render on demand with `pdf-lib`
  (`src/lib/pdf/portfolio.js`, `src/lib/pdf/cv.js`).
- Both documents receive the same `getPortfolioBundle()` data used by the website, so only
  **published** content is included.
- `src/lib/pdf/layout.js` is the shared typographic toolkit: A4 geometry, colour palette, text
  wrapping, flowing paragraphs, entry cards, chips, bullets, page-break handling, running footer with
  page numbers and clickable link annotations.
- Fonts are the standard PDF Helvetica/Times families embedded by pdf-lib, so generation never
  depends on a network font fetch. Standard fonts only cover WinAnsi, so `clean()` normalises smart
  quotes/dashes and drops unsupported glyphs before drawing.
- The engine is pure JavaScript (no filesystem, no Node-only modules), which is what makes the routes
  work inside a Cloudflare Worker where `@react-pdf/renderer` could not load its fonts.

---

## 10. Development roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Architecture, folder structure, data model | Complete (this document) |
| 2 | Supabase schema, RLS, storage, seed, admin bootstrap | Complete — SQL authored; not yet executed against a live project |
| 3 | Public website: design system, all sections, galleries, dark mode, responsive | Complete — builds and renders |
| 4 | Auth + equal-admin dashboard + protected routes | Complete — server guards wired; live sign-in not testable without Supabase credentials |
| 5 | CMS CRUD, uploads, galleries, drafts, logs, settings, messages, media | Complete |
| 6 | PDF portfolio + CV generation | Complete — both endpoints return valid PDFs |
| 7 | Testing & security hardening | Partially verified: production build, all public/admin routes, PDF generation. RLS, storage policies, two-admin isolation and sign-in must be verified against the owner's Supabase project. |
| 8 | Deployment (GitHub → Vercel → Supabase) | Documented in README; requires the owner's accounts |

### Recommended next steps

1. Connect Supabase, run the three migrations, seed, create the first auth user and `admins` row.
2. Test with two admin accounts: sign in as both, confirm equal access, confirm the last-admin
   protection and RLS by calling the REST API with the anon key.
3. Add real content (design work, certificates, project screenshots, verified publication venues).
4. Deploy to Vercel and set `NEXT_PUBLIC_SITE_URL` for correct canonical URLs, sitemap and OG tags.
5. Optional: transactional email for contact-form notifications, rate limiting/CAPTCHA, and
   Supabase Storage image transformations.
