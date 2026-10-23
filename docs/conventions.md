# Conventions

- Layers: `lib` / `ui` / `platform` / `data` → `features` → `app`. A feature never imports another feature. `lib` has no React/DOM/fetch.
- Business rules (slots, agenda, validation) are pure functions in `src/lib` with a test next to them.
- Views never call `fetch`, timers or browser APIs: `data/` hooks and `platform/web/` adapters.
- Styling: Tailwind utilities with tokens from `src/index.css` `@theme` (`fg-1/2/3`, `text-caption/body/title/display`, `rounded-card/control`). No raw sizes or colours in features.
- A class bundle used twice becomes a `ui/` primitive.
- User-facing text is Russian; code and comments English.
