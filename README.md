# Design & Solution — Agency Website

A complete, production-ready website for a creative agency (video editing &
graphic design, Minecraft development, Discord development & management),
with a real, secure admin panel — no fake buttons, no fake logins, no fake
uploads. Everything in the admin panel writes to a real Supabase database
and storage bucket.

**Stack:** React + Vite (frontend) · Supabase (auth, database, storage) · Netlify (hosting)

---

## 1. Project structure

```
design-solution/
├── index.html                     Page shell, fonts, SEO meta tags
├── package.json                   Dependencies & scripts
├── vite.config.js                 Build config
├── netlify.toml                   Netlify build & redirect config
├── .env.example                   Template for your Supabase keys
├── public/
│   └── favicon.svg
├── supabase/
│   └── schema.sql                 Full DB schema, security rules, seed data
└── src/
    ├── main.jsx                   App entry point
    ├── App.jsx                    Routes (public site + admin)
    ├── index.css                  All styling (dark theme, responsive)
    ├── supabaseClient.js          Supabase connection + image URL helper
    ├── context/
    │   ├── AuthContext.jsx        Login state & admin-check
    │   └── SiteDataContext.jsx    Loads all public content once, shared everywhere
    ├── hooks/
    │   └── imageUpload.js         Upload/delete helper used by every admin form
    ├── components/                Public site sections
    │   ├── Navbar.jsx
    │   ├── Hero.jsx
    │   ├── Services.jsx
    │   ├── Portfolio.jsx
    │   ├── About.jsx
    │   ├── Testimonials.jsx
    │   ├── Contact.jsx
    │   ├── Footer.jsx
    │   └── ProtectedRoute.jsx     Blocks /admin from non-admins
    └── pages/
        ├── Home.jsx               Assembles the public homepage
        ├── NotFound.jsx
        └── admin/
            ├── AdminLogin.jsx
            ├── AdminLayout.jsx    Sidebar shell for all admin pages
            ├── DashboardHome.jsx
            ├── ManageSettings.jsx
            ├── ManageCategories.jsx
            ├── ManageServices.jsx
            ├── ManagePortfolio.jsx
            └── ManageTestimonials.jsx
```

---

## 2. How it works

- **Public site** (`/`) reads directly from Supabase (categories, services,
  portfolio projects, testimonials, site settings). Anyone can read this
  data — nothing sensitive is exposed.
- **Admin panel** (`/admin`) requires a real Supabase Auth login. After
  logging in, the app checks whether your user ID is in the `admins`
  table. If it isn't, you're signed back out immediately — logging in
  with any random Supabase account does **not** grant access.
- **Images** are uploaded straight to a Supabase Storage bucket
  (`site-images`) from the browser, using your logged-in session. Only
  admins can upload/replace/delete; anyone can view (required so the
  images show up on your public site).
- The **anon/public key** is the only secret used in the frontend, and it
  is meant to be public — Supabase's Row Level Security (RLS) policies
  (defined in `supabase/schema.sql`) are what actually protect your data.
  **The service_role key is never used anywhere in this project** — don't
  add it to `.env`, Netlify, or any frontend file.

---

## 3. Set up Supabase (free tier)

