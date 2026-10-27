# Eventify - College Event Management System

Built with **Node.js, Express, express-session and bcryptjs** on the server, and **plain HTML, CSS and JavaScript** in the browser (no EJS, no frameworks). Data is stored in a JSON file (`data/db.json`), so there is **no database to install**.

## How to run

```bash
npm install
npm run seed     # fills demo data (run again any time to reset)
npm start        # open http://localhost:3000
```

Demo accounts (password for all: `demo123`):
- Organiser: `organiser@demo.com`, `priya@demo.com`
- Student: `student@demo.com`, `simran@demo.com` (more in `seed.js`)

## Features

**Organiser:** create / edit / delete events (name, description, category, date, start and end time, venue, optional ticket price, seats), design the winner certificate, mark attendance, announce 1st/2nd/3rd place (only present students can win), export attendees as CSV.

**Student:** browse events, filter by category, search, register, view ticket, cancel registration, see attendance percentage, download participation and winner certificates (Download PDF -> "Save as PDF").

Extras: dark mode, mobile layout, seat counter, Google Calendar link, countdown to next event.

## Project structure

```
event-management-system/
|-- server.js            starts Express, sessions and connects all routes
|-- db.js                readData() / saveData() / nextId() for data/db.json
|-- helpers.js           server helpers: event status, seats left, ticket code
|-- middleware.js        login guards (requireStudent, requireOrganiser, page guards)
|-- seed.js              creates demo data
|-- data/db.json         the "database": users, events, registrations
|
|-- routes/              SERVER: what happens for each URL
|   |-- pages.js         sends the HTML files  (res.sendFile)
|   |-- auth.js          /api/me, /api/login, /api/register, /logout
|   |-- events.js        /api/home, /api/events, /api/events/:id   (public data)
|   |-- student.js       /api/student/...   (register, cancel, ticket, attendance, certificates)
|   `-- organiser.js     /api/organiser/... (create, edit, delete, attendance, results, CSV)
|
|-- pages/               HTML pages (structure only)
|   |-- index.html  events.html  event.html  login.html  register.html  404.html
|   |-- certificate.html
|   |-- student/    dashboard.html  ticket.html  attendance.html  certificates.html
|   `-- organiser/  dashboard.html  event-form.html  manage.html
|
`-- public/              files the browser downloads directly
    |-- css/             style.css, certificate.css
    `-- js/
        |-- helpers.js     format date/time/price, esc(), categories
        |-- api.js         api() = fetch wrapper, flashNext()
        |-- components.js  HTML for event card, registration row
        |-- layout.js      builds header + footer, theme, toast, then calls startPage()
        `-- pages/         one JS file per page (index.js, events.js, event.js, ...)
