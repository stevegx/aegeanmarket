import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// The E2E suite runs against a production build wired to an isolated
// `aegeanmarket_e2e` database with rate-limiting and Google verification
// bypassed. All of that comes from .env.test.
dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true })

// Dedicated port so the suite's `next start` coexists with a running
// `npm run dev` (which holds :3000 on https).
const PORT = 3100
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  // Auth flows mutate a shared DB (and OAuth username generation is racy under
  // concurrent inserts), so keep the run serial and deterministic.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: BASE_URL,
    timeout: 180_000,
    // Always start a fresh server bound to .env.test -- never piggyback on a
    // running `npm run dev` (that one is https + points at the real DB).
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
