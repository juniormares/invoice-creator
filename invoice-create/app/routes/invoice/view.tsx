//view invoice route

import { useLoaderData } from "react-router";
import { NavBar } from "~/components/ui/navBar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { getInvoices } from "~/scripts/invoices_scripts";
import { Link } from "react-router";

export async function loader() {
    const invoices = await getInvoices();
    return { invoices };
}

export default function ViewInvoice() {
    const { invoices } = useLoaderData<typeof loader>();
    
    // Helper function to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    // Calculate total revenue
    const totalRevenue = invoices.reduce((sum: number, invoice: any) => sum + invoice.totalPrice, 0);
    
    return (
        <div className="main-layout">
            <NavBar />
            <main className="main-content animate-fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">All Invoices</h1>
                        <p className="page-description">
                            View and manage all your invoices
                        </p>
                    </div>
                    <Button>
                        <Link to="/invoice/add">Create New Invoice</Link>
                    </Button>
                </div>
                
                <div className="invoice-container">
                    <div className="invoice-details">
                        {invoices.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📄</div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">No invoices yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Get started by creating your first invoice
                                </p>
                                <Button>
                                    <Link to="/invoice/add">Create Invoice</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="table-container">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Invoice #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead className="text-right">Tax</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-center">Date</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((invoice: any) => (
                                            <TableRow key={invoice.invoiceId} className="hover:bg-muted/20">
                                                <TableCell className="font-medium">
                                                    #{invoice.invoiceId.toString().padStart(4, '0')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">
                                                            {invoice.customer.customerName}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {invoice.customer.customerEmail}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col space-y-1">
                                                        {invoice.invoiceItems.map((item: any, index: number) => (
                                                            <div key={item.invoiceItemId} className="text-sm">
                                                                <span className="font-medium text-foreground">
                                                                    {item.product.productName}
                                                                </span>
                                                                <span className="text-muted-foreground ml-2">
                                                                    × {item.quantity}
                                                                </span>
                                                                {index < invoice.invoiceItems.length - 1 && (
                                                                    <span className="text-muted-foreground">, </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <span className="text-xs text-muted-foreground">
                                                            {invoice.invoiceItems.length} item{invoice.invoiceItems.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-foreground">
                                                        ${invoice.subtotal.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-foreground">
                                                        ${invoice.tax.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-semibold text-foreground">
                                                        ${invoice.totalPrice.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(invoice.invoiceDate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="status-badge status-badge--success">
                                                        {invoice.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        
                        {invoices.length > 0 && (
                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Total Invoices: {invoices.length}
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        Total Revenue: ${totalRevenue.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
