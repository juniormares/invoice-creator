import { getInvoiceCount } from "~/scripts/invoices_scripts";
import { getCustomerCount } from "~/scripts/customer_scripts";
import { getProductCount } from "~/scripts/product_scripts";
import { Link, useLoaderData } from "react-router";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export async function loader() {
    try {
      const invoiceCount = await getInvoiceCount();
      const customerCount = await getCustomerCount();
      const productCount = await getProductCount();
      return { invoiceCount, customerCount, productCount };
    } catch (error) {
      console.error('Error fetching invoice count:', error);
      return { invoiceCount: 0, customerCount: 0, productCount: 0 };
    }
  }

export function Dashboard() {
    const { invoiceCount, customerCount, productCount } = useLoaderData<typeof loader>();
    
    return (
        <div className="dashboard-container">
            <div className="dashboard-header flex items-center justify-between mb-8">
                <h1 className="dashboard-title mb-0">Dashboard</h1>
                <Button>
                    <Link to="/invoice/add">Create Invoice</Link>
                </Button>
            </div>
            
            <div className="dashboard-grid">
                {/* Invoices Card */}
                <Card className="dashboard-card hover-lift">
                    <CardDescription className="dashboard-card-title">
                        <span className="dashboard-card-icon">📄</span>
                        Total Invoices
                    </CardDescription>
                    <CardTitle className="dashboard-card-value">
                        {invoiceCount}
                    </CardTitle>
                    <CardAction>
                        <Link to="/invoice" className="dashboard-card-link">View All Invoices</Link>
                    </CardAction>
                </Card>

                {/* Customers Card */}
                <Card className="dashboard-card hover-lift">
                    <CardDescription className="dashboard-card-title">
                        <span className="dashboard-card-icon">👥</span>
                        Total Customers
                    </CardDescription>
                    <CardTitle className="dashboard-card-value">
                        {customerCount}
                    </CardTitle>
                    <CardAction>
                        <Link to="/customer" className="dashboard-card-link">View All Customers</Link>
                    </CardAction>
                </Card>

                {/* Products Card */}
                <Card className="dashboard-card hover-lift">
                    <CardDescription className="dashboard-card-title">
                        <span className="dashboard-card-icon">📦</span>
                        Total Products
                    </CardDescription>
                    <CardTitle className="dashboard-card-value">
                        {productCount}
                    </CardTitle>
                    <CardAction>
                        <Link to="/product" className="dashboard-card-link">View All Products</Link>
                    </CardAction>
                </Card>
            </div>
        </div>
    )
}