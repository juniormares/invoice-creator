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

//function to get all invoices with their items and customer info
export async function getInvoices() {
    if (!client) throw new Error("Database client not available on client side");
    const invoices = await client.invoice.findMany({
        include: {
            customer: true,
            invoiceItems: {
                include: {
                    product: true
                }
            }
        },
        orderBy: {
            invoiceDate: 'desc'
        }
    })
    return invoices
}

//function to get count of all invoices
export async function getInvoiceCount() {
    if (!client) throw new Error("Database client not available on client side");
    const invoiceCount = await client.invoice.count()
    return invoiceCount
}

//function to get invoice by id with all related data
export async function getInvoiceById(id: number) {
    if (!client) throw new Error("Database client not available on client side");
    const invoice = await client.invoice.findUnique({
        where: { invoiceId: id },
        include: {
            customer: true,
            invoiceItems: {
                include: {
                    product: true
                }
            }
        }
    })
    return invoice
}

//function to create an invoice with multiple items
export async function createInvoice(invoiceData: {
    customerId: number;
    items: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    totalPrice: number;
}) {
    if (!client) throw new Error("Database client not available on client side");
    
    const newInvoice = await client.invoice.create({
        data: {
            customerId: invoiceData.customerId,
            subtotal: invoiceData.subtotal,
            tax: invoiceData.tax,
            totalPrice: invoiceData.totalPrice,
            invoiceItems: {
                create: invoiceData.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                }))
            }
        },
        include: {
            customer: true,
            invoiceItems: {
                include: {
                    product: true
                }
            }
        }
    })
    return newInvoice
}

//function to update an invoice
export async function updateInvoice(id: number, invoiceData: any) {
    if (!client) throw new Error("Database client not available on client side");
    const updatedInvoice = await client.invoice.update({
        where: { invoiceId: id },
        data: invoiceData,
        include: {
            customer: true,
            invoiceItems: {
                include: {
                    product: true
                }
            }
        }
    })
    return updatedInvoice
}

//function to delete an invoice (will cascade delete invoice items)
export async function deleteInvoice(id: number) {
    if (!client) throw new Error("Database client not available on client side");
    const deletedInvoice = await client.invoice.delete({
        where: { invoiceId: id }
    })
    return deletedInvoice
}

export default client