# Exam MVP — Agent Handoff

## What This Project Is

A LINE Mini App + standard WebApp for MCQ/TF exam practice. Built with:
- **Next.js 16.2** (App Router, TypeScript, TailwindCSS 4)
- **`@line/liff`** — LINE Front-end Framework SDK for auth
- **Supabase** (PostgreSQL + RLS) — database and backend
- **`lucide-react`** — icons
- Targeted for **Vercel** deployment

---

## Current State: What We Just Did
The app is fully merged and functionally ready. During the current session, we initialized the app locally and resolved several environment setup hurdles:

1. **Environment Config**: We created `.env.local` using `.env.local.example` and successfully linked the LINE login functionality.
2. **Next.js 16 Host Blocking Fix**: We updated `next.config.ts` down to `allowedDevOrigins` to accept remote reverse tunnels so Next.js does not block HMR requests over the internet.
3. **React Hydration Error Fix**: We added `suppressHydrationWarning` to the `<body>` tag in `src/app/layout.tsx` to stop hydration crashes caused by browser extensions like Grammarly injecting `data-new-gr-c-s-check-loaded` attributes.
4. **Database Extraction**: We combined the Database Schema, RLS policies, and Seed Data into a massive `supabase_setup.sql` script placed right in the root directory.

---

## What Worked (and What Didn't Work) during Dev Setup

### Reverse Tunnels
LINE Developer Console requires a valid HTTPS endpoint URL, meaning we had to set up a secure tunnel.
- ❌ **`localtunnel`**: Fails frequently with 503 "Tunnel Unavailable" errors and forces an anti-phishing wall requiring an external IP.
- ❌ **`cloudflared tunnel` (trycloudflare)**: Fails to connect from some environments due to QUIC UDP connection timeouts.
- ✅ **`localhost.run` (SSH tunnel)**: Extremely stable and quick. Launch with:
  ```bash
  ssh -o ServerAliveInterval=60 -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run
  ```
  (*Make sure to copy the temporary `*.lhr.life` link it outputs, update `ag_admin.lhr.life` in `next.config.ts` allowedDevOrigins, and configure the LINE Console URL to this endpoint).*

### Testing Infrastructure
- **Vitest v4 + `@vitejs/plugin-react`** + jsdom handles both Next.js 16 and React 19 cleanly.
- `setup.tsx` is required for global mock declarations.
- Mocking Supabase effectively utilizes chained `vi.fn().mockReturnThis()` and ends with a `.mockResolvedValue()`.

---

## What to Build Next (for the next Agent)

1. **Verify Database Operation**: The absolute first step is to confirm the user has actually run `supabase_setup.sql` in their Supabase SQL Editor. The app currently gets a "Supabase upsert failed" error when trying to automatically upsert the LINE user on login because the `users` table didn't exist out of the box. Once the user runs the script, this will immediately resolve.
2. **Verify Testing Coverage Gaps (Optional)**: 
   There are a few branches not currently tested:
   - `createAttempt` Supabase failure path in `app/exam/[id]/page.tsx`
   - Timer auto-submit branch (`timeLeft === 0`) in the exam component (needs fake timers).
   - Explanation image rendering logic in `ResultsPage`.
   - `data ?? []` fallback branches when Supabase returns an empty set.
3. **Feature Build-Out**: Check with the user if they'd like to implement new mock subjects, adapt the UI/UX style, deploy the code to production via Vercel, or add Admin tools to handle exams.

> 🛠️ **Quick Start for Next Agent**: 
> Spin up the Dev Server via `npm run dev`. Run the `ssh -R 80:localhost:3000 nokey@localhost.run` command in another terminal, grab the `.lhr.life` URL, inject it into `next.config.ts`, restart `npm run dev`, and tell the user to load the app through their LINE console.
