import { NavBar } from "~/components/ui/navBar";
import { Button } from "~/components/ui/button";
import { getProductById, updateProduct } from "~/scripts/product_scripts";
import { useNavigate, useActionData, useLoaderData, Form } from "react-router";
import * as React from "react";

export async function loader({ params }: { params: { id: string } }) {
    const productId = parseInt(params.id);
    const product = await getProductById(productId);
    
    if (!product) {
        throw new Response("Product not found", { status: 404 });
    }
    
    return { product };
}

export async function action({ request, params }: { request: Request; params: { id: string } }) {
    const productId = parseInt(params.id);
    const formData = await request.formData();
    const productData = {
        productName: formData.get("productName") as string,
        productDescription: formData.get("productDescription") as string,
        productPrice: parseFloat(formData.get("productPrice") as string),
    };
    
    try {
        const updatedProduct = await updateProduct(productId, productData);
        return { success: true, product: updatedProduct };
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: 'Failed to update product' };
    }
}

export default function ProductEdit() {
    const { product } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const actionData = useActionData<typeof action>();
    const [formData, setFormData] = React.useState({
        productName: product.productName || "",
        productDescription: product.productDescription || "",
        productPrice: product.productPrice?.toString() || ""
    });

    // Handle successful submission
    React.useEffect(() => {
        if (actionData?.success) {
            alert('Product updated successfully!');
            navigate('/product');
        } else if (actionData?.error) {
            alert(actionData.error);
        }
    }, [actionData, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        // Basic validation
        if (!formData.productName.trim()) {
            e.preventDefault();
            alert('Please enter product name');
            return;
        }
        if (!formData.productDescription.trim()) {
            e.preventDefault();
            alert('Please enter product description');
            return;
        }
        if (!formData.productPrice.trim() || isNaN(parseFloat(formData.productPrice))) {
            e.preventDefault();
            alert('Please enter a valid product price');
            return;
        }
        if (parseFloat(formData.productPrice) <= 0) {
            e.preventDefault();
            alert('Product price must be greater than 0');
            return;
        }
        // If validation passes, form will submit to action
    };

    return (
        <div className="main-layout">
            <NavBar />
            <main className="main-content animate-fade-in">
                <div className="invoice-container">
                    <div className="invoice-header">
                        <h2 className="invoice-title">Edit Product</h2>
                        <p className="invoice-number">#{product.productId}</p>
                    </div>
                    
                    <div className="invoice-details">
                        <Form className="form-container" method="post" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="productName">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    id="productName"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="productDescription">
                                    Description *
                                </label>
                                <textarea
                                    id="productDescription"
                                    name="productDescription"
                                    value={formData.productDescription}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter product description"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="productPrice">
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    id="productPrice"
                                    name="productPrice"
                                    value={formData.productPrice}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            
                            <div className="flex gap-4 justify-end mt-8">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => navigate('/product')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Update Product
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </main>
        </div>
    );
} 