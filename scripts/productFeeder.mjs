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
        sku: item.id[0],
        name: item.name[0],
        image: item.image ? item.image[0] : '',
        category: item.category[0],
        price: parseFloat(item.price[0]),
        manufacturer: item.manufacturer ? item.manufacturer[0] : 'Unknown',
        stock: parseInt(item.stock[0]),
        description: item.description ? item.description[0] : 'Unknown',
        rating: parseInt(item.rating[0]),
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
      `New products: ${finalResult.upsertedCount} Updated Products:{finalResult.modifiedCount}`
    )

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

feedProducts()