1. Go to [supabase.com](https://supabase.com) → create a free account →
   **New project**. Pick any name/region and a strong database password
   (save it somewhere safe — you won't need it for this app, but keep it).
2. Once the project is ready, open **SQL Editor** in the left sidebar →
   **New query**.
3. Open `supabase/schema.sql` from this project, copy its entire
   contents, paste into the SQL editor, and click **Run**.
   - This creates every table (`categories`, `services`,
     `portfolio_projects`, `testimonials`, `site_settings`, `admins`),
     turns on Row Level Security with the correct public-read /
     admin-write policies, creates the `site-images` storage bucket, and
     seeds your three service categories with all the services you
     listed (Video Editing & Graphic Design, Minecraft Development,
     Discord Development & Management).
4. Go to **Project Settings → API**. You'll need two values in the next
   step:
   - **Project URL**
   - **anon / public key**

---

## 4. Create your first admin account

There is intentionally no public "sign up" page — that's how the admin
panel stays secure. You create your one admin account directly in
Supabase:

1. In Supabase, go to **Authentication → Users → Add user → Create new
   user**.
2. Enter your email and a password. Leave "Auto Confirm User" turned on
   (or confirm it manually) so you can log in immediately.
3. Click the newly created user and copy their **User UID**.
4. Go back to **SQL Editor → New query** and run (replace both values):

   ```sql
   insert into admins (id, email)
   values ('paste-the-user-uid-here', 'the-email-you-used@example.com');
   ```

5. That's it — this email/password can now log in at `/admin/login`. To
   add a second admin later, repeat this process for another Supabase
   Auth user.

---

## 5. Run it locally (optional, to preview before deploying)

You'll need [Node.js](https://nodejs.org) installed (v18+).

```bash
cd design-solution
cp .env.example .env
```

Open `.env` and fill in the two values from Supabase step 3:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Then:

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` for the site, and
`http://localhost:5173/admin/login` for the admin panel.

---

## 6. Deploy to Netlify

**Option A — Git-based deploy (recommended):**

1. Push this project to a GitHub/GitLab/Bitbucket repository.
2. In Netlify: **Add new site → Import an existing project** → connect
   your repo.
3. Build settings are auto-detected from `netlify.toml`
   (`npm run build`, publish directory `dist`) — you don't need to
   change anything.
4. Before deploying, go to **Site configuration → Environment
   variables** and add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy site**. Netlify will build and publish it — you'll get
   a live URL immediately, and you can add a custom domain afterwards
   under **Domain settings**.

**Option B — Netlify CLI (no Git required):**

```bash
npm install -g netlify-cli
cd design-solution
npm install
npm run build
netlify deploy --prod
```

When prompted, set the publish directory to `dist`. Set the same two
environment variables under **Site configuration → Environment
variables** in the Netlify dashboard (a CLI deploy still needs them set
there for the live build).

> The app reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` at build
> time. If you add or change these in Netlify after the first deploy,
> trigger a new deploy (**Deploys → Trigger deploy**) for the change to
> take effect.

---

## 7. Using the admin panel day-to-day

Go to `yoursite.com/admin/login` (there's also a small "Admin" link in
the site footer) and sign in with the account you created in step 4.

**Site Settings** — change the site title, hero tagline, About section
text, phone, WhatsApp number, email, and Discord invite link, plus
upload a logo. Click **Save settings**; the public site updates
immediately.

**Categories** — add a category with a name and short description (e.g.
"Video Editing & Graphic Design"). Click any existing category's **Edit**
to change it, or **Delete** to remove it (you'll need to delete or
reassign its services first — this is a safety check, not a bug).

**Services** — pick a category, add a name, description, and an image,
then **Add service**. Services appear under their category on the
homepage automatically, in the "Sort order" you set (lower numbers show
first).

**Portfolio** — add a project with a title, description, category
(Video & Graphic Design / Minecraft / Discord), a required image, and an
optional project link. Visitors can filter the portfolio grid by
category on the public site.

**Testimonials** — add a client name, optional role/company, the quote
itself, a 1–5 star rating, and an optional avatar photo.

Every **Edit** button loads that item back into the form above the list
so you can change it and save; every **Delete** asks for confirmation
first and also removes the associated image from storage.

---

## 8. Customizing further

- **Colors / fonts:** everything is controlled by CSS variables at the
  top of `src/index.css` (`:root { --bg, --accent-violet, ... }`) and the
  Google Fonts link in `index.html`.
- **Adding a new admin-editable field:** add the column in Supabase
  (SQL Editor), then add the corresponding input to the relevant
  `Manage*.jsx` form and to the public component that displays it.
- **Placeholder content:** the seed data in `supabase/schema.sql`
  fills in all three service categories and their services with real
  descriptions so the site isn't empty — replace the wording from the
  admin panel whenever you're ready, and add your own portfolio
  projects, testimonials, and images.

---

## 9. Security notes

- Only the Supabase **anon key** is used in the frontend — this is safe
  and standard; it has no special privileges on its own.
- All write access (insert/update/delete) is enforced server-side by
  Postgres Row Level Security policies that check the `admins` table —
  even if someone reads your frontend code, they cannot write data
  without a session tied to a row in `admins`.
- The **service_role key** is never used in this project. Never paste it
  into any file here or into Netlify's frontend environment variables.
- There is no public registration endpoint; admins can only be added
  by running SQL directly in your Supabase project, which only you can
  access.
