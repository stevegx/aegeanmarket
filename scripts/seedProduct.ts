import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'
import Product from '@/models/products'
import connectDB from '@/lib/db'
//just run npx tsx --env-file=.env.local scripts/seedProduct.ts
const generateMockProducts = () => ({
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  category: faker.commerce.productAdjective(),
  stock: faker.number.int({ min: 0, max: 20 }),
  rating: faker.number.int({ min: 0, max: 5 }),
  price: parseFloat(faker.commerce.price({ min: 5, max: 1000 })),
  image: `https://picsum.photos/seed/${faker.string.uuid()}/400/300`,
})

async function seedDBproducts() {
  try {
    await connectDB()
    console.log('DB CONNECTED!')
    await Product.deleteMany({})
    console.log('products deleted')
    const products = Array.from({ length: 40 }, generateMockProducts)
    await Product.insertMany(products)
    console.log('Products loaded!!')
  } catch (error) {
    console.error('Failed to connect to DB', error)
  } finally {
    await mongoose.connection.close
    process.exit()
  }
}

seedDBproducts()
