import { randomBytes } from 'node:crypto'
import { expect, type Page } from '@playwright/test'

/** Matches the site root on whatever localhost port the test server uses. */
export const HOME_URL = /localhost:\d+\/$/

export type TestUser = {
  username: string
  email: string
  password: string
  address: string
  phone: string
}

/** A fresh, schema-valid registration payload. Unique username/email/phone. */
export function makeUser(overrides: Partial<TestUser> = {}): TestUser {
  const tag = randomBytes(4).toString('hex')
  const phone = '69' + String(Math.floor(10_000_000 + Math.random() * 89_999_999))
  return {
    username: `e2e_${tag}`,
    email: `e2e_${tag}@e2e.test`,
    password: 'Passw0rd123!',
    address: '12 Aegean Way',
    phone,
    ...overrides,
  }
}

/**
 * Fill and submit the /register form. `confirmPassword` defaults to `password`.
 * Pass an explicit key as `undefined` to leave that field untouched.
 */
export async function fillRegisterForm(
  page: Page,
  user: Partial<TestUser> & { confirmPassword?: string }
) {
  if (user.username !== undefined)
    await page.locator('#username').fill(user.username)
  if (user.email !== undefined) await page.locator('#email').fill(user.email)
  if (user.password !== undefined)
    await page.locator('#password').fill(user.password)
  const confirm =
    user.confirmPassword !== undefined ? user.confirmPassword : user.password
  if (confirm !== undefined)
    await page.locator('#confirmPassword').fill(confirm)
  if (user.address !== undefined)
    await page.locator('#address').fill(user.address)
  if (user.phone !== undefined) await page.locator('#phone').fill(user.phone)
  await page.getByRole('button', { name: 'Register', exact: true }).click()
}

/** Register a brand-new user through the UI and confirm the success page. */
export async function registerViaUI(page: Page, user: TestUser) {
  await page.goto('/register')
  await fillRegisterForm(page, user)
  await expect(page).toHaveURL(/\/register\/success/)
  await expect(
    page.getByRole('heading', { name: 'Registration Successful!' })
  ).toBeVisible()
}

/** Fill and submit the /login form. Does not assert the outcome. */
export async function fillLoginForm(
  page: Page,
  loginCredentials: string,
  password: string
) {
  await page.locator('#loginCredentials').fill(loginCredentials)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Login', exact: true }).click()
}

/**
 * Register a fresh user, then log in as them through the UI. Leaves the page
 * on `/` with auth cookies set on the context. Returns the user.
 */
export async function registerAndLogin(
  page: Page,
  user: TestUser = makeUser()
): Promise<TestUser> {
  await registerViaUI(page, user)
  await page.goto('/login')
  await fillLoginForm(page, user.username, user.password)
  await page.waitForURL(HOME_URL)
  return user
}

/**
 * Replace Google's GSI client with a stub: it renders a button that, when
 * clicked, invokes the app's `initialize({ callback })` handler with the
 * given credential -- driving the real `loginWithGoogle` server action.
 */
export async function installGoogleMock(page: Page, credential: string) {
  const stub = `
    (function () {
      var CREDENTIAL = ${JSON.stringify(credential)};
      window.google = {
        accounts: {
          id: {
            _cb: null,
            initialize: function (cfg) { window.google.accounts.id._cb = cfg && cfg.callback; },
            renderButton: function (parent) {
              var btn = document.createElement('button');
              btn.type = 'button';
              btn.setAttribute('data-testid', 'mock-google-signin');
              btn.textContent = 'Mock Google Sign-In';
              btn.addEventListener('click', function () {
                var cb = window.google.accounts.id._cb;
                if (cb) cb({ credential: CREDENTIAL });
              });
              parent.appendChild(btn);
            }
          }
        }
      };
    })();
  `
  await page.route('https://accounts.google.com/gsi/client', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: stub,
    })
  )
}

/**
 * Forge an id token the `E2E_GOOGLE_BYPASS` hook in lib/oauth.ts accepts:
 * `e2e.<base64url(JSON claims)>`.
 */
export function forgeGoogleToken(claims: {
  sub: string
  email: string
  name?: string
  email_verified?: boolean
}) {
  const payload = { email_verified: true, ...claims }
  return 'e2e.' + Buffer.from(JSON.stringify(payload)).toString('base64url')
}
