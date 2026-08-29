import { test, expect } from '@playwright/test'
import {
  makeUser,
  fillLoginForm,
  registerViaUI,
  registerAndLogin,
  HOME_URL,
} from './helpers'

test.describe('Login', () => {
  test('happy path: log in with username', async ({ page }) => {
    const user = makeUser()
    await registerViaUI(page, user)

    await page.goto('/login')
    await fillLoginForm(page, user.username, user.password)

    await page.waitForURL(HOME_URL)
    await expect(
      page.getByRole('button', { name: user.username })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Login' })).toHaveCount(0)
  })

  test('happy path: log in with email', async ({ page }) => {
    const user = makeUser()
    await registerViaUI(page, user)

    await page.goto('/login')
    await fillLoginForm(page, user.email, user.password)

    await page.waitForURL(HOME_URL)
    await expect(
      page.getByRole('button', { name: user.username })
    ).toBeVisible()
  })

  test('wrong password: shows "Invalid login credentials", stays on /login', async ({
    page,
  }) => {
    const user = makeUser()
    await registerViaUI(page, user)

    await page.goto('/login')
    await fillLoginForm(page, user.username, 'totally-wrong-password')

    await expect(page.getByText('Invalid login credentials')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('unknown user: shows "Invalid login credentials"', async ({ page }) => {
    await page.goto('/login')
    await fillLoginForm(page, 'e2e_nobody_here', 'whatever12345')

    await expect(page.getByText('Invalid login credentials')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('client-side validation: credentials < 3 chars never reaches the server', async ({
    page,
  }) => {
    let serverActionCalls = 0
    await page.route('**/login', (route) => {
      const req = route.request()
      if (req.method() === 'POST' && req.headers()['next-action']) {
        serverActionCalls += 1
      }
      return route.continue()
    })

    await page.goto('/login')
    await fillLoginForm(page, 'ab', 'somepassword')

    await expect(
      page.getByText('Username or email must be at least 3 characters long')
    ).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
    expect(serverActionCalls).toBe(0)
  })

  test('empty password is caught client-side with "Password is required", never reaches the server', async ({
    page,
  }) => {
    let serverActionCalls = 0
    await page.route('**/login', (route) => {
      const req = route.request()
      if (req.method() === 'POST' && req.headers()['next-action']) {
        serverActionCalls += 1
      }
      return route.continue()
    })

    await page.goto('/login')
    await page.locator('#loginCredentials').fill('someusername')
    await page.getByRole('button', { name: 'Login', exact: true }).click()

    await expect(page.getByText('Password is required')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
    expect(serverActionCalls).toBe(0)
  })

  test.describe('proxy / session redirects', () => {
    test('unauthenticated /adminpage -> /login', async ({ page }) => {
      await page.goto('/adminpage')
      await expect(page).toHaveURL(/\/login$/)
    })

    test('logged-in non-admin visiting /adminpage -> /', async ({ page }) => {
      await registerAndLogin(page)
      await page.goto('/adminpage')
      await expect(page).toHaveURL(HOME_URL)
    })

    test('logged-in user visiting /login -> /', async ({ page }) => {
      await registerAndLogin(page)
      await page.goto('/login')
      await expect(page).toHaveURL(HOME_URL)
    })

    test('logged-in user visiting /register -> /', async ({ page }) => {
      await registerAndLogin(page)
      await page.goto('/register')
      await expect(page).toHaveURL(HOME_URL)
    })

    test('unauthenticated /profile/:id -> /login', async ({ page }) => {
      // Redirected at the proxy (isProfilePath); the page component also
      // re-checks the session as a second layer.
      await page.goto('/profile/000000000000000000000000')
      await expect(page).toHaveURL(/\/login$/)
    })

    test('logged-in user visiting someone else’s profile sees Access Denied', async ({
      page,
    }) => {
      await registerAndLogin(page)
      await page.goto('/profile/000000000000000000000000')
      await expect(
        page.getByRole('heading', { name: 'Access Denied' })
      ).toBeVisible()
    })
  })
})
