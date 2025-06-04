import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create 2 customers
    const customer1 = await prisma.customer.create({
      data: {
        customerName: "Garden Oasis Landscaping",
        customerEmail: "contact@gardenoasis.com",
        customerPhone: "555-0123",
        customerAddress: "1234 Green Valley Rd\nAustin, TX 78701"
      }
    });

    const customer2 = await prisma.customer.create({
      data: {
        customerName: "Sunset Property Management",
        customerEmail: "billing@sunsetpm.com", 
        customerPhone: "555-0456",
        customerAddress: "5678 Oak Street\nDallas, TX 75201"
      }
    });

    console.log("✅ Created customers:");
    console.log(`   - ${customer1.customerName} (ID: ${customer1.customerId})`);
    console.log(`   - ${customer2.customerName} (ID: ${customer2.customerId})`);

    // Create 2 products
    const product1 = await prisma.product.create({
      data: {
        productName: "Lawn Mowing Service",
        productDescription: "Professional lawn mowing and edging service for residential and commercial properties. Includes grass cutting, edging, and cleanup.",
        productPrice: 75.00
      }
    });

    const product2 = await prisma.product.create({
      data: {
        productName: "Landscape Design Consultation",
        productDescription: "Comprehensive landscape design consultation including site analysis, plant recommendations, and detailed design plans.",
        productPrice: 150.00
      }
    });

    console.log("✅ Created products:");
    console.log(`   - ${product1.productName} (ID: ${product1.productId}) - $${product1.productPrice}`);
    console.log(`   - ${product2.productName} (ID: ${product2.productId}) - $${product2.productPrice}`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\nYou can now:");
    console.log("- View customers at /customer");
    console.log("- View products at /product");
    console.log("- Create invoices using these customers and products");

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }); 