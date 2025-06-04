import { PrismaClient } from "@prisma/client"

// Only initialize Prisma on the server side
const isServer = typeof window === 'undefined';

const prisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

let client: PrismaClient | null = null;

if (isServer) {
    client = prisma.prisma || new PrismaClient()
    if (process.env.NODE_ENV !== "production") prisma.prisma = client
}

//function to get count of all products
export async function getProductCount() {
    try {
        if (!client) throw new Error("Database client not available on client side");
        const productCount = await client.product.count()
        return productCount
    } catch (error) {
        console.error('Error fetching product count:', error)
        return 0
    }
}

//function to get all products
export async function getProducts() {
    if (!client) throw new Error("Database client not available on client side");
    const products = await client.product.findMany()
    return products
}

//function to get product by id
export async function getProductById(id: number) {
    try {
        if (!client) throw new Error("Database client not available on client side");
        const product = await client.product.findUnique({
            where: { productId: id }
        })
        return product
    } catch (error) {
        console.error('Error fetching product by id:', error)
        return null
    }
}

//function to create a product
export async function createProduct(product: any) {
    try {
        if (!client) throw new Error("Database client not available on client side");
        const newProduct = await client.product.create({
            data: product
        })  
        return newProduct
    } catch (error) {
        console.error('Error creating product:', error)
        return null
    }
}   

//function to update a product
export async function updateProduct(id: number, product: any) {
    try {
        if (!client) throw new Error("Database client not available on client side");
        const updatedProduct = await client.product.update({
            where: { productId: id },
            data: product
        })  
        return updatedProduct
    } catch (error) {
        console.error('Error updating product:', error)
        return null
    }
}

export default client   