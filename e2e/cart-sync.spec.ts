import { test, expect, type Page } from '@playwright/test'
import { makeUser, fillLoginForm, registerViaUI, HOME_URL } from './helpers'
import {
  seedProducts,
  getUserId,
  setDbCart,
  getDbCart,
  closeDb,
  type SeededProduct,
  type CartLine,
} from './db'

test.afterAll(async () => {
  await closeDb()
})

// --- helpers ---------------------------------------------------------------

/** Plant a persisted guest cart in localStorage before any app script runs. */
async function setGuestCart(
  page: Page,
  products: SeededProduct[],
  lines: CartLine[]
) {
  const items = lines.map((l) => {
    const p = products.find((x) => x.id === l.id)!
    return {
      _id: p.id,
      name: p.name,
      price: p.price,
      quantity: l.quantity,
      stock: p.stock,
      image: p.image,
    }
  })
  await page.addInitScript((payload) => {
    localStorage.setItem(
      'aegean-cart-storage',
      JSON.stringify({ state: { items: payload }, version: 0 })
    )
  }, items)
}

/** Register a user, then log in through the UI. Guest cart (if any) must be
 *  planted before calling this. Leaves the page on `/`. */
async function registerThenLogin(page: Page, username: string, password: string) {
  await page.goto('/login')
  await fillLoginForm(page, username, password)
  await page.waitForURL(HOME_URL)
}

