import { NavBar } from "~/components/ui/navBar";
import { Button } from "~/components/ui/button";
import { createCustomer } from "~/scripts/customer_scripts";
import { useNavigate, useActionData, Form } from "react-router";
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
    const actionData = useActionData<typeof action>();
    const [formData, setFormData] = React.useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: ""
    });

    // Handle successful submission
    React.useEffect(() => {
        if (actionData?.success) {
            alert('Customer created successfully!');
            navigate('/customer');
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
        if (!formData.customerName.trim()) {
            e.preventDefault();
            alert('Please enter customer name');
            return;
        }
        if (!formData.customerEmail.trim()) {
            e.preventDefault();
            alert('Please enter customer email');
            return;
        }
        if (!formData.customerPhone.trim()) {
            e.preventDefault();
            alert('Please enter customer phone');
            return;
        }
        if (!formData.customerAddress.trim()) {
            e.preventDefault();
            alert('Please enter customer address');
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
                        <h2 className="invoice-title">Add New Customer</h2>
                        <p className="invoice-number">New</p>
                    </div>
                    
                    <div className="invoice-details">
                        <Form className="form-container" method="post" onSubmit={handleSubmit}>
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
                                <Button type="submit">
                                    Add Customer
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </main>
        </div>
    );
}
