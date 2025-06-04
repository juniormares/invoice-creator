import { useLoaderData, useActionData, useNavigate } from "react-router";
import { NavBar } from "~/components/ui/navBar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { getProducts, deleteProduct } from "~/scripts/product_scripts";
import { Link } from "react-router";
import * as React from "react";

export async function loader() {
    const products = await getProducts();
    return { products };
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const action = formData.get("_action") as string;
    const productId = parseInt(formData.get("productId") as string);
    
    if (action === "delete") {
        try {
            await deleteProduct(productId);
            return { success: true, message: 'Product deleted successfully' };
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: 'Failed to delete product' };
        }
    }
    
    return { success: false, error: 'Invalid action' };
}

export default function ViewProducts() {
    const { products } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();

    // Handle action results
    React.useEffect(() => {
        if (actionData?.success) {
            alert(actionData.message);
            // Refresh the page to show updated data
            navigate('/product', { replace: true });
        } else if (actionData?.error) {
            alert(actionData.error);
        }
    }, [actionData, navigate]);

    const handleDelete = (productId: number, productName: string) => {
        if (confirm(`Are you sure you want to delete product "${productName}"? This action cannot be undone.`)) {
            const form = document.createElement('form');
            form.method = 'post';
            form.style.display = 'none';
            
            const actionInput = document.createElement('input');
            actionInput.name = '_action';
            actionInput.value = 'delete';
            form.appendChild(actionInput);
            
            const idInput = document.createElement('input');
            idInput.name = 'productId';
            idInput.value = productId.toString();
            form.appendChild(idInput);
            
            document.body.appendChild(form);
            form.submit();
        }
    };
    
    return (
        <div className="main-layout">
            <NavBar />
            <main className="main-content animate-fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">All Products</h1>
                        <p className="page-description">
                            View and manage all your products
                        </p>
                    </div>
                    <Button>
                        <Link to="/product/add">Add New Product</Link>
                    </Button>
                </div>
                
                <div className="invoice-container">
                    <div className="invoice-details">
                        {products.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">No products yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Get started by adding your first product
                                </p>
                                <Button>
                                    <Link to="/product/add">Add Product</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="table-container">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product: any) => (
                                            <TableRow key={product.productId} className="hover:bg-muted/20">
                                                <TableCell className="font-medium">
                                                    #{product.productId}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">
                                                            {product.productName}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-foreground">
                                                        {product.productDescription}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-semibold text-foreground">
                                                        ${product.productPrice.toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link to={`/product/edit/${product.productId}`}>
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="text-red-600 hover:text-red-800"
                                                            onClick={() => handleDelete(product.productId, product.productName)}
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
                        
                        {products.length > 0 && (
                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Total Products: {products.length}
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
