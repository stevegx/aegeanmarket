import fs from 'fs'
import { parseStringPromise } from 'xml2js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  stock: Number,
  sku: { type: String, unique: true },
  manufacturer: String,
  rating: Number,
  volume: String,
  origin: String,
})

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)

async function feedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to DB')
    await Product.deleteMany({})
    const xml = fs.readFileSync('./products/products.xml', 'utf-8')
    const result = await parseStringPromise(xml)
    const rawItems = result.dataroot.item

    console.log(`Found ${rawItems.length} for processing.`)

    const bulkOps = rawItems.map((item) => {
      const formattedProduct = {
        sku: item.id?.[0]?.trim() || `unknown-${Math.random()}`,
        name: item.name?.[0]?.trim() || 'No Name',
        image: item.image?.[0]?.trim() || '',
        category: item.category?.[0]?.trim() || 'Uncategorized',
        price: Number(item.price?.[0]) || 0,
        manufacturer: item.manufacturer?.[0]?.trim() || 'Unknown',
        stock: Number(item.stock?.[0]) || 0,
        rating: Number(item.rating?.[0]) || 0,
        description: item.description?.[0]?.trim() || '',
        origin: item.Origin?.[0]?.trim() || 'Unknown',
        volume: item.Volume?.[0]?.trim() || 'Unknown',
      }

      return {
        updateOne: {
          filter: { sku: formattedProduct.sku },
          update: { $set: formattedProduct },
          upsert: true,
        },
      }
    })

    // 3. Μαζική εγγραφή στη βάση
    const finalResult = await Product.bulkWrite(bulkOps)
    console.log(
      `New products: ${finalResult.upsertedCount} Updated Products: ${finalResult.modifiedCount}`
    )

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

feedProducts()
