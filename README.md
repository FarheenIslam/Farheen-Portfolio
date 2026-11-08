# Most. Farheen Islam Badhon — Portfolio & CMS

A premium, dynamic academic + creative portfolio built with **Next.js 16 (App Router), JavaScript
only, Tailwind CSS, shadcn/ui conventions and Supabase**. It includes a fully database-driven public
website, a generated A4 PDF portfolio and CV, and a secure multi-administrator CMS with **equal
permissions** for every admin.

> **Honesty first.** The starter content contains only the facts supplied by the portfolio owner.
> No project features, publication venues, certificates, awards or experience were invented. Empty
> sections show an honest empty state until real content is added from the dashboard.

Full technical detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 1. What is included

### Public website
- **Home** — hero, quick facts, about preview, education, skills, featured projects, research +
  thesis, design gallery, experience & activities, contact CTA
- **About** — biography, at-a-glance panel, research interests, education timeline, skills, learning
  and career goals, thesis
- **Projects** — featured/other grids and a detail page per project with screenshots, stack and links
- **Research** — publications with abstract, keywords, PDF/poster/slides/DOI links, thesis card
- **Design Portfolio** — a Behance/Dribbble-style masonry gallery with category filters, search,
  hover previews, quick-view lightbox with image carousel, and a full case-study page per design
- **Certificates & Achievements** — eight-category filter, search, image/PDF preview, verification links
- **Experience & Activities** — memberships, events and achievements
- **Résumé** — on-site CV preview, print, and PDF downloads
- **Contact** — validated form stored privately in Supabase, plus email/LinkedIn/GitHub
- Light + dark mode, responsive from 320 px, skip links, reduced-motion support, semantic headings,
  loading/empty/error states, toasts, sitemap, robots, Open Graph metadata

### Admin CMS (`/admin`)
1. Dashboard overview with counts and recent activity
2. Profile management
3. Education
4. Skills
5. Projects (+ screenshot gallery)
6. Research & Publications
7. Thesis
8. Certificates
9. Achievements
10. Design Portfolio (+ gallery + objectives/process)
11. Experience
12. Activities
13. CV & PDF generation
14. Media library (three buckets, upload/delete/copy URLs)
15. Contact messages (read/archive/delete/reply)
16. Administrators (invite, deactivate, remove)
17. Website settings
18. Activity logs

Every content page has search, status filter, sorting, pagination, inline publish/unpublish,
re-order arrows, create/edit dialogs with validation, confirmation before deletion, file uploads
with previews, and draft/published state.

---

## 2. Requirements

