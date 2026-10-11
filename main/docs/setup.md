# Set up your community website

You need a GitHub account, a Cloudflare account, and your own copy of this
repository's **template** branch. The wizard prepares the files; you finish account
permissions and credentials on the providers' own websites.

## 1. Make your own copy

On GitHub, use **Use this template → Create a new repository** if available and
select **Include all branches**, then use the `template` branch in your copy.
If that button is unavailable, use **Fork**, uncheck **Copy the main branch only**,
and select `template` in your fork. Copy your new repository's URL. Do not configure
the original repository as your website's content store.

For an installation-free editor, open your copy's `template` branch, then
**Code → Codespaces → Create codespace**. Codespaces availability and usage limits
depend on your GitHub account. Alternatively, clone your copy to your computer,
check out `template`, and install Node.js 22.12 or newer.

## 2. Run the wizard

Open the editor's Terminal panel. From the repository folder, run these commands
one at a time:

```sh
cd main
npm install
npm run setup
```

If the terminal already ends in `/main`, skip `cd main`.

Answer five questions:

- Your website's display name.
- Your own GitHub repository URL (or `account/repository`).
- The publishing branch. Accept `template` if that is the branch you copied.
- A Cloudflare Worker name: a short lowercase name such as `my-town-hub`.
- Your public HTTPS website address. For a Cloudflare address, find your
  workers.dev subdomain in Workers & Pages and use
  `https://WORKER-NAME.YOUR-SUBDOMAIN.workers.dev`. You can create the Worker first
  to find its address. A custom domain is also supported once connected to the Worker.

Press Enter to accept a suggested answer. Review the summary, then type `yes` to
save. Until then, cancelling leaves your files untouched.

The wizard updates `public/admin/config.yml`, `wrangler.jsonc`, and
`src/data/branding.json`, preserving your CMS collections and existing content.
It creates local backups in `.setup-backups/`, excluded from Git. The template's
configuration uses JSON syntax, including in the `.yml` and `.jsonc` files; keep
that syntax if you edit these files yourself.

## 3. Open your personalized checklist

In the editor's file list, open **main → SETUP-CHECKLIST.md**. It gives you the exact
values and links to:

1. Commit and push your settings to your copy on GitHub.
2. Connect Cloudflare to automatically build and publish your selected branch.
3. Register a GitHub OAuth App with the correct website and callback addresses.
4. Copy its credentials directly into Cloudflare's runtime secrets.
5. Sign in to `/admin/`, publish a change, and check the live site updates.

The wizard never needs a GitHub personal access token or a Cloudflare API key.
It never asks for the OAuth client secret. The checklist explains exactly where
to store credentials. Your site can deploy before the credentials are added;
CMS sign-in will work only after you complete those steps.

You can rerun the wizard when your domain, repository, branch, or site name changes.
After a domain change, also update the GitHub OAuth App callback using the new
checklist. Backups let you recover previous settings if needed; they are local,
so keep them private and do not commit them.
