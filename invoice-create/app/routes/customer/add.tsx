import { NavBar } from "~/components/ui/navBar";
import { Button } from "~/components/ui/button";
import { createCustomer } from "~/scripts/customer_scripts";
import { useNavigate } from "react-router";
import * as React from "react";

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const customerData = {
        customerName: formData.get("customerName") as string,
        customerEmail: formData.get("customerEmail") as string,
        customerPhone: formData.get("customerPhone") as string,
        customerAddress: formData.get("customerAddress") as string,
    };
    
    try {
        const newCustomer = await createCustomer(customerData);
        return { success: true, customer: newCustomer };
    } catch (error) {
        console.error('Error creating customer:', error);
        return { success: false, error: 'Failed to create customer' };
    }
}

export default function CustomerAdd() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [formData, setFormData] = React.useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: ""
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
        if (!formData.customerName.trim()) {
            alert('Please enter customer name');
            return;
        }
        if (!formData.customerEmail.trim()) {
            alert('Please enter customer email');
            return;
        }
        if (!formData.customerPhone.trim()) {
            alert('Please enter customer phone');
            return;
        }
        if (!formData.customerAddress.trim()) {
            alert('Please enter customer address');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const newCustomer = await createCustomer(formData);
            alert('Customer created successfully!');
            navigate('/customer');
        } catch (error) {
            console.error('Error creating customer:', error);
            alert('Failed to create customer. Please try again.');
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
                        <h2 className="invoice-title">Add New Customer</h2>
                        <p className="invoice-number">New</p>
                    </div>
                    
                    <div className="invoice-details">
                        <form className="form-container" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="customerName">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    id="customerName"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="customerEmail">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="customerEmail"
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="customerPhone">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    id="customerPhone"
                                    name="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="customerAddress">
                                    Address *
                                </label>
                                <textarea
                                    id="customerAddress"
                                    name="customerAddress"
                                    value={formData.customerAddress}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter customer address"
                                    rows={3}
                                    required
                                />
                            </div>
                            
                            <div className="flex gap-4 justify-end mt-8">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => navigate('/customer')}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    {isSubmitting ? "Adding Customer..." : "Add Customer"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
