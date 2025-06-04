import { NavBar } from "~/components/ui/navBar"
import { Button } from "~/components/ui/button"
import { getCustomers } from "~/scripts/customer_scripts";
import { getProducts } from "~/scripts/product_scripts";
import { createInvoice } from "~/scripts/invoices_scripts";
import { useLoaderData, useNavigate } from "react-router";
import * as React from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "~/components/ui/command"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "~/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";

export async function loader() {
    const customers = await getCustomers();
    const products = await getProducts();
    return { customers, products };
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const invoiceData = JSON.parse(formData.get("invoiceData") as string);
    
    try {
        const newInvoice = await createInvoice(invoiceData);
        return { success: true, invoice: newInvoice };
    } catch (error) {
        console.error('Error creating invoice:', error);
        return { success: false, error: 'Failed to create invoice' };
    }
}

export default function InvoiceAdd() {
    const { customers, products } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    // State for invoice items
    const [invoiceItems, setInvoiceItems] = React.useState([
        { id: 1, productId: "", productName: "", quantity: 1, rate: 0, amount: 0 }
    ]);

    // Function to add new invoice item
    const addInvoiceItem = () => {
        const newId = Math.max(...invoiceItems.map(item => item.id)) + 1;
        setInvoiceItems([...invoiceItems, { 
            id: newId, 
            productId: "", 
            productName: "", 
            quantity: 1, 
            rate: 0, 
            amount: 0 
        }]);
    };

    // Function to remove invoice item
    const removeInvoiceItem = (id: number) => {
        if (invoiceItems.length > 1) {
            setInvoiceItems(invoiceItems.filter(item => item.id !== id));
        }
    };

    // Function to update invoice item
    const updateInvoiceItem = (id: number, field: string, value: any) => {
        setInvoiceItems(invoiceItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                
                // If product is selected, auto-populate the rate
                if (field === 'productId') {
                    const selectedProduct = products.find((p: any) => p.productId.toString() === value);
                    if (selectedProduct) {
                        updatedItem.productName = selectedProduct.productName;
                        updatedItem.rate = selectedProduct.productPrice;
                        updatedItem.amount = updatedItem.quantity * selectedProduct.productPrice;
                    }
                }
                
                // If quantity changes, recalculate amount
                if (field === 'quantity') {
                    updatedItem.amount = value * updatedItem.rate;
                }
                
                // If rate changes, recalculate amount
                if (field === 'rate') {
                    updatedItem.amount = updatedItem.quantity * value;
                }
                
                return updatedItem;
            }
            return item;
        }));
    };

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!value) {
            alert('Please select a customer');
            return;
        }
        
        const validItems = invoiceItems.filter(item => item.productId && item.quantity > 0);
        if (validItems.length === 0) {
            alert('Please add at least one valid item');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Create one invoice with multiple items
            const invoiceData = {
                customerId: parseInt(value),
                items: validItems.map(item => ({
                    productId: parseInt(item.productId),
                    quantity: item.quantity,
                    unitPrice: item.rate,
                    totalPrice: item.amount
                })),
                subtotal: subtotal,
                tax: tax,
                totalPrice: total
            };
            
            const newInvoice = await createInvoice(invoiceData);
            
            alert('Invoice created successfully!');
            navigate('/invoice');
            
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create invoice. Please try again.');
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
                        <h2 className="invoice-title">New Invoice</h2>
                        <p className="invoice-number">Draft</p>
                    </div>
                    
                    <div className="invoice-details">
                        <form className="form-container" onSubmit={handleSubmit}>
                            <h3 className="invoice-section-title">Customer Information</h3>
                            <div className="form-group">
                                <label className="form-label">Select Customer</label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between form-select"
                                            type="button"
                                        >
                                            {value
                                                ? customers.find((customer: any) => customer.customerId.toString() === value)?.customerName
                                                : "Select customer..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search customer..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>No customer found.</CommandEmpty>
                                                <CommandGroup>
                                                    {customers.map((customer: any) => (
                                                        <CommandItem
                                                            key={customer.customerId}
                                                            value={customer.customerId.toString()}
                                                            onSelect={(currentValue) => {
                                                                setValue(currentValue === value ? "" : currentValue);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            {customer.customerName}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto h-4 w-4",
                                                                    value === customer.customerId.toString() ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            
                            <div className="invoice-section">
                                <h3 className="invoice-section-title">Invoice Items</h3>
                                <div className="table-container">
                                    <table className="invoice-items-table">
                                        <thead className="invoice-items-header">
                                            <tr>
                                                <th>Product</th>
                                                <th>Quantity</th>
                                                <th>Rate</th>
                                                <th>Amount</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceItems.map((item) => (
                                                <InvoiceItemRow
                                                    key={item.id}
                                                    item={item}
                                                    products={products}
                                                    onUpdate={updateInvoiceItem}
                                                    onRemove={removeInvoiceItem}
                                                    canRemove={invoiceItems.length > 1}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="mt-4">
                                    <Button variant="outline" type="button" onClick={addInvoiceItem}>
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="invoice-section">
                                <div className="invoice-total">
                                    <div className="invoice-total-row">
                                        <span className="invoice-total-label">Subtotal:</span>
                                        <span className="invoice-total-value">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-total-row">
                                        <span className="invoice-total-label">Tax (10%):</span>
                                        <span className="invoice-total-value">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-total-row invoice-total-final">
                                        <span className="invoice-total-label">Total:</span>
                                        <span className="invoice-total-value">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 justify-end mt-8">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}

// Component for individual invoice item row
function InvoiceItemRow({ 
    item, 
    products, 
    onUpdate, 
    onRemove, 
    canRemove 
}: {
    item: any;
    products: any[];
    onUpdate: (id: number, field: string, value: any) => void;
    onRemove: (id: number) => void;
    canRemove: boolean;
}) {
    const [productOpen, setProductOpen] = React.useState(false);

    return (
        <tr className="invoice-item-row">
            <td className="invoice-item-cell">
                <Popover open={productOpen} onOpenChange={setProductOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={productOpen}
                            className="w-full justify-between form-select"
                            type="button"
                        >
                            {item.productId
                                ? products.find((product: any) => product.productId.toString() === item.productId)?.productName
                                : "Select product..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search product..." className="h-9" />
                            <CommandList>
                                <CommandEmpty>No product found.</CommandEmpty>
                                <CommandGroup>
                                    {products.map((product: any) => (
                                        <CommandItem
                                            key={product.productId}
                                            value={product.productId.toString()}
                                            onSelect={(currentValue) => {
                                                onUpdate(item.id, 'productId', currentValue === item.productId ? "" : currentValue);
                                                setProductOpen(false);
                                            }}
                                        >
                                            <div className="flex flex-col">
                                                <span>{product.productName}</span>
                                                <span className="text-sm text-muted-foreground">${product.productPrice}</span>
                                            </div>
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    item.productId === product.productId.toString() ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </td>
            <td className="invoice-item-cell">
                <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="form-input text-center"
                />
            </td>
            <td className="invoice-item-cell">
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.rate}
                    onChange={(e) => onUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="form-input text-right"
                />
            </td>
            <td className="invoice-item-cell text-right">
                <span className="font-semibold">${item.amount.toFixed(2)}</span>
            </td>
            <td className="invoice-item-cell text-center">
                {canRemove && (
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-red-600 hover:text-red-800"
                    >
                        Remove
                    </Button>
                )}
            </td>
        </tr>
    );
}