```

## How one request works (example: opening an event)

1. Browser asks `GET /events/7`. `routes/pages.js` sends `pages/event.html` (only the empty page).
2. The page loads its scripts. `layout.js` calls `GET /api/me` (who is logged in?), draws the menu, then calls `startPage()`.
3. `startPage()` in `public/js/pages/event.js` calls `GET /api/events/7` with `fetch`.
4. `routes/events.js` reads `db.json`, adds seats/status and answers with **JSON**.
5. The page JS builds the HTML from that JSON and shows it. Buttons (Register) call `POST /api/student/register/7`.

## Login protection (two roles)

- **API:** `router.use(requireStudent)` / `router.use(requireOrganiser)` run before every student / organiser route. Not logged in -> 401, wrong role -> 403.
- **Pages:** `studentPage` / `organiserPage` guards in `routes/pages.js` redirect to the login page.
- An organiser can edit only his own events (`findOwnEvent` checks `organiserId`).

## API list

| Method | URL | Who | Purpose |
|---|---|---|---|
| GET | /api/me | all | current user |
| POST | /api/register, /api/login | all | create account, login |
| GET | /logout | all | destroy session |
| GET | /api/home, /api/events, /api/events/:id | all | public event data |
| GET | /api/student/dashboard, /attendance, /certificates, /ticket/:regId, /certificate/:regId/:type | student | my data |
| POST | /api/student/register/:eventId, /cancel/:regId | student | register, cancel |
| GET | /api/organiser/dashboard, /events/:id, /events/:id/manage | organiser | my events |
| POST | /api/organiser/events | organiser | create event |
| PUT | /api/organiser/events/:id | organiser | edit event |
| DELETE | /api/organiser/events/:id | organiser | delete event |
| POST | /api/organiser/events/:id/attendance | organiser | save attendance |
| POST / DELETE | /api/organiser/events/:id/results | organiser | announce / remove results |
| GET | /api/organiser/events/:id/certificate-preview, /export | organiser | preview, CSV |

## Viva cheat-sheet

**1. How does the app work?** Express serves plain HTML files. Each page runs JavaScript that calls the server with `fetch()`, receives JSON and shows it. The server never builds HTML.

**2. Why HTML + JSON instead of a template engine?** It separates front-end (HTML/CSS/JS) from back-end (Express API). The same API could later serve a mobile app.

**3. What does `fetch` do?** Sends an HTTP request from the browser. `api()` in `api.js` wraps it: sends JSON, reads the JSON answer and throws an Error if the status is 400 or higher.

**4. How does login work?** Password is checked with `bcrypt.compareSync(password, hash)`. If correct we store `{id, name, role}` in `req.session.user`. `express-session` keeps it in a cookie, so every later request knows the user.

**5. Why bcrypt?** We never save plain passwords. bcrypt makes a salted one-way hash.

**6. What is middleware?** A function `(req, res, next)` that runs before the route. `next()` continues, a response stops. Example: `requireOrganiser`.

**7. Which database?** A JSON file read with `fs.readFileSync` and written with `fs.writeFileSync` (`db.js`). Three lists: users, events, registrations. MongoDB/MySQL would only replace `db.js`.

**8. GET, POST, PUT, DELETE?** GET reads data, POST creates / performs an action, PUT updates, DELETE removes.

**9. `req.params`, `req.query`, `req.body`?** `/events/:id` -> `req.params.id`; `?category=Sports` -> `req.query.category`; JSON from fetch -> `req.body` (needs `express.json()`).

**10. What is `esc()` and why do we need it?** We build HTML strings in JS. `esc()` converts `<` `>` `&` `"` to safe text, so a user cannot inject `<script>` through an event name (XSS).

**11. What is `startPage()`?** Every page script defines it. `layout.js` runs last, loads the user, draws the header, then calls `startPage(user)`.

**12. How are seats left calculated?** `capacity - registrations with status "registered"` (`decorateEvent` in helpers.js).

**13. How is event status decided?** `getStatus` compares the current time with the start and end time: upcoming / ongoing / completed.

**14. Cancel registration?** The record is not deleted; `status` becomes `cancelled`. Registering again re-activates the same record, so there are no duplicates.

**15. Attendance and winners?** The organiser ticks students; the browser sends `{ present: [ids] }`. Winners are saved in the event as `results {first, second, third}`; only present students are allowed. Certificate routes check `attended` (participation) or a winning position (winner). The certificate is an HTML page styled for print, so the browser saves it as PDF.

**16. Event delegation?** Buttons created by JS (Cancel, Delete) do not exist when the page loads, so we listen for clicks on `document` and check `event.target.closest('[data-cancel]')`.

**17. Security points:** hashed passwords, session cookie, role guards, ownership checks, `esc()`, server-side validation. Improvements: CSRF tokens, rate limiting, secret key in `.env`.

## Git Workflow

This project uses Git for version control.

### Branching Strategy
- `main`: Contains the stable version of the project.
- `docs/project-documentation`: Used for documentation updates.

### Commit Message Convention
- `feat`: New features.
- `fix`: Bug fixes.
- `docs`: Documentation changes.
- `refactor`: Code improvements.

### Development Workflow
1. Create a feature branch.
2. Make the required changes.
3. Commit changes with meaningful messages.
4. Push the branch to GitHub.
5. Create a Pull Request to merge changes into `main`.
