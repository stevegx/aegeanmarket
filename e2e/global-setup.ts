import mongoose from 'mongoose'

/**
 * Wipes the isolated E2E database before the suite runs so every run starts
 * from a known-empty state. Refuses to touch anything that doesn't look like
 * a throwaway test database.
 */
async function dropE2EDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set (expected from .env.test)')

  const dbName = new URL(uri).pathname.replace(/^\//, '') || '(default)'
  if (!/e2e|test/i.test(dbName)) {
    throw new Error(
      `Refusing to drop database "${dbName}" -- it does not look like an E2E database. ` +
        'Point MONGODB_URI in .env.test at a dedicated *_e2e / *_test database.'
    )
  }

  await mongoose.connect(uri)
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
  // eslint-disable-next-line no-console
  console.log(`[e2e] dropped database "${dbName}" before run`)
}

export default dropE2EDatabase
