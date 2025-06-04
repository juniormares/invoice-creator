import { useLoaderData } from "react-router";
import { NavBar } from "~/components/ui/navBar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { getCustomers } from "~/scripts/customer_scripts";
import { Link } from "react-router";

export async function loader() {
    const customers = await getCustomers();
    return { customers };
}

export default function ViewCustomers() {
    const { customers } = useLoaderData<typeof loader>();
    
    return (
        <div className="main-layout">
            <NavBar />
            <main className="main-content animate-fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">All Customers</h1>
                        <p className="page-description">
                            View and manage all your customers
                        </p>
                    </div>
                    <Button>
                        <Link to="/customer/add">Add New Customer</Link>
                    </Button>
                </div>
                
                <div className="invoice-container">
                    <div className="invoice-details">
                        {customers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">👥</div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">No customers yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Get started by adding your first customer
                                </p>
                                <Button>
                                    <Link to="/customer/add">Add Customer</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="table-container">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customers.map((customer: any) => (
                                            <TableRow key={customer.customerId} className="hover:bg-muted/20">
                                                <TableCell className="font-medium">
                                                    #{customer.customerId}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">
                                                            {customer.customerName}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-foreground">
                                                        {customer.customerEmail}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-foreground">
                                                        {customer.customerPhone}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-foreground">
                                                        {customer.customerAddress}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <Button variant="outline" size="sm">
                                                            Edit
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
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
                        
                        {customers.length > 0 && (
                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Total Customers: {customers.length}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
