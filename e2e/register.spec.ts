import { test, expect } from '@playwright/test'
import {
  makeUser,
  fillRegisterForm,
  registerViaUI,
} from './helpers'

test.describe('Register', () => {
  test('happy path: valid data creates the account and shows the success page', async ({
    page,
  }) => {
    const user = makeUser()
    await page.goto('/register')
    await fillRegisterForm(page, user)

    await expect(page).toHaveURL(/\/register\/success/)
    await expect(
      page.getByRole('heading', { name: 'Registration Successful!' })
    ).toBeVisible()
  })

  test('happy path does NOT log the user in (createUser issues no auth cookies)', async ({
    page,
  }) => {
    const user = makeUser()
    await registerViaUI(page, user)

    await page.goto('/')
    // Logged-out navbar shows Login/Register affordances (links) and no user menu.
    await expect(
      page.getByRole('link', { name: 'Login' }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Register' }).first()
    ).toBeVisible()
  })

  test.describe('client-side validation (Zod registerSchema)', () => {
    const cases: {
      name: string
      overrides: Parameters<typeof fillRegisterForm>[1]
      message: string | RegExp
    }[] = [
      {
        name: 'username shorter than 3 chars',
        overrides: { username: 'ab' },
        message: 'Username must be at least 3 characters long',
      },
      {
        name: 'invalid email',
        overrides: { email: 'not-an-email' },
        message: 'Invalid email address',
      },
      {
        name: 'password shorter than 8 chars',
        overrides: { password: 'short1', confirmPassword: 'short1' },
        message: 'Password must be at least 8 characters long',
      },
      {
        name: 'password / confirm mismatch',
        overrides: { confirmPassword: 'DifferentPass123!' },
        message: 'Passwords do not match',
      },
      {
        name: 'address shorter than 3 chars',
        overrides: { address: 'ab' },
        message: 'Address must be at least 3 characters long',
      },
      {
        name: 'phone not exactly 10 digits',
        overrides: { phone: '6912345' },
        message: 'Phone number must be exactly 10 digits',
      },
      {
        name: 'phone not starting with 69',
        overrides: { phone: '1234567890' },
        message: 'Phone number must start with 69',
      },
      {
        name: 'phone containing non-digits',
        overrides: { phone: '69abcdefgh' },
        message: 'Phone number must contain only digits',
      },
    ]

    for (const { name, overrides, message } of cases) {
      test(name, async ({ page }) => {
        await page.goto('/register')
        await fillRegisterForm(page, { ...makeUser(), ...overrides })

        await expect(page.getByText(message)).toBeVisible()
        await expect(page).toHaveURL(/\/register$/)
      })
    }
  })

  const DUPLICATE_MESSAGE = 'User with this email or username already exists'

  test('duplicate email: second registration shows the server error and stays on /register', async ({
    page,
  }) => {
    const user = makeUser()
    await registerViaUI(page, user)

    // Same email, fresh username + phone.
    const dup = makeUser({ email: user.email })
    await page.goto('/register')
    await fillRegisterForm(page, dup)

    await expect(page.getByText(DUPLICATE_MESSAGE)).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
    await expect(
      page.getByRole('heading', { name: 'Registration Successful!' })
    ).toHaveCount(0)
  })

  test('duplicate username: second registration shows the server error', async ({
    page,
  }) => {
    const user = makeUser()
    await registerViaUI(page, user)

    const dup = makeUser({ username: user.username })
    await page.goto('/register')
    await fillRegisterForm(page, dup)

    await expect(page.getByText(DUPLICATE_MESSAGE)).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
  })
})