async function readGuestCart(page: Page): Promise<CartLine[]> {
  const raw = await page.evaluate(() =>
    localStorage.getItem('aegean-cart-storage')
  )
  if (!raw) return []
  const items = (JSON.parse(raw).state?.items ?? []) as {
    _id: string
    quantity: number
  }[]
  return items
    .map((i) => ({ id: i._id, quantity: i.quantity }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

const line = (p: SeededProduct, quantity: number): CartLine => ({
  id: p.id,
  quantity,
})
const sortLines = (ls: CartLine[]) =>
  [...ls].sort((a, b) => a.id.localeCompare(b.id))

async function logoutViaUI(page: Page, username: string) {
  await page.getByRole('button', { name: username }).click()
  await page.getByRole('button', { name: 'Logout' }).click()
  // Wait for logout to actually land: the Login link reappears only after the
  // onLogout handler has run (setLogout + resetForLogout).
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible()
}

// --- specs ---------------------------------------------------------------

test.describe('Cart sync — login reconciliation', () => {
  test('guest cart + empty account cart: pushed to DB silently, no modal', async ({
    page,
  }) => {
    const [p0, p1] = await seedProducts(2)
    const user = makeUser()
    await registerViaUI(page, user)

    await setGuestCart(page, [p0, p1], [line(p0, 1), line(p1, 2)])
    await registerThenLogin(page, user.username, user.password)

    await expect(page.getByTestId('cart-merge-modal')).toHaveCount(0)

    const uid = await getUserId(user.username)
    await expect
      .poll(() => getDbCart(uid), { timeout: 10_000 })
      .toEqual(sortLines([line(p0, 1), line(p1, 2)]))
  })

  test('empty guest cart + saved account cart: DB cart loads, no modal', async ({
    page,
  }) => {
    const [p0, p1] = await seedProducts(2)
    const user = makeUser()
    await registerViaUI(page, user)
    await registerThenLogin(page, user.username, user.password)

    const uid = await getUserId(user.username)
    await setDbCart(uid, [line(p0, 2), line(p1, 1)])
    await page.reload()

    await expect(page.getByTestId('cart-merge-modal')).toHaveCount(0)
    await page.getByRole('button', { name: 'Open cart' }).click()
    await expect(page.getByText('Your Cart (3)')).toBeVisible()
    await expect(page.getByRole('heading', { name: p0.name })).toBeVisible()
    await expect(page.getByRole('heading', { name: p1.name })).toBeVisible()
  })

  test('guest cart + saved account cart (both non-empty): merge modal appears', async ({
    page,
  }) => {
    const [p0, p1, p2, p3] = await seedProducts(4)
    const user = makeUser()
    await registerViaUI(page, user)
    const uid = await getUserId(user.username)
    await setDbCart(uid, [line(p0, 1), line(p1, 2)])

    await setGuestCart(page, [p0, p1, p2, p3], [line(p2, 1), line(p3, 1)])
    await registerThenLogin(page, user.username, user.password)

    await expect(page.getByTestId('cart-merge-modal')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'KEEP BOTH' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'USE THIS DEVICE' })
    ).toBeVisible()
  })

  test('merge modal — KEEP BOTH: union, larger quantity per product wins', async ({
    page,
  }) => {
    const [p0, p1, p2] = await seedProducts(3)
    const user = makeUser()
    await registerViaUI(page, user)
    const uid = await getUserId(user.username)
    // overlap on p0: DB has 1, guest has 3 -> expect 3
    await setDbCart(uid, [line(p0, 1), line(p1, 5)])

    await setGuestCart(page, [p0, p1, p2], [line(p0, 3), line(p2, 1)])
    await registerThenLogin(page, user.username, user.password)

    await page.getByRole('button', { name: 'KEEP BOTH' }).click()
    await expect(page.getByTestId('cart-merge-modal')).toHaveCount(0)

    await expect
      .poll(() => getDbCart(uid), { timeout: 10_000 })
      .toEqual(sortLines([line(p0, 3), line(p1, 5), line(p2, 1)]))
  })

  test('merge modal — USE THIS DEVICE: guest cart wins, saved cart discarded', async ({
    page,
  }) => {
    const [p0, p1, p2] = await seedProducts(3)
    const user = makeUser()
    await registerViaUI(page, user)
    const uid = await getUserId(user.username)
    await setDbCart(uid, [line(p0, 1), line(p1, 5)])

    await setGuestCart(page, [p0, p1, p2], [line(p0, 3), line(p2, 1)])
    await registerThenLogin(page, user.username, user.password)

    await page.getByRole('button', { name: 'USE THIS DEVICE' }).click()
    await expect(page.getByTestId('cart-merge-modal')).toHaveCount(0)

    await expect
      .poll(() => getDbCart(uid), { timeout: 10_000 })
      .toEqual(sortLines([line(p0, 3), line(p2, 1)]))
  })
})

test.describe('Cart sync — logout', () => {
  test('logout clears the cart (nothing left in localStorage)', async ({
    page,
  }) => {
    const [p0, p1] = await seedProducts(2)
    const user = makeUser()
    await registerViaUI(page, user)

    await setGuestCart(page, [p0, p1], [line(p0, 1), line(p1, 1)])
    await registerThenLogin(page, user.username, user.password)
    await expect(page.getByRole('button', { name: 'Open cart' })).toBeVisible()

    await logoutViaUI(page, user.username)

    expect(await readGuestCart(page)).toEqual([])
  })

  test('user A logs out, user B logs in: A’s cart never leaks into B', async ({
    page,
  }) => {
    const [p0, p1, p2] = await seedProducts(3)
    const userA = makeUser()
    const userB = makeUser()
    await registerViaUI(page, userA)
    await registerViaUI(page, userB)

    const uidA = await getUserId(userA.username)
    const uidB = await getUserId(userB.username)
    await setDbCart(uidA, [line(p0, 2)])

    // A logs in (empty guest cart), then logs out.
    await registerThenLogin(page, userA.username, userA.password)
    await logoutViaUI(page, userA.username)
    expect(await readGuestCart(page)).toEqual([])

    // B logs in with their own guest cart, empty account cart -> no modal.
    await setGuestCart(page, [p0, p1, p2], [line(p1, 1), line(p2, 3)])
    await registerThenLogin(page, userB.username, userB.password)
    await expect(page.getByTestId('cart-merge-modal')).toHaveCount(0)

    await expect
      .poll(() => getDbCart(uidB), { timeout: 10_000 })
      .toEqual(sortLines([line(p1, 1), line(p2, 3)]))
    // A’s saved cart is untouched, and holds none of B’s products.
    expect(await getDbCart(uidA)).toEqual([line(p0, 2)])
  })
})

test.describe('Cart sync — full-replace push', () => {
  test('removing an item while logged in propagates the deletion to the DB', async ({
    page,
  }) => {
    const [p0, p1, p2] = await seedProducts(3)
    const user = makeUser()
    await registerViaUI(page, user)
    await registerThenLogin(page, user.username, user.password)

    const uid = await getUserId(user.username)
    await setDbCart(uid, [line(p0, 1), line(p1, 1), line(p2, 1)])
    await page.reload()

    await page.getByRole('button', { name: 'Open cart' }).click()
    await expect(page.getByText('Your Cart (3)')).toBeVisible()
    await page.getByRole('button', { name: 'Remove item' }).first().click()
    await expect(page.getByText('Your Cart (2)')).toBeVisible()

    await expect
      .poll(() => getDbCart(uid).then((c) => c.length), { timeout: 12_000 })
      .toBe(2)
  })

  test('emptying the cart while logged in clears the DB cart too', async ({
    page,
  }) => {
    const [p0, p1] = await seedProducts(2)
    const user = makeUser()
    await registerViaUI(page, user)
    await registerThenLogin(page, user.username, user.password)

    const uid = await getUserId(user.username)
    await setDbCart(uid, [line(p0, 1), line(p1, 1)])
    await page.reload()

    await page.getByRole('button', { name: 'Open cart' }).click()
    await expect(page.getByText('Your Cart (2)')).toBeVisible()
    await page.getByRole('button', { name: 'Remove item' }).first().click()
    await page.getByRole('button', { name: 'Remove item' }).first().click()
    await expect(page.getByText('Your Cart (0)')).toBeVisible()

    await expect
      .poll(() => getDbCart(uid).then((c) => c.length), { timeout: 12_000 })
      .toBe(0)
  })
})
