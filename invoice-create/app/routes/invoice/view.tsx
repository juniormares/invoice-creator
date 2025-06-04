//view invoice route

import { useLoaderData, useActionData, useNavigate } from "react-router";
import { NavBar } from "~/components/ui/navBar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { getInvoices, deleteInvoice } from "~/scripts/invoices_scripts";
import { Link } from "react-router";
import { InvoicePDFButton } from "~/components/ui/InvoicePDF";
import * as React from "react";

export async function loader() {
    const invoices = await getInvoices();
    return { invoices };
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const action = formData.get("_action") as string;
    const invoiceId = parseInt(formData.get("invoiceId") as string);
    
    if (action === "delete") {
        try {
            await deleteInvoice(invoiceId);
            return { success: true, message: 'Invoice deleted successfully' };
        } catch (error) {
            console.error('Error deleting invoice:', error);
            return { success: false, error: 'Failed to delete invoice' };
        }
    }
    
    return { success: false, error: 'Invalid action' };
}

export default function ViewInvoice() {
    const { invoices } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();

    // Handle action results
    React.useEffect(() => {
        if (actionData?.success) {
            alert(actionData.message);
            // Refresh the page to show updated data
            navigate('/invoice', { replace: true });
        } else if (actionData?.error) {
            alert(actionData.error);
        }
    }, [actionData, navigate]);

    const handleDelete = (invoiceId: number) => {
        if (confirm(`Are you sure you want to delete invoice #${invoiceId.toString().padStart(4, '0')}? This action cannot be undone.`)) {
            const form = document.createElement('form');
            form.method = 'post';
            form.style.display = 'none';
            
            const actionInput = document.createElement('input');
            actionInput.name = '_action';
            actionInput.value = 'delete';
            form.appendChild(actionInput);
            
            const idInput = document.createElement('input');
            idInput.name = 'invoiceId';
            idInput.value = invoiceId.toString();
            form.appendChild(idInput);
            
            document.body.appendChild(form);
            form.submit();
        }
    };

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
                                            <TableHead className="text-center">Actions</TableHead>
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
                                                <TableCell className="text-center">
                                                    <div className="flex gap-1 justify-center">
                                                        <InvoicePDFButton
                                                            invoice={invoice}
                                                            buttonText="PDF"
                                                            variant="outline"
                                                            size="sm"
                                                        />
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link to={`/invoice/edit/${invoice.invoiceId}`}>
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="text-red-600 hover:text-red-800"
                                                            onClick={() => handleDelete(invoice.invoiceId)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
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
