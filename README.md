# Zyvrix — Content & Styles Guide

This repository powers a static marketing and transactional experience for Zyvrix. The project now separates content and presentation concerns into smaller, purposeful modules so contributors can update copy, data, or styles without combing through multi-thousand-line files.

## Project layout

```
assets/
├── css/
│   ├── base/           # Design tokens, resets, layout, navigation, buttons
│   ├── components/     # Page/feature level component styles
│   └── styles.css      # Entry stylesheet importing the modular partials
├── img/                # SVG & bitmap assets
└── js/
    ├── core/           # Infrastructure utilities (theme, forms, performance, etc.)
    ├── data/           # Content modules grouped by site meta + per-page payloads
    │   ├── pages/      # Home, About, Pricing, Contact, Legal, Auth, etc.
    │   ├── site/       # Organization profile, navigation, forms, FAQs, catalogues
    │   └── index.js    # Assembles `window.DATA` for renderers
    ├── features/       # Progressive enhancements (loader, quote generator, cart)
    ├── main.js         # Boots client-side hydration
    └── env.js          # (Sample provided) environment overrides for endpoints
```

HTML entry points live at the repo root (`index.html`, `pricing.html`, `about.html`, etc.) and consume `assets/js/data/index.js` plus the shared runtime in `assets/js/main.js`.

## Working with site data

All copy, imagery references, pricing tables, and call-to-action details now sit inside `assets/js/data/`:

- `site/organization.js` — Brand profile, location, SEO authorship, and legal details.
- `site/navigation.js`, `site/socials.js`, `site/footer.js` — Shared chrome content.
- `site/forms.js`, `site/contact.js`, `site/billing.js` — Form defaults, response copy, billing math.
- `site/pricingGroups.js`, `site/serviceCatalog.js`, `site/quoteCalculator.js`, `site/faqs.js` — Productised data used by multiple pages.
- `pages/*.js` — Page-specific payloads (hero copy, gallery cards, legal sections, etc.).
- `index.js` — Imports the modules above, assembles the `data` object, and exposes it globally at `window.DATA` for the renderers.

To adjust or add content:

1. Locate the relevant module under `assets/js/data/`.
2. Export new entries or edit existing objects (e.g., add a new FAQ in `site/faqs.js`).
3. The renderers will automatically pick up the change on reload because `window.DATA` preserves the original shape used by `assets/js/renderers/*`.

## Styling conventions

The former monolithic `base.css` and `components.css` have been divided into smaller stylesheets that mirror the UI structure:

- `assets/css/base/` contains fundamentals:
  - `tokens.css` — CSS custom properties for colours, spacing, and theme variants.
  - `reset.css` — Document-wide resets and default typography.
  - `helpers.css` — Utility helpers (screen reader text, reveal animations, muted text).
  - `layout.css` — Container sizing and global overlays (page loader).
  - `navigation.css` — Header, navigation, and mobile drawer styles.
  - `buttons.css` — Shared button treatments.
- `assets/css/components/` hosts feature-focused partials loaded in cascade order from `styles.css`:
  - `home.css`, `about.css`, `quote.css`, `contact.css`, `pricing.css`, `legal.css`, `detail.css`, `auth.css`, `cart.css`.

Edit the partial that matches the template you are working on; `assets/css/styles.css` simply `@import`s each fragment so browsers still receive a single bundle in development.

## Environment configuration

- Copy `assets/js/env.sample.js` to `assets/js/env.local.js` and update the values privately. The file is ignored by Git so deployment secrets stay out of the repository.
- `assets/js/env.js` automatically loads `env.local.js` when present and merges any server-provided `window.SECURE_ENV` values. It emits a `secure-env-ready` event once variables are available, which allows runtime features (like the authentication flow) to react when credentials are injected.
- Static HTML files reference `assets/js/data/index.js` with `<script type="module">`, so modern browsers will load the modular data without bundling.

### Authentication API

The front-end no longer stores customer accounts in `localStorage`. A lightweight Express API in `server/` persists customers to MySQL using the schema in `database/init.sql`. Passwords are hashed with bcrypt and never sent back to the browser.

1. Install dependencies with `npm install`.
2. Copy your environment secrets into a `.env` file (see `server/config.js` for the variable names).
3. Start the API with `npm run start` (defaults to port `4000`). The front-end will call `/api/auth/*` endpoints.

## Local development tips

- Open any HTML page directly in a browser for quick previews—the assets are all relative paths.
- When adjusting data or styles, reload the page; the renderers hydrate content based on `document.body.dataset.page`.
- Keep related assets together: add new component styles as a sibling partial and new data next to similar modules.

## Testing

This project doesn’t ship a build toolchain. After modifying data or styles, manually load the relevant HTML pages to confirm everything renders as expected.
