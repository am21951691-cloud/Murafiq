# Cloudflare Deployment & Management Guide for Murafiq (مُرافِق)

This document provides instructions for deploying, managing, and maintaining the **Murafiq Resolution Platform** on Cloudflare Workers & Pages Edge network.

---

## 1. Quick Overview

- **Repository**: [https://github.com/am21951691-cloud/Murafiq](https://github.com/am21951691-cloud/Murafiq)
- **Deployment Platform**: Cloudflare Workers + Static Assets / Pages
- **Production URL**: [https://murafiq.am21951691.workers.dev](https://murafiq.am21951691.workers.dev)
- **Framework**: Next.js 15 (App Router)
- **Edge Adapter**: `@opennextjs/cloudflare` (Official OpenNext Cloudflare adapter)
- **Configuration File**: [`wrangler.jsonc`](../wrangler.jsonc)
- **Edge Headers**: [`public/_headers`](../public/_headers)
- **Node Version**: Node.js 20.x ([`.nvmrc`](../.nvmrc))

---

## 2. Deployment Methods

### Method A: Automated GitHub Actions CI/CD (Configured)

An automated workflow is configured at [`.github/workflows/cloudflare-deploy.yml`](../.github/workflows/cloudflare-deploy.yml).

To activate automatic GitHub Action deployments:
1. Go to your GitHub repository: `https://github.com/am21951691-cloud/Murafiq/settings/secrets/actions`
2. Add the following repository secrets:
   - `CLOUDFLARE_API_TOKEN`: Create a token with **Workers Scripts: Edit, Account Settings: Read** permissions at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).
   - `CLOUDFLARE_ACCOUNT_ID`: Found on your Cloudflare dashboard home page (right sidebar).
3. Every push to the `main` branch will build and deploy the application.

---

### Method B: Local Deployment via Wrangler CLI

You can build and deploy directly from your local terminal using the npm scripts:

```bash
# 1. Log in to your Cloudflare account (one-time)
npx wrangler login

# 2. Build the project with OpenNext
npm run build:worker

# 3. Deploy worker and static assets to Cloudflare
npm run deploy
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
