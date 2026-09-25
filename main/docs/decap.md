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

## Cloudflare Workers deployment

The production site is `https://hub.pdgonzalez2004.workers.dev` on **Workers**.
Earlier Pages instructions do not apply. `wrangler.jsonc` serves the Astro `dist`
assets and runs `worker/index.js` for `/api/auth` and `/api/callback`.
No Astro SSR adapter is needed.

For the existing Cloudflare Worker `hub`, connect the GitHub repository and configure
Workers Builds with root directory `main`, production branch `main`, build command
`npm run build`, and deploy command `npx wrangler deploy`. Ensure changes under
`main/src/data/` trigger builds. If the existing deploy command includes `--assets`
or was auto-generated, replace it with the command above so Wrangler uses the checked-in
configuration and includes the OAuth Worker.

These local changes have not been pushed or deployed. After deployment, publishing
in Decap commits the content file to GitHub. Workers Builds must be connected for
those commits to rebuild and deploy the public site automatically.

## Set up the GitHub OAuth App

In GitHub **Settings → Developer settings → OAuth Apps → New OAuth App**, use:

- Application name: `Fontana Aware CMS`
- Homepage URL: `https://hub.pdgonzalez2004.workers.dev`
- Authorization callback URL: `https://hub.pdgonzalez2004.workers.dev/api/callback`

In Cloudflare **Workers & Pages → hub → Settings → Variables and Secrets**, add:

- `GITHUB_CLIENT_ID`: the OAuth App client ID
- `GITHUB_CLIENT_SECRET`: the generated secret, stored as a Secret

Do not paste the client secret into chat, the CMS config, or source files. The
`SITE_ORIGIN` variable is already set in `wrangler.jsonc`. The public CMS config
points to this origin and the `api/auth` login route.

Deploy the updated Worker and visit
`https://hub.pdgonzalez2004.workers.dev/admin/`. Sign in with a GitHub account that
has write access to `P-E-D-R-O-Gonzalez/hub`. The OAuth App requests GitHub's `repo`
scope for Decap's GitHub backend; the callback checks write access to this repository
before returning the token to the CMS. GitHub's authorization screen explains the
scope before access is granted.

The login flow uses a short-lived secure cookie, state validation, PKCE, and an
origin-checked popup handshake. Credentials are used only by the Worker. Authentication
responses are not cached. The implementation has local automated tests, but live
login and publishing still need verification after credentials and deployment are ready.
Local Astro development does not serve the Worker OAuth routes; use the local Decap
proxy described above to edit locally.

References: [Worker static assets](https://developers.cloudflare.com/workers/static-assets/binding/),
[GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps),
and [Decap GitHub backend](https://decapcms.org/docs/github-backend/).

## Verification

Run `node --test tests/cms-auth.test.js` and `npm run build`. To verify editing end to end, start the local proxy, edit a
group, save, and check `/localgroups/`. The page validates required fields and
website protocols at build time, and renders descriptions as escaped plain text.

The Decap 3.x CDN bundle loads only on the admin page. References:
[installation](https://decapcms.org/docs/install-decap-cms/) and
[file collections](https://decapcms.org/docs/collection-file/).
