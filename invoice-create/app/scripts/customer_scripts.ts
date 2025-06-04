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

//function to get count of all customers
export async function getCustomerCount() {
    try {
        if (!client) throw new Error("Database client not available on client side");
        const customerCount = await client.customer.count()
        return customerCount
    } catch (error) {
        console.error('Error fetching customer count:', error)
        return 0
    }
}

//function to get all customers
export async function getCustomers() {
    if (!client) throw new Error("Database client not available on client side");
    const customers = await client.customer.findMany()
    return customers
}

//function to get customer by id
export async function getCustomerById(id: number) {
    try {
        if (!client) throw new Error("Database client not available on client side");
        const customer = await client.customer.findUnique({
            where: { customerId: id }
        })
        return customer
    } catch (error) {
        console.error('Error fetching customer by id:', error)
        return null
    }
}   

//function to create a customer
export async function createCustomer(customer: any) {
    try {
        if (!client) throw new Error("Database client not available on client side");
        const newCustomer = await client.customer.create({
            data: customer
        })  
        return newCustomer
    } catch (error) {
        console.error('Error creating customer:', error)
        return null
    }
}

//function to update a customer
export async function updateCustomer(id: number, customer: any) {
    try {
        if (!client) throw new Error("Database client not available on client side");
        const updatedCustomer = await client.customer.update({
            where: { customerId: id },
            data: customer
        })  
        return updatedCustomer
    } catch (error) {
        console.error('Error updating customer:', error)
        return null
    }
}

export default client