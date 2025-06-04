import { NavBar } from "~/components/ui/navBar";
import { Button } from "~/components/ui/button";
import { createProduct } from "~/scripts/product_scripts";
import { useNavigate } from "react-router";
import * as React from "react";

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const productData = {
        productName: formData.get("productName") as string,
        productDescription: formData.get("productDescription") as string,
        productPrice: parseFloat(formData.get("productPrice") as string),
    };
    
    try {
        const newProduct = await createProduct(productData);
        return { success: true, product: newProduct };
    } catch (error) {
        console.error('Error creating product:', error);
        return { success: false, error: 'Failed to create product' };
    }
}

export default function ProductAdd() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [formData, setFormData] = React.useState({
        productName: "",
        productDescription: "",
        productPrice: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.productName.trim()) {
            alert('Please enter product name');
            return;
        }
        if (!formData.productDescription.trim()) {
            alert('Please enter product description');
            return;
        }
        if (!formData.productPrice.trim() || isNaN(parseFloat(formData.productPrice))) {
            alert('Please enter a valid product price');
            return;
        }
        if (parseFloat(formData.productPrice) <= 0) {
            alert('Product price must be greater than 0');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const productData = {
                productName: formData.productName,
                productDescription: formData.productDescription,
                productPrice: parseFloat(formData.productPrice)
            };
            
            const newProduct = await createProduct(productData);
            alert('Product created successfully!');
            navigate('/product');
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="main-layout">
            <NavBar />
            <main className="main-content animate-fade-in">
                <div className="invoice-container">
                    <div className="invoice-header">
                        <h2 className="invoice-title">Add New Product</h2>
                        <p className="invoice-number">New</p>
                    </div>
                    
                    <div className="invoice-details">
                        <form className="form-container" onSubmit={handleSubmit}>
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
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    {isSubmitting ? "Adding Product..." : "Add Product"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
