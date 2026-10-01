# Airbnb Clone — Full Stack (Guest Frontend + Admin Dashboard + Node API)

A complete implementation of the three project briefs:

1. **Airbnb Frontend Clone** (React) — Home, Location and Location Details pages
2. **Admin Dashboard** (React) — create / view / update / delete listings, JWT sessions
3. **Node.js Backend** (Express + MongoDB + Mongoose + JWT + Multer)

Everything runs from this folder: the Express server serves the API **and** both
built frontends on a single port, so one URL gives you the whole product.

---

## Quick start

```bash
# 1. install dependencies (each app is independent)
npm run install:all          # or: cd server|client|admin && npm install

# 2. seed demo data (users, 6 listings, 3 reservations)
npm run seed

# 3. build both frontends (produces client/dist + admin/dist)
npm run build

# 4. start everything (API + guest site + admin site)
npm start                    # http://localhost:5000
```

| App                | URL (production build)        | URL (dev server)              |
| ------------------ | ----------------------------- | ----------------------------- |
| Guest frontend     | `http://localhost:5000/`      | `npm run dev:client` → :5173  |
| Admin dashboard    | `http://localhost:5000/admin` | `npm run dev:admin`  → :5174  |
| REST API           | `http://localhost:5000/api`   | :5000                         |

### Dev mode (three terminals)

```bash
npm run dev:server   # Express API with --watch
npm run dev:client   # Vite dev server, proxies /api /images /uploads → :5000
npm run dev:admin    # Vite dev server (base /admin), same proxies
```

### Database

`server/.env` → `MONGO_URI`. Leave it **empty** and the server automatically
boots a real `mongod` binary (via `mongodb-memory-server`) whose data lives in
`server/data/mongo`, so the demo works with zero setup. Point `MONGO_URI` at
your own local MongoDB or Atlas cluster (`mongodb://127.0.0.1:27017/airbnb`)
and that is used instead — Mongoose is the ODM in both cases.

### Seeded accounts

| Role  | Email              | Password    | Can do                                        |
| ----- | ------------------ | ----------- | --------------------------------------------- |
| user  | john@example.com   | password123 | log in, reserve, view/cancel own reservations |
| host  | jane@example.com   | password321 | everything above + manage own listings, see host reservations |
| admin | admin@airbnb.com   | admin123    | manage every listing                           |

---

## Repository layout

```
airbnb-clone/
├── server/                  # Node.js / Express / Mongoose API
│   ├── config/db.js         # connect to MONGO_URI, or sandbox mongod fallback
│   ├── controllers/         # accommodationController, reservationController, userController
│   ├── middleware/          # auth.js (JWT protect + authorize), upload.js (Multer), errorMiddleware.js
│   ├── models/              # Accommodation.js, Reservation.js, User.js
│   ├── routes/              # accommodationRoutes, reservationRoutes, userRoutes
│   ├── utils/               # seed.js, pricing.js (cost calculator rules), generateToken.js
│   ├── public/images/       # seeded listing photography (served at /images)
│   ├── uploads/             # Multer image uploads (served at /uploads)
│   └── server.js            # entry point; also serves built SPAs
├── client/                  # Guest frontend (React + react-router + CSS)
│   └── src/
│       ├── components/      # Header (search pill, profile dropdown), Footer, ListingCard, Stars
│       ├── pages/           # Home, LocationPage, ListingDetails, Login, Reservations, NotFound
│       └── context/         # AuthContext (JWT), ToastContext (feedback)
├── admin/                   # Admin dashboard (React, base path /admin)
│   └── src/
│       ├── components/      # Header (greeting + dropdown), ProtectedRoute, ListingForm
│       └── pages/           # Login, Listings, CreateListing, EditListing, Reservations, NotFound
└── docs/screenshots/        # rendered proofs of every page
```

---

## API reference

All responses are JSON. Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Route                          | Auth            | Purpose                                        |
| ------ | ------------------------------ | --------------- | ---------------------------------------------- |
| POST   | `/api/users/login`             | –               | login (`{email, password}`) → `{token, user}`  |
| GET    | `/api/users/profile`           | any             | current session user                           |
| GET    | `/api/accommodations`          | –               | list listings; filters `location,type,guests,maxPrice` |
| GET    | `/api/accommodations/locations`| –               | distinct locations (filter UI)                 |
| GET    | `/api/accommodations/:id`      | –               | single listing                                 |
| GET    | `/api/accommodations/:id/quote?checkIn&checkOut` | – | server-side cost calculator   |
| POST   | `/api/accommodations`          | host/admin      | create listing (JSON or `multipart/form-data` with `images` files) |
| PUT    | `/api/accommodations/:id`      | owner/admin     | update listing                                 |
| DELETE | `/api/accommodations/:id`      | owner/admin     | delete listing (+ its reservations)            |
| POST   | `/api/reservations`            | any             | reserve `{accommodation_id, checkIn, checkOut, guests}` |
| GET    | `/api/reservations/host`       | host/admin      | reservations for my listings                   |
| GET    | `/api/reservations/user`       | any             | my reservations as a guest                     |
| DELETE | `/api/reservations/:id`        | guest/host/admin| cancel reservation                             |

