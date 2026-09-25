# Local Groups with Decap CMS

Open `/admin/`, then **Pages → Local Groups**, to edit section titles and add,
reorder, or remove groups in the four categories. Each group has a name, optional
website, and plain-text description. Content lives in `src/data/local-groups.json`.

## Local editing

Start Astro from the `main` project directory with `npm run dev -- --background`.
In another terminal, run `npx decap-server` from the Git repository root,
`C:\Users\pdgon\Documents\GitHub\hub` (one directory above the Astro project).
Open `http://localhost:4321/admin/`. Decap's local proxy saves to local files
without GitHub login. Keep this development proxy on localhost only.
It has not been installed or started for you.

The CMS config paths deliberately begin with `main/` because they are relative
to the Git repository root. Do not run the proxy from the Astro subdirectory.

## Cloudflare Pages deployment

Connect `P-E-D-R-O-Gonzalez/hub` in Cloudflare **Workers & Pages → Create → Pages →
Import an existing Git repository**. Use these settings:

- Production branch: `main`
- Root directory: `main` (the Astro app is in a repository subdirectory)
- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist` (relative to the root directory above)
- Node version: 24, also recorded in `.node-version`

Keep automatic production deployments enabled. Decap publishes content changes as
GitHub commits, which trigger Pages builds. A separate CMS deploy webhook is not
needed with this Git integration. The public page updates after the build deploys.
The current Astro site is static and does not need an SSR adapter.

## GitHub login on Cloudflare: setup pending

Cloudflare hosting does not by itself configure Decap's GitHub OAuth login. The
current CMS config still has the default authentication behavior. Before using
production `/admin/`, deploy an OAuth service and point Decap to it.

Decap lists a community-maintained
[Cloudflare Pages Functions OAuth integration](https://github.com/i40west/netlify-cms-cloudflare-pages)
in its [external OAuth clients documentation](https://decapcms.org/docs/external-oauth-clients/).
This can host authentication alongside the site. Its functions would live in
`main/functions/`, outside `public/` and `dist/`, because `main` is the Pages project
root. The integration has not been installed or deployed yet.

Once the final Pages URL or custom domain is known:

1. Configure the OAuth service and create a GitHub OAuth App with the site's
   homepage and the callback URL required by that service.
2. Store `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the Pages runtime
   configuration, with the secret encrypted. Never add the secret to the repository
   or to `public/admin/config.yml`.
3. Set `backend.base_url` to the OAuth service origin and `backend.auth_endpoint`
   to its login route in `public/admin/config.yml`. Set `backend.site_domain`
   as required by the chosen service. Use the stable production domain, not a
   temporary preview deployment URL.
4. Deploy and verify login at `/admin/` with a GitHub user who has push access to
   the repository. Publish a small content edit and confirm the resulting Pages
   deployment updates `/localgroups/`.

Do not treat a successful static build as proof that OAuth works. Cloudflare account
setup, OAuth credentials, and the production login/publish test are still pending.

References: [Cloudflare Astro deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/),
[build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/),
and [Decap GitHub backend](https://decapcms.org/docs/github-backend/).

## Verification

Run `npm run build`. To verify editing end to end, start the local proxy, edit a
group, save, and check `/localgroups/`. The page validates required fields and
website protocols at build time, and renders descriptions as escaped plain text.

The Decap 3.x CDN bundle loads only on the admin page. References:
[installation](https://decapcms.org/docs/install-decap-cms/) and
[file collections](https://decapcms.org/docs/collection-file/).
