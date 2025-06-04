import { NavBar } from "~/components/ui/navBar";
import { getInvoiceCount } from "~/scripts/invoices_scripts";
import { getCustomerCount } from "~/scripts/customer_scripts";
import { getProductCount } from "~/scripts/product_scripts";
import { Dashboard } from "~/components/ui/dashboard";
import type { Route } from "./+types/_index";

export async function loader() {
  try {
    const invoiceCount = await getInvoiceCount();
    const customerCount = await getCustomerCount();
    const productCount = await getProductCount();
    return { invoiceCount, customerCount, productCount };
  } catch (error) {
    console.error('Error fetching counts:', error);
    return { invoiceCount: 0, customerCount: 0, productCount: 0 };
  }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  return (
    <div className="main-layout">
      <NavBar />
      <main className="main-content animate-fade-in">
        <Dashboard />
      </main>
    </div>
  );
} 