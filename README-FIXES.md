# What was fixed (and why)

This note covers only the bug fixes. For setup and the general project overview, the main
[README.md](README.md) is still the place to go.

**Short version:** the admin dashboard was completely unusable. Every page, including the login
page, showed "404 Page not found". That's fixed. While testing it end to end I also found and fixed
two smaller bugs: amenities were saved wrong whenever you uploaded a photo, and `npm run seed`
ignored your `MONGO_URI`.

Every change is marked in the code with a `// FIX:` comment, so you can search the project for
`FIX:` to jump straight to each one. Five files changed, about 20 lines in total:

| # | Problem | File(s) |
|---|---------|---------|
| 1 | Admin dashboard shows 404 on every page / blank page on refresh | [admin/vite.config.js:10](admin/vite.config.js#L10), [admin/src/main.jsx:12](admin/src/main.jsx#L12) |
| 2 | "Become a host" link had the `/admin` path hardcoded | [admin/src/components/Header.jsx:63](admin/src/components/Header.jsx#L63) |
| 3 | Amenities saved as one long string when a photo is uploaded | [admin/src/components/ListingForm.jsx:98](admin/src/components/ListingForm.jsx#L98) |
| 4 | `npm run seed` ignored `MONGO_URI` and seeded the wrong database | [server/utils/seed.js:7](server/utils/seed.js#L7) |

> **Important:** `admin/dist` is in `.gitignore`, so after pulling these changes you need to run
> `npm run build` again. Otherwise Express keeps serving the old, broken admin build.

---

## 1. The admin dashboard showed "404" on every page

### What you'd see

Open `http://localhost:5000/admin`, and instead of the login form you get the dashboard's own
"404 – Page not found" screen. Every admin URL did the same. Clicking "Back to listings" took you out
of the admin entirely and onto the guest site, because it went to `/listings` instead of
`/admin/listings`.

There was a second symptom too: if you were on a deeper page like
`/admin/listings/<id>/edit` and hit refresh, the screen went completely blank.

### Why it happened

The admin app is served by Express under `/admin` (see `server/server.js`). For that to work, two
settings have to agree:

1. **Vite's `base`** decides where the built HTML loads its JavaScript and CSS from.
2. **React Router's `basename`** tells the router "everything I own starts with `/admin`, so ignore
   that part when matching routes".

Originally both were set to `/admin`, and that was correct. Then the last three commits
("Fix admin frontend asset paths", "Fix admin asset paths" and "fix") changed them:

- `basename="/admin"` was removed from `main.jsx`. Without it, the router sees the URL
  `/admin/login` and looks for a route literally called `/admin/login`. There isn't one (the routes
  are `/login`, `/listings` and so on), so it falls through to the `*` route, which is the 404 page.
  **That's the main bug.**
- `base` was changed to `'/'` and then to `'./'` (relative). Relative paths look fine on
  `/admin/`, but the browser resolves them against the current URL. So on
  `/admin/listings/123/edit` the page asked for `/admin/listings/123/assets/index.js`. That file
  doesn't exist, so Express's catch-all sent back `index.html` instead. The browser refuses to run
  HTML as JavaScript, and you get a blank page.

### What I changed

**`admin/vite.config.js`:** went back to an absolute base:

```js
// before
base: './',

// after
base: process.env.ADMIN_BASE || '/admin/',
```

**`admin/src/main.jsx`:** restored the basename, but read it from Vite instead of typing
`/admin` a second time:

```jsx
// before
<BrowserRouter >

// after
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

`import.meta.env.BASE_URL` is whatever `base` is set to in the Vite config, so the asset paths and
the router can't get out of sync again. That mismatch is exactly what caused this bug, so it felt
worth removing the possibility.

The `ADMIN_BASE` part is optional. You only need it if you ever host the admin on its own at the
root of a domain. Leave it unset for the normal setup:

```powershell
# PowerShell
$env:ADMIN_BASE = '/'; npm --prefix admin run build
```

(Watch out if you do this from **Git Bash** on Windows: it quietly rewrites `/` into
`C:/Program Files/Git/`. Run it from PowerShell or CMD, or prefix it with `MSYS_NO_PATHCONV=1`.)

## 2. "Become a host" link had `/admin` hardcoded

Same family of problem, just smaller. In `Header.jsx` the logged-out "Become a host" link was a
plain `<a href="/admin/listings">` with an `onClick` that called `navigate()`. It worked, but it
had the path written out by hand, so it would break the moment the base changed. I swapped it for
React Router's `<Link to="/listings">`, which adds the basename for you. It looks and behaves the
same.

## 3. Amenities were saved as one item when you uploaded a photo

### What you'd see

Create a listing, tick **wifi**, **kitchen** and **pool**, upload an image and save. The database
ends up with this:

```json
"amenities": ["wifi,kitchen,pool"]
```

That's one amenity with commas in its name, not three. The guest site then shows a single weird
amenity, and when you open the listing to edit it, none of the checkboxes are ticked.

This only happens when an image file is uploaded. Without a file, the form sends JSON and
everything's fine, which makes it easy to miss when testing.

### Why it happened

With a file attached, the form switches to `multipart/form-data` and builds a `FormData` by looping
over every field and calling `payload.append(key, value)`. `FormData` can only hold strings and
files, so when it's given an array it calls `.toString()` on it, and `['wifi','kitchen','pool']`
becomes `"wifi,kitchen,pool"`.

### What I changed

In `ListingForm.jsx`, amenities are now appended one at a time. Multer collects repeated fields
with the same name into a proper array on the server:

```js
else if (k === 'amenities') v.forEach((a) => payload.append('amenities', a));
```

I checked three cases against the real API: three amenities, a single amenity, and updating an
existing listing with a new photo. All three are stored correctly now.

## 4. `npm run seed` ignored `MONGO_URI`

### What you'd see

You put your local MongoDB or Atlas connection string in `server/.env`, run `npm run seed`, then
`npm start`, and the site has no listings. The seed script also starts downloading a 600–800 MB
MongoDB binary even though you pointed it at a real database.

### Why it happened

The first line of `seed.js` was:

```js
process.env.MONGO_URI = process.env.MONGO_URI || '';
require('dotenv').config();
```

That sets `MONGO_URI` to an empty string *before* dotenv reads the `.env` file. dotenv never
overwrites a variable that already exists, even an empty one, so your real `MONGO_URI` was ignored.
`db.js` then saw an empty URI and fell back to the sandbox database. The data went into the
sandbox while the server connected to your real database, which was still empty. You can actually
spot it in the console: the `injected env (N)` count dotenv prints is one less than the number of
values in your `.env`, because `MONGO_URI` was skipped.

### What I changed

I deleted that line so `.env` is loaded first, the same way `server.js` does it. If `MONGO_URI` is
left empty, the sandbox fallback still works exactly as before.

---

## How I tested all this

I didn't want to just change config and hope, so I ran the whole app the way the README describes:

1. Installed all three apps, seeded a throwaway local MongoDB database, ran `npm run build`, and
   started the server.
2. **Before** the fix, I loaded `/admin/` and `/admin/login` in headless Chrome. Both rendered the
   404 page. I also confirmed that refreshing `/admin/listings/<id>/edit` loaded HTML where the
   JavaScript should be.
3. **After** the fix, I drove the dashboard in headless Chrome:
   - `/admin/` while logged out → redirects to the login form ✔
   - logging in as `jane@example.com` through the actual form → lands on `/admin/listings` with all
     6 listings ✔
   - clicking "Create listing" in the nav → `/admin/listings/new` ✔
   - hard refresh on `/admin/listings/<id>/edit` → the form loads with the listing filled in ✔
   - a made-up URL like `/admin/does-not-exist` → the admin 404, and "Back to listings" stays inside
     the admin ✔
   - the guest site at `/` still works ✔
   - no console errors or uncaught exceptions on any of it ✔
4. Sent the same multipart request the form sends, both before and after fix #3, and compared what
   was stored.
5. Ran `npm run seed` before and after fix #4 and checked which database it connected to.

Afterwards I deleted the test database, the test uploads and the temporary `.env`.

### Checking it yourself

```bash
npm run build      # needed, because dist/ isn't in git
npm run seed
npm start
```

Then open `http://localhost:5000/admin`, log in as `jane@example.com` / `password321`, and click
around. Try refreshing on an edit page as well, since that's where the blank screen used to show up.

---

## Things I noticed but didn't change

None of these break anything you'd hit in a demo, so I left them alone to keep this change focused.
They're worth knowing about, though:

- **`server/memtest.js`** is a leftover test script with hardcoded Linux paths
  (`/home/user/airbnb-clone/...`). It isn't used anywhere and could probably be deleted.
- **The location filter** in `getAccommodations` drops the search text straight into a
  `new RegExp(...)`. Searching for something like `(` makes the regex invalid and returns a 500
  error. Escaping it the same way `userController.js` already does for usernames would fix that.
- **Deleting a listing** removes it from the database but leaves its uploaded photos in
  `server/uploads`.
- **In `updateAccommodation`**, the "At least one image is required" check runs after the errors
  have already been checked, so it never actually stops anything. In practice the form's own
  validation catches it first.
- **First install is slow:** newer npm versions ask before running install scripts, and
  `mongodb-memory-server` downloads a 600–800 MB MongoDB binary the first time the sandbox
  database runs. If you already have MongoDB installed, setting `MONGO_URI` in `server/.env` skips
  all of that (and with fix #4, the seed script now respects it).