- Node.js 18.18+ (20+ recommended) and npm
- A [Supabase](https://supabase.com) project (free tier is enough)
- Optional: a Vercel account and a GitHub repository for deployment

---

## 3. Quick start (local)

```bash
# 1. install dependencies
npm install

# 2. create your environment file
cp .env.local.example .env.local
#    then fill in the two Supabase values (see step 4)

# 3. run the development server
npm run dev
#    → http://localhost:3000
```

Without Supabase configured the site still runs — it renders the verified starter content and the
admin area opens in **local demo mode** (read-only, clearly labelled). Demo mode never activates in a
production build.

Production check:

```bash
npm run build
npm start
```

---

## 4. Supabase setup (one time)

### 4.1 Create the project
1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **publishable** key (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     (older projects issue an **anon public** key instead; that works too, either as
     `NEXT_PUBLIC_SUPABASE_ANON_KEY` or in the publishable variable)

Put both in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Never use the `service_role` key. This app never needs it: all access is authenticated as the
> signed-in admin and constrained by Row Level Security.

### 4.2 Run the SQL (one query)

Open **SQL Editor → New query**, paste the whole of [`supabase/setup.sql`](supabase/setup.sql) and
run it once. That file is the three migrations followed by the seed, in order.

Prefer one file at a time? Run these in sequence:

1. `supabase/migrations/0001_schema.sql` — tables, indexes, triggers, helper functions
2. `supabase/migrations/0002_rls.sql` — Row Level Security policies + invitation functions
3. `supabase/migrations/0003_storage.sql` — storage buckets, limits and policies
4. `supabase/seed.sql` — verified starter content

Every script is idempotent (`if not exists`, `drop ... if exists` before each trigger and policy,
`on conflict` in the seed), so a re-run is safe.

The SQL was executed end-to-end against PostgreSQL 18 with Supabase's `auth` and `storage` schemas
stubbed, then exercised with RLS active: published-only reads for anonymous visitors and non-admins,
drafts hidden, contact-form insert allowed for visitors but not readable by them, storage writes
rejected for anonymous users and accepted for admins, and the last-active-admin guard refusing both
deactivation and deletion.

### 4.3 Create your administrator account

1. **Authentication → Users → Add user** — enter your email and a password.
   - If "Confirm email" is enabled (default), open the confirmation link, or disable email
     confirmation for this single-user admin flow in **Authentication → Providers → Email**.
2. Make that account an admin by running this in the SQL editor (replace the email):

```sql
insert into public.admins (user_id, email, full_name)
select id, lower(email), 'Most. Farheen Islam Badhon'
from auth.users
where lower(email) = lower('farheenislam2003@gmail.com')
on conflict (user_id) do nothing;
```

3. Sign in at `http://localhost:3000/admin/login`.

There is **no public registration**. Additional administrators are invited from
**Admin → Administrators**, which generates a single-use link tied to the invited email address.

### 4.4 Public sign-up setting

Keep **Authentication → Providers → Email** configured so that only invited people can obtain an
admin role. Even if someone creates an account directly, they receive **no** `admins` row, so they
see a "no admin access" screen and can read nothing but published public content (RLS).

---

## 5. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable key (`sb_publishable_...`), RLS-protected |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | alternative | Legacy anon key; either key name is accepted |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URLs, sitemap, Open Graph. Use the real domain in production. |

`.env.local` is git-ignored. `.env.local.example` documents every variable. No secret is ever
committed, and the client bundle only ever receives `NEXT_PUBLIC_*` values.

---

## 6. How the admin CMS works

- Content definitions live in `src/lib/resources.js`: table name, label, form fields, validation
  rules and list behaviour. The generic `ResourceForm` and `ResourceManager` components plus the
  `saveResourceAction` server action provide create/read/update/delete for all eleven content types —
  no duplicated CRUD code.
- **Draft vs published** — only published rows are visible publicly and in PDFs.
- **Uploads** — image fields accept JPG/PNG/WebP/GIF (5 MB); file fields accept PDF/images (10 MB).
  Files are validated again server-side in `src/app/api/upload/route.js`.
- **Galleried images** — projects and design works have a dedicated gallery editor: upload many,
  paste a URL, caption, reorder, remove. Rows are synced into `project_images` /
  `design_work_images`.
- **Slugs** — generated automatically from the title when left blank; must be unique.
- **Deletion** — always asks for confirmation. Deleting a project/design removes its gallery rows.

### Adding another content field
1. Add a column in a new migration (`supabase/migrations/0004_*.sql`).
2. Add one line to that resource's `fields` array in `src/lib/resources.js`.

The form, validation, list and save logic pick it up automatically.

---

## 7. PDF portfolio & CV

- `GET /api/cv-pdf` → concise CV
- `GET /api/portfolio-pdf` → multi-page portfolio (cover, introduction, about, education, skills,
  projects, research, thesis, certificates, design highlights, experience, contact)

Both are generated at request time from **published** content, A4 sized, with page numbers and
clickable email/GitHub/LinkedIn links. Downloads are available from the hero, the Résumé page, the
footer and **Admin → CV & PDF**. Rendering uses `pdf-lib` (pure JavaScript, standard fonts), so the
routes work both in Node and in a Cloudflare Worker.

---

## 8. Security model (summary)

- Admin identity = `auth.users` + an active row in `public.admins`.
- `is_admin()` (SECURITY DEFINER) drives every RLS policy → no recursive policies.
- Every admin page, Server Action and upload route re-checks the admin on the server.
- Public reads are restricted to `is_published = true`; contact messages are insert-only for
  visitors and readable only by admins.
- Activity logs are append-only and contain no secrets.
- A database trigger prevents deleting or deactivating the **last active administrator**.
- All administrators are equal: there is no super-admin or role hierarchy.
- The `service_role` key is not used anywhere.

---

## 9. Deployment

### Freebuff Sites (live)

- Production: <https://site-ea917db4023d486f95ba83e6f79a52fb.freebuff.page>
- Build: `sites_prepare_next` runs `next build` and packages the OpenNext worker at
  `freebuff-sites-build/`, then `sites_deploy` uploads that manifest.
- `NEXT_PUBLIC_SITE_URL` overrides the canonical origin if a custom domain is attached later;
  `sitemap.xml` and `robots.txt` already follow the request host at runtime.

### GitHub
```bash
git init
git add .
git commit -m "Portfolio + CMS"
git branch -M main
git remote add origin https://github.com/FarheenIslam/<repo>.git
git push -u origin main
```

### Vercel
1. **Add New → Project → Import** the repository.
2. Framework preset: **Next.js** (build `next build`, output auto-detected).
3. Add the environment variables from step 5 (use the production domain for
   `NEXT_PUBLIC_SITE_URL`).
4. Deploy, then add the Vercel domain to **Supabase → Authentication → URL Configuration**
   (Site URL + redirect URLs) so sign-in works in production.
5. Sign in at `https://your-domain/admin/login`.

### Supabase
- Storage buckets and policies are created by `0003_storage.sql`.
- If you later disable email sign-ups entirely, existing admins can still sign in; new admins must
  be created from the Supabase dashboard and added to `public.admins`.

---

## 10. Verification performed

- `next build` — succeeds; 27 routes compiled.
- All public routes return HTTP 200; an unknown route returns 404; `/admin/login` renders.
- All 18 admin pages render (verified in local demo mode).
- `/api/cv-pdf` and `/api/portfolio-pdf` return valid PDFs (`%PDF-` header, 2 and 5 pages,
  ~5 KB / ~11 KB) with clickable contact links.
- Production deployment (OpenNext on Cloudflare Workers) was first checked in local workerd, then
  live: every public route 200, `/admin` 307 → `/admin/login`, unknown route 404, CSS served as
  `text/css`, both PDFs valid, sitemap/robots use the request host, demo admin mode off.
- The Supabase project is connected in production and the auth round-trip is verified live: a
  sign-in attempt on the deployed site reaches Supabase Auth and returns its own error message.
- The SQL has not been applied to that project yet, so table-level checks (RLS visibility, storage
  policies, two-admin isolation, uploads) remain to be run once section 4.2 is done.

---

## 11. Known limitations

- The contact form only stores messages; it does **not** send email notifications. Add a Supabase
  Edge Function or an email service if you want alerts.
- Spam protection is a honeypot field plus length validation. Add rate limiting or a CAPTCHA if the
  form is targeted.
- Invitations are shared manually as links (no email is sent by the app).
- PDFs are text-first; uploaded images are not embedded in the PDF to keep generation fast and
  reliable. Design highlights are listed with titles, categories and tools.
- Local demo mode is for reviewing the UI only; it cannot save anything.

---

## 12. Project structure

See [docs/ARCHITECTURE.md §8](docs/ARCHITECTURE.md) for the annotated tree. In short:

```
src/app/        routes: (public) site, admin/(dashboard) CMS, api handlers
src/components/ ui primitives, public components, admin components
src/lib/        supabase clients, data layer, resources, validation, auth, PDF documents
supabase/       migrations + seed
```

---

## 13. Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Next.js lint (installs ESLint on first run) |
