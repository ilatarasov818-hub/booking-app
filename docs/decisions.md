# Decisions

## 2026-10-23 Stack: React + Vite + Tailwind v4, Hono on Node
- Why: one language end to end; slot math in `src/lib` runs on the server (authoritative) and is importable on the client.
- Server runs TS via `tsx`, no separate server build.

## 2026-10-23 Storage: JSON files, not a database
- Why: one master = tens of bookings a week; zero native deps keeps `npm install` trivial on Windows.
- Sync file I/O in one process makes check-then-book atomic (no double booking).
- Revisit when: several masters per deploy, or more than one server process.

## 2026-10-23 Times are local to the business
- Bookings store `date` (YYYY-MM-DD) + `start` (minutes of day) in `config.timezone`. "Now" is converted with `Intl`; no UTC math on slots.

## 2026-10-23 Notifications: master's own Telegram bot
- Token in `.env`; chat linked from the admin page via the latest private message to the bot. No messages to clients yet (needs consent + their chat id).

## 2026-10-23 Clients manage bookings by a secret link
- Each booking gets a random `token`; `/my/<token>` lets the client reschedule or cancel. No client accounts: the link is the credential (shown after booking, saved in localStorage and in the `.ics`).
- Changes close `minLeadMinutes` before the start, same as new bookings; after that only by phone.