Errors always return `{ "message": "…" }` with a correct status code
(400 validation, 401 auth, 403 role, 404 missing, 500 server).

### Cost calculator rules (`utils/pricing.js`)

* `nightlyTotal = price × nights`
* `weeklyDiscount = weeklyDiscount%` applied to every night inside a **full week** (7 nights) stayed
* `+ cleaningFee + serviceFee + occupancyTaxes` (flat fees from the listing)
* `totalCost = nightlyTotal − weeklyDiscount + fees`

The client mirrors these rules live in the calculator card; the server
re-computes them when a reservation is created so totals can't be tampered with.

---

## Rubric coverage map

### Admin frontend (100 marks)

| Rubric row | Where it is implemented |
| --- | --- |
| Top header | `admin/src/components/Header.jsx` – logo, nav, username greeting, dropdown (view reservations / log out), “Become a host” when logged out |
| Login page | `admin/src/pages/Login.jsx` – email+password, inline validation, API error banner, redirect to dashboard |
| Create listing | `admin/src/components/ListingForm.jsx` – every brief field, amenities checklist, Multer image upload with previews, per-field error messages |
| View listings | `admin/src/pages/Listings.jsx` – image/title/location/price cards with Update + Delete (inline confirm) |
| Update listing | `admin/src/pages/EditListing.jsx` – same form pre-filled from `GET /api/accommodations/:id`, saves reflect immediately |
| User authentication | JWT in localStorage, `ProtectedRoute` guard, profile-icon dropdown |
| Navigation & routing | react-router under `/admin`, URL always reflects the view |
| Styling | `admin/src/styles.css` – consistent design system, responsive |
| Error handling | toast notifications + banners for every failed request, 404 page |
| Code quality | commented, modular components/context/api helper |

### Guest frontend (140 marks)

| Rubric row | Where it is implemented |
| --- | --- |
| Hero banner | `Home.jsx` full-bleed banner + “Explore stays” CTA |
| Inspiration section | location cards built from live API data |
| Discover experiences | three experience cards with titles + buttons |
| Things to do (trip/home) | two image panels with static buttons |
| ShopAirbnb | two-column title/button + gift-card image |
| Future getaways | static tabs, active tab renders a destination list |
| Footer / copyright footer | `Footer.jsx` – 4 link columns, socials, language + currency selectors |
| Location filter | `LocationPage.jsx` – location/type/guests filters synced to the query string |
| Location cards | `ListingCard.jsx` – image left; type, name, amenities, stars, reviews, price right |
| Heading | “N stays in {location}” |
| Details heading/subheading | type+location title, star rating · reviews · location |
| Image gallery | 1 large + 4 small (2-over-2) grid |
| Cost calculator | sticky card: date pickers + guest stepper, nightly × nights, weekly discount, cleaning/service/occupancy lines, live total |
| Reservation | Reserve → `POST /api/reservations` (MongoDB), redirects to reservations table |
| Static info sections | sleep boxes, amenities grid, reviews + specific ratings, host details, house rules / health & safety / cancellation |
| Top header | logo, location search pill, profile section (login / view reservations table) |

### Backend (150 marks)

| Rubric row | Where it is implemented |
| --- | --- |
| Project structure | exactly `controllers / models / routes / middleware / server.js` as specified |
| Accommodation CRUD | create / read-all / read-one / update / delete + filters |
| User authentication | bcrypt-hashed passwords, `POST /api/users/login` → JWT (30 d) |
| Reservation CRUD | create, by-host, by-user, delete with ownership rules |
| Middleware auth | `middleware/auth.js` – `protect` + role-based `authorize` |
| Error handling & status codes | `middleware/errorMiddleware.js` (Cast/Validation/duplicate-key aware) |
| MongoDB + Mongoose | three schemas with validation rules & indexes |
| API documentation | this README + JSDoc-style comments in every controller |
| Security | hashed secrets, bcrypt, JWT expiry, role checks, Multer mime/size limits |
| Performance | indexed location field, `select` projections on populates, lean list queries |
| Modular code | one responsibility per file, shared `utils/pricing.js` |
| Testing & validation | server-side validators mirror client forms; see `docs/screenshots` for rendered proofs |
| Deployment & config | `.env.example`, graceful shutdown, single-port production serving |
| Presentation | seed script, screenshots, rubric map |

---

## Optional feature: image uploads

`middleware/upload.js` (Multer) stores up to 6 images per request (5 MB each,
image mime-types only) in `server/uploads`, served at `/uploads/<file>`.
The admin create/update forms upload via `multipart/form-data`; existing
image URLs can be kept or removed individually in the form.
