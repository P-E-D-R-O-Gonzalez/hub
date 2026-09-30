 Template Purpose:

Make it easy for communities and cities to have a relevant dashboard. They should have all information they need in  an accessible way. We all deserve the opportunity to be civily engaged in local matters.

Template setup guide:

index.astro: change your-page-name and your-link(s), and feedback form link

wrangler.jsonc: add your site domain and github id

/lib/instagram: add instagram profile names

/lib/local-groups.ts: add categories to category list

/src/data/local-groups.json: add your data manually or through CMS(see below)

## Languages

Every public page includes an English / Español switch. The selection is saved
in the visitor's browser and applies to navigation, controls, weather labels, and
dates. Maintain site-copy translations in `src/lib/translations.ts` when changing
page or CMS text. Untranslated custom content and third-party embeds retain their
original language. The switch requires JavaScript; English is the default.

## Local Groups CMS

Local Groups uses Decap CMS at `/admin/` to edit content stored in
`src/data/local-groups.json`. See [Decap setup](docs/decap.md) for local editing
and Cloudflare Workers deployment with GitHub authentication.

## Local Media Instagram viewer

Local Media uses Instagram profile embeds with multiple sources, a source filter,  
and refresh. Edit `defaultSources` in `src/lib/instagram.ts` to change the shared  
accounts shown to all visitors. Sources cannot be added or removed in the viewer.  
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


