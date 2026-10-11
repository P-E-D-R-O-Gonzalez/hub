import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = value => JSON.stringify(value, null, 2) + '\n';

export function validate(input) {
  const values = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, String(value).trim()]));
  if (!values.name || values.name.length > 100 || /[\x00-\x1f<>]/.test(values.name)) throw new Error('Use a site name of 1–100 characters, without HTML.');
  values.repo = values.repo.replace(/^https:\/\/github\.com\//i, '').replace(/\/$/, '').replace(/\.git$/, '');
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]+$/.test(values.repo) || /\/(?:\.|\.\.)$/.test(values.repo)) throw new Error('Enter your GitHub repository as account/repository or its https://github.com URL.');
  if (!values.branch || /[\s~^:?*\[\\\x00-\x1f\x7f]/.test(values.branch) || /\.\.|@\{|\/\/|^[-/]|[/.]$/.test(values.branch) || values.branch === '@' || values.branch.split('/').some(part => part.startsWith('.') || part.endsWith('.lock'))) throw new Error('Enter a valid Git branch, such as main or template.');
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(values.worker)) throw new Error('Use a Worker name of 1–63 lowercase letters, numbers, or hyphens, with no hyphen at either end.');
  let url;
  try { url = new URL(values.origin); } catch { throw new Error('Enter the full public website address, starting with https://.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || url.port || !url.hostname.includes('.') || url.hostname === 'example.com') throw new Error('Use your real HTTPS website address without a path, port, password, or query.');
  values.origin = url.origin;
  return values;
}

export function checklist(v) {
  return `# Finish setting up ${v.name}

The wizard saved your public settings. It did not create accounts, deploy your website, or test a live sign-in.

## 1. Save your changes to GitHub

In your editor's Source Control panel, review the changed files, enter "Configure my website", choose Commit, then Sync Changes / Push. If prompted, sign in to GitHub in its own browser window.
Confirm the changes appear in https://github.com/${v.repo} on the **${v.branch}** branch. This must be your own copy of the template.

## 2. Connect Cloudflare (automatic publishing)

Open https://dash.cloudflare.com/ → Workers & Pages → Create application → connect your GitHub repository. Choose Workers and **${v.repo}**. Approve GitHub access to this repository when asked.
Use these exact settings:

- Worker/project name: ${v.worker}
- Production branch: ${v.branch}
- Root directory: main
- Build command: npm run build
- Deploy command: npx wrangler deploy

For an existing Worker, connect the repository under Settings → Builds instead. Make sure changes in main/src/data trigger builds. Cloudflare manages its build credential; do not copy an API token into this wizard or your repository.
Deploy and wait for success. The public site should load before CMS login is configured.
Your expected site address is ${v.origin}. Compare it with the address Cloudflare shows. For a custom domain, connect it under Settings → Domains & Routes first. If the address differs, rerun npm run setup with the actual address, commit/push, and wait for another deployment before continuing.

## 3. Create your GitHub sign-in app

Open https://github.com/settings/applications/new (a GitHub **OAuth App**, not a GitHub App) and copy:

- Application name: ${v.name} CMS
- Homepage URL: ${v.origin}
- Authorization callback URL: ${v.origin}/api/callback

Leave device flow disabled. If an "Expire user access tokens" option appears, disable it: this template does not refresh expiring tokens. Register the application.
Keep this page open. Generate a client secret only when ready to copy it directly into Cloudflare below.

## 4. Add credentials directly in Cloudflare

Open Workers & Pages → **${v.worker}** → Settings → **Variables and Secrets** (runtime settings, not the Builds variables).
Add both values using type **Secret**:

- GITHUB_CLIENT_ID: copy the Client ID from your GitHub OAuth App.
- GITHUB_CLIENT_SECRET: copy the generated client secret from that same app.

Save and deploy the change. Never paste secrets into chat, this checklist, CMS fields, source files, or the wizard. No personal access token is needed. If you expose a secret, revoke it in GitHub, generate a replacement, and update Cloudflare.
SITE_ORIGIN and GITHUB_REPO are already saved in wrangler.jsonc; do not add a different value in the dashboard.

## 5. Check editing and automatic publishing

Open ${v.origin}/admin/ and sign in with GitHub. The account needs write access to **${v.repo}**. GitHub asks for the repo scope used by Decap; review that authorization. Organization-owned repositories may require an administrator's OAuth approval.
Edit Pages → Branding, publish a small change, and check that a commit appears on **${v.branch}**, a Cloudflare build runs, and the public page updates. Protected branches that require pull requests can prevent direct publishing; use a branch where your editors are permitted to publish.
Then customize Home page links (replace example.com placeholders), Branding, Weather, Local Groups, and Local Media in the CMS.

## If something goes wrong

- "CMS login is not configured": check both runtime secrets and deploy again.
- "Invalid authentication origin" or callback errors: the website address, SITE_ORIGIN, CMS base_url, and OAuth callback must use the same HTTPS domain. Rerun the wizard after a domain change, then update the OAuth App callback.
- Repository access denied: check the repository spelling, editor write permission, and organization approval.
- Saving works but the website is unchanged: check the Cloudflare build log, production branch, and root directory above.

You can rerun npm run setup. It preserves content and creates a local backup before replacing settings. Backups live in .setup-backups/ and are excluded from Git.

References: [Decap GitHub backend](https://decapcms.org/docs/github-backend/), [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [Cloudflare Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
`;
}

export async function prepare(root, input) {
  const v = validate(input);
  const paths = ['public/admin/config.yml', 'wrangler.jsonc', 'src/data/branding.json'];
  const originals = await Promise.all(paths.map(path => readFile(resolve(root, path), 'utf8')));
  // These template files intentionally use JSON (also valid YAML/JSONC).
  // Parse all files before making any changes; never evaluate configuration as code.
  let cms, worker, branding;
  try { [cms, worker, branding] = originals.map(JSON.parse); }
  catch { throw new Error('Settings could not be read. Keep config.yml and wrangler.jsonc in the template’s JSON format (no comments or trailing commas). No files changed.'); }
  cms.backend = { ...cms.backend, name: 'github', repo: v.repo, branch: v.branch, base_url: v.origin, auth_endpoint: 'api/auth' };
  cms.site_url = v.origin;
  cms.display_url = v.origin;
  worker.name = v.worker;
  worker.vars = { ...worker.vars, SITE_ORIGIN: v.origin, GITHUB_REPO: v.repo };
  if (worker.vars.GITHUB_CLIENT_ID === 'your-github-client-id-goes-here') delete worker.vars.GITHUB_CLIENT_ID;
  const oldName = branding.site_name;
  branding.site_name = v.name;
  if (!branding.browser_title || branding.browser_title === oldName) branding.browser_title = v.name;
  if (!branding.logo || branding.logo_alt === oldName) branding.logo_alt = v.name;
  return { values: v, files: paths.map((path, index) => ({ path, before: originals[index], after: json([cms, worker, branding][index]) })), guide: checklist(v) };
}

export async function save(root, plan) {
  const backup = resolve(root, '.setup-backups', new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid);
  await mkdir(backup, { recursive: true });
  const files = [...plan.files];
  let oldGuide = null;
  try { oldGuide = await readFile(resolve(root, 'SETUP-CHECKLIST.md'), 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  files.push({ path: 'SETUP-CHECKLIST.md', before: oldGuide, after: plan.guide });
  for (const file of files) {
    if (file.before === null) continue;
    const path = resolve(backup, file.path);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file.before);
  }
  for (const file of files) await writeFile(resolve(root, file.path), file.after);
  return backup;
}

function git(...args) {
  try { return execFileSync('git', args, { cwd: project, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
}

async function main() {
  if (!process.stdin.isTTY) throw new Error('Run npm run setup in an interactive terminal so you can answer the questions.');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log('\nCommunity website setup\nOnly public information belongs here. Never enter passwords, API keys, or secrets.\nPress Ctrl+C to cancel before saving.\n');
    const cms = JSON.parse(await readFile(resolve(project, 'public/admin/config.yml'), 'utf8'));
    const branding = JSON.parse(await readFile(resolve(project, 'src/data/branding.json'), 'utf8'));
    const worker = JSON.parse(await readFile(resolve(project, 'wrangler.jsonc'), 'utf8'));
    const remote = git('remote', 'get-url', 'origin').replace(/^git@github.com:/, '').replace(/^https:\/\/github.com\//, '').replace(/\.git$/, '');
    const configured = worker.vars?.GITHUB_REPO && !worker.vars.GITHUB_REPO.startsWith('YOUR-');
    const values = { name: 'My Community', repo: 'account/repository', branch: 'main', worker: 'community-hub', origin: 'https://community.example.org' };
    async function ask(key, label, fallback = '') {
      while (true) {
        const answer = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim() || fallback;
        try { values[key] = validate({ ...values, [key]: answer })[key]; return; }
        catch (error) { console.log(error.message); }
      }
    }
    await ask('name', '1/5 What is your website called?', branding.site_name === 'Your Page Name' ? '' : branding.site_name);
    console.log('\nUse your own copy of the repository, not the original template. Copy its GitHub URL from your browser.');
    await ask('repo', '2/5 GitHub repository', configured ? cms.backend.repo : remote === 'P-E-D-R-O-Gonzalez/hub' ? '' : remote);
    console.log('\nThe branch is shown above the file list on GitHub. Choose the branch Cloudflare will publish.');
    await ask('branch', '3/5 Publishing branch', configured ? cms.backend.branch : git('branch', '--show-current') || 'main');
    await ask('worker', '4/5 Cloudflare Worker name (a short lowercase website name)', configured ? worker.name : values.repo.split('/')[1].toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 63).replace(/-+$/, '') || 'community-hub');
    console.log('\nFind your workers.dev subdomain in Cloudflare → Workers & Pages. Your address is https://WORKER-NAME.YOUR-SUBDOMAIN.workers.dev.\nYou can also use a custom HTTPS domain you will connect to this Worker. If unsure, create the Worker first and copy its address.');
    await ask('origin', '5/5 Full public website address', configured ? worker.vars.SITE_ORIGIN : '');
    const plan = await prepare(project, values);
    console.log(`\nReview:\nWebsite: ${values.name}\nRepository: ${values.repo}\nBranch: ${values.branch}\nWorker: ${values.worker}\nAddress: ${values.origin}\n\nUpdates CMS login settings, hosting settings, and site name. Creates SETUP-CHECKLIST.md with your remaining steps.\nExisting settings are backed up locally. Nothing is committed, pushed, or deployed.\n`);
    if (!/^y(es)?$/i.test((await rl.question('Save these settings? (yes/no) [no]: ')).trim())) { console.log('Cancelled. No files changed.'); return; }
    const backup = await save(project, plan);
    console.log(`\nSettings saved! Open main/SETUP-CHECKLIST.md in your editor for the next steps.\nBackup: ${backup}\n`);
  } finally { rl.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`Setup stopped: ${error.message}`); process.exitCode = 1; });
}
