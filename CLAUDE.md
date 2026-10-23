# booking-app

Online booking for a solo master (trainer, barber, tutor). Portfolio piece + template sold to small businesses; one deploy = one master, configured by `config.json`.

## Run
- `npm run check` = oxlint + vitest + build. Must be green before merge.
- `npm run dev` (vite :5173 + API :3000), `npm start` (build + serve on :3000).

## Map
- `src/lib/` pure TS shared by client and server: slot math (`slots.ts`), dates, phone, validation, formatting, `.ics`. Unit-tested.
- `server/` Hono API (`app.ts`, testable via `app.request`), JSON store in `DATA_DIR`, Telegram notifier.
- `src/{data,ui,platform/web,features/{booking,admin},app}` — layer rules: `docs/conventions.md`.

## Docs
- `docs/decisions.md` — why the stack and storage are what they are.
- `docs/conventions.md` — code rules.
