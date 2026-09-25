# Astro Starter Kit: Basics

## Local Groups CMS

Local Groups uses Decap CMS at `/admin/` to edit content stored in
`src/data/local-groups.json`. See [Decap setup](docs/decap.md) for local editing
and Cloudflare Workers deployment with GitHub authentication.

## Local Media Instagram viewer

Local Media uses Instagram profile embeds with multiple sources, a source filter,
and refresh. Edit `defaultSources` in `src/lib/instagram.ts` to change the shared
accounts shown to all visitors. Sources cannot be added or removed in the viewer.
No API token or Elfsight subscription is required.

Embeds load when the Local Media panel opens. Instagram controls the recent posts
shown within each profile; this is a per-account viewer, not a combined chronological
post stream. Private accounts, disabled embeds, sign-in requirements, or browser
blocking can prevent a profile from rendering. Each card includes a direct link
to the account.

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
