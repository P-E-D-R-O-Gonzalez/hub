 Template Purpose:

Make it easy for communities and cities to have a relevant dashboard. They should have all information they need in  an accessible way. We all deserve the opportunity to be civily engaged in local matters.

Template setup guide:

index.astro: change your-page-name and your-link(s), and feedback form link

wrangler.jsonc: add your site domain and github id

Instagram sources: edit Pages → Local Media in /admin/

/lib/local-groups.ts: add categories to category list

/src/data/local-groups.json: add your data manually or through CMS(see below)

## Languages

Every public page includes an English / Español switch. The selection is saved
in the visitor's browser and applies to navigation, controls, weather labels, and
dates. Edit **Pages → Spanish translations** in `/admin/` when changing page or
CMS text. Translations are stored in `src/data/translations.json` and published
changes take effect after a rebuild. Untranslated custom content and third-party embeds retain their
original language. The switch requires JavaScript; English is the default.

## Local Groups CMS

Local Groups uses Decap CMS at `/admin/` to edit content stored in
`src/data/local-groups.json`. See [Decap setup](docs/decap.md) for local editing
and Cloudflare Workers deployment with GitHub authentication.

## Local Media Instagram viewer

Local Media uses Instagram profile embeds with multiple sources, a source filter,
and refresh. Edit **Pages → Local Media** in `/admin/` to add, remove, or reorder the shared accounts shown to all visitors. Sources cannot be added or removed in the viewer.
No API token is required.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:


| Command           | Action                                       |
| ----------------- | -------------------------------------------- |
|                   |                                              |
| `npm run dev`     | Starts local dev server at `localhost:4321`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |
|                   |                                              |
|                   |                                              |



## Branding

Edit **Pages → Branding** in `/admin/` to upload the site logo and browser favicon
and set the accessible logo description. Publish and rebuild to apply changes.
See [CMS documentation](docs/decap.md#editing-the-logo-and-favicon).

## Weather

Edit **Pages → Weather** in `/admin/` to change the location label, coordinates,
temperature and wind units, or hide the weather/air-quality panel. Publish and
rebuild to apply changes.
