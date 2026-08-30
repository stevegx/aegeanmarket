import mongoose from 'mongoose'

/**
 * Drops the isolated E2E database again after the suite so no test users /
 * carts / notifications linger on the cluster between runs.
 */
async function dropE2EDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) return

  const dbName = new URL(uri).pathname.replace(/^\//, '') || '(default)'
  if (!/e2e|test/i.test(dbName)) return

  await mongoose.connect(uri)
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
  // eslint-disable-next-line no-console
  console.log(`[e2e] dropped database "${dbName}" after run`)
}

export default dropE2EDatabase
