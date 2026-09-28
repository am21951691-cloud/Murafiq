# Cloudflare Deployment & Management Guide for Murafiq (مُرافِق)

This document provides instructions for deploying, managing, and maintaining the **Murafiq Resolution Platform** on Cloudflare Pages and the Cloudflare Edge network.

---

## 1. Quick Overview

- **Repository**: [https://github.com/am21951691-cloud/Murafiq](https://github.com/am21951691-cloud/Murafiq)
- **Deployment Platform**: Cloudflare Pages
- **Framework**: Next.js 15 (App Router)
- **Edge Adapter**: `@cloudflare/next-on-pages` / Cloudflare Workers runtime
- **Configuration File**: [`wrangler.jsonc`](../wrangler.jsonc)
- **Edge Headers**: [`public/_headers`](../public/_headers)
- **Node Version**: Node.js 20.x ([`.nvmrc`](../.nvmrc))

---

## 2. Deployment Methods

### Method A: Cloudflare Dashboard Git Integration (Recommended)

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, go to **Compute (Workers & Pages)** > **Create** > **Pages** > **Connect to Git**.
3. Select your GitHub account and authorize access to `am21951691-cloud/Murafiq`.
4. In the **Set up builds and deployments** screen, configure:
   - **Project name**: `murafiq`
   - **Production branch**: `main`
   - **Framework preset**: `None` (or `Next.js`)
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/`
5. Under **Environment variables (Advanced)**, add:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_VERSION` | `20.18.0` | Enforces modern Node.js build runtime |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Public anonymous key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your-service-key` | Server-side elevated key (encrypted secret) |
   | `APP_URL` | `https://murafiq.pages.dev` | Base application URL |
6. Under **Settings** > **Functions** > **Compatibility flags**:
   - Ensure `nodejs_compat` is enabled.
   - Compatibility date: `2024-09-23` or newer.
7. Click **Save and Deploy**. Cloudflare will automatically build and publish previews for pull requests and deploy production on pushes to `main`.

---

### Method B: Automated GitHub Actions CI/CD

An automated workflow is configured at [`.github/workflows/cloudflare-deploy.yml`](../.github/workflows/cloudflare-deploy.yml).

To activate automatic GitHub Action deployments:
1. Go to your GitHub repository: `https://github.com/am21951691-cloud/Murafiq/settings/secrets/actions`
2. Add the following repository secrets:
   - `CLOUDFLARE_API_TOKEN`: Create a token with **Cloudflare Pages: Edit** permissions at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).
   - `CLOUDFLARE_ACCOUNT_ID`: Found on your Cloudflare dashboard home page (right sidebar).
3. Every push to the `main` branch will build and deploy the application.

---

### Method C: Local Deployment via Wrangler CLI

You can deploy directly from your local terminal using the provided npm scripts:

```bash
# 1. Log in to your Cloudflare account
npx wrangler login

# 2. Build the project for Cloudflare Pages
npm run pages:build

# 3. Deploy the generated build
npm run pages:deploy
```

---

## 3. Custom Domain & DNS Management

To attach your custom domain (e.g. `murafiq.sa` or `app.murafiq.com`):

1. In the Cloudflare Dashboard, navigate to **Workers & Pages** > **murafiq** > **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter your domain name and click **Continue**.
4. If your domain's DNS is managed by Cloudflare:
   - Cloudflare will automatically provision DNS CNAME records and generate an SSL/TLS certificate.
5. If your domain is hosted with an external registrar:
   - Add the CNAME record indicated by Cloudflare pointing to `murafiq.pages.dev`.

---

## 4. Recommended Security & Optimization Settings

### SSL / TLS
- Go to **SSL/TLS** in the Cloudflare Dashboard.
- Set encryption mode to **Full (strict)**.
- Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.
- Enable **Minimum TLS Version**: `TLS 1.2` or `TLS 1.3`.

### Performance & Caching
- Static assets under `/_next/static/*` are automatically configured via [`public/_headers`](../public/_headers) with `Cache-Control: public, max-age=31536000, immutable`.
- Enable **Early Hints** and **HTTP/3 (with QUIC)** under **Speed** > **Optimization**.
- Enable **Brotli** compression.

### WAF & Rate Limiting Rules
Protect sensitive submission and AI endpoints by configuring Rate Limiting rules under **Security** > **WAF**:
- **Rule Name**: Protect Case Submission
  - **URI Path**: `/api/cases/submit`
  - **Rate Limit**: 10 requests per minute per IP
  - **Action**: Managed Challenge
- **Rule Name**: Protect AI Assistants
  - **URI Path**: `/api/ai/*`
  - **Rate Limit**: 20 requests per minute per IP
  - **Action**: Managed Challenge

---

## 5. Troubleshooting & Maintenance

| Symptom | Cause | Solution |
|---|---|---|
| `Build failed: node version too old` | Cloudflare Pages default Node is outdated | Ensure `.nvmrc` is committed and `NODE_VERSION=20.18.0` is set in environment variables. |
| `Cannot find module 'stream'` or `crypto` | Missing Node compatibility flag | Ensure `nodejs_compat` is added to Compatibility Flags under Settings > Functions. |
| PDF rendering in Edge environment | Headless browser execution limits | Murafiq contains a built-in fallback generator in `lib/pdf/renderer.ts` to output standard complaint receipts if Chromium is restricted. |
