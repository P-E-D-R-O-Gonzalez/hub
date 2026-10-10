# Pages with Decap CMS

Open `/admin/`, then **Pages → Get Involved**, to add the content displayed below
the fixed **Get Involved** heading at `/getting-involved/`. The Markdown editor
supports headings, paragraphs, lists, links, and images. The body starts empty;
no placeholder content is displayed. Content lives in `src/data/getting-involved.md`
and publishing requires a site rebuild, just like Local Groups.

Open `/admin/`, then **Pages → Local Groups → Categories**, to add, rename,
reorder, or remove categories. Expand a category to add, reorder, or remove its groups.
Category order controls the website dropdown. Deleting a category deletes its groups. Each group has a name, optional
website, and plain-text description. Content lives in `src/data/local-groups.json`.

## Editing Spanish translations

Open `/admin/` and choose **Pages → Spanish translations**. Expand an existing
entry to edit its Spanish text, or add an entry for new page or CMS content.
The English source must match the visible text exactly, including punctuation
and capitalization. Editing the source here does not change the English page.
For Markdown content, translate each text segment separately (links and bold
text split a paragraph into separate segments). These are plain-text translations.

Keep `{title}`, `{count}`, and `{account}` placeholders in dynamic translations;
you may move them within the sentence. Duplicate English sources, empty values,
and missing placeholders fail the build with an error. Multiple English phrases
may share a Spanish translation; the toggle remembers the original page text.
Removing an entry leaves that text in English.

Publish to save `main/src/data/translations.json` to GitHub. The site must rebuild
and deploy before visitors see the changes. Third-party embeds are not translated.

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

The production site is `https://fontanaware.org` on **Workers**.
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
- Homepage URL: `https://fontanaware.org`
- Authorization callback URL: `https://fontanaware.org/api/callback`

In Cloudflare **Workers & Pages → hub → Settings → Variables and Secrets**, add:

- `GITHUB_CLIENT_ID`: the OAuth App client ID
- `GITHUB_CLIENT_SECRET`: the generated secret, stored as a Secret

Do not paste the client secret into chat, the CMS config, or source files. The
`SITE_ORIGIN` variable is already set in `wrangler.jsonc`. The public CMS config
points to this origin and the `api/auth` login route.

Deploy the updated Worker and visit
`https://fontanaware.org/admin/`. Sign in with a GitHub account that
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

## Editing the home page

Open `/admin/` and select **Pages → Home page**. Expand a section to change its
heading, description, and button text. Add or remove sections, drag them to change
their order, or turn off **Show on homepage** to keep a section as a hidden draft.
The existing eight cards and footer links have been migrated without changing their content.

Choose **Link button** for an internal page or external website, **Embedded website**
for a panel loaded on click, **Text only** for an announcement, or **Local Media**
for the existing Instagram viewer (at most one visible Local Media section).
Link and embed cards require a website/page link and button text. Embed cards also
require an HTTPS embed URL. Some providers block embedding; their Visit website
link remains available. Use HTTPS external URLs or local paths such as `/localgroups/`.
Titles and descriptions are plain text, not HTML. Footer links are editable and reorderable.
Weather settings are editable under Pages → Weather. Logo and browser favicon are editable under Pages → Branding. Instagram accounts are editable under Pages → Local Media.

Content is saved to `main/src/data/homepage.json`. Publishing commits the data;
Cloudflare must build and deploy that commit before the homepage changes. Spanish
translations are optional and remain under **Pages → Spanish translations**.
Invalid links or incomplete visible cards fail the build with a Home page error.

## About Us

Open **Pages → About Us** to edit the Markdown body at `/about-us/`. The page uses
the same layout as Get Involved, including the brand, back link, and language toggle.
The body starts empty. Content is stored in `main/src/data/about-us.md`. The homepage
footer includes an About Us link, editable under **Home page → Footer links**.
Publish and rebuild/deploy the site for changes to appear.

## Editing Instagram sources

Open `/admin/` and select **Pages → Local Media**. Add, remove, or drag Instagram
sources to change their order. Enter each username with or without `@`, not a
profile URL. Each account may appear only once. Removing every account displays
the existing empty-state message in the viewer.

Content is stored in `main/src/data/instagram.json`. Publish and wait for the
site build and deployment before visitors see changes. Invalid or duplicate
usernames stop the build with a Local Media error. Instagram controls whether
a public profile can be embedded; its availability is not verified by the CMS.

## Editing the logo and favicon

Open **Pages → Branding** in `/admin/`. Upload a site logo and browser favicon,
and enter an accessible logo description. Logos fit within the header without
cropping. PNG, JPG, WebP, GIF and SVG logos are supported; favicons accept PNG,
ICO or SVG. Use a square favicon. Clear an image field to restore the original
branding. Uploads are saved under `main/public/uploads/`.

Publish and wait for the build and deployment. Browsers can cache favicons;
use a new filename when replacing an icon. Installed-app manifest icons and
Apple home-screen icons remain separate from this browser favicon setting.

## Editing weather settings

Open **Pages → Weather** to change the displayed city/location name, latitude,
longitude, temperature units, and wind speed units. Coordinates determine both
weather and air quality; the city label alone does not relocate the readings.
Air quality remains the US AQI scale. Turning off **Show weather and air quality**
removes the panel and prevents its API requests and refresh timer.

Publish and wait for the site build/deployment. Settings live in
`main/src/data/weather.json`; invalid coordinates or units fail the build.
Fontana coordinates, Fahrenheit, and mph are the initial defaults.

## Site name and browser title

In **Pages → Branding**, edit **Site name** to update the Back to… links on
public subpages and the template’s text logo. Edit **Browser tab title** to set
the title on all public pages; leave it blank to use the site name. The Back to
prefix switches to Spanish while the chosen name remains unchanged. Publish
and wait for deployment. Logo descriptions remain separate for accessibility.
The CMS admin title and installed-app manifest name are separate settings.
