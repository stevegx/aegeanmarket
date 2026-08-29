import { test, expect } from '@playwright/test'
import { installGoogleMock, forgeGoogleToken, HOME_URL } from './helpers'

test.describe('Google OAuth (GSI mocked)', () => {
  test('sign-in button renders on /login and /register when a client id is configured', async ({
    page,
  }) => {
    await installGoogleMock(page, forgeGoogleToken({ sub: 'x', email: 'x@e2e.test' }))

    await page.goto('/login')
    await expect(page.getByTestId('mock-google-signin').first()).toBeVisible()

    await page.goto('/register')
    await expect(page.getByTestId('mock-google-signin').first()).toBeVisible()
  })

  test('success: a valid credential creates the account, logs in, and redirects home', async ({
    page,
  }) => {
    const token = forgeGoogleToken({
      sub: `g_${Date.now()}`,
      email: `e2egoogle_${Date.now()}@e2e.test`,
      name: 'e2egoogleuser',
    })
    await installGoogleMock(page, token)

    await page.goto('/login')
    await page.getByTestId('mock-google-signin').first().click()

    await page.waitForURL(HOME_URL)
    await expect(
      page.getByRole('button', { name: /^e2egoogleuser/ })
    ).toBeVisible()
  })

  test('error: a bad credential surfaces the OAuth error message and stays on /login', async ({
    page,
  }) => {
    // Starts with `e2e.` so the bypass hook handles it, but the payload is not
    // valid base64url JSON -> loginWithGoogle catches and returns the error.
    await installGoogleMock(page, 'e2e.!!!!not-json!!!!')

    await page.goto('/login')
    await page.getByTestId('mock-google-signin').first().click()

    await expect(
      page.getByText('Google sign-in failed. Please try again.')
    ).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
})
